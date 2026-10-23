# Guia para amanhã na Bracell

Este guia cobre duas entregas, nesta ordem:

1. **Levar o app Portal do Almoxarifado** (redesenhado) e ligá-lo às listas reais.
2. **Instalar o MCP de conhecimento** na VM, para o Copilot parar de errar em Power Apps.

> Leia de cima para baixo. Cada passo tem um ✅ para você saber que deu certo.

---

## 0. Hoje, antes de sair de casa

| # | O que fazer | Por quê |
|---|---|---|
| 1 | Pedir ao Claude **commit + push** (o MCP e o `.vscode/mcp.json` ainda não estão no GitHub) | Para ter tudo no repositório `Scsant/powerApps` |
| 2 | No Power Apps pessoal, **apagar Screen1 a Screen16** do app | São telas de exemplo; não podem ir para a Bracell |
| 3 | Em **Dados**, remover `UsuáriosdoOffice365_1`, `UsuáriosdoOffice365_2` e `Office365Outlook_1` | São conectores duplicados que entraram com as telas de exemplo |
| 4 | Exportar o app: **Aplicativos → ⋯ → Exportar pacote** e salvar o `.zip` | Para importar na Bracell |
| 5 | Copiar para o OneDrive ou pendrive: o pacote do app, `mcp/powerapps-conhecimento/powerapps-conhecimento-mcp.zip`, a pasta `canvas/AlmoxarifadoApp/src` e o arquivo `docs/almoxarifado-conexao-bracell.md` | Plano B caso a VM não acesse o GitHub |

✅ **Deu certo se** você tem 4 coisas guardadas: pacote do app, zip do MCP, pasta `src` e o doc de conexão.

---

## Parte A — Levar o app e ligar nos dados reais

### A1. Colocar o app na Bracell
Escolha **uma** opção:

- **Opção 1: importar o pacote (mais fácil).** No make.powerapps.com da Bracell: *Aplicativos → Importar aplicativo de tela →* escolha o `.zip`.
- **Opção 2: colar o código (se a importação estiver bloqueada).**
  1. Crie um app de tela em branco.
  2. Cole o YAML de cada arquivo de `canvas/AlmoxarifadoApp/src`, nesta ordem: `App` (Formulas e OnStart), `Menu`, `novaSolicitacao`, `minhasSolicitacoes`, `filaAtendimento`, `cadastroEquipe`, `Finalizada`.
  3. Para colar uma tela: clique direito na tela → **Exibir código** → colar.

✅ **Deu certo se** as 6 telas aparecem na árvore e o app abre no Início, com o cabeçalho azul.

### A2. Trocar o mock pelos dados reais (4 passos, nesta ordem)
O app foi feito com **dados de mentira que têm o mesmo formato das listas reais**. Por isso as fórmulas já estão prontas, e você só troca a fonte.

1. **Apagar o mock.** Em `App.OnStart`, apague tudo entre `// ===== MOCK INÍCIO` e `// ===== MOCK FIM =====`.
   ⚠️ Faça isto **antes** do passo 2: uma coleção com o mesmo nome de uma lista dá conflito.
2. **Adicionar as fontes.** Em *Dados → Adicionar dados*:
   - listas SharePoint: `soliMateriais`, `atendentes`, `supervisores` (o nome tem que ser exatamente esse);
   - conector **Usuários do Office 365**, que deve aparecer como `UsuáriosdoOffice365`.
3. **Trocar as opções.** Em `App.Formulas`, cada linha `opc... = Table(...)` tem a fórmula real **comentada logo acima**. Troque as 6 linhas:
   ```
   opcArea            = Choices(soliMateriais.area);
   opcUnidadeNegocios = Choices(soliMateriais.unidadeNegocios);
   opcAlmoxarifado    = Choices(soliMateriais.almoxarifado);
   opcTipoReserva     = Choices(soliMateriais.tipoReservaSap);
   opcJanelaHorario   = Choices(soliMateriais.janelaHorarioRetirada);
   opcStatus          = Choices(soliMateriais.status);
   ```
4. **Busca de pessoas.** Na tela **Equipe**, no `Items` do controle `cbSelecionarUsuario`, troque a linha `Filter(colUsuariosBusca, ...)` pela linha comentada acima dela, a que usa `SearchUserV2`.

✅ **Deu certo se** *Exibir → Verificador de aplicativo* não mostra erros de fórmula.

### A3. Testar (5 minutos)
- [ ] **Início:** os cards "Fila" e "Equipe" só aparecem para atendente e supervisor.
- [ ] **Nova solicitação:** enviar com um campo vazio mostra a mensagem certa. O envio válido grava na lista e abre a tela de confirmação.
- [ ] **Minhas solicitações:** o item novo aparece, e clicar nele abre o painel de detalhes.
- [ ] **Fila:** trocar o status e salvar grava atendente, data e comentário, e o item muda de aba.
- [ ] **Equipe:** adicionar e remover uma pessoa reflete nas listas.

**Se algo não bater:**
- Os status da Bracell têm nomes diferentes de "Aguardando Separação", "Em Separação"... → as cores dos chips ficam cinza. Ajuste os nomes no `Switch` das cores.
- Os tipos de reserva têm nomes diferentes de "Atendimento" ou "Delivery" → ajuste o `Visible` dos campos Data e Horário em Nova solicitação.
- Detalhes completos: `docs/almoxarifado-conexao-bracell.md`.

---

## Parte B — Instalar o MCP de conhecimento na VM

### O que ele é, em uma frase
É um "manual consultável" de Power Apps para o Copilot, com um **validador** que acha erros no YAML **antes** de você colar no Studio.

