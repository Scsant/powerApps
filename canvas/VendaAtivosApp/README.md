# Canvas App — Venda de Ativos

Esta pasta receberá as fontes exportadas do Canvas App depois da montagem no ambiente corporativo.

O `.msapp` não é criado artificialmente neste repositório porque aplicativos com PCF precisam registrar o componente de código no ambiente antes de serem salvos pelo Power Apps Studio. A própria Microsoft também não oferece suporte a alterações diretas nos `.pa.yaml` de apps que contêm code components.

## Montagem no Power Apps Studio

1. Importe `dist/VendaAtivosPCF_unmanaged.zip`.
2. Ative **Power Apps component framework for canvas apps** nas configurações do ambiente.
3. Crie um aplicativo Canvas responsivo dentro da solução `VendaAtivos`.
4. Adicione a lista SharePoint e renomeie a fonte para `SolicitacoesVendaAtivos`.
5. Adicione o conector Office 365 Users.
6. Insira o code component `PowerAppsLab.VendaAtivosControl` e nomeie-o `cmpVendaAtivos`.
7. Defina o controle para preencher a tela:
   - `X = 0`
   - `Y = 0`
   - `Width = Parent.Width`
   - `Height = Parent.Height`
8. Copie as propriedades e fórmulas de [`../../docs/powerfx-bridge.md`](../../docs/powerfx-bridge.md).
9. Adicione o formulário nativo de anexos conforme a mesma documentação.
10. Salve, publique, adicione o app à solução e exporte a solução final.

Depois do primeiro download do `.msapp`, use:

```powershell
.\scripts\pac.ps1 canvas unpack `
  --msapp ".\canvas\VendaAtivosApp.msapp" `
  --sources ".\canvas\VendaAtivosApp" `
  --layout SourceCode
```

Não edite manualmente os arquivos `.pa.yaml` que contêm a instância PCF. Faça alterações funcionais no Power Apps Studio e use o unpack somente para versionamento e revisão.
