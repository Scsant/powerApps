"""Tabela de solicitações (galeria) + painel lateral de detalhes, compartilhados por Minhas e Fila."""
from ui import *

COLS = [  # (chave, título, largura fixa ou None = FillPortions, expressão)
    ("Id", "Nº", 56, 'Coalesce(Text(ThisItem.ID), "—")'),
    ("Criado", "Criado em", 110, 'Text(ThisItem.Criado, "dd/mm/yyyy")'),
    ("Solic", "Solicitante", None, "ThisItem.solicitante.DisplayName"),
    ("Reserva", "Reserva SAP", None, "Text(ThisItem.reservaSap)"),
    ("Almox", "Almoxarifado", None, "ThisItem.almoxarifado.Value"),
    ("Tipo", "Tipo", 100, "ThisItem.tipoReservaSap.Value"),
    ("Retirada", "Retirada", 100, 'If(IsBlank(ThisItem.dataRetirada), "—", Text(ThisItem.dataRetirada, "dd/mm/yyyy"))'),
]


def _cell(name, text, width, color="corTexto", bold=False, size=10):
    extra = {"AutoHeight": "false", "Height": 52, "VerticalAlign": "VerticalAlign.Middle", "Wrap": "false"}
    if width:
        extra["Width"] = width
    else:
        extra["FillPortions"] = 1
    return label(name, text, size, color, bold, extra)


def table_card(P, items, hide_cols=(), empty_msg="Nenhuma solicitação encontrada."):
    cols = [c for c in COLS if c[0] not in hide_cols]
    head = row(f"{P}TabCab", [
        *[_cell(f"{P}TabCab{k}", f'"{t.upper()}"', w, "corTextoSec", True, 8) for k, t, w, _ in cols],
        _cell(f"{P}TabCabStatus", '"STATUS"', 170, "corTextoSec", True, 8),
        _cell(f"{P}TabCabAcao", '""', 24),
    ], gap=12, height=40, extra={"Fill": "corFundo", **pad(0, 16), "LayoutAlignItems": "LayoutAlignItems.Center",
                                 **radius(8)})

    tpl_row = box(f"{P}GalLinha", [
        *[_cell(f"{P}Gal{k}", expr, w, "corTexto", k == "Id") for k, _, w, expr in cols],
        box(f"{P}GalStatusCel", [status_chip(f"{P}GalStatus", "ThisItem.status.Value", 160)],
            "Horizontal", 0, {"Width": 170, "Height": 52, "LayoutAlignItems": "LayoutAlignItems.Center"}),
        _cell(f"{P}GalSeta", '"›"', 24, "corTextoSec", True, 14),
    ], "Horizontal", 12, {"X": 0, "Y": 0, "Width": "Parent.TemplateWidth", "Height": 52, **pad(0, 16),
                          "LayoutAlignItems": "LayoutAlignItems.Center"})

    gallery = N(f"{P}Gal", "Gallery", {
        "Items": items, "TemplateSize": 53, "TemplatePadding": 0, "ShowScrollbar": "true",
        "FillPortions": 1, "LayoutMinHeight": 0, "LayoutMinWidth": 0, "BorderThickness": 0,
        "AccessibleLabel": '"Lista de solicitações"',
    }, [
        tpl_row,
        N(f"{P}GalDivisor", "Rectangle", {"X": 16, "Y": 52, "Width": "Parent.TemplateWidth - 32", "Height": 1,
                                         "Fill": "corBorda"}),
        button(f"{P}GalAbrir", '""', "UpdateContext({varDados: ThisItem, varModal: true})", "outline", 0, 52, {
            "X": 0, "Y": 0, "Width": "Parent.TemplateWidth", "Fill": "RGBA(0, 0, 0, 0)",
            "BorderThickness": 0, "HoverFill": "RGBA(21, 101, 168, 0.05)", "PressedFill": "RGBA(21, 101, 168, 0.1)",
            "Tooltip": '"Abrir solicitação " & ThisItem.reservaSap', **radius(0)}),
    ], "Vertical")

    empty = label(f"{P}Vazio", f'"{empty_msg}"', 10, "corTextoSec", False,
                  {"Align": "Align.Center", "Visible": f"{P}Gal.AllItemsCount = 0",
                   "AutoHeight": "false", "Height": 60, "VerticalAlign": "VerticalAlign.Middle"})

    return card(f"{P}Tabela", [head, empty, gallery], gap=4, extra={**pad(12), "Height": 480})


def _kv(P, key, title, expr, fill=1):
    return box(f"{P}Det{key}", [
        label(f"{P}Det{key}K", f'"{title}"', 8, "corTextoSec", True),
        label(f"{P}Det{key}V", f'Coalesce({expr}, "—")', 11, "corTexto"),
    ], "Vertical", 2, {"FillPortions": fill, "Height": 42})


def _kv_row(P, key, pairs):
    return row(f"{P}DetL{key}", [_kv(P, *p) for p in pairs], gap=16, height=42)


DET = "varDados"


