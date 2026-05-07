import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Coins,
  Flame,
  NotebookPen,
  Sparkles,
  Sun,
} from "lucide-react";
import {
  pickDailyTasks,
  pickDailyReflection,
  todayKey,
  REFLECTION_BONUS,
  type MiniTask,
} from "@/lib/daily-extras";
import { useCharacter } from "@/hooks/use-character";
import { useWeatherQuest } from "@/hooks/use-weather-quest";
import type { WeatherKind } from "@/lib/weather";
import { useSettings } from "@/hooks/use-settings";
import { ambienceLabel } from "@/lib/ambience";
import { QuestCamera } from "@/components/quest-camera";
import { useJournal } from "@/hooks/use-journal";

type DailyState = {
  date: string;
  done: string[]; // mini-task ids
  reflection: string;
  reflectionAwarded: boolean;
  /** Set of completed weather-bonus quest ids (per-quest, not per-kind). */
  weatherDone?: string[];
};

const STORAGE_KEY = "daily-extras-v1";

const KIND_ICON: Record<WeatherKind, typeof Sun> = {
  sunny: Sun,
  scorching: Flame,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  foggy: CloudFog,
};

function readState(today: string): DailyState {
  const empty: DailyState = {
    date: today,
    done: [],
    reflection: "",
    reflectionAwarded: false,
    weatherDone: [],
  };
  if (typeof window === "undefined") {
    return empty;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as DailyState;
    if (parsed.date !== today) {
      return empty;
    }
    return { weatherDone: [], ...parsed };
  } catch {
    return empty;
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
  const { settings, startAmbience, stopAmbience, currentAmbienceKind, t } = useSettings();
  const today = todayKey();
  const tasks = useMemo(() => pickDailyTasks(new Date(), indoor), [indoor]);
  const reflection = useMemo(() => pickDailyReflection(new Date(), indoor), [indoor]);
  const weather = useWeatherQuest();
  const journal = useJournal();
  const [cameraTask, setCameraTask] = useState<
    | { kind: "task"; id: string; label: string; coins: number }
    | { kind: "weather"; id: string; label: string; coins: number; giverId: string }
    | null
  >(null);

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

  function openTaskCamera(task: MiniTask) {
    if (!character || state.done.includes(task.id) || busy) return;
    setCameraTask({ kind: "task", id: task.id, label: task.label, coins: task.coins });
  }

  async function saveReflection() {
    if (!character || state.reflectionAwarded || state.reflection.trim().length < 3 || busy) return;
    setBusy("reflection");
    try {
      await awardCoins(REFLECTION_BONUS);
      setState((s) => ({ ...s, reflectionAwarded: true }));
      onCoinAward?.(REFLECTION_BONUS);
      // Reflection saved — let the ambience fade out gracefully.
      stopAmbience();
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  }

  function openWeatherCamera() {
    if (!weather.ready || !character || busy) return;
    const q = weather.quest;
    if ((state.weatherDone ?? []).includes(q.id)) return;
    setCameraTask({
      kind: "weather",
      id: q.id,
      label: q.label,
      coins: q.coins,
      giverId: weather.giver.id,
    });
  }

  async function handleCameraCapture(payload: {
    sketchDataUrl: string;
    category: string;
    title: string;
    funFact: string;
  }) {
    if (!cameraTask) return;
    const giverId =
      cameraTask.kind === "weather" ? cameraTask.giverId : undefined;
    setBusy(cameraTask.kind === "weather" ? `weather:${cameraTask.id}` : cameraTask.id);
    try {
      // Save to journal (this also awards journal coins server-side).
      await journal.addEntry({
        sketchDataUrl: payload.sketchDataUrl,
        category: payload.category as never,
        title: payload.title,
        funFact: payload.funFact,
        questTitle: t(cameraTask.label),
        questGiverId: giverId ?? null,
        questGiverLine: null,
      });
      // Award the extra task's bonus coins on top.
      try {
        await awardCoins(cameraTask.coins);
      } catch {
        /* ignore */
      }
      if (cameraTask.kind === "task") {
        setState((s) => ({ ...s, done: [...s.done, cameraTask.id] }));
      } else {
        setState((s) => ({
          ...s,
          weatherDone: [...(s.weatherDone ?? []), cameraTask.id],
        }));
      }
      onCoinAward?.(cameraTask.coins);
      setCameraTask(null);
    } catch {
      /* silent — leave camera open to retry */
    } finally {
      setBusy(null);
    }
  }

  const allDone = tasks.every((t) => state.done.includes(t.id));

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("Today's extras")}</h2>
          <p className="text-xs text-muted-foreground">
            {indoor
              ? t("Tiny bonus moments from right where you are. Tap when done.")
              : t("Tiny bonus moments from the woods. Tap when done.")}
          </p>
        </div>
        {allDone && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" />
            {t("All done!")}
          </span>
        )}
      </div>

      {/* Weather-themed bonus quest, character matches the sky */}
      {weather.ready && (() => {
        const q = weather.quest;
        const g = weather.giver;
        const Icon = KIND_ICON[weather.kind];
        const done = (state.weatherDone ?? []).includes(q.id);
        const isBusy = busy === `weather:${q.id}`;
        return (
          <button
            type="button"
            onClick={openWeatherCamera}
            disabled={done || isBusy || !character}
            className={`mt-3 block w-full overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-card to-card p-4 text-left transition-transform active:scale-[0.99] ${
              done ? "opacity-70" : ""
            } disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Icon className="h-3.5 w-3.5" />
              {t(g.bonusLabel)} · {t("from")} {t(g.name)} {g.avatar}
            </div>
            <div className="mt-2 flex items-start gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-3xl"
                aria-hidden
              >
                {done ? <Check className="h-6 w-6 text-primary" /> : q.emoji}
              </span>
              <div className="flex-1">
                <p className="text-base font-bold leading-snug text-foreground">
                  {t(q.label)}
                </p>
                <p className="mt-0.5 text-xs italic text-muted-foreground">
                  "{t(q.flavor)}"
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold text-background">
                <Coins className="h-3 w-3 text-accent" />
                {done ? t("Done") : `+${q.coins}`}
              </span>
            </div>
          </button>
        );
      })()}

      <ul className="mt-3 space-y-2">
        {tasks.map((task) => {
          const done = state.done.includes(task.id);
          const isBusy = busy === task.id;
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => openTaskCamera(task)}
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
                  {done ? <Check className="h-5 w-5 text-primary" /> : task.emoji}
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">
                  {t(task.label)}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground/90 px-2 py-1 text-[10px] font-bold text-background">
                  <Coins className="h-3 w-3 text-accent" />
                  {done ? "+0" : `+${task.coins}`}
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
          {t("Today's reflection")}
        </div>
        <p className="mt-1 text-sm font-bold text-foreground">{t(reflection.prompt)}</p>
        <textarea
          value={state.reflection}
          onChange={(e) => setState((s) => ({ ...s, reflection: e.target.value }))}
          onFocus={() => startAmbience()}
          onBlur={() => stopAmbience()}
          maxLength={240}
          rows={2}
          placeholder={t("A line or two — just for you.")}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={state.reflectionAwarded}
        />
        {settings.natureSounds && !state.reflectionAwarded && (
          <p className="mt-1 text-[10px] italic text-muted-foreground">
            🌿 Tap the box to hear today's {ambienceLabel(currentAmbienceKind).toLowerCase()}.
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {state.reflection.length}/240
          </span>
          {state.reflectionAwarded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Check className="h-3 w-3" />
              {t("Saved · +{x} coins", { x: REFLECTION_BONUS })}
            </span>
          ) : (
            <button
              type="button"
              onClick={saveReflection}
              disabled={state.reflection.trim().length < 3 || busy === "reflection" || !character}
              className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-background disabled:opacity-40"
            >
              <Coins className="h-3 w-3 text-accent" />
              {t("Save · +{x}", { x: REFLECTION_BONUS })}
            </button>
          )}
        </div>
      </div>

      {cameraTask && (
        <QuestCamera
          questTitle={t(cameraTask.label)}
          walkedMeters={1}
          requiredMeters={0}
          onClose={() => setCameraTask(null)}
          onCapture={handleCameraCapture}
        />
      )}
    </section>
  );
}
