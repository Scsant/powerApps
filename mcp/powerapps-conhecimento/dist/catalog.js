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
exports.CATALOG_FILE = void 0;
exports.catalog = catalog;
exports.controlInfo = controlInfo;
exports.allowedProps = allowedProps;
exports.describeControl = describeControl;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
exports.CATALOG_FILE = process.env.POWERAPPS_CATALOG_FILE ?? path.join(__dirname, "..", "data", "controles.json");
let cache = null;
function catalog() {
    const mtime = fs.statSync(exports.CATALOG_FILE).mtimeMs;
    if (!cache || cache.mtime !== mtime)
        cache = { mtime, data: JSON.parse(fs.readFileSync(exports.CATALOG_FILE, "utf8")) };
    return cache.data;
}
function controlInfo(control) {
    return catalog().controles[control];
}
/** null = controle fora do catálogo (não dá para validar); senão, conjunto de props aceitas. */
function allowedProps(control, variant) {
    const info = controlInfo(control);
    if (!info)
        return null;
    const set = new Set([...info.props, ...catalog()._propsFilhoAutoLayout]);
    if (info.propsPorVariante) {
        const extra = variant ? info.propsPorVariante[variant] : Object.values(info.propsPorVariante).flat();
        for (const p of extra ?? [])
            set.add(p);
    }
    return { set, complete: info.completo };
}
function describeControl(name) {
    const all = catalog().controles;
    const key = Object.keys(all).find((k) => k.toLowerCase() === name.toLowerCase())
        ?? Object.keys(all).find((k) => k.toLowerCase().endsWith("/" + name.toLowerCase()))
        ?? Object.keys(all).find((k) => k.toLowerCase().includes(name.toLowerCase()));
    if (!key)
        throw new Error(`Controle "${name}" fora do catálogo. Disponíveis: ${Object.keys(all).join(", ")}`);
    const c = all[key];
    const out = [`# ${key}${c.completo ? "" : "  (lista parcial)"}`, `Família: ${c.familia ?? "?"} | Fonte: ${c.fonte ?? "?"}`];
    if (c.variantes)
        out.push(`Variant obrigatório: ${c.variantes.join(" | ")}`);
    out.push("", `Propriedades: ${c.props.join(", ")}`);
    if (c.propsPorVariante)
        for (const [v, ps] of Object.entries(c.propsPorVariante))
            out.push(`  + ${v}: ${ps.join(", ")}`);
    if (c.padroes)
        out.push("", "Padrões que pegam:", ...Object.entries(c.padroes).map(([k, v]) => `  - ${k} = ${v}`));
    if (c.filhoAutoLayout)
        out.push("", "Quando filho de GroupContainer AutoLayout:", ...Object.entries(c.filhoAutoLayout).map(([k, v]) => `  - ${k} = ${v}`));
    if (c.dicas?.length)
        out.push("", "Dicas:", ...c.dicas.map((d) => `  - ${d}`));
    return out.join("\n");
}
