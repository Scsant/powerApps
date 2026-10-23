import * as fs from "node:fs";
import * as path from "node:path";

/** Pastas editáveis: podem ser sobrescritas por variável de ambiente (ex.: apontar para um OneDrive). */
export const KNOWLEDGE_DIR = process.env.POWERAPPS_KNOWLEDGE_DIR ?? path.join(__dirname, "..", "conhecimento");
export const TEMPLATES_DIR = process.env.POWERAPPS_TEMPLATES_DIR ?? path.join(__dirname, "..", "templates");

export interface Topic { name: string; title: string; summary: string; file: string }
interface Section { topic: string; heading: string; text: string }

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function listFiles(dir: string, ext: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => ext.some((e) => f.endsWith(e))).sort();
}

// lido a cada chamada: editar um .md reflete na hora, sem reiniciar o servidor
export function listTopics(): Topic[] {
  return listFiles(KNOWLEDGE_DIR, [".md"]).map((file) => {
    const text = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf8");
    const title = /^#\s+(.+)$/m.exec(text)?.[1]?.trim() ?? file;
    const summary = /^>\s*(.+)$/m.exec(text)?.[1]?.trim() ?? "";
    return { name: file.replace(/\.md$/, ""), title, summary, file };
  });
}

function resolveTopic(name: string): Topic {
  const topics = listTopics();
  const n = norm(name.replace(/\.md$/, ""));
  const hit = topics.find((t) => norm(t.name) === n) ?? topics.find((t) => norm(t.name).includes(n) || norm(t.title).includes(n));
  if (!hit) throw new Error(`Tópico "${name}" não encontrado. Disponíveis: ${topics.map((t) => t.name).join(", ")}`);
  return hit;
}

export function readTopic(name: string): string {
  const t = resolveTopic(name);
  return fs.readFileSync(path.join(KNOWLEDGE_DIR, t.file), "utf8");
}

function sections(): Section[] {
  const out: Section[] = [];
  for (const t of listTopics()) {
    const text = fs.readFileSync(path.join(KNOWLEDGE_DIR, t.file), "utf8");
    const parts = text.split(/^(?=##\s)/m);
    for (const part of parts) {
      const heading = /^##\s+(.+)$/m.exec(part)?.[1]?.trim() ?? t.title;
      out.push({ topic: t.name, heading, text: part.trim() });
    }
  }
  return out;
}

export function search(query: string, limit = 5): string {
  const terms = norm(query).split(/[^a-z0-9_.]+/).filter((w) => w.length >= 2);
  if (!terms.length) throw new Error("Informe ao menos um termo de busca.");
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
      if (terms.every((term) => body.includes(term))) score += 3 * terms.length;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  if (!scored.length) return `Nada encontrado para "${query}". Use listar_topicos para ver os assuntos.`;
  return scored
    .map(({ s }) => {
      const text = s.text.length > 2500 ? s.text.slice(0, 2500) + "\n…(seção truncada — use ler_topico)" : s.text;
      return `### [${s.topic}] ${s.heading}\n\n${text}`;
    })
    .join("\n\n---\n\n");
}

export function listTemplates(): { name: string; description: string }[] {
  return listFiles(TEMPLATES_DIR, [".yaml", ".yml"]).map((file) => {
    const first = fs.readFileSync(path.join(TEMPLATES_DIR, file), "utf8").split(/\r?\n/)[0];
    return { name: file.replace(/\.ya?ml$/, ""), description: first.replace(/^#\s*/, "") };
  });
}

export function readTemplate(name: string, prefix?: string): string {
  const n = norm(name.replace(/\.ya?ml$/, ""));
  const hit = listTemplates().find((t) => norm(t.name) === n) ?? listTemplates().find((t) => norm(t.name).includes(n));
  if (!hit) throw new Error(`Template "${name}" não encontrado. Disponíveis: ${listTemplates().map((t) => t.name).join(", ")}`);
  let text = fs.readFileSync(path.join(TEMPLATES_DIR, hit.name + ".yaml"), "utf8");
  // nomes de controle precisam ser únicos no app inteiro: troca o prefixo "tpl" pelo informado
  if (prefix) text = text.replace(/\btpl(?=[A-Z])/g, prefix);
  return text;
}
