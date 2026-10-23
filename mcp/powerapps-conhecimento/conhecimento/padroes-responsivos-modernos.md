# Padrões responsivos com controles modernos

> Top nav com abas, faixa de título, grade de cards em GridLayout, hero, CTA, formulário com painel lateral, stepper, DataGrid com busca e mestre-detalhe. Extraídos de telas modelo que compilam no app.

**Status:** validado em projeto. As telas modelo Screen1–9 compilam no app e o `validar_pa_yaml` dá 0 erros.
**Templates:** `padrao-galeria-cards-responsiva`, `padrao-home-hero`, `padrao-formulario-aprovacao`, `padrao-datagrid-busca`, `padrao-mestre-detalhe` e `padrao-boas-vindas-acesso-rapido` (use `obter_template` com `prefixo`).
**Limitação:** ainda não auditei o visual em celular e tablet. Os avisos R-CONT-02 dessas telas (larguras como `Parent.Width - 80`) precisam de conferência visual.

## Breakpoints
Um único critério para a tela inteira:
```
App.Width < 640                         → celular
App.Width >= 640 && App.Width < 1024    → tablet
App.Width >= 1024                       → desktop
```
Use nas propriedades, não em telas separadas:
- Direção: `LayoutDirection: =If(App.Width < 640, LayoutDirection.Vertical, LayoutDirection.Horizontal)`
- Respiro: `PaddingLeft: =If(App.Width < 640, 16, 40)`
- Tipografia: `Size: =If(App.Width < 640, 22, 28)`
- Altura de faixas que empilham no celular: `Height: =If(App.Width < 640, 520, 320)`

Dica: centralize em `App.Formulas`, com `fxCelular = App.Width < 640;` e `fxColunas = If(App.Width < 640, 1, If(App.Width < 1024, 2, 3));`.

## Top nav com abas (desktop × celular)
- Container vertical com `Height: =If(App.Width < 640, 104, 56)`, que tem duas linhas no celular.
- Linha 1 (56px, horizontal, gap 12) com título do app, `ModernTabList` (abas desktop, `FillPortions 1`, `Visible: =App.Width >= 640`), ícones `ModernIcon` 24×24 e `ModernAvatar` 32×32.
- Linha 2 tem as abas de celular, `ModernTabList` com `Height: =If(App.Width < 640, 48, 0)`.
- As abas usam `Appearance: =TabListAppearance.Subtle`, `Items: =["Home", "Gallery"]` e `Default: ={Value: "Home"}`. O `Default` vai num bloco `|-` por causa do `: `.
- Para navegar entre telas, use o `OnChange` da TabList com `Switch(Self.Selected.Value, "Home", Navigate(...), ...)`. Isso é uma hipótese: o modelo só tem abas visuais, sem navegação.
- Divisor: `ModernText` com `Text: =""`, `Fill` cinza e `Height: =2`.

## Faixa de título
Container vertical com padding superior 32 e gap 8. Contém o título (`ModernText` Bold 28/22, `AutoHeight`) e o subtítulo (`Size` 14/12, cinza `RGBA(96, 94, 92, 1)`). A largura do texto é `Parent.Width - If(App.Width < 640, 32, 80)`, ou seja, a largura menos os paddings.

## Abas como filtro
`ModernTabList` com `Appearance: =TabListAppearance.FilledCircular`, `Height` 36 e largura `If(App.Width < 640, Parent.Width - 32, 460)`. Filtre a galeria por `Abas.Selected.Value`.

## Grade de cards responsiva (GridLayout)
```yaml
Variant: GridLayout
Properties:
  LayoutGridColumns: =If(App.Width < 640, 1, If(App.Width < 1024, 2, 3))
  LayoutGridRows: =RoundUp(6 / If(App.Width < 640, 1, If(App.Width < 1024, 2, 3)), 0)
  LayoutGridRowMinHeight: =300
  LayoutGap: =16
  Height: =(Linhas * 300) + ((Linhas - 1) * 16) + PaddingTop + PaddingBottom
```
- Os filhos são `ModernCard` (`Title`, `Subtitle`, `Description`, `HeaderImage`, `Image`), posicionados pela grade.
- `6` é o número de cards. Com itens dinâmicos, use uma galeria com `WrapCount: =fxColunas` em vez de um GridLayout fixo.
- A altura precisa ser calculada, porque a grade não cresce sozinha dentro do container rolável.

## Hero e CTA
- **Hero:** faixa com `Fill: =App.Theme.Colors.Lighter70`, horizontal no desktop e vertical no celular. Coluna de texto com título Bold 38/26, subtítulo e `ModernButton` 160×44.
- **CTA:** faixa com `Fill: =App.Theme.Colors.Primary`, texto branco e botão `Appearance: =ButtonAppearance.Secondary`.
- Cores do tema (`App.Theme.Colors.Primary/Lighter70/Darker20`) acompanham a troca de tema. Prefira-as a RGBA fixo quando o app usar tema próprio.

