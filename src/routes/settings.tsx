import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Leaf,
  Mic,
  Music,
  Settings as SettingsIcon,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import {
  ADVENTURE_STYLES,
  defaultMetersFor,
  type AdventureStyle,
  type TtsVoice,
} from "@/lib/settings";
import { ambienceLabel } from "@/lib/ambience";
import { LANGUAGES } from "@/lib/i18n";
import type { Language } from "@/lib/settings";
import { SEASON_META, SEASONS, getSeasonForDate, type Season } from "@/lib/seasons";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — EcoSnap" },
      { name: "description", content: "Adventure style, accessibility, sound, and visual preferences." },
      { property: "og:title", content: "Settings — EcoSnap" },
      { property: "og:description", content: "Tune your explorer experience for accessibility and comfort." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const {
    settings,
    update,
    setStyle,
    setLanguage,
    t,
    playChime,
    speak,
    startAmbience,
    stopAmbience,
    currentAmbienceKind,
  } = useSettings();
  const [observerGoal, setObserverGoal] = useState<number>(
    settings.observerGoalMeters || 0,
  );

  return (
    <div className="px-5 pt-8 pb-12">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          aria-label={t("Back to profile")}
          className="rounded-full border border-border bg-card p-2 text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <SettingsIcon className="h-3.5 w-3.5" />
            {t("Preferences")}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{t("Settings")}</h1>
        </div>
      </header>

      {/* Language */}
      <Section title={t("Language")}>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => {
            const active = settings.language === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id as Language)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition-colors ${
                  active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span className="text-2xl" aria-hidden>{l.emoji}</span>
                <span className="text-sm font-bold text-foreground">{l.native}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Adventure Style */}
      <Section title={t("Adventure Style")} subtitle={t("Changes how quests and walks work for you.")}>
        <div className="space-y-2">
          {ADVENTURE_STYLES.map((s) => {
            const active = settings.style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id as AdventureStyle)}
                aria-pressed={active}
                className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${
                  active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{t(s.name)}</p>
                  <p className="text-xs text-muted-foreground">{t(s.description)}</p>
                </div>
                {active && (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    {t("Active")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <label
            htmlFor="walking-goal"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t("Custom walking goal (meters)")}
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("Any number works — even 0. Set 0 to use this style's default")}
            ({defaultMetersFor(settings.style)} m
            {settings.style === "observer" ? " — no walking required" : ""}).
          </p>
          <div className="mt-2 flex gap-2">
            <input
              id="walking-goal"
              type="number"
              min={0}
              max={20000}
              value={observerGoal}
              onChange={(e) =>
                setObserverGoal(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => update({ observerGoalMeters: observerGoal })}
              className="rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
            >
              {t("Save")}
            </button>
          </div>
        </div>
      </Section>

      {/* Visual & Audio */}
      <Section title={t("Visual & Audio")}>
        <ToggleRow
          label={t("Seasonal mode")}
          help={t("Theme & quests follow the seasons (spring, summer, autumn, winter) automatically.")}
          checked={settings.seasonalMode}
          onChange={(v) => update({ seasonalMode: v })}
          icon={<Leaf className="h-4 w-4" />}
        />
        <div className="parchment-card p-4">
            <p className="text-sm font-bold text-foreground">
              {t("Developer testing — force season")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("Override the calendar to preview each season's theme & quests.")}
              {" "}
              {t("Today's actual season")}: {t(SEASON_META[getSeasonForDate()].label)}.
            </p>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => update({ devSeasonOverride: null })}
                aria-pressed={settings.devSeasonOverride === null}
                className={`rounded-lg px-2 py-2 text-[11px] font-bold transition-colors ${
                  settings.devSeasonOverride === null
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {t("Auto")}
              </button>
              {SEASONS.map((s) => {
                const active = settings.devSeasonOverride === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ devSeasonOverride: s as Season })}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "bg-card text-muted-foreground border border-border hover:bg-muted"
                    }`}
                  >
                    <span aria-hidden className="text-base">{SEASON_META[s].emoji}</span>
                    {t(SEASON_META[s].label)}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => update({ devHalloweenOverride: !settings.devHalloweenOverride })}
              aria-pressed={settings.devHalloweenOverride}
              className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                settings.devHalloweenOverride
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              <span aria-hidden>🎃</span>
              {t("Halloween")}
            </button>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {t("Halloween auto-activates on October 31st and overrides the seasonal theme with cobwebs and NPC costume swaps.")}
            </p>
          </div>
        <SegmentedRow
          label={t("Quest celebration")}
          help={t("Switch between confetti animations and a clean static message.")}
          value={settings.celebrationStyle}
          options={[
            { value: "sparkly", label: t("✨ Super Sparkly") },
            { value: "simple", label: t("Simple") },
          ]}
          onChange={(v) => update({ celebrationStyle: v as "sparkly" | "simple" })}
        />
        <ToggleRow
          label={t("Sound effects")}
          help={t("Play a chime when you complete a quest or earn coins.")}
          checked={settings.soundEffects}
          onChange={(v) => {
            update({ soundEffects: v });
            if (v) setTimeout(() => playChime("success"), 50);
          }}
          icon={<Volume2 className="h-4 w-4" />}
        />
        <ToggleRow
          label={t("Background music")}
          help={t("Loop a soft music track while you explore the app.")}
          checked={settings.backgroundMusic}
          onChange={(v) => update({ backgroundMusic: v })}
          icon={<Music className="h-4 w-4" />}
        />
        <ToggleRow
          label={t("Nature sounds while reflecting")}
          help={`${t("Soft, time-of-day ambience plays while you write your daily reflection.")} ${t("Right now")}: ${t(ambienceLabel(currentAmbienceKind))}.`}
          checked={settings.natureSounds}
          onChange={(v) => {
            update({ natureSounds: v });
            if (v) {
              // Preview for a few seconds so the user hears what it sounds like.
              setTimeout(() => startAmbience(), 50);
              setTimeout(() => stopAmbience(), 6000);
            } else {
              stopAmbience();
            }
          }}
          icon={<Leaf className="h-4 w-4" />}
        />
      </Section>

      {/* Accessibility */}
      <Section title={t("Accessibility")}>
        <ToggleRow
          label={t("Read to me")}
          help={t("Adds a 🔊 button next to quests, NPC dialogue, and fun facts.")}
          checked={settings.readToMe}
          onChange={(v) => {
            update({ readToMe: v });
            if (v) setTimeout(() => speak("Hello, explorer! I'll read things to you."), 100);
          }}
          icon={<Sparkles className="h-4 w-4" />}
        />
        {settings.readToMe && (
          <SegmentedRow
            label={t("Narrator voice")}
            help={t("Pick the voice flavor used to read quests aloud.")}
            value={settings.ttsVoice}
            options={[
              { value: "warm", label: t("Warm") },
              { value: "bright", label: t("Bright") },
              { value: "calm", label: t("Calm") },
              { value: "storyteller", label: t("Storyteller") },
            ]}
            onChange={(v) => {
              update({ ttsVoice: v as TtsVoice });
              setTimeout(() => speak("Hello, explorer! How does this voice sound?"), 100);
            }}
          />
        )}
        <ToggleRow
          label={t("Voice note quests")}
          help={t("Replace the camera with a microphone — describe what you found out loud.")}
          checked={settings.voiceNoteQuests}
          onChange={(v) => update({ voiceNoteQuests: v })}
          icon={<Mic className="h-4 w-4" />}
        />
        <ToggleRow
          label={t("Auto-snap camera")}
          help={t("A big tap-anywhere shutter banner — easier with shaky hands.")}
          checked={settings.autoSnap}
          onChange={(v) => update({ autoSnap: v })}
          icon={<Camera className="h-4 w-4" />}
        />
      </Section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        {t("Settings are saved on this device.")}
        <br />
        <Link to="/profile" className="font-semibold text-primary hover:underline">
          {t("Back to profile")}
        </Link>
      </p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  help,
  checked,
  onChange,
  icon,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="parchment-card flex items-start gap-3 p-4">
      {icon && (
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        {help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-background shadow-md transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SegmentedRow({
  label,
  help,
  value,
  options,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="parchment-card p-4">
      <p className="text-sm font-bold text-foreground">{label}</p>
      {help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
      <div className="mt-3 inline-flex w-full rounded-xl border border-border bg-card p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
