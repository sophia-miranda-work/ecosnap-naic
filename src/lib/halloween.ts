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

/** Spooky greetings per NPC, used in place of their normal greetings. */
export const HALLOWEEN_GREETINGS: Record<string, string[]> = {
  willow: [
    "Tonight my cauldron bubbles just for you, dearie.",
    "The moon is fat and the bats are out — perfect quest weather.",
    "I traded my tea for a thimble of fog. Care for a sip?",
    "Step into the circle, mind the toadstools.",
  ],
  "professor-hoot": [
    "Hoo-hoo. The veil is thin tonight; observe carefully.",
    "A spectral field study awaits. Bring a sharp pencil.",
    "Statistically, the spookiest things are also the smallest.",
    "Class dismissed — fieldwork begins at dusk.",
  ],
  pip: [
    "Boo! Made you blink. Quest's on, let's go!",
    "I dressed up as a shadow. Pretty good, right?",
    "Trick or trail? Trail, obviously. Hurry!",
    "Sniffed out something spooky — race you there!",
  ],
  mossback: [
    "The pond is wearing fog tonight. Very fashionable.",
    "Slow down. The ghosts prefer it that way.",
    "I've croaked exactly thirteen times today. Auspicious.",
    "Sit a while. The spooky comes to you.",
  ],
  clover: [
    "Boo! Eee, that was fun! Now — your quest!",
    "I'm a tiny ghost-bunny tonight. Booooop!",
    "The pumpkins are smiling and so am I!",
    "Spooky AND lovely — the best kind of day!",
  ],
  jack: [
    "Yarrr, the Black Spot's on the moon tonight, matey.",
    "Avast! Even me parrot's wearin' a wee witch hat.",
    "Ghost ships sail close on All Hallows — sharp eyes!",
    "Shiver me timbers, the tide brought up bones an' candy!",
  ],
};

