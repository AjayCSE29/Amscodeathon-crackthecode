export class AuthError extends Error {}

interface LoginResponse {
  token?: string;
  role?: string;
}

async function parse<T>(response: Response): Promise<T> {
  let payload: unknown = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (response.status === 401) {
    throw new AuthError(
      (payload as { error?: string }).error ?? "Your admin session has expired.",
    );
  }
  if (!response.ok) {
    throw new Error(
      (payload as { error?: string }).error ??
        `Request failed (HTTP ${response.status}).`,
    );
  }
  return payload as T;
}

export async function adminLogin(username: string, password: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection.");
  }
  const payload = await parse<LoginResponse>(response);
  if (typeof payload.token !== "string") throw new Error("Sign-in failed.");
  return payload.token;
}

export async function apiGet<T>(token: string, path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse<T>(response);
}

export async function apiSend<T>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parse<T>(response);
}

export async function downloadExport(token: string): Promise<string> {
  const response = await fetch("/api/admin/export", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) throw new AuthError("Your admin session has expired.");
  if (!response.ok) {
    throw new Error(`Export failed (HTTP ${response.status}).`);
  }
  return response.text();
}