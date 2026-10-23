"""Gera os templates do MCP powerapps-conhecimento a partir dos mesmos blocos do app.
Uso: python gen_templates.py <pasta-templates>"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from ui import (N, box, button, card, chip, combo, date_picker, emit_node, field, header, label, page, radius,
                row, screen_yaml, section_title, spacer, status_chip, text_input, _a11y, _strip_child_props)
from lista import table_card, detail_panel

dest = pathlib.Path(sys.argv[1])
dest.mkdir(parents=True, exist_ok=True)


def snippet(desc, nodes, inside_auto=True):
    out = [f"# {desc}", "# Cole dentro de Children:. Troque o prefixo 'tpl' (obter_template com prefixo) — nomes são globais no app.",
           "# Requer os tokens de cor (obter_template('tokens-app-formulas'))."]
    for n in nodes:
        _a11y(n)
        _strip_child_props(n, inside_auto)
        out += emit_node(n, "")
    return "\n".join(out) + "\n"


def write(name, text):
    (dest / f"{name}.yaml").write_text(text, encoding="utf-8")
    print("template:", name)


write("header", snippet(
    "Header azul com logo, título, links de navegação (ativo destacado), avatar com iniciais e nome. Filho de container vertical.",
    [header("tpl", "Menu")]))

write("secao-formulario", snippet(
    "Card de seção numerada com 2 linhas de 3 campos (texto, combo de Choice, data). Filho de container vertical com LayoutAlignItems Stretch.",
    [card("tplSec", [
        section_title("tplSec", "01", "Dados da retirada"),
        row("tplSecL1", [
            field("tplNome", "Nome", text_input("tplTxtNome", '"Informe o nome"')),
            field("tplArea", "Área", combo("tplCbArea", "opcArea", '"Selecione a área"')),
            field("tplData", "Data", date_picker("tplDtData", {"AccessibleLabel": '"Data"'})),
        ]),
        row("tplSecL2", [
            field("tplNum", "Número", text_input("tplTxtNum", '"Somente números"', '""', {"Format": "TextFormat.Number"})),
            field("tplObs", "Observação", text_input("tplTxtObs", '"Opcional"')),
            spacer("tplSecL2Fim"),
        ]),
    ], extra={"Height": 212})]))

write("card-acesso-rapido", snippet(
    "Linha com 2 cards de acesso rápido (ícone, título, descrição, botão). Filho de container vertical.",
    [box("tplCards", [
        card(f"tplCard{k}", [
            box(f"tplCard{k}Icone", [
                label(f"tplCard{k}IconeTxt", f'"{ic}"', 13, "corPrimaria", True,
                      {"Align": "Align.Center", "VerticalAlign": "VerticalAlign.Middle", "AutoHeight": "false",
                       "Height": 34, "FillPortions": 1}),
            ], "Horizontal", 0, {"Fill": "corPrimariaClara", "Width": 34, "Height": 34, **radius(8),
                                 "AlignInContainer": "AlignInContainer.Start"}),
            label(f"tplCard{k}Titulo", f'"{t}"', 14, "corTexto", True),
            label(f"tplCard{k}Desc", f'"{d}"', 9, "corTextoSec", False, {"FillPortions": 1, "AutoHeight": "false"}),
            button(f"tplCard{k}Btn", f'"{b}"', "Navigate(Menu, ScreenTransition.Fade)", kind, 170),
        ], gap=10, extra={"FillPortions": 1, "Height": 190})
        for k, ic, t, d, b, kind in [
            ("A", "+", "Nova solicitação", "Descrição curta da ação.", "+  Criar", "primary"),
            ("B", "≡", "Minhas solicitações", "Descrição curta da ação.", "Consultar  →", "outline"),
        ]
    ], "Horizontal", 16, {"Height": 190, "LayoutAlignItems": "LayoutAlignItems.Stretch"})]))

write("botoes", snippet(
    "Botões primário, outline e perigo (Classic/Button) numa linha alinhada à direita. Filho de container vertical.",
    [row("tplBotoes", [
        spacer("tplBotoesEsp"),
        button("tplBtnCancelar", '"Cancelar"', "Back()", "outline", 130, 40),
        button("tplBtnExcluir", '"Excluir"', "Notify(\"excluir\")", "danger", 130, 40),
        button("tplBtnSalvar", '"Salvar  →"', "Notify(\"salvar\")", "primary", 170, 40),
    ], gap=12, height=40, extra={"LayoutAlignItems": "LayoutAlignItems.Center"})]))

write("chip-status", snippet(
    "Chip arredondado com cor por status (GroupContainer + Label). Troque ThisItem.status.Value pela sua expressão.",
    [status_chip("tplStatus", "ThisItem.status.Value", 160)]))

write("faixa-erro", snippet(
    "Faixa de erro de formulário (visível quando locErro não está vazio).",
    [box("tplErro", [
        label("tplErroTxt", '"⚠  " & locErro', 10, "corErro", True,
              {"FillPortions": 1, "AutoHeight": "false", "Height": 40, "VerticalAlign": "VerticalAlign.Middle"}),
    ], "Horizontal", 0, {"Fill": "corErroClaro", "Height": 40, **radius(8), "PaddingLeft": 16, "PaddingRight": 16,
                         "Visible": "!IsBlank(locErro)"})]))

write("tabela-galeria", snippet(
    "Card de tabela: cabeçalho de colunas, estado vazio e galeria com linhas clicáveis (abre painel com varDados/varModal). Items = colItens.",
    [table_card("tpl", "colItens")]))

write("painel-detalhes", snippet(
    "Overlay + painel lateral direito de detalhes (usa varDados/varModal). Cole na TELA, depois do container raiz (não dentro de AutoLayout).",
    detail_panel("tpl"), inside_auto=False))

fechar = "UpdateContext({locConfirmar: false})"
write("modal-confirmacao", snippet(
    "Overlay + modal central de confirmação destrutiva (locConfirmar). Cole na TELA, depois do container raiz.",
    [N("tplConfOverlay", "Rectangle", {"X": 0, "Y": 0, "Width": "Parent.Width", "Height": "Parent.Height",
                                       "Fill": "RGBA(15, 23, 42, 0.45)", "Visible": "locConfirmar", "OnSelect": fechar}),
     card("tplConf", [
         label("tplConfTitulo", '"Remover item?"', 14, "corTexto", True),
         label("tplConfTxt", '"Esta ação não pode ser desfeita."', 10, "corTextoSec"),
         row("tplConfBotoes", [
             spacer("tplConfEsp"),
             button("tplConfCancelar", '"Cancelar"', fechar, "outline", 110),
             button("tplConfOk", '"Remover"', fechar, "danger", 110),
         ], gap=10, height=38),
     ], gap=14, extra={"Visible": "locConfirmar", "Width": 420, "Height": 170,
                       "X": "(Parent.Width - Self.Width) / 2", "Y": "(Parent.Height - Self.Height) / 2",
                       "DropShadow": "DropShadow.ExtraBold"})], inside_auto=False))

write("pagina-base", "# Tela completa: header + corpo rolável + conteúdo centralizado com título e um card. Salve como <tela>.pa.yaml.\n"
      + screen_yaml("tplTela", {"Fill": "corFundo"}, [page("tpl", "tplTela", [
          label("tplTitulo", '"Título da página"', 20, "corTexto", True),
          card("tplCard", [label("tplCardTxt", '"Conteúdo"', 10, "corTextoSec")], extra={"Height": 200}),
      ], height=280)]))

app = (pathlib.Path(__file__).parent / "App.pa.yaml").read_text(encoding="utf-8")
tokens = app.split("// ---------- Usuário")[0].rstrip()
write("tokens-app-formulas", "# App.Formulas com os tokens de cor do design system (cole em App > Formulas).\n" + tokens + "\n")
