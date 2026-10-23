# Padrões Power Fx

> Variáveis, coleções, fórmulas nomeadas, validação de formulário, navegação e performance.

## Variáveis
| Tipo | Como | Escopo | Prefixo |
|---|---|---|---|
| Global | `Set(varX, valor)` | app inteiro | `var` |
| Contexto | `UpdateContext({locX: valor})` | só a tela | `loc` |
| Fórmula nomeada | `App.Formulas: fxX = ...;` | app, recalcula sozinha | `fx`, `opc`, `cor` |

**Nunca** o mesmo nome em `Set` e `UpdateContext`: compila, mas na tela o contexto esconde a global (para ler a global use `[@varX]`). Ex. real: `Set(varAtendente, true)` no OnStart e `UpdateContext({varAtendente: dropStatus.Selected})` na fila — depois disso, na fila, `varAtendente` deixou de ser booleano.

## App.Formulas (fórmulas nomeadas)
Constantes, cores, opções e derivados do usuário — sem custo de coleção:
```
corPrimaria = ColorValue("#1565A8");
fxPrimeiroNome = Proper(First(Split(User().FullName, " ")).Value);
opcStatus = Choices(soliMateriais.status);
```
O App Checker sugere trocar `ClearCollect` de dados que nunca mudam por fórmula nomeada.

## Coleções
- `ClearCollect(col, Filter(fonte, ...))` para cache/busca não delegável.
- Recarregue depois de `Patch`/`Remove` (ou faça `Patch` também na coleção).
- Coleção com o mesmo nome de uma fonte de dados = conflito: remova uma antes de criar a outra.

## Validação de formulário (padrão)
```
UpdateContext({
    locErro:
        If(
            IsBlank(txtMatricula.Text), "Matrícula não informada.",
            Len(txtMatricula.Text) <> 8, "Matrícula deve ter 8 dígitos.",
            (cbTipo.Selected.Value <> "Atendimento") && IsBlank(dtData.SelectedDate), "Data não informada.",
            Blank()
        )
});
If(
    IsBlank(locErro),
    Patch(...); Reset(...); Navigate(telaOk, ScreenTransition.Fade),
    Notify(locErro, NotificationType.Error)
)
```
- Mostre `locErro` também na tela (faixa vermelha visível com `!IsBlank(locErro)`).
- Campo escondido não pode ser exigido.

## Navegação
- `Navigate(Tela, ScreenTransition.Fade)`; carregue dados no `OnVisible` da tela de destino.
- Header com links: Labels com `OnSelect: =Navigate(...)`, o ativo em negrito/branco.

## Performance
- `Galeria.AllItemsCount` em vez de `CountRows(Galeria.AllItems)`.
- `Concurrent(...)` para cargas independentes no OnStart.
- `With({x: LookUp(...)}, ...)` evita repetir consultas.
- `LookUp` para 1 registro em vez de `First(Filter(...))`.

## Datas e texto
- `Text(data, "dd/mm/yyyy")`, `Text(dataHora, "dd/mm/yyyy hh:mm")`.
- `Coalesce(valor, "—")` para vazios em telas de detalhe.
- `Proper()` para nomes vindos em MAIÚSCULAS do AD.
