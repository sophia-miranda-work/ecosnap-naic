import { useEffect, useState } from "react";
import { fetchCurrentWeather, getCurrentCoords, type WeatherKind } from "@/lib/weather";

/**
 * Bonus weather-themed quests. One pool per weather kind, each tied to a
 * fitting character from our cast. Picked deterministically by date so the
 * same quest sticks all day. Coins are slightly bigger than regular
 * mini-tasks because matching the weather deserves a nudge.
 */
export type WeatherQuest = {
  id: string;
  emoji: string;
  label: string;
  flavor: string;
  coins: number;
};

export type WeatherGiver = {
  id: string;
  name: string;
  avatar: string;
  /** Short label for the chip, e.g. "Rainy-day bonus". */
  bonusLabel: string;
};

const GIVERS: Record<WeatherKind, WeatherGiver> = {
  rainy: { id: "mossback", name: "Mossback", avatar: "🐸", bonusLabel: "Rainy-day bonus" },
  sunny: { id: "clover", name: "Clover", avatar: "🐰", bonusLabel: "Sunny-day bonus" },
  scorching: { id: "clover", name: "Clover", avatar: "🐰", bonusLabel: "Stay-cool bonus" },
  "partly-cloudy": { id: "pip", name: "Pip", avatar: "🦊", bonusLabel: "Sun & cloud bonus" },
  cloudy: { id: "professor-hoot", name: "Professor Hoot", avatar: "🦉", bonusLabel: "Cloudy-day bonus" },
  foggy: { id: "willow", name: "Willow", avatar: "🧙‍♀️", bonusLabel: "Foggy-day bonus" },
  snowy: { id: "pip", name: "Pip", avatar: "🦊", bonusLabel: "Snowy-day bonus" },
};

const POOLS: Record<WeatherKind, WeatherQuest[]> = {
  rainy: [
    { id: "puddle-jump", emoji: "💦", label: "Jump in a puddle", flavor: "Mossback says: the deeper the splash, the louder the giggle.", coins: 6 },
    { id: "raindrop-race", emoji: "🌧️", label: "Have a raindrop race on a window", flavor: "Pick two drops near the top. First one to the sill wins.", coins: 5 },
    { id: "rain-listen", emoji: "👂", label: "Stand still and listen to the rain for 30s", flavor: "Mossback's favorite music. Eyes closed if you can.", coins: 5 },
    { id: "rain-smell", emoji: "🌫️", label: "Find the smell of wet earth (petrichor)", flavor: "Best near soil, moss, or stones after a fresh shower.", coins: 5 },
    { id: "leaf-boat", emoji: "🍃", label: "Float a leaf-boat down a stream of rain", flavor: "A gutter, a puddle, or the edge of the path all count.", coins: 6 },
    { id: "umbrella-drum", emoji: "☂️", label: "Drum a tune on your umbrella or hood", flavor: "Rain makes the rhythm; you bring the tune.", coins: 5 },
    { id: "puddle-mirror", emoji: "🪞", label: "Find a puddle and look at the sky in it", flavor: "Two skies for the price of one walk.", coins: 5 },
  ],
  sunny: [
    { id: "sun-warm-face", emoji: "🌞", label: "Turn your face to the sun for 10 seconds", flavor: "Clover swears it's the best vitamin in the meadow.", coins: 5 },
    { id: "shadow-shape", emoji: "👤", label: "Make a fun shape with your shadow", flavor: "Bunny ears are traditional. Antlers are bold.", coins: 5 },
    { id: "sun-warmest-spot", emoji: "🔆", label: "Find the warmest sunny spot near you", flavor: "Stand in it for one slow breath.", coins: 5 },
    { id: "sparkle-hunt", emoji: "✨", label: "Spot something sparkling in the sun", flavor: "Water, glass, dewdrops, a beetle's back.", coins: 5 },
    { id: "shadow-step", emoji: "👣", label: "Walk only on shadows for 20 steps", flavor: "Mind the cracks. Mind the puddles too.", coins: 6 },
    { id: "sun-flower", emoji: "🌻", label: "Find a flower facing the sun", flavor: "They know which way home is.", coins: 5 },
    { id: "sun-color", emoji: "🟡", label: "Spot 3 yellow things outdoors", flavor: "Pollen counts. So do dandelions.", coins: 5 },
  ],
  scorching: [
    { id: "hot-water", emoji: "💧", label: "Drink a tall glass of cool water", flavor: "Clover says: it's far too hot out there. Hydrate first.", coins: 6 },
    { id: "hot-shade-window", emoji: "🪟", label: "Watch the heat shimmer from a shaded window", flavor: "The garden looks like it's wobbling. Stay where it's cool.", coins: 5 },
    { id: "hot-cool-cloth", emoji: "🧊", label: "Cool your wrists with a damp cloth", flavor: "An old bunny trick — pulses cool fast.", coins: 5 },
    { id: "hot-fan-breeze", emoji: "🌬️", label: "Sit in front of a fan or breeze for a minute", flavor: "Close your eyes. Pretend it's a meadow wind.", coins: 5 },
    { id: "hot-icy-snack", emoji: "🍧", label: "Have something icy or frozen", flavor: "Ice cube, sorbet, frozen fruit — Clover-approved.", coins: 6 },
    { id: "hot-houseplant", emoji: "🪴", label: "Mist a houseplant (or imagine one happy)", flavor: "They're hot too. A little spritz goes a long way.", coins: 5 },
    { id: "hot-stretch", emoji: "🧘", label: "Do 5 slow indoor stretches in the shade", flavor: "Save the walk for sunset. Move gently for now.", coins: 5 },
  ],
  "partly-cloudy": [
    { id: "cloud-race", emoji: "🏁", label: "Pick two clouds and race them across the sky", flavor: "Pip's favorite spectator sport.", coins: 5 },
    { id: "sun-cloud-switch", emoji: "🌤️", label: "Notice when the sun pops back out", flavor: "Smile when it does. Mandatory.", coins: 5 },
    { id: "cloud-shape", emoji: "☁️", label: "Find a cloud shaped like an animal", flavor: "Pip insists at least one is a fox today.", coins: 5 },
    { id: "shade-step", emoji: "🌗", label: "Walk from sun into shade and back", flavor: "Feel the temperature shift on your arms.", coins: 5 },
    { id: "sky-photo", emoji: "📸", label: "Take a mental snapshot of the sky right now", flavor: "Close your eyes. See if it stays a while.", coins: 5 },
  ],
  cloudy: [
    { id: "grey-shades", emoji: "🌫️", label: "Find 3 different shades of grey in the sky", flavor: "Professor Hoot grades on subtlety, not brightness.", coins: 5 },
    { id: "cloud-thickness", emoji: "☁️", label: "Guess how thick today's clouds are", flavor: "Thumbs-up: thin. Two thumbs: thick. Bonus marks for a sketch.", coins: 5 },
    { id: "soft-light", emoji: "🌥️", label: "Notice how soft the light makes colors look", flavor: "Greens get greener under cloud, says the Professor.", coins: 5 },
    { id: "wind-direction", emoji: "🍃", label: "Figure out which way the clouds are moving", flavor: "Stand still. Pick a fixed point. Wait.", coins: 6 },
    { id: "no-shadow", emoji: "🚫", label: "Try to find your own shadow (you won't!)", flavor: "Diffuse light is a magic trick.", coins: 5 },
  ],
  foggy: [
    { id: "fog-walk", emoji: "🌁", label: "Walk into the fog and disappear for 5 steps", flavor: "Willow loves a good vanishing.", coins: 6 },
    { id: "muffled-sound", emoji: "🔇", label: "Notice how sound goes quiet in the fog", flavor: "The world hushes. Hush back.", coins: 5 },
    { id: "fog-droplet", emoji: "💧", label: "Catch a fog droplet on your sleeve", flavor: "Tiny floating rain — Willow's favorite tea ingredient.", coins: 5 },
    { id: "spider-web", emoji: "🕸️", label: "Spot a fog-jeweled spider's web", flavor: "Fog makes the invisible visible.", coins: 6 },
    { id: "lantern-tree", emoji: "🌲", label: "Find a tree that looks like a ghost", flavor: "Just outlines today. Spooky, friendly, both.", coins: 5 },
  ],
  snowy: [
    { id: "snow-tracks", emoji: "👣", label: "Make a fresh trail of footprints", flavor: "Pip approves of any prints, big or small.", coins: 6 },
    { id: "snowflake-catch", emoji: "❄️", label: "Catch a snowflake on your sleeve", flavor: "Look quick — they don't stay.", coins: 5 },
    { id: "snow-quiet", emoji: "🤫", label: "Stand still and hear the snow-hush", flavor: "Snow soaks up sound. Try whispering.", coins: 5 },
    { id: "snow-sculpt", emoji: "⛄", label: "Build a tiny snow-thing (no need for big!)", flavor: "Acorn nose. Twig arms. Pip will visit.", coins: 6 },
    { id: "animal-tracks", emoji: "🐾", label: "Look for animal tracks in the snow", flavor: "Bird, cat, mystery — log them in your journal.", coins: 6 },
  ],
};