## Formulário + painel lateral (colunas 7/3)
- Linha horizontal (vertical no celular) com dois cards: formulário (`FillPortions 7`) e painel (`FillPortions 3`, `Visible: =App.Width >= 640`).
- `Form` com a palavra-chave `Layout: Vertical` (obrigatória, ao lado de `Control`) e `NumberOfColumns: =If(App.Width < 640, 1, 2)`.
- Botões no rodapé do card: linha com `LayoutJustifyContent: =LayoutJustifyContent.End`, primário + `Secondary`.
- Para prototipar sem lista, use `DataSource: =Table({...})` e `Item: =First(Table({...}))`. Troque pela lista real depois.

## Stepper (fluxo de aprovação) em galeria
Cada item da galeria (`TemplateSize` 96) é uma linha horizontal com:
- **Trilho** (40px, vertical): linha de cima 2px, bolinha 28px (`Radius*` 100) e linha de baixo 2px. As cores vêm de `ThisItem.Status` (done = verde, current = azul, waiting = cinza). As linhas ficam invisíveis no primeiro e no último item (`ThisItem.IsFirst/IsLast`).
- **Conteúdo:** nome, papel e chip de status (container `Radius` 100 + texto, "✓ Completed", "● In progress", "○ Waiting").

## Tabela com busca (ModernDataGrid)
- Linha de filtros com:
  - `ModernTabList` (FilledCircular);
  - um espaçador (`ModernText` vazio com `FillPortions 1`);
  - `ModernTextInput` de busca com `Placeholder` (largura 200, e `0` no celular).
- `ModernDataGrid` com `DisplayMode: =DisplayMode.View` (só leitura) e `Height` fixo dentro de uma seção de altura fixa.
- Uma `ModernDataGridColumn` por coluna. O `Variant` é obrigatório: `Textual`, `Email`, `Phone`, `Url` (+ `URL: =ThisItem.Link`), `DateTime`, `Number`, `Boolean`, `Button`, `Image`.
  - Use `FieldDisplayName` para o cabeçalho, `Text: =ThisItem.Coluna` e `Width` em px.
- O Studio gera a palavra-chave `IsLocked: true` e `FieldName: ="%DATACARD_FIELD_NAME.ID%"`. Pode manter.
- Busca: `Items: =Filter(fonte, IsBlank(txtBusca.Text) || txtBusca.Text in Coluna1 || txtBusca.Text in Coluna2)`.
  - **Atenção:** `in` (contém) **não é delegável** no SharePoint. Com lista grande, filtre antes por algo delegável (status, área, `StartsWith`) ou use `Search()` sobre uma coleção já filtrada.
- O `ModernDataGrid` também nasce com `FillPortions=1`/`Stretch` dentro de AutoLayout. Declare `FillPortions: =0` se o `Height` for fixo.

## Mestre-detalhe (lista + formulário)
- Linha horizontal (vertical no celular, `Height: =If(App.Width < 640, 900, 580)`) com dois painéis: lista (`FillPortions 3`) e detalhe (`FillPortions 7`).
- **Lista:**
  - busca (`ModernTextInput`) + `Gallery` com `TemplateSize: =72`;
  - cada linha com título e subtítulo;
  - destaque da linha selecionada: `TemplateFill: =If(ThisItem.IsSelected, RGBA(235, 241, 252, 1), RGBA(255, 255, 255, 1))`.
- **Detalhe:**
  - no topo, título `=Coalesce(Galeria.Selected.Title, "Novo item")` e botão Excluir (`Secondary`);
  - `Form` com `Item: =Galeria.Selected` e `NumberOfColumns` responsivo;
  - no rodapé, Cancelar (`ResetForm(Form)`) e Salvar (`SubmitForm(Form)`).
- Para criar um item novo, use `NewForm(Form)`. Depois de salvar, use `Form.OnSuccess` para `Notify` + `Refresh(fonte)`.
  - Isso é hipótese: o modelo não traz Salvar nem Excluir ligados.

## Boas-vindas com acesso rápido
- Hero com texto à esquerda ocupando metade da largura no desktop: `Width: =If(App.Width >= 1024, Parent.Width / 2 - 80, Parent.Width - If(App.Width < 640, 40, 80))`.
- Grade de acesso rápido (GridLayout de `ModernCard`), abas + cards horizontais (`ModernCard.LayoutDirection: =LayoutDirection.Horizontal`) e grade de eventos.
- A altura de cada seção é a soma explícita de título, abas, grade e paddings. Copie a fórmula e ajuste o número de cards.

## Observações do código gerado pela Microsoft
- `LayoutMinHeight: =16` e `LayoutMinWidth: =16` em todos os controles anulam os mínimos altos padrão (150–400). É uma boa prática copiar isso.
- Containers ocupam toda a largura com `Width: =Parent.Width` + `Stretch` padrão. Isso é redundante, mas inofensivo.
