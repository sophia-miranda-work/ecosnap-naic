import { useState } from "react";
import { Languages, X } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { LANGUAGES } from "@/lib/i18n";
import type { Language } from "@/lib/settings";

type Props = {
  onClose?: () => void;
  onSaved?: (lang: Language) => void;
  dismissible?: boolean;
};

export function LanguagePicker({ onClose, onSaved, dismissible = true }: Props) {
  const { settings, setLanguage, t } = useSettings();
  const [picked, setPicked] = useState<Language>(settings.language ?? "en");

  function handleSave() {
    setLanguage(picked);
    onSaved?.(picked);
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-label={t("Choose your language")}
    >
      <div
        className="parchment-card mx-3 mb-3 w-full max-w-[448px] p-6 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Languages className="h-3.5 w-3.5" />
              {t("Language")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {t("Choose your language")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("You can change this anytime in Settings.")}
            </p>
          </div>
          {dismissible && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label={t("Close")}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-2">
          {LANGUAGES.map((l) => {
            const active = picked === l.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setPicked(l.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <span className="text-3xl" aria-hidden>{l.emoji}</span>
                  <span className="flex-1 text-base font-bold text-foreground">
                    {l.native}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform active:scale-[0.98]"
        >
          {t("Continue")}
        </button>
      </div>
    </div>
  );
}