### B1. Instalar (só precisa de Node, que a VM já tem)
1. Descompacte `powerapps-conhecimento-mcp.zip` em `C:\mcp\powerapps-conhecimento`.
2. Abra o terminal e confira o Node:
   ```powershell
   node -v                       # precisa ser 18 ou maior
   ```
3. Teste o servidor sozinho:
   ```powershell
   cd C:\mcp\powerapps-conhecimento
   node dist\selftest.js
   ```
   ✅ **Deu certo se** a última linha for `Tudo certo.`

> Não precisa rodar `npm install`: o servidor não tem dependências.

### B2. Ligar no Copilot (VS Code)
1. Na pasta do seu projeto, crie o arquivo `.vscode\mcp.json`:
   ```json
   {
     "servers": {
       "powerapps-conhecimento": {
         "type": "stdio",
         "command": "node",
         "args": ["C:\\mcp\\powerapps-conhecimento\\dist\\server.js"]
       }
     }
   }
   ```
   Se você clonar o repositório `Scsant/powerApps`, esse arquivo já vem pronto.
2. Abra o `mcp.json` no VS Code e clique em **Start**, que aparece acima do nome do servidor.
3. No Copilot Chat, troque para o modo **Agent** e clique no ícone de 🔧 ferramentas.

✅ **Deu certo se** aparecem as 8 ferramentas do `powerapps-conhecimento`.

4. **Opcional, mas recomendado:** copie `exemplos-config\copilot-instructions.md` para `.github\copilot-instructions.md` do repositório do app. Isso faz o Copilot **sempre** consultar e validar.

### B3. Como usar no dia a dia
A regra é simples: **consultar → escrever → validar**.

| Quando | Peça ao Copilot | Ferramenta que ele usa |
|---|---|---|
| Antes de criar uma tela | "Leia as regras de ouro e o tópico de containers" | `ler_topico` |
| Não sabe se uma propriedade existe | "Quais propriedades tem o ModernCombobox?" | `descrever_controle` |
| Quer partir de algo pronto | "Me dê o template padrao-mestre-detalhe com prefixo `cad`" | `obter_template` |
| Procurar um assunto | "Como gravar coluna Pessoa no SharePoint?" | `buscar_conhecimento` |
| **Depois de gerar o YAML** | "Valide a pasta X com o MCP e corrija tudo" | `validar_pa_yaml` |

**Prompts prontos para copiar:**
- *"Usando o MCP powerapps-conhecimento, crie uma tela de cadastro com ModernTextInput e ModernCombobox, valide com validar_pa_yaml e só me entregue com 0 erros."*
- *"Valide os arquivos .pa.yaml desta pasta e explique cada erro em português."*
- *"Quais templates existem? Qual serve para uma lista com busca e detalhe?"*

### B4. O que o validador pega (os erros que mais quebram apps)
| Código | Problema | Sintoma no app |
|---|---|---|
| R-CONT-01 | Container sem `FillPortions` | Header gigante, cards achatados |
| R-CONT-02 | Largura/altura ignorada (`Stretch`) | Margens que não aparecem, elementos esticados |
| R-PROP-01 | Propriedade que não existe | "Unknown property" ao colar |
| R-YAML-01 | `: ` em fórmula de uma linha | Erro de sintaxe ao colar |
| R-NOME-01 | Nome de controle repetido | Erro ao colar a segunda tela |
| R-DADOS-01 | Conector duplicado (`_1`, `_2`) | Várias conexões iguais em Dados |
| R-FX-03 | Mesmo nome em `Set` e `UpdateContext` | Variável "muda sozinha" numa tela |

O validador **não substitui** testar no Studio. Ele só garante que o código não tem os erros conhecidos.

---

## Se der problema

| Problema | Solução |
|---|---|
| `node` não é reconhecido | O Node não está no PATH da VM. Use o caminho completo, por exemplo `"C:\Program Files\nodejs\node.exe"`, no `command` do `mcp.json` |
| As ferramentas não aparecem no Copilot | Confira se está no modo **Agent**. Veja o erro em *View → Output → MCP*. Confira o caminho do `server.js` |
| Erro "Unknown property" ao colar YAML | Rode `validar_pa_yaml` no trecho; ele mostra a propriedade e a substituta |
| Layout "explodido" (header enorme) | Faltou `FillPortions: =0` nos containers. O validador acusa R-CONT-01 |
| Quer mudar ou acrescentar conhecimento | Edite os `.md` em `C:\mcp\powerapps-conhecimento\conhecimento`. A mudança vale na hora, sem reiniciar |

---

## Mapa: onde está cada coisa (repositório `Scsant/powerApps`)

| Pasta / arquivo | O que é |
|---|---|
| `canvas/AlmoxarifadoApp/src/` | YAML do app redesenhado (as 6 telas + App) |
| `canvas/AlmoxarifadoApp/gerador/` | Scripts Python que geram o YAML (`python build.py ../src`) |
| `docs/almoxarifado-conexao-bracell.md` | Passo a passo completo da troca mock → real |
| `snapshot_teste_sync/` | App **original** da Bracell, para comparar |
| `mcp/powerapps-conhecimento/` | O MCP: `dist/` (pronto para rodar), `conhecimento/` (manuais), `templates/`, `data/controles.json` |
| `mcp/.../powerapps-conhecimento-mcp.zip` | Pacote para levar (não vai para o git; gere com `npm run pacote`) |
| `.vscode/mcp.json` | Liga o MCP no Copilot deste repositório |

## Pendências
- [ ] Commit e push do MCP (pedir ao Claude hoje).
- [ ] Conferir na Screen2: a faixa azul "Ready to create?" encosta nas bordas ou tem margem? Isso confirma a regra R-CONT-02 do validador.
- [ ] Depois de ligar nos dados reais: levar **telas reais da Bracell** para virar padrão no MCP. Elas valem mais que os exemplos da Microsoft.
