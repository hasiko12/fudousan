import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { build } from "../scripts/build.mjs";

const rootDir = resolve(import.meta.dirname, "..");
const sourcePath = resolve(rootDir, "real-estate-copilot-mockup.html");

async function readSource() {
  return readFile(sourcePath, "utf8");
}

function idsIn(html) {
  return [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
}

test("mockup has all six planned screens", async () => {
  const html = await readSource();
  const screens = [...html.matchAll(/id="screen-([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(screens.sort(), [
    "dashboard",
    "inbox",
    "lead-detail",
    "leads",
    "properties",
    "settings"
  ].sort());
});

test("important interaction targets exist without duplicate ids", async () => {
  const html = await readSource();
  const ids = idsIn(html);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual(duplicateIds, []);

  for (const requiredId of ["pasteModal", "draftCard", "draftText", "approveBtn", "staffExport"]) {
    assert.ok(ids.includes(requiredId), `${requiredId} should exist`);
  }

  const referencedIds = [...html.matchAll(/getElementById\("([^"]+)"\)/g)].map((match) => match[1]);
  const missingRefs = referencedIds.filter((id) => !ids.includes(id));
  assert.deepEqual(missingRefs, []);
});

test("AI approval and safety language are present", async () => {
  const html = await readSource();
  assert.match(html, /承認するまで顧客には送信されません/);
  assert.match(html, /承認済み・手動送信できます/);
  assert.doesNotMatch(html, /自動送信ボタン|送信済み/);
});

test("design tokens and responsive rules are present", async () => {
  const html = await readSource();
  assert.match(html, /--ai:#6B4FD8/);
  assert.match(html, /--primary:#2557C7/);
  assert.match(html, /@media\(max-width:1000px\)/);
  assert.match(html, /grid-template-columns:1fr/);
  assert.match(html, /\.conf-low/);
  assert.match(html, /\.badge-status/);
});

test("inline script parses", async () => {
  const html = await readSource();
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, "inline script should exist");
  assert.doesNotThrow(() => new Function(script));
});

test("build creates dist output", async () => {
  const result = await build();
  const builtHtml = await readFile(result.distFile, "utf8");
  assert.match(builtHtml, /不動産コパイロット 静的モックアップ/);
  assert.ok(result.bytes > 10000);
});
