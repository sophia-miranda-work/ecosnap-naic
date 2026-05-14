import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { QUEST_GIVERS, pickDailyGiver } from "@/lib/quest-givers";
import { useSettings } from "@/hooks/use-settings";
import { getCostumeLabel } from "@/lib/halloween";
import { getDisplayGiver } from "@/lib/winter";

export const Route = createFileRoute("/cast")({
  head: () => ({
    meta: [
      { title: "The Cast — EcoSnap" },
      { name: "description", content: "Meet the woodland quest-givers who guide your daily walks." },
      { property: "og:title", content: "The Cast — EcoSnap" },
      { property: "og:description", content: "A small storybook crew of quest-givers: a witch, an owl, a fox, a toad, and a bunny." },
    ],
  }),
  component: CastPage,
});

function CastPage() {
  const todays = pickDailyGiver();
  const { t, halloweenActive, winterActive } = useSettings();
  return (
    <div className="px-5 pt-8 pb-8">
      <header className="mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("Back home")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{t("The Cast")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("A handful of woodland friends who take turns handing out quests.")}
        </p>
      </header>

      <ul className="space-y-4">
        {QUEST_GIVERS.map((g) => {
          const isToday = g.id === todays.id;
          const display = getDisplayGiver(g.id, { halloweenActive, winterActive });
          return (
            <li key={g.id} className="parchment-card relative p-5">
              {isToday && (
                <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  {t("Today")}
                </span>
              )}
              <div className="flex items-start gap-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-muted text-4xl shadow-inner ring-2 ring-border"
                  aria-hidden
                >
                  {display.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold leading-tight text-foreground">{t(display.name)}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(display.role)}
                    {halloweenActive && getCostumeLabel(g.id, halloweenActive) && (
                      <span className="ml-1 normal-case text-primary"> · 🎃 {t(getCostumeLabel(g.id, halloweenActive)!)}</span>
                    )}
                    {!halloweenActive && display.swapLabel && (
                      <span className="ml-1 normal-case text-primary"> · ❄️ {t(display.swapLabel)}</span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    📍 {t(g.habitat)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-snug text-foreground/85">{t(g.bio)}</p>

              <blockquote className="mt-3 rounded-2xl border-l-4 border-primary bg-muted/40 px-3 py-2 text-sm italic text-foreground/80">
                "{t(g.catchphrase)}"
              </blockquote>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
