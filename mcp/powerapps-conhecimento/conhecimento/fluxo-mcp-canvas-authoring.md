# Fluxo com o MCP canvas-authoring (Microsoft)

> Como usar o servidor oficial de coautoria (connect, sync, compile) quando ele estiver disponível, e o que fazer sem ele.

## Ferramentas e ordem
1. `connect(environment_id, app_id)` — ID do ambiente (`Default-<guid>`) e do app (GUID na URL do Studio: `app-id=%2Fproviders%2FMicrosoft.PowerApps%2Fapps%2F<guid>`). O app precisa estar aberto no Studio (edição).
2. `sync_canvas(pasta)` — baixa o estado atual (sobrescreve arquivos com o mesmo nome).
3. Editar os `.pa.yaml` localmente.
4. `compile_canvas(pasta)` — valida **e aplica** no Studio quando passa.
5. `get_appchecker_errors` / `get_accessibility_errors` — qualidade.
- `describe_control(nome)` / `list_controls` — propriedades oficiais (o catálogo deste MCP foi extraído daí).
- `list_data_sources` / `get_data_source_schema` — fontes já adicionadas no app (o MCP não adiciona fontes: faça no Studio).

## Observações práticas
- Se uma chamada falhar com "User canceled authentication", chame `connect` de novo com `login_hint`.
- Arquivo de tela removido da pasta → tela some do app ao compilar (cuidado ao sincronizar parcial).
- Valide com `validar_pa_yaml` **antes** do `compile_canvas`: as mensagens do compilador param no primeiro tipo de erro.
- `get_accessibility_errors` pode devolver centenas de itens (Labels estáticos): filtre por `AccessibleLabelNeeded` primeiro.

## Sem o MCP oficial (ex.: rede corporativa bloqueada)
- Gere/edite os `.pa.yaml` com o agente + este MCP (`validar_pa_yaml`).
- No Studio: tela → **Exibir código** → colar o YAML da tela; ou árvore → clique direito → **Colar** para controles.
- Ordem ao colar um app inteiro: App (Formulas/OnStart) → telas na ordem do `_EditorState`.
