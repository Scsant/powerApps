from ui import *

P = "fim"

conteudo = card(f"{P}Card", [
    box(f"{P}Check", [
        label(f"{P}CheckTxt", '"✓"', 26, "corSucesso", True,
              {"Align": "Align.Center", "AutoHeight": "false", "Height": 72, "VerticalAlign": "VerticalAlign.Middle",
               "FillPortions": 1}),
    ], "Horizontal", 0, {"Fill": "corSucessoClaro", "Width": 72, "Height": 72, **radius(36),
                         "AlignInContainer": "AlignInContainer.Center"}),
    label(f"{P}Titulo", '"Solicitação enviada!"', 20, "corTexto", True, {"Align": "Align.Center"}),
    label(f"{P}Texto",
          '"A reserva SAP " & varUltimaReserva & " foi registrada para o " & varUltimoAlmox & '
          '" e está aguardando separação."', 11, "corTextoSec", False, {"Align": "Align.Center"}),
    label(f"{P}Dica", '"Acompanhe o andamento em Minhas solicitações. Voltando ao início em instantes…"',
          9, "corTextoSec", False, {"Align": "Align.Center"}),
    row(f"{P}Botoes", [
        spacer(f"{P}BotoesEsqEsp"),
        button(f"{P}BtnMinhas", '"Minhas solicitações"', "Navigate(minhasSolicitacoes, ScreenTransition.Fade)",
               "outline", 180, 40),
        button(f"{P}BtnInicio", '"Ir para o início"', "Navigate(Menu, ScreenTransition.Fade)", "primary", 180, 40),
        spacer(f"{P}BotoesDirEsp"),
    ], gap=12, height=40),
], gap=16, extra={"Width": "Min(560, Parent.Width)", "Height": 360, "AlignInContainer": "AlignInContainer.Center",
                  "LayoutAlignItems": "LayoutAlignItems.Stretch", **pad(36, 32)})

root = page(P, "Finalizada", [
    label(f"{P}Topo", '""', 8, "corFundo", False, {"AutoHeight": "false", "Height": 40}),
    conteudo,
], height=440)

# Timer do app original: volta ao Menu sozinho (3 s -> 8 s para dar tempo de ler/clicar)
timer = N("timerMudarTelaHome", "Timer", {
    "AutoStart": "true", "Duration": 8000, "Visible": "false", "X": 0, "Y": 0,
    "OnTimerEnd": "If(App.ActiveScreen = Finalizada, Navigate(Menu, ScreenTransition.Fade))",
})

YAML = screen_yaml("Finalizada", {"Fill": "corFundo", "LoadingSpinnerColor": "corPrimaria"}, [root, timer])
