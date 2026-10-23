# Checklists

> Passo a passo para nova tela, formulário, lista com detalhes, ligar dados reais e revisão final.

## Nova tela
- [ ] Nome da tela em camelCase e prefixo curto para os controles (ex.: `fila`).
- [ ] Esqueleto: raiz AutoLayout vertical (tela cheia) → header fixo (`FillPortions 0`, 64) → corpo rolável (`FillPortions 1`) → conteúdo centralizado (`Min(1100, Parent.Width-64)`, Height explícito).
- [ ] Todo container filho com `FillPortions` e, se tiver largura/altura própria, `AlignInContainer`.
- [ ] Dados carregados no `OnVisible`.
- [ ] Incluída no `_EditorState.pa.yaml` e nos links do header.
- [ ] `validar_pa_yaml` sem erros/avisos.

## Formulário
- [ ] Seções em cards numerados; linhas de até 3 campos (`FillPortions 1` por coluna, `LayoutMinWidth 0`).
- [ ] Rótulo acima do campo; `AccessibleLabel` no input.
- [ ] ComboBox: `SelectMultiple false`, `Items` = `opcX` de App.Formulas, `DisplayFields ["Value"]`.
- [ ] Validação encadeada em `If(...)` com mensagem + faixa de erro na tela; campos ocultos não exigidos.
- [ ] Patch com Choice `{Value}` e Pessoa completa; `Reset` dos campos; navegação para confirmação.
- [ ] Botões: Cancelar (outline, reseta e volta) e ação principal.

## Lista com detalhes
- [ ] Cabeçalho de colunas + galeria (`TemplatePadding 0`, linha 52, divisor).
- [ ] Busca + filtro; contador com `AllItemsCount`; estado vazio.
- [ ] Linha clicável (botão transparente) → `UpdateContext({locDados: ThisItem, locPainel: true})`.
- [ ] Painel lateral + overlay fora do AutoLayout (na tela, após a raiz).

## Ligar dados reais (mock → produção)
- [ ] Apagar bloco `// ===== MOCK INÍCIO ... MOCK FIM`.
- [ ] Adicionar listas/conectores com os mesmos nomes.
- [ ] Trocar `opc* = Table(...)` por `Choices(...)`.
- [ ] Trocar fontes simuladas (ex.: busca de usuários) pelas reais.
- [ ] App Checker sem erros; testar cada perfil.

## Revisão final
- [ ] `validar_pa_yaml` → 0 erros, 0 avisos.
- [ ] Compilar no Studio / `compile_canvas`.
- [ ] Testar em 1366×768 e em tela maior (conteúdo centralizado, nada esticado).
- [ ] Teclado: Tab percorre campos e botões na ordem certa.
