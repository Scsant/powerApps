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
exports.TEMPLATES_DIR = exports.KNOWLEDGE_DIR = void 0;
exports.listTopics = listTopics;
exports.readTopic = readTopic;
exports.search = search;
exports.listTemplates = listTemplates;
exports.readTemplate = readTemplate;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
/** Pastas editáveis: podem ser sobrescritas por variável de ambiente (ex.: apontar para um OneDrive). */
exports.KNOWLEDGE_DIR = process.env.POWERAPPS_KNOWLEDGE_DIR ?? path.join(__dirname, "..", "conhecimento");
exports.TEMPLATES_DIR = process.env.POWERAPPS_TEMPLATES_DIR ?? path.join(__dirname, "..", "templates");
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function listFiles(dir, ext) {
    if (!fs.existsSync(dir))
        return [];
    return fs.readdirSync(dir).filter((f) => ext.some((e) => f.endsWith(e))).sort();
}
// lido a cada chamada: editar um .md reflete na hora, sem reiniciar o servidor
function listTopics() {
    return listFiles(exports.KNOWLEDGE_DIR, [".md"]).map((file) => {
        const text = fs.readFileSync(path.join(exports.KNOWLEDGE_DIR, file), "utf8");
        const title = /^#\s+(.+)$/m.exec(text)?.[1]?.trim() ?? file;
        const summary = /^>\s*(.+)$/m.exec(text)?.[1]?.trim() ?? "";
        return { name: file.replace(/\.md$/, ""), title, summary, file };
    });
}
function resolveTopic(name) {
    const topics = listTopics();
    const n = norm(name.replace(/\.md$/, ""));
    const hit = topics.find((t) => norm(t.name) === n) ?? topics.find((t) => norm(t.name).includes(n) || norm(t.title).includes(n));
    if (!hit)
        throw new Error(`Tópico "${name}" não encontrado. Disponíveis: ${topics.map((t) => t.name).join(", ")}`);
    return hit;
}
function readTopic(name) {
    const t = resolveTopic(name);
    return fs.readFileSync(path.join(exports.KNOWLEDGE_DIR, t.file), "utf8");
}
function sections() {
    const out = [];
    for (const t of listTopics()) {
        const text = fs.readFileSync(path.join(exports.KNOWLEDGE_DIR, t.file), "utf8");
        const parts = text.split(/^(?=##\s)/m);
        for (const part of parts) {
            const heading = /^##\s+(.+)$/m.exec(part)?.[1]?.trim() ?? t.title;
            out.push({ topic: t.name, heading, text: part.trim() });
        }
    }
    return out;
}
function search(query, limit = 5) {
    const terms = norm(query).split(/[^a-z0-9_.]+/).filter((w) => w.length >= 2);
    if (!terms.length)
        throw new Error("Informe ao menos um termo de busca.");
    const scored = sections()
        .map((s) => {
        const body = norm(s.text);
        const head = norm(s.heading);
        let score = 0;
        for (const term of terms) {
            const hits = body.split(term).length - 1;
            score += hits + (head.includes(term) ? 5 : 0);
        }
        // bônus quando todos os termos aparecem na seção
        if (terms.every((term) => body.includes(term)))
            score += 3 * terms.length;
        return { s, score };
    })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    if (!scored.length)
        return `Nada encontrado para "${query}". Use listar_topicos para ver os assuntos.`;
    return scored
        .map(({ s }) => {
        const text = s.text.length > 2500 ? s.text.slice(0, 2500) + "\n…(seção truncada — use ler_topico)" : s.text;
        return `### [${s.topic}] ${s.heading}\n\n${text}`;
    })
        .join("\n\n---\n\n");
}
function listTemplates() {
    return listFiles(exports.TEMPLATES_DIR, [".yaml", ".yml"]).map((file) => {
        const first = fs.readFileSync(path.join(exports.TEMPLATES_DIR, file), "utf8").split(/\r?\n/)[0];
        return { name: file.replace(/\.ya?ml$/, ""), description: first.replace(/^#\s*/, "") };
    });
}
function readTemplate(name, prefix) {
    const n = norm(name.replace(/\.ya?ml$/, ""));
    const hit = listTemplates().find((t) => norm(t.name) === n) ?? listTemplates().find((t) => norm(t.name).includes(n));
    if (!hit)
        throw new Error(`Template "${name}" não encontrado. Disponíveis: ${listTemplates().map((t) => t.name).join(", ")}`);
    let text = fs.readFileSync(path.join(exports.TEMPLATES_DIR, hit.name + ".yaml"), "utf8");
    // nomes de controle precisam ser únicos no app inteiro: troca o prefixo "tpl" pelo informado
    if (prefix)
        text = text.replace(/\btpl(?=[A-Z])/g, prefix);
    return text;
}
