export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatHMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const tz = d.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ").slice(-1)[0] ?? "";
  return `${date} • ${time} ${tz}`;
}

export function sessionIdFromSeed(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CDTHN-2026-${rand}${pad2(Date.now() % 100)}`;
}