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
/**
 * Teste ponta a ponta: sobe o servidor como o Copilot faria (stdio), conversa via JSON-RPC
 * e confere as respostas. Uso: npm test  (ou node dist/selftest.js)
 */
const node_child_process_1 = require("node:child_process");
const path = __importStar(require("node:path"));
const readline = __importStar(require("node:readline"));
const BAD_YAML = `Screens:
  telaTeste:
    Properties:
      OnVisible: =UpdateContext({locX: 1})
    Children:
      - cRaiz:
          Control: GroupContainer
          Variant: AutoLayout
          Properties:
            LayoutDirection: =LayoutDirection.Vertical
          Children:
            - cHeader:
                Control: GroupContainer
                Variant: AutoLayout
                Properties:
                  Height: =64
            - dtData:
                Control: Classic/DatePicker
                Properties:
                  RadiusTopLeft: =6
            - cHeader:
                Control: Label
                Properties:
                  Text: =CountRows(galX.AllItems)
                  OnSelect: =Navigate(telaQueNaoExiste)
`;
async function main() {
    const server = (0, node_child_process_1.spawn)(process.execPath, [path.join(__dirname, "server.js")], { stdio: ["pipe", "pipe", "inherit"] });
    const rl = readline.createInterface({ input: server.stdout });
    const pending = new Map();
    rl.on("line", (line) => {
        const msg = JSON.parse(line);
        pending.get(msg.id)?.(msg);
    });
    let seq = 0;
    const rpc = (method, params) => new Promise((resolve) => {
        const id = ++seq;
        pending.set(id, resolve);
        server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
    const call = async (name, args = {}) => {
        const r = await rpc("tools/call", { name, arguments: args });
        return { text: r.result.content[0].text, isError: !!r.result.isError };
    };
    let failures = 0;
    const check = (label, ok, detail = "") => {
        console.log(`${ok ? "✓" : "✗"} ${label}${ok ? "" : `  ${detail.slice(0, 400)}`}`);
        if (!ok)
            failures++;
    };
    const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "selftest", version: "1" } });
    check("initialize", init.result?.serverInfo?.name === "powerapps-conhecimento" && !!init.result.instructions);
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    const list = await rpc("tools/list");
    const names = list.result.tools.map((t) => t.name);
    check(`tools/list (${names.length} tools)`, names.includes("validar_pa_yaml") && names.includes("descrever_controle"));
    const topics = await call("listar_topicos");
    check("listar_topicos", topics.text.includes("containers-autolayout"), topics.text);
    const topic = await call("ler_topico", { nome: "containers" });
    check("ler_topico (nome parcial)", topic.text.includes("FillPortions"), topic.text);
    const found = await call("buscar_conhecimento", { termo: "patch pessoa" });
    check("buscar_conhecimento", found.text.includes("Claims"), found.text);
    const ctrl = await call("descrever_controle", { nome: "DatePicker" });
    check("descrever_controle", ctrl.text.includes("SelectedDate") || ctrl.text.includes("DefaultDate"), ctrl.text);
    const bad = await call("validar_pa_yaml", { conteudo: BAD_YAML, nivel_minimo: "info" });
    for (const rule of ["R-YAML-01", "R-CONT-01", "R-PROP-01", "R-NOME-01", "R-FX-01", "R-NAV-01"]) {
        check(`validador detecta ${rule}`, bad.text.includes(rule), bad.text);
    }
    const appDir = process.argv[2];
    if (appDir) {
        const good = await call("validar_pa_yaml", { caminho: appDir, nivel_minimo: "aviso" });
        check(`app de referência sem erros (${appDir})`, /Erros: 0 \|/.test(good.text), good.text);
        console.log(good.text.split("\n").slice(0, 2).join("\n"));
    }
    const tpls = await call("listar_templates");
    check("listar_templates", tpls.text.includes("header"), tpls.text);
    const tpl = await call("obter_template", { nome: "header", prefixo: "mnu" });
    check("obter_template com prefixo", tpl.text.includes("mnuHeader") && !/\btpl[A-Z]/.test(tpl.text), tpl.text.slice(0, 300));
    if (tpl.text) {
        const v = await call("validar_pa_yaml", { conteudo: tpl.text.replace(/^#.*\n/gm, ""), nivel_minimo: "aviso" });
        check("template header passa no validador", /Erros: 0 \|/.test(v.text), v.text);
    }
    const unknown = await call("ferramenta_que_nao_existe");
    check("ferramenta inexistente vira isError", unknown.isError);
    server.stdin.end();
    console.log(failures ? `\n${failures} falha(s)` : "\nTudo certo.");
    process.exit(failures ? 1 : 0);
}
void main();
