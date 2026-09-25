import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");

const PORT = Number(process.env.PORT ?? 8787);
const PISTON_URL = (process.env.PISTON_URL ?? "http://127.0.0.1:2000").replace(
  /\/+$/,
  "",
);
const RUN_TIMEOUT_MS = Number(process.env.RUN_TIMEOUT_MS ?? 10_000);
const QUEUE_TIMEOUT_MS = Number(process.env.QUEUE_TIMEOUT_MS ?? 30_000);
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY ?? 8);
const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 30);
const MAX_CODE_BYTES = Number(process.env.MAX_CODE_BYTES ?? 64 * 1024);
const MAX_STDIN_BYTES = Number(process.env.MAX_STDIN_BYTES ?? 16 * 1024);
const BODY_LIMIT_BYTES = Number(process.env.BODY_LIMIT_BYTES ?? 192 * 1024);

const LANGUAGE_MAP = {
  "C++": { piston: "c++", file: "solution.cpp" },
  Python: { piston: "python", file: "solution.py" },
  Java: { piston: "java", file: "Main.java" },
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

const queue = [];
const inflight = new Set();
const rateHits = new Map();

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let done = false;
    const finish = (err, buf) => {
      if (done) return;
      done = true;
      if (err) reject(err);
      else resolve(buf);
    };
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        finish(new Error("request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => finish(null, Buffer.concat(chunks)));
    req.on("error", finish);
  });
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

function rateLimited(ip) {
  const now = Date.now();
  const hits = (rateHits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (hits.length >= RATE_LIMIT_PER_MIN) {
    rateHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateHits.set(ip, hits);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of rateHits) {
    const next = hits.filter((t) => now - t < 60_000);
    if (next.length === 0) rateHits.delete(ip);
    else rateHits.set(ip, next);
  }
}, 60_000).unref();

function scrubPaths(text) {
  return text.replace(/\/tmp\/[^\s/]+\//g, "");
}

async function callPiston(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RUN_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: payload.piston,
        version: "*",
        files: [{ name: payload.file, content: payload.code }],
        stdin: payload.stdin,
      }),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new Error(`Execution timed out after ${RUN_TIMEOUT_MS}ms.`);
    }
    throw new Error(`Execution service unreachable (${PISTON_URL}).`);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw new Error(`Execution service returned HTTP ${response.status}.`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  const run = data.run ?? {};
  const compile = data.compile ?? {};
  const compileFailed =
    typeof compile.code === "number" && compile.code !== 0;
  const exitCode =
    typeof run.code === "number"
      ? run.code
      : compileFailed
        ? compile.code
        : null;
  let stdout = "";
  let stderr = "";
  if (compileFailed) {
    stderr = String(compile.stderr ?? compile.stdout ?? "");
  } else {
    stdout = String(run.stdout ?? "");
    stderr = String(run.stderr ?? "");
  }
  return {
    stdout: scrubPaths(stdout),
    stderr: scrubPaths(stderr),
    exitCode,
  };
}

function executeJob(job) {
  return callPiston(job.payload).then(
    (result) => json(job.res, 200, result),
    (err) =>
      json(job.res, 200, {
        stdout: "",
        stderr: err instanceof Error ? err.message : "Execution failed.",
        exitCode: null,
      }),
  );
}

function pump() {
  while (inflight.size < MAX_CONCURRENCY && queue.length > 0) {
    const job = queue.shift();
    if (Date.now() - job.createdAt > QUEUE_TIMEOUT_MS) {
      json(job.res, 200, {
        stdout: "",
        stderr: "Execution request timed out while queued.",
        exitCode: null,
      });
      continue;
    }
    inflight.add(job);
    void executeJob(job).finally(() => {
      inflight.delete(job);
      pump();
    });
  }
}

async function handleRun(req, res) {
  let buffer;
  try {
    buffer = await readBody(req, BODY_LIMIT_BYTES);
  } catch (err) {
    json(res, 413, { error: err instanceof Error ? err.message : "Request too large." });
    return;
  }
  let payload;
  try {
    payload = JSON.parse(buffer.toString("utf8"));
  } catch {
    json(res, 400, { error: "Invalid JSON body." });
    return;
  }
  const mapping = LANGUAGE_MAP[payload?.language];
  if (!mapping) {
    json(res, 400, { error: "Unsupported language." });
    return;
  }
  if (typeof payload.code !== "string" || payload.code.length === 0) {
    json(res, 400, { error: "code must be a non-empty string." });
    return;
  }
  if (Buffer.byteLength(payload.code, "utf8") > MAX_CODE_BYTES) {
    json(res, 400, { error: `code exceeds the ${MAX_CODE_BYTES} byte limit.` });
    return;
  }
  const stdin = typeof payload.stdin === "string" ? payload.stdin : "";
  if (Buffer.byteLength(stdin, "utf8") > MAX_STDIN_BYTES) {
    json(res, 400, { error: `stdin exceeds the ${MAX_STDIN_BYTES} byte limit.` });
    return;
  }
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    json(res, 429, { error: "Too many executions. Please wait a moment." });
    return;
  }
  queue.push({
    createdAt: Date.now(),
    res,
    payload: { ...mapping, code: payload.code, stdin },
  });
  pump();
}

async function serveStatic(res, pathname) {
  const relative =
    pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const filePath = normalize(join(DIST_DIR, relative));
  if (!filePath.startsWith(normalize(DIST_DIR))) {
    json(res, 403, { error: "Forbidden." });
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    const content = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
    });
    res.end(content);
    return;
  } catch {
    try {
      const fallback = await readFile(join(DIST_DIR, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fallback);
    } catch {
      json(res, 503, {
        error: "Frontend build not found. Run `npm run build` before using the production server.",
      });
    }
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method === "POST" && pathname === "/api/run") {
    await handleRun(req, res);
    return;
  }
  if (req.method === "GET" && pathname === "/api/health") {
    json(res, 200, { ok: true, piston: PISTON_URL });
    return;
  }
  if (req.method === "GET") {
    await serveStatic(res, pathname);
    return;
  }
  json(res, 404, { error: "Not found." });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Codeathon server listening on 0.0.0.0:${PORT}`);
  console.log(`Piston target: ${PISTON_URL}`);
});