import { type Dressup, type Hairstyle } from "@/hooks/use-character";
import { getItemById } from "@/lib/shop";

/** Lighten a hex color by `amount` (0-1) toward white — for hair highlights. */
function lighten(hex: string, amount = 0.25): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace("#", ""));
  if (!m) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix(parseInt(m[1], 16));
  const g = mix(parseInt(m[2], 16));
  const b = mix(parseInt(m[3], 16));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Render the chosen hairstyle. Each style is a soft, rounded silhouette with
 * a subtle highlight stripe so the hair feels less flat than a plain block.
 */
function HairLayer({ style, color }: { style: Hairstyle; color: string }) {
  if (style === "bald") return null;
  const hi = lighten(color, 0.28);

  switch (style) {
    case "short":
      return (
        <g>
          {/* Soft round cap with a swept fringe */}
          <path
            d="M30,40 Q28,20 50,19 Q72,20 70,40 Q68,30 60,28 Q58,34 50,33 Q40,34 36,30 Q32,33 30,40 Z"
            fill={color}
          />
          {/* Side-swept fringe */}
          <path
            d="M36,30 Q44,26 56,28 Q60,32 52,34 Q44,34 36,30 Z"
            fill={color}
          />
          {/* Highlight */}
          <path
            d="M40,24 Q48,20 56,22 Q52,25 46,26 Z"
            fill={hi}
            opacity="0.6"
          />
        </g>
      );

    case "long":
      return (
        <g>
          {/* Long flowing hair down past the shoulders */}
          <path
            d="M28,42 Q26,18 50,18 Q74,18 72,42 L72,80 Q70,84 64,82 L64,40 Q60,32 50,32 Q40,32 36,40 L36,82 Q30,84 28,80 Z"
            fill={color}
          />
          {/* Forelock */}
          <path
            d="M36,30 Q46,24 58,28 Q60,34 50,34 Q42,34 36,30 Z"
            fill={color}
          />
          {/* Highlight stripe */}
          <path
            d="M32,36 Q34,26 40,22 Q38,30 35,40 Z"
            fill={hi}
            opacity="0.55"
          />
        </g>
      );

    case "bun":
      return (
        <g>
          {/* Slicked-back base */}
          <path
            d="M32,40 Q30,22 50,21 Q70,22 68,40 Q66,32 58,30 Q52,34 50,34 Q42,33 36,32 Q33,34 32,40 Z"
            fill={color}
          />
          {/* The bun itself */}
          <ellipse cx="50" cy="16" rx="9" ry="8" fill={color} />
          <ellipse cx="47" cy="14" rx="3" ry="2.5" fill={hi} opacity="0.6" />
          {/* Tiny hair tie */}
          <rect x="46.5" y="22.5" width="7" height="2.5" rx="1.2" fill={hi} opacity="0.7" />
        </g>
      );

    case "curly":
      return (
        <g>
          {/* Cloud-like cluster of overlapping circles */}
          <circle cx="38" cy="28" r="7" fill={color} />
          <circle cx="46" cy="22" r="8" fill={color} />
          <circle cx="54" cy="22" r="8" fill={color} />
          <circle cx="62" cy="28" r="7" fill={color} />
          <circle cx="33" cy="34" r="5.5" fill={color} />
          <circle cx="67" cy="34" r="5.5" fill={color} />
          <circle cx="50" cy="20" r="6" fill={color} />
          {/* Highlights */}
          <circle cx="44" cy="20" r="2" fill={hi} opacity="0.6" />
          <circle cx="56" cy="20" r="2" fill={hi} opacity="0.6" />
        </g>
      );

    case "ponytail":
      return (
        <g>
          {/* Cap with sweep toward the tie — drawn first so the tail overlaps it */}
          <path
            d="M30,40 Q28,20 50,19 Q72,20 70,40 Q68,30 58,28 Q52,34 46,32 Q38,34 34,32 Q31,34 30,40 Z"
            fill={color}
          />
          {/* Ponytail: starts inside the head silhouette (around x=60, y=34)
              and trails down/back so the base visually merges with the cap. */}
          <path
            d="M58,32 Q72,38 76,52 Q78,64 72,68 Q68,68 68,62 Q70,52 64,44 Q60,38 56,36 Z"
            fill={color}
          />
          {/* Hair tie */}
          <circle cx="62" cy="36" r="2.4" fill={hi} opacity="0.85" />
          {/* Highlight */}
          <path d="M42,22 Q50,18 58,22 Q52,25 46,25 Z" fill={hi} opacity="0.55" />
        </g>
      );

    case "pigtails":
      return (
        <g>
          {/* Cap with center part — drawn first so pigtail bases tuck under it */}
          <path
            d="M30,40 Q28,20 50,19 Q72,20 70,40 Q66,30 58,30 Q54,34 50,34 Q46,34 42,30 Q34,30 30,40 Z"
            fill={color}
          />
          {/* Left pigtail: base sits inside the head circle near (34,40),
              then sweeps out and down past the jaw. */}
          <path
            d="M34,38 Q24,46 22,60 Q22,68 28,68 Q32,66 30,60 Q30,52 36,44 Z"
            fill={color}
          />
          {/* Right pigtail — mirrored. */}
          <path
            d="M66,38 Q76,46 78,60 Q78,68 72,68 Q68,66 70,60 Q70,52 64,44 Z"
            fill={color}
          />
          {/* Center part highlight */}
          <path d="M49,22 L51,22 L51,32 L49,32 Z" fill={hi} opacity="0.7" />
          {/* Pigtail ties */}
          <circle cx="32" cy="44" r="2.2" fill={hi} opacity="0.85" />
          <circle cx="68" cy="44" r="2.2" fill={hi} opacity="0.85" />
        </g>
      );
  }
}

