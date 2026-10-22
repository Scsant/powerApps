"""Mini emissor de .pa.yaml + blocos de UI reutilizáveis (header, card, campo...)."""


class N:
    def __init__(self, name, control, props=None, children=None, variant=None):
        self.name, self.control, self.variant = name, control, variant
        self.props = props or {}
        self.children = [c for c in (children or []) if c is not None]


def _emit_props(props, ind):
    out = []
    for k in sorted(props):
        v = str(props[k])
        if "\n" in v or ": " in v or " #" in v:
            out.append(f"{ind}{k}: |-")
            lines = ("=" + v).split("\n")
            out += [f"{ind}  {l}" if l.strip() else "" for l in lines]
        else:
            out.append(f"{ind}{k}: ={v}")
    return out


def emit_node(n, ind):
    out = [f"{ind}- {n.name}:", f"{ind}    Control: {n.control}"]
    if n.variant:
        out.append(f"{ind}    Variant: {n.variant}")
    if n.props:
        out.append(f"{ind}    Properties:")
        out += _emit_props(n.props, ind + "      ")
    if n.children:
        out.append(f"{ind}    Children:")
        for c in n.children:
            out += emit_node(c, ind + "      ")
    return out


INPUTS = ("Classic/TextInput", "Classic/ComboBox", "Classic/DropDown", "Classic/DatePicker")


def _a11y(n):
    """Acessibilidade: parada de tabulação/foco só no que é clicável; rótulo acessível nos campos."""
    if n.control in ("Label", "Rectangle"):
        if "OnSelect" in n.props:
            n.props.setdefault("TabIndex", 0)
            n.props.setdefault("FocusedBorderThickness", 2)
            n.props.setdefault("FocusedBorderColor", "corTexto")
            if n.control == "Rectangle":
                n.props.setdefault("AccessibleLabel", '"Fechar"')
        else:
            n.props.setdefault("TabIndex", -1)
            n.props.setdefault("FocusedBorderThickness", 0)
    elif n.control == "Gallery":
        n.props.setdefault("TabIndex", 0)
        n.props.setdefault("FocusedBorderThickness", 2)
        n.props.setdefault("FocusedBorderColor", "corPrimaria")
    elif n.control in INPUTS:
        n.props.setdefault("TabIndex", 0)
        hint = n.props.get("HintText") or n.props.get("InputTextPlaceholder")
        n.props.setdefault("AccessibleLabel", hint if hint and hint != '""' else f'"{n.name}"')
    for c in n.children:
        _a11y(c)


CHILD_ONLY = ("FillPortions", "AlignInContainer", "LayoutMinWidth", "LayoutMinHeight", "LayoutMaxWidth", "LayoutMaxHeight")


def _strip_child_props(n, parent_auto):
    if not parent_auto:
        for k in CHILD_ONLY:
            n.props.pop(k, None)
    auto = n.control == "GroupContainer" and n.variant == "AutoLayout"
    for c in n.children:
        _strip_child_props(c, auto)


def screen_yaml(name, props, children):
    for c in children:
        _a11y(c)
        _strip_child_props(c, False)
    out = ["Screens:", f"  {name}:", "    Properties:"]
    out += _emit_props(props, "      ")
    out.append("    Children:")
    for c in children:
        out += emit_node(c, "      ")
    return "\n".join(out) + "\n"


# ---------- primitivas ----------

def radius(r):
    return {f"Radius{s}": r for s in ("TopLeft", "TopRight", "BottomLeft", "BottomRight")}


def pad(t, r=None, b=None, l=None):
    r = t if r is None else r
    b = t if b is None else b
    l = r if l is None else l
    return {"PaddingTop": t, "PaddingRight": r, "PaddingBottom": b, "PaddingLeft": l}


def box(name, children, direction="Vertical", gap=0, extra=None):
    p = {
        "LayoutDirection": f"LayoutDirection.{direction}",
        "LayoutGap": gap,
        "DropShadow": "DropShadow.None",
        "BorderThickness": 0,
        "LayoutMinWidth": 0,
        "LayoutMinHeight": 0,
        # GroupContainer nasce com FillPortions=1 e AlignInContainer=Stretch: isso faz o container
        # ignorar Height/Width e dividir o espaço do pai. Padrão aqui = tamanho fixo, alinhamento do pai.
        "FillPortions": 0,
        "AlignInContainer": "AlignInContainer.SetByContainer",
    }
    p.update(extra or {})
    return N(name, "GroupContainer", p, children, "AutoLayout")


