# Instruções para o GitHub Copilot (Power Apps Canvas)

Copie para `.github/copilot-instructions.md` do repositório do app.

- Antes de criar ou editar `.pa.yaml`, use o MCP `powerapps-conhecimento`:
  `ler_topico("00-regras-de-ouro")`, `descrever_controle(...)` para cada controle e `obter_template(...)` quando houver.
- Depois de editar, rode `validar_pa_yaml` na pasta do app e corrija erros e avisos antes de dizer que terminou.
- Nunca invente propriedades: se não estiver em `descrever_controle`, não use.
- Containers filhos de AutoLayout: sempre `FillPortions` e, se tiverem tamanho próprio, `AlignInContainer`.
- Diga o que foi validado (validador, compilação, teste no Studio) e o que ainda falta testar.
