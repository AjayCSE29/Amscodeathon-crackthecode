import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_BYTES = 32;
const SALT_BYTES = 16;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function b64url(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function tokenSecret() {
  const explicit = process.env.AUTH_TOKEN_SECRET;
  if (explicit && explicit.length > 0) return explicit;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRole && serviceRole.length > 0) {
    return createHash("sha256").update(`codeathon-auth\0${serviceRole}`).digest("hex");
  }
  return null;
}

export function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(password, salt, KEY_BYTES, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${b64url(salt)}$${b64url(derived)}`;
}

export function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  if (N < 2 || (N & (N - 1)) !== 0 || N > 1 << 20) return false;
  if (r < 1 || r > 32 || p < 1 || p > 16) return false;
  let salt;
  let expected;
  try {
    salt = Buffer.from(parts[4], "base64url");
    expected = Buffer.from(parts[5], "base64url");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  let derived;
  try {
    derived = scryptSync(password, salt, expected.length, {
      N,
      r,
      p,
      maxmem: SCRYPT_MAXMEM,
    });
  } catch {
    return false;
  }
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function issueToken(userId) {
  const secret = tokenSecret();
  if (!secret) throw new Error("auth token secret is not configured");
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const subject = b64url(userId);
  const signature = createHmac("sha256", secret).update(`${subject}.${expires}`).digest("base64url");
  return `${subject}.${expires}.${signature}`;
}

export function readToken(token) {
  const secret = tokenSecret();
  if (!secret) return null;
  if (typeof token !== "string") return null;
  const claims = verifySignedToken(token, secret);
  if (!claims) return null;
  if (claims.role) return null;
  return { userId: claims.sub, expires: claims.expires };
}

function adminTokenSecret() {
  const explicit = process.env.ADMIN_TOKEN_SECRET;
  if (explicit && explicit.length > 0) return explicit;
  const base = tokenSecret();
  if (!base) return null;
  return createHash("sha256").update(`codeathon-admin\0${base}`).digest("hex");
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "";
let adminPasswordHash = null;
try {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0) {
    adminPasswordHash = hashPassword(process.env.ADMIN_PASSWORD);
  }
} catch {
  adminPasswordHash = null;
}

const DUMMY_ADMIN_HASH =
  "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function adminConfigured() {
  return (
    ADMIN_USERNAME.length > 0 &&
    adminPasswordHash !== null &&
    adminTokenSecret() !== null
  );
}

export function verifyAdminLogin(username, password) {
  const valid =
    adminConfigured() &&
    username === ADMIN_USERNAME &&
    typeof password === "string" &&
    verifyPassword(password, adminPasswordHash);
  if (!valid && typeof password === "string") {
    verifyPassword(password, DUMMY_ADMIN_HASH);
  }
  return valid === true;
}

export function issueAdminToken(username) {
  const secret = adminTokenSecret();
  if (!secret) throw new Error("admin token secret is not configured");
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const subject = b64url(username);
  const signature = createHmac("sha256", secret)
    .update(`${subject}.${expires}.admin`)
    .digest("base64url");
  return `${subject}.${expires}.admin.${signature}`;
}

export function readAdminToken(token) {
  const secret = adminTokenSecret();
  if (!secret || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [subject, expiresRaw, role, signature] = parts;
  if (role !== "admin") return null;
  const expires = Number(expiresRaw);
  if (!Number.isInteger(expires) || expires * 1000 <= Date.now()) return null;
  const expected = createHmac("sha256", secret)
    .update(`${subject}.${expires}.admin`)
    .digest("base64url");
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  let username;
  try {
    username = Buffer.from(subject, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (username.length === 0 || username.length > 120) return null;
  return { username, expires };
}

function verifySignedToken(token, secret) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3 && parts.length !== 4) return null;
  const subject = parts[0];
  const expiresRaw = parts[1];
  const role = parts.length === 4 ? parts[2] : "";
  const signature = parts[parts.length - 1];
  const expires = Number(expiresRaw);
  if (!Number.isInteger(expires) || expires * 1000 <= Date.now()) return null;
  const payload = role ? `${subject}.${expires}.${role}` : `${subject}.${expires}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  let sub;
  try {
    sub = Buffer.from(subject, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (sub.length === 0 || sub.length > 64) return null;
  return { sub, expires, role: role || null };
}
