import { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useCharacter, type Character, type CharacterDraft } from "@/hooks/use-character";
import { useSettings } from "@/hooks/use-settings";

const AVATARS = [
  "🦊", "🦉", "🐿️", "🦔", "🐻", "🦌", "🐸", "🐢",
  "🦋", "🐝", "🐞", "🪶", "🍄", "🌿", "🌸", "🐉",
] as const;

const ACCENTS = [
  { id: "moss", label: "Moss", swatch: "oklch(0.42 0.07 145)" },
  { id: "leaf", label: "Leaf", swatch: "oklch(0.55 0.12 145)" },
  { id: "bloom", label: "Bloom", swatch: "oklch(0.78 0.13 25)" },
  { id: "bark", label: "Bark", swatch: "oklch(0.4 0.06 55)" },
  { id: "sky", label: "Sky", swatch: "oklch(0.65 0.1 220)" },
  { id: "sun", label: "Sun", swatch: "oklch(0.78 0.13 75)" },
] as const;

const BIO_PLACEHOLDERS = [
  "Forager of forgotten paths.",
  "Collector of mossy stones.",
  "Friend to every fern.",
  "Always chasing birdsong.",
  "Sketches before sunrise.",
];

export function CharacterCreator({
  initial,
  onClose,
  onSaved,
  dismissible = true,
}: {
  initial?: Character | null;
  onClose: () => void;
  onSaved?: (c: Character) => void;
  dismissible?: boolean;
}) {
  const { save } = useCharacter();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<CharacterDraft>({
    name: initial?.name ?? "",
    bio: initial?.bio ?? "",
    avatar: initial?.avatar ?? "🦊",
    accent: initial?.accent ?? "moss",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState(BIO_PLACEHOLDERS[0]);

  useEffect(() => {
    setPlaceholder(
      BIO_PLACEHOLDERS[Math.floor(Math.random() * BIO_PLACEHOLDERS.length)],
    );
  }, []);

  const canSave = draft.name.trim().length >= 2 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setErr(null);
    try {
      const saved = await save(draft);
      onSaved?.(saved);
      onClose();
      if (!initial) {
        navigate({ to: "/" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save your explorer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-label="Create your explorer"
    >
      <div
        className="parchment-card mx-3 mb-3 w-full max-w-[448px] max-h-[92dvh] overflow-y-auto p-6 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {initial ? t("Edit explorer") : t("New explorer")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {initial ? t("Refresh your story") : t("Begin your story")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Pick an avatar, a name, and a motto to carry on every walk.")}
            </p>
          </div>
          {dismissible && (
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

        {/* Live preview */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
            style={{
              background: `color-mix(in oklab, ${ACCENTS.find((a) => a.id === draft.accent)?.swatch ?? "var(--primary)"} 18%, var(--card))`,
              border: `1px solid color-mix(in oklab, ${ACCENTS.find((a) => a.id === draft.accent)?.swatch ?? "var(--primary)"} 40%, transparent)`,
            }}
          >
            {draft.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("Explorer")}
            </p>
            <p className="truncate text-lg font-bold text-foreground">
              {draft.name.trim() || t("Your name")}
            </p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {draft.bio.trim() || placeholder}
            </p>
          </div>
        </div>

        {/* Avatar */}
        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Avatar")}
          </legend>
          <div className="mt-2 grid grid-cols-8 gap-2">
            {AVATARS.map((a) => {
              const active = draft.avatar === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, avatar: a }))}
                  aria-pressed={active}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-transform active:scale-90 ${
                    active
                      ? "bg-primary/15 ring-2 ring-primary"
                      : "bg-muted/60 hover:bg-muted"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Accent */}
        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Accent")}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCENTS.map((c) => {
              const active = draft.accent === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, accent: c.id }))}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.swatch }}
                    aria-hidden
                  />
                  {t(c.label)}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Name */}
        <div className="mt-5">
          <label
            htmlFor="explorer-name"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t("Explorer name")}
          </label>
          <input
            id="explorer-name"
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            maxLength={40}
            placeholder={t("Wandering Fox")}
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Bio */}
        <div className="mt-4">
          <label
            htmlFor="explorer-bio"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t("Motto / bio")}
          </label>
          <textarea
            id="explorer-bio"
            value={draft.bio}
            onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
            maxLength={140}
            rows={3}
            placeholder={placeholder}
            className="mt-2 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {draft.bio.length}/140
          </p>
        </div>

        {err && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {err}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {t("Cancel")}
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
                {t("Saving…")}
              </>
            ) : initial ? (
              t("Save changes")
            ) : (
              t("Begin journey")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
