from ui import *
from lista import table_card, detail_panel, filter_bar, search_filter

P = "minhas"
BUSCA = "txtPesquisarMinhas"
FILTRO = "cbFiltroStatusMinhas"

# Mesmo carregamento do app original (antes ficava no botão do Menu)
ON_VISIBLE = """UpdateContext({varModal: false});
ClearCollect(
    colMinhasSolicitacoes,
    Filter(
        soliMateriais,
        solicitante.Email = User().Email
    )
)"""

ITEMS = f"""SortByColumns(
    Filter(
        colMinhasSolicitacoes,
        IsBlank({FILTRO}.Selected.Value) || status.Value = {FILTRO}.Selected.Value,
        {search_filter(BUSCA)}
    ),
    "Criado",
    SortOrder.Descending
)"""

filtros = filter_bar(P, BUSCA, [
    combo(FILTRO, "opcStatus", '"Todos os status"', extra={"Width": 220}),
    spacer(f"{P}FiltrosEsp"),
    label(f"{P}Contagem", f'{P}Gal.AllItemsCount & " solicitação(ões)"', 9, "corTextoSec", False,
          {"Width": 160, "Align": "Align.Right", "AutoHeight": "false", "Height": 36,
           "VerticalAlign": "VerticalAlign.Middle"}),
])

root = page(P, "minhasSolicitacoes", [
    breadcrumb(P, "Minhas solicitações"),
    page_title(P, "Minhas solicitações", "Acompanhe o andamento dos pedidos que você enviou.",
               button(f"{P}BtnNova", '"+  Nova solicitação"', "Navigate(novaSolicitacao, ScreenTransition.Fade)",
                      "primary", 170)),
    filtros,
    table_card(P, ITEMS, hide_cols=("Solic",), empty_msg="Você ainda não tem solicitações com esses filtros."),
], height="16 + 56 + 64 + 480 + 3 * 20")

YAML = screen_yaml("minhasSolicitacoes", {
    "Fill": "corFundo", "LoadingSpinnerColor": "corPrimaria", "OnVisible": ON_VISIBLE,
}, [root, *detail_panel(P)])
