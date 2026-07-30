# Relatório de verificação

Data: 30/07/2026

## Executado localmente

- `npm test`: 6 testes aprovados.
- `npm run lint`: aprovado, sem erros.
- `npm run build`: PCF compilado e empacotado com sucesso.
- `dotnet build --configuration Release`: solução compilada sem erros ou avisos.
- Auditoria de dependências de produção: 0 vulnerabilidades.
- Pacote unmanaged inspecionado: contém manifesto, bundle JavaScript e CSS.
- Pacote managed inspecionado: contém manifesto, bundle JavaScript e CSS.
- Manifesto usa somente `React 16.14.0` como platform library; Fluent 9.68 não está presente.

## Testes automatizados

- Conversão de tabelas Choice geradas pelo Power Fx.
- Conversão das permissões e descarte de comandos desconhecidos.
- Remoção de campos gerenciados pelo SharePoint no payload.
- Validação do cadastro inicial.
- Obrigatoriedade de OV e NF na conclusão fiscal.
- Obrigatoriedade dos dados finais e validação da URL de baixa.

## Validação no ambiente

A importação não foi executada automaticamente. O perfil PAC ativo nesta máquina aponta para outro tenant, e o proprietário informou que fará o upload no ambiente corporativo.

Após a importação, executar a lista de validação pós-importação de `deployment.md`, com atenção especial a:

- Compatibilidade do code component no tenant.
- Valores reais dos campos Choice.
- Conexões SharePoint e Office 365 Users.
- Fórmulas com a localidade do Canvas App.
- Usuários responsáveis de cada etapa.
- Layout no Player desktop e móvel.
- Anexos do formulário nativo.
