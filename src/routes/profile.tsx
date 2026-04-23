import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Footprints, Pencil, Sparkles, Trophy } from "lucide-react";
import { useCharacter } from "@/hooks/use-character";
import { CharacterCreator } from "@/components/character-creator";

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
  const { character, loading } = useCharacter();
  const [editing, setEditing] = useState(false);

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
