// A small pool of bonus prompts for the home "Today's extras" board.
// We pick 3 mini-tasks and 1 reflection deterministically from the date
// so the same items appear all day. Completion lives in localStorage.

export type MiniTask = { id: string; emoji: string; label: string; coins: number };
export type Reflection = { id: string; prompt: string };

export const MINI_TASKS: MiniTask[] = [
  { id: "deep-breaths", emoji: "🌬️", label: "Take 3 deep breaths outside", coins: 3 },
  { id: "wave-dog", emoji: "🐶", label: "Wave at a dog (or its human)", coins: 3 },
  { id: "stretch", emoji: "🤸", label: "Stretch toward the sky", coins: 2 },
  { id: "smile-stranger", emoji: "🙂", label: "Smile at a stranger", coins: 3 },
  { id: "drink-water", emoji: "💧", label: "Sip some water", coins: 2 },
  { id: "tree-thanks", emoji: "🌳", label: "Thank a tree silently", coins: 3 },
  { id: "barefoot", emoji: "🦶", label: "Stand barefoot on grass for 10s", coins: 4 },
  { id: "stand-sun", emoji: "🌞", label: "Stand in a patch of sunlight", coins: 2 },
  { id: "listen-30s", emoji: "👂", label: "Close eyes and listen for 30s", coins: 3 },
  { id: "skip-step", emoji: "🦘", label: "Skip a few steps on the path", coins: 3 },
  { id: "name-cloud", emoji: "☁️", label: "Name a cloud out loud", coins: 2 },
  { id: "leaf-pocket", emoji: "🍃", label: "Carry a leaf with you a while", coins: 2 },
];

export const REFLECTIONS: Reflection[] = [
  { id: "noticed", prompt: "What's one thing you noticed today?" },
  { id: "grateful", prompt: "Name one small thing you're grateful for." },
  { id: "color", prompt: "What color stood out the most outside?" },
  { id: "sound", prompt: "Describe a sound from your walk." },
  { id: "feeling", prompt: "How did your body feel after walking?" },
  { id: "smell", prompt: "What was the most unexpected smell today?" },
  { id: "tiny", prompt: "What was the tiniest thing you saw?" },
  { id: "kind", prompt: "Where could you be kinder tomorrow?" },
  { id: "season", prompt: "What told you what season it is right now?" },
  { id: "wonder", prompt: "What's something that made you pause?" },
];

export const REFLECTION_BONUS = 5;

function seedFromDate(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** Picks 3 distinct mini-tasks for today, deterministic by date. */
export function pickDailyTasks(date = new Date()): MiniTask[] {
  const seed = seedFromDate(date);
  const out: MiniTask[] = [];
  const used = new Set<number>();
  let i = 0;
  while (out.length < 3 && used.size < MINI_TASKS.length) {
    const idx = (seed + i * 7) % MINI_TASKS.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(MINI_TASKS[idx]);
    }
    i++;
  }
  return out;
}

export function pickDailyReflection(date = new Date()): Reflection {
  const seed = seedFromDate(date);
  return REFLECTIONS[seed % REFLECTIONS.length];
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
