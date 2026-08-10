// Static file server for public/. No dependencies, no build — the site is
// already a finished export, so there is nothing to compile, only to serve.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const port = Number(process.env.PORT) || 5173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// Resolve a request path inside root, refusing anything that escapes it.
async function locate(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const target = resolve(join(root, decoded));
  if (target !== root && !target.startsWith(root + sep)) return null;
  try {
    const info = await stat(target);
    if (info.isDirectory()) {
      const index = join(target, "index.html");
      const indexInfo = await stat(index);
      return { path: index, size: indexInfo.size };
    }
    return { path: target, size: info.size };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const hit = await locate(req.url || "/");
  if (!hit) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404 Not Found\n");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(hit.path).toLowerCase()] || "application/octet-stream",
    "content-length": hit.size,
    "cache-control": "no-store",
  });
  createReadStream(hit.path).pipe(res);
}).listen(port, () => {
  console.log(`serving ${root} on http://localhost:${port}`);
});