/**
 * SVG paper-doll. Cozy, friendly, deliberately simple — clothes are
 * recolorable rectangles + the occasional emoji overlay (hats, accessories).
 */
export function DressupAvatar({
  dressup,
  size = 200,
  className = "",
}: {
  dressup: Dressup;
  size?: number;
  className?: string;
}) {
  const hat = getItemById(dressup.hat);
  const top = getItemById(dressup.top);
  const bottom = getItemById(dressup.bottom);
  const shoes = getItemById(dressup.shoes);
  const accessory = getItemById(dressup.accessory);

  const topColor = top?.color ?? "#cbb999";
  const bottomColor = bottom?.color ?? "#7a6a55";
  const shoesColor = shoes?.color ?? "#3a2a1a";

  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={size * 1.4}
      className={className}
      role="img"
      aria-label="Your dress-up avatar"
    >
      {/* Shadow */}
      <ellipse cx="50" cy="135" rx="22" ry="3" fill="#000" opacity="0.15" />

      {/* Legs / pants */}
      <rect x="38" y="92" width="10" height="28" rx="3" fill={bottomColor} />
      <rect x="52" y="92" width="10" height="28" rx="3" fill={bottomColor} />

      {/* Shoes */}
      <rect x="36" y="118" width="14" height="8" rx="3" fill={shoesColor} />
      <rect x="50" y="118" width="14" height="8" rx="3" fill={shoesColor} />

      {/* Body / top */}
      <rect x="32" y="60" width="36" height="38" rx="8" fill={topColor} />

      {/* Arms */}
      <rect x="22" y="62" width="10" height="28" rx="5" fill={topColor} />
      <rect x="68" y="62" width="10" height="28" rx="5" fill={topColor} />
      {/* Hands */}
      <circle cx="27" cy="92" r="5" fill={dressup.skin} />
      <circle cx="73" cy="92" r="5" fill={dressup.skin} />

      {/* Neck */}
      <rect x="46" y="54" width="8" height="8" fill={dressup.skin} />

      {/* Head */}
      <circle cx="50" cy="40" r="18" fill={dressup.skin} />

      {/* Hair */}
      <HairLayer style={dressup.hairstyle} color={dressup.hair} />

      {/* Face */}
      <circle cx="44" cy="40" r="1.5" fill="#2a1a14" />
      <circle cx="56" cy="40" r="1.5" fill="#2a1a14" />
      <path
        d="M45,46 Q50,49 55,46"
        stroke="#2a1a14"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="40" cy="44" r="2" fill="#e89a9a" opacity="0.5" />
      <circle cx="60" cy="44" r="2" fill="#e89a9a" opacity="0.5" />

      {/* Hat */}
      {hat && (
        <text
          x="50"
          y="22"
          textAnchor="middle"
          fontSize="22"
          dominantBaseline="middle"
        >
          {hat.overlayEmoji ?? hat.emoji}
        </text>
      )}

      {/* Accessory (face overlay) */}
      {accessory && (
        <text
          x="50"
          y="42"
          textAnchor="middle"
          fontSize="16"
          dominantBaseline="middle"
        >
          {accessory.overlayEmoji ?? accessory.emoji}
        </text>
      )}
    </svg>
  );
}