def card(name, children, gap=12, extra=None):
    p = {"Fill": "corCard", "BorderColor": "corBorda", "BorderThickness": 1,
         "LayoutAlignItems": "LayoutAlignItems.Stretch", **radius(10), **pad(20)}
    p.update(extra or {})
    return box(name, children, "Vertical", gap, p)


def label(name, text, size=11, color="corTexto", bold=False, extra=None):
    p = {
        "Text": text, "Size": size, "Color": color,
        "Font": "Font.'Segoe UI'",
        "FontWeight": "FontWeight.Semibold" if bold else "FontWeight.Normal",
        "AutoHeight": "true", "Wrap": "true",
        "PaddingTop": 0, "PaddingBottom": 0, "PaddingLeft": 0, "PaddingRight": 0,
        "LayoutMinWidth": 0, "LayoutMinHeight": 0,
    }
    p.update(extra or {})
    return N(name, "Label", p)


def spacer(name, extra=None):
    p = {"Text": '""', "FillPortions": 1, "LayoutMinWidth": 0, "LayoutMinHeight": 0,
         "Height": 1, "Width": 1, "AutoHeight": "false"}
    p.update(extra or {})
    return N(name, "Label", p)


def button(name, text, on_select, kind="primary", width=180, height=38, extra=None):
    if kind == "primary":
        colors = {"Fill": "corPrimaria", "Color": "Color.White", "BorderColor": "corPrimaria",
                  "HoverFill": "corPrimariaHover", "HoverColor": "Color.White",
                  "PressedFill": "corPrimariaHover", "HoverBorderColor": "corPrimariaHover"}
    elif kind == "danger":
        colors = {"Fill": "corErro", "Color": "Color.White", "BorderColor": "corErro",
                  "HoverFill": "ColorFade(corErro, -15%)", "HoverColor": "Color.White",
                  "PressedFill": "ColorFade(corErro, -25%)", "HoverBorderColor": "corErro"}
    else:
        colors = {"Fill": "Color.White", "Color": "corPrimaria", "BorderColor": "corBorda",
                  "HoverFill": "corFundo", "HoverColor": "corPrimaria",
                  "PressedFill": "corBorda", "HoverBorderColor": "corPrimaria"}
    p = {"Text": text, "OnSelect": on_select, "Size": 10, "FontWeight": "FontWeight.Semibold",
         "Font": "Font.'Segoe UI'", "BorderThickness": 1, "Height": height, "Width": width,
         "PressedColor": colors["Color"], "PressedBorderColor": colors["BorderColor"],
         "FocusedBorderThickness": 2, "FocusedBorderColor": "corTexto",
         **radius(6), **colors}
    p.update(extra or {})
    return N(name, "Classic/Button", p)


def text_input(name, hint, default='""', extra=None):
    p = {"Default": default, "HintText": hint, "Size": 10, "Font": "Font.'Segoe UI'",
         "Color": "corTexto", "Fill": "Color.White", "BorderColor": "corBorda",
         "BorderThickness": 1, "HoverBorderColor": "corPrimaria", "HoverFill": "Color.White",
         "FocusedBorderColor": "corPrimaria", "FocusedBorderThickness": 2,
         "DisabledFill": "corFundo", "DisabledColor": "corTextoSec", "DisabledBorderColor": "corBorda",
         "Height": 36, "PaddingLeft": 10, **radius(6),
         "LayoutMinWidth": 0}
    p.update(extra or {})
    return N(name, "Classic/TextInput", p)


def combo(name, items, hint, field="Value", extra=None):
    p = {"Items": items, "InputTextPlaceholder": hint, "DisplayFields": f'["{field}"]',
         "SearchFields": f'["{field}"]', "SelectMultiple": "false", "IsSearchable": "false",
         "Size": 10, "Font": "Font.'Segoe UI'", "Color": "corTexto", "Fill": "Color.White",
         "BorderColor": "corBorda", "BorderThickness": 1, "HoverBorderColor": "corPrimaria",
         "HoverFill": "Color.White", "PressedFill": "Color.White", "PressedColor": "corTexto",
         "ChevronBackground": "Color.White", "ChevronFill": "corTextoSec",
         "ChevronHoverBackground": "corFundo", "ChevronHoverFill": "corPrimaria",
         "SelectionFill": "corPrimariaClara", "SelectionColor": "corTexto",
         "Height": 36, "LayoutMinWidth": 0}
    p.update(extra or {})
    return N(name, "Classic/ComboBox", p)


