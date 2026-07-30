# Ponte Power Fx — PCF para SharePoint

## 1. Conectores e nomes

Adicione ao Canvas App:

1. Lista SharePoint, renomeada para `SolicitacoesVendaAtivos`.
2. Conector `Office365Users`.
3. Componente de código `PowerAppsLab.VendaAtivosControl`.

Use `cmpVendaAtivos` como nome da instância do PCF.

## 2. Inicialização do aplicativo

Exemplo para `App.OnStart` em ambiente com separador pt-BR:

```powerfx
Set(varSelected; Blank());;
Set(varLastCommandId; Blank());;
Set(varOperationResult; Blank());;
Set(varMode; "create");;

Set(varEmailMeioAmbiente; "meioambiente@empresa.com");;
Set(varEmailLogistica; "logistica@empresa.com");;
Set(varEmailFiscal; "fiscal@empresa.com")
```

Os três e-mails devem ser substituídos durante a implantação pelos responsáveis reais. Não coloque credenciais ou segredos nessas variáveis.

## 3. Propriedades de entrada do PCF

### `mode`

```powerfx
varMode
```

### `recordJson`

```powerfx
If(
    IsBlank(varSelected);
    "{}";
    JSON(varSelected; JSONFormat.IgnoreBinaryData)
)
```

### `currentUserJson`

```powerfx
JSON(
    {
        displayName: User().FullName;
        email: Lower(User().Email);
        claims: "i:0#.f|membership|" & Lower(User().Email);
        department: "";
        jobTitle: "";
        picture: User().Image
    };
    JSONFormat.IgnoreBinaryData
)
```

### `choiceConfigJson`

```powerfx
JSON(
    {
        Tipo: ForAll(Choices(SolicitacoesVendaAtivos.Tipo); {Value: Value});
        Status: ForAll(Choices(SolicitacoesVendaAtivos.Status); {Value: Value});
        Empresa: ForAll(Choices(SolicitacoesVendaAtivos.Empresa); {Value: Value});
        ModalidadeVenda: ForAll(Choices(SolicitacoesVendaAtivos.ModalidadeVenda); {Value: Value});
        EtapaAtual: ForAll(Choices(SolicitacoesVendaAtivos.EtapaAtual); {Value: Value});
        Prioridade: ForAll(Choices(SolicitacoesVendaAtivos.Prioridade); {Value: Value});
        StatusAprovGestor: ForAll(Choices(SolicitacoesVendaAtivos.StatusAprovGestor); {Value: Value});
        StatusAprovMeioAmbiente: ForAll(Choices(SolicitacoesVendaAtivos.StatusAprovMeioAmbiente); {Value: Value});
        StatusLogistica: ForAll(Choices(SolicitacoesVendaAtivos.StatusLogistica); {Value: Value});
        StatusFiscalNF: ForAll(Choices(SolicitacoesVendaAtivos.StatusFiscalNF); {Value: Value})
    };
    JSONFormat.Compact
)
```

### `permissionsJson`

Crie `varAllowedActions` antes de gerar o JSON:

```powerfx
Set(
    varAllowedActions;
    If(
        IsBlank(varSelected);
        ["create"; "submit"];
        Lower(Coalesce(varSelected.ResponsavelAtual.Email; "")) <> Lower(User().Email);
        [];
        Switch(
            varSelected.EtapaAtual.Value;
            "Solicitação"; ["update"; "submit"; "cancel"];
            "Gestor"; ["approveManager"; "rejectManager"];
            "Meio Ambiente"; ["approveEnvironment"; "rejectEnvironment"];
            "Logística"; ["completeLogistics"];
            "Fiscal"; ["completeFiscal"];
            "Conclusão"; ["conclude"];
            []
        )
    )
)
```

Propriedade:

```powerfx
JSON(
    {
        actions: varAllowedActions;
        canEdit: CountRows(varAllowedActions) > 0;
        canViewAudit: true
    };
    JSONFormat.Compact
)
```

### `operationResultJson`

```powerfx
Coalesce(varOperationResult; "")
```

## 4. Conversor de usuário SharePoint

