import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Explorer's Notebook" },
      { name: "description", content: "Your collected sketches from completed nature quests." },
      { property: "og:title", content: "Journal — Explorer's Notebook" },
      { property: "og:description", content: "A Pokédex-style grid of every sketch you've collected on your walks." },
    ],
  }),
  component: JournalPage,
});

// Mocked entries — sketches will be wired up once camera is implemented.
const MOCK_ENTRIES = [
  { id: 1, emoji: "🌸", title: "Five-petal flower", date: "Apr 22" },
  { id: 2, emoji: "🍂", title: "Heart-shaped leaf", date: "Apr 21" },
  { id: 3, emoji: "🐦", title: "Yellow bird", date: "Apr 20" },
  { id: 4, emoji: "🪨", title: "Smooth river stone", date: "Apr 19" },
  { id: 5, emoji: "🍄", title: "Tiny mushroom", date: "Apr 18" },
  { id: 6, emoji: "🌿", title: "Fern frond", date: "Apr 17" },
];
const TOTAL_SLOTS = 12;

function JournalPage() {
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => MOCK_ENTRIES[i] ?? null);

  return (
    <div className="px-5 pt-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Field Records
        </p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Your Journal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {MOCK_ENTRIES.length} of {TOTAL_SLOTS} discoveries this month
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {slots.map((entry, i) => (
          <div
            key={i}
            className={
              entry
                ? "parchment-card aspect-square flex flex-col items-center justify-center p-2 text-center"
                : "aspect-square flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-muted-foreground"
            }
          >
            {entry ? (
              <>
                <span className="text-3xl" aria-hidden>
                  {entry.emoji}
                </span>
                <span className="mt-1 text-[10px] font-semibold leading-tight text-foreground line-clamp-2">
                  {entry.title}
                </span>
                <span className="text-[9px] text-muted-foreground">{entry.date}</span>
              </>
            ) : (
              <span className="text-2xl opacity-40">?</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}