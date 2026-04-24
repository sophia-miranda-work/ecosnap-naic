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

/**
 * Per-quest intro lines, written in each character's voice.
 * Outer key = quest title, inner key = quest-giver id.
 * `getQuestIntro(quest, giver)` falls back gracefully if a line is missing.
 */
export const QUEST_INTROS: Record<string, Partial<Record<string, string>>> = {
  "Find a flower with 5 petals": {
    willow: "Five petals, five little wishes — bring me one and we'll spend them well.",
    "professor-hoot": "Five-fold symmetry. A small miracle. Document it, please.",
    pip: "Bet you a pinecone you can't find one before lunch!",
    mossback: "Count slowly. One… two… all the way to five.",
    clover: "Five whole petals?! Imagine the luck!",
  },
  "Spot a uniquely shaped leaf": {
    willow: "Ovals are for ordinary days. Find me a leaf shaped like a secret.",
    "professor-hoot": "Catalogue any leaf that defies its species. Sketch the outline.",
    pip: "Hearts, stars, claws — bring me the weirdest one!",
    mossback: "A leaf with character. Like an old friend.",
    clover: "Find the prettiest, oddest leaf in the whole meadow!",
  },
  "Spot a yellow bird": {
    willow: "Listen for a song the color of sunshine. Then look up.",
    "professor-hoot": "Yellow plumage. Note the call before you note the colour.",
    pip: "Yellow flash up high — quick, before it bolts!",
    mossback: "Sit. Wait. The yellow one always returns.",
    clover: "A sunshine bird! Oh, please bring me a glimpse!",
  },
  "Find a fallen feather": {
    willow: "A feather is a letter from the sky. Fetch one, would you?",
    "professor-hoot": "Specimen request: one fallen feather. Handle with care.",
    pip: "Feather hunt! First one back wins a cloudberry.",
    mossback: "The wind drops them where it pleases. Look low.",
    clover: "A soft little feather for my collection — please?",
  },
  "Discover a mushroom": {
    willow: "Under the damp and the shade, the little umbrellas wait.",
    "professor-hoot": "Identify a fungus. Do not, under any circumstances, taste it.",
    pip: "Mushroom mission! The frillier the better.",
    mossback: "By the old log, after the rain. They like it there.",
    clover: "A tiny mushroom hat for a tiny mushroom guest!",
  },
  "Hear three different birdsongs": {
    willow: "Three songs, three small spells — gather them on the breeze.",
    "professor-hoot": "An auditory transect. Three distinct calls, please.",
    pip: "Ears up! Three tunes, no repeats — go!",
    mossback: "Close your eyes. The pond will help you count.",
    clover: "A whole little choir for me to imagine!",
  },
  "Find something perfectly round": {
    willow: "Round things hold the most magic. A pebble, a berry — your choice.",
    "professor-hoot": "Document one naturally spherical object. Diameter optional.",
    pip: "Round means rolly! Find a rolly one!",
    mossback: "The river makes them. Be patient with your looking.",
    clover: "A perfect circle! Like a tiny moon!",
  },
  "Spot a spider's web": {
    willow: "A web is a poem the morning forgot to sweep away.",
    "professor-hoot": "Locate one orb-weaver's lattice. Do not disturb the architect.",
    pip: "Sneaky silk traps — find one before it finds you!",
    mossback: "Between two reeds. They love the in-between places.",
    clover: "Sparkly dewy webs are the prettiest little doilies!",
  },
  "Touch the bark of three different trees": {
    willow: "Each tree has a different handshake. Greet three of them for me.",
    "professor-hoot": "Tactile field study. Three trunks, three textures, take notes.",
    pip: "Tree tag! Tap three and zoom back!",
    mossback: "Slow palms. Old friends. Three is a fine number.",
    clover: "Hug them while you're at it — they like that!",
  },
  "Find a pinecone": {
    willow: "Pinecones keep tiny secrets in their scales. Bring me one.",
    "professor-hoot": "Conifer cone, intact preferred. A simple yet noble specimen.",
    pip: "Pinecone! Pinecone! Best one wins!",
    mossback: "Beneath the tall, quiet ones. Look down.",
    clover: "A little wooden flower! Aren't they darling?",
  },
  "Smell three different plants": {
    willow: "Noses are wands too. Sniff three green things and report back.",
    "professor-hoot": "Olfactory survey. Mint, pine, anything pungent — three samples.",
    pip: "Sniff sniff sniff! Bonus points for stinky!",
    mossback: "Crush a leaf gently. The good ones whisper back.",
    clover: "Imagine the bouquet! Tell me which was loveliest.",
  },
  "Spot a butterfly or moth": {
    willow: "A flutter on the wind — catch one only with your eyes.",
    "professor-hoot": "Lepidoptera sighting requested. Note wing pattern if able.",
    pip: "Wings on patrol! Spot one and don't scare it!",
    mossback: "Sit still long enough and one will land near you.",
    clover: "A butterfly! Oh, a butterfly! Please find me one!",
  },
  "Find a stone you'd keep": {
    willow: "The right stone hums when you hold it. Trust your fingers.",
    "professor-hoot": "Select one geologically interesting specimen. Pocket-sized.",
    pip: "Treasure rock! Shiniest one wins!",
    mossback: "It will pick you, not the other way around.",
    clover: "A pet pebble! Give it a name, won't you?",
  },
  "Watch the clouds for one minute": {
    willow: "Read the sky like tea leaves. Tell me what it said.",
    "professor-hoot": "Sixty seconds of cumulus contemplation. Begin.",
    pip: "One whole minute?! Okay, okay — clouds, go!",
    mossback: "A minute is barely a blink. Take two if you'd like.",
    clover: "I love clouds! Find me a sheep-shaped one!",
  },
  "Spot something blue in nature": {
    willow: "Blue is shy in the woods. It hides in petals and wings.",
    "professor-hoot": "Blue pigment in flora or fauna. Surprisingly rare.",
    pip: "Blue thing! Blue thing! Don't say the sky!",
    mossback: "Look at the small things. Blue lives there.",
    clover: "A little blue surprise — what a treasure!",
  },
};

/** Per-giver line for a given quest, with safe fallbacks. */
export function getQuestIntro(questTitle: string, giverId: string): string | undefined {
  const byGiver = QUEST_INTROS[questTitle];
  if (!byGiver) return undefined;
  return byGiver[giverId] ?? Object.values(byGiver)[0];
}

export function pickGreeting(giver: QuestGiver, date = new Date()): string {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return giver.greetings[seed % giver.greetings.length];
}

export function getGiverById(id: string | null | undefined): QuestGiver | undefined {
  if (!id) return undefined;
  return QUEST_GIVERS.find((g) => g.id === id);
}
