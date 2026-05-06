import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Check, Clock, Sparkles } from "lucide-react";
import { useQuests, type QuestStatus } from "@/hooks/use-quests";
import {
  TIER_META,
  daysUntilRotation,
  type QuestTier,
} from "@/lib/quests";
import { useCharacter } from "@/hooks/use-character";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Quests — Explorer's Notebook" },
      { name: "description", content: "Bronze, Silver and Gold nature quests with coin rewards. New quests every week, big challenges every month." },
      { property: "og:title", content: "Quests — Explorer's Notebook" },
      { property: "og:description", content: "Take on weekly Bronze and Silver quests, and stretch into a monthly Gold challenge." },
    ],
  }),
  component: QuestsPage,
});

function QuestsPage() {
  const { statuses, loading, claim } = useQuests();
  const { character } = useCharacter();
  const { t } = useSettings();
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  async function handleClaim(s: QuestStatus) {
    setBusy(s.quest.id);
    setFlash(null);
    try {
      const res = await claim(s.quest);
      if (res.alreadyClaimed) {
        setFlash({ kind: "ok", msg: t("Already claimed earlier — nice work!") });
      } else {
        setFlash({ kind: "ok", msg: `${t("+{x} coins!", { x: s.reward })} ${TIER_META[s.quest.tier].emoji}` });
      }
    } catch (e) {
      setFlash({ kind: "err", msg: e instanceof Error ? e.message : t("Couldn't claim that.") });
    } finally {
      setBusy(null);
      setTimeout(() => setFlash(null), 2400);
    }
  }

  const tiers: QuestTier[] = ["bronze", "silver", "gold"];

  return (
    <div className="px-5 pt-8 pb-8">
      <header className="parchment-card relative overflow-hidden p-5">
        <div className="absolute -right-4 -top-4 text-[7rem] opacity-10 select-none" aria-hidden>
          🗺️
        </div>
        <div className="relative flex items-start gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-card text-4xl shadow-inner ring-2 ring-border"
            aria-hidden
          >
            📜
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("The Quest Board")}
            </p>
            <h1 className="text-2xl font-bold text-foreground">{t("Quests")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Bronze & Silver rotate weekly. Gold takes a whole month.")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-background shadow-sm">
            <Coins className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold tabular-nums">{character?.coins ?? 0}</span>
          </div>
        </div>
      </header>

      {flash && (
        <div
          className={`mt-3 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
            flash.kind === "ok" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}
          role="status"
        >
          {flash.msg}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">{t("Loading the board…")}</p>
      ) : (
        <div className="mt-6 space-y-7">
          {tiers.map((tier) => {
            const meta = TIER_META[tier];
            const list = statuses[tier];
            const days = daysUntilRotation(meta.rotation);
            return (
              <section key={tier} aria-labelledby={`tier-${tier}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h2
                    id={`tier-${tier}`}
                    className="flex items-center gap-2 text-lg font-bold text-foreground"
                  >
                    <span aria-hidden>{meta.emoji}</span>
                    {t(`${meta.label} Quests`)}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {meta.rotation === "monthly"
                      ? t("New month in {x}d", { x: days })
                      : t("New batch in {x}d", { x: days })}
                  </span>
                </div>
                <ul className="mt-3 space-y-3">
                  {list.map((s) => (
                    <QuestCard
                      key={s.quest.id}
                      status={s}
                      busy={busy === s.quest.id}
                      onClaim={() => handleClaim(s)}
                      t={t}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {t("Sketch matching subjects in your journal to make progress. 🌿")}
      </p>
    </div>
  );
}

function QuestCard({
  status,
  busy,
  onClaim,
  t,
}: {
  status: QuestStatus;
  busy: boolean;
  onClaim: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const { quest, progress, goal, reward, claimed, ready } = status;
  const meta = TIER_META[quest.tier];
  const pct = Math.min(100, Math.round((progress / goal) * 100));

  return (
    <li className={`parchment-card p-4 ring-2 ${meta.ring}`}>
      <div className="flex items-start gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-2xl"
          aria-hidden
        >
          {quest.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold leading-tight text-foreground">{t(quest.title)}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
              <span aria-hidden>{meta.emoji}</span>
              {t(meta.label)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t(quest.description)}</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums text-foreground">
              {progress}/{goal}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
              <Coins className="h-3.5 w-3.5 text-accent" />
              {t("{x} coins", { x: reward })}
            </span>
            {claimed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary">
                <Check className="h-3.5 w-3.5" />
                {t("Claimed")}
              </span>
            ) : ready ? (
              <button
                type="button"
                onClick={onClaim}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-bold text-background transition-transform active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("Claim")}
              </button>
            ) : (
              <span className="text-[11px] font-medium text-muted-foreground">
                {t("Sketch {x} more", { x: goal - progress })}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}