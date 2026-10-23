import { listTopics, readTopic, search, listTemplates, readTemplate } from "./knowledge";
import { validate, explainRules } from "./validator";
import { describeControl } from "./catalog";

interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  run: (args: any) => string | Promise<string>;
}

const str = (description: string) => ({ type: "string", description });

export const TOOLS: Tool[] = [
  {
    name: "listar_topicos",
    description: "Lista os tópicos da base de conhecimento Power Apps (containers/auto layout, controles, pa.yaml, Power Fx, SharePoint, design system, checklists). Comece por aqui se não souber o que consultar.",
    inputSchema: { type: "object", properties: {} },
    run: () => listTopics().map((t) => `- **${t.name}** — ${t.title}${t.summary ? `: ${t.summary}` : ""}`).join("\n"),
  },
  {
    name: "ler_topico",
    description: "Lê um tópico inteiro da base de conhecimento. Use ANTES de gerar código do assunto (ex.: 'containers-autolayout' antes de montar layout; 'pa-yaml-sintaxe' antes de escrever .pa.yaml).",
    inputSchema: { type: "object", properties: { nome: str("Nome do tópico (ex.: containers-autolayout). Aceita nome parcial.") }, required: ["nome"] },
    run: (a) => readTopic(String(a.nome)),
  },
  {
    name: "buscar_conhecimento",
    description: "Busca por termos em toda a base (ex.: 'FillPortions', 'Patch pessoa sharepoint', 'delegação', 'Choices'). Retorna as seções mais relevantes.",
    inputSchema: {
      type: "object",
      properties: { termo: str("Termos de busca"), limite: { type: "number", description: "Máximo de seções (padrão 5)" } },
      required: ["termo"],
    },
    run: (a) => search(String(a.termo), Number(a.limite) || 5),
  },
  {
    name: "descrever_controle",
    description: "Lista as propriedades VÁLIDAS de um controle Canvas — clássicos (Label, Classic/TextInput, Classic/ComboBox, Classic/DropDown, Classic/DatePicker, Classic/Button, Classic/Icon, Image, Rectangle, Timer, GroupContainer, Gallery) e modernos (ModernText, ModernButton, ModernTextInput, ModernCombobox, ModernDropdown, ModernDatePicker, ModernBadge, ModernAvatar, ModernIcon, ModernTabList) — com padrões que causam bugs, dicas e a fonte (testado ou só documentação). Use antes de escrever propriedades — evita 'Unknown property'.",
    inputSchema: { type: "object", properties: { nome: str("Nome do controle, ex.: Classic/ComboBox, GroupContainer, Label") }, required: ["nome"] },
    run: (a) => describeControl(String(a.nome)),
  },
  {
    name: "validar_pa_yaml",
    description: "Valida arquivos .pa.yaml (Power Apps source) e aponta erros conhecidos com linha e correção: sintaxe YAML (': ' em linha única), propriedades inexistentes, containers sem FillPortions/AlignInContainer (layout quebrado), nomes duplicados, Navigate para tela inexistente, Set x UpdateContext com mesmo nome, CountRows(AllItems), Choices espalhado. Rode SEMPRE depois de gerar/editar YAML e corrija antes de entregar.",
    inputSchema: {
      type: "object",
      properties: {
        caminho: str("Arquivo .pa.yaml ou pasta com os .pa.yaml do app (caminho absoluto de preferência)"),
        conteudo: str("Alternativa a 'caminho': o texto YAML a validar"),
        nivel_minimo: { type: "string", enum: ["erro", "aviso", "info"], description: "Nível mínimo exibido (padrão: aviso)" },
      },
    },
    run: (a) => validate({ caminho: a.caminho, conteudo: a.conteudo, nivel_minimo: a.nivel_minimo }),
  },
  {
    name: "regras_validacao",
    description: "Explica todas as regras do validar_pa_yaml (id, severidade, como corrigir).",
    inputSchema: { type: "object", properties: {} },
    run: () => explainRules(),
  },
  {
    name: "listar_templates",
    description: "Lista os templates de YAML prontos e validados (header, seção de formulário, card, tabela/galeria, painel de detalhes, modal, botões, tokens de cor).",
    inputSchema: { type: "object", properties: {} },
    run: () => listTemplates().map((t) => `- **${t.name}** — ${t.description}`).join("\n"),
  },
  {
    name: "obter_template",
    description: "Devolve um template de YAML pronto para colar em Children:. Informe 'prefixo' para renomear os controles (nomes são globais no app: use o prefixo da tela, ex.: 'nova', 'mnu').",
    inputSchema: {
      type: "object",
      properties: { nome: str("Nome do template (veja listar_templates)"), prefixo: str("Prefixo que substitui 'tpl' nos nomes dos controles") },
      required: ["nome"],
    },
    run: (a) => readTemplate(String(a.nome), a.prefixo ? String(a.prefixo) : undefined),
  },
];

export async function callTool(name: string, args: any): Promise<string> {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) throw new Error(`Ferramenta desconhecida: ${name}. Disponíveis: ${TOOLS.map((t) => t.name).join(", ")}`);
  return tool.run(args);
}

