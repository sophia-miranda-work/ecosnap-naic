export type QuestGiver = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accent: string; // tailwind-friendly bg utility for the bubble tail
  greetings: string[];
  bio: string;
  habitat: string;
  catchphrase: string;
};

/**
 * Small cast of woodland quest-givers. One is picked per day (deterministic
 * by date) so the same character greets the explorer all day.
 */
export const QUEST_GIVERS: QuestGiver[] = [
  {
    id: "willow",
    name: "Willow",
    role: "the Hedge Witch",
    avatar: "🧙‍♀️",
    accent: "bg-primary-foreground",
    greetings: [
      "Ah, there you are, dear explorer.",
      "The wind whispered you'd come today.",
      "I brewed you a quest with the morning dew.",
      "My broom and I have been waiting.",
    ],
    bio: "Willow keeps a tidy cottage at the edge of the bramble. She brews tea from things most people step over, and believes every walk is a small spell waiting to be cast.",
    habitat: "Hedgerows & herb gardens",
    catchphrase: "Bring me a wonder; I'll trade you a story.",
  },
  {
    id: "professor-hoot",
    name: "Professor Hoot",
    role: "the Owl Sage",
    avatar: "🦉",
    accent: "bg-primary-foreground",
    greetings: [
      "Ahem. Today's field assignment, if you please.",
      "Knowledge favors the curious foot.",
      "I have a riddle wrapped in a walk for you.",
      "Open your notebook — class is in session.",
    ],
    bio: "A retired lecturer of Applied Wandering. Professor Hoot grades on curiosity, not correctness, and keeps detailed notes on every cloud he's ever met.",
    habitat: "Old oaks & quiet libraries",
    catchphrase: "Look twice. Then look once more.",
  },
  {
    id: "pip",
    name: "Pip",
    role: "the Fox Scout",
    avatar: "🦊",
    accent: "bg-primary-foreground",
    greetings: [
      "Psst! Quick — before the trail wakes up.",
      "I sniffed out something worth finding.",
      "Tail high, eyes sharp, off we go!",
      "Bet you can't spot it before I would.",
    ],
    bio: "Fastest paws in the meadow, loudest grin in the woods. Pip scouts trails before sunrise and leaves tiny pawprints next to anything worth seeing.",
    habitat: "Tall grass & forest edges",
    catchphrase: "Race you to the next bend!",
  },
  {
    id: "mossback",
    name: "Mossback",
    role: "the Old Toad",
    avatar: "🐸",
    accent: "bg-primary-foreground",
    greetings: [
      "Slow down. Look closer. There — yes.",
      "The pond and I have a request.",
      "Patience is half the quest, friend.",
      "Hop along when you're ready.",
    ],
    bio: "Mossback has sat on the same lily pad for longer than anyone remembers. He measures time in ripples and considers a good blink to be a full conversation.",
    habitat: "Ponds & damp stones",
    catchphrase: "Stillness is its own adventure.",
  },
  {
    id: "clover",
    name: "Clover",
    role: "the Meadow Bunny",
    avatar: "🐰",
    accent: "bg-primary-foreground",
    greetings: [
      "Good morning, good morning, good morning!",
      "I found the loveliest thing — go see!",
      "Hop hop! Adventure's calling.",
      "Bring me back a story, won't you?",
    ],
    bio: "Clover greets every dawn like it's her birthday. She collects four-leafed clovers, tiny pebbles, and even tinier rumors from the wildflowers.",
    habitat: "Sunny meadows & garden paths",
    catchphrase: "Today's the loveliest day yet!",
  },
];

/** Deterministic daily pick so the giver is stable across reloads. */
export function pickDailyGiver(date = new Date()): QuestGiver {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return QUEST_GIVERS[seed % QUEST_GIVERS.length];
}

/** Per-quest custom intro lines, keyed by quest title. */
export const QUEST_INTROS: Record<string, string> = {
  "Find a flower with 5 petals":
    "Five petals, five little wishes — bring me one and we'll spend them well.",
  "Spot a uniquely shaped leaf":
    "Ovals are for ordinary days. Find me a leaf shaped like a secret.",
  "Spot a yellow bird":
    "Listen for a song the color of sunshine. Then look up.",
  "Find a fallen feather":
    "A feather is a letter from the sky. Fetch one, would you?",
  "Discover a mushroom":
    "Under the damp and the shade, the little umbrellas wait.",
};

export function pickGreeting(giver: QuestGiver, date = new Date()): string {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return giver.greetings[seed % giver.greetings.length];
}

export function getGiverById(id: string | null | undefined): QuestGiver | undefined {
  if (!id) return undefined;
  return QUEST_GIVERS.find((g) => g.id === id);
}
