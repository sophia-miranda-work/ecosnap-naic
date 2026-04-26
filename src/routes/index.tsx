import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Camera, Check, Coins, Compass, Footprints, MapPin, RefreshCw, Sparkles, X } from "lucide-react";
import { useWalkTracker } from "@/hooks/use-walk-tracker";
import { QuestCamera } from "@/components/quest-camera";
import { useJournal, type JournalEntry } from "@/hooks/use-journal";
import { useCharacter } from "@/hooks/use-character";
import { useStreak } from "@/hooks/use-streak";
import { pickDailyGiver, pickGreeting, getQuestIntro } from "@/lib/quest-givers";
import { Link } from "@tanstack/react-router";
import { DailyExtras } from "@/components/daily-extras";
import { VitaminDCard } from "@/components/vitamin-d-card";
import { useSettings } from "@/hooks/use-settings";
import { requiredMetersFor } from "@/lib/settings";
import { WINDOW_QUEST_POOL } from "@/lib/window-quests";
import { TtsButton } from "@/components/tts-button";

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
  { emoji: "🎶", title: "Hear three different birdsongs", hint: "Stand still for a minute; the choir starts up." },
  { emoji: "⚪", title: "Find something perfectly round", hint: "River pebbles, berries, beads of dew." },
  { emoji: "🕸️", title: "Spot a spider's web", hint: "Best in early light when the dew clings." },
  { emoji: "🌳", title: "Touch the bark of three different trees", hint: "Smooth, rough, papery — all count." },
  { emoji: "🌲", title: "Find a pinecone", hint: "Beneath the tall conifers along the path." },
  { emoji: "👃", title: "Smell three different plants", hint: "Crush a leaf gently between your fingers." },
  { emoji: "🦋", title: "Spot a butterfly or moth", hint: "Sunny patches of wildflowers are best." },
  { emoji: "🪨", title: "Find a stone you'd keep", hint: "One that fits nicely in your palm." },
  { emoji: "☁️", title: "Watch the clouds for one minute", hint: "Lie back. Let your eyes wander." },
  { emoji: "🔵", title: "Spot something blue in nature", hint: "Petals, feathers, dragonfly wings." },
  // Sounds & senses
  { emoji: "🍂", title: "Listen to the wind in the leaves", hint: "Stand under a big tree and close your eyes." },
  { emoji: "👃", title: "Find a smell that reminds you of childhood", hint: "Cut grass, jam, woodsmoke — anything." },
  { emoji: "💧", title: "Listen for water — a stream, a drip, a wave", hint: "Follow the sound, don't rush it." },
  { emoji: "❄️", title: "Touch something cold in nature", hint: "A river stone or a metal railing in the shade." },
  { emoji: "🌿", title: "Find something soft to touch (a moss, a petal)", hint: "On the north side of trees, often." },
  // Sky & weather
  { emoji: "☁️", title: "Spot a cloud shaped like an animal", hint: "Lie back and let your imagination roam." },
  { emoji: "🌞", title: "Find the brightest spot of sunlight", hint: "Through a clearing or between buildings." },
  { emoji: "🌅", title: "Watch a sunrise or sunset", hint: "Find a wide horizon and a few minutes." },
  { emoji: "🌙", title: "Spot the moon in daytime", hint: "Hides in the morning sky most weeks." },
  { emoji: "🌡️", title: "Notice the temperature on your skin", hint: "Sun, shade, breeze — all different." },
  { emoji: "🧘", title: "Stand still for one whole minute outside", hint: "Time it. The world will arrive." },
  // Plants & ground
  { emoji: "🟢", title: "Find three different shades of green", hint: "Compare a leaf, moss, and grass." },
  { emoji: "🌳", title: "Find a plant taller than you", hint: "Look up; trees often qualify." },
  { emoji: "🌱", title: "Find a plant smaller than your fingernail", hint: "Crouch down and squint." },
  { emoji: "🌲", title: "Find a fallen branch shaped like a letter", hint: "Y, V, and L are everywhere." },
  { emoji: "🌷", title: "Smell a flower without picking it", hint: "Lean in slowly so you don't spook the bees." },
  { emoji: "🌰", title: "Find a seed (acorn, helicopter, dandelion)", hint: "Beneath their parent plants." },
  { emoji: "💐", title: "Spot a flower you don't know the name of", hint: "Mystery is half the fun." },
  { emoji: "🟫", title: "Find ground covered in moss or lichen", hint: "Damp, shaded patches and old stones." },
  // Animals & insects
  { emoji: "🐜", title: "Spot an ant carrying something", hint: "Cracks in pavement and tree bases." },
  { emoji: "🐝", title: "Spot a bee on a flower", hint: "Sunny patches of wildflowers are best." },
  { emoji: "🐌", title: "Spot a snail or slug trail", hint: "After rain, on smooth surfaces." },
  { emoji: "🦗", title: "Hear an insect (cricket, cicada, buzz)", hint: "Tall grass and warm afternoons." },
  { emoji: "🪲", title: "Spot a worm or beetle on the ground", hint: "Lift a small flat stone and replace it gently." },
  { emoji: "🕊️", title: "Watch a bird in flight for 10 seconds", hint: "Stand still; let your eyes follow." },
  { emoji: "🐿️", title: "Spot a squirrel or rodent", hint: "Quick movement in trees or hedges." },
  // Numbers & shapes
  { emoji: "5️⃣", title: "Count five birds in one place", hint: "Parks and ponds work best." },
  { emoji: "❤️", title: "Find something heart-shaped in nature", hint: "Leaves and pebbles, often." },
  { emoji: "🌀", title: "Find a perfect spiral (shell, fern, flower)", hint: "Unfurling ferns are the easiest." },
  { emoji: "📏", title: "Find a stick exactly as long as your arm", hint: "Measure with a stretched-out arm." },
  { emoji: "🦋", title: "Spot a symmetric leaf or wing", hint: "Hold it up and check both sides." },
  // Colors
  { emoji: "🔴", title: "Find something red in nature", hint: "Berries, autumn leaves, ladybugs." },
  { emoji: "🟣", title: "Find something purple in nature", hint: "Crocus, lavender, butterfly wings." },
  { emoji: "⚪", title: "Find something white in nature", hint: "Petals, pebbles, or a feather." },
  { emoji: "🌈", title: "Spot a rainbow of mushrooms or bark colors", hint: "Different trees in a row." },
  // Reflection & rituals
  { emoji: "🌬️", title: "Take three deep breaths outside", hint: "Through the nose, slow and easy." },
  { emoji: "🌳", title: "Compliment a tree out loud", hint: "Whisper if you're shy. The tree won't mind." },
  { emoji: "👋", title: "Wave at a stranger or pet a friendly dog", hint: "A small smile is enough." },
  { emoji: "🗑️", title: "Pick up one piece of litter", hint: "Glove or stick if you'd rather." },
  { emoji: "🪑", title: "Find a quiet bench or rock to sit on", hint: "Stay long enough to settle." },
  { emoji: "🌌", title: "Find an opening in the trees and look up", hint: "Through a clearing or a gap above the path." },
  // Weather & seasons
  { emoji: "💧", title: "Find a puddle and look at the reflection", hint: "Sky, branches, your own nose." },
  { emoji: "❄️", title: "Catch a snowflake or raindrop on your hand", hint: "Open palm, patient stance." },
  { emoji: "🧊", title: "Spot a patch of frost or dew", hint: "Best in early morning, on grass or windows." },
  { emoji: "🌬️", title: "Find seeds blowing in the wind", hint: "Dandelions, maple keys, milkweed." },
  { emoji: "🪵", title: "Find a tree with peeling or interesting bark", hint: "Birch, plane, eucalyptus, sycamore." },
  { emoji: "🐦", title: "Spot two birds interacting", hint: "Squabbling, courting, or flying together." },
  { emoji: "🤫", title: "Find a place where you can hear nothing man-made", hint: "Walk a few minutes from the road." },
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
  const { settings, playChime, speak } = useSettings();
  const isObserver = settings.style === "observer";

  // Mock: stable quest for the day (later: pick by date seed + persist).
  const [questIndex, setQuestIndex] = useState(0);
  const activePool = useMemo(
    () => (isObserver ? WINDOW_QUEST_POOL : QUEST_POOL),
    [isObserver],
  );
  const safeIndex = questIndex % activePool.length;
  const quest = activePool[safeIndex];
  const { streak, welcomeBack, recordCompletion } = useStreak();

  // Today's quest-giver (rotates daily across our small cast).
  const giver = pickDailyGiver();
  const greeting = pickGreeting(giver);
  const questIntro = getQuestIntro(quest.title, giver.id);

  const [walk, setWalk] = useState<WalkState>({ phase: "idle" });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [proofEntry, setProofEntry] = useState<JournalEntry | null>(null);
  const [coinFlash, setCoinFlash] = useState<number | null>(null);
  const journal = useJournal();
  const { character } = useCharacter();
  const explorerName = character?.name?.split(" ")[0] ?? "Explorer";
  const greetingHeadline = welcomeBack ? "Welcome back," : "Good morning,";

  // Live geolocation tracking — only active during the "walking" phase.
  const tracker = useWalkTracker(walk.phase === "walking");
  // Trip distance persists after "Finish" so capture is allowed afterwards too.
  const [tripMeters, setTripMeters] = useState(0);
  useEffect(() => {
    if (walk.phase === "walking") {
      setTripMeters(tracker.distanceMeters);
    }
  }, [tracker.distanceMeters, walk.phase]);
  useEffect(() => {
    if (walk.phase === "idle") setTripMeters(0);
  }, [walk.phase]);
  const distanceKm = (walk.phase === "walking" ? tracker.distanceMeters : tripMeters) / 1000;
  const questDone = proofEntry !== null;
  const requiredMeters = requiredMetersFor(settings.style, settings.observerGoalMeters);
  const goalKm = settings.observerGoalMeters / 1000;
  const goalProgress =
    settings.observerGoalMeters > 0
      ? Math.min(1, (walk.phase === "walking" ? tracker.distanceMeters : tripMeters) / settings.observerGoalMeters)
      : 1;

  const ttsBlurb = useMemo(() => {
    const lines = [
      `${giver.name}, ${giver.role}, says: ${greeting}`,
      questIntro ? `${questIntro}` : "",
      `Today's quest: ${quest.title}. ${quest.hint}`,
    ].filter(Boolean);
    return lines.join(" ");
  }, [giver, greeting, questIntro, quest]);

  // Auto-read the quest aloud when "Read to me" is on. Triggers on first
  // mount once the blurb is ready, and again whenever the blurb changes
  // (e.g. day rolls over, mode switches). A small delay lets browser
  // SpeechSynthesis voices finish loading.
  useEffect(() => {
    if (!settings.readToMe) return;
    if (!ttsBlurb) return;
    const id = window.setTimeout(() => speak(ttsBlurb), 350);
    return () => window.clearTimeout(id);
  }, [settings.readToMe, settings.ttsVoice, ttsBlurb, speak]);

  const todayLabel = useMemo(() => {
    const d = new Date();
    const day = d.toLocaleDateString(undefined, { weekday: "long" });
    const month = d.toLocaleDateString(undefined, { month: "short" });
    return `${day} · ${month} ${d.getDate()}`.toUpperCase();
  }, []);

  return (
    <div className="px-5 pt-8">
      {/* Greeting + streak */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {todayLabel}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">{greetingHeadline}<br/>{explorerName}</h1>
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
              {giver.name} · {giver.role}
              {isObserver && (
                <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  Window quest
                </span>
              )}
            </div>

            {/* Quest-giver speech bubble */}
            <div className="mt-3 flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-3xl shadow-md ring-2 ring-primary-foreground/40"
                aria-hidden
              >
                {giver.avatar}
              </div>
              <div className="relative flex-1 rounded-2xl rounded-tl-sm bg-primary-foreground/95 p-3 text-foreground shadow-sm">
                <span
                  className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-primary-foreground/95"
                  aria-hidden
                />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {greeting}
                </p>
                {questIntro && (
                  <p className="mt-1 text-sm italic leading-snug text-foreground/80">
                    "{questIntro}"
                  </p>
                )}
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold leading-tight text-primary-foreground">
              {quest.title}
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/80">{quest.hint}</p>

            {settings.readToMe && (
              <div className="mt-3">
                <TtsButton
                  text={ttsBlurb}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground/25"
                />
              </div>
            )}

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
                  setProofEntry(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/25"
              >
                <RefreshCw className="h-3 w-3" />
                Reroll
              </span>
            </div>

            {/* Meet the cast — bottom of banner, full width so it never collides with quest text */}
            <Link
              to="/cast"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground/25"
            >
              Meet the cast
            </Link>
          </div>
        </button>
      </section>

      {/* Captured proof preview */}
      {proofEntry && (
        <section className="mt-3 parchment-card flex items-center gap-3 p-3">
          <img
            src={proofEntry.image_url}
            alt="Your sketch proof"
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Quest complete
            </p>
            <p className="text-sm font-bold text-foreground line-clamp-1">{proofEntry.title}</p>
            {proofEntry.fun_fact && (
              <>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                  ✨ {proofEntry.fun_fact}
                </p>
                {settings.readToMe && (
                  <div className="mt-1">
                    <TtsButton text={proofEntry.fun_fact} label="Read fact" />
                  </div>
                )}
              </>
            )}
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

      {/* Walk stats — hidden in Observer mode (no distance tracking) */}
      {!isObserver && (
      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="parchment-card p-4">
          <Footprints className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-bold text-foreground">{distanceKm.toFixed(2)} km</p>
          {settings.observerGoalMeters > 0 ? (
            <>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.round(goalProgress * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                of {goalKm.toFixed(2)} km goal
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {walk.phase === "walking" ? "tracking live" : "walked this trip"}
            </p>
          )}
        </div>
        <div className="parchment-card p-4">
          <Sparkles className="h-5 w-5 text-accent" />
          <p className="mt-3 text-2xl font-bold text-foreground">{questDone ? "1" : "0"} / 1</p>
          <p className="text-xs text-muted-foreground">quests today</p>
        </div>
      </section>
      )}

      {/* Start walk CTA — hidden in Observer mode */}
      {!isObserver && (
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
      )}

      {/* Daily vitamin D widget — hidden in Observer mode */}
      {!isObserver && <VitaminDCard />}

      {/* Today's bonus prompts */}
      <DailyExtras
        indoor={isObserver}
        onCoinAward={(amt) => {
          setCoinFlash(amt);
          setTimeout(() => setCoinFlash(null), 2500);
        }}
      />

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

      {/* Camera capture modal */}
      {cameraOpen && (
        <QuestCamera
          questTitle={quest.title}
          walkedMeters={walk.phase === "walking" ? tracker.distanceMeters : tripMeters}
          requiredMeters={requiredMeters}
          onClose={() => setCameraOpen(false)}
          onCapture={async ({ sketchDataUrl, category, title, funFact }) => {
            const result = await journal.addEntry({
              sketchDataUrl,
              category,
              title,
              funFact,
              questTitle: quest.title,
              questGiverId: giver.id,
              questGiverLine: questIntro ?? greeting,
            });
            setProofEntry(result.entry);
            playChime("success");
            recordCompletion();
            if (result.coinsAwarded > 0) {
              setCoinFlash(result.coinsAwarded);
              playChime("coin");
              setTimeout(() => setCoinFlash(null), 3000);
            }
            setCameraOpen(false);
          }}
        />
      )}

      {/* Coin reward toast */}
      {coinFlash !== null && (
        <div
          className="fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4"
          role="status"
        >
          <div className="parchment-card flex items-center gap-2 px-4 py-2.5">
            <Coins className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold text-foreground">
              +{coinFlash} coins from {giver.name}!
            </span>
          </div>
        </div>
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
