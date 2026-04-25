import { Volume2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

type Props = {
  text: string;
  label?: string;
  className?: string;
};

/**
 * "Read to me" button — renders only when the Read-to-me setting is on.
 * Uses the browser's SpeechSynthesis API.
 */
export function TtsButton({ text, label = "Read to me", className }: Props) {
  const { settings, speak } = useSettings();
  if (!settings.readToMe) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak(text);
      }}
      aria-label={label}
      className={
        className ??
        "inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground hover:bg-foreground/20"
      }
    >
      <Volume2 className="h-3 w-3" aria-hidden />
      <span>🔊 {label}</span>
    </button>
  );
}
