# Portal do Almoxarifado (Canvas App)

Redesign UI/UX do app de solicitações de materiais. O original está em `snapshot_teste_sync/`.

- `src/`: os `.pa.yaml` do app (App, Menu, novaSolicitacao, minhasSolicitacoes, filaAtendimento, cadastroEquipe, Finalizada).
- `gerador/`: scripts Python que geram o `src/`.
  - `ui.py`: emissor YAML e blocos visuais (header, card, campo, chip, botão).
  - `lista.py`: tabela de solicitações e painel de detalhes.
  - `scr_*.py`: uma tela por arquivo.
  - `App.pa.yaml`: cores, opções (Choices) e bloco MOCK.

## Regenerar

```powershell
cd canvas\AlmoxarifadoApp\src
python ..\gerador\build.py .
```

Depois, envie para o Studio com o MCP canvas-authoring (`compile_canvas` nesta pasta) ou cole o YAML no Studio.

## Ligar nos dados reais

Siga `docs/almoxarifado-conexao-bracell.md`. São 4 passos:
1. Apagar o bloco MOCK.
2. Adicionar as 3 listas e o conector Office 365.
3. Trocar as linhas `opc*` por `Choices(...)`.
4. Trocar a busca de usuários na tela Equipe.
