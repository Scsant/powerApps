from ui import *

P = "eqp"

# Mesmo carregamento do app original (ícone iListarUsuarios do Menu)
CARREGAR = """ClearCollect(
    colColabAlmoxarifado,
    AddColumns(
        ShowColumns(atendentes, colab, almoxarifado),
        Perfil, "Atendente"
    )
);
Collect(
    colColabAlmoxarifado,
    AddColumns(
        ShowColumns(supervisores, colab, almoxarifado),
        Perfil, "Supervisor"
    )
)"""

# Recalcula o perfil de quem está logado (caso tenha incluído/removido a si mesmo)
PERFIL = """Set(varAtendenteAlmo, LookUp(atendentes, colab.Email = User().Email));
Set(varSupervisorAlmo, LookUp(supervisores, colab.Email = User().Email));
Set(varAtendente, !IsBlank(varAtendenteAlmo));
Set(varSupervisor, !IsBlank(varSupervisorAlmo));
Set(varAlmoxUsuario, If(varAtendente, varAtendenteAlmo.almoxarifado, varSupervisor, varSupervisorAlmo.almoxarifado, Blank()))"""

PESSOA = """{
                '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
                Claims: "i:0#.f|membership|" & Lower(cbSelecionarUsuario.Selected.Mail),
                DisplayName: cbSelecionarUsuario.Selected.DisplayName,
                Email: cbSelecionarUsuario.Selected.Mail,
                Department: cbSelecionarUsuario.Selected.Department,
                JobTitle: cbSelecionarUsuario.Selected.JobTitle,
                Picture: ""
            }"""

# Patch: mesmo do app original (modal cModalAtribuirAtendente) + checagem de duplicidade
ADICIONAR = f"""If(
    IsBlank(dropAlmoxarifado.Selected.Value)
    || IsBlank(cbSelecionarUsuario.Selected.Mail)
    || IsBlank(dropPerfil.Selected.Value),
    Notify("Selecione o colaborador, o almoxarifado e o perfil.", NotificationType.Error),

    !IsBlank(LookUp(colColabAlmoxarifado, colab.Email = cbSelecionarUsuario.Selected.Mail && almoxarifado.Value = dropAlmoxarifado.Selected.Value && Perfil = dropPerfil.Selected.Value)),
    Notify("Esse colaborador já tem esse perfil neste almoxarifado.", NotificationType.Warning),

    // Perfil: supervisor -> lista 'supervisores'
    Lower(dropPerfil.Selected.Value) = "supervisor",
    Patch(
        supervisores,
        Defaults(supervisores),
        {{
            almoxarifado: {{ Value: dropAlmoxarifado.Selected.Value }},
            colab: {PESSOA}
        }}
    );
    Notify("Registro enviado com sucesso.", NotificationType.Success),

    // Senão: atendente -> lista 'atendentes'
    Patch(
        atendentes,
        Defaults(atendentes),
        {{
            almoxarifado: {{ Value: dropAlmoxarifado.Selected.Value }},
            colab: {PESSOA}
        }}
    );
    Notify("Registro enviado com sucesso.", NotificationType.Success)
);
Reset(dropAlmoxarifado);
Reset(cbSelecionarUsuario);
Reset(dropPerfil);
{CARREGAR};
{PERFIL}"""

# Remove: mesmo do app original (ícone de lixeira da galeria de usuários)
REMOVER = f"""If(
    locRemover.Perfil = "Atendente",
    Remove(
        atendentes,
        LookUp(
            atendentes,
            colab.Email = locRemover.colab.Email && almoxarifado.Value = locRemover.almoxarifado.Value
        )
    ),
    Remove(
        supervisores,
        LookUp(
            supervisores,
            colab.Email = locRemover.colab.Email && almoxarifado.Value = locRemover.almoxarifado.Value
        )
    )
);
UpdateContext({{locConfirmar: false}});
{CARREGAR};
{PERFIL};
Notify("Membro removido.", NotificationType.Success)"""

USUARIOS = """// NA BRACELL troque a linha abaixo por:
// Filter(UsuáriosdoOffice365.SearchUserV2({searchTerm: cbSelecionarUsuario.SearchText, top: 50}).value, Mail <> User().Email)
Filter(colUsuariosBusca, IsBlank(cbSelecionarUsuario.SearchText) || StartsWith(DisplayName, cbSelecionarUsuario.SearchText))"""

