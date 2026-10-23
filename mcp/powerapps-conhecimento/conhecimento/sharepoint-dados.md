# SharePoint e dados

> Patch de colunas Pessoa/Choice, delegação, Choices centralizado e a estratégia de mock que vira real trocando um bloco.

## Patch de coluna Pessoa (Person)
```
solicitante: {
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & Lower(User().Email),
    DisplayName: User().FullName,
    Email: User().Email,
    Department: "",
    JobTitle: "",
    Picture: ""
}
```
Para pessoa escolhida em ComboBox de `UsuáriosdoOffice365.SearchUserV2(...).value`: use `.Selected.Mail`, `.Selected.DisplayName`, `.Selected.Department`, `.Selected.JobTitle`.

## Patch de Choice
`status: {Value: "Aguardando Separação"}` — sempre registro `{Value: ...}`. Ler: `ThisItem.status.Value`.

## Criar x atualizar
- Criar: `Patch(lista, Defaults(lista), {...})`.
- Atualizar: `Patch(lista, registroDaGaleria, {...})` ou `Patch(lista, LookUp(lista, ID = x), {...})`.
- Remover: `Remove(lista, LookUp(lista, ...))`.
- Nunca envie `ID`/`Criado`/`Modificado` no Patch (somente leitura).

## Delegação (limite 500/2000 linhas)
- Delegáveis no SharePoint: `=`, `<>`, `<`, `>`, `StartsWith`, `&&`, `||` em colunas simples; `coluna.Value =` em Choice; `pessoa.Email =` em Pessoa.
- **Não delegáveis:** `Find`, `in` (substring), `Len`, `Lower` na coluna... → filtre primeiro de forma delegável (ex.: por almoxarifado/solicitante), guarde em coleção e só então busque com `Find`.

## Choices centralizado
Em `App.Formulas`:
```
opcArea = Choices(soliMateriais.area);
```
Controles usam `Items: =opcArea`. Benefícios: um lugar para trocar fonte, mock ou ordem.

## Estratégia de mock trocável (desenvolver sem acesso às listas)
1. Crie **coleções com o mesmo nome das listas** e o mesmo formato de registro (Choice `{Value}`, Pessoa `{Email, DisplayName, Claims, ...}`, `ID`, `Criado`) dentro de um bloco no `App.OnStart`:
```
// ===== MOCK INÍCIO (apagar ao ligar nos dados reais) =====
ClearCollect(soliMateriais, {ID: 1, Criado: Now(), status: {Value: "Aguardando Separação"}, ...});
// ===== MOCK FIM =====
```
2. Opções: `opcArea = Table({Value: "Manutenção"}, ...);` com a linha real comentada acima: `// Choices(soliMateriais.area)`.
3. Todas as telas usam `Filter/LookUp/Patch/Remove` normalmente — funcionam em coleção e em lista.
4. Para ligar: apague o bloco MOCK **antes** de adicionar as listas (nome igual conflita), adicione as fontes com o mesmo nome, troque as linhas `opc*`.
- Limitação: Patch em coleção não gera `ID`/`Criado`.

## Conectores
- `User()` (Email, FullName, Image) não precisa de conector — prefira para o usuário atual.
- `UsuáriosdoOffice365` (pt-BR) / `Office365Users` (en): MyProfile, UserProfile(email), UserPhotoV2, SearchUserV2({searchTerm, top}).value. O nome da fonte depende do idioma em que foi adicionada: mantenha o mesmo nos dois ambientes.
