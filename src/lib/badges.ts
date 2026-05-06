import type { CategoryId } from "./journal-categories";

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  /** Returns progress in [0,1] and whether earned. */
  evaluate: (ctx: BadgeContext) => { earned: boolean; progress: number; current: number; goal: number };
};

export type BadgeContext = {
  entries: { category: CategoryId; created_at: string }[];
  streak: number;
};

function countCategory(entries: BadgeContext["entries"], cat: CategoryId) {
  return entries.filter((e) => e.category === cat).length;
}

function makeCountBadge(
  id: string,
  emoji: string,
  name: string,
  description: string,
  goal: number,
  pick: (ctx: BadgeContext) => number,
): Badge {
  return {
    id,
    emoji,
    name,
    description,
    evaluate: (ctx) => {
      const current = pick(ctx);
      return {
        current,
        goal,
        earned: current >= goal,
        progress: Math.min(1, current / goal),
      };
    },
  };
}

export const BADGES: Badge[] = [
  makeCountBadge("first-step", "🌱", "First Step", "Save your first journal entry.", 1, (c) => c.entries.length),
  makeCountBadge("apprentice", "📓", "Apprentice", "Save 5 journal entries.", 5, (c) => c.entries.length),
  makeCountBadge("naturalist", "📚", "Naturalist", "Save 25 journal entries.", 25, (c) => c.entries.length),
  makeCountBadge("explorer-50", "🗺️", "Seasoned Explorer", "Save 50 journal entries.", 50, (c) => c.entries.length),

  makeCountBadge("bloom-hunter", "🌸", "Bloom Hunter", "Sketch 5 flowers.", 5, (c) => countCategory(c.entries, "flower")),
  makeCountBadge("tree-friend", "🌳", "Tree Friend", "Sketch 5 trees.", 5, (c) => countCategory(c.entries, "tree")),
  makeCountBadge("bird-spotter", "🐦", "Bird Spotter", "Sketch 5 birds.", 5, (c) => countCategory(c.entries, "bird")),
  makeCountBadge("forager", "🍄", "Forager", "Sketch 3 mushrooms.", 3, (c) => countCategory(c.entries, "mushroom")),
  makeCountBadge("bug-buddy", "🐞", "Bug Buddy", "Sketch 5 insects.", 5, (c) => countCategory(c.entries, "insect")),
  makeCountBadge("waterwise", "💧", "Waterwise", "Sketch 3 water scenes.", 3, (c) => countCategory(c.entries, "water")),
  makeCountBadge("sky-watcher", "☁️", "Sky Watcher", "Sketch 3 skies.", 3, (c) => countCategory(c.entries, "sky")),
  makeCountBadge("stone-collector", "🪨", "Stone Collector", "Sketch 3 stones.", 3, (c) => countCategory(c.entries, "stone")),
  makeCountBadge("green-thumb", "🌿", "Green Thumb", "Sketch 5 plants.", 5, (c) => countCategory(c.entries, "plant")),

  makeCountBadge("streak-3", "✨", "Three in a Row", "Keep a 3-day streak.", 3, (c) => c.streak),
  makeCountBadge("streak-7", "🔥", "Week Wanderer", "Keep a 7-day streak.", 7, (c) => c.streak),
  makeCountBadge("streak-30", "🏆", "Moon Cycle", "Keep a 30-day streak.", 30, (c) => c.streak),

  {
    id: "variety-5",
    emoji: "🎨",
    name: "Variety Pack",
    description: "Sketch in 5 different categories.",
    evaluate: (ctx) => {
      const unique = new Set(ctx.entries.map((e) => e.category)).size;
      return { current: unique, goal: 5, earned: unique >= 5, progress: Math.min(1, unique / 5) };
    },
  },
  {
    id: "all-categories",
    emoji: "🌍",
    name: "Naturalist Master",
    description: "Sketch at least one of every category.",
    evaluate: (ctx) => {
      const unique = new Set(ctx.entries.map((e) => e.category)).size;
      return { current: unique, goal: 10, earned: unique >= 10, progress: Math.min(1, unique / 10) };
    },
  },
];