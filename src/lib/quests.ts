import type { CategoryId } from "./journal-categories";

export type QuestTier = "bronze" | "silver" | "gold";

export type Quest = {
  id: string;
  tier: QuestTier;
  emoji: string;
  title: string;
  description: string;
  /**
   * Journal categories that count toward this quest. An entry in any of these
   * categories made during the quest's active period satisfies it.
   */
  categories: CategoryId[];
  /** How many matching entries are needed within the period. */
  count: number;
};

export const TIER_REWARD: Record<QuestTier, number> = {
  bronze: 20,
  silver: 50,
  gold: 150,
};

export const TIER_META: Record<
  QuestTier,
  { label: string; emoji: string; ring: string; chip: string; rotation: "weekly" | "monthly" }
> = {
  bronze: {
    label: "Bronze",
    emoji: "🥉",
    ring: "ring-[oklch(0.65_0.12_55)]",
    chip: "bg-[oklch(0.92_0.06_60)] text-[oklch(0.35_0.09_55)]",
    rotation: "weekly",
  },
  silver: {
    label: "Silver",
    emoji: "🥈",
    ring: "ring-[oklch(0.78_0.02_240)]",
    chip: "bg-[oklch(0.94_0.01_240)] text-[oklch(0.35_0.02_240)]",
    rotation: "weekly",
  },
  gold: {
    label: "Gold",
    emoji: "🥇",
    ring: "ring-[oklch(0.78_0.15_85)]",
    chip: "bg-[oklch(0.93_0.1_88)] text-[oklch(0.35_0.12_75)]",
    rotation: "monthly",
  },
};

/** Curated pool. Picks rotate weekly (bronze/silver) or monthly (gold). */
export const QUEST_POOL: Quest[] = [
  // ── BRONZE — quick, single-sketch wins (20 coins) ─────────────────────
  { id: "b-flower", tier: "bronze", emoji: "🌸", title: "Sketch a flower", description: "Find any blossom and add it to your journal.", categories: ["flower"], count: 1 },
  { id: "b-tree", tier: "bronze", emoji: "🌳", title: "Sketch a tree", description: "Tall, short, gnarly — any tree counts.", categories: ["tree"], count: 1 },
  { id: "b-bird", tier: "bronze", emoji: "🐦", title: "Sketch a bird", description: "Spot a feathered friend and capture it.", categories: ["bird"], count: 1 },
  { id: "b-leaf", tier: "bronze", emoji: "🍃", title: "Sketch a plant", description: "A weed, a fern, a houseplant — pick one.", categories: ["plant"], count: 1 },
  { id: "b-stone", tier: "bronze", emoji: "🪨", title: "Sketch a stone", description: "Pebbles count too.", categories: ["stone"], count: 1 },
  { id: "b-cloud", tier: "bronze", emoji: "☁️", title: "Sketch the sky", description: "Clouds, sun, moon — anything overhead.", categories: ["sky"], count: 1 },
  { id: "b-water", tier: "bronze", emoji: "💧", title: "Sketch some water", description: "A puddle, brook, fountain, or pond.", categories: ["water"], count: 1 },
  { id: "b-bug", tier: "bronze", emoji: "🐞", title: "Sketch an insect", description: "A bee, a beetle, a butterfly.", categories: ["insect"], count: 1 },
  { id: "b-mushroom", tier: "bronze", emoji: "🍄", title: "Sketch a mushroom", description: "Look in damp, shaded places.", categories: ["mushroom"], count: 1 },
  { id: "b-something", tier: "bronze", emoji: "✨", title: "Sketch something curious", description: "Anything that catches your eye.", categories: ["other"], count: 1 },

  // ── SILVER — modest sets, mix of categories (50 coins) ────────────────
  { id: "s-three-flowers", tier: "silver", emoji: "💐", title: "Sketch three flowers", description: "Three different blooms this week.", categories: ["flower"], count: 3 },
  { id: "s-three-birds", tier: "silver", emoji: "🦜", title: "Sketch three birds", description: "Different birds, one journal each.", categories: ["bird"], count: 3 },
  { id: "s-three-trees", tier: "silver", emoji: "🌲", title: "Sketch three trees", description: "Old, young, leafy, bare — any three.", categories: ["tree"], count: 3 },
  { id: "s-tree-and-bird", tier: "silver", emoji: "🌳", title: "Tree + bird combo", description: "Sketch one tree and one bird.", categories: ["tree", "bird"], count: 2 },
  { id: "s-flora-trio", tier: "silver", emoji: "🌿", title: "Flora trio", description: "Three plants, flowers, or trees.", categories: ["plant", "flower", "tree"], count: 3 },
  { id: "s-watery-pair", tier: "silver", emoji: "🌊", title: "Two from the water", description: "Two sketches involving water.", categories: ["water"], count: 2 },
  { id: "s-five-mixed", tier: "silver", emoji: "🎨", title: "Five sketches", description: "Any five journal entries this week.", categories: ["tree", "plant", "flower", "bird", "insect", "mushroom", "stone", "water", "sky", "other"], count: 5 },
  { id: "s-tiny-creatures", tier: "silver", emoji: "🐝", title: "Tiny creatures", description: "Two insects this week.", categories: ["insect"], count: 2 },
  { id: "s-stone-and-water", tier: "silver", emoji: "🏞️", title: "Stone & stream", description: "One stone and one water sketch.", categories: ["stone", "water"], count: 2 },
  { id: "s-sky-watcher", tier: "silver", emoji: "🌤️", title: "Sky watcher", description: "Two sky sketches this week.", categories: ["sky"], count: 2 },

  // ── GOLD — long-haul monthly challenges (150 coins) ───────────────────
  { id: "g-naturalist", tier: "gold", emoji: "📔", title: "Field naturalist", description: "Fifteen sketches this month — keep that notebook full.", categories: ["tree", "plant", "flower", "bird", "insect", "mushroom", "stone", "water", "sky", "other"], count: 15 },
  { id: "g-bestiary", tier: "gold", emoji: "🦋", title: "A small bestiary", description: "Sketch six creatures this month — birds and insects together.", categories: ["bird", "insect"], count: 6 },
  { id: "g-herbarium", tier: "gold", emoji: "🌷", title: "Tiny herbarium", description: "Eight plants and flowers this month.", categories: ["plant", "flower"], count: 8 },
  { id: "g-everything", tier: "gold", emoji: "🌍", title: "A bit of everything", description: "Sketch at least one tree, plant, flower, bird, insect, stone and water this month.", categories: ["tree", "plant", "flower", "bird", "insect", "stone", "water"], count: 7 },
  { id: "g-deep-forest", tier: "gold", emoji: "🌲", title: "Deep in the forest", description: "Five trees, mushrooms, or stones this month.", categories: ["tree", "mushroom", "stone"], count: 5 },
  { id: "g-skies-and-streams", tier: "gold", emoji: "🌈", title: "Skies and streams", description: "Six sky or water sketches this month.", categories: ["sky", "water"], count: 6 },
];