def detail_panel(P, extra_section=None, extra_height=0):
    """Overlay + painel à direita (substitui o modal antigo). Usa varDados / varModal como o app original."""
    fecha = "UpdateContext({varModal: false})"
    overlay = N(f"{P}Overlay", "Rectangle", {
        "X": 0, "Y": 0, "Width": "Parent.Width", "Height": "Parent.Height",
        "Fill": "RGBA(15, 23, 42, 0.45)", "Visible": "varModal", "OnSelect": fecha})

    children = [
        row(f"{P}DetTopo", [
            box(f"{P}DetTopoTxt", [
                label(f"{P}DetKicker", '"SOLICITAÇÃO"', 8, "corTextoSec", True),
                label(f"{P}DetTitulo", f'"Reserva SAP " & {DET}.reservaSap', 16, "corTexto", True),
            ], "Vertical", 2, {"FillPortions": 1, "Height": 44}),
            button(f"{P}DetFechar", '"✕"', fecha, "outline", 36, 36, {"Tooltip": '"Fechar detalhes"'}),
        ], gap=8, height=44, extra={"LayoutAlignItems": "LayoutAlignItems.Center"}),
        row(f"{P}DetStatusLinha", [
            status_chip(f"{P}DetStatus", f"{DET}.status.Value", 170),
            label(f"{P}DetCriado", f'"Criada em " & Text({DET}.Criado, "dd/mm/yyyy hh:mm")', 9, "corTextoSec",
                  False, {"FillPortions": 1, "AutoHeight": "false", "Height": 24, "VerticalAlign": "VerticalAlign.Middle"}),
        ], gap=12, height=24, extra={"LayoutAlignItems": "LayoutAlignItems.Center"}),
        N(f"{P}DetSep1", "Rectangle", {"Fill": "corBorda", "Height": 1}),
        label(f"{P}DetSecSolic", '"Solicitante"', 11, "corTexto", True),
        _kv_row(P, "1", [("Nome", "Nome", f"{DET}.solicitante.DisplayName"),
                         ("Matricula", "Matrícula", f"Text({DET}.matricula)")]),
        _kv_row(P, "2", [("Unidade", "Unidade de negócios", f"{DET}.unidadeNegocios.Value"),
                         ("Area", "Área", f"{DET}.area.Value")]),
        _kv_row(P, "3", [("Contato", "Contato", f"Text({DET}.contato)"),
                         ("Email", "E-mail", f"{DET}.solicitante.Email")]),
        N(f"{P}DetSep2", "Rectangle", {"Fill": "corBorda", "Height": 1}),
        label(f"{P}DetSecRet", '"Retirada"', 11, "corTexto", True),
        _kv_row(P, "4", [("Almox", "Almoxarifado", f"{DET}.almoxarifado.Value"),
                         ("Tipo", "Tipo de reserva", f"{DET}.tipoReservaSap.Value")]),
        _kv_row(P, "5", [("Data", "Data de retirada", f'Text({DET}.dataRetirada, "dd/mm/yyyy")'),
                         ("Janela", "Janela de horário", f"{DET}.janelaHorarioRetirada.Value")]),
        _kv(P, "Obs", "Observação", f"{DET}.observacao", 0),
        N(f"{P}DetSep3", "Rectangle", {"Fill": "corBorda", "Height": 1}),
        label(f"{P}DetSecAt", '"Atendimento"', 11, "corTexto", True),
        _kv_row(P, "6", [("Atendente", "Atendente", f"{DET}.atendente.DisplayName"),
                         ("DataAt", "Data do atendimento", f'Text({DET}.dataAtendimento, "dd/mm/yyyy hh:mm")')]),
        _kv(P, "Coment", "Comentário", f"{DET}.comentario", 0),
    ]
    if extra_section is not None:
        children += [N(f"{P}DetSep4", "Rectangle", {"Fill": "corBorda", "Height": 1}), extra_section]

    panel = box(f"{P}Painel", children, "Vertical", 12, {
        "X": "Parent.Width - Self.Width", "Y": 0, "Width": "Min(460, Parent.Width)", "Height": "Parent.Height",
        "Fill": "Color.White", "Visible": "varModal", **pad(24),
        "LayoutAlignItems": "LayoutAlignItems.Stretch", "LayoutOverflowY": "LayoutOverflow.Scroll",
        "DropShadow": "DropShadow.ExtraBold",
    })
    return [overlay, panel]


def filter_bar(P, search_name, right_children):
    return card(f"{P}Filtros", [
        row(f"{P}FiltrosLinha", [
            text_input(search_name, '"Buscar por reserva, status ou data"', '""', {"Width": 320}),
            *right_children,
        ], gap=12, height=36, extra={"LayoutAlignItems": "LayoutAlignItems.Center"}),
    ], extra={**pad(14, 16), "Height": 64})


def search_filter(search_name):
    # Mesma busca do app original (status, Criado, reservaSap)
    return (f"IsBlank({search_name}.Text) ||\n"
            f"    Find(Lower({search_name}.Text), Lower(Text(status.Value)), 1) > 0 ||\n"
            f"    Find(Lower({search_name}.Text), Lower(Text(Criado)), 1) > 0 ||\n"
            f"    Find(Lower({search_name}.Text), Lower(Text(reservaSap)), 1) > 0")