ITEMS = """Sort(
    Filter(
        colColabAlmoxarifado,
        IsBlank(txtBuscarEquipe.Text) || StartsWith(colab.DisplayName, txtBuscarEquipe.Text) || StartsWith(colab.Email, txtBuscarEquipe.Text),
        IsBlank(cbFiltroAlmoxEquipe.Selected.Value) || almoxarifado.Value = cbFiltroAlmoxEquipe.Selected.Value
    ),
    colab.DisplayName
)"""

PERFIL_FILL = 'If(ThisItem.Perfil = "Supervisor", RGBA(240, 232, 252, 1), corPrimariaClara)'
PERFIL_COR = 'If(ThisItem.Perfil = "Supervisor", RGBA(98, 60, 160, 1), corPrimaria)'

adicionar = card(f"{P}Add", [
    label(f"{P}AddTitulo", '"Adicionar membro"', 13, "corTexto", True),
    label(f"{P}AddSub", '"Dê acesso à fila de um almoxarifado."', 9, "corTextoSec"),
    field(f"{P}AddUsuario", "Colaborador", combo("cbSelecionarUsuario", USUARIOS, '"Digite o nome do colaborador..."',
                                                 "DisplayName", {"IsSearchable": "true"})),
    field(f"{P}AddAlmox", "Almoxarifado", combo("dropAlmoxarifado", "opcAlmoxarifado", '"Selecione o almoxarifado"')),
    field(f"{P}AddPerfil", "Perfil", combo("dropPerfil", "opcPerfil", '"Atendente ou supervisor"')),
    label(f"{P}AddDica", '"Atendente: separa pedidos e atualiza status. Supervisor: tudo isso + gerencia a equipe."',
          8, "corTextoSec"),
    button(f"{P}BtnAdicionar", '"+  Adicionar à equipe"', ADICIONAR, "primary", 0, 40,
           {"AlignInContainer": "AlignInContainer.Stretch"}),
], gap=12, extra={"Width": 340, "Height": 420, "FillPortions": 0})

linha = box(f"{P}GalLinha", [
    box(f"{P}GalAvatar", [
        label(f"{P}GalAvatarTxt",
              'Upper(Left(ThisItem.colab.DisplayName, 1) & Left(Last(Split(ThisItem.colab.DisplayName, " ")).Value, 1))',
              9, "corPrimaria", True, {"Align": "Align.Center", "AutoHeight": "false", "Height": 34,
                                      "VerticalAlign": "VerticalAlign.Middle", "FillPortions": 1}),
    ], "Horizontal", 0, {"Fill": "corPrimariaClara", "Width": 34, "Height": 34, **radius(17)}),
    box(f"{P}GalPessoa", [
        label(f"{P}GalNome", "ThisItem.colab.DisplayName", 10, "corTexto", True, {"Wrap": "false"}),
        label(f"{P}GalEmail", "ThisItem.colab.Email", 9, "corTextoSec", False, {"Wrap": "false"}),
    ], "Vertical", 2, {"FillPortions": 1, "Height": 40, "LayoutJustifyContent": "LayoutJustifyContent.Center"}),
    label(f"{P}GalAlmox", "ThisItem.almoxarifado.Value", 10, "corTexto", False,
          {"Width": 180, "AutoHeight": "false", "Height": 56, "VerticalAlign": "VerticalAlign.Middle"}),
    chip(f"{P}GalPerfil", "ThisItem.Perfil", PERFIL_FILL, PERFIL_COR, 100),
    button(f"{P}GalRemover", '"Remover"', "UpdateContext({locRemover: ThisItem, locConfirmar: true})", "outline",
           90, 32, {"Color": "corErro", "HoverColor": "corErro", "PressedColor": "corErro",
                    "HoverBorderColor": "corErro", "HoverFill": "corErroClaro"}),
], "Horizontal", 12, {"X": 0, "Y": 0, "Width": "Parent.TemplateWidth", "Height": 56, **pad(0, 12),
                      "LayoutAlignItems": "LayoutAlignItems.Center"})

