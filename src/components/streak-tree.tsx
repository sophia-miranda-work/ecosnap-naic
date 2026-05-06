import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

type Season = "spring" | "summer" | "autumn" | "winter";

function currentSeason(date = new Date()): Season {
  const m = date.getMonth() + 1;
  // Northern-hemisphere seasons (close enough for a kid-friendly visual).
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

/** Map streak (0..∞) to a 0..1 growth value with diminishing returns,
 *  so early days feel rewarding and high streaks still keep growing a bit. */
function growthFor(streak: number): number {
  if (streak <= 0) return 0;
  // Reaches ~0.5 by day 7, ~0.75 by day 21, ~0.9 by day 60.
  return 1 - Math.exp(-streak / 14);
}

/** Deterministic pseudo-random in [0,1) seeded by an integer. */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

type Props = {
  streak: number;
  /** px height of the rendered SVG. */
  size?: number;
  season?: Season;
};

export function StreakTree({ streak, size = 260, season }: Props) {
  const s = season ?? currentSeason();
  const g = growthFor(streak);

  // Tree dimensions
  const trunkHeight = 30 + g * 110; // grows 30 → 140
  const trunkWidth = 8 + g * 14; // 8 → 22
  const canopyR = 14 + g * 70; // 14 → 84

  // Flowers/leaves count grows with streak; capped to keep it tidy.
  const blossomCount = Math.min(28, Math.floor(streak * 0.9));
  const rng = useMemo(() => rand(streak * 9301 + 49297), [streak]);

  // Pre-compute blossom positions once per streak value.
  const blossoms = useMemo(() => {
    const arr: Array<{ x: number; y: number; r: number }> = [];
    for (let i = 0; i < blossomCount; i++) {
      // Distribute around the canopy circle, slightly inside the radius.
      const angle = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * (canopyR - 6);
      arr.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.85, // squish vertically
        r: 2.2 + rng() * 1.8,
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blossomCount, canopyR]);

  // Season palette (uses raw colors for the illustration only).
  const palette = SEASON_PALETTES[s];

  // Viewbox sized to a tall portrait so we always show ground + sky.
  const VB_W = 240;
  const VB_H = 260;
  const groundY = 230;
  const trunkBottomX = VB_W / 2;
  const trunkTopY = groundY - trunkHeight;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Streak tree, ${streak} day${streak === 1 ? "" : "s"}, ${s}`}
      className="block"
    >
      <defs>
        <radialGradient id="streak-sky" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor={palette.skyTop} />
          <stop offset="100%" stopColor={palette.skyBottom} />
        </radialGradient>
        <linearGradient id="streak-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.groundTop} />
          <stop offset="100%" stopColor={palette.groundBottom} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={VB_W} height={groundY} fill="url(#streak-sky)" />
      {/* Sun / moon */}
      <circle cx={VB_W - 40} cy={36} r={s === "winter" ? 12 : 16} fill={palette.sun} opacity={0.9} />
      {s === "winter" &&
        // soft snow flecks
        Array.from({ length: 14 }).map((_, i) => (
          <circle
            key={`snow-${i}`}
            cx={(i * 53) % VB_W}
            cy={20 + ((i * 31) % (groundY - 30))}
            r={1.2}
            fill="#ffffff"
            opacity={0.7}
          />
        ))}

      {/* Ground */}
      <rect x="0" y={groundY} width={VB_W} height={VB_H - groundY} fill="url(#streak-ground)" />
      <ellipse
        cx={trunkBottomX}
        cy={groundY + 4}
        rx={Math.max(20, canopyR * 0.7)}
        ry={6}
        fill={palette.shadow}
        opacity={0.35}
      />

      {/* Trunk */}
      <rect
        x={trunkBottomX - trunkWidth / 2}
        y={trunkTopY}
        width={trunkWidth}
        height={trunkHeight}
        rx={trunkWidth / 2}
        fill={palette.trunk}
      />

      {/* Canopy — only render once we have a sapling */}
      {streak > 0 && (
        <g transform={`translate(${trunkBottomX}, ${trunkTopY})`}>
          {/* Main canopy blob — three overlapping circles for a soft shape */}
          <circle cx={0} cy={0} r={canopyR} fill={palette.leaf} />
          <circle cx={-canopyR * 0.55} cy={canopyR * 0.1} r={canopyR * 0.75} fill={palette.leaf} />
          <circle cx={canopyR * 0.55} cy={canopyR * 0.1} r={canopyR * 0.75} fill={palette.leaf} />
          <circle cx={0} cy={-canopyR * 0.35} r={canopyR * 0.7} fill={palette.leafLight} opacity={0.85} />

          {/* Blossoms / berries / snow tufts depending on season */}
          {blossoms.map((b, i) => (
            <circle
              key={i}
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill={palette.blossom}
              stroke={palette.blossomStroke}
              strokeWidth={0.4}
            />
          ))}
        </g>
      )}

      {/* Tiny seed/sprout when streak is 0 */}
      {streak === 0 && (
        <g transform={`translate(${trunkBottomX}, ${groundY - 6})`}>
          <ellipse cx={0} cy={0} rx={5} ry={3} fill={palette.trunk} />
          <path
            d="M0,0 C-2,-8 -8,-10 -8,-14"
            stroke={palette.leaf}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0,0 C2,-8 8,-10 8,-14"
            stroke={palette.leaf}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}

const SEASON_PALETTES: Record<
  Season,
  {
    skyTop: string;
    skyBottom: string;
    sun: string;
    groundTop: string;
    groundBottom: string;
    shadow: string;
    trunk: string;
    leaf: string;
    leafLight: string;
    blossom: string;
    blossomStroke: string;
  }
> = {
  spring: {
    skyTop: "#cfeaff",
    skyBottom: "#eaf6ff",
    sun: "#ffd76b",
    groundTop: "#9fd47a",
    groundBottom: "#6fa84e",
    shadow: "#3d5a2a",
    trunk: "#7a5236",
    leaf: "#7cc25a",
    leafLight: "#a6d98a",
    blossom: "#ffc4d6",
    blossomStroke: "#e07aa0",
  },
  summer: {
    skyTop: "#9ad3ff",
    skyBottom: "#d6efff",
    sun: "#ffd24a",
    groundTop: "#86c761",
    groundBottom: "#5b8f3e",
    shadow: "#2f4a22",
    trunk: "#6b4628",
    leaf: "#4fa83a",
    leafLight: "#7cc25a",
    blossom: "#fff39a",
    blossomStroke: "#d9b248",
  },
  autumn: {
    skyTop: "#ffd6a3",
    skyBottom: "#ffe9c9",
    sun: "#ff9b54",
    groundTop: "#c79a5b",
    groundBottom: "#8a6739",
    shadow: "#3e2c14",
    trunk: "#5a3a22",
    leaf: "#d97a2c",
    leafLight: "#f0a851",
    blossom: "#b53a1a",
    blossomStroke: "#7a2410",
  },
  winter: {
    skyTop: "#bcd0e6",
    skyBottom: "#e8eef5",
    sun: "#f6f6ff",
    groundTop: "#f3f6fb",
    groundBottom: "#c8d3e0",
    shadow: "#7a8696",
    trunk: "#5a3f2a",
    leaf: "#5a7c66",
    leafLight: "#8aa898",
    blossom: "#ffffff",
    blossomStroke: "#a9bccb",
  },
};

type ModalProps = {
  streak: number;
  open: boolean;
  onClose: () => void;
};

export function StreakTreeModal({ streak, open, onClose }: ModalProps) {
  const season = currentSeason();
  const { t } = useSettings();
  // Lock body scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  if (!open) return null;

  const stage = t(stageLabel(streak));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("Your streak tree")}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/40 px-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`parchment-card relative w-full max-w-sm overflow-hidden p-6 transition-all duration-200 ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("Close")}
          className="absolute right-3 top-3 rounded-full border border-border bg-card p-1.5 text-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("Your streak tree")}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">
            {t("{x} day", { x: streak })}{streak === 1 ? "" : t("s_plural")}
          </h2>
          <p className="mt-0.5 text-sm capitalize text-muted-foreground">
            {stage} · {t(season)}
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <StreakTree streak={streak} size={260} season={season} />
        </div>

        <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
          {t("Every day you complete a quest, your tree grows a little. Miss a day? That's okay — your tree just rests. It will keep growing the next time you return.")}
        </p>
      </div>
    </div>
  );
}

function stageLabel(streak: number): string {
  if (streak <= 0) return "Seed";
  if (streak < 3) return "Sprout";
  if (streak < 7) return "Sapling";
  if (streak < 14) return "Young tree";
  if (streak < 30) return "Flowering tree";
  if (streak < 60) return "Full bloom";
  return "Ancient tree";
}