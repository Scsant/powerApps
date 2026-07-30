# Implantação — Venda de Ativos

## Pacotes gerados

- Desenvolvimento: `solutions/VendaAtivos/bin/Release/VendaAtivos.zip`
- Produção: `solutions/VendaAtivos/bin/Release/VendaAtivos_managed.zip`

O primeiro é unmanaged e permite alterações no ambiente de desenvolvimento. O segundo é managed e deve ser usado somente após homologação.

Nesta entrega, os ZIPs contêm o componente PCF. O Canvas App entra no pacote final depois da montagem no ambiente, pois o Power Apps Studio precisa registrar o code component antes de salvar o `.msapp`.

## Pré-requisitos do ambiente

1. Ambiente Power Platform com Dataverse habilitado para receber Solutions. Os dados do sistema continuam no SharePoint.
2. Permissão para importar soluções e usar code components em Canvas Apps.
3. Lista SharePoint com os nomes internos descritos em `sharepoint-schema.md`.
4. Conectores SharePoint e Office 365 Users permitidos pela política DLP.
5. Opções dos campos Choice alinhadas ao fluxo documentado.

## Importar o componente

1. Acesse `make.powerapps.com` e selecione o ambiente corporativo correto.
2. Abra **Solutions** → **Import solution**.
3. Importe `VendaAtivos.zip` no desenvolvimento.
4. Confirme o publisher `PowerAppsLab`, prefixo `pal` e controle `PowerAppsLab.VendaAtivosControl`.
5. Em **Settings** → **Product** → **Features**, habilite Power Apps component framework for canvas apps.

Não execute `pac pcf push` antes de selecionar explicitamente o ambiente corporativo. O perfil PAC atualmente ativo nesta máquina não identifica o ambiente da empresa.

## Montar o Canvas App

Siga `canvas/VendaAtivosApp/README.md` e `docs/powerfx-bridge.md`.

O app deve ser criado dentro da solução `VendaAtivos`, com:

- Uma tela responsiva ocupada pelo `cmpVendaAtivos`.
- Fonte SharePoint com alias `SolicitacoesVendaAtivos`.
- Conector Office 365 Users.
- Formulário nativo contendo apenas o DataCard de anexos.
- Fórmula idempotente em `cmpVendaAtivos.OnChange`.

Depois:

1. Salve e publique o app.
2. Em **Solutions**, adicione o Canvas App à solução que contém o PCF.
3. Adicione os objetos necessários e publique todas as customizações.
4. Exporte uma versão unmanaged para backup do desenvolvimento.
5. Exporte a versão managed para homologação/produção.

## Configuração por ambiente

Defina no `App.OnStart`:

- E-mail do responsável por Meio Ambiente.
- E-mail do responsável por Logística.
- E-mail do responsável Fiscal.

O SharePoint e o Office 365 Users solicitarão associação de conexão durante a importação no destino. Credenciais não são empacotadas.

## Validação pós-importação

1. Abrir o Canvas App no Player em desktop e celular.
2. Salvar um rascunho e confirmar que somente um item foi criado.
3. Enviar ao gestor e conferir `Status`, `EtapaAtual` e `ResponsavelAtual`.
4. Executar aprovações com usuários responsáveis distintos.
5. Concluir logística e fiscal informando OV e NF.
6. Concluir a venda com valor final, comprador e URL de baixa.
7. Adicionar e remover anexos pelo formulário nativo.
8. Confirmar que usuários não responsáveis veem o item sem ações.

## Rebuild local

```powershell
cd C:\desenvolvimento\powerApps\src\VendaAtivosControl
npm test
npm run lint
npm run build

cd C:\desenvolvimento\powerApps\solutions\VendaAtivos
dotnet build .\VendaAtivos.cdsproj --configuration Release
```

O build gera os pacotes managed e unmanaged porque `SolutionPackageType` está configurado como `Both`.

## Rollback

- Em desenvolvimento, remova a versão unmanaged somente depois de excluir dependências do Canvas App.
- Em produção, desinstalar a solução managed remove o controle; faça isso apenas após retirar o componente dos aplicativos dependentes.
- Mantenha sempre o ZIP da versão anterior para rollback por atualização de solução.