lista = card(f"{P}Lista", [
    row(f"{P}ListaTopo", [
        box(f"{P}ListaTopoTxt", [
            label(f"{P}ListaTitulo", '"Membros da equipe"', 13, "corTexto", True),
            label(f"{P}ListaSub", f'{P}Gal.AllItemsCount & " membro(s)"', 9, "corTextoSec"),
        ], "Vertical", 2, {"FillPortions": 1, "Height": 40}),
        text_input("txtBuscarEquipe", '"Buscar por nome ou e-mail"', '""', {"Width": 220}),
        combo("cbFiltroAlmoxEquipe", "opcAlmoxarifado", '"Todos os almoxarifados"', extra={"Width": 210}),
    ], gap=12, height=40, extra={"LayoutAlignItems": "LayoutAlignItems.Center"}),
    label(f"{P}Vazio", '"Nenhum membro encontrado."', 10, "corTextoSec", False,
          {"Align": "Align.Center", "Visible": f"{P}Gal.AllItemsCount = 0", "AutoHeight": "false", "Height": 60,
           "VerticalAlign": "VerticalAlign.Middle"}),
    N(f"{P}Gal", "Gallery", {
        "Items": ITEMS, "TemplateSize": 57, "TemplatePadding": 0, "FillPortions": 1, "LayoutMinHeight": 0,
        "LayoutMinWidth": 0, "BorderThickness": 0, "AccessibleLabel": '"Membros da equipe"',
    }, [linha, N(f"{P}GalDivisor", "Rectangle", {"X": 12, "Y": 56, "Width": "Parent.TemplateWidth - 24",
                                                "Height": 1, "Fill": "corBorda"})], "Vertical"),
], gap=12, extra={"FillPortions": 1, "Height": 420})

restrito = card(f"{P}Restrito", [
    label(f"{P}RestritoTitulo", '"Acesso restrito"', 13, "corTexto", True),
    label(f"{P}RestritoTxt", '"Somente supervisores podem gerenciar a equipe do almoxarifado."', 10, "corTextoSec"),
], extra={"Height": 90, "Visible": "!varSupervisor"})

root = page(P, "cadastroEquipe", [
    breadcrumb(P, "Equipe"),
    page_title(P, "Equipe do almoxarifado", "Gerencie quem atende e quem supervisiona cada almoxarifado."),
    restrito,
    row(f"{P}Colunas", [adicionar, lista], gap=20, height=420, extra={"Visible": "varSupervisor"}),
], height="16 + 56 + 420 + 3 * 20")

fechar = "UpdateContext({locConfirmar: false})"
confirmacao = [
    N(f"{P}ConfOverlay", "Rectangle", {"X": 0, "Y": 0, "Width": "Parent.Width", "Height": "Parent.Height",
                                       "Fill": "RGBA(15, 23, 42, 0.45)", "Visible": "locConfirmar",
                                       "OnSelect": fechar}),
    card(f"{P}Conf", [
        label(f"{P}ConfTitulo", '"Remover membro?"', 14, "corTexto", True),
        label(f"{P}ConfTxt", 'locRemover.colab.DisplayName & " deixará de ser " & Lower(locRemover.Perfil) & '
                             '" do " & locRemover.almoxarifado.Value & "."', 10, "corTextoSec"),
        row(f"{P}ConfBotoes", [
            spacer(f"{P}ConfEsp"),
            button(f"{P}ConfCancelar", '"Cancelar"', fechar, "outline", 110),
            button(f"{P}ConfRemover", '"Remover"', REMOVER, "danger", 110),
        ], gap=10, height=38),
    ], gap=14, extra={"Visible": "locConfirmar", "Width": 420, "Height": 170,
                      "X": "(Parent.Width - Self.Width) / 2", "Y": "(Parent.Height - Self.Height) / 2",
                      "DropShadow": "DropShadow.ExtraBold"}),
]

YAML = screen_yaml("cadastroEquipe", {
    "Fill": "corFundo", "LoadingSpinnerColor": "corPrimaria",
    "OnVisible": "UpdateContext({locConfirmar: false});\n" + CARREGAR,
}, [root, *confirmacao])
