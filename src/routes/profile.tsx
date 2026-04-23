import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Flame, Footprints, Pencil, Shirt, Sparkles, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCharacter, DEFAULT_DRESSUP } from "@/hooks/use-character";
import { CharacterCreator } from "@/components/character-creator";
import { DressupAvatar } from "@/components/dressup-avatar";

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
  const { character, loading, updateAppearance } = useCharacter();
  const [editing, setEditing] = useState(false);
  const [skinPick, setSkinPick] = useState(false);

  const stats = [
    { icon: Flame, label: "Day streak", value: "7" },
    { icon: Sparkles, label: "Quests done", value: "23" },
    { icon: Footprints, label: "Total km", value: "48.2" },
    { icon: Trophy, label: "Badges", value: "4" },
  ];

  const accent = character ? ACCENT_SWATCHES[character.accent] ?? ACCENT_SWATCHES.moss : ACCENT_SWATCHES.moss;
  const avatar = character?.avatar ?? "🦊";
  const name = character?.name ?? (loading ? "…" : "Wandering Fox");
  const bio = character?.bio ?? "Joined this spring";
  const dressup = character?.dressup ?? DEFAULT_DRESSUP;
  const coins = character?.coins ?? 0;

  const SKIN_TONES = ["#f7d9bd", "#f1c9a5", "#d9a87a", "#a87651", "#7a5236", "#4a3220"];
  const HAIR_COLORS = ["#1a1410", "#3b2a1a", "#7a5236", "#b88a4a", "#d9b56b", "#c95a3a", "#5a4a8a"];
  const HAIRSTYLES: Array<{ id: "short" | "long" | "bun" | "bald"; label: string }> = [
    { id: "short", label: "Short" },
    { id: "long", label: "Long" },
    { id: "bun", label: "Bun" },
    { id: "bald", label: "Bald" },
  ];

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
            Explorer
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
          aria-label="Edit character"
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
              Wardrobe
            </p>
            <h2 className="text-lg font-bold text-foreground">Your dress-up</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <Shirt className="h-3 w-3" />
            Shop clothes
          </Link>
        </div>
        <div className="mt-3 flex justify-center">
          <DressupAvatar dressup={dressup} size={180} />
        </div>

        <button
          type="button"
          onClick={() => setSkinPick((v) => !v)}
          className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
        >
          {skinPick ? "Done customizing" : "Customize skin & hair"}
        </button>

        {skinPick && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Skin
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {SKIN_TONES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Skin ${c}`}
                    onClick={() => updateAppearance({ skin: c })}
                    className={`h-8 w-8 rounded-full border-2 transition-transform active:scale-90 ${
                      dressup.skin === c ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hair color
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {HAIR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Hair ${c}`}
                    onClick={() => updateAppearance({ hair: c })}
                    className={`h-8 w-8 rounded-full border-2 transition-transform active:scale-90 ${
                      dressup.hair === c ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hairstyle
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {HAIRSTYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => updateAppearance({ hairstyle: h.id })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      dressup.hairstyle === h.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
        <h2 className="text-lg font-bold text-foreground">Recent badges</h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {["🌱 First Step", "🌸 7-day streak", "🍄 Forager", "🐦 Bird spotter"].map((b) => (
            <div
              key={b}
              className="parchment-card whitespace-nowrap px-4 py-2 text-sm font-semibold text-foreground"
            >
              {b}
            </div>
          ))}
        </div>
      </section>

      {editing && (
        <CharacterCreator
          initial={character}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
