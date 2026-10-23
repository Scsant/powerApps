#!/usr/bin/env node
/**
 * MCP "powerapps-conhecimento" — servidor stdio sem dependências.
 * Implementa o subconjunto do protocolo MCP (JSON-RPC 2.0, mensagens delimitadas por \n)
 * que clientes como GitHub Copilot (VS Code), Claude Code e Cursor usam: initialize, tools/*, ping.
 */
import * as readline from "node:readline";
import { TOOLS, callTool } from "./tools";
import { INSTRUCTIONS } from "./instructions";

const SERVER_INFO = { name: "powerapps-conhecimento", version: "1.0.0" };
const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];

type Id = string | number | null;
interface Request { jsonrpc: "2.0"; id?: Id; method: string; params?: any }

function send(msg: object): void {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function reply(id: Id, result: object): void {
  send({ jsonrpc: "2.0", id, result });
}

function fail(id: Id, code: number, message: string): void {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

// stdout é o canal do protocolo: qualquer log vai para stderr
function log(...args: unknown[]): void {
  process.stderr.write("[powerapps-conhecimento] " + args.map(String).join(" ") + "\n");
}

async function handle(req: Request): Promise<void> {
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
          instructions: INSTRUCTIONS,
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
        reply(id, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
        return;
      case "tools/call": {
        const { name, arguments: args } = req.params ?? {};
        try {
          const text = await callTool(name, args ?? {});
          reply(id, { content: [{ type: "text", text }] });
        } catch (e) {
          // erro de ferramenta volta como resultado (isError) para o agente poder se corrigir
          reply(id, { content: [{ type: "text", text: `Erro: ${(e as Error).message}` }], isError: true });
        }
        return;
      }
      default:
        if (!isNotification) fail(id, -32601, `Método não suportado: ${req.method}`);
    }
  } catch (e) {
    log("falha ao tratar", req.method, (e as Error).stack ?? e);
    if (!isNotification) fail(id, -32603, (e as Error).message);
  }
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg: Request;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    fail(null, -32700, "JSON inválido");
    return;
  }
  void handle(msg);
});
rl.on("close", () => process.exit(0));
log(`iniciado (node ${process.version})`);
