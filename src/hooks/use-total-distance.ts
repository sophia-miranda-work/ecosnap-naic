import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "explorer-total-distance:v1";

function read(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseFloat(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Persistent lifetime walking distance (in meters), summed across every walk.
 */
export function useTotalDistance() {
  const [meters, setMeters] = useState<number>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMeters(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addMeters = useCallback((delta: number) => {
    if (!Number.isFinite(delta) || delta <= 0) return;
    setMeters((prev) => {
      const next = prev + delta;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  return { meters, km: meters / 1000, addMeters };
}