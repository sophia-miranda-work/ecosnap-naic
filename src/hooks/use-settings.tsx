import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AdventureStyle,
  type Settings,
  type TtsVoice,
} from "@/lib/settings";

type Ctx = {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  setStyle: (style: AdventureStyle) => void;
  reset: () => void;
  /** Convenience: should we suppress motion (animate-bounce / pulse)? */
  reduceMotion: boolean;
  /** Play a small chime if sound effects are enabled. */
  playChime: (variant?: "success" | "coin") => void;
  /** Speak text aloud via the browser SpeechSynthesis API. */
  speak: (text: string) => void;
  /** Stop any in-progress speech. */
  stopSpeaking: () => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  // Load once on mount (client only).
  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  // Persist on every change after initial load.
  useEffect(() => {
    if (ready) saveSettings(settings);
  }, [settings, ready]);

  // Apply theme attribute for Focused Voyager (CSS hooks live in styles.css).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (settings.style === "voyager") {
      root.setAttribute("data-voyager", "true");
    } else {
      root.removeAttribute("data-voyager");
    }
  }, [settings.style]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const setStyle = useCallback((style: AdventureStyle) => {
    setSettings((s) => ({ ...s, style }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const reduceMotion = settings.style === "voyager";

  const playChime = useCallback(
    (variant: "success" | "coin" = "success") => {
      if (!settings.soundEffects) return;
      if (typeof window === "undefined") return;
      const AC: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      try {
        const ctx = new AC();
        // Browsers often start the context suspended until a user gesture.
        // These chimes only fire after a tap/click, so resume() is safe.
        if (ctx.state === "suspended") void ctx.resume();
        const now = ctx.currentTime;
        // Bell-like notes: coin = bright two-note "ding-ding",
        // success = warm three-note arpeggio.
        const notes =
          variant === "coin"
            ? [1046.5, 1567.98] // C6, G6
            : [783.99, 1046.5, 1567.98]; // G5, C6, G6
        // Master bus with a gentle limiter-ish curve so it's loud but clean.
        const master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(ctx.destination);
        notes.forEach((freq, i) => {
          const start = now + i * 0.11;
          const end = start + 0.9; // long bell tail
          // Layer a sine fundamental + triangle harmonic + bright 2x partial
          // for a real "chime" timbre instead of a thin beep.
          const layers: Array<{ type: OscillatorType; mult: number; gain: number }> = [
            { type: "sine", mult: 1, gain: 0.6 },
            { type: "triangle", mult: 2, gain: 0.18 },
            { type: "sine", mult: 3.01, gain: 0.08 },
          ];
          layers.forEach(({ type, mult, gain }) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = type;
            o.frequency.value = freq * mult;
            g.gain.setValueAtTime(0, start);
            g.gain.linearRampToValueAtTime(gain, start + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0008, end);
            o.connect(g);
            g.connect(master);
            o.start(start);
            o.stop(end + 0.05);
          });
        });
        const totalDur = 200 + notes.length * 110 + 1000;
        setTimeout(() => ctx.close().catch(() => {}), totalDur);
      } catch {
        /* ignore */
      }
    },
    [settings.soundEffects],
  );

  const speak = useCallback(
    (text: string) => {
      if (!settings.readToMe) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const tuning = voiceTuning(settings.ttsVoice);
        utter.rate = tuning.rate;
        utter.pitch = tuning.pitch;
        const voice = pickVoice(settings.ttsVoice);
        if (voice) utter.voice = voice;
        utter.lang = voice?.lang ?? "en-US";
        window.speechSynthesis.speak(utter);
      } catch {
        /* ignore */
      }
    },
    [settings.readToMe, settings.ttsVoice],
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      ready,
      update,
      setStyle,
      reset,
      reduceMotion,
      playChime,
      speak,
      stopSpeaking,
    }),
    [settings, ready, update, setStyle, reset, reduceMotion, playChime, speak, stopSpeaking],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within <SettingsProvider>");
  }
  return ctx;
}

/** Per-flavor pitch / rate tuning. Browser voices are limited, so we shape
 *  what we can to give each option a distinct character. */
function voiceTuning(flavor: TtsVoice): { rate: number; pitch: number } {
  switch (flavor) {
    case "bright":
      return { rate: 1.05, pitch: 1.25 };
    case "calm":
      return { rate: 0.85, pitch: 0.85 };
    case "storyteller":
      return { rate: 0.9, pitch: 1.1 };
    case "warm":
    default:
      return { rate: 0.95, pitch: 1.0 };
  }
}

/** Pick the best matching voice for the chosen flavor.
 *  Falls back gracefully if no voices are loaded yet. */
function pickVoice(flavor: TtsVoice): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;

  // Prefer high-quality / natural voices when available.
  const natural = pool.filter((v) =>
    /natural|neural|premium|enhanced|google|samantha|karen|moira|tessa|daniel|fiona/i.test(v.name),
  );

  const preference: Record<TtsVoice, RegExp> = {
    warm: /samantha|karen|google us english|english united states|jenny|aria/i,
    bright: /female|google uk english female|kathy|zira|moira|fiona/i,
    calm: /male|daniel|google uk english male|alex|david|fred/i,
    storyteller: /google uk english|moira|tessa|daniel|fiona|karen/i,
  };

  const want = preference[flavor];
  return (
    (natural.length ? natural : pool).find((v) => want.test(v.name)) ??
    natural[0] ??
    pool[0] ??
    null
  );
}
