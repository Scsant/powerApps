# Controles modernos (Fluent) x clássicos

> Quando usar Modern*, propriedades que mudam de nome, tema/BasePaletteColor e equivalências com os clássicos.

**Status do conteúdo:** as propriedades vêm do `describe_control` oficial. ModernText, ModernButton, ModernTabList, ModernAvatar, ModernIcon, ModernCard e Form foram **validados nas telas modelo** (ver `padroes-responsivos-modernos`). ModernTextInput, ModernCombobox, ModernDropdown, ModernDatePicker e ModernBadge ainda são **só documentação**: valide com `validar_pa_yaml` e compile antes de tratar como padrão.

## Quando usar
- **Modernos:** visual Fluent (o mesmo do Microsoft 365), acessibilidade melhor, menos propriedades de estilo para configurar. Bom para formulários, badges de status, avatar, abas.
- **Clássicos:** quando você precisa de controle fino de cor por estado (Hover/Pressed), bordas e cores 100% customizadas por controle.
- Pode misturar na mesma tela, mas **não misture nomes de propriedades**: cada família tem as suas.

## Equivalências e diferenças
| Necessidade | Clássico | Moderno |
|---|---|---|
| Texto | `Label` (sem Radius/AccessibleLabel) | `ModernText` (tem Radius, Fill, AccessibleLabel) |
| Botão | `Classic/Button` (Fill, Hover*, sem AccessibleLabel) | `ModernButton` (`Appearance`, `Icon` texto, `BasePaletteColor`, **sem Fill**) |
| Campo texto | `Classic/TextInput` (`HintText`, `Mode`, `Format`) | `ModernTextInput` (`Placeholder`, `Type`, `Required`, `ValidationState`) |
| Combo | `Classic/ComboBox` (`DisplayFields`) | `ModernCombobox` (`ItemDisplayText: =ThisItem.Value`) |
| Dropdown | `Classic/DropDown` (`Default` texto) | `ModernDropdown` (`Default` **registro**) |
| Data | `Classic/DatePicker` (`Format` texto, sem Radius) | `ModernDatePicker` (`Format` enum `DatePickerFormat.Short`, `StartDate/EndDate`, tem Radius) |
| Chip de status | GroupContainer + Label | `ModernBadge` (`Content`, `Intent`) |
| Avatar | container circular + iniciais | `ModernAvatar` (`Name`, `Image`, `Badge: =PresenceBadge.None`) |
| Ícone | `Classic/Icon` (`Icon: =Icon.Add`, `Color`) | `ModernIcon` (`Icon: =Icon.Message`, testado, + `IconColor`) |
| Card | GroupContainer + textos | `ModernCard` (`Title`, `Subtitle`, `Description`, `HeaderImage`, `Image`, `OnSelect`) |
| Abas | galeria horizontal de botões | `ModernTabList` (`Items`, `Selected`) |

## Cor e tema
- Modernos seguem o tema do app (`App.Theme`). Para a cor da marca num controle: `BasePaletteColor: =corPrimaria`.
- `ModernButton` não tem `Fill`/`HoverFill`: use `Appearance` (Primary, Outline, Secondary, Subtle, Transparent) + `BasePaletteColor`.

## Validação de formulário com modernos
```
ValidationState: =If(locTentouEnviar && IsBlank(Self.Text), ValidationState.Error, ValidationState.None)
Required: =true
```
Mostra o erro no próprio campo, sem faixa separada.

## Status com ModernBadge
```yaml
- tplStatus:
    Control: ModernBadge
    Properties:
      Content: =ThisItem.status.Value
      Appearance: =BadgeAppearance.Tint
      Shape: =BadgeShape.Rounded
      Intent: |-
        =Switch(ThisItem.status.Value,
            "Finalizado", BadgeIntent.Positive,
            "Cancelado", BadgeIntent.Critical,
            "Pronto para Retirada", BadgeIntent.Informative,
            BadgeIntent.Caution)
```

## Pegadinhas
- Defaults de `LayoutMinWidth` 320 em inputs também existem aqui: declare `0` em linhas de várias colunas.
- `ModernCombobox.SelectMultiple` também nasce `true`.
- `ModernAvatar.Badge` nasce "Available": mostra presença falsa.
- `ModernIcon`: use o enum `Icon.X` (testado). O `ModernButton.Icon` é texto (nome Fluent, ex. `"Add"`): um nome errado não dá erro de compilação, o ícone só não aparece.
