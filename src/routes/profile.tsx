import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Flame, Footprints, Pencil, Settings as SettingsIcon, Shirt, Sparkles, Trophy } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCharacter, DEFAULT_DRESSUP } from "@/hooks/use-character";
import { CharacterCreator } from "@/components/character-creator";
import { DressupAvatar } from "@/components/dressup-avatar";
import { CharacterCustomizer } from "@/components/character-customizer";

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
  const [editing, setEditing] = useState(false);
  const [customizing, setCustomizing] = useState(false);

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

      {/* Wardrobe — owned clothing items */}
      <section className="parchment-card mt-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Closet
            </p>
            <h2 className="text-lg font-bold text-foreground">Your wardrobe</h2>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
            {wardrobe.length} {wardrobe.length === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {wardrobe.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your closet is empty. Visit{" "}
              <Link to="/shop" className="font-semibold text-primary underline-offset-2 hover:underline">
                Björn's shop
              </Link>{" "}
              to pick up something cozy.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {SLOT_ORDER.map((slot) => {
              const items = wardrobe.filter((i) => i.slot === slot);
              if (items.length === 0) return null;
              const equippedId = dressup[slot];
              return (
                <div key={slot}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {SLOT_LABELS[slot]}
                  </p>
                  <ul className="mt-1.5 grid grid-cols-4 gap-2">
                    {items.map((item) => {
                      const isEquipped = equippedId === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => equipItem(slot, isEquipped ? null : item.id)}
                            aria-pressed={isEquipped}
                            title={isEquipped ? `Take off ${item.name}` : `Wear ${item.name}`}
                            className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2 text-center transition-transform active:scale-95 ${
                              isEquipped
                                ? "border-foreground bg-primary/15 ring-1 ring-primary"
                                : "border-border bg-card hover:bg-muted"
                            }`}
                          >
                            <span
                              className="grid aspect-square w-full place-items-center rounded-lg text-2xl"
                              style={{
                                background: item.color
                                  ? `color-mix(in oklab, ${item.color} 30%, var(--card))`
                                  : "var(--muted)",
                              }}
                              aria-hidden
                            >
                              {item.emoji}
                            </span>
                            <span className="line-clamp-1 text-[10px] font-semibold text-foreground">
                              {item.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
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
              <span className="block text-sm font-bold">Settings</span>
              <span className="block text-xs text-muted-foreground">
                Adventure style, accessibility, sound
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
    </div>
  );
}
