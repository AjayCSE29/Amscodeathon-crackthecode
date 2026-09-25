export function requestFullscreen(): void {
  try {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    if (typeof el.requestFullscreen !== "function") return;
    void el.requestFullscreen().catch(() => undefined);
  } catch {
    return;
  }
}

export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.fullscreenElement);
}