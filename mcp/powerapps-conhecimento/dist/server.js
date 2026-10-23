#!/usr/bin/env node
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
 * MCP "powerapps-conhecimento" — servidor stdio sem dependências.
 * Implementa o subconjunto do protocolo MCP (JSON-RPC 2.0, mensagens delimitadas por \n)
 * que clientes como GitHub Copilot (VS Code), Claude Code e Cursor usam: initialize, tools/*, ping.
 */
const readline = __importStar(require("node:readline"));
const tools_1 = require("./tools");
const instructions_1 = require("./instructions");
const SERVER_INFO = { name: "powerapps-conhecimento", version: "1.0.0" };
const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];
function send(msg) {
    process.stdout.write(JSON.stringify(msg) + "\n");
}
function reply(id, result) {
    send({ jsonrpc: "2.0", id, result });
}
function fail(id, code, message) {
    send({ jsonrpc: "2.0", id, error: { code, message } });
}
// stdout é o canal do protocolo: qualquer log vai para stderr
function log(...args) {
    process.stderr.write("[powerapps-conhecimento] " + args.map(String).join(" ") + "\n");
}
async function handle(req) {
    const isNotification = req.id === undefined;
    const id = req.id ?? null;
    try {
        switch (req.method) {
            case "initialize": {
                const asked = req.params?.protocolVersion;
                reply(id, {
                    protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
                    capabilities: { tools: { listChanged: false } },
                    serverInfo: SERVER_INFO,
                    instructions: instructions_1.INSTRUCTIONS,
                });
                return;
            }
            case "notifications/initialized":
            case "notifications/cancelled":
                return;
            case "ping":
                reply(id, {});
                return;
            case "tools/list":
                reply(id, { tools: tools_1.TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
                return;
            case "tools/call": {
                const { name, arguments: args } = req.params ?? {};
                try {
                    const text = await (0, tools_1.callTool)(name, args ?? {});
                    reply(id, { content: [{ type: "text", text }] });
                }
                catch (e) {
                    // erro de ferramenta volta como resultado (isError) para o agente poder se corrigir
                    reply(id, { content: [{ type: "text", text: `Erro: ${e.message}` }], isError: true });
                }
                return;
            }
            default:
                if (!isNotification)
                    fail(id, -32601, `Método não suportado: ${req.method}`);
        }
    }
    catch (e) {
        log("falha ao tratar", req.method, e.stack ?? e);
        if (!isNotification)
            fail(id, -32603, e.message);
    }
}
const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed)
        return;
    let msg;
    try {
        msg = JSON.parse(trimmed);
    }
    catch {
        fail(null, -32700, "JSON inválido");
        return;
    }
    void handle(msg);
});
rl.on("close", () => process.exit(0));
log(`iniciado (node ${process.version})`);