def date_picker(name, extra=None):
    p = {"DefaultDate": "Blank()", "Format": '"dd/mm/yyyy"', "InputTextPlaceholder": '"dd/mm/aaaa"',
         "Size": 10, "Font": "Font.'Segoe UI'", "Color": "corTexto", "Fill": "Color.White",
         "BorderColor": "corBorda", "BorderThickness": 1, "IconBackground": "Color.White",
         "IconFill": "corTextoSec", "StartYear": "Year(Today())", "EndYear": "Year(Today()) + 1",
         "Height": 36, "LayoutMinWidth": 0}
    p.update(extra or {})
    return N(name, "Classic/DatePicker", p)


def field(prefix, title, control, visible=None):
    """Rótulo + controle empilhados; ocupa uma coluna da linha."""
    extra = {"FillPortions": 1, "Height": 62}
    if visible:
        extra["Visible"] = visible
    return box(f"{prefix}Campo", [
        label(f"{prefix}Rotulo", f'"{title}"', 10, "corTexto", True),
        control,
    ], "Vertical", 6, {**extra, "LayoutAlignItems": "LayoutAlignItems.Stretch"})


def row(name, children, gap=16, height=62, extra=None):
    p = {"Height": height, "LayoutAlignItems": "LayoutAlignItems.Start"}
    p.update(extra or {})
    return box(name, children, "Horizontal", gap, p)


def section_title(prefix, num, title):
    return row(f"{prefix}Titulo", [
        label(f"{prefix}Num", f'"{num}"', 10, "corPrimaria", True,
              {"Width": 26, "AutoHeight": "false", "Height": 24, "VerticalAlign": "VerticalAlign.Middle"}),
        label(f"{prefix}Nome", f'"{title}"', 13, "corTexto", True,
              {"FillPortions": 1, "AutoHeight": "false", "Height": 24, "VerticalAlign": "VerticalAlign.Middle"}),
    ], gap=4, height=24, extra={"LayoutAlignItems": "LayoutAlignItems.Center"})


def chip(prefix, text, fill, color, width=150, extra=None):
    """Etiqueta arredondada (container + label)."""
    p = {"Fill": fill, "Width": width, "Height": 24, **radius(12), **pad(0, 10),
         "LayoutJustifyContent": "LayoutJustifyContent.Center",
         "LayoutAlignItems": "LayoutAlignItems.Center"}
    p.update(extra or {})
    return box(f"{prefix}Chip", [
        label(f"{prefix}ChipTxt", text, 9, color, True,
              {"Align": "Align.Center", "AutoHeight": "false", "Height": 24,
               "VerticalAlign": "VerticalAlign.Middle", "FillPortions": 1}),
    ], "Horizontal", 0, p)


NAV = [
    ("Inicio", "Início", "Menu", 60, None),
    ("Minhas", "Minhas solicitações", "minhasSolicitacoes", 150, None),
    ("Fila", "Fila de atendimento", "filaAtendimento", 150, "varAtendente || varSupervisor"),
    ("Equipe", "Equipe", "cadastroEquipe", 70, "varSupervisor"),
]


