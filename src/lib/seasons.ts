export type Season = "spring" | "summer" | "autumn" | "winter";

export const SEASONS: ReadonlyArray<Season> = ["spring", "summer", "autumn", "winter"];

export const SEASON_META: Record<Season, { label: string; emoji: string }> = {
  spring: { label: "Spring", emoji: "🌸" },
  summer: { label: "Summer", emoji: "☀️" },
  autumn: { label: "Autumn", emoji: "🍂" },
  winter: { label: "Winter", emoji: "❄️" },
};

/**
 * Northern-hemisphere astronomical seasons, using approximate fixed dates
 * for the equinoxes/solstices (good enough for theming):
 *  - Spring : Mar 20 – Jun 20
 *  - Summer : Jun 21 – Sep 21 (Summer Solstice)
 *  - Autumn : Sep 22 – Dec 20 (Autumnal Equinox)
 *  - Winter : Dec 21 – Mar 19 (Winter Solstice)
 */
export function getSeasonForDate(date: Date = new Date()): Season {
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();
  const md = m * 100 + d;
  if (md >= 320 && md <= 620) return "spring";
  if (md >= 621 && md <= 921) return "summer";
  if (md >= 922 && md <= 1220) return "autumn";
  return "winter";
}

/** Resolve the active season, honoring an optional manual override. */
export function resolveSeason(
  override: Season | null | undefined,
  date: Date = new Date(),
): Season {
  return override ?? getSeasonForDate(date);
}

export type SeasonalQuest = { emoji: string; title: string; hint: string };

export const SEASONAL_QUEST_POOL: Record<Season, SeasonalQuest[]> = {
  spring: [
    { emoji: "🌷", title: "Photograph a blooming flower", hint: "Tulips, daffodils, cherry blossoms — anything in bloom." },
    { emoji: "🌸", title: "Find the first cherry blossoms", hint: "Look up — the prettiest petals are above eye level." },
    { emoji: "🐝", title: "Spot a returning bee or pollinator", hint: "Sunny patches of early wildflowers are best." },
    { emoji: "🦋", title: "Photograph a butterfly", hint: "They warm their wings in morning sun." },
    { emoji: "🌱", title: "Find a brand-new sprout", hint: "Tiny green shoots pushing up through soil." },
    { emoji: "🐦", title: "Spot a nest-building bird", hint: "Watch for birds carrying twigs or grass in their beaks." },
    { emoji: "🌿", title: "Find three shades of fresh spring green", hint: "New leaves are paler than older ones." },
    { emoji: "🐞", title: "Spot a ladybug", hint: "Check the underside of leaves and flower stems." },
  ],
  summer: [
    { emoji: "🌅", title: "Photograph a sunset", hint: "Find a wide horizon about 20 minutes before dusk." },
    { emoji: "🍦", title: "Capture a quintessential summer activity", hint: "Ice cream, picnics, beach days — anything warm-weather." },
    { emoji: "🌻", title: "Find a sunflower turned toward the sun", hint: "They track the light through the day." },
    { emoji: "🌊", title: "Photograph water — pool, lake, ocean, fountain", hint: "Catch a reflection if you can." },
    { emoji: "🍉", title: "Capture a summer fruit", hint: "Watermelon, peaches, berries from the market." },
    { emoji: "☀️", title: "Photograph long shadows in the late sun", hint: "Best in the golden hour after 6pm." },
    { emoji: "🌳", title: "Find the deepest shade you can", hint: "Big trees, awnings, anywhere cool." },
    { emoji: "🐠", title: "Spot wildlife enjoying the heat", hint: "Lizards on warm rocks, dragonflies over water." },
  ],
  autumn: [
    { emoji: "🍁", title: "Photograph a leaf with three colors", hint: "Maples are the most generous." },
    { emoji: "🍂", title: "Find the perfect leaf pile", hint: "Parks and tree-lined streets after a windy day." },
    { emoji: "🎃", title: "Capture a pumpkin or gourd", hint: "Front porches and farmers' markets." },
    { emoji: "🌰", title: "Find an acorn, conker, or chestnut", hint: "Beneath oak and chestnut trees." },
    { emoji: "🍎", title: "Photograph a fruit being harvested", hint: "Apples, pears, persimmons." },
    { emoji: "🌫️", title: "Catch morning fog or mist", hint: "Low ground and fields just after sunrise." },
    { emoji: "🦔", title: "Spot an animal foraging", hint: "Squirrels and birds are stocking up before winter." },
    { emoji: "🕯️", title: "Find cozy indoor light", hint: "Warm lamp light through a window at dusk." },
  ],
  winter: [
    { emoji: "❄️", title: "Catch a snowflake (on a glove or sleeve)", hint: "Dark fabric makes the crystals visible." },
    { emoji: "⛄", title: "Photograph a snowman", hint: "Yours, a neighbor's, or a tiny one on a railing." },
    { emoji: "⛸️", title: "Capture an ice-skating moment", hint: "Local rink, frozen pond, or a video clip." },
    { emoji: "🌲", title: "Find a tree wearing snow", hint: "Conifers hold the prettiest piles." },
    { emoji: "🐾", title: "Spot animal tracks in fresh snow", hint: "Birds, squirrels, dogs — all leave a trail." },
    { emoji: "🧣", title: "Photograph your warmest layer", hint: "Scarves, hats, mittens — winter armor." },
    { emoji: "🌬️", title: "Catch your breath in cold air", hint: "Backlight by the sun for the best effect." },
    { emoji: "🪟", title: "Find frost patterns on a window", hint: "Best on cold mornings before the heat kicks in." },
  ],
};

/**
 * Optional UI reminder shown on the home screen when seasonal mode is on.
 * Currently only summer has one — staying hydrated / sun-smart.
 */
export function getSeasonalReminder(season: Season): { emoji: string; text: string } | null {
  if (season === "summer") {
    return {
      emoji: "💧",
      text: "Sunny season — sip water often. If it's scorching, explore from the shade or wait for golden hour.",
    };
  }
  return null;
}
