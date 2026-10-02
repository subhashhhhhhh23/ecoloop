// Minimal local dev server: serves the static app on :3000 and mounts the
// Vercel-style handler from scan.js at POST /api/scan (same path the app calls).
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import scanHandler from "./scan.js";

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT) || 3000;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  // Express-like helpers used by the Vercel handler in scan.js
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(obj));
    return res;
  };

  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);

  if (pathname === "/api/scan") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8");
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    try {
      return await scanHandler(req, res);
    } catch (err) {
      console.error("Scan failed:", err);
      return res.status(500).json({ error: "Could not read the scan result" });
    }
  }

  const rel = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = normalize(join(ROOT, rel));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    return res.status(403).end("Forbidden");
  }
  try {
    const body = await readFile(file);
    res.setHeader("Content-Type", MIME[extname(file)] || "application/octet-stream");
    res.end(body);
  } catch {
    res.status(404).end("Not found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`SortWise dev server on http://0.0.0.0:${PORT}`);
});
