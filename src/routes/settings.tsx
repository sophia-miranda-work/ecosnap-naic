import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Mic,
  Settings as SettingsIcon,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { ADVENTURE_STYLES, type AdventureStyle } from "@/lib/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Explorer's Notebook" },
      { name: "description", content: "Adventure style, accessibility, sound, and visual preferences." },
      { property: "og:title", content: "Settings — Explorer's Notebook" },
      { property: "og:description", content: "Tune your explorer experience for accessibility and comfort." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { settings, update, setStyle, playChime, speak } = useSettings();
  const [observerGoal, setObserverGoal] = useState<number>(
    settings.observerGoalMeters || 0,
  );

  return (
    <div className="px-5 pt-8 pb-12">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/profile" })}
          aria-label="Back to profile"
          className="rounded-full border border-border bg-card p-2 text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <SettingsIcon className="h-3.5 w-3.5" />
            Preferences
          </p>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Adventure Style */}
      <Section title="Adventure Style" subtitle="Changes how quests and walks work for you.">
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
                  <p className="text-sm font-bold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                {active && (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {settings.style === "observer" && (
          <div className="mt-3 rounded-2xl border border-border bg-card p-4">
            <label
              htmlFor="observer-goal"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Custom walking goal (meters)
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Any number works — even 0. There's no minimum.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                id="observer-goal"
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
                Save
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Visual & Audio */}
      <Section title="Visual & Audio">
        <SegmentedRow
          label="Quest celebration"
          help="Switch between confetti animations and a clean static message."
          value={settings.celebrationStyle}
          options={[
            { value: "sparkly", label: "✨ Super Sparkly" },
            { value: "simple", label: "Simple" },
          ]}
          onChange={(v) => update({ celebrationStyle: v as "sparkly" | "simple" })}
        />
        <ToggleRow
          label="Sound effects"
          help="Play a chime when you complete a quest or earn coins."
          checked={settings.soundEffects}
          onChange={(v) => {
            update({ soundEffects: v });
            if (v) setTimeout(() => playChime("success"), 50);
          }}
          icon={<Volume2 className="h-4 w-4" />}
        />
      </Section>

      {/* Accessibility */}
      <Section title="Accessibility">
        <ToggleRow
          label="Read to me"
          help="Adds a 🔊 button next to quests, NPC dialogue, and fun facts."
          checked={settings.readToMe}
          onChange={(v) => {
            update({ readToMe: v });
            if (v) setTimeout(() => speak("Hello, explorer! I'll read things to you."), 100);
          }}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <ToggleRow
          label="Voice note quests"
          help="Replace the camera with a microphone — describe what you found out loud."
          checked={settings.voiceNoteQuests}
          onChange={(v) => update({ voiceNoteQuests: v })}
          icon={<Mic className="h-4 w-4" />}
        />
        <ToggleRow
          label="Auto-snap camera"
          help="A big tap-anywhere shutter banner — easier with shaky hands."
          checked={settings.autoSnap}
          onChange={(v) => update({ autoSnap: v })}
          icon={<Camera className="h-4 w-4" />}
        />
      </Section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        Settings are saved on this device.
        <br />
        <Link to="/profile" className="font-semibold text-primary hover:underline">
          Back to profile
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
