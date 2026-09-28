import { hashPassword, verifyPassword } from "./auth.mjs";

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  node server/hash-password.mjs --hash <password>",
      "  node server/hash-password.mjs --verify <password> <stored-hash>",
      "  cat roster.csv | node server/hash-password.mjs --csv",
      "",
      "  --csv reads user_id,team_name,password rows from stdin and writes",
      "  user_id,team_name,hashed_password to stdout. Passwords are never written.",
      "",
    ].join("\n"),
  );
  process.exit(2);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let buffer = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      buffer += chunk;
    });
    process.stdin.on("end", () => resolve(buffer));
    process.stdin.on("error", reject);
  });
}

async function emitCsv() {
  const input = await readStdin();
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
  if (lines.length === 0) usage();
  const header = parseCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  const expected = ["user_id", "team_name", "password"];
  if (header.join("|") !== expected.join("|")) {
    process.stderr.write(`First line must be exactly: ${expected.join(",")}\n`);
    process.exit(2);
  }
  const out = ["user_id,team_name,hashed_password"];
  for (const line of lines.slice(1)) {
    const [userId, teamName, ...rest] = parseCsvLine(line);
    const password = rest.join(",");
    if (!userId || !teamName || !password) {
      process.stderr.write(`Skipping malformed row: ${line.replaceAll(password || "", "***")}\n`);
      continue;
    }
    out.push([userId, teamName, hashPassword(password)].map(csvCell).join(","));
  }
  process.stdout.write(`${out.join("\n")}\n`);
}

const [flag, ...args] = process.argv.slice(2);

if (flag === "--hash" && args.length === 1) {
  process.stdout.write(`${hashPassword(args[0])}\n`);
} else if (flag === "--verify" && args.length === 2) {
  const ok = verifyPassword(args[0], args[1]);
  process.stdout.write(`${ok ? "match" : "MISMATCH"}\n`);
  process.exit(ok ? 0 : 1);
} else if (flag === "--csv" && args.length === 0) {
  await emitCsv();
} else {
  usage();
}
