import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, RefreshCw, Sun, Sparkles } from "lucide-react";
import {
  AGE_GROUPS,
  CLOTHING_OPTIONS,
  SKIN_TYPES,
  type AgeGroup,
  type Clothing,
  type SkinType,
  calcVitaminDMinutes,
  fetchCurrentUV,
  getCurrentCoords,
} from "@/lib/vitamin-d";
import { useCharacter } from "@/hooks/use-character";
import { useSettings } from "@/hooks/use-settings";

/**
 * Daily Vitamin D card.
 * - First use: prompts user to pick skin/age/clothing (saved to profile).
 * - Returning use: reads saved profile, asks only sunscreen, fetches UV, shows minutes.
 */
export function VitaminDCard() {
  const { character, saveSunProfile } = useCharacter();
  const { t } = useSettings();
  const [editing, setEditing] = useState(false);

  // Form state for first-time setup / edit
  const [skin, setSkin] = useState<SkinType>(character?.skin_type ?? 3);
  const [age, setAge] = useState<AgeGroup>(character?.age_group ?? "adult");
  const [clothing, setClothing] = useState<Clothing>(character?.clothing ?? "shorts_tee");

  // Sunscreen toggle (per-check, not persisted)
  const [sunscreen, setSunscreen] = useState(false);

  // UV + location state
  const [uv, setUv] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form when character loads
  useEffect(() => {
    if (character?.skin_type) setSkin(character.skin_type);
    if (character?.age_group) setAge(character.age_group);
    if (character?.clothing) setClothing(character.clothing);
  }, [character?.skin_type, character?.age_group, character?.clothing]);

  const hasProfile = Boolean(
    character?.skin_type && character?.age_group && character?.clothing,
  );

  const fetchUV = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentCoords();
      const value = await fetchCurrentUV(coords.lat, coords.lon);
      setUv(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't fetch UV.");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAndCheck = async () => {
    try {
      await saveSunProfile({ skin, age, clothing });
      setEditing(false);
      await fetchUV();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save profile.");
    }
  };

  // First-time setup form
  if (!hasProfile || editing) {
    return (
      <section className="parchment-card mt-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 text-accent">
            <Sun className="h-6 w-6" />
          </span>
          <h3 className="text-base font-bold text-foreground">{t("Sun check setup")}</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("Tell us a bit about you so we can suggest how long to walk for your daily vitamin D.")}
        </p>

        {/* Skin type */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Skin type (Fitzpatrick)")}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {SKIN_TYPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSkin(s.value)}
                className={`rounded-xl border px-2 py-2 text-left transition-colors ${
                  skin === s.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-muted"
                }`}
                title={s.desc}
              >
                <span className="block text-sm font-bold text-foreground">{s.label}</span>
                <span className="block text-[10px] leading-tight text-muted-foreground line-clamp-2">
                  {s.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Age group")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {AGE_GROUPS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAge(a.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  age === a.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clothing */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("What you usually wear outside")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {CLOTHING_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setClothing(c.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  clothing === c.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={saveAndCheck}
            disabled={!character}
            className="flex-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {t("Save & check sun")}
          </button>
          {hasProfile && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-2xl bg-muted px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              {t("Cancel")}
            </button>
          )}
        </div>
        {!character && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t("Create your character first to save your sun profile.")}
          </p>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </section>
    );
  }

  // Result view
  const result =
    uv !== null && character?.skin_type && character?.age_group && character?.clothing
      ? calcVitaminDMinutes({
          skin: character.skin_type,
          age: character.age_group,
          clothing: character.clothing,
          sunscreen,
          uvIndex: uv,
        })
      : null;

  return (
    <section className="parchment-card mt-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 text-accent shadow-sm">
            <Sun className="h-6 w-6 animate-pulse" />
          </span>
          <h3 className="text-base font-bold text-foreground">{t("Vitamin D Tracker")}</h3>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted/70"
        >
          {t("Edit profile")}
        </button>
      </div>

      {/* Sunscreen toggle */}
      <label className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
        <span className="text-sm font-semibold text-foreground">{t("Wearing sunscreen?")}</span>
        <input
          type="checkbox"
          checked={sunscreen}
          onChange={(e) => setSunscreen(e.target.checked)}
          className="h-5 w-5 accent-primary"
        />
      </label>

      {/* CTA / result */}
      {!uv && !loading && !error && (
        <button
          type="button"
          onClick={fetchUV}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-bold text-background"
        >
          <MapPin className="h-4 w-4" />
          {t("Check sun where I am")}
        </button>
      )}

      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("Reading the sky…")}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
          <button
            type="button"
            onClick={fetchUV}
            className="ml-2 inline-flex items-center gap-1 text-foreground underline"
          >
            <RefreshCw className="h-3 w-3" /> {t("Retry")}
          </button>
        </div>
      )}

      {result && uv !== null && (
        <div className="mt-3 rounded-2xl bg-accent/15 p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            UV {uv.toFixed(1)} · {result.uvLabel.replace("-", " ")}
          </div>
          {result.minutes !== null ? (
            <p className="mt-1 text-2xl font-bold text-foreground">
              {t("{x} min outside", { x: result.minutes })}
            </p>
          ) : (
            <p className="mt-1 text-base font-bold text-foreground">{t("No sun D right now")}</p>
          )}
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.message}</p>
          <button
            type="button"
            onClick={fetchUV}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary"
          >
            <RefreshCw className="h-3 w-3" />
            {t("Recheck")}
          </button>
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        {t("Friendly estimate, not medical advice. UV data: open-meteo.com.")}
      </p>
    </section>
  );
}