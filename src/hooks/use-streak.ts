import { useCallback, useEffect, useState } from "react";

/**
 * Local streak tracker.
 *
 * Rules:
 * - Increments by 1 the first time a quest is completed on a new day.
 * - Multiple completions on the same day do not increment further.
 * - If the user skips one or more days, the streak is preserved (NOT reset).
 *   The next time they return after a gap, `welcomeBack` is true until they
 *   complete a quest that day (which increments the streak).
 */

const STORAGE_KEY = "explorer-streak:v1";

type StreakState = {
  count: number;
  /** ISO date (YYYY-MM-DD) of the last quest completion, or null. */
  lastCompletedDate: string | null;
};

const DEFAULT_STATE: StreakState = { count: 0, lastCompletedDate: null };

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readState(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      lastCompletedDate:
        typeof parsed.lastCompletedDate === "string" ? parsed.lastCompletedDate : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(s: StreakState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function useStreak() {
  const [state, setState] = useState<StreakState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setHydrated(true);
  }, []);

  /** Call when the user completes a quest. Idempotent for the same day. */
  const recordCompletion = useCallback(() => {
    setState((prev) => {
      const today = todayKey();
      if (prev.lastCompletedDate === today) return prev;
      const next: StreakState = {
        count: prev.count + 1,
        lastCompletedDate: today,
      };
      writeState(next);
      return next;
    });
  }, []);

  const today = todayKey();
  const completedToday = state.lastCompletedDate === today;
  // "Welcome back" when the user has an existing streak but hasn't completed
  // a quest today AND last completion was before today (i.e. they skipped at
  // least one day, or it's just a new day).
  const welcomeBack =
    hydrated &&
    state.count > 0 &&
    !completedToday &&
    state.lastCompletedDate !== null &&
    state.lastCompletedDate !== today;

  return {
    streak: state.count,
    completedToday,
    welcomeBack,
    hydrated,
    recordCompletion,
  };
}