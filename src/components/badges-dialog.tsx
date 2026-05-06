import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BADGES, type BadgeContext } from "@/lib/badges";
import { useSettings } from "@/hooks/use-settings";
import { useJournal } from "@/hooks/use-journal";
import { useStreak } from "@/hooks/use-streak";
import { useMemo } from "react";

export function BadgesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useSettings();
  const { entries } = useJournal();
  const { streak } = useStreak();

  const ctx: BadgeContext = useMemo(
    () => ({
      entries: entries.map((e) => ({ category: e.category, created_at: e.created_at })),
      streak,
    }),
    [entries, streak],
  );

  const evaluated = useMemo(
    () =>
      BADGES.map((b) => ({ badge: b, ...b.evaluate(ctx) })).sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return b.progress - a.progress;
      }),
    [ctx],
  );

  const earnedCount = evaluated.filter((e) => e.earned).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Badges")}</DialogTitle>
          <DialogDescription>
            {t("Earned {n} of {total}").replace("{n}", String(earnedCount)).replace("{total}", String(BADGES.length))}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5">
          {evaluated.map(({ badge, earned, current, goal, progress }) => (
            <li
              key={badge.id}
              className={`flex items-start gap-3 rounded-2xl border p-3 ${
                earned
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card opacity-80"
              }`}
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${
                  earned ? "bg-primary/15" : "bg-muted grayscale"
                }`}
                aria-hidden
              >
                {badge.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">{t(badge.name)}</p>
                  {earned && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      {t("Earned")}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(badge.description)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {Math.min(current, goal)}/{goal}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}