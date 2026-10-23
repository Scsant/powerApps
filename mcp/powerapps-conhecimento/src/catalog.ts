import * as fs from "node:fs";
import * as path from "node:path";

export const CATALOG_FILE = process.env.POWERAPPS_CATALOG_FILE ?? path.join(__dirname, "..", "data", "controles.json");

interface ControlInfo {
  familia?: string;
  fonte?: string;
  completo: boolean;
  variantes?: string[];
  props: string[];
  propsPorVariante?: Record<string, string[]>;
  padroes?: Record<string, string>;
  filhoAutoLayout?: Record<string, string>;
  dicas?: string[];
}
interface Catalog { _propsFilhoAutoLayout: string[]; controles: Record<string, ControlInfo> }

let cache: { mtime: number; data: Catalog } | null = null;

export function catalog(): Catalog {
  const mtime = fs.statSync(CATALOG_FILE).mtimeMs;
  if (!cache || cache.mtime !== mtime) cache = { mtime, data: JSON.parse(fs.readFileSync(CATALOG_FILE, "utf8")) };
  return cache.data;
}

export function controlInfo(control: string): ControlInfo | undefined {
  return catalog().controles[control];
}

/** null = controle fora do catálogo (não dá para validar); senão, conjunto de props aceitas. */
export function allowedProps(control: string, variant?: string): { set: Set<string>; complete: boolean } | null {
  const info = controlInfo(control);
  if (!info) return null;
  const set = new Set([...info.props, ...catalog()._propsFilhoAutoLayout]);
  if (info.propsPorVariante) {
    const extra = variant ? info.propsPorVariante[variant] : Object.values(info.propsPorVariante).flat();
    for (const p of extra ?? []) set.add(p);
  }
  return { set, complete: info.completo };
}

export function describeControl(name: string): string {
  const all = catalog().controles;
  const key = Object.keys(all).find((k) => k.toLowerCase() === name.toLowerCase())
    ?? Object.keys(all).find((k) => k.toLowerCase().endsWith("/" + name.toLowerCase()))
    ?? Object.keys(all).find((k) => k.toLowerCase().includes(name.toLowerCase()));
  if (!key) throw new Error(`Controle "${name}" fora do catálogo. Disponíveis: ${Object.keys(all).join(", ")}`);
  const c = all[key];
  const out = [`# ${key}${c.completo ? "" : "  (lista parcial)"}`, `Família: ${c.familia ?? "?"} | Fonte: ${c.fonte ?? "?"}`];
  if (c.variantes) out.push(`Variant obrigatório: ${c.variantes.join(" | ")}`);
  out.push("", `Propriedades: ${c.props.join(", ")}`);
  if (c.propsPorVariante) for (const [v, ps] of Object.entries(c.propsPorVariante)) out.push(`  + ${v}: ${ps.join(", ")}`);
  if (c.padroes) out.push("", "Padrões que pegam:", ...Object.entries(c.padroes).map(([k, v]) => `  - ${k} = ${v}`));
  if (c.filhoAutoLayout) out.push("", "Quando filho de GroupContainer AutoLayout:", ...Object.entries(c.filhoAutoLayout).map(([k, v]) => `  - ${k} = ${v}`));
  if (c.dicas?.length) out.push("", "Dicas:", ...c.dicas.map((d) => `  - ${d}`));
  return out.join("\n");
}
