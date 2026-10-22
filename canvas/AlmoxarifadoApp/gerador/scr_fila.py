from ui import *
from lista import table_card, detail_panel, filter_bar, search_filter

P = "fila"
BUSCA = "txtPesquisarFilaAtendimento"

CARREGAR = """ClearCollect(
    colFilaAtendimento,
    Filter(
        soliMateriais,
        almoxarifado.Value = varAlmoxUsuario.Value
    )
)"""

ON_VISIBLE = f"""UpdateContext({{varModal: false, locStatusFila: "Aguardando Separação"}});
{CARREGAR};
If(
    IsBlank(varAlmoxUsuario),
    Notify(
        "Seu usuário não está cadastrado como Atendente ou Supervisor nas listas. Verifique com o administrador.",
        NotificationType.Error
    )
)"""

ITEMS = f"""SortByColumns(
    Filter(
        colFilaAtendimento,
        status.Value = locStatusFila,
        {search_filter(BUSCA)}
    ),
    "Criado",
    SortOrder.Ascending
)"""

# Patch do atendente: idêntico ao app original (filaAtendimento.pa.yaml), com o usuário vindo de User()
SALVAR = f"""Patch(
    soliMateriais,// lista
    varDados,// registro atual da gallery
    {{
        status: {{Value: dropStatusModalAtendente.Selected.Value}},
        ultimaAlteracao: Now(),
        atendente: {{
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & Lower(User().Email),
            DisplayName: User().FullName,
            Email: User().Email,
            Department: "",
            JobTitle: "",
            Picture: ""
        }},
        dataAtendimento: Now(),
        comentario: txtComentarioAtendente.Text
    }}
);
{CARREGAR};
UpdateContext({{varModal: false}});
Notify("Status atualizado.", NotificationType.Success, 2000)"""

tab_btn = button(f"{P}Aba", 'ThisItem.Value & "  (" & CountRows(Filter(colFilaAtendimento, status.Value = ThisItem.Value)) & ")"',
                 "UpdateContext({locStatusFila: ThisItem.Value})", "outline", 0, 36, {
                     "X": 0, "Y": 0, "Width": "Parent.TemplateWidth - 8",
                     "Fill": "If(locStatusFila = ThisItem.Value, corPrimaria, Color.White)",
                     "Color": "If(locStatusFila = ThisItem.Value, Color.White, corTexto)",
                     "HoverFill": "If(locStatusFila = ThisItem.Value, corPrimariaHover, corFundo)",
                     "HoverColor": "If(locStatusFila = ThisItem.Value, Color.White, corPrimaria)",
                     "PressedColor": "Color.White", "PressedFill": "corPrimariaHover",
                     "BorderColor": "If(locStatusFila = ThisItem.Value, corPrimaria, corBorda)", **radius(18)})

abas = N(f"{P}Abas", "Gallery", {
    "Items": "opcStatus", "TemplateSize": 210, "TemplatePadding": 0, "ShowScrollbar": "false",
    "Height": 36, "LayoutMinHeight": 0, "LayoutMinWidth": 0, "FillPortions": 0,
    "AccessibleLabel": '"Filtrar por status"',
}, [tab_btn], "Horizontal")

atendimento = box(f"{P}Atend", [
    label(f"{P}AtendTitulo", '"Atualizar atendimento"', 11, "corTexto", True),
    label(f"{P}AtendStatusRot", '"Novo status"', 9, "corTextoSec", True),
    N("dropStatusModalAtendente", "Classic/DropDown", {
        "Items": "opcStatus", "Default": "varDados.status.Value", "Size": 10, "Font": "Font.'Segoe UI'",
        "Color": "corTexto", "Fill": "Color.White", "BorderColor": "corBorda", "BorderThickness": 1,
        "HoverFill": "corFundo", "HoverBorderColor": "corPrimaria", "ChevronBackground": "Color.White",
        "ChevronFill": "corTextoSec", "ChevronHoverBackground": "corFundo", "ChevronHoverFill": "corPrimaria",
        "SelectionFill": "corPrimariaClara", "SelectionColor": "corTexto", "PressedColor": "corTexto",
        "PressedFill": "corFundo", "Height": 36, "LayoutMinWidth": 0, "LayoutMinHeight": 0}),
    label(f"{P}AtendComentRot", '"Comentário para o solicitante"', 9, "corTextoSec", True),
    text_input("txtComentarioAtendente", '"Ex.: itens separados no balcão 2."', "varDados.comentario",
               {"Mode": "TextMode.MultiLine", "Height": 80, "PaddingTop": 8}),
    button(f"{P}BtnSalvar", '"Salvar atendimento"', SALVAR, "primary", 0, 40,
           {"AlignInContainer": "AlignInContainer.Stretch"}),
], "Vertical", 8, {"Height": 260, "LayoutAlignItems": "LayoutAlignItems.Stretch"})

restrito = card(f"{P}Restrito", [
    label(f"{P}RestritoTitulo", '"Acesso restrito"', 13, "corTexto", True),
    label(f"{P}RestritoTxt", '"Seu usuário não está cadastrado como atendente ou supervisor de um almoxarifado. '
                            'Peça a um supervisor para incluir você na tela Equipe."', 10, "corTextoSec"),
], extra={"Height": 100, "Visible": "IsBlank(varAlmoxUsuario)"})

root = page(P, "filaAtendimento", [
    breadcrumb(P, "Fila de atendimento"),
    page_title(P, "Fila de atendimento",
               '" & Coalesce(varAlmoxUsuario.Value, "Sem almoxarifado") & " · Separe os pedidos e atualize o status.'),
    restrito,
    abas,
    filter_bar(P, BUSCA, [
        spacer(f"{P}FiltrosEsp"),
        label(f"{P}Contagem", f'{P}Gal.AllItemsCount & " pedido(s) em " & Lower(locStatusFila)', 9,
              "corTextoSec", False, {"Width": 260, "Align": "Align.Right", "AutoHeight": "false", "Height": 36,
                                     "VerticalAlign": "VerticalAlign.Middle"}),
    ]),
    table_card(P, ITEMS, empty_msg="Nenhum pedido neste status. 🎉"),
], height="16 + 56 + 36 + 64 + 480 + 4 * 20 + If(IsBlank(varAlmoxUsuario), 120, 0)")

YAML = screen_yaml("filaAtendimento", {
    "Fill": "corFundo", "LoadingSpinnerColor": "corPrimaria", "OnVisible": ON_VISIBLE,
}, [root, *detail_panel(P, atendimento)])
