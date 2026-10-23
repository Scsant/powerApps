# Containers e Auto Layout

> Como montar layouts responsivos com GroupContainer AutoLayout sem quebrar: eixos, FillPortions, AlignInContainer, rolagem, overlays.

## Conceito: eixo principal x eixo cruzado
- `LayoutDirection: =LayoutDirection.Vertical` → eixo principal = **altura**, cruzado = largura.
- `LayoutDirection: =LayoutDirection.Horizontal` (padrão!) → principal = **largura**, cruzado = altura.

| Propriedade (no FILHO) | Controla | Observação |
|---|---|---|
| `FillPortions` | tamanho no eixo principal | `0` = usa Height/Width; `≥1` = divide o espaço livre proporcionalmente |
| `AlignInContainer` | eixo cruzado | `SetByContainer` usa o `LayoutAlignItems` do pai; `Stretch` estica (ignora o tamanho) |
| `LayoutMinWidth/Height` | mínimo | defaults altos (150–328) estouram linhas: declare `0` |

| Propriedade (no PAI) | Controla |
|---|---|
| `LayoutGap` | espaço entre filhos |
| `Padding*` | respiro interno |
| `LayoutAlignItems` | alinhamento padrão dos filhos no eixo cruzado (Start/Center/End/Stretch) |
| `LayoutJustifyContent` | distribuição no eixo principal (Start/Center/End/SpaceBetween) |
| `LayoutOverflowY: =LayoutOverflow.Scroll` | rolagem |
| `LayoutWrap` | quebra de linha (cards responsivos) |

## A armadilha nº 1: defaults do GroupContainer e da Gallery
Dentro de AutoLayout: **`FillPortions = 1`** e **`AlignInContainer = Stretch`**.
Labels, botões e inputs têm `FillPortions = 0` e `SetByContainer` — por isso só os containers "explodem".

Sintomas:
- header de 64px virou 270px, banner/cards com 30px → `FillPortions` faltando (dividiram a altura).
- avatar 32×32 virou retângulo largo e alto → `FillPortions` (largura) + `Stretch` (altura).

Correção padrão para todo container "de tamanho fixo":
```yaml
FillPortions: =0
AlignInContainer: =AlignInContainer.SetByContainer
```

## Esqueleto de página (header fixo + corpo rolável centralizado)
```yaml
- pagRaiz:                      # filho direto da tela: X/Y/Width/Height normais
    Control: GroupContainer
    Variant: AutoLayout
    Properties:
      LayoutDirection: =LayoutDirection.Vertical
      LayoutAlignItems: =LayoutAlignItems.Stretch
      X: =0
      Y: =0
      Width: =Parent.Width
      Height: =Parent.Height
      DropShadow: =DropShadow.None
    Children:
      - pagHeader:
          Control: GroupContainer
          Variant: AutoLayout
          Properties:
            LayoutDirection: =LayoutDirection.Horizontal
            LayoutAlignItems: =LayoutAlignItems.Center
            FillPortions: =0            # ← fixo
            Height: =64
            PaddingLeft: =32
            PaddingRight: =32
            LayoutGap: =14
      - pagCorpo:
          Control: GroupContainer
          Variant: AutoLayout
          Properties:
            LayoutDirection: =LayoutDirection.Vertical
            LayoutAlignItems: =LayoutAlignItems.Center
            LayoutOverflowY: =LayoutOverflow.Scroll
            FillPortions: =1            # ← ocupa o resto, de propósito
            PaddingTop: =28
          Children:
            - pagConteudo:
                Control: GroupContainer
                Variant: AutoLayout
                Properties:
                  LayoutDirection: =LayoutDirection.Vertical
                  LayoutAlignItems: =LayoutAlignItems.Stretch
                  LayoutGap: =20
                  FillPortions: =0
                  AlignInContainer: =AlignInContainer.Center
                  Width: =Min(1100, Parent.Width - 64)   # largura máxima do conteúdo
                  Height: =800                           # soma das alturas + gaps
```
Para a rolagem funcionar, o conteúdo precisa de **Height explícito** maior que o corpo.

## Linha de campos (3 colunas iguais)
```yaml
- frmLinha1:
    Control: GroupContainer
    Variant: AutoLayout
    Properties:
      LayoutDirection: =LayoutDirection.Horizontal
      LayoutGap: =16
      FillPortions: =0
      Height: =62
    Children:
      - frmCampoA:              # cada coluna: FillPortions 1 (divide a largura)
          Control: GroupContainer
          Variant: AutoLayout
          Properties:
            LayoutDirection: =LayoutDirection.Vertical
            LayoutAlignItems: =LayoutAlignItems.Stretch
            LayoutGap: =6
            FillPortions: =1
            LayoutMinWidth: =0
```
Inputs dentro da coluna: `LayoutMinWidth: =0` (o default 320 estoura).

## Espaçador
Label vazio com `FillPortions: =1` empurra os próximos itens para a direita (ex.: nav no header).

## Elementos sobrepostos (modal, painel lateral, overlay)
AutoLayout não sobrepõe. Coloque **na tela, depois do container raiz** (fica por cima):
- overlay: `Rectangle` tela cheia, `Fill: =RGBA(15,23,42,0.45)`, `OnSelect` fecha.
- painel: GroupContainer com `X: =Parent.Width - Self.Width`, `Height: =Parent.Height`.
- modal: `X: =(Parent.Width - Self.Width) / 2`, `Y: =(Parent.Height - Self.Height) / 2`.

## Visibilidade colapsa
Filho com `Visible: =false` não ocupa espaço no AutoLayout — ótimo para campos condicionais. Ajuste a altura do conteúdo pai com `If(...)` se ela for fixa.

## Anti-padrão: frações de Parent
`X: =Parent.Width * 3/10`, `Height: =Parent.Height * 1/7` (posicionamento absoluto) quebra em outras resoluções e é difícil de manter. Use AutoLayout + gaps + paddings.
