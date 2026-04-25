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
        const now = ctx.currentTime;
        const notes =
          variant === "coin" ? [988, 1318] : [659, 880, 1175]; // E5,A5,D6 / B5,E6
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = freq;
          o.type = "sine";
          const start = now + i * 0.09;
          const end = start + 0.18;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.18, start + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, end);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(start);
          o.stop(end + 0.02);
        });
        setTimeout(() => ctx.close().catch(() => {}), 800);
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
        utter.rate = 0.95;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
      } catch {
        /* ignore */
      }
    },
    [settings.readToMe],
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
