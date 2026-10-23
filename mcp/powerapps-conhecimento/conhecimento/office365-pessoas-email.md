# Office 365: pessoas, e-mail e reunião

> Seletor de pessoas (SearchUserV2 + coleção), envio de e-mail, agendamento de reunião, estados de carregamento e vazio, e a armadilha dos conectores duplicados. Extraído dos modelos de tela do Studio.

**Status:** validado em projeto. Os modelos de tela Email, Pessoas, Reunião, Lista, Sucesso e Tutorial (Screen10–16) compilam no app.
**Limitação:** esses modelos usam layout manual (X/Y) e o `SearchUser` antigo. Aproveite a **lógica**. Para o layout, use os padrões AutoLayout (`padroes-responsivos-modernos`).

## Armadilha: inserir modelo duplica conectores
Cada modelo inserido pelo Studio adiciona **outra conexão** do mesmo conector: `'UsuáriosdoOffice365'`, `'UsuáriosdoOffice365_1'`, `'UsuáriosdoOffice365_2'`, `Office365Outlook_1`...
- **Sintoma:** várias fontes iguais em Dados e fórmulas apontando para nomes diferentes.
- **Correção:** troque as referências pelo nome original (`'UsuáriosdoOffice365'`) e remova as fontes duplicadas em Dados.
- O `validar_pa_yaml` acusa isso como **R-DADOS-01**.
- O nome do conector depende do idioma do Studio: `UsuáriosdoOffice365` em pt-BR, `Office365Users` em inglês. Use o mesmo nome nos dois ambientes.

## Seletor de pessoas (busca + coleção sem repetidos)
```
// Galeria de resultados: só consulta quando há texto
Items: =If(!IsBlank(Trim(txtBusca.Text)),
          'UsuáriosdoOffice365'.SearchUserV2({searchTerm: Trim(txtBusca.Text), top: 15}).value)
Visible: =!IsBlank(Trim(txtBusca.Text))

// Ao clicar numa pessoa: adiciona sem repetir e limpa a busca
OnSelect: =Concurrent(
    Reset(txtBusca),
    If(Not(ThisItem.UserPrincipalName in colPessoas.UserPrincipalName), Collect(colPessoas, ThisItem))
)

// Remover da seleção
OnSelect: =Remove(colPessoas, LookUp(colPessoas, UserPrincipalName = ThisItem.UserPrincipalName))
```
- O modelo usa `SearchUser(...)`, a versão antiga, que devolve a tabela direto. Use **`SearchUserV2(...).value`**. O validador acusa o antigo como R-FX-04.
- E-mail digitado de fora da organização: mostre o botão "+" só se o e-mail for válido e ainda não estiver na lista.
  `Visible: =IsMatch(txtBusca.Text, Match.Email) && Not(Trim(txtBusca.Text) in colPessoas.UserPrincipalName)`
- Escolha de uma pessoa só, com ComboBox: `Items` com `SearchUserV2` usando `cb.SearchText`. Para gravar numa coluna Pessoa, veja `sharepoint-dados`.

## Enviar e-mail (Office365Outlook)
```
// Botão só habilita com assunto e destinatários
DisplayMode: =If(Len(Trim(txtAssunto.Text)) > 0 && !IsEmpty(colPessoas), DisplayMode.Edit, DisplayMode.Disabled)

OnSelect: =Office365Outlook.SendEmailV2(
    Concat(colPessoas, Mail & ";"),
    txtAssunto.Text,
    txtMensagem.Text,
    {Importance: "Normal"}
);
Reset(txtAssunto); Reset(txtMensagem); Clear(colPessoas);
Navigate(telaSucesso, ScreenTransition.Fade)
```
- O modelo usa `SendEmail`, a versão antiga. Prefira `SendEmailV2`, que aceita corpo em HTML.

## Reunião: horários livres e salas (resumo)
- **Horários livres:** `Office365Outlook.FindMeetingTimesV2(...)` com participantes, duração e janela de data. O resultado vai para a coleção `MeetingTimes`.
- **Salas:** `Office365Outlook.GetRoomLists().value`, depois `GetRoomsV2` e a disponibilidade de cada sala.
- **Criar a reunião:** `Office365Outlook.V2CalendarPostItem(calendario, assunto, inicio, fim, {RequiredAttendees: Concat(colPessoas, Mail & ";"), Location: sala})`.
  - O calendário vem de `LookUp(Office365Outlook.CalendarGetTables().value, DisplayName = "Calendar").Name`. O nome muda com o idioma da caixa de correio, por exemplo "Calendário".
- Os horários vêm em UTC. Para exibir no fuso local: `DateAdd(DateTimeValue(ThisItem.StartTime), -TimeZoneOffset(), TimeUnit.Minutes)`.

## Estados de carregamento e vazio (padrão dos modelos)
- Uma variável por carga: `UpdateContext({locCarregando: true}); ClearCollect(...); UpdateContext({locCarregando: false})`.
- Um ícone e um label de estado, visíveis quando não há o que mostrar:
```
Text: =If(locCarregando, "Procurando...",
          IsEmpty(colPessoas), "Selecione participantes para ver os horários",
          CountRows(colHorarios) = 0, "Não há horários disponíveis nesta data")
Visible: =locCarregando || IsEmpty(colPessoas) || CountRows(colHorarios) = 0
```

## Linha de galeria clicável inteira
Nos modelos clássicos, cada controle da linha tem `OnSelect: =Select(Parent)`, então o clique em qualquer parte dispara o `OnSelect` da galeria. No app do almoxarifado usei outra solução: um botão transparente cobrindo a linha inteira.

## Tutorial em etapas (onboarding)
- `Gallery` horizontal de bolinhas, com `Items` em `Table({Step: 0, Text: "...", Image: ...}, ...)`.
- Clicar numa bolinha: `Set(_etapa, ThisItem.Step)`.
- Avançar: `Min(_etapa + 1, Last(gal.AllItems).Step)`. Voltar: `Max(_etapa - 1, First(gal.AllItems).Step)`.
- Texto da etapa: `LookUp(gal.AllItems, Step = _etapa).Text`.

## Tela de sucesso
Ícone grande (`Classic/Icon` Check) dentro de um `Circle`, mensagem e navegação automática ou por botão. No app do almoxarifado é a tela `Finalizada`, que volta sozinha com um timer.

## Clique duplo no envio
- `Classic/Button.AutoDisableOnSelect` já vem `true`: o botão fica desabilitado enquanto o `OnSelect` roda.
- Em Patch ou SendEmail demorados, controle também com uma variável: `UpdateContext({locEnviando: true}); ...; UpdateContext({locEnviando: false})` e `DisplayMode: =If(locEnviando, DisplayMode.Disabled, DisplayMode.Edit)`.
