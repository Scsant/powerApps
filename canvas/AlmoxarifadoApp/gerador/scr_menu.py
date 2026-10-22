from ui import *

P = "mnu"


def quick_card(key, icon, icon_fill, icon_color, title, desc, btn, visible=None):
    extra = {"FillPortions": 1, "Height": 190, "LayoutMinWidth": 220}
    if visible:
        extra["Visible"] = visible
    return card(f"{P}Card{key}", [
        box(f"{P}Card{key}Icone", [
            label(f"{P}Card{key}IconeTxt", f'"{icon}"', 13, icon_color, True,
                  {"Align": "Align.Center", "VerticalAlign": "VerticalAlign.Middle",
                   "AutoHeight": "false", "Height": 34, "FillPortions": 1}),
        ], "Horizontal", 0, {"Fill": icon_fill, "Width": 34, "Height": 34, **radius(8),
                             "AlignInContainer": "AlignInContainer.Start"}),
        label(f"{P}Card{key}Titulo", f'"{title}"', 14, "corTexto", True),
        label(f"{P}Card{key}Desc", f'"{desc}"', 9, "corTextoSec", False, {"FillPortions": 1, "AutoHeight": "false"}),
        btn,
    ], gap=10, extra=extra)


def step(n, title, desc):
    return box(f"{P}Passo{n}", [
        label(f"{P}Passo{n}Num", f'"0{n}"', 9, "corPrimaria", True),
        label(f"{P}Passo{n}Titulo", f'"{title}"', 10, "corTexto", True),
        label(f"{P}Passo{n}Desc", f'"{desc}"', 9, "corTextoSec"),
    ], "Vertical", 3, {"FillPortions": 1, "Height": 56})


banner = box(f"{P}Banner", [
    box(f"{P}BannerTxt", [
        label(f"{P}BannerKicker", '"ALMOXARIFADO • SOLICITAÇÕES"', 8, "RGBA(255, 255, 255, 0.85)", True),
        label(f"{P}BannerOla", '"Olá, " & fxPrimeiroNome & "."', 22, "Color.White", True),
        label(f"{P}BannerPergunta", '"O que você precisa fazer hoje?"', 14, "Color.White"),
        label(f"{P}BannerSub", '"Solicite a retirada de materiais e acompanhe seus pedidos em um só lugar."',
              9, "RGBA(255, 255, 255, 0.85)"),
    ], "Vertical", 6, {"FillPortions": 1, "Height": 112, "LayoutJustifyContent": "LayoutJustifyContent.Center"}),
    box(f"{P}BannerPerfil", [
        label(f"{P}BannerPerfilKicker", '"SEU ESPAÇO DE TRABALHO"', 7, "RGBA(255, 255, 255, 0.8)", True),
        label(f"{P}BannerPerfilTxt", '"Prático do início" & Char(10) & "ao acompanhamento."', 13, "Color.White", True),
        label(f"{P}BannerPerfilPapel",
              'varPerfilUsuario & If(IsBlank(varAlmoxUsuario), "", " · " & varAlmoxUsuario.Value)',
              8, "RGBA(255, 255, 255, 0.8)"),
    ], "Vertical", 6, {"Fill": "corBannerCard", "Width": 260, "Height": 104, **radius(8), **pad(14, 16),
                       "LayoutJustifyContent": "LayoutJustifyContent.Center"}),
], "Horizontal", 24, {"Fill": "corBanner", "Height": 150, **radius(12), **pad(20, 28),
                      "LayoutAlignItems": "LayoutAlignItems.Center"})

cards = box(f"{P}Cards", [
    quick_card("Nova", "+", "RGBA(232, 245, 222, 1)", "RGBA(62, 122, 30, 1)", "Nova solicitação",
               "Informe os dados da reserva e organize a retirada de materiais.",
               button(f"{P}BtnNova", '"+  Criar solicitação"',
                      "Navigate(novaSolicitacao, ScreenTransition.Fade)", "primary", 170)),
    quick_card("Minhas", "≡", "corPrimariaClara", "corPrimaria", "Minhas solicitações",
               "Consulte os pedidos enviados e acompanhe o andamento de cada solicitação.",
               button(f"{P}BtnMinhas", '"Consultar solicitações  →"',
                      "Navigate(minhasSolicitacoes, ScreenTransition.Fade)", "outline", 170)),
    quick_card("Fila", "⏱", "RGBA(255, 244, 214, 1)", "RGBA(138, 90, 0, 1)", "Fila de atendimento",
               "Separe os pedidos do seu almoxarifado e atualize o status.",
               button(f"{P}BtnFila", '"Abrir fila  →"',
                      "Navigate(filaAtendimento, ScreenTransition.Fade)", "outline", 170),
               "varAtendente || varSupervisor"),
    quick_card("Equipe", "👥", "RGBA(240, 232, 252, 1)", "RGBA(98, 60, 160, 1)", "Equipe",
               "Cadastre atendentes e supervisores de cada almoxarifado.",
               button(f"{P}BtnEquipe", '"Gerenciar equipe  →"',
                      "Navigate(cadastroEquipe, ScreenTransition.Fade)", "outline", 170),
               "varSupervisor"),
], "Horizontal", 16, {"Height": 190, "LayoutAlignItems": "LayoutAlignItems.Stretch"})

passos = card(f"{P}Passos", [
    row(f"{P}PassosLinha", [
        box(f"{P}PassosIntro", [
            label(f"{P}PassosTitulo", '"Antes de solicitar"', 11, "corTexto", True),
            label(f"{P}PassosSub", '"Separe as informações da retirada."', 9, "corTextoSec"),
        ], "Vertical", 3, {"FillPortions": 1, "Height": 56}),
        step(1, "Reserva SAP", "Tenha o número da reserva."),
        step(2, "Local de retirada", "Confira o almoxarifado."),
        step(3, "Data desejada", "Informe quando irá retirar."),
    ], gap=24, height=56),
], extra={**pad(16, 20), "Height": 88})

rodape = label(f"{P}Rodape", '"Bracell  /  Portal interno de solicitações"', 8, "corTextoSec")

root = page(P, "Menu", [
    banner,
    label(f"{P}AcessoTitulo", '"Acesso rápido"', 12, "corTexto", True),
    cards,
    passos,
    rodape,
], height=600)

YAML = screen_yaml("Menu", {"Fill": "corFundo", "LoadingSpinnerColor": "corPrimaria"}, [root])
