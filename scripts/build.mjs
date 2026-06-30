import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = resolve(rootDir, "real-estate-copilot-mockup.html");
const distDir = resolve(rootDir, "dist");
const distFile = resolve(distDir, "index.html");

export async function build() {
  await mkdir(distDir, { recursive: true });
  await copyFile(sourceFile, distFile);

  const source = await readFile(sourceFile, "utf8");
  const metadata = {
    builtAt: new Date().toISOString(),
    source: "real-estate-copilot-mockup.html",
    bytes: Buffer.byteLength(source, "utf8")
  };
  await writeFile(
    resolve(distDir, "build-manifest.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8"
  );

  return { distFile, ...metadata };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await build();
  console.log(`Built ${result.source} -> dist/index.html (${result.bytes} bytes)`);
}