function seedFromDate(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function pickWeatherQuest(kind: WeatherKind, date = new Date()): WeatherQuest {
  const pool = POOLS[kind];
  return pool[seedFromDate(date) % pool.length];
}

export function getWeatherGiver(kind: WeatherKind): WeatherGiver {
  return GIVERS[kind];
}

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; kind: WeatherKind }
  | { status: "error"; message: string };

const CACHE_KEY = "weather-cache:v2";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CachedWeather = { ts: number; kind: WeatherKind };

function readCache(): CachedWeather | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWeather;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(c: CachedWeather) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

/**
 * Reads cached weather first (so the bonus banner can show instantly on
 * subsequent visits), then refreshes in the background. Geolocation is
 * requested silently — if the user denies it, no bonus appears.
 */
export function useWeatherQuest() {
  // Always start "idle" so SSR and the first client render match. We hydrate
  // from localStorage in a layout effect right after mount.
  const [state, setState] = useState<WeatherState>({ status: "idle" });

  useEffect(() => {
    const cached = readCache();
    if (cached) setState({ status: "ready", kind: cached.kind });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        if (state.status === "idle") setState({ status: "loading" });
        const coords = await getCurrentCoords();
        const w = await fetchCurrentWeather(coords.lat, coords.lon, ctrl.signal);
        if (cancelled) return;
        writeCache({ ts: Date.now(), kind: w.kind });
        setState({ status: "ready", kind: w.kind });
      } catch (e) {
        if (cancelled) return;
        const cached = readCache();
        if (cached) {
          setState({ status: "ready", kind: cached.kind });
        } else {
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Weather unavailable",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
    // Only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.status === "ready") {
    return {
      kind: state.kind,
      quest: pickWeatherQuest(state.kind),
      giver: getWeatherGiver(state.kind),
      ready: true as const,
    };
  }
  return { kind: null, quest: null, giver: null, ready: false as const };
}