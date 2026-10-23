# Regras de ouro — Power Apps Canvas

> Leia primeiro. As 12 regras que evitam 90% dos erros ao gerar telas .pa.yaml.

## 1. Containers AutoLayout: declare FillPortions e AlignInContainer
`GroupContainer` e `Gallery` dentro de um container AutoLayout **nascem com `FillPortions = 1` e `AlignInContainer = Stretch`**.
Resultado: `Height` (pai vertical) / `Width` (pai horizontal) são **ignorados** e o container divide o espaço com os irmãos; no eixo cruzado ele estica.
Sintoma clássico: header gigante, cards achatados, avatar esticado.

```yaml
- cardResumo:
    Control: GroupContainer
    Variant: AutoLayout
    Properties:
      FillPortions: =0                                  # tamanho fixo
      AlignInContainer: =AlignInContainer.SetByContainer # respeita o LayoutAlignItems do pai
      Height: =150
```
Use `FillPortions: =1` **de propósito** só no que deve ocupar o resto (corpo rolável, coluna elástica, tabela).

## 2. Toda propriedade é fórmula: começa com `=`
`Text: ="Olá"`, `Height: =40`, `Visible: =true`.

## 3. Fórmula de uma linha com `: ` quebra o YAML
`OnVisible: =UpdateContext({x: 1})` → erro *YamlInvalidSyntax*. Use bloco:
```yaml
OnVisible: |-
  =UpdateContext({x: 1})
```
O mesmo vale para ` #` (vira comentário).

## 4. Nomes de controle são globais no app
Dois controles com o mesmo nome em telas diferentes = erro. Use prefixo por tela (`mnu`, `nova`, `fila`...).

## 5. Use só propriedades que existem
- `Classic/DatePicker`, `Label`, `Rectangle`, `Classic/ComboBox`: **sem Radius**.
- `Classic/Button`: **sem AccessibleLabel** (use `Tooltip`).
- Placeholder: `HintText` (TextInput) / `InputTextPlaceholder` (ComboBox, DatePicker).
- `GroupContainer`: **sem OnSelect/Text/Color**.
Na dúvida: `descrever_controle`.

## 6. Defaults que enganam
- `Classic/ComboBox.SelectMultiple` = **true** → declare `false` para escolha única.
- `Classic/TextInput.Default` = "Entrada de texto" → declare `""`.
- `Classic/DatePicker.DefaultDate` = `Today()` → declare `Blank()` se o usuário deve escolher.
- `Label` tem padding 5 e `LayoutMinWidth` 150; inputs têm `LayoutMinWidth` 320/328 → declare `0` em linhas com várias colunas.

## 7. Choices() centralizado em App.Formulas
`opcArea = Choices(soliMateriais.area);` e o controle usa `Items: =opcArea`. Trocar fonte/mock vira uma linha.

## 8. Contagem de galeria: `Galeria.AllItemsCount`
Não `CountRows(Galeria.AllItems)`.

## 9. Set() e UpdateContext() nunca com o mesmo nome
O Power Apps aceita, mas na tela a variável de contexto **esconde** a global (bug silencioso: `varAtendente` virou registro e quebrou `If(varAtendente, ...)`). Global = `Set`, prefixo `var`; contexto = `UpdateContext`, prefixo `loc`.

## 10. Carregue dados no OnVisible da tela
Não no OnSelect do botão que navega — assim qualquer caminho até a tela carrega certo.

## 11. Validação condicional acompanha a visibilidade
Se um campo some (`Visible`), não o exija na validação (`(condição) && IsBlank(campo)`), nem grave valor dele no Patch.

## 12. Valide antes de entregar
Rode `validar_pa_yaml` na pasta do app e corrija erros e avisos. Depois compile no Studio.
