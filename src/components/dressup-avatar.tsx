import { type Dressup } from "@/hooks/use-character";
import { getItemById } from "@/lib/shop";

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
      {dressup.hairstyle !== "bald" && (
        <>
          {dressup.hairstyle === "short" && (
            <path
              d="M32,38 Q32,22 50,22 Q68,22 68,38 L66,32 Q60,28 50,28 Q40,28 34,32 Z"
              fill={dressup.hair}
            />
          )}
          {dressup.hairstyle === "long" && (
            <>
              <path
                d="M30,40 Q30,20 50,20 Q70,20 70,40 L70,68 L62,64 L62,38 Q56,32 50,32 Q44,32 38,38 L38,64 L30,68 Z"
                fill={dressup.hair}
              />
            </>
          )}
          {dressup.hairstyle === "bun" && (
            <>
              <path
                d="M32,38 Q32,22 50,22 Q68,22 68,38 L66,32 Q60,28 50,28 Q40,28 34,32 Z"
                fill={dressup.hair}
              />
              <circle cx="50" cy="18" r="7" fill={dressup.hair} />
            </>
          )}
        </>
      )}

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