O SharePoint não aceita somente um e-mail em uma coluna Person. Use sempre este formato:

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser";
    Claims: "i:0#.f|membership|" & Lower(User().Email);
    DisplayName: User().FullName;
    Email: Lower(User().Email);
    Department: "";
    JobTitle: "";
    Picture: ""
}
```

Para o gestor:

```powerfx
Set(varManager; Office365Users.ManagerV2(User().Email));;
Set(
    varManagerSP;
    {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser";
        Claims: "i:0#.f|membership|" & Lower(varManager.mail);
        DisplayName: varManager.displayName;
        Email: Lower(varManager.mail);
        Department: Coalesce(varManager.department; "");
        JobTitle: Coalesce(varManager.jobTitle; "");
        Picture: ""
    }
)
```

Para responsáveis configurados por e-mail, consulte primeiro `Office365Users.UserProfileV2(email)` e monte o mesmo registro.

## 5. Fórmula `OnChange` do PCF

A fórmula abaixo mostra o contrato completo. Os nomes das colunas devem continuar iguais aos nomes internos documentados.

```powerfx
If(
    !IsBlank(cmpVendaAtivos.commandId) &&
    cmpVendaAtivos.commandId <> varLastCommandId;

    Set(varLastCommandId; cmpVendaAtivos.commandId);;
    Set(varPayload; ParseJSON(cmpVendaAtivos.submissionJson));;
    Set(varCommand; cmpVendaAtivos.command);;

    Set(
        varCurrentUserSP;
        {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser";
            Claims: "i:0#.f|membership|" & Lower(User().Email);
            DisplayName: User().FullName;
            Email: Lower(User().Email);
            Department: "";
            JobTitle: "";
            Picture: ""
        }
    );;

    IfError(
        With(
            {
                basePatch: {
                    Title: Text(varPayload.Title);
                    Tipo: {Value: Text(varPayload.Tipo)};
                    Area: Text(varPayload.Area);
                    Empresa: {Value: Text(varPayload.Empresa)};
                    UnidadePlanta: Text(varPayload.UnidadePlanta);
                    ModalidadeVenda: {Value: Text(varPayload.ModalidadeVenda)};
                    Prioridade: {Value: Text(varPayload.Prioridade)};
                    ValorEstimadoTotal: Value(varPayload.ValorEstimadoTotal);
                    ValorFinalVenda: If(IsBlank(Text(varPayload.ValorFinalVenda)); Blank(); Value(varPayload.ValorFinalVenda));
                    ClienteComprador: Text(varPayload.ClienteComprador);
                    ParecerTecnico: Text(varPayload.ParecerTecnico);
                    ComentarioGestor: Text(varPayload.ComentarioGestor);
                    ComentarioMeioAmbiente: Text(varPayload.ComentarioMeioAmbiente);
                    NumeroOVSAP: Text(varPayload.NumeroOVSAP);
                    NumeroNF: Text(varPayload.NumeroNF);
                    FormularioBaixaCoA: If(
                        IsBlank(Text(varPayload.FormularioBaixaCoA));
                        Blank();
                        {
                            Value: Text(varPayload.FormularioBaixaCoA);
                            Description: "Formulário de baixa CoA"
                        }
                    );
                    ObservacoesFinais: Text(varPayload.ObservacoesFinais)
                }
            };
            Set(
                varSaved;
                Switch(
                    varCommand;

                    "create";
                    Patch(
                        SolicitacoesVendaAtivos;
                        Coalesce(varSelected; Defaults(SolicitacoesVendaAtivos));
                        basePatch;
                        {
                            Status: {Value: "Rascunho"};
                            EtapaAtual: {Value: "Solicitação"};
                            Solicitante: varCurrentUserSP
                        }
                    );

                    "update";
                    Patch(SolicitacoesVendaAtivos; varSelected; basePatch);

                    "submit";
                    Patch(
                        SolicitacoesVendaAtivos;
                        Coalesce(varSelected; Defaults(SolicitacoesVendaAtivos));
                        basePatch;
                        {
                            Status: {Value: "Aguardando aprovação do gestor"};
                            EtapaAtual: {Value: "Gestor"};
                            DataSolicitacao: Now();
                            Solicitante: varCurrentUserSP;
                            StatusAprovGestor: {Value: "Pendente"};
                            ResponsavelAtual: varManagerSP
                        }
                    );

                    "approveManager";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Aguardando aprovação do meio ambiente"};
                            EtapaAtual: {Value: "Meio Ambiente"};
                            StatusAprovGestor: {Value: "Aprovado"};
                            AprovadorGestor: varCurrentUserSP;
                            DataAprovGestor: Now();
                            ComentarioGestor: Text(varPayload.ComentarioGestor);
                            ResponsavelAtual: varResponsavelMeioAmbienteSP
                        }
                    );

                    "rejectManager";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Rejeitada"};
                            StatusAprovGestor: {Value: "Rejeitado"};
                            AprovadorGestor: varCurrentUserSP;
                            DataAprovGestor: Now();
                            ComentarioGestor: Text(varPayload.ComentarioGestor);
                            ResponsavelAtual: Blank()
                        }
                    );

                    "approveEnvironment";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Em logística"};
                            EtapaAtual: {Value: "Logística"};
                            StatusAprovMeioAmbiente: {Value: "Aprovado"};
                            AprovadorMeioAmbiente: varCurrentUserSP;
                            DataAprovMeioAmbiente: Now();
                            ComentarioMeioAmbiente: Text(varPayload.ComentarioMeioAmbiente);
                            ResponsavelAtual: varResponsavelLogisticaSP
                        }
                    );

                    "rejectEnvironment";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Rejeitada"};
                            StatusAprovMeioAmbiente: {Value: "Rejeitado"};
                            AprovadorMeioAmbiente: varCurrentUserSP;
                            DataAprovMeioAmbiente: Now();
                            ComentarioMeioAmbiente: Text(varPayload.ComentarioMeioAmbiente);
                            ResponsavelAtual: Blank()
                        }
                    );

                    "completeLogistics";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Em faturamento"};
                            EtapaAtual: {Value: "Fiscal"};
                            StatusLogistica: {Value: "Concluída"};
                            ResponsavelAtual: varResponsavelFiscalSP
                        }
                    );

                    "completeFiscal";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Aguardando conclusão"};
                            EtapaAtual: {Value: "Conclusão"};
                            StatusFiscalNF: {Value: "Concluído"};
                            NumeroOVSAP: Text(varPayload.NumeroOVSAP);
                            NumeroNF: Text(varPayload.NumeroNF);
                            ResponsavelAtual: varCurrentUserSP
                        }
                    );

                    "conclude";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        basePatch;
                        {
                            Status: {Value: "Concluída"};
                            DataConclusao: Now();
                            ResponsavelAtual: Blank()
                        }
                    );

                    "cancel";
                    Patch(
                        SolicitacoesVendaAtivos;
                        varSelected;
                        {
                            Status: {Value: "Cancelada"};
                            ResponsavelAtual: Blank()
                        }
                    )
                )
            )
        );;

        Set(varSelected; varSaved);;
        Set(
            varOperationResult;
            JSON(
                {
                    commandId: varLastCommandId;
                    success: true;
                    itemId: varSaved.ID;
                    message: "Solicitação processada com sucesso."
                };
                JSONFormat.Compact
            )
        );

        Set(
            varOperationResult;
            JSON(
                {
                    commandId: varLastCommandId;
                    success: false;
                    message: FirstError.Message
                };
                JSONFormat.Compact
            )
        )
    )
)
```

Antes de permitir `submit`, inicialize `varManagerSP`. Antes das etapas seguintes, inicialize `varResponsavelMeioAmbienteSP`, `varResponsavelLogisticaSP` e `varResponsavelFiscalSP` a partir dos e-mails configurados.

## 6. Anexos

Inclua um `EditForm` chamado `frmAttachments`:

- `DataSource`: `SolicitacoesVendaAtivos`
- `Item`: `varSelected`
- Mantenha somente o DataCard `Attachments`.
- `Visible`: `!IsBlank(varSelected.ID)`

Botão do painel:

```powerfx
SubmitForm(frmAttachments)
```

Em `frmAttachments.OnSuccess`:

```powerfx
Set(varSelected; frmAttachments.LastSubmit);;
Notify("Anexos atualizados."; NotificationType.Success)
```

Esse desenho evita converter arquivos para Base64 dentro do PCF e usa o mecanismo suportado do conector SharePoint.
