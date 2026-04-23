const KEY = "explorers-notebook:device-id";

/**
 * Stable per-browser ID used to scope journal entries without requiring login.
 * Generated lazily on first call and persisted in localStorage.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}