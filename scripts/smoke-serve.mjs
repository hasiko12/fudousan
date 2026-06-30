import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = String(process.env.SMOKE_PORT || 4183);
const child = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: port },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true
});

let output = "";
let errorOutput = "";
child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  errorOutput += chunk.toString();
});

async function waitForServer() {
  const url = `http://127.0.0.1:${port}/`;
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 5000) {
    try {
      const response = await fetch(url);
      const body = await response.text();
      return { response, body };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`Server did not respond: ${lastError?.message || "timeout"}`);
}

try {
  const { response, body } = await waitForServer();
  assert.equal(response.status, 200);
  assert.match(body, /不動産コパイロット 静的モックアップ/);
  assert.match(body, /screen-dashboard/);
  console.log(`Smoke server ok: http://127.0.0.1:${port}/ (${body.length} chars)`);
} finally {
  child.kill();
}

if (errorOutput.trim()) {
  console.error(errorOutput.trim());
}
