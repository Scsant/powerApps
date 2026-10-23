# Sintaxe .pa.yaml (Power Apps source code)

> Estrutura dos arquivos App/Screens, controles, blocos de fórmula e erros de parsing comuns.

## Estrutura dos arquivos
Um arquivo por tela (`NomeDaTela.pa.yaml`) + `App.pa.yaml` + `_EditorState.pa.yaml` (ordem das telas).

```yaml
App:
  Properties:
    Formulas: |-
      =corPrimaria = ColorValue("#1565A8");
    OnStart: |-
      =Set(varUsuario, User());
    Theme: =PowerAppsTheme
```

```yaml
Screens:
  minhaTela:
    Properties:
      Fill: =corFundo
      OnVisible: |-
        =UpdateContext({locModal: false})
    Children:
      - minhaTelaRaiz:
          Control: GroupContainer
          Variant: AutoLayout
          Properties:
            LayoutDirection: =LayoutDirection.Vertical
          Children:
            - minhaTelaTitulo:
                Control: Label
                Properties:
                  Text: ="Título"
```

```yaml
EditorState:
  ScreensOrder:
    - Menu
    - minhaTela
```
A primeira tela de `ScreensOrder` é a inicial (ou use `App.StartScreen`).

## Indentação
- Só espaços. O `- Nome:` do filho fica 4 espaços à direita do `Children:`... e `Control:`/`Properties:` ficam 4 espaços à direita do `-`.
- `Control:` obrigatório; `Variant:` obrigatório para `GroupContainer` (AutoLayout/ManualLayout/GridLayout) e `Gallery` (Vertical/Horizontal/VariableHeight).

## Valores são fórmulas
- Linha única: `Text: ="Olá " & User().FullName`
- Vazio: `Default: =""` (não deixe `Default:` sem nada).
- Bloco (obrigatório se tiver `: `, ` #`, ou várias linhas):
```yaml
OnSelect: |-
  =Patch(
      lista,
      Defaults(lista),
      {titulo: txtTitulo.Text}
  );
  Navigate(Menu, ScreenTransition.Fade)
```

## Erros de parsing e o que significam
| Mensagem | Causa | Correção |
|---|---|---|
| `YamlInvalidSyntax ... found invalid mapping` | fórmula de 1 linha com `: ` (ex.: `{x: 1}`) | bloco `|-` |
| `Unknown property 'X' for control type 'Y'` | propriedade não existe no controle | `descrever_controle` |
| nome duplicado | mesmo nome em duas telas | prefixo por tela |

## Comentários
- Dentro de fórmula: `//` e `/* */` funcionam (inclusive em `Formulas`).
- Comentário YAML (`#`) só em linha própria fora de blocos.

## Mídia e componentes
- Imagens de mídia (`Image: =logo_bracell`) não são criadas pelo YAML: suba a mídia no Studio.
- Fontes de dados também não: adicione no Studio (Dados → Adicionar dados). O YAML só referencia pelo nome.

## Colar YAML no Studio
Árvore de telas → clique direito → **Colar** aceita YAML de controles; em uma tela, **Exibir código** mostra/aceita o YAML dela. Útil quando não há MCP/automação disponível.
