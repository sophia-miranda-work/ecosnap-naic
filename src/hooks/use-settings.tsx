import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AdventureStyle,
  type Language,
  type Settings,
  type TtsVoice,
} from "@/lib/settings";
import { t as translate } from "@/lib/i18n";
import { AmbiencePlayer, pickAmbienceForHour, type AmbienceKind } from "@/lib/ambience";

type Ctx = {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  setStyle: (style: AdventureStyle) => void;
  setLanguage: (language: Language) => void;
  /** Translate a string using the current language. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  reset: () => void;
  /** Convenience: should we suppress motion (animate-bounce / pulse)? */
  reduceMotion: boolean;
  /** Play a small chime if sound effects are enabled. */
  playChime: (variant?: "success" | "coin") => void;
  /** Speak text aloud via the browser SpeechSynthesis API. */
  speak: (text: string) => void;
  /** Stop any in-progress speech. */
  stopSpeaking: () => void;
  /** Start time-of-day nature ambience (no-op if natureSounds is off). */
  startAmbience: () => void;
  /** Fade out and stop any nature ambience. */
  stopAmbience: () => void;
  /** What ambience would play right now (for UI labels). */
  currentAmbienceKind: AmbienceKind;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  // One shared AudioContext for the whole app. Browsers (esp. iOS Safari)
  // start it suspended until a user gesture, so we lazily create it on first
  // use and call resume() inside that gesture.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambiencePlayerRef = useRef<AmbiencePlayer | null>(null);
  if (typeof window !== "undefined" && !ambiencePlayerRef.current) {
    ambiencePlayerRef.current = new AmbiencePlayer(() => audioCtxRef.current);
  }

  // Globally unlock audio on the first user interaction. This guarantees
  // that any later chime play call has a running context, even if the
  // specific gesture that triggered it is "indirect" (e.g. async).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlock = () => {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) {
        try {
          audioCtxRef.current = new AC();
        } catch {
          return;
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();
      // Play a 1-sample silent buffer — the canonical iOS unlock trick.
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.start(0);
      } catch {
        /* ignore */
      }
    };
    const opts = { once: true, passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

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

  const setLanguage = useCallback((language: Language) => {
    setSettings((s) => ({ ...s, language }));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(settings.language, key, vars),
    [settings.language],
  );

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
        // Reuse the shared (already-unlocked) context if we have one;
        // otherwise create a new one inside this gesture.
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AC();
        }
        const ctx = audioCtxRef.current;
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
        master.gain.value = 0.85;
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
        // NOTE: do NOT close the shared context — we reuse it for later chimes.
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

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AC: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AC();
      } catch {
        return null;
      }
    }
    return audioCtxRef.current;
  }, []);

  const startAmbience = useCallback(() => {
    if (!settings.natureSounds) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    const kind = pickAmbienceForHour(new Date().getHours());
    ambiencePlayerRef.current?.start(kind, 0.32);
  }, [settings.natureSounds, ensureAudioContext]);

  const stopAmbience = useCallback(() => {
    ambiencePlayerRef.current?.stop(0.7);
  }, []);

  // If the user toggles nature sounds off mid-play, stop immediately.
  useEffect(() => {
    if (!settings.natureSounds) {
      ambiencePlayerRef.current?.stop(0.4);
    }
  }, [settings.natureSounds]);

  // Stop ambience if the tab becomes hidden, restart on return only if
  // the consumer (e.g. textarea focus) calls startAmbience again.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      if (document.hidden) ambiencePlayerRef.current?.stop(0.3);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const currentAmbienceKind: AmbienceKind = useMemo(
    () => pickAmbienceForHour(new Date().getHours()),
    // Recompute on each settings change is enough — reflection sessions are short.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.natureSounds, ready],
  );

  const value = useMemo<Ctx>(
    () => ({
      settings,
      ready,
      update,
      setStyle,
      setLanguage,
      t,
      reset,
      reduceMotion,
      playChime,
      speak,
      stopSpeaking,
      startAmbience,
      stopAmbience,
      currentAmbienceKind,
    }),
    [
      settings,
      ready,
      update,
      setStyle,
      setLanguage,
      t,
      reset,
      reduceMotion,
      playChime,
      speak,
      stopSpeaking,
      startAmbience,
      stopAmbience,
      currentAmbienceKind,
    ],
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
