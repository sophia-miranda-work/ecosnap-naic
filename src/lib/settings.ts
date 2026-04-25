export type AdventureStyle = "wanderer" | "observer" | "voyager";

export type TtsVoice = "warm" | "bright" | "calm" | "storyteller";

export type Settings = {
  /** Chosen adventure style. `null` until onboarding completes. */
  style: AdventureStyle | null;
  /** For Observer mode: custom daily walking goal in meters (any value, even 0). */
  observerGoalMeters: number;
  /** Confetti vs simple success message. */
  celebrationStyle: "sparkly" | "simple";
  /** Plays a chime on quest complete / coin earn. */
  soundEffects: boolean;
  /** Soft nature ambience (birdsong / ocean / crickets) while reflecting. */
  natureSounds: boolean;
  /** Show "Read to me" buttons on quest text, NPC dialogue, fun facts. */
  readToMe: boolean;
  /** Which narrator voice flavor to use for read-aloud. */
  ttsVoice: TtsVoice;
  /** Replace camera with voice-note recording for quests. */
  voiceNoteQuests: boolean;
  /** Big tap-anywhere shutter banner on the camera. */
  autoSnap: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  style: null,
  observerGoalMeters: 0,
  celebrationStyle: "sparkly",
  soundEffects: true,
  natureSounds: false,
  readToMe: false,
  ttsVoice: "warm",
  voiceNoteQuests: false,
  autoSnap: false,
};

export const STORAGE_KEY = "explorer-settings:v1";

export const ADVENTURE_STYLES: Array<{
  id: AdventureStyle;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
}> = [
  {
    id: "wanderer",
    emoji: "🥾",
    name: "The Wanderer",
    tagline: "The standard adventure.",
    description:
      "Walk a short distance to unlock your daily nature quest camera. The classic outdoor experience.",
  },
  {
    id: "observer",
    emoji: "🪟",
    name: "The Observer",
    tagline: "Adventures from anywhere.",
    description:
      "Window-friendly quests like spotting cloud shapes or interesting shadows. Set your own (any-size) walking goal — no minimums.",
  },
  {
    id: "voyager",
    emoji: "🧭",
    name: "The Focused Voyager",
    tagline: "Calm, clear, and steady.",
    description:
      "Dyslexia-friendly font, high-contrast bold theme, and all bouncing/pulsing animations turned off.",
  },
];

/** Per-style minimum walking distance (meters) before the camera unlocks. */
export function requiredMetersFor(style: AdventureStyle | null): number {
  if (style === "observer") return 0;
  return 100;
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota errors */
  }
}
