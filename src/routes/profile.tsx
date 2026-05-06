import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Flame, Footprints, Pencil, Settings as SettingsIcon, Shirt, Sparkles, Trophy } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCharacter, DEFAULT_DRESSUP } from "@/hooks/use-character";
import { CharacterCreator } from "@/components/character-creator";
import { DressupAvatar } from "@/components/dressup-avatar";
import { CharacterCustomizer } from "@/components/character-customizer";
import { useSettings } from "@/hooks/use-settings";
import { BadgesDialog } from "@/components/badges-dialog";
import { BADGES, type BadgeContext } from "@/lib/badges";
import { useJournal } from "@/hooks/use-journal";
import { useStreak } from "@/hooks/use-streak";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Explorer's Notebook" },
      { name: "description", content: "Your explorer stats, streak, and achievements." },
      { property: "og:title", content: "Profile — Explorer's Notebook" },
      { property: "og:description", content: "Track your streak, total distance, and quests completed." },
    ],
  }),
  component: ProfilePage,
});

const ACCENT_SWATCHES: Record<string, string> = {
  moss: "oklch(0.42 0.07 145)",
  leaf: "oklch(0.55 0.12 145)",
  bloom: "oklch(0.78 0.13 25)",
  bark: "oklch(0.4 0.06 55)",
  sky: "oklch(0.65 0.1 220)",
  sun: "oklch(0.78 0.13 75)",
};

function ProfilePage() {
  const navigate = useNavigate();
  const { character, loading } = useCharacter();
  const { t } = useSettings();
  const [editing, setEditing] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const { entries } = useJournal();
  const { streak } = useStreak();

  const badgeCtx: BadgeContext = {
    entries: entries.map((e) => ({ category: e.category, created_at: e.created_at })),
    streak,
  };
  const earnedBadges = BADGES.map((b) => ({ badge: b, ...b.evaluate(badgeCtx) })).filter(
    (e) => e.earned,
  );

  const stats = [
    { icon: Flame, label: t("Day streak"), value: String(streak) },
    { icon: Sparkles, label: t("Quests done"), value: "23" },
    { icon: Footprints, label: t("Total km"), value: "48.2" },
    { icon: Trophy, label: t("Badges"), value: String(earnedBadges.length) },
  ];

  const accent = character ? ACCENT_SWATCHES[character.accent] ?? ACCENT_SWATCHES.moss : ACCENT_SWATCHES.moss;
  const avatar = character?.avatar ?? "🦊";
  const name = character?.name ?? (loading ? "…" : t("Wandering Fox"));
  const bio = character?.bio ?? "Joined this spring";
  const dressup = character?.dressup ?? DEFAULT_DRESSUP;
  const coins = character?.coins ?? 0;

  return (
    <div className="px-5 pt-8">
      <header className="flex items-start gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl"
          style={{
            background: `color-mix(in oklab, ${accent} 18%, var(--card))`,
            border: `1px solid color-mix(in oklab, ${accent} 40%, transparent)`,
          }}
        >
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Explorer")}
          </p>
          <h1 className="truncate text-2xl font-bold text-foreground">{name}</h1>
          <p className="line-clamp-2 text-sm text-muted-foreground">{bio}</p>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2.5 py-0.5 text-xs font-bold text-background">
            <Coins className="h-3 w-3 text-accent" />
            <span className="tabular-nums">{coins}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t("Edit explorer")}
          className="rounded-full border border-border bg-card p-2 text-foreground hover:bg-muted"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </header>

      <div className="ink-divider my-6" />

      {/* Dress-up avatar */}
      <section className="parchment-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("Wardrobe")}
            </p>
            <h2 className="text-lg font-bold text-foreground">{t("Your dress-up")}</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <Shirt className="h-3 w-3" />
            {t("Shop clothes")}
          </Link>
        </div>
        <div className="mt-3 flex justify-center">
          <DressupAvatar dressup={dressup} size={180} />
        </div>

        <button
          type="button"
          onClick={() => setCustomizing(true)}
          className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          {t("Customize character")}
        </button>
      </section>

      <div className="ink-divider my-6" />

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="parchment-card p-4">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t("Recent badges")}</h2>
          <button
            type="button"
            onClick={() => setBadgesOpen(true)}
            className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
          >
            {t("View all")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setBadgesOpen(true)}
          className="mt-3 flex w-full gap-3 overflow-x-auto pb-2 text-left"
        >
          {earnedBadges.length === 0 ? (
            <div className="parchment-card flex-1 px-4 py-3 text-sm text-muted-foreground">
              {t("No badges yet — start sketching to earn your first one!")}
            </div>
          ) : (
            earnedBadges.slice(0, 6).map(({ badge }) => (
              <div
                key={badge.id}
                className="parchment-card whitespace-nowrap px-4 py-2 text-sm font-semibold text-foreground"
              >
                {badge.emoji} {t(badge.name)}
              </div>
            ))
          )}
        </button>
      </section>

      {/* Settings entry */}
      <section className="mt-8">
        <Link
          to="/settings"
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">{t("Settings")}</span>
              <span className="block text-xs text-muted-foreground">
                {t("Adventure style, accessibility, sound")}
              </span>
            </span>
          </span>
          <span aria-hidden className="text-xl text-muted-foreground">›</span>
        </Link>
      </section>

      {editing && (
        <CharacterCreator
          initial={character}
          onClose={() => setEditing(false)}
          onSaved={() => navigate({ to: "/" })}
        />
      )}

      {customizing && <CharacterCustomizer onClose={() => setCustomizing(false)} />}

      <BadgesDialog open={badgesOpen} onClose={() => setBadgesOpen(false)} />
    </div>
  );
}
