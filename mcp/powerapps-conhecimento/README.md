# MCP powerapps-conhecimento

Um servidor MCP de conhecimento para desenvolver apps Canvas do Power Apps com agentes (GitHub Copilot, Claude Code, Cursor).

- **Sem dependências de runtime:** basta ter Node 18+ e rodar `node dist/server.js`. Não precisa de `npm install` nem de acesso ao registry do npm.
- **Validador de `.pa.yaml`:** pega os erros que quebram apps (layout de containers, propriedades inexistentes, sintaxe YAML, nomes duplicados...).
- **Conhecimento em Markdown:** você edita os arquivos em `conhecimento/` e a mudança vale na hora, sem reiniciar o servidor.

## Ferramentas

| Tool | O que faz |
|---|---|
| `listar_topicos` / `ler_topico` / `buscar_conhecimento` | Consulta a base em `conhecimento/*.md` |
| `descrever_controle` | Propriedades válidas, padrões perigosos e dicas de 22 controles (clássicos e modernos), com a fonte de cada um |
| `validar_pa_yaml` | Validação **automática** de um arquivo, de uma pasta ou de um texto, com linha e correção |
| `regras_validacao` | Explica cada regra do validador |
| `listar_templates` / `obter_template` | Blocos YAML prontos (header, formulário, tabela, painel, modal...) com troca de prefixo |

## Instalação no VS Code (GitHub Copilot)

1. Copie a pasta (ou descompacte o `.zip`) para, por exemplo, `C:\mcp\powerapps-conhecimento`.
2. Crie `.vscode/mcp.json` no projeto com o conteúdo de `exemplos-config/mcp.json`. Outra opção é colocar no `settings.json` do usuário, em `"mcp": { "servers": ... }`.
3. No Copilot Chat, use o modo **Agent** e confira se as tools aparecem no ícone de ferramentas.
4. Opcional: copie `exemplos-config/copilot-instructions.md` para `.github/copilot-instructions.md` do repositório do app.

Para testar sem o VS Code, rode `node dist/selftest.js [pasta-do-app]`. O comando sobe o servidor, conversa com ele por JSON-RPC e confere as respostas.

## Desenvolvimento

```powershell
npm install        # só para compilar (typescript)
npm run build      # gera dist/
npm test           # teste ponta a ponta
npm run pacote     # gera powerapps-conhecimento-mcp.zip para levar
```

### Pastas

| Pasta | Conteúdo |
|---|---|
| `conhecimento/` | Tópicos em Markdown. A primeira linha `# Título` e a linha `> resumo` aparecem na listagem. |
| `data/controles.json` | Catálogo de propriedades extraído do `describe_control` oficial. O campo `fonte` diz se o controle já foi testado em projeto. |
| `templates/` | YAML gerado por `canvas/AlmoxarifadoApp/gerador/gen_templates.py`, com os mesmos blocos do app que já compilou no Studio. |

É possível apontar para pastas externas, como um OneDrive compartilhado, com as variáveis de ambiente `POWERAPPS_KNOWLEDGE_DIR`, `POWERAPPS_TEMPLATES_DIR` e `POWERAPPS_CATALOG_FILE`.

## Recomendação x validação

O `validar_pa_yaml` é a **única** tool que verifica o seu código. Ainda assim, ela não substitui compilar no Studio ou rodar `compile_canvas`, nem testar a tela. As demais tools devolvem conhecimento e recomendações, não confirmam nada sobre o app.
