from ui import *

P = "nova"

MOSTRA_DATA = 'cbTipoReserva.Selected.Value <> "Atendimento"'
MOSTRA_HORARIO = 'cbTipoReserva.Selected.Value <> "Atendimento" && cbTipoReserva.Selected.Value <> "Delivery"'

RESET = """Reset(cbArea);
Reset(cbUnidadeNegocios);
Reset(txtContato);
Reset(txtReservaSAP);
Reset(cbTipoReserva);
Reset(txtHorarioRetirada);
Reset(txtObservacao);
Reset(txtMatricula);
Reset(dataRetirada);
Reset(cbAlmoxarifado);
UpdateContext({varErroValidacao: Blank()})"""

# Validação e Patch: mesmos do app original (snapshot_teste_sync/novaSolicitacao.pa.yaml).
# Diferenças: data/horário só são exigidos quando o campo está visível (antes travava "Atendimento"),
# e o solicitante vem de User() em vez de UsuáriosdoOffice365.MyProfile().
ENVIAR = f"""// Validações: apenas o que existe na lista
UpdateContext({{
    varErroValidacao:
        If(
            IsBlank(txtMatricula.Text), "Matrícula não informada.",
            Len(txtMatricula.Text) <> 8, "Matrícula deve ter exatamente 8 dígitos.",
            IsBlank(cbArea.Selected.Value), "Área não selecionada.",
            IsBlank(cbUnidadeNegocios.Selected.Value), "Unidade de negócios não selecionada.",
            IsBlank(txtContato.Text), "Contato não informado.",
            Len(txtContato.Text) <= 9, "Contato deve ter mais de 9 dígitos.",
            IsBlank(cbAlmoxarifado.Selected.Value), "Almoxarifado não selecionado.",
            IsBlank(txtReservaSAP.Text), "Reserva SAP não informada.",
            IsBlank(cbTipoReserva.Selected.Value), "Tipo de reserva não selecionado.",
            ({MOSTRA_DATA}) && IsBlank(dataRetirada.SelectedDate), "Data de retirada não informada.",
            ({MOSTRA_DATA}) && dataRetirada.SelectedDate < Today(), "Data de retirada não pode ser anterior a hoje.",
            ({MOSTRA_HORARIO}) && IsBlank(txtHorarioRetirada.Selected.Value), "Horário de retirada não selecionado.",
            Blank()
        )
}});

If(
    IsBlank(varErroValidacao),

    Patch(
        soliMateriais,
        Defaults(soliMateriais),
        {{
            solicitante: {{
                '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
                Claims: "i:0#.f|membership|" & Lower(User().Email),
                DisplayName: User().FullName,
                Email: User().Email,
                Department: "",
                JobTitle: "",
                Picture: ""
            }},
            unidadeNegocios: {{ Value: cbUnidadeNegocios.Selected.Value }},
            area: {{ Value: cbArea.Selected.Value }},
            contato: Value(txtContato.Text),
            reservaSap: Value(txtReservaSAP.Text),
            tipoReservaSap: {{ Value: cbTipoReserva.Selected.Value }},
            dataRetirada: If({MOSTRA_DATA}, dataRetirada.SelectedDate, Blank()),
            janelaHorarioRetirada: {{ Value: If({MOSTRA_HORARIO}, txtHorarioRetirada.Selected.Value, Blank()) }},
            observacao: txtObservacao.Text,
            status: {{ Value: "Aguardando Separação" }},
            almoxarifado: {{ Value: cbAlmoxarifado.Selected.Value }},
            ultimaAlteracao: Now(),
            matricula: Value(txtMatricula.Text)
        }}
    );
    Set(varUltimaReserva, txtReservaSAP.Text);
    Set(varUltimoAlmox, cbAlmoxarifado.Selected.Value);
    {RESET.replace(chr(10), chr(10) + '    ')};
    Navigate(Finalizada, ScreenTransition.Fade),

    Notify(varErroValidacao, NotificationType.Error)
)"""

num = {"Format": "TextFormat.Number"}

