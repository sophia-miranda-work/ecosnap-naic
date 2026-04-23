export type CategoryId =
  | "tree"
  | "plant"
  | "flower"
  | "bird"
  | "insect"
  | "mushroom"
  | "stone"
  | "water"
  | "sky"
  | "other";

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { id: "tree", label: "Tree", emoji: "🌳" },
  { id: "plant", label: "Plant", emoji: "🌿" },
  { id: "flower", label: "Flower", emoji: "🌸" },
  { id: "bird", label: "Bird", emoji: "🐦" },
  { id: "insect", label: "Insect", emoji: "🐞" },
  { id: "mushroom", label: "Mushroom", emoji: "🍄" },
  { id: "stone", label: "Stone", emoji: "🪨" },
  { id: "water", label: "Water", emoji: "💧" },
  { id: "sky", label: "Sky", emoji: "☁️" },
  { id: "other", label: "Other", emoji: "✨" },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

/**
 * Curated nature facts. Hand-picked, family friendly, surprising.
 * Pick one at random per capture so it feels like a little reward.
 */
const FACTS: Record<CategoryId, string[]> = {
  tree: [
    "Trees can talk to each other through underground fungal networks — scientists nicknamed it the 'Wood Wide Web.'",
    "A single mature oak can drop almost 10,000 acorns in a good year.",
    "The tallest tree on Earth is a coast redwood named Hyperion — over 115 m (380 ft) tall.",
    "Birch bark contains a natural antiseptic; explorers used it to bandage wounds.",
  ],
  plant: [
    "Plants give off a faint ultrasonic 'click' when they're thirsty — too high for human ears.",
    "Bamboo is the fastest-growing plant; some species shoot up nearly 1 m a day.",
    "Stinging nettles are full of vitamins — once cooked, the sting completely disappears.",
    "Ivy actually doesn't damage healthy tree bark; it just hitches a ride toward the sun.",
  ],
  flower: [
    "Sunflowers track the sun across the sky when they're young — it's called heliotropism.",
    "Tulip bulbs were once worth more than houses in 1630s Holland.",
    "Lavender is in the mint family — crush a leaf and you can almost taste it.",
    "The corpse flower can grow over 3 m tall and only blooms for 24–36 hours.",
  ],
  bird: [
    "A robin's red breast is actually a territorial flag, not a mating signal.",
    "Crows can recognise individual human faces — and remember them for years.",
    "The bee hummingbird is the smallest bird in the world; it weighs less than a paperclip.",
    "Owls can rotate their heads up to 270° because they have extra neck vertebrae.",
  ],
  insect: [
    "Bees beat their wings about 200 times per second — that's where the buzz comes from.",
    "Ladybirds release a smelly yellow fluid from their knees when threatened.",
    "Dragonflies have been on Earth for over 300 million years — older than dinosaurs.",
    "Butterflies taste with their feet.",
  ],
  mushroom: [
    "The largest living organism on Earth is a honey fungus in Oregon — over 9 km² wide.",
    "Mushrooms are more closely related to animals than to plants.",
    "Some fungi glow in the dark — a phenomenon called foxfire.",
    "A single puffball mushroom can release up to 7 trillion spores.",
  ],
  stone: [
    "Pebbles get rounded by tumbling against other pebbles in rivers and waves — sometimes for thousands of years.",
    "Granite is made of three minerals you can usually see with the naked eye: quartz, feldspar and mica.",
    "Flint was the first 'high tech' material — humans used it for tools 2.5 million years ago.",
    "Limestone is mostly squashed seashells, even when you find it on a mountain.",
  ],
  water: [
    "A drop of pond water can contain thousands of microscopic creatures — a whole hidden world.",
    "Rivers carve canyons because water + grit acts like very slow sandpaper.",
    "Raindrops aren't tear-shaped — they're more like tiny hamburger buns.",
    "Mist forms when warm air meets cool water and the moisture suddenly condenses.",
  ],
  sky: [
    "Clouds may look fluffy, but an average one weighs about 500,000 kg.",
    "The blue of the sky comes from sunlight scattering off air molecules — shorter blue wavelengths bounce more.",
    "A rainbow is actually a full circle; we usually only see the top half from the ground.",
    "On a clear, dark night you can see roughly 4,500 stars with the naked eye.",
  ],
  other: [
    "Spending just 20 minutes in nature measurably lowers stress hormones.",
    "The smell of rain on dry earth has a name: petrichor.",
    "Walking outdoors boosts creative problem-solving by up to 60%.",
    "Every breath you take contains atoms that were once part of dinosaurs.",
  ],
};

export function pickFunFact(category: CategoryId): string {
  const list = FACTS[category];
  return list[Math.floor(Math.random() * list.length)];
}