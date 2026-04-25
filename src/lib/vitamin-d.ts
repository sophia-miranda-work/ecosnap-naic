/**
 * Vitamin D walk-time estimator.
 *
 * Goal: estimate how many minutes of midday sun exposure a person needs to
 * synthesise ~1000 IU of vitamin D, based on:
 *  - current UV index at their location (Open-Meteo, no API key)
 *  - Fitzpatrick skin type (I–VI)
 *  - age group (skin produces less D with age)
 *  - clothing (% of skin exposed)
 *  - sunscreen on/off
 *
 * This is a friendly approximation, not medical advice. The model:
 *   exposure_min = (BASE_MIN[skin] * AGE_FACTOR * SUNSCREEN_FACTOR)
 *                  / (UV_INDEX * SKIN_EXPOSED_FRACTION)
 * Capped to a sensible daily upper bound.
 */

export type SkinType = 1 | 2 | 3 | 4 | 5 | 6;
export type AgeGroup = "child" | "teen" | "adult" | "senior";
export type Clothing = "swimwear" | "shorts_tee" | "long_sleeves" | "covered";

/** Baseline minutes for ~1000 IU at UV index = 1, fully exposed, age 15–60. */
const BASE_MIN: Record<SkinType, number> = {
  1: 12, // very fair
  2: 15,
  3: 20,
  4: 28,
  5: 40,
  6: 60, // very dark
};

const AGE_FACTOR: Record<AgeGroup, number> = {
  child: 0.9,
  teen: 1.0,
  adult: 1.0,
  senior: 1.6, // older skin synthesises ~50–75% less
};

/** Approx fraction of skin surface area exposed. */
const CLOTHING_EXPOSED: Record<Clothing, number> = {
  swimwear: 0.85,
  shorts_tee: 0.4,
  long_sleeves: 0.15,
  covered: 0.05,
};

/** SPF 15+ blocks roughly 93% of UVB → ~14× longer exposure needed. */
const SUNSCREEN_FACTOR = 14;

export const SKIN_TYPES: { value: SkinType; label: string; desc: string }[] = [
  { value: 1, label: "I", desc: "Very fair, always burns, never tans" },
  { value: 2, label: "II", desc: "Fair, burns easily, tans minimally" },
  { value: 3, label: "III", desc: "Medium, sometimes burns, tans gradually" },
  { value: 4, label: "IV", desc: "Olive, rarely burns, tans easily" },
  { value: 5, label: "V", desc: "Brown, very rarely burns, tans deeply" },
  { value: 6, label: "VI", desc: "Dark brown/black, never burns" },
];

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: "child", label: "Child (<13)" },
  { value: "teen", label: "Teen (13–19)" },
  { value: "adult", label: "Adult (20–59)" },
  { value: "senior", label: "Senior (60+)" },
];

export const CLOTHING_OPTIONS: { value: Clothing; label: string; emoji: string }[] = [
  { value: "swimwear", label: "Swimwear", emoji: "🩱" },
  { value: "shorts_tee", label: "Shorts & T-shirt", emoji: "👕" },
  { value: "long_sleeves", label: "Long sleeves", emoji: "🧥" },
  { value: "covered", label: "Fully covered", emoji: "🧣" },
];

export type VitDInputs = {
  skin: SkinType;
  age: AgeGroup;
  clothing: Clothing;
  sunscreen: boolean;
  uvIndex: number;
};

export type VitDResult = {
  /** Recommended minutes outside today, or null if no UV available. */
  minutes: number | null;
  /** Friendly status message. */
  message: string;
  /** UV bucket label. */
  uvLabel: "none" | "low" | "moderate" | "high" | "very-high" | "extreme";
};

export function uvBucket(uv: number): VitDResult["uvLabel"] {
  if (uv <= 0) return "none";
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "very-high";
  return "extreme";
}

export function calcVitaminDMinutes(input: VitDInputs): VitDResult {
  const exposed = CLOTHING_EXPOSED[input.clothing];
  const uv = Math.max(0, input.uvIndex);

  if (uv <= 0) {
    return {
      minutes: null,
      message:
        "No vitamin D from sun right now — UV is zero. Try again in daylight!",
      uvLabel: "none",
    };
  }
  if (exposed < 0.05) {
    return {
      minutes: null,
      message:
        "With this much covered up, your skin can't make vitamin D from sun. Try exposing hands or face.",
      uvLabel: uvBucket(uv),
    };
  }

  const base = BASE_MIN[input.skin] * AGE_FACTOR[input.age];
  const sunscreen = input.sunscreen ? SUNSCREEN_FACTOR : 1;
  const raw = (base * sunscreen) / (uv * exposed);
  const minutes = Math.max(2, Math.min(180, Math.round(raw)));

  let message = `Walk for about ${minutes} minutes to get your daily vitamin D.`;
  if (input.sunscreen) {
    message +=
      " (Sunscreen blocks most UVB — for vitamin D, expose a small patch of skin without it.)";
  } else if (uv >= 8) {
    message += " UV is high — don't overdo it; consider sunscreen after.";
  }

  return { minutes, message, uvLabel: uvBucket(uv) };
}

/** Fetch the current UV index from Open-Meteo (no API key). */
export async function fetchCurrentUV(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<number> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&timezone=auto`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`UV fetch failed (${res.status})`);
  const json = (await res.json()) as { current?: { uv_index?: number } };
  const uv = json.current?.uv_index;
  if (typeof uv !== "number") throw new Error("UV index missing in response");
  return uv;
}

/** Get the user's current GPS coords. */
export function getCurrentCoords(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation isn't available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(new Error(err.message || "Couldn't read location.")),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
    );
  });
}