sec1 = card(f"{P}Sec1", [
    section_title(f"{P}Sec1", "01", "Dados do solicitante"),
    row(f"{P}Sec1L1", [
        field(f"{P}Nome", "Solicitante", text_input(f"{P}TxtNome", '""', "User().FullName",
                                                    {"DisplayMode": "DisplayMode.Disabled", "AccessibleLabel": '"Solicitante"'})),
        field(f"{P}Email", "E-mail", text_input(f"{P}TxtEmail", '""', "User().Email",
                                                {"DisplayMode": "DisplayMode.Disabled", "AccessibleLabel": '"E-mail"'})),
        field(f"{P}Matricula", "Matrícula", text_input("txtMatricula", '"8 dígitos"', '""', {**num, "MaxLength": 8})),
    ]),
    row(f"{P}Sec1L2", [
        field(f"{P}Area", "Área", combo("cbArea", "opcArea", '"Selecione a área"')),
        field(f"{P}Unidade", "Unidade de negócios",
              combo("cbUnidadeNegocios", "opcUnidadeNegocios", '"Selecione a unidade"')),
        field(f"{P}Contato", "Contato (telefone)", text_input("txtContato", '"DDD + número"', '""', num)),
    ]),
], extra={"Height": 212})

sec2 = card(f"{P}Sec2", [
    section_title(f"{P}Sec2", "02", "Dados da retirada"),
    row(f"{P}Sec2L1", [
        field(f"{P}Almox", "Almoxarifado de retirada",
              combo("cbAlmoxarifado", "opcAlmoxarifado", '"Selecione o local"')),
        field(f"{P}Reserva", "Número da reserva SAP", text_input("txtReservaSAP", '"Informe o número"', '""', num)),
        field(f"{P}Tipo", "Tipo de reserva", combo("cbTipoReserva", "opcTipoReserva", '"Selecione o tipo"')),
    ]),
    row(f"{P}Sec2L2", [
        field(f"{P}Data", "Data de retirada", date_picker("dataRetirada", {"AccessibleLabel": '"Data de retirada"'}), MOSTRA_DATA),
        field(f"{P}Horario", "Janela de horário",
              combo("txtHorarioRetirada", "opcJanelaHorario", '"Selecione a janela"'), MOSTRA_HORARIO),
        spacer(f"{P}Sec2L2Fim"),
    ], extra={"Visible": MOSTRA_DATA}),
], extra={"Height": f"If({MOSTRA_DATA}, 212, 138)"})

sec3 = card(f"{P}Sec3", [
    section_title(f"{P}Sec3", "03", "Observações"),
    text_input("txtObservacao", '"Descreva alguma orientação importante para a retirada."', '""',
               {"Mode": "TextMode.MultiLine", "Height": 84, "PaddingTop": 8}),
], extra={"Height": 160})

erro = box(f"{P}Erro", [
    label(f"{P}ErroTxt", '"⚠  " & varErroValidacao', 10, "corErro", True,
          {"FillPortions": 1, "AutoHeight": "false", "Height": 40, "VerticalAlign": "VerticalAlign.Middle"}),
], "Horizontal", 0, {"Fill": "corErroClaro", "Height": 40, **radius(8), **pad(0, 16),
                     "Visible": "!IsBlank(varErroValidacao)"})

rodape = row(f"{P}Rodape", [
    label(f"{P}RodapeTxt", '"Confira os dados antes de enviar a solicitação."', 9, "corTextoSec", False,
          {"FillPortions": 1, "AutoHeight": "false", "Height": 40, "VerticalAlign": "VerticalAlign.Middle"}),
    button(f"{P}BtnCancelar", '"Cancelar"', RESET + ";\nNavigate(Menu, ScreenTransition.Fade)", "outline", 130, 40),
    button(f"{P}BtnEnviar", '"Enviar solicitação  →"', ENVIAR, "primary", 190, 40),
], gap=12, height=40, extra={"LayoutAlignItems": "LayoutAlignItems.Center"})

root = page(P, "novaSolicitacao", [
    breadcrumb(P, "Nova solicitação"),
    page_title(P, "Nova solicitação", "Preencha os dados para solicitar a retirada de materiais.",
               button(f"{P}BtnVoltar", '"←  Voltar"', "Navigate(Menu, ScreenTransition.Fade)", "outline", 130)),
    sec1, sec2, sec3, erro, rodape,
], height="16 + 56 + 212 + If(" + MOSTRA_DATA + ", 212, 138) + 160 + 40 + If(IsBlank(varErroValidacao), 6 * 20, 40 + 7 * 20)", gap=20)

YAML = screen_yaml("novaSolicitacao", {
    "Fill": "corFundo", "LoadingSpinnerColor": "corPrimaria",
    "OnVisible": "UpdateContext({varErroValidacao: Blank()})",
}, [root])
