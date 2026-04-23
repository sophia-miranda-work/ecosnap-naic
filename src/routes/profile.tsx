import { createFileRoute } from "@tanstack/react-router";
import { Flame, Footprints, Sparkles, Trophy } from "lucide-react";

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

function ProfilePage() {
  const stats = [
    { icon: Flame, label: "Day streak", value: "7" },
    { icon: Sparkles, label: "Quests done", value: "23" },
    { icon: Footprints, label: "Total km", value: "48.2" },
    { icon: Trophy, label: "Badges", value: "4" },
  ];

  return (
    <div className="px-5 pt-8">
      <header className="flex items-center gap-4">
        <div className="parchment-card flex h-20 w-20 items-center justify-center text-4xl">
          🦊
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Explorer
          </p>
          <h1 className="text-2xl font-bold text-foreground">Wandering Fox</h1>
          <p className="text-sm text-muted-foreground">Joined this spring</p>
        </div>
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
    </div>
  );
}