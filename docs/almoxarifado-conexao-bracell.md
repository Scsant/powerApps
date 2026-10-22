# Portal do Almoxarifado: como ligar nos dados reais da Bracell

O app foi redesenhado fora da rede da Bracell, usando **coleções mock com os mesmos nomes e o mesmo formato das listas SharePoint**. Por isso todas as fórmulas (`Filter`, `LookUp`, `Patch`, `Remove`) já são as do app real. Para trocar o mock pelos dados reais, só é preciso mexer nos 4 pontos abaixo.

- Fonte das telas: `canvas/AlmoxarifadoApp/src/*.pa.yaml`
- Gerador dos YAMLs (Python): `canvas/AlmoxarifadoApp/gerador/` (`python build.py ../src`)
- App original, para referência: `snapshot_teste_sync/`

## Levar o app para a Bracell
Escolha uma das opções:
1. **Exportar o pacote:** no Power Apps pessoal, *Aplicativos → … → Exportar pacote*. Na Bracell, *Importar aplicativo de tela*.
2. **Colar o código:** se a importação estiver bloqueada, crie um app de tela em branco na Bracell e cole o código. No Studio, *clique direito na árvore → Colar*, ou use *Exibir código* em cada tela para colar o YAML de `src/`. Faça isso nesta ordem:
   1. App (`Formulas` e `OnStart`)
   2. Menu
   3. novaSolicitacao
   4. minhasSolicitacoes
   5. filaAtendimento
   6. cadastroEquipe
   7. Finalizada

## Checklist de troca (nessa ordem)

### 1. Apagar o bloco MOCK do `App.OnStart`
Apague tudo entre `// ===== MOCK INÍCIO` e `// ===== MOCK FIM =====`. As linhas de **perfil** que vêm logo depois (`Set(varAtendenteAlmo…)` e as seguintes) ficam.

> Apague o mock **antes** de adicionar as listas. Uma coleção e uma fonte de dados com o mesmo nome entram em conflito.

### 2. Adicionar as fontes de dados
*Dados → Adicionar dados*:

| Fonte | Tipo | Nome no app (tem que ser exatamente este) |
|---|---|---|
| Lista SharePoint | soliMateriais | `soliMateriais` |
| Lista SharePoint | atendentes | `atendentes` |
| Lista SharePoint | supervisores | `supervisores` |
| Conector | Usuários do Office 365 | `UsuáriosdoOffice365` |

### 3. Trocar as opções em `App.Formulas`
Cada `opc…` tem a fórmula real comentada na linha de cima:

```
opcArea            = Choices(soliMateriais.area);
opcUnidadeNegocios = Choices(soliMateriais.unidadeNegocios);
opcAlmoxarifado    = Choices(soliMateriais.almoxarifado);
opcTipoReserva     = Choices(soliMateriais.tipoReservaSap);
opcJanelaHorario   = Choices(soliMateriais.janelaHorarioRetirada);
opcStatus          = Choices(soliMateriais.status);
```
`opcPerfil` fica como está, porque não é coluna de lista.

### 4. Busca de colaboradores (tela Equipe)
Em `cbSelecionarUsuario.Items`, troque a linha `Filter(colUsuariosBusca, …)` pela linha comentada acima dela:

```
Filter(UsuáriosdoOffice365.SearchUserV2({searchTerm: cbSelecionarUsuario.SearchText, top: 50}).value, Mail <> User().Email)
```

## Conferências rápidas depois da troca
- [ ] *Exibir → Verificador de aplicativo*: nenhum erro de fórmula.
- [ ] Início: os cards de Fila e Equipe aparecem só para atendente e supervisor.
- [ ] Nova solicitação:
  - Enviar com campo vazio mostra a mensagem certa.
  - O envio válido cria o item na lista e vai para Finalizada.
- [ ] Minhas solicitações: o item novo aparece e o painel de detalhes abre.
- [ ] Fila: mudar o status com comentário grava atendente, data e comentário, e o item muda de aba.
- [ ] Equipe: adicionar e remover um membro reflete nas listas `atendentes` e `supervisores`.

## Se algo não bater
- **Os nomes dos status na Bracell são diferentes** de "Aguardando Separação", "Em Separação", "Pronto para Retirada", "Finalizado" e "Cancelado":
  - As cores dos chips vêm do `Switch` em `STATUS_FILL` / `STATUS_COLOR` (em `gerador/ui.py`). Um status desconhecido aparece em cinza.
  - A aba padrão da fila e o status gravado no envio usam `"Aguardando Separação"`, igual ao app original.
- **Tipos de reserva:** a data some quando o tipo é "Atendimento" e o horário some com "Atendimento" ou "Delivery", mesma regra do original. Se os nomes forem outros, ajuste `MOSTRA_DATA` / `MOSTRA_HORARIO` em `gerador/scr_nova.py`, ou direto nos `Visible` da tela.
- **O nome da lista é diferente:** renomeie a fonte de dados no app para o nome da tabela acima, sem mexer nas fórmulas.

## O que mudou em relação ao app original
- O visual novo segue o protótipo: header com navegação, cards, seções numeradas e painel lateral de detalhes.
- Os cadastros de atendentes e supervisores saíram dos modais escondidos no Menu e foram para a tela **Equipe**. Ela tem busca, filtro, confirmação antes de remover e bloqueio de duplicidade.
- O carregamento das listas saiu dos botões do Menu e foi para o `OnVisible` de cada tela, com as mesmas fórmulas.
- O solicitante e o atendente agora vêm de `User()`. Antes vinham de `UsuáriosdoOffice365.MyProfile()`, mas o Claims, o nome e o e-mail gravados são os mesmos.
- **Correção:** data e horário só são exigidos quando o campo está visível. Antes, o tipo "Atendimento" não conseguia enviar.
- **Correção:** a fila sobrescrevia a variável global `varAtendente` ao trocar o status.
- A fila agora carrega todo o almoxarifado e separa por abas de status. A aba padrão é "Aguardando Separação", que é o que a fila antiga mostrava.
