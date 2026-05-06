import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/use-settings";
import musicUrl from "@/assets/background-music.mp3";

/**
 * Loops a soft background music track while the app is open.
 * Respects the `backgroundMusic` setting and pauses when the tab is hidden.
 * Browsers block autoplay until a user gesture, so we also start playback on
 * the first interaction.
 */
export function BackgroundMusic() {
  const { settings, ready } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create the audio element once (client-only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.25;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Play / pause based on the setting.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !ready) return;
    if (settings.backgroundMusic) {
      void audio.play().catch(() => {
        // Autoplay blocked — wait for the first user gesture.
        const resume = () => {
          void audio.play().catch(() => {});
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
          window.removeEventListener("touchstart", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
        window.addEventListener("touchstart", resume, { once: true });
      });
    } else {
      audio.pause();
    }
  }, [settings.backgroundMusic, ready]);

  // Pause when the tab is hidden so it doesn't keep playing in the background.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        audio.pause();
      } else if (settings.backgroundMusic) {
        void audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [settings.backgroundMusic]);

  return null;
}