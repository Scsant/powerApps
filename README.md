> 📌 **Portal do Almoxarifado + MCP de conhecimento:** veja o [GUIA-BRACELL.md](GUIA-BRACELL.md), com o passo a passo para levar o app e instalar o MCP.

# Venda de Ativos — Power Apps + React PCF

Componente React PCF responsivo para cadastrar e conduzir solicitações de venda de ativos armazenadas em uma lista SharePoint.

## Arquitetura

- React PCF: interface, validação e emissão de comandos.
- Canvas App: ponte segura entre o PCF e conectores Power Platform.
- SharePoint: armazenamento dos itens e anexos.
- Office 365 Users: usuário atual, gestor e responsáveis.
- Power Fx: `Patch()` idempotente e transições de workflow.

Não há C# ou acesso direto ao Microsoft Graph nesta versão.

## Estrutura

- `src/VendaAtivosControl`: código React PCF, Tailwind e testes.
- `solutions/VendaAtivos`: projeto da solução Power Platform.
- `canvas/VendaAtivosApp`: instruções para montagem e posterior source control do Canvas App.
- `docs/sharepoint-schema.md`: campos e opções da lista.
- `docs/powerfx-bridge.md`: propriedades e fórmulas do Canvas.
- `docs/deployment.md`: build, importação e exportação.
- `scripts/pac.ps1`: wrapper local do Power Platform CLI.

## Build verificado

```powershell
cd .\src\VendaAtivosControl
npm test
npm run lint
npm run build

cd ..\..\solutions\VendaAtivos
dotnet build .\VendaAtivos.cdsproj --configuration Release
```

Pacotes:

- `solutions/VendaAtivos/bin/Release/VendaAtivos.zip`
- `solutions/VendaAtivos/bin/Release/VendaAtivos_managed.zip`

Comece pela versão unmanaged e siga `docs/deployment.md`.
