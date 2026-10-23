# Controles clássicos — propriedades e pegadinhas

> Resumo prático de Label, TextInput, ComboBox, DropDown, DatePicker, Button, Icon, Gallery, GroupContainer. Lista completa: descrever_controle.

## Por que clássicos?
Permitem estilo fino (cores de hover, bordas, raio no botão/input) e são estáveis no YAML. Controles "Modern*" usam tema Fluent e têm outras propriedades — não misture nomes de propriedades entre famílias.

## Label
- Sem `Radius` e sem `AccessibleLabel`. Para "chip" arredondado: GroupContainer (com Radius) + Label.
- Padding padrão 5 → zere para alinhar. `AutoHeight: =true` para textos que crescem.
- Clicável (`OnSelect`) → `TabIndex: =0` e `FocusedBorderThickness: =2`.
- Títulos: `Role: =TextRole.Heading1` (acessibilidade).

## Classic/TextInput
- Placeholder: `HintText`. Inicial: `Default: =""` (default é "Entrada de texto"!).
- Valor: `.Text`. Números: `Format: =TextFormat.Number`. Multilinha: `Mode: =TextMode.MultiLine`. `MaxLength`.
- Tem Radius (`RadiusTopLeft`...). Somente leitura: `DisplayMode: =DisplayMode.Disabled` (ou View).

## Classic/ComboBox
- **`SelectMultiple` padrão = true** → `false` para escolha única.
- Placeholder: `InputTextPlaceholder`. **Sem Radius, sem HintText.**
- Para Choice do SharePoint: `Items: =opcArea`, `DisplayFields: =["Value"]`, `SearchFields: =["Value"]`.
- Valor: `.Selected.Value`. Busca digitada: `.SearchText` (pode ser usada no próprio `Items`).
- Inicial: `DefaultSelectedItems: =[registro]`.

## Classic/DropDown
- `Default` é **texto** (valor exibido), ex.: `Default: =varDados.status.Value`.
- `Items.Value: =Value` (sub-propriedade aceita) define a coluna mostrada.
- `AllowEmptySelection` para permitir vazio.

## Classic/DatePicker
- **Sem Radius** (erro de compilação). `DefaultDate: =Blank()` para obrigar escolha.
- Valor: `.SelectedDate`. `Format: ="dd/mm/yyyy"`, `StartYear`/`EndYear`.

## Classic/Button
- **Sem AccessibleLabel** → `Tooltip`. Tem Radius (padrão 10), `BorderThickness` 2.
- Primário: `Fill` cor primária + `Color: =Color.White`. Outline: `Fill: =Color.White`, `BorderColor`, `Color` primária.
- Overlay clicável transparente: `Fill: =RGBA(0,0,0,0)`, `Text: =""`, `BorderThickness: =0`.

## Classic/Icon
- `Icon: =Icon.Trash` (obrigatório). `TabIndex` padrão -1 → `0` se clicável. Tamanho padrão 64.

## Gallery
- `Variant` obrigatório. `TemplateSize`, `TemplatePadding: =0`.
- Filhos do template: X/Y manuais com `Parent.TemplateWidth`/`Parent.TemplateHeight` (pode ter um GroupContainer AutoLayout dentro).
- Dentro de AutoLayout: `FillPortions` padrão 1 e `LayoutMinHeight` 287 → declare.
- Divisor entre linhas: Rectangle `Height: =1`, `Y: =Parent.TemplateHeight - 1`.

## GroupContainer
- **Sem OnSelect/Text/Color.** `DropShadow` padrão Light → `DropShadow.None` para visual "flat".
- Radius padrão 4. Ver containers-autolayout para FillPortions/AlignInContainer.

## Acessibilidade (checker do Studio)
- Inputs: `AccessibleLabel` com o texto do rótulo.
- Elemento clicável: `TabIndex: =0` + foco visível (`FocusedBorderThickness > 0`).
- O checker também acusa Labels estáticos (TabIndex/Foco) — em textos não clicáveis isso pode ser ignorado; não coloque TabIndex 0 em texto puro (polui a navegação por teclado).
