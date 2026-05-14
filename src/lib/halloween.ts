import { QUEST_GIVERS, type QuestGiver } from "./quest-givers";

type MiniTask = { id: string; emoji: string; label: string; coins: number };
type Reflection = { id: string; prompt: string };

/** True on October 31 (any year). */
export function isHalloweenDate(date: Date = new Date()): boolean {
  return date.getMonth() === 9 && date.getDate() === 31;
}

/**
 * Costume swap: each NPC dresses up as another NPC for the day.
 * Mapping is a rotation around the cast so every character gets to wear
 * — and be worn as — someone else's outfit.
 */
export const COSTUME_SWAP: Record<string, string> = {
  willow: "jack", // witch dresses as a pirate sparrow
  jack: "pip", // sailor dresses as a fox
  pip: "mossback", // fox dresses as a toad
  mossback: "clover", // toad dresses as a bunny
  clover: "professor-hoot", // bunny dresses as the owl
  "professor-hoot": "willow", // owl dresses as the witch
};

function findGiver(id: string): QuestGiver | undefined {
  return QUEST_GIVERS.find((g) => g.id === id);
}

/** The avatar emoji to render for a given giver. */
export function getDisplayAvatar(giverId: string, halloweenActive: boolean): string {
  const base = findGiver(giverId);
  if (!halloweenActive) return base?.avatar ?? "";
  const costumeId = COSTUME_SWAP[giverId];
  const costume = costumeId ? findGiver(costumeId) : undefined;
  return costume?.avatar ?? base?.avatar ?? "";
}

/** Short label like "dressed as Pip". Returns null when not in costume. */
export function getCostumeLabel(giverId: string, halloweenActive: boolean): string | null {
  if (!halloweenActive) return null;
  const costumeId = COSTUME_SWAP[giverId];
  const costume = costumeId ? findGiver(costumeId) : undefined;
  if (!costume) return null;
  return `dressed as ${costume.name.split(" ")[0]}`;
}

/** Spooky daily quest pool — replaces the regular pool on Halloween. */
export const HALLOWEEN_QUEST_POOL = [
  { emoji: "🎃", title: "Find a carved (or imagined) jack-o'-lantern", hint: "Doorsteps and windowsills do nicely." },
  { emoji: "🕸️", title: "Spot a real spider's web", hint: "Eaves, fences, hedges — best in low light." },
  { emoji: "🦇", title: "Watch the sky at dusk for a bat", hint: "Quick, fluttery silhouettes near treetops." },
  { emoji: "🌑", title: "Find the longest, spookiest shadow you can", hint: "Late afternoon sun does the trick." },
  { emoji: "🍁", title: "Collect a leaf the colour of fire", hint: "Reds, oranges, deep ambers — pick one." },
  { emoji: "🪦", title: "Notice a crooked branch shaped like a claw", hint: "Bare trees against the sky are perfect." },
  { emoji: "🐈\u200d⬛", title: "Spot a black cat (or any black animal)", hint: "Crows and ravens count too." },
  { emoji: "🌫️", title: "Find a misty, eerie patch outdoors", hint: "Low ground near water at dawn or dusk." },
  { emoji: "👻", title: "Find something pale and ghostly in nature", hint: "A white mushroom, pale bark, a bleached stone." },
  { emoji: "🦉", title: "Listen for an owl, crow, or other spooky call", hint: "Stand still near tall trees at twilight." },
  { emoji: "🕯️", title: "Notice a single warm light in a dark window", hint: "A cosy contrast to the chill outside." },
  { emoji: "🍬", title: "Spot a treat-sized something tiny and sweet", hint: "A berry, a seed pod, a curl of bark." },
] as const;

/** Spooky mini-tasks for "Today's extras" on Halloween. */
export const HALLOWEEN_MINI_TASKS: MiniTask[] = [
  { id: "hw-spooky-breath", emoji: "👻", label: "Take 3 spooky-slow breaths under a tree", coins: 3 },
  { id: "hw-shadow", emoji: "🌑", label: "Make a shadow-puppet on the ground", coins: 3 },
  { id: "hw-pumpkin-wave", emoji: "🎃", label: "Wave to a pumpkin (or any orange thing)", coins: 3 },
  { id: "hw-cobweb-spot", emoji: "🕸️", label: "Find a real cobweb without disturbing it", coins: 4 },
  { id: "hw-witchy-step", emoji: "🧙", label: "Take ten witchy tiptoe steps on the path", coins: 3 },
  { id: "hw-bat-watch", emoji: "🦇", label: "Watch the dusk sky for a full minute", coins: 4 },
  { id: "hw-leaf-fire", emoji: "🍁", label: "Carry a fire-coloured leaf with you a while", coins: 2 },
  { id: "hw-creak", emoji: "🪵", label: "Listen for one creaky, spooky sound", coins: 3 },
];

/** Spooky reflections for Halloween. */
export const HALLOWEEN_REFLECTIONS: Reflection[] = [
  { id: "hw-spook", prompt: "What's the spookiest thing you noticed today?" },
  { id: "hw-cosy", prompt: "What felt cosy in the middle of all the spooky?" },
  { id: "hw-costume", prompt: "If a tree near you wore a costume, what would it be?" },
  { id: "hw-shadow", prompt: "Describe a shadow you saw today." },
  { id: "hw-sound", prompt: "What was the eeriest sound you heard?" },
  { id: "hw-orange", prompt: "Where did you spot pumpkin-orange in nature?" },
  { id: "hw-creature", prompt: "Imagine a friendly Halloween creature you met on your walk." },
];