// ── Period helpers ────────────────────────────────────────────────────────

/** ISO week key like "2026-W17" — Monday-based, stable across timezones. */
export function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** Month key like "2026-04". */
export function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Start of the current period (UTC) — Monday for weekly, 1st of month for
 * monthly. Used to filter journal entries that count toward a quest.
 */
export function periodStart(rotation: "weekly" | "monthly", date = new Date()): Date {
  if (rotation === "monthly") {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  }
  // Weekly — Monday 00:00 local time.
  const d = new Date(date);
  const day = d.getDay() || 7; // Sunday => 7
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministically pick `n` quests from the pool that match the tier.
 * Same `periodKey` always returns the same selection for everyone.
 */
function pickForPeriod(tier: QuestTier, periodKey: string, n: number): Quest[] {
  const pool = QUEST_POOL.filter((q) => q.tier === tier);
  if (pool.length <= n) return pool;
  // Fisher-Yates with a seeded pseudo-random based on the period key.
  const arr = [...pool];
  let seed = hashString(`${tier}-${periodKey}`);
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export type ActiveQuestSet = {
  bronze: Quest[];
  silver: Quest[];
  gold: Quest[];
  weekKey: string;
  monthKey: string;
};

/** Compute the active quests for a given moment. */
export function getActiveQuests(date = new Date()): ActiveQuestSet {
  const weekKey = getWeekKey(date);
  const monthKey = getMonthKey(date);
  return {
    weekKey,
    monthKey,
    bronze: pickForPeriod("bronze", weekKey, 4),
    silver: pickForPeriod("silver", weekKey, 3),
    gold: pickForPeriod("gold", monthKey, 2),
  };
}

/** Period key used by a quest of this tier (weekly vs monthly). */
export function periodKeyForTier(tier: QuestTier, date = new Date()): string {
  return TIER_META[tier].rotation === "monthly" ? getMonthKey(date) : getWeekKey(date);
}

/** Days remaining until this period ends (for "rotates in N days"). */
export function daysUntilRotation(rotation: "weekly" | "monthly", date = new Date()): number {
  if (rotation === "monthly") {
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return Math.max(1, Math.ceil((+next - +date) / 86_400_000));
  }
  const day = date.getDay() || 7;
  const daysLeft = 7 - day + 1; // through next Monday
  return Math.max(1, daysLeft);
}