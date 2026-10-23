# App Portal do Almoxarifado (Bracell)

> Domínio do app de solicitação de retirada de materiais: listas, colunas, perfis, regras de negócio e telas.

## Listas SharePoint
**soliMateriais**
| Coluna | Tipo | Observação |
|---|---|---|
| solicitante | Pessoa | gravado com User() |
| matricula | Número | 8 dígitos |
| unidadeNegocios | Choice | |
| area | Choice | |
| almoxarifado | Choice | define a fila |
| contato | Número | > 9 dígitos |
| reservaSap | Número | |
| tipoReservaSap | Choice | "Atendimento", "Delivery", ... |
| dataRetirada | Data | oculta quando tipo = "Atendimento" |
| janelaHorarioRetirada | Choice | oculta quando tipo = "Atendimento" ou "Delivery" |
| observacao | Texto | |
| status | Choice | inicial "Aguardando Separação" |
| atendente | Pessoa | quem atualizou |
| dataAtendimento | DataHora | |
| ultimaAlteracao | DataHora | Now() em todo Patch |
| comentario | Texto | do atendente |

**atendentes** / **supervisores**: `colab` (Pessoa), `almoxarifado` (Choice).

Conector: `UsuáriosdoOffice365` (busca de colaboradores na tela Equipe).

## Perfis
- Perfil = e-mail do usuário em `atendentes` ou `supervisores` (`LookUp(atendentes, colab.Email = User().Email)`).
- Variáveis globais: `varAtendente`, `varSupervisor`, `varAlmoxUsuario` (Choice), `varPerfilUsuario`.
- Solicitante: todos. Atendente: fila do seu almoxarifado. Supervisor: fila + Equipe.

## Telas
| Tela | Função |
|---|---|
| Menu | início: banner, acesso rápido por perfil |
| novaSolicitacao | formulário 01 Solicitante / 02 Retirada / 03 Observações → Patch soliMateriais |
| minhasSolicitacoes | `Filter(soliMateriais, solicitante.Email = User().Email)` + painel de detalhes |
| filaAtendimento | `Filter(soliMateriais, almoxarifado.Value = varAlmoxUsuario.Value)`, abas por status, Patch de status/comentário/atendente |
| cadastroEquipe | Patch/Remove em atendentes e supervisores |
| Finalizada | confirmação, timer volta ao Menu |

## Regras
- Validações do envio: matrícula 8 dígitos, contato > 9 dígitos, data ≥ hoje (quando visível), horário (quando visível), demais obrigatórios.
- Status inicial "Aguardando Separação"; atendimento grava `atendente`, `dataAtendimento`, `comentario`, `ultimaAlteracao`.
- Equipe: não duplicar (mesmo e-mail + almoxarifado + perfil).

## Código-fonte de referência
Repositório `Scsant/powerApps`: `canvas/AlmoxarifadoApp/src` (YAML), `canvas/AlmoxarifadoApp/gerador` (gerador Python), `docs/almoxarifado-conexao-bracell.md` (troca mock → real), `snapshot_teste_sync` (app original).
