import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { ADVENTURE_STYLES, type AdventureStyle } from "@/lib/settings";
import { useSettings } from "@/hooks/use-settings";

type Props = {
  /** When true, renders without a backdrop / dismiss button (inline use). */
  inline?: boolean;
  onClose?: () => void;
  onSaved?: (style: AdventureStyle) => void;
  dismissible?: boolean;
  title?: string;
  subtitle?: string;
};

export function AdventureStylePicker({
  inline = false,
  onClose,
  onSaved,
  dismissible = true,
  title = "Choose your Adventure Style",
  subtitle = "Pick the one that fits you best — you can change this anytime in Settings.",
}: Props) {
  const { settings, setStyle, update } = useSettings();
  const [picked, setPicked] = useState<AdventureStyle | null>(settings.style);
  const [observerGoal, setObserverGoal] = useState<number>(
    settings.observerGoalMeters || 200,
  );
  const [saving, setSaving] = useState(false);

  const canSave = picked !== null && !saving;

  function handleSave() {
    if (!picked) return;
    setSaving(true);
    if (picked === "observer") {
      update({ style: "observer", observerGoalMeters: Math.max(0, observerGoal) });
    } else {
      setStyle(picked);
    }
    onSaved?.(picked);
    onClose?.();
    setSaving(false);
  }

  const card = (
    <div className="parchment-card mx-3 mb-3 w-full max-w-[448px] max-h-[92dvh] overflow-y-auto p-6 sm:mb-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Adventure Style
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {dismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {ADVENTURE_STYLES.map((s) => {
          const active = picked === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setPicked(s.id)}
                aria-pressed={active}
                className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span className="text-3xl leading-none" aria-hidden>
                  {s.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-foreground">{s.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {s.tagline}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {picked === "observer" && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <label
            htmlFor="observer-goal"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Daily walking goal (meters)
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Set anything you like — even 0. There's no minimum.
          </p>
          <input
            id="observer-goal"
            type="number"
            min={0}
            max={20000}
            value={observerGoal}
            onChange={(e) => setObserverGoal(Math.max(0, Number(e.target.value) || 0))}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      <div className="mt-5 flex gap-2">
        {dismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Begin adventure"
          )}
        </button>
      </div>
    </div>
  );

  if (inline) return card;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-label="Choose your adventure style"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
        {card}
      </div>
    </div>
  );
}
