export type QuestGiver = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accent: string; // tailwind-friendly bg utility for the bubble tail
  greetings: string[];
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
