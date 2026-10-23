"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RULES = void 0;
exports.parsePaYaml = parsePaYaml;
exports.validate = validate;
exports.explainRules = explainRules;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const catalog_1 = require("./catalog");
function parsePaYaml(text, file, issues) {
    const roots = [];
    const stack = [{ indent: -1, type: "root" }];
    let block = null;
    let quoted = null;
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNo = i + 1;
        const ind = line.length - line.trimStart().length;
        if (quoted) {
            quoted.prop.value += "\n" + line.trim();
            if (closesQuote(line.trim(), quoted.q)) {
                quoted.prop.value = unquote(quoted.prop.value, quoted.q);
                quoted = null;
            }
            continue;
        }
        if (block) {
            if (line.trim() === "") {
                block.prop.value += "\n";
                continue;
            }
            if (ind > block.indent) {
                if (block.contentIndent === null)
                    block.contentIndent = ind;
                block.prop.value += (block.prop.value ? "\n" : "") + line.slice(Math.min(ind, block.contentIndent));
                continue;
            }
            block.prop.value = block.prop.value.replace(/\n+$/, "");
            block = null;
        }
        const content = line.trim();
        if (!content || content.startsWith("#"))
            continue;
        if (line.includes("\t"))
            issues.push({ rule: "R-YAML-04", file, line: lineNo, target: "", message: "TAB na indentação." });
        while (stack.length > 1 && stack[stack.length - 1].indent >= ind)
            stack.pop();
        const top = stack[stack.length - 1];
        if (top.type === "skip")
            continue;
        const dash = /^-\s+([^:]+):\s*$/.exec(content);
        if (dash) {
            const node = { name: dash[1].trim().replace(/^'(.*)'$/, "$1"), kind: "control", props: {}, children: [], line: lineNo, file };
            if (top.type === "children" && top.node) {
                node.parent = top.node;
                top.node.children.push(node);
            }
            else {
                // na raiz = trecho para colar em Children: (template/snippet); em outro lugar = estrutura errada
                if (top.type !== "root")
                    issues.push({ rule: "R-YAML-03", file, line: lineNo, target: node.name, message: "Controle fora de um bloco Children:." });
                roots.push(node);
            }
            stack.push({ indent: ind, type: "node", node });
            continue;
        }
        const kv = /^([^:]+):(?:\s+(.*))?$/.exec(content);
        if (!kv) {
            issues.push({ rule: "R-YAML-03", file, line: lineNo, target: "", message: `Linha não reconhecida: "${content.slice(0, 60)}"` });
            continue;
        }
        const key = kv[1].trim();
        const val = (kv[2] ?? "").trim();
        switch (top.type) {
            case "root":
                if (key === "Screens" || key === "ComponentDefinitions")
                    stack.push({ indent: ind, type: "screens" });
                else if (key === "App") {
                    const node = { name: "App", kind: "app", control: "App", props: {}, children: [], line: lineNo, file };
                    roots.push(node);
                    stack.push({ indent: ind, type: "node", node });
                }
                else
                    stack.push({ indent: ind, type: "skip" });
                break;
            case "screens": {
                const node = { name: key.replace(/^'(.*)'$/, "$1"), kind: "screen", control: "Screen", props: {}, children: [], line: lineNo, file };
                roots.push(node);
                stack.push({ indent: ind, type: "node", node });
                break;
            }
            case "node": {
                const node = top.node;
                if (key === "Control")
                    node.control = val;
                else if (key === "Variant")
                    node.variant = val;
                else if (key === "Layout")
                    node.layout = val;
                else if (key === "Properties")
                    stack.push({ indent: ind, type: "props", node });
                else if (key === "Children")
                    stack.push({ indent: ind, type: "children", node });
                else
                    stack.push({ indent: ind, type: "skip" });
                break;
            }
            case "props": {
                const node = top.node;
                if (/^[|>][-+]?$/.test(val)) {
                    const prop = { value: "", line: lineNo, block: true };
                    node.props[key] = prop;
                    block = { prop, indent: ind, contentIndent: null };
                }
                else if (val.startsWith("'") || val.startsWith('"')) {
                    const q = val[0];
                    const prop = { value: val, line: lineNo, block: false, quoted: true };
                    node.props[key] = prop;
                    if (val.length > 1 && closesQuote(val.slice(1), q))
                        prop.value = unquote(val, q);
                    else
                        quoted = { prop, q };
                }
                else {
                    node.props[key] = { value: val, line: lineNo, block: false };
                }
                break;
            }
            default:
                break;
        }
    }
    if (block)
        block.prop.value = block.prop.value.replace(/\n+$/, "");
    return roots;
}
/** Fecha o escalar entre aspas? ('' e \" são escapes, não fechamento.) */
function closesQuote(text, q) {
    const t = q === "'" ? text.replace(/''/g, "") : text.replace(/\\./g, "");
    return t.endsWith(q);
}
function unquote(v, q) {
    let inner = v.slice(1, v.lastIndexOf(q));
    inner = q === "'" ? inner.replace(/''/g, "'") : inner.replace(/\\"/g, '"');
    return inner.trim();
}
exports.RULES = {
    "R-YAML-01": { id: "R-YAML-01", severity: "erro", title: "Fórmula de uma linha com ': ' ou ' #'",
        fix: "Use bloco literal: `Prop: |-` e a fórmula na linha de baixo começando com `=`. YAML corta o valor em ': ' e trata ' #' como comentário.", topic: "pa-yaml-sintaxe" },
    "R-YAML-02": { id: "R-YAML-02", severity: "erro", title: "Valor de propriedade sem '=' no início",
        fix: "Toda propriedade é uma fórmula: `Text: =\"Olá\"`, `Height: =40`. Em bloco |-, a primeira linha começa com `=`.", topic: "pa-yaml-sintaxe" },
    "R-YAML-03": { id: "R-YAML-03", severity: "erro", title: "Estrutura YAML inesperada",
        fix: "Controles ficam em `Children:` como `- Nome:` seguidos de `Control:`, `Variant:`, `Properties:`, `Children:` (4 espaços a mais que o '-').", topic: "pa-yaml-sintaxe" },
    "R-YAML-04": { id: "R-YAML-04", severity: "erro", title: "TAB na indentação", fix: "Use somente espaços.", topic: "pa-yaml-sintaxe" },
    "R-YAML-05": { id: "R-YAML-05", severity: "erro", title: "Controle sem Control: / Variant:",
        fix: "Todo nó precisa de `Control:`. GroupContainer exige `Variant: AutoLayout|ManualLayout|GridLayout`; Gallery exige `Variant: Vertical|Horizontal|VariableHeight`.", topic: "controles-classicos" },
    "R-NOME-01": { id: "R-NOME-01", severity: "erro", title: "Nome de controle duplicado",
        fix: "Nomes são globais no app (todas as telas). Use prefixo por tela: mnuTitulo, novaTitulo...", topic: "pa-yaml-sintaxe" },
    "R-PROP-01": { id: "R-PROP-01", severity: "erro", title: "Propriedade inexistente neste controle",
        fix: "Remova ou troque pela equivalente. Consulte descrever_controle(\"<Controle>\") para a lista oficial.", topic: "controles-classicos" },
    "R-PROP-02": { id: "R-PROP-02", severity: "info", title: "Propriedade não catalogada (catálogo parcial)",
        fix: "O catálogo deste controle é parcial: confira com descrever_controle ou no Studio.", topic: "controles-classicos" },
    "R-NAV-01": { id: "R-NAV-01", severity: "erro", title: "Navigate para tela inexistente",
        fix: "Confira o nome da tela (case-sensitive) ou crie a tela.", topic: "powerfx-padroes" },
    "R-FX-03": { id: "R-FX-03", severity: "aviso", title: "Mesmo nome em Set() e UpdateContext() (sombreamento)",
        fix: "Na tela, a variável de contexto ESCONDE a global de mesmo nome (ex.: varAtendente vira registro e quebra If(varAtendente,...)). Renomeie a de contexto com prefixo loc.", topic: "powerfx-padroes" },
    "R-CONT-01": { id: "R-CONT-01", severity: "aviso", title: "Filho de container auto layout sem FillPortions",
        fix: "GroupContainer e Gallery nascem com FillPortions=1: dividem o espaço do pai e IGNORAM Height (pai vertical) / Width (pai horizontal). Para tamanho fixo use `FillPortions: =0`; para ocupar o resto use `=1` de propósito.", topic: "containers-autolayout" },
    "R-CONT-02": { id: "R-CONT-02", severity: "aviso", title: "Tamanho no eixo cruzado ignorado (AlignInContainer=Stretch)",
        fix: "GroupContainer/Gallery nascem com AlignInContainer=Stretch: esticam no eixo cruzado e ignoram Width (pai vertical) / Height (pai horizontal). Use `AlignInContainer: =AlignInContainer.SetByContainer` (ou Start/Center/End).", topic: "containers-autolayout" },
    "R-CONT-07": { id: "R-CONT-07", severity: "info", title: "FillPortions implícito (=1) sem tamanho declarado",
        fix: "Se a intenção é ocupar o espaço livre, declare `FillPortions: =1` para deixar explícito; se não, `=0` + Height/Width.", topic: "containers-autolayout" },
    "R-CONT-03": { id: "R-CONT-03", severity: "info", title: "X/Y em filho de auto layout (ignorado)",
        fix: "Dentro de container AutoLayout a posição é do layout: remova X/Y.", topic: "containers-autolayout" },
    "R-CONT-04": { id: "R-CONT-04", severity: "info", title: "Propriedade de 'filho de auto layout' fora de auto layout",
        fix: "FillPortions/AlignInContainer/LayoutMin* só valem quando o pai é GroupContainer AutoLayout.", topic: "containers-autolayout" },
    "R-CONT-05": { id: "R-CONT-05", severity: "aviso", title: "Container AutoLayout sem LayoutDirection",
        fix: "O padrão é Horizontal. Declare `LayoutDirection: =LayoutDirection.Vertical|Horizontal` explicitamente.", topic: "containers-autolayout" },
    "R-CONT-06": { id: "R-CONT-06", severity: "info", title: "Layout por frações de Parent (posicionamento absoluto)",
        fix: "Valores como `Parent.Width * 3/10` quebram em outras resoluções. Prefira containers AutoLayout com FillPortions/LayoutGap/Padding.", topic: "containers-autolayout" },
    "R-FX-01": { id: "R-FX-01", severity: "aviso", title: "CountRows(Galeria.AllItems)",
        fix: "Use `Galeria.AllItemsCount` (mais leve, não materializa a tabela).", topic: "powerfx-padroes" },
    "R-FX-02": { id: "R-FX-02", severity: "info", title: "Choices() espalhado pelas telas",
        fix: "Centralize em App.Formulas (ex.: `opcArea = Choices(lista.area);`) e use `opcArea` nos controles: troca de fonte vira 1 linha.", topic: "sharepoint-dados" },
    "R-DADOS-01": { id: "R-DADOS-01", severity: "aviso", title: "Conector duplicado (sufixo _1, _2...)",
        fix: "Inserir modelos de tela adiciona outra conexão do mesmo conector (UsuáriosdoOffice365_1...). Troque as referências pelo nome original e remova a fonte duplicada em Dados.", topic: "office365-pessoas-email" },
    "R-FX-04": { id: "R-FX-04", severity: "info", title: "SearchUser antigo",
        fix: "Use SearchUserV2({searchTerm: txt, top: 15}).value (a tabela vem em .value).", topic: "office365-pessoas-email" },
    "R-A11Y-01": { id: "R-A11Y-01", severity: "info", title: "Campo sem AccessibleLabel",
        fix: "Defina `AccessibleLabel` (o texto do rótulo do campo).", topic: "controles-classicos" },
    "R-A11Y-02": { id: "R-A11Y-02", severity: "info", title: "Label/Rectangle clicável sem TabIndex",
        fix: "Elemento com OnSelect precisa de `TabIndex: =0` e `FocusedBorderThickness: =2` para teclado.", topic: "controles-classicos" },
};
const FILL1_DEFAULT = new Set(["GroupContainer", "Gallery", "Form", "ModernDataGrid"]);
const STRETCH_DEFAULT = new Set(["GroupContainer", "Gallery", "Form", "ModernDataGrid"]);
// mesma coisa que esticar: não é aviso
const SAME_AS_STRETCH = /^=\s*Parent\.(Width|Height)\s*$/;
const CHILD_ONLY = ["FillPortions", "AlignInContainer", "LayoutMinWidth", "LayoutMinHeight", "LayoutMaxWidth", "LayoutMaxHeight"];
const INPUTS = new Set(["Classic/TextInput", "Classic/ComboBox", "Classic/DropDown", "Classic/DatePicker", "ModernTextInput", "ModernCombobox", "ModernDropdown", "ModernDatePicker"]);
function isAuto(n) {
    return !!n && n.control === "GroupContainer" && n.variant === "AutoLayout";
}
function direction(n) {
    const v = n.props.LayoutDirection?.value ?? "";
    if (/Vertical/.test(v) && /Horizontal/.test(v))
        return "Dinâmica";
    return /Vertical/.test(v) ? "Vertical" : "Horizontal";
}
function walk(nodes, fn) {
    for (const n of nodes) {
        fn(n);
        walk(n.children, fn);
    }
}
function checkNode(n, issues) {
    const add = (rule, line, message) => issues.push({ rule, file: n.file, line, target: n.name, message });
    // sintaxe dos valores
    for (const [key, p] of Object.entries(n.props)) {
        if (p.block) {
            if (p.value.trim() && !p.value.trimStart().startsWith("="))
                add("R-YAML-02", p.line, `${key}: bloco não começa com '='.`);
        }
        else {
            if (!p.value.startsWith("="))
                add("R-YAML-02", p.line, `${key}: "${p.value.slice(0, 50)}"`);
            else if (!p.quoted && (/: /.test(p.value) || / #/.test(p.value) || /:$/.test(p.value)))
                add("R-YAML-01", p.line, `${key}: ${p.value.slice(0, 70)}`);
        }
    }
    if (n.kind !== "control")
        return;
    if (!n.control) {
        add("R-YAML-05", n.line, "sem `Control:`");
        return;
    }
    if ((n.control === "GroupContainer" || n.control === "Gallery" || n.control === "ModernDataGridColumn") && !n.variant)
        add("R-YAML-05", n.line, `${n.control} sem \`Variant:\``);
    if (n.control === "Form" && !n.layout)
        add("R-YAML-05", n.line, "Form sem `Layout: Vertical|Horizontal` (palavra-chave ao lado de Control, não propriedade).");
    const allowed = (0, catalog_1.allowedProps)(n.control, n.variant);
    if (allowed) {
        for (const [key, p] of Object.entries(n.props)) {
            if (key.includes(".") || allowed.set.has(key))
                continue; // ex.: Items.Value
            add(allowed.complete ? "R-PROP-01" : "R-PROP-02", p.line, `'${key}' não está entre as propriedades de ${n.control}${n.variant ? ` (${n.variant})` : ""}.`);
        }
    }
    if (isAuto(n) && !n.props.LayoutDirection)
        add("R-CONT-05", n.line, "LayoutDirection não declarado (padrão Horizontal).");
    const parent = n.parent;
    if (isAuto(parent)) {
        const dir = direction(parent);
        if (FILL1_DEFAULT.has(n.control) && !n.props.FillPortions) {
            const mainSizes = dir === "Vertical" ? ["Height"] : dir === "Horizontal" ? ["Width"] : ["Height", "Width"];
            const set = mainSizes.find((k) => n.props[k] && !SAME_AS_STRETCH.test(n.props[k].value));
            if (set)
                add("R-CONT-01", n.line, `${set}=${n.props[set].value.replace(/^=/, "")} será IGNORADO: FillPortions padrão=1 (pai ${dir}).`);
            else
                add("R-CONT-07", n.line, `sem FillPortions e sem tamanho no eixo principal (pai ${dir}): vai ocupar o espaço livre.`);
        }
        if (STRETCH_DEFAULT.has(n.control) && !n.props.AlignInContainer && dir !== "Dinâmica") {
            const crossSize = dir === "Vertical" ? "Width" : "Height";
            const parentAlign = parent.props.LayoutAlignItems?.value ?? "";
            // só importa se o filho define um tamanho cruzado diferente de "esticar" e o pai não estica de propósito
            if (n.props[crossSize] && !SAME_AS_STRETCH.test(n.props[crossSize].value) && !/Stretch/.test(parentAlign)) {
                add("R-CONT-02", n.props[crossSize].line, `${crossSize}=${n.props[crossSize].value.replace(/^=/, "")} será ignorado: AlignInContainer padrão=Stretch.`);
            }
        }
        for (const xy of ["X", "Y"])
            if (n.props[xy])
                add("R-CONT-03", n.props[xy].line, `${xy} ignorado dentro de auto layout.`);
    }
    else {
        for (const k of CHILD_ONLY) {
            if (k.startsWith("Layout"))
                continue; // LayoutMin* fora de auto layout é tolerado pelo compilador
            if (n.props[k])
                add("R-CONT-04", n.props[k].line, `${k} sem efeito (pai não é AutoLayout).`);
        }
    }
    if (INPUTS.has(n.control) && !n.props.AccessibleLabel)
        add("R-A11Y-01", n.line, `${n.control} sem AccessibleLabel.`);
    if ((n.control === "Label" || n.control === "Rectangle") && n.props.OnSelect && !n.props.TabIndex) {
        add("R-A11Y-02", n.props.OnSelect.line, "OnSelect sem TabIndex.");
    }
}
function checkGlobal(all, issues, extraScreens = []) {
    // nomes duplicados (globais no app)
    const seen = new Map();
    const screens = new Set(extraScreens);
    walk(all, (n) => {
        if (n.kind === "screen")
            screens.add(n.name);
        if (n.kind === "app")
            return;
        const prev = seen.get(n.name);
        if (prev)
            issues.push({ rule: "R-NOME-01", file: n.file, line: n.line, target: n.name, message: `já usado em ${path.basename(prev.file)}:${prev.line}` });
        else
            seen.set(n.name, n);
    });
    const globals = new Map();
    const contexts = [];
    const fractionCount = new Map();
    walk(all, (n) => {
        for (const [key, p] of Object.entries(n.props)) {
            const v = p.value;
            const add = (rule, message) => issues.push({ rule, file: n.file, line: p.line, target: `${n.name}.${key}`, message });
            for (const m of v.matchAll(/\bSet\(\s*([A-Za-z_]\w*)\s*,/g))
                globals.set(m[1], { file: n.file, line: p.line });
            for (const m of v.matchAll(/\bUpdateContext\(\s*\{([\s\S]*?)\}\s*\)/g)) {
                for (const k of m[1].matchAll(/(?:^|,|\{)\s*([A-Za-z_]\w*)\s*:/g))
                    contexts.push({ name: k[1], file: n.file, line: p.line, target: `${n.name}.${key}` });
            }
            for (const m of v.matchAll(/CountRows\(\s*([A-Za-z_]\w*)\.AllItems\s*\)/g))
                add("R-FX-01", `use ${m[1]}.AllItemsCount`);
            if (n.kind !== "app" && /\bChoices\(/.test(v.replace(/\/\/.*$/gm, "")))
                add("R-FX-02", "Choices() direto no controle.");
            const code = v.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
            for (const m of code.matchAll(/'?((?:Usu[aá]riosdoOffice365|Office365Users|Office365Outlook|Office365Groups)_\d+)'?\s*\./g)) {
                add("R-DADOS-01", `fonte "${m[1]}" (conector duplicado).`);
            }
            if (/\.SearchUser\s*\(/.test(code))
                add("R-FX-04", "SearchUser (antigo) → SearchUserV2({searchTerm, top}).value");
            for (const m of v.matchAll(/\bNavigate\(\s*([A-Za-z_]\w*)/g)) {
                if (screens.size && !screens.has(m[1]))
                    add("R-NAV-01", `tela "${m[1]}" não existe neste conjunto de arquivos.`);
            }
            if (["X", "Y", "Width", "Height"].includes(key) && /Parent\.(Width|Height)\s*\*\s*[\d.]+\s*\/\s*[\d.]+/.test(v)) {
                const f = fractionCount.get(n.file) ?? { count: 0, line: p.line };
                f.count++;
                fractionCount.set(n.file, f);
            }
        }
    });
    for (const c of contexts) {
        const g = globals.get(c.name);
        if (g)
            issues.push({ rule: "R-FX-03", file: c.file, line: c.line, target: c.target, message: `"${c.name}" é global (Set em ${path.basename(g.file)}:${g.line}).` });
    }
    for (const [file, f] of fractionCount) {
        if (f.count >= 5)
            issues.push({ rule: "R-CONT-06", file, line: f.line, target: "", message: `${f.count} propriedades X/Y/Width/Height com frações de Parent.` });
    }
}
/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */
const ORDER = { erro: 0, aviso: 1, info: 2 };
function collectFiles(target) {
    const st = fs.statSync(target);
    if (st.isFile())
        return [target];
    return fs.readdirSync(target)
        .filter((f) => f.endsWith(".pa.yaml") || f.endsWith(".yaml"))
        .filter((f) => !f.startsWith("_"))
        .map((f) => path.join(target, f));
}
/** Nomes de telas definidos nos .pa.yaml da mesma pasta (para validar 1 arquivo sem falso "tela inexistente"). */
function siblingScreens(target) {
    const dir = fs.statSync(target).isDirectory() ? target : path.dirname(target);
    const names = [];
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".pa.yaml"))) {
        const m = /^Screens:\s*\r?\n\s{2}'?([^:'\r\n]+)'?:/m.exec(fs.readFileSync(path.join(dir, f), "utf8"));
        if (m)
            names.push(m[1].trim());
    }
    return names;
}
function validate(opts) {
    const min = opts.nivel_minimo ?? "aviso";
    const maxPerRule = opts.max_por_regra ?? 25;
    const issues = [];
    const nodes = [];
    let files = [];
    if (opts.conteudo) {
        nodes.push(...parsePaYaml(opts.conteudo, "<conteudo>", issues));
        files = ["<conteudo>"];
    }
    else if (opts.caminho) {
        const target = path.resolve(opts.caminho);
        if (!fs.existsSync(target))
            throw new Error(`Caminho não existe: ${target}`);
        files = collectFiles(target);
        if (!files.length)
            throw new Error(`Nenhum .pa.yaml em ${target}`);
        for (const f of files)
            nodes.push(...parsePaYaml(fs.readFileSync(f, "utf8"), f, issues));
    }
    else {
        throw new Error("Informe 'caminho' (arquivo ou pasta) ou 'conteudo' (texto YAML).");
    }
    let controls = 0;
    walk(nodes, (n) => { if (n.kind === "control")
        controls++; checkNode(n, issues); });
    checkGlobal(nodes, issues, opts.caminho ? siblingScreens(path.resolve(opts.caminho)) : []);
    const shown = issues
        .filter((i) => ORDER[exports.RULES[i.rule].severity] <= ORDER[min])
        .sort((a, b) => ORDER[exports.RULES[a.rule].severity] - ORDER[exports.RULES[b.rule].severity] || a.rule.localeCompare(b.rule) || a.file.localeCompare(b.file) || a.line - b.line);
    const count = (s) => issues.filter((i) => exports.RULES[i.rule].severity === s).length;
    const out = [
        `Validação pa.yaml — ${files.length} arquivo(s), ${controls} controle(s)`,
        `Erros: ${count("erro")} | Avisos: ${count("aviso")} | Info: ${count("info")}  (exibindo nível ≥ ${min})`,
    ];
    if (!shown.length) {
        out.push("", count("erro") ? "" : "✓ Nenhum problema neste nível. (Isto não substitui compilar no Studio / compile_canvas.)");
        return out.join("\n");
    }
    const byRule = new Map();
    for (const i of shown)
        byRule.set(i.rule, [...(byRule.get(i.rule) ?? []), i]);
    for (const [ruleId, list] of byRule) {
        const r = exports.RULES[ruleId];
        out.push("", `${r.severity.toUpperCase()} [${r.id}] ${r.title} — ${list.length} ocorrência(s)`, `  Correção: ${r.fix}`, `  Saiba mais: ler_topico("${r.topic}")`);
        for (const i of list.slice(0, maxPerRule)) {
            out.push(`  - ${path.basename(i.file)}:${i.line}${i.target ? ` ${i.target}` : ""} — ${i.message}`);
        }
        if (list.length > maxPerRule)
            out.push(`  … +${list.length - maxPerRule} ocorrência(s)`);
    }
    return out.join("\n");
}
function explainRules() {
    return Object.values(exports.RULES)
        .sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.id.localeCompare(b.id))
        .map((r) => `- **${r.id}** (${r.severity}) ${r.title}\n  ${r.fix}`)
        .join("\n");
}
