import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "server.js");
const child = spawn(process.execPath, [serverPath], {
  stdio: ["pipe", "pipe", "inherit"],
  windowsHide: true
});

const messages = [
  { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
  { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }
];

let out = "";
child.stdout.on("data", (chunk) => {
  out += chunk.toString();
});

for (const message of messages) child.stdin.write(`${JSON.stringify(message)}\n`);
child.stdin.end();

setTimeout(() => {
  child.kill();
  const lines = out.trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const toolNames = lines.at(-1)?.result?.tools?.map((tool) => tool.name) || [];
  const expected = ["inspect_video", "get_transcript", "get_timeline", "get_frame_at", "summarize_video", "create_chat_context", "create_agent_brief"];
  const missing = expected.filter((name) => !toolNames.includes(name));
  if (missing.length) {
    console.error(`Missing tools: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log(`OK tools=${toolNames.join(",")}`);
}, 500);