def header(prefix, active):
    links = []
    for key, text, target, w, vis in NAV:
        is_active = target == active
        p = {"Width": w, "AutoHeight": "false", "Height": 64, "Align": "Align.Center",
             "VerticalAlign": "VerticalAlign.Middle",
             "OnSelect": f"Navigate({target}, ScreenTransition.Fade)",
             "HoverColor": "Color.White",
             "BorderColor": "Color.White" if is_active else "RGBA(0,0,0,0)",
             "BorderThickness": 0}
        if vis:
            p["Visible"] = vis
        links.append(label(f"{prefix}Nav{key}", f'"{text}"', 10,
                           "Color.White" if is_active else "RGBA(255, 255, 255, 0.72)",
                           is_active, p))
    return box(f"{prefix}Header", [
        label(f"{prefix}Logo", '"Bracell"', 18, "Color.White", True,
              {"Width": 90, "AutoHeight": "false", "Height": 64, "VerticalAlign": "VerticalAlign.Middle"}),
        N(f"{prefix}Divisor", "Rectangle", {"Fill": "RGBA(255, 255, 255, 0.5)", "Width": 1, "Height": 24}),
        label(f"{prefix}Portal", '"Portal do Almoxarifado"', 11, "Color.White", True,
              {"Width": 200, "AutoHeight": "false", "Height": 64, "VerticalAlign": "VerticalAlign.Middle",
               "PaddingLeft": 12}),
        spacer(f"{prefix}Spacer"),
        *links,
        box(f"{prefix}Avatar", [
            label(f"{prefix}AvatarTxt", "fxIniciais", 9, "corHeader", True,
                  {"Align": "Align.Center", "AutoHeight": "false", "Height": 32,
                   "VerticalAlign": "VerticalAlign.Middle", "FillPortions": 1}),
        ], "Horizontal", 0, {"Fill": "Color.White", "Width": 32, "Height": 32, **radius(16)}),
        label(f"{prefix}Usuario", "fxNomeCurto", 10, "Color.White", False,
              {"Width": 170, "AutoHeight": "false", "Height": 64, "VerticalAlign": "VerticalAlign.Middle"}),
    ], "Horizontal", 14, {
        "Fill": "corHeader", "Height": 64, **pad(0, 32),
        "LayoutAlignItems": "LayoutAlignItems.Center",
    })


def page(prefix, active, body_children, height, gap=20):
    """Header fixo + corpo rolável com conteúdo centralizado (máx. 1100px)."""
    content = box(f"{prefix}Conteudo", body_children, "Vertical", gap, {
        "Width": "Min(1100, Parent.Width - 64)",
        "LayoutAlignItems": "LayoutAlignItems.Stretch",
        "AlignInContainer": "AlignInContainer.Center",
        "Height": height,
    })
    body = box(f"{prefix}Corpo", [content], "Vertical", 0, {
        "Fill": "corFundo", "FillPortions": 1,
        "LayoutOverflowY": "LayoutOverflow.Scroll",
        "LayoutAlignItems": "LayoutAlignItems.Center", **pad(28, 0, 32),
    })
    return box(f"{prefix}Raiz", [header(prefix, active), body], "Vertical", 0, {
        "Width": "Parent.Width", "Height": "Parent.Height", "X": 0, "Y": 0,
        "LayoutAlignItems": "LayoutAlignItems.Stretch", "Fill": "corFundo",
    })


def breadcrumb(prefix, current):
    return row(f"{prefix}Trilha", [
        label(f"{prefix}TrilhaInicio", '"Início"', 9, "corTextoSec", False,
              {"Width": 36, "OnSelect": "Navigate(Menu, ScreenTransition.Fade)", "HoverColor": "corPrimaria"}),
        label(f"{prefix}TrilhaSep", '"/"', 9, "corTextoSec", False, {"Width": 10}),
        label(f"{prefix}TrilhaAtual", f'"{current}"', 9, "corTextoSec", False, {"Width": 250}),
    ], gap=4, height=16)


def page_title(prefix, title, subtitle, action=None):
    return row(f"{prefix}Cabecalho", [
        box(f"{prefix}CabecalhoTxt", [
            label(f"{prefix}Titulo", f'"{title}"', 20, "corTexto", True),
            label(f"{prefix}Subtitulo", f'"{subtitle}"', 10, "corTextoSec"),
        ], "Vertical", 4, {"FillPortions": 1, "Height": 56}),
        action,
    ], gap=16, height=56, extra={"LayoutAlignItems": "LayoutAlignItems.Center"})


STATUS_FILL = ('Switch({v}, "Aguardando Separação", RGBA(255, 244, 214, 1), "Em Separação", RGBA(222, 235, 255, 1), '
               '"Pronto para Retirada", RGBA(224, 245, 233, 1), "Finalizado", RGBA(233, 236, 241, 1), '
               '"Cancelado", RGBA(253, 228, 228, 1), RGBA(233, 236, 241, 1))')
STATUS_COLOR = ('Switch({v}, "Aguardando Separação", RGBA(138, 90, 0, 1), "Em Separação", RGBA(21, 82, 168, 1), '
                '"Pronto para Retirada", RGBA(22, 110, 60, 1), "Finalizado", RGBA(70, 82, 102, 1), '
                '"Cancelado", RGBA(176, 32, 32, 1), RGBA(70, 82, 102, 1))')


def status_chip(prefix, value_expr, width=150):
    return chip(prefix, value_expr, STATUS_FILL.format(v=value_expr), STATUS_COLOR.format(v=value_expr), width)
