import { useEffect, useState } from "react";
import { fetchCurrentWeather, getCurrentCoords } from "@/lib/weather";

/**
 * Bonus rainy-day quests from Mossback the toad. Picked deterministically
 * by date so the same quest sticks for the day. Coins are bigger than
 * normal mini-tasks because going out in the rain deserves it.
 */
export type RainyQuest = {
  id: string;
  emoji: string;
  label: string;
  flavor: string;
  coins: number;
};

export const RAINY_QUESTS: RainyQuest[] = [
  {
    id: "puddle-jump",
    emoji: "💦",
    label: "Jump in a puddle",
    flavor: "Mossback says: the deeper the splash, the louder the giggle.",
    coins: 6,
  },
  {
    id: "raindrop-race",
    emoji: "🌧️",
    label: "Have a raindrop race on a window",
    flavor: "Pick two drops near the top. First one to the sill wins.",
    coins: 5,
  },
  {
    id: "rain-listen",
    emoji: "👂",
    label: "Stand still and listen to the rain for 30s",
    flavor: "Mossback's favorite music. Eyes closed if you can.",
    coins: 5,
  },
  {
    id: "rain-smell",
    emoji: "🌫️",
    label: "Find the smell of wet earth (petrichor)",
    flavor: "Best near soil, moss, or stones after a fresh shower.",
    coins: 5,
  },
  {
    id: "leaf-boat",
    emoji: "🍃",
    label: "Float a leaf-boat down a stream of rain",
    flavor: "A gutter, a puddle, or the edge of the path all count.",
    coins: 6,
  },
  {
    id: "umbrella-drum",
    emoji: "☂️",
    label: "Drum a tune on your umbrella or hood",
    flavor: "Rain makes the rhythm; you bring the tune.",
    coins: 5,
  },
  {
    id: "puddle-mirror",
    emoji: "🪞",
    label: "Find a puddle and look at the sky in it",
    flavor: "Two skies for the price of one walk.",
    coins: 5,
  },
];

function seedFromDate(date = new Date()): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function pickRainyQuest(date = new Date()): RainyQuest {
  return RAINY_QUESTS[seedFromDate(date) % RAINY_QUESTS.length];
}

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; isRaining: boolean }
  | { status: "error"; message: string };

const CACHE_KEY = "rainy-weather-cache:v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CachedWeather = { ts: number; isRaining: boolean };

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
 * Reads cached weather first (so the rainy banner can show instantly on
 * subsequent visits), then refreshes in the background. Geolocation is
 * requested silently — if the user denies it, we just stay quiet (no error
 * surfaced; rainy bonuses are an opt-in extra).
 */
export function useRainyWeather() {
  const [state, setState] = useState<WeatherState>(() => {
    const cached = readCache();
    if (cached) return { status: "ready", isRaining: cached.isRaining };
    return { status: "idle" };
  });

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        if (state.status === "idle") setState({ status: "loading" });
        const coords = await getCurrentCoords();
        const w = await fetchCurrentWeather(coords.lat, coords.lon, ctrl.signal);
        if (cancelled) return;
        writeCache({ ts: Date.now(), isRaining: w.isRaining });
        setState({ status: "ready", isRaining: w.isRaining });
      } catch (e) {
        if (cancelled) return;
        // Stay silent if we already have cached data; otherwise mark error.
        const cached = readCache();
        if (cached) {
          setState({ status: "ready", isRaining: cached.isRaining });
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

  const isRaining = state.status === "ready" && state.isRaining;
  return { isRaining, status: state.status };
}