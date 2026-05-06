import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useJournal, type JournalEntry } from "@/hooks/use-journal";
import { CATEGORIES, CATEGORY_BY_ID, type CategoryId } from "@/lib/journal-categories";
import { getGiverById } from "@/lib/quest-givers";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — EcoSnap" },
      { name: "description", content: "Your collected sketches from completed nature quests, sorted by category." },
      { property: "og:title", content: "Journal — EcoSnap" },
      { property: "og:description", content: "A Pokédex-style grid of every sketch you've collected on your walks." },
    ],
  }),
  component: JournalPage,
});

type Filter = "all" | CategoryId;

function JournalPage() {
  const { entries, loading, error } = useJournal();
  const { t } = useSettings();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<JournalEntry | null>(null);

  const counts = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const e of entries) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    return map;
  }, [entries]);

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.category === filter)),
    [entries, filter],
  );

  // Pad with empty slots so the grid keeps the cozy "collection" feel
  const TOTAL_SLOTS = 12;
  const padded = useMemo(() => {
    const slots: (JournalEntry | null)[] = visible.slice(0, TOTAL_SLOTS);
    while (slots.length < TOTAL_SLOTS) slots.push(null);
    return slots;
  }, [visible]);

  return (
    <div className="px-5 pt-8">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t("Field Records")}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{t("Your Journal")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {entries.length === 1
            ? t("{x} discovery collected", { x: entries.length })
            : t("{x} discoveries collected", { x: entries.length })}
        </p>
      </header>

      {/* Category filter row */}
      <div className="mb-4 -mx-5 overflow-x-auto px-5 pb-1">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={`${t("All")} · ${entries.length}`}
            emoji="📔"
          />
          {CATEGORIES.map((c) => {
            const n = counts.get(c.id) ?? 0;
            return (
              <FilterChip
                key={c.id}
                active={filter === c.id}
                onClick={() => setFilter(c.id)}
                label={`${t(c.label)} · ${n}`}
                emoji={c.emoji}
                dim={n === 0}
              />
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {loading && entries.length === 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-muted/60"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="parchment-card flex flex-col items-center justify-center px-6 py-10 text-center">
          <span className="text-4xl" aria-hidden>
            🌱
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">
            {filter === "all"
              ? t("Your journal is empty")
              : `${t("No")} ${t(CATEGORY_BY_ID[filter as CategoryId].label).toLowerCase()} ${t("sketches yet")}`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("Head outside, complete a quest, and snap your first proof.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {padded.map((entry, i) => (
            <button
              key={entry?.id ?? `empty-${i}`}
              type="button"
              disabled={!entry}
              onClick={() => entry && setOpen(entry)}
              className={
                entry
                  ? "parchment-card aspect-square flex flex-col overflow-hidden p-0 text-center transition-transform active:scale-95"
                  : "aspect-square flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-muted-foreground"
              }
            >
              {entry ? (
                <>
                  <div className="relative flex-1 w-full overflow-hidden">
                    <img
                      src={entry.image_url}
                      alt={entry.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-sm shadow-sm"
                      aria-hidden
                      title={CATEGORY_BY_ID[entry.category].label}
                    >
                      {CATEGORY_BY_ID[entry.category].emoji}
                    </span>
                  </div>
                  <span className="px-1 pb-1 pt-1 text-[10px] font-semibold leading-tight text-foreground line-clamp-1">
                    {entry.title}
                  </span>
                </>
              ) : (
                <span className="text-2xl opacity-40">?</span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && <EntryModal entry={open} onClose={() => setOpen(null)} t={t} />}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  emoji,
  dim,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
  dim?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : dim
            ? "border-border bg-card/50 text-muted-foreground/70"
            : "border-border bg-card text-foreground hover:bg-muted")
      }
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function EntryModal({
  entry,
  onClose,
  t,
}: {
  entry: JournalEntry;
  onClose: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const cat = CATEGORY_BY_ID[entry.category];
  const date = new Date(entry.created_at).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="parchment-card mx-4 mb-4 w-full max-w-[448px] overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={entry.title}
      >
        <div className="relative">
          <img src={entry.image_url} alt={entry.title} className="h-64 w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm hover:bg-background"
            aria-label={t("Close")}
          >
            <X className="h-4 w-4" />
          </button>
          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            <span aria-hidden>{cat.emoji}</span>
            {t(cat.label)}
          </span>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {date}
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{entry.title}</h2>
          {entry.quest_title && entry.quest_title !== entry.title && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("From quest:")} <span className="font-medium">{entry.quest_title}</span>
            </p>
          )}
          {entry.quest_giver_id && entry.quest_giver_line && (() => {
            const g = getGiverById(entry.quest_giver_id);
            if (!g) return null;
            return (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-card/60 p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-xl" aria-hidden>
                  {g.avatar}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.name} · {g.role}
                  </p>
                  <p className="mt-0.5 text-sm italic leading-snug text-foreground/85">
                    "{entry.quest_giver_line}"
                  </p>
                </div>
              </div>
            );
          })()}
          {entry.fun_fact && (
            <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {t("Did you know?")}
              </div>
              <p className="mt-1 text-sm leading-snug text-foreground">{entry.fun_fact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}