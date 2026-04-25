import { useEffect, useMemo, useState } from "react";
import { Check, Coins, Sparkles, NotebookPen } from "lucide-react";
import {
  pickDailyTasks,
  pickDailyReflection,
  todayKey,
  REFLECTION_BONUS,
  type MiniTask,
} from "@/lib/daily-extras";
import { useCharacter } from "@/hooks/use-character";

type DailyState = {
  date: string;
  done: string[]; // mini-task ids
  reflection: string;
  reflectionAwarded: boolean;
};

const STORAGE_KEY = "daily-extras-v1";

function readState(today: string): DailyState {
  if (typeof window === "undefined") {
    return { date: today, done: [], reflection: "", reflectionAwarded: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today, done: [], reflection: "", reflectionAwarded: false };
    const parsed = JSON.parse(raw) as DailyState;
    if (parsed.date !== today) {
      return { date: today, done: [], reflection: "", reflectionAwarded: false };
    }
    return parsed;
  } catch {
    return { date: today, done: [], reflection: "", reflectionAwarded: false };
  }
}

function writeState(state: DailyState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function DailyExtras({
  onCoinAward,
  indoor = false,
}: {
  onCoinAward?: (amount: number) => void;
  indoor?: boolean;
}) {
  const { character, awardCoins } = useCharacter();
  const today = todayKey();
  const tasks = useMemo(() => pickDailyTasks(new Date(), indoor), [indoor]);
  const reflection = useMemo(() => pickDailyReflection(new Date(), indoor), [indoor]);

  const [state, setState] = useState<DailyState>(() => ({
    date: today,
    done: [],
    reflection: "",
    reflectionAwarded: false,
  }));
  const [busy, setBusy] = useState<string | null>(null);

  // Hydrate from localStorage on mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    setState(readState(today));
  }, [today]);

  useEffect(() => {
    writeState(state);
  }, [state]);

  async function completeTask(t: MiniTask) {
    if (!character || state.done.includes(t.id) || busy) return;
    setBusy(t.id);
    try {
      await awardCoins(t.coins);
      setState((s) => ({ ...s, done: [...s.done, t.id] }));
      onCoinAward?.(t.coins);
    } catch {
      // silent — coin may already be awarded server-side
    } finally {
      setBusy(null);
    }
  }

  async function saveReflection() {
    if (!character || state.reflectionAwarded || state.reflection.trim().length < 3 || busy) return;
    setBusy("reflection");
    try {
      await awardCoins(REFLECTION_BONUS);
      setState((s) => ({ ...s, reflectionAwarded: true }));
      onCoinAward?.(REFLECTION_BONUS);
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  }

  const allDone = tasks.every((t) => state.done.includes(t.id));

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Today's extras</h2>
          <p className="text-xs text-muted-foreground">
            {indoor
              ? "Tiny bonus moments from right where you are. Tap when done."
              : "Tiny bonus moments from the woods. Tap when done."}
          </p>
        </div>
        {allDone && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" />
            All done!
          </span>
        )}
      </div>

      <ul className="mt-3 space-y-2">
        {tasks.map((t) => {
          const done = state.done.includes(t.id);
          const isBusy = busy === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => completeTask(t)}
                disabled={done || isBusy || !character}
                className={`parchment-card flex w-full items-center gap-3 p-3 text-left transition-transform active:scale-[0.99] ${
                  done ? "opacity-70" : ""
                } disabled:cursor-not-allowed`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-2xl ${
                    done ? "bg-primary/15" : "bg-muted"
                  }`}
                  aria-hidden
                >
                  {done ? <Check className="h-5 w-5 text-primary" /> : t.emoji}
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">
                  {t.label}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground/90 px-2 py-1 text-[10px] font-bold text-background">
                  <Coins className="h-3 w-3 text-accent" />
                  {done ? "+0" : `+${t.coins}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Reflection prompt */}
      <div className="parchment-card mt-3 p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <NotebookPen className="h-3.5 w-3.5" />
          Today's reflection
        </div>
        <p className="mt-1 text-sm font-bold text-foreground">{reflection.prompt}</p>
        <textarea
          value={state.reflection}
          onChange={(e) => setState((s) => ({ ...s, reflection: e.target.value }))}
          maxLength={240}
          rows={2}
          placeholder="A line or two — just for you."
          className="mt-2 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={state.reflectionAwarded}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {state.reflection.length}/240
          </span>
          {state.reflectionAwarded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Check className="h-3 w-3" />
              Saved · +{REFLECTION_BONUS} coins
            </span>
          ) : (
            <button
              type="button"
              onClick={saveReflection}
              disabled={state.reflection.trim().length < 3 || busy === "reflection" || !character}
              className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-background disabled:opacity-40"
            >
              <Coins className="h-3 w-3 text-accent" />
              Save · +{REFLECTION_BONUS}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
