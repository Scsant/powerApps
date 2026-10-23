# Design system — Portal Bracell

> Tokens de cor, tipografia, espaçamentos e padrões visuais (header, cards, seções numeradas, chips de status, painel lateral).

## Tokens (App.Formulas)
```
corHeader = ColorValue("#2432C8");        // header
corBanner = ColorValue("#4F68D2");        // banner de boas-vindas
corBannerCard = ColorValue("#0F4F99");
corPrimaria = ColorValue("#1565A8");      // botões / links / números de seção
corPrimariaHover = ColorValue("#0F4F87");
corPrimariaClara = ColorValue("#E6F0FA");
corFundo = ColorValue("#F3F6FA");         // fundo das telas
corCard = Color.White;
corBorda = ColorValue("#E1E6EE");
corTexto = ColorValue("#1B2B48");
corTextoSec = ColorValue("#5B6B82");
corSucesso = ColorValue("#1E8E4F");  corSucessoClaro = ColorValue("#E5F5EC");
corErro = ColorValue("#C0392B");     corErroClaro = ColorValue("#FDECEA");
```
Template pronto: `obter_template("tokens-app-formulas")`.

## Tipografia (Segoe UI)
| Uso | Size | Peso |
|---|---|---|
| Título de página | 20 | Semibold |
| Saudação do banner | 22 | Semibold |
| Título de card/seção | 13–14 | Semibold |
| Rótulo de campo | 10 | Semibold |
| Texto/inputs | 10 | Normal |
| Secundário / kicker | 8–9 | Normal / Semibold MAIÚSCULO |

## Espaçamentos
- Header 64px, padding lateral 32.
- Conteúdo: largura `Min(1100, Parent.Width - 64)`, gap 20 entre blocos, topo 28.
- Card: padding 20, raio 10, borda 1px `corBorda`, sem sombra.
- Inputs/botões: altura 36–40, raio 6.
- Gap entre colunas de campos: 16.

## Padrões
- **Header:** "Bracell" | divisor | "Portal do Almoxarifado" … links (ativo em branco/negrito, demais 72% opacidade) … avatar com iniciais (círculo branco 32px) + nome curto (`Proper` primeiro+último nome).
- **Breadcrumb:** "Início / Página" 9px secundário; "Início" clicável.
- **Cabeçalho da página:** título 20 + subtítulo 10 à esquerda, ação (botão) à direita.
- **Seção de formulário:** card com número "01" em `corPrimaria` + título; linhas de 3 colunas.
- **Rodapé do formulário:** texto de ajuda à esquerda, "Cancelar" (outline) e ação principal (primário com "→").
- **Erro de formulário:** faixa `corErroClaro` com texto `corErro` acima do rodapé.
- **Tabela:** cabeçalho em `corFundo` com títulos MAIÚSCULOS 8px; linhas de 52px com divisor; linha inteira clicável abre painel.
- **Chip de status:** container raio 12, altura 24, cores por status (Switch).
- **Painel de detalhes:** à direita, 460px, overlay escuro 45%, seções "Solicitante / Retirada / Atendimento" em pares chave-valor.
- **Estado vazio:** texto centralizado secundário dentro do card.
- **Confirmação destrutiva:** modal central com botão `corErro`.

## Cores de status
| Status | Fundo | Texto |
|---|---|---|
| Aguardando Separação | #FFF4D6 | #8A5A00 |
| Em Separação | #DEEBFF | #1552A8 |
| Pronto para Retirada | #E0F5E9 | #166E3C |
| Finalizado | #E9ECF1 | #465266 |
| Cancelado | #FDE4E4 | #B02020 |
