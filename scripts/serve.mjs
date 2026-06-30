import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const useSource = process.argv.includes("--source");
const baseDir = useSource ? rootDir : resolve(rootDir, "dist");
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml"
};

function isInsideBase(filePath) {
  const rel = normalize(filePath).replace(baseDir, "");
  return !rel.startsWith(`..${sep}`) && rel !== "..";
}

async function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const fallback = useSource ? "real-estate-copilot-mockup.html" : "index.html";
  const relativePath = cleanPath === "/" ? fallback : cleanPath.replace(/^\/+/, "");
  const filePath = resolve(join(baseDir, relativePath));
  if (!isInsideBase(filePath)) return null;
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) return null;
  return filePath;
}

const server = createServer(async (req, res) => {
  try {
    const filePath = await resolveRequestPath(req.url || "/");
    if (!filePath) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(`Server error: ${error.message}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  const mode = useSource ? "source" : "dist";
  console.log(`Serving ${mode} at http://127.0.0.1:${port}`);
});
