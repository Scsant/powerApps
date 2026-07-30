# Esquema SharePoint — Venda de Ativos

O alias usado nas fórmulas é `SolicitacoesVendaAtivos`. A conexão deve apontar para a lista existente da empresa.

## Campos de cadastro

- `Title` (`Text`): identificação ou título do ativo. Obrigatório.
- `Tipo` (`Choice`): Equipamento, Veículo, Mobiliário, Sucata, Material excedente ou Outro.
- `DataSolicitacao` (`DateTime`): preenchido com `Now()` durante o envio.
- `Solicitante` (`User`): preenchido com o usuário conectado.
- `Area` (`Text`): área solicitante.
- `Empresa` (`Choice`): valores mantidos pela própria lista.
- `UnidadePlanta` (`Text`): unidade ou planta onde está o ativo.
- `ModalidadeVenda` (`Choice`): Venda direta, Leilão, Concorrência ou Alienação para sucata.
- `Prioridade` (`Choice`): Baixa, Normal, Alta ou Urgente.
- `ValorEstimadoTotal` (`Currency`): valor estimado não negativo.
- `ClienteComprador` (`Text`): obrigatório na conclusão.
- `ParecerTecnico` (`Note`): descrição e parecer do ativo. Obrigatório.

## Controle do processo

- `Status` (`Choice`): Rascunho, Aguardando aprovação do gestor, Aguardando aprovação do meio ambiente, Em logística, Em faturamento, Aguardando conclusão, Concluída, Rejeitada ou Cancelada.
- `EtapaAtual` (`Choice`): Solicitação, Gestor, Meio Ambiente, Logística, Fiscal ou Conclusão.
- `ResponsavelAtual` (`User`): usuário autorizado a agir na etapa.

## Gestor

- `StatusAprovGestor` (`Choice`): Pendente, Aprovado, Devolvido para ajuste ou Rejeitado.
- `AprovadorGestor` (`User`)
- `DataAprovGestor` (`DateTime`)
- `ComentarioGestor` (`Note`)

## Meio ambiente

Os nomes internos abaixo devem ser preservados, mesmo que os rótulos atuais da lista façam referência a “comercial”:

- `StatusAprovMeioAmbiente` (`Choice`)
- `AprovadorMeioAmbiente` (`User`)
- `DataAprovMeioAmbiente` (`DateTime`)
- `ComentarioMeioAmbiente` (`Note`)

As opções de status são as mesmas da aprovação do gestor.

## Logística e fiscal

- `StatusLogistica` (`Choice`): Não iniciada, Em planejamento, Agendada, Concluída ou Bloqueada.
- `StatusFiscalNF` (`Choice`): Não iniciado, Aguardando OV, OV criada, NF emitida, Concluído ou Bloqueado.
- `NumeroOVSAP` (`Text`): obrigatório para concluir a etapa fiscal.
- `NumeroNF` (`Text`): obrigatório para concluir a etapa fiscal.

## Conclusão

- `ValorFinalVenda` (`Currency`): obrigatório e não negativo.
- `FormularioBaixaCoA` (`URL`): URL HTTP/HTTPS válida.
- `DataConclusao` (`DateTime`): preenchido com `Now()`.
- `ObservacoesFinais` (`Note`)

## Campos gerenciados pelo SharePoint

O PCF não envia `ID`, `ContentType`, `Modified`, `Created`, `Author`, `Editor` ou `Attachments`. O painel nativo do Canvas App gerencia anexos após o item ser salvo e possuir ID.

## Índices recomendados

Para evitar o limite prático de visualização de listas grandes, criar índices SharePoint para:

- `Status`
- `EtapaAtual`
- `ResponsavelAtual`
- `Solicitante`
- `DataSolicitacao`
- `Empresa`

As galerias devem filtrar primeiro por um desses campos indexados e nunca carregar a lista inteira no cliente.
