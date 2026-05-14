// A small pool of bonus prompts for the home "Today's extras" board.
// We pick 3 mini-tasks and 1 reflection deterministically from the date
// so the same items appear all day. Completion lives in localStorage.

import { HALLOWEEN_MINI_TASKS, HALLOWEEN_REFLECTIONS } from "./halloween";

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

/** Indoor / window-friendly bonus tasks for The Observer mode. */
export const INDOOR_MINI_TASKS: MiniTask[] = [
  { id: "in-deep-breaths", emoji: "🌬️", label: "Take 3 slow deep breaths by a window", coins: 3 },
  { id: "in-stretch", emoji: "🤸", label: "Stretch your arms toward the ceiling", coins: 2 },
  { id: "in-water", emoji: "💧", label: "Sip a full glass of water", coins: 2 },
  { id: "in-sunlight", emoji: "🌞", label: "Sit in a patch of sunlight for a minute", coins: 3 },
  { id: "in-listen", emoji: "👂", label: "Close your eyes and listen for 30 seconds", coins: 3 },
  { id: "in-cloud", emoji: "☁️", label: "Watch the sky from your window", coins: 2 },
  { id: "in-plant", emoji: "🪴", label: "Say hi to a houseplant (or imagine one)", coins: 2 },
  { id: "in-tidy", emoji: "🧺", label: "Tidy one tiny corner near you", coins: 3 },
  { id: "in-hand-warm", emoji: "🤲", label: "Rub palms together until warm", coins: 2 },
  { id: "in-shoulders", emoji: "💆", label: "Roll your shoulders back five times", coins: 2 },
  { id: "in-window-color", emoji: "🌈", label: "Spot 3 colors out the window", coins: 3 },
  { id: "in-tea", emoji: "🍵", label: "Make a warm drink and savor a sip", coins: 3 },
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

/** Indoor reflections for Observer mode. */
export const INDOOR_REFLECTIONS: Reflection[] = [
  { id: "in-noticed", prompt: "What's one small thing you noticed in your room today?" },
  { id: "in-grateful", prompt: "Name one cozy thing you're grateful for right now." },
  { id: "in-window", prompt: "What did you see out your window today?" },
  { id: "in-sound", prompt: "Describe a sound from inside or just outside." },
  { id: "in-feeling", prompt: "How does your body feel right now?" },
  { id: "in-light", prompt: "What does the light look like in your space?" },
  { id: "in-tiny", prompt: "What's the tiniest detail near you right now?" },
  { id: "in-kind", prompt: "How could you be kind to yourself today?" },
  { id: "in-comfort", prompt: "What's the most comforting thing within reach?" },
  { id: "in-wonder", prompt: "What made you smile, even a little?" },
];

export const REFLECTION_BONUS = 5;

function seedFromDate(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** Picks 3 distinct mini-tasks for today, deterministic by date. */
export function pickDailyTasks(date = new Date(), indoor = false, halloween = false): MiniTask[] {
  const seed = seedFromDate(date);
  const pool = halloween
    ? HALLOWEEN_MINI_TASKS
    : indoor
      ? INDOOR_MINI_TASKS
      : MINI_TASKS;
  const out: MiniTask[] = [];
  const used = new Set<number>();
  let i = 0;
  while (out.length < 3 && used.size < pool.length) {
    const idx = (seed + i * 7) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx]);
    }
    i++;
  }
  return out;
}

export function pickDailyReflection(date = new Date(), indoor = false, halloween = false): Reflection {
  const seed = seedFromDate(date);
  const pool = halloween
    ? HALLOWEEN_REFLECTIONS
    : indoor
      ? INDOOR_REFLECTIONS
      : REFLECTIONS;
  return pool[seed % pool.length];
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
