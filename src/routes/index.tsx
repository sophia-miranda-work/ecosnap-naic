import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Camera, Check, Compass, Footprints, MapPin, RefreshCw, Sparkles, X } from "lucide-react";
import { useWalkTracker } from "@/hooks/use-walk-tracker";
import { QuestCamera } from "@/components/quest-camera";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Explorer's Notebook" },
      { name: "description", content: "Your daily nature quest awaits. Log your mood, head outside, and collect a sketch." },
      { property: "og:title", content: "Today — Explorer's Notebook" },
      { property: "og:description", content: "A new nature-themed adventure every day. Walk, wonder, and sketch." },
    ],
  }),
  component: Index,
});

const QUEST_POOL = [
  { emoji: "🌸", title: "Find a flower with 5 petals", hint: "Look low along garden walls and meadows." },
  { emoji: "🍃", title: "Spot a uniquely shaped leaf", hint: "Hearts, stars, or hands — anything but oval." },
  { emoji: "🐦", title: "Spot a yellow bird", hint: "Listen first; they often sing before they show." },
  { emoji: "🪶", title: "Find a fallen feather", hint: "Edges of paths and under tall trees." },
  { emoji: "🍄", title: "Discover a mushroom", hint: "Damp shaded spots after recent rain." },
] as const;

const MOODS = [
  { value: "sad", emoji: "☹️", label: "Low" },
  { value: "meh", emoji: "😐", label: "Okay" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "great", emoji: "😄", label: "Great" },
] as const;

type WalkState =
  | { phase: "idle" }
  | { phase: "premood" }
  | { phase: "walking"; startMood: string }
  | { phase: "postmood"; startMood: string }
  | { phase: "done"; startMood: string; endMood: string };

function Index() {
  // Mock: stable quest for the day (later: pick by date seed + persist).
  const [questIndex, setQuestIndex] = useState(0);
  const quest = QUEST_POOL[questIndex];
  const streak = 7;

  const [walk, setWalk] = useState<WalkState>({ phase: "idle" });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [proofSketch, setProofSketch] = useState<string | null>(null);

  // Live geolocation tracking — only active during the "walking" phase.
  const tracker = useWalkTracker(walk.phase === "walking");
  const distanceKm = tracker.distanceMeters / 1000;
  const questDone = proofSketch !== null;

  return (
    <div className="px-5 pt-8">
      {/* Greeting + streak */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Wednesday · Apr 23
          </p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">Good morning,<br/>Explorer</h1>
        </div>
        <div className="parchment-card flex flex-col items-center px-3 py-2 text-center">
          <span className="text-2xl leading-none" aria-hidden>🌸</span>
          <span className="mt-1 text-lg font-bold leading-none text-foreground">{streak}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            day streak
          </span>
        </div>
      </header>

      {/* Daily Quest card */}
      <section className="mt-6">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          aria-label={`Capture proof for: ${quest.title}`}
          className="quest-card group relative block w-full overflow-hidden p-6 text-left transition-transform active:scale-[0.99]"
        >
          <div className="absolute -right-6 -top-6 text-[8rem] opacity-20 select-none" aria-hidden>
            {quest.emoji}
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              <Compass className="h-3.5 w-3.5" />
              Today's Quest
            </div>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-primary-foreground">
              {quest.title}
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/80">{quest.hint}</p>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                {questDone ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Sketch saved
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5" />
                    Tap to capture proof
                  </>
                )}
              </span>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuestIndex((i) => (i + 1) % QUEST_POOL.length);
                  setProofSketch(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/25"
              >
                <RefreshCw className="h-3 w-3" />
                Reroll
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* Captured proof preview */}
      {proofSketch && (
        <section className="mt-3 parchment-card flex items-center gap-3 p-3">
          <img
            src={proofSketch}
            alt="Your sketch proof"
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Quest complete
            </p>
            <p className="text-sm font-bold text-foreground line-clamp-1">{quest.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted/70"
          >
            Retake
          </button>
        </section>
      )}

      {/* Walk stats */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="parchment-card p-4">
          <Footprints className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-bold text-foreground">{distanceKm.toFixed(2)} km</p>
          <p className="text-xs text-muted-foreground">
            {walk.phase === "walking" ? "tracking live" : "walked this trip"}
          </p>
        </div>
        <div className="parchment-card p-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="mt-3 text-2xl font-bold text-foreground">0 / 1</p>
          <p className="text-xs text-muted-foreground">quests today</p>
        </div>
      </section>

      {/* Start walk CTA */}
      <section className="mt-6">
        <button
          type="button"
          onClick={() => setWalk({ phase: "premood" })}
          className="group flex w-full items-center justify-between rounded-2xl bg-foreground px-6 py-4 text-background shadow-[0_8px_24px_-12px_oklch(0.3_0.05_60_/_0.4)] transition-transform active:scale-[0.98]"
        >
          <span className="text-left">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
              Ready when you are
            </span>
            <span className="block text-lg font-bold">Start your walk</span>
          </span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </section>

      {/* Walking-in-progress preview banner */}
      {walk.phase === "walking" && (
        <section className="mt-4 parchment-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Walk in progress
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {distanceKm.toFixed(2)} km · {tracker.points} pts
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {tracker.status === "requesting" && "Waiting for GPS…"}
                {tracker.status === "tracking" && "GPS locked · have fun out there 🍃"}
                {tracker.status === "denied" &&
                  "Location denied — distance won't be tracked."}
                {tracker.status === "unavailable" &&
                  "Geolocation unavailable in this browser."}
                {tracker.status === "error" &&
                  (tracker.error ?? "Couldn't read location.")}
                {tracker.status === "idle" && "Starting GPS…"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWalk({ phase: "postmood", startMood: walk.startMood })}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Finish
            </button>
          </div>
        </section>
      )}

      {walk.phase === "done" && (
        <section className="mt-4 parchment-card p-4 text-center">
          <p className="text-3xl">🌿</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nice walk! You went from{" "}
            <span className="font-semibold text-foreground">
              {MOODS.find((m) => m.value === walk.startMood)?.emoji}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {MOODS.find((m) => m.value === walk.endMood)?.emoji}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setWalk({ phase: "idle" })}
            className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary"
          >
            Done
          </button>
        </section>
      )}

      {/* Mood modals */}
      {(walk.phase === "premood" || walk.phase === "postmood") && (
        <MoodSheet
          title={walk.phase === "premood" ? "How are you feeling?" : "How do you feel now?"}
          subtitle={
            walk.phase === "premood"
              ? "Log your mood before heading out."
              : "A quick check-in before we wrap up."
          }
          onClose={() => setWalk({ phase: "idle" })}
          onPick={(mood) => {
            if (walk.phase === "premood") {
              setWalk({ phase: "walking", startMood: mood });
            } else if (walk.phase === "postmood") {
              setWalk({ phase: "done", startMood: walk.startMood, endMood: mood });
            }
          }}
        />
      )}
    </div>
  );
}

function MoodSheet({
  title,
  subtitle,
  onClose,
  onPick,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  onPick: (mood: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="parchment-card mx-4 mb-4 w-full max-w-[448px] p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onPick(m.value)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 transition-transform active:scale-95 hover:bg-accent/30"
            >
              <span className="text-3xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
