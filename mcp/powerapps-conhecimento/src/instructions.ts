/** Enviado ao cliente no initialize: o agente lê isto antes de usar as ferramentas. */
export const INSTRUCTIONS = `Base de conhecimento Power Apps Canvas (pa.yaml, containers, Power Fx, SharePoint) com validador.

FLUXO OBRIGATÓRIO ao criar/editar telas Canvas (.pa.yaml):
1. Consulte antes de escrever: ler_topico("00-regras-de-ouro"); para layout ler_topico("containers-autolayout"); para dados ler_topico("sharepoint-dados").
2. Antes de usar um controle, descrever_controle("<Controle>") — só use propriedades listadas.
3. Prefira obter_template(...) com prefixo da tela a escrever do zero.
4. Depois de gerar/editar, rode validar_pa_yaml(caminho) e corrija TODOS os erros e avisos antes de entregar.

REGRAS QUE MAIS QUEBRAM APPS:
- GroupContainer/Gallery dentro de container AutoLayout nascem com FillPortions=1 e AlignInContainer=Stretch: ignoram Height/Width. Declare FillPortions: =0 (fixo) ou =1 (elástico, de propósito) e AlignInContainer quando precisar de largura/altura própria.
- Fórmula de uma linha com ": " quebra o YAML: use bloco "Prop: |-" com "=" na primeira linha.
- Toda propriedade começa com "=". Nomes de controle são únicos no app inteiro (use prefixo por tela).
- Classic/DatePicker e Label não têm Radius; Classic/Button não tem AccessibleLabel (use Tooltip); ComboBox usa InputTextPlaceholder, TextInput usa HintText.
- Choices() centralizado em App.Formulas (opcX = Choices(lista.coluna)); Galeria.AllItemsCount em vez de CountRows(Galeria.AllItems).
- Nunca use o mesmo nome em Set() e UpdateContext() (o contexto esconde a global na tela).

Responda em português do Brasil.`;