/** Per-quest spooky intros for the Halloween quest pool. */
export const HALLOWEEN_QUEST_INTROS: Record<string, Partial<Record<string, string>>> = {
  "Find a carved (or imagined) jack-o'-lantern": {
    willow: "A grinning gourd is a lantern for lost spirits. Find one for me.",
    "professor-hoot": "Cucurbita pepo, illuminated. Document the smile.",
    pip: "Pumpkin patrol! The toothier the better!",
    mossback: "A slow grin in a window. My favorite kind.",
    clover: "An orange smile! Wave back, won't you?",
    jack: "A lantern in the window guides ships AND spirits home, arr.",
  },
  "Spot a real spider's web": {
    willow: "The spinner is my old friend. Greet her web kindly.",
    "professor-hoot": "Orb-weaver architecture. Do not disturb the artisan.",
    pip: "Sticky silk trap! Find one before it finds you!",
    mossback: "Between two damp reeds. Always there.",
    clover: "A lacy little doily — spooky AND pretty!",
    jack: "A web be a sailor's net in miniature, matey.",
  },
  "Watch the sky at dusk for a bat": {
    willow: "Bats are tiny witches in fur coats. Wave hello.",
    "professor-hoot": "Chiroptera at twilight. Note the flight pattern.",
    pip: "Flappy night-friends! Quick, look up!",
    mossback: "They like the soft light. Be patient.",
    clover: "A little flutter-shadow! How exciting!",
    jack: "Sea-bats round the mast at dusk — landlubbers call 'em bats.",
  },
  "Find the longest, spookiest shadow you can": {
    willow: "Shadows grow brave in October. Measure one for me.",
    "professor-hoot": "Solar geometry. Long shadows mean low sun.",
    pip: "Shadow tag! Find the longest one and pounce!",
    mossback: "Mine stretches to the lily pad most evenings.",
    clover: "A giant shadow-bunny! Make one with your hands!",
    jack: "A long shadow on deck means the sun's takin' her leave.",
  },
  "Collect a leaf the colour of fire": {
    willow: "A flame that doesn't burn. Bring me one.",
    "professor-hoot": "Anthocyanin display. Reds and ambers preferred.",
    pip: "Fire leaf! The reddest one wins!",
    mossback: "Underfoot, near the maples. Always plenty.",
    clover: "A little ember to carry in your pocket!",
    jack: "Looks like a sunset took a nap on the ground, arrr.",
  },
  "Notice a crooked branch shaped like a claw": {
    willow: "The trees grow witchy fingers this time of year.",
    "professor-hoot": "Arboreal silhouette study. Bare branches are best.",
    pip: "Claw-branch! Spooky tree, spooky tree!",
    mossback: "The old oaks have the best ones.",
    clover: "A tickly tree-finger! Don't let it grab you!",
    jack: "Looks like the kraken's reachin' up from the loam, matey.",
  },
  "Spot a black cat (or any black animal)": {
    willow: "A black cat is a familiar in disguise. Curtsy if you can.",
    "professor-hoot": "Melanistic specimen sighting. Note the eyes.",
    pip: "Black blur! Quick — friend or foe?!",
    mossback: "Crows count. Ravens count more.",
    clover: "A shadow with whiskers! Aww!",
    jack: "Black cat aboard be good luck — every sailor knows it, yarr.",
  },
  "Find a misty, eerie patch outdoors": {
    willow: "Fog is the world holding its breath. Step in gently.",
    "professor-hoot": "Low-altitude condensation. Observe, do not inhale deeply.",
    pip: "Spooky smoke-cloud! On the ground! Weird!",
    mossback: "The pond makes the best mist. I helped.",
    clover: "A cloud that came down to visit!",
    jack: "Sea-fog on land — me favourite weather, arrr.",
  },
  "Find something pale and ghostly in nature": {
    willow: "Ghost-things hide in plain sight. Look pale.",
    "professor-hoot": "Albino or bleached specimen. Document carefully.",
    pip: "Pale thing! Ghost-mushroom! Bone-stick! Go!",
    mossback: "A white mushroom by the log. Reliable.",
    clover: "A little ghost-flower! So delicate!",
    jack: "Pale as a sun-bleached sail, matey.",
  },
  "Listen for an owl, crow, or other spooky call": {
    willow: "Their voices are spells. Listen, don't interrupt.",
    "professor-hoot": "I — ahem — recommend the owl. Obviously.",
    pip: "Spooky noise! Quick, point at it!",
    mossback: "Stand still. The owl knows you're there.",
    clover: "A hooty-howl! Sing along quietly!",
    jack: "A crow's caw at dusk means a storm by morn, arr.",
  },
  "Notice a single warm light in a dark window": {
    willow: "A candle in a window is an old, kind spell.",
    "professor-hoot": "Domestic luminescence. A welcome contrast.",
    pip: "Cosy glow! Someone's home and toasty!",
    mossback: "Warm light. Cold night. Good combination.",
    clover: "A little firefly-window! How sweet!",
    jack: "A lantern in the dark — a beacon to bring ye home, matey.",
  },
  "Spot a treat-sized something tiny and sweet": {
    willow: "A wild candy from the hedgerow. Don't eat it.",
    "professor-hoot": "Diminutive specimen. Berry, seed, or pod.",
    pip: "Tiny treat! Sweet little speck!",
    mossback: "Look between the stones. Always something.",
    clover: "A bite-sized treasure for the tiniest mouth!",
    jack: "A wee sugar-loot to tuck in me sea-chest, arrr.",
  },
};

/** Halloween-specific intro for a quest, falling back across givers. */
export function getHalloweenQuestIntro(questTitle: string, giverId: string): string | undefined {
  const byGiver = HALLOWEEN_QUEST_INTROS[questTitle];
  if (!byGiver) return undefined;
  return byGiver[giverId] ?? Object.values(byGiver)[0];
}

/** Deterministic spooky greeting for a giver on a given day. */
export function pickHalloweenGreeting(giverId: string, date: Date = new Date()): string | undefined {
  const lines = HALLOWEEN_GREETINGS[giverId];
  if (!lines || lines.length === 0) return undefined;
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return lines[seed % lines.length];
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
