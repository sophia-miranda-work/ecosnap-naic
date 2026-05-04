import { type Dressup, type HairStyleId, type FaceShape, type BodyShape } from "@/hooks/use-character";
import { getItemById } from "@/lib/shop";

/**
 * Chibi cartoon avatar.
 *
 * Proportions inspired by the user's reference image (Sketchify "Cartoon
 * Style Children"): a very large round head occupies the upper half of the
 * canvas, a tiny torso, short stubby limbs, simple dot eyes, a small mouth
 * and round blush cheeks. Hair is a solid silhouette that wraps the head so
 * styles like ponytails/pigtails clearly attach.
 *
 * Coordinate system: viewBox 100x140.
 * - Head:  cx=50, cy=42, big round.
 * - Torso: y 92..118
 * - Legs:  y 118..134
 */

// ---------------------------- geometry constants ----------------------------
export const HEAD_CX = 50;
export const HEAD_CY = 42;
const HEAD_R_BASE = 30;

function headRadii(shape: FaceShape): { rx: number; ry: number } {
  switch (shape) {
    case "round":   return { rx: 30, ry: 30 };
    case "oval":    return { rx: 28, ry: 31 };
    case "square":  return { rx: 30, ry: 30 };
    case "heart":   return { rx: 30, ry: 31 };
    case "diamond": return { rx: 27, ry: 32 };
    default:        return { rx: HEAD_R_BASE, ry: HEAD_R_BASE };
  }
}

function headPath(shape: FaceShape, rx: number, ry: number): string {
  const cx = HEAD_CX, cy = HEAD_CY;
  switch (shape) {
    case "square":
      return `M ${cx - rx},${cy - ry + 6}
              Q ${cx - rx},${cy - ry} ${cx - rx + 6},${cy - ry}
              L ${cx + rx - 6},${cy - ry}
              Q ${cx + rx},${cy - ry} ${cx + rx},${cy - ry + 6}
              L ${cx + rx},${cy + ry - 8}
              Q ${cx + rx},${cy + ry} ${cx + rx - 8},${cy + ry}
              L ${cx - rx + 8},${cy + ry}
              Q ${cx - rx},${cy + ry} ${cx - rx},${cy + ry - 8} Z`;
    case "heart":
      return `M ${cx - rx},${cy - ry * 0.3}
              Q ${cx - rx},${cy - ry} ${cx - rx * 0.4},${cy - ry}
              Q ${cx},${cy - ry * 0.85} ${cx + rx * 0.4},${cy - ry}
              Q ${cx + rx},${cy - ry} ${cx + rx},${cy - ry * 0.3}
              Q ${cx + rx * 0.9},${cy + ry * 0.55} ${cx},${cy + ry}
              Q ${cx - rx * 0.9},${cy + ry * 0.55} ${cx - rx},${cy - ry * 0.3} Z`;
    case "diamond":
      return `M ${cx},${cy - ry}
              Q ${cx + rx},${cy - ry * 0.2} ${cx + rx * 0.85},${cy + ry * 0.2}
              Q ${cx + rx * 0.5},${cy + ry} ${cx},${cy + ry}
              Q ${cx - rx * 0.5},${cy + ry} ${cx - rx * 0.85},${cy + ry * 0.2}
              Q ${cx - rx},${cy - ry * 0.2} ${cx},${cy - ry} Z`;
    case "oval":
    case "round":
    default:
      return `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0`;
  }
}

// ---------------------------- color helpers ---------------------------------
function lighten(hex: string, amount = 0.25): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace("#", ""));
  if (!m) return hex;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(parseInt(m[1], 16))}, ${mix(parseInt(m[2], 16))}, ${mix(parseInt(m[3], 16))})`;
}
function darken(hex: string, amount = 0.25): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace("#", ""));
  if (!m) return hex;
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${mix(parseInt(m[1], 16))}, ${mix(parseInt(m[2], 16))}, ${mix(parseInt(m[3], 16))})`;
}

// ---------------------------- hair layers -----------------------------------
/**
 * Hair is rendered in two passes — `back` (behind head/body) and `front`
 * (over the forehead). Every piece anchors to the head silhouette so
 * ponytails/pigtails always look attached even if face shape changes.
 */
export function hairLayers(style: HairStyleId, color: string, rx: number, ry: number) {
  if (style === "bald") return { back: null, front: null };
  const hi = lighten(color, 0.35);
  const sh = darken(color, 0.25);
  const cx = HEAD_CX;
  const cy = HEAD_CY;
  const top = cy - ry;
  const sideL = cx - rx;
  const sideR = cx + rx;

  // Hair "cap" — a solid shape that hugs the upper ~60% of the head.
  // Used as the base for most styles so the hair clearly sits on the head.
  const cap = (
    <path
      d={`M ${sideL - 1},${cy + 2}
          Q ${sideL - 2},${top - 2} ${cx - rx * 0.55},${top - 4}
          Q ${cx},${top - 6} ${cx + rx * 0.55},${top - 4}
          Q ${sideR + 2},${top - 2} ${sideR + 1},${cy + 2}
          Q ${cx + rx * 0.6},${top + 8} ${cx},${top + 4}
          Q ${cx - rx * 0.6},${top + 8} ${sideL - 1},${cy + 2} Z`}
      fill={color}
    />
  );

  // Big round dome (used for most cute styles)
  const dome = (
    <path
      d={`M ${sideL - 2},${cy + 4}
          Q ${sideL - 3},${top - 4} ${cx},${top - 6}
          Q ${sideR + 3},${top - 4} ${sideR + 2},${cy + 4}
          L ${sideR + 2},${cy + 4}
          Q ${cx + rx * 0.7},${top + 10} ${cx},${top + 6}
          Q ${cx - rx * 0.7},${top + 10} ${sideL - 2},${cy + 4} Z`}
      fill={color}
    />
  );

  switch (style) {
    case "short":
      return {
        back: null,
        front: (
          <g>
            {dome}
            <path d={`M ${cx - 10},${top + 6} Q ${cx},${top + 2} ${cx + 10},${top + 6}`}
                  stroke={hi} strokeWidth="1.4" fill="none" opacity="0.7" />
          </g>
        ),
      };

    case "long":
      return {
        back: (
          <path
            d={`M ${sideL - 2},${cy - 6}
                Q ${sideL - 6},${cy + ry + 28} ${cx - 10},${cy + ry + 38}
                L ${cx + 10},${cy + ry + 38}
                Q ${sideR + 6},${cy + ry + 28} ${sideR + 2},${cy - 6}
                Q ${cx},${top - 8} ${sideL - 2},${cy - 6} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {dome}
            <path d={`M ${cx - 10},${top + 6} Q ${cx},${top + 2} ${cx + 10},${top + 6}`}
                  stroke={hi} strokeWidth="1.2" fill="none" opacity="0.7" />
          </g>
        ),
      };

    case "bob":
      return {
        back: (
          <path
            d={`M ${sideL - 2},${cy - 6}
                Q ${sideL - 4},${cy + ry + 4} ${cx - 8},${cy + ry + 8}
                L ${cx + 8},${cy + ry + 8}
                Q ${sideR + 4},${cy + ry + 4} ${sideR + 2},${cy - 6}
                Q ${cx},${top - 6} ${sideL - 2},${cy - 6} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {dome}
            <path d={`M ${cx - rx * 0.6},${top + 6} Q ${cx},${top + 2} ${cx + rx * 0.6},${top + 6}`}
                  stroke={hi} strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        ),
      };

    case "wavy":
      return {
        back: (
          <path
            d={`M ${sideL - 3},${cy - 4}
                Q ${sideL - 7},${cy + ry + 18} ${cx - 10},${cy + ry + 26}
                Q ${cx},${cy + ry + 22} ${cx + 10},${cy + ry + 26}
                Q ${sideR + 7},${cy + ry + 18} ${sideR + 3},${cy - 4}
                Q ${cx},${top - 6} ${sideL - 3},${cy - 4} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {dome}
            <path d={`M ${sideL + 2},${top + 8} Q ${cx - rx / 2},${top + 4} ${cx},${top + 7}
                      Q ${cx + rx / 2},${top + 10} ${sideR - 2},${top + 7}`}
                  stroke={hi} strokeWidth="1.4" fill="none" opacity="0.65" />
          </g>
        ),
      };

    case "curly":
      return {
        back: null,
        front: (
          <g>
            {[...Array(10)].map((_, i) => {
              const angle = (i / 9) * Math.PI - Math.PI / 2;
              const r = rx + 1;
              const x = cx + Math.cos(angle) * r * 0.95;
              const y = top + 6 + Math.sin(angle) * 6;
              return <circle key={i} cx={x} cy={y} r="7" fill={color} />;
            })}
            <circle cx={cx} cy={top + 4} r="9" fill={color} />
            <circle cx={cx - 6} cy={top + 2} r="3" fill={hi} opacity="0.55" />
          </g>
        ),
      };

    case "afro":
      return {
        back: <ellipse cx={cx} cy={cy - ry * 0.2} rx={rx + 12} ry={ry + 8} fill={color} />,
        front: (
          <g>
            {[...Array(9)].map((_, i) => {
              const t = i / 8;
              const x = cx - rx - 6 + t * (rx * 2 + 12);
              const y = top - 4 + Math.sin(t * Math.PI) * -4;
              return <circle key={i} cx={x} cy={y} r="6.5" fill={color} />;
            })}
            <circle cx={cx - 8} cy={top - 2} r="3" fill={hi} opacity="0.55" />
          </g>
        ),
      };

    case "ponytail":
      return {
        back: (
          <g>
            {/* tail trailing from the back-right of the head */}
            <path
              d={`M ${sideR - 6},${cy - 6}
                  Q ${sideR + 14},${cy + 4} ${sideR + 16},${cy + 28}
                  Q ${sideR + 16},${cy + 46} ${sideR + 4},${cy + 48}
                  Q ${sideR - 6},${cy + 42} ${sideR - 4},${cy + 24}
                  Q ${sideR + 4},${cy + 6} ${sideR - 8},${cy} Z`}
              fill={color}
            />
            {/* base bump where the tail meets the head */}
            <ellipse cx={sideR - 3} cy={cy - 4} rx="8" ry="7" fill={color} />
          </g>
        ),
        front: (
          <g>
            {dome}
            {/* hair tie */}
            <ellipse cx={sideR - 3} cy={cy - 3} rx="3.2" ry="2.2" fill={sh} />
          </g>
        ),
      };

    case "pigtails":
      return {
        back: (
          <g>
            {/* left tail */}
            <path
              d={`M ${sideL + 6},${cy - 4}
                  Q ${sideL - 14},${cy + 4} ${sideL - 16},${cy + 26}
                  Q ${sideL - 16},${cy + 40} ${sideL - 4},${cy + 42}
                  Q ${sideL + 6},${cy + 38} ${sideL + 4},${cy + 22}
                  Q ${sideL + 8},${cy + 6} ${sideL + 8},${cy} Z`}
              fill={color}
            />
            <ellipse cx={sideL + 4} cy={cy - 2} rx="7" ry="6.5" fill={color} />
            {/* right tail */}
            <path
              d={`M ${sideR - 6},${cy - 4}
                  Q ${sideR + 14},${cy + 4} ${sideR + 16},${cy + 26}
                  Q ${sideR + 16},${cy + 40} ${sideR + 4},${cy + 42}
                  Q ${sideR - 6},${cy + 38} ${sideR - 4},${cy + 22}
                  Q ${sideR - 8},${cy + 6} ${sideR - 8},${cy} Z`}
              fill={color}
            />
            <ellipse cx={sideR - 4} cy={cy - 2} rx="7" ry="6.5" fill={color} />
          </g>
        ),
        front: (
          <g>
            {dome}
            <ellipse cx={sideL + 4} cy={cy - 1} rx="2.6" ry="1.8" fill={sh} />
            <ellipse cx={sideR - 4} cy={cy - 1} rx="2.6" ry="1.8" fill={sh} />
          </g>
        ),
      };

    case "bun":
      return {
        back: <ellipse cx={cx} cy={top - 4} rx="11" ry="9" fill={color} />,
        front: (
          <g>
            {dome}
            <ellipse cx={cx} cy={top - 4} rx="11" ry="9" fill={color} />
            <ellipse cx={cx - 3} cy={top - 6} rx="3" ry="2" fill={hi} opacity="0.6" />
            <rect x={cx - 5} y={top + 2} width="10" height="3" rx="1.5" fill={sh} />
          </g>
        ),
      };

    case "side-bun":
      return {
        back: <ellipse cx={sideR + 3} cy={top + 8} rx="9" ry="8" fill={color} />,
        front: (
          <g>
            {dome}
            <ellipse cx={sideR + 3} cy={top + 8} rx="9" ry="8" fill={color} />
            <ellipse cx={sideR + 1} cy={top + 6} rx="3" ry="2" fill={hi} opacity="0.6" />
          </g>
        ),
      };

    case "double-bun":
      return {
        back: (
          <g>
            <ellipse cx={cx - rx * 0.6} cy={top - 3} rx="8" ry="7" fill={color} />
            <ellipse cx={cx + rx * 0.6} cy={top - 3} rx="8" ry="7" fill={color} />
          </g>
        ),
        front: (
          <g>
            {dome}
            <ellipse cx={cx - rx * 0.6} cy={top - 3} rx="8" ry="7" fill={color} />
            <ellipse cx={cx + rx * 0.6} cy={top - 3} rx="8" ry="7" fill={color} />
          </g>
        ),
      };

    case "topknot":
      return {
        back: null,
        front: (
          <g>
            {dome}
            <ellipse cx={cx} cy={top - 8} rx="6" ry="7" fill={color} />
            <rect x={cx - 5} y={top - 1} width="10" height="2.5" rx="1.2" fill={sh} />
          </g>
        ),
      };

    case "braids":
      return {
        back: (
          <g>
            {[sideL + 4, sideR - 4].map((bx, i) => (
              <g key={i}>
                <path
                  d={`M ${bx},${cy - 4} L ${bx + (i ? 3 : -3)},${cy + ry + 22} L ${bx + (i ? -3 : 3)},${cy + ry + 22} Z`}
                  fill={color}
                />
                {[0, 1, 2, 3, 4].map((k) => (
                  <ellipse
                    key={k}
                    cx={bx + (k % 2 ? 2 : -2)}
                    cy={cy + 4 + k * 8}
                    rx="4"
                    ry="3.2"
                    fill={k % 2 ? sh : color}
                  />
                ))}
              </g>
            ))}
          </g>
        ),
        front: cap,
      };

    case "fade":
      return {
        back: null,
        front: (
          <g>
            <path
              d={`M ${sideL + 2},${cy - 4}
                  Q ${sideL},${top - 2} ${cx},${top - 4}
                  Q ${sideR},${top - 2} ${sideR - 2},${cy - 4}
                  Q ${cx + rx * 0.7},${top + 6} ${cx},${top + 4}
                  Q ${cx - rx * 0.7},${top + 6} ${sideL + 2},${cy - 4} Z`}
              fill={color}
            />
          </g>
        ),
      };

    case "mohawk":
      return {
        back: null,
        front: (
          <g>
            <path
              d={`M ${cx - 7},${top + 4}
                  Q ${cx - 10},${top - 12} ${cx},${top - 16}
                  Q ${cx + 10},${top - 12} ${cx + 7},${top + 4}
                  L ${cx + 5},${top + 8} L ${cx - 5},${top + 8} Z`}
              fill={color}
            />
            <path d={`M ${cx - 5},${top - 8} L ${cx},${top - 14} L ${cx + 5},${top - 8}`}
                  stroke={hi} strokeWidth="1.2" fill="none" opacity="0.6" />
          </g>
        ),
      };

    case "undercut":
      return {
        back: null,
        front: (
          <g>
            <path
              d={`M ${cx - rx + 4},${cy - 8}
                  Q ${cx - rx},${top + 2} ${cx},${top - 4}
                  Q ${cx + rx},${top + 2} ${cx + rx - 4},${cy - 8}
                  Q ${cx + rx * 0.6},${top + 8} ${cx - rx * 0.6},${top + 8}
                  Q ${cx - rx + 4},${top + 4} ${cx - rx + 4},${cy - 8} Z`}
              fill={color}
            />
          </g>
        ),
      };

    default:
      return { back: null, front: cap };
  }
}

// ---------------------------- body shaping ----------------------------------
function bodyMetrics(shape: BodyShape) {
  // Stubby chibi proportions — small torso, very short legs.
  switch (shape) {
    case "slim":    return { torsoW: 22, hipW: 22, shoulderW: 24, legW: 6 };
    case "stocky":  return { torsoW: 32, hipW: 30, shoulderW: 32, legW: 9 };
    case "average":
    default:        return { torsoW: 26, hipW: 26, shoulderW: 28, legW: 7 };
  }
}

// ---------------------------- ear extras ------------------------------------
function EarExtra({ id, side, rx, ry }: { id: string | null | undefined; side: "L" | "R"; rx: number; ry: number }) {
  const item = getItemById(id);
  if (!item) return null;
  const cx = side === "L" ? HEAD_CX - rx : HEAD_CX + rx;
  const cy = HEAD_CY + 4;
  if (item.id === "prem-ears-headphones") {
    return (
      <>
        {side === "R" && (
          <path d={`M ${HEAD_CX - rx},${HEAD_CY - ry + 2} Q ${HEAD_CX},${HEAD_CY - ry - 8} ${HEAD_CX + rx},${HEAD_CY - ry + 2}`}
                stroke={item.color ?? "#333"} strokeWidth="3.5" fill="none" />
        )}
        <ellipse cx={cx} cy={cy} rx="7" ry="8" fill={item.color ?? "#333"} />
        <ellipse cx={cx} cy={cy} rx="3.5" ry="4.5" fill={lighten(item.color ?? "#333", 0.3)} />
      </>
    );
  }
  if (item.id === "prem-ears-pods") {
    return (
      <>
        <ellipse cx={cx} cy={cy} rx="2.4" ry="3.2" fill={item.color ?? "#fff"} />
        <rect x={cx - 1} y={cy + 2} width="2" height="4.5" rx="1" fill={item.color ?? "#fff"} />
      </>
    );
  }
  // hearing aid
  return (
    <>
      <path d={`M ${cx},${cy - 3} q ${side === "L" ? -3 : 3},2 0,5`}
            stroke={item.color ?? "#e8d8c8"} strokeWidth="2" fill="none" />
      <circle cx={cx} cy={cy + 2} r="1.6" fill={item.color ?? "#e8d8c8"} />
    </>
  );
}

// ---------------------------- main component --------------------------------
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
  const dress = getItemById(dressup.dress);
  const earrings = getItemById(dressup.earrings);
  const necklace = getItemById(dressup.necklace);
  const bracelet = getItemById(dressup.bracelet);
  const hairClip = getItemById(dressup.hairClip);
  const earPiercing = getItemById(dressup.earPiercing);
  const facePiercing = getItemById(dressup.facePiercing);

  const faceShape: FaceShape = dressup.faceShape ?? "round";
  const bodyShape: BodyShape = dressup.bodyShape ?? "average";
  const { rx, ry } = headRadii(faceShape);
  const { torsoW, hipW, shoulderW, legW } = bodyMetrics(bodyShape);

  const skinDark = darken(dressup.skin, 0.18);
  const blush = "#f0a4a4";
  const lipColor = darken(dressup.skin, 0.4);

  const topColor = dress?.color ?? top?.color ?? "#e89ab8";
  const bottomColor = dress?.color ?? bottom?.color ?? "#3a4f78";
  const shoesColor = shoes?.color ?? "#3a2a1a";

  const hair = hairLayers(dressup.hairstyle as HairStyleId, dressup.hair, rx, ry);

  // Body coordinates — kept tight under the big head.
  const neckTop = HEAD_CY + ry - 2;
  const torsoTop = neckTop + 4;
  const torsoBottom = torsoTop + 22;
  const legTop = torsoBottom;
  const legBottom = legTop + 14;

  return (
    <svg
      viewBox="0 0 100 140"
      width={size}
      height={size * 1.4}
      className={className}
      role="img"
      aria-label="Your dress-up avatar"
    >
      {/* shadow */}
      <ellipse cx="50" cy="137" rx="28" ry="2.5" fill="#000" opacity="0.15" />

      {/* === BACK HAIR (behind body) === */}
      {hair.back}

      {/* === LEGS — short stubby === */}
      <rect x={50 - hipW / 2 + 1} y={legTop} width={legW * 2} height={legBottom - legTop} rx="3" fill={bottomColor} />
      <rect x={50 + hipW / 2 - 1 - legW * 2} y={legTop} width={legW * 2} height={legBottom - legTop} rx="3" fill={bottomColor} />

      {/* === SHOES === */}
      <ellipse cx={50 - hipW / 2 + 1 + legW} cy={legBottom + 2} rx={legW + 2} ry="3" fill={shoesColor} />
      <ellipse cx={50 + hipW / 2 - 1 - legW} cy={legBottom + 2} rx={legW + 2} ry="3" fill={shoesColor} />

      {/* === TORSO / TOP or DRESS === */}
      {dress ? (
        <path
          d={`M ${50 - shoulderW / 2},${torsoTop}
              Q ${50 - shoulderW / 2 - 3},${torsoTop + 10} ${50 - hipW / 2 - 6},${legTop + 4}
              L ${50 + hipW / 2 + 6},${legTop + 4}
              Q ${50 + shoulderW / 2 + 3},${torsoTop + 10} ${50 + shoulderW / 2},${torsoTop}
              Q ${50},${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`}
          fill={dress.color ?? "#e89ab8"}
        />
      ) : (
        <path
          d={`M ${50 - shoulderW / 2},${torsoTop}
              Q ${50 - shoulderW / 2 - 1},${torsoTop + 12} ${50 - torsoW / 2},${torsoBottom}
              L ${50 + torsoW / 2},${torsoBottom}
              Q ${50 + shoulderW / 2 + 1},${torsoTop + 12} ${50 + shoulderW / 2},${torsoTop}
              Q ${50},${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`}
          fill={topColor}
        />
      )}

      {/* === ARMS — short stubby with mitten hands === */}
      {(["L", "R"] as const).map((side) => {
        const sx = side === "L" ? 50 - shoulderW / 2 - 1 : 50 + shoulderW / 2 + 1;
        const dir = side === "L" ? -1 : 1;
        const sleeveColor = dress?.color ?? topColor;
        const handX = sx + dir * 4;
        const handY = torsoTop + 16;
        return (
          <g key={side}>
            {/* sleeve / arm */}
            <path
              d={`M ${sx},${torsoTop + 1}
                  Q ${sx + dir * 5},${torsoTop + 10} ${handX - dir * 0.5},${handY - 2}
                  L ${handX - dir * 4},${handY - 4}
                  Q ${sx - dir * 1},${torsoTop + 8} ${sx - dir * 2},${torsoTop + 1} Z`}
              fill={sleeveColor}
            />
            {/* mitten hand */}
            <circle cx={handX} cy={handY} r="3.6" fill={dressup.skin} stroke={skinDark} strokeWidth="0.5" />
            {/* simple thumb hint */}
            <ellipse cx={handX - dir * 2.2} cy={handY - 1} rx="1.2" ry="1.6" fill={dressup.skin} stroke={skinDark} strokeWidth="0.3" />
            {/* nails (small dot on top of mitten) */}
            {dressup.nail && (
              <circle cx={handX} cy={handY + 1.5} r="1" fill={dressup.nail} opacity="0.9" />
            )}
            {/* bracelet */}
            {bracelet && (
              <rect x={handX - 4} y={handY - 5} width="8" height="2" rx="1" fill={bracelet.color ?? "#c0a040"} />
            )}
          </g>
        );
      })}

      {/* === NECK (tiny — head almost rests on body) === */}
      <rect x={47} y={neckTop} width={6} height={5} fill={dressup.skin} />

      {/* === NECKLACE === */}
      {necklace && (
        <g>
          <path d={`M ${50 - 8},${torsoTop + 1} Q ${50},${torsoTop + 6} ${50 + 8},${torsoTop + 1}`}
                stroke={necklace.color ?? "#c0a040"} strokeWidth="0.8" fill="none" />
          <circle cx="50" cy={torsoTop + 5} r="1.4" fill={necklace.color ?? "#c0a040"} />
        </g>
      )}

      {/* === EARS === */}
      <ellipse cx={HEAD_CX - rx + 1} cy={HEAD_CY + 4} rx="2.8" ry="4.5" fill={dressup.skin} stroke={skinDark} strokeWidth="0.4" />
      <ellipse cx={HEAD_CX + rx - 1} cy={HEAD_CY + 4} rx="2.8" ry="4.5" fill={dressup.skin} stroke={skinDark} strokeWidth="0.4" />
      <ellipse cx={HEAD_CX - rx + 1} cy={HEAD_CY + 4.5} rx="1" ry="2" fill={skinDark} opacity="0.4" />
      <ellipse cx={HEAD_CX + rx - 1} cy={HEAD_CY + 4.5} rx="1" ry="2" fill={skinDark} opacity="0.4" />

      {/* === EARRINGS === */}
      {earrings && (
        <>
          <circle cx={HEAD_CX - rx + 1} cy={HEAD_CY + 8} r="1.7" fill={earrings.color ?? "#e0b840"} />
          <circle cx={HEAD_CX + rx - 1} cy={HEAD_CY + 8} r="1.7" fill={earrings.color ?? "#e0b840"} />
        </>
      )}

      {/* === HEAD === */}
      <path d={headPath(faceShape, rx, ry)} fill={dressup.skin} stroke={skinDark} strokeWidth="0.6" />

      {/* ear piercing — second tiny stud */}
      {earPiercing && (
        <>
          <circle cx={HEAD_CX - rx + 1} cy={HEAD_CY - 1} r="1" fill={earPiercing.color ?? "#a8d8f0"} />
          <circle cx={HEAD_CX + rx - 1} cy={HEAD_CY - 1} r="1" fill={earPiercing.color ?? "#a8d8f0"} />
        </>
      )}

      {/* === FRONT HAIR === */}
      {hair.front}

      {/* === HAIR CLIP (small icon at temple) === */}
      {hairClip && (
        <text x={HEAD_CX - rx * 0.5} y={HEAD_CY - ry + 8} textAnchor="middle" fontSize="9" dominantBaseline="middle">
          {hairClip.overlayEmoji ?? hairClip.emoji}
        </text>
      )}

      {/* === FACE: big chibi eyes === */}
      {(() => {
        const eyeY = HEAD_CY + 4;
        const eyeOffset = rx * 0.4;
        return (
          <>
            {/* eye whites */}
            <ellipse cx={HEAD_CX - eyeOffset} cy={eyeY} rx="3.4" ry="4.2" fill="#fff" stroke="#1a1410" strokeWidth="0.6" />
            <ellipse cx={HEAD_CX + eyeOffset} cy={eyeY} rx="3.4" ry="4.2" fill="#fff" stroke="#1a1410" strokeWidth="0.6" />
            {/* big dark pupils — very chibi */}
            <ellipse cx={HEAD_CX - eyeOffset} cy={eyeY + 0.6} rx="2.2" ry="3" fill="#1a1410" />
            <ellipse cx={HEAD_CX + eyeOffset} cy={eyeY + 0.6} rx="2.2" ry="3" fill="#1a1410" />
            {/* highlights — two per eye */}
            <circle cx={HEAD_CX - eyeOffset + 0.7} cy={eyeY - 0.8} r="0.9" fill="#fff" />
            <circle cx={HEAD_CX + eyeOffset + 0.7} cy={eyeY - 0.8} r="0.9" fill="#fff" />
            <circle cx={HEAD_CX - eyeOffset - 0.6} cy={eyeY + 1.6} r="0.4" fill="#fff" />
            <circle cx={HEAD_CX + eyeOffset - 0.6} cy={eyeY + 1.6} r="0.4" fill="#fff" />
          </>
        );
      })()}

      {/* tiny nose dot */}
      <circle cx={HEAD_CX} cy={HEAD_CY + 10} r="0.5" fill={skinDark} opacity="0.5" />

      {/* mouth — small smile */}
      <path d={`M ${HEAD_CX - 2.5},${HEAD_CY + 13} Q ${HEAD_CX},${HEAD_CY + 15.5} ${HEAD_CX + 2.5},${HEAD_CY + 13}`}
            stroke={lipColor} strokeWidth="0.9" fill="none" strokeLinecap="round" />

      {/* face piercing */}
      {facePiercing && (() => {
        const my = HEAD_CY + 13;
        if (facePiercing.id === "prem-face-nose") {
          return <circle cx={HEAD_CX + 2} cy={HEAD_CY + 10.5} r="0.9" fill={facePiercing.color ?? "#e0e0f0"} />;
        }
        if (facePiercing.id === "prem-face-eyebrow") {
          return <rect x={HEAD_CX - rx * 0.4 - 3} y={HEAD_CY - 1} width="2.5" height="0.9" fill={facePiercing.color ?? "#a0a0b0"} />;
        }
        return <circle cx={HEAD_CX - 4} cy={my + 2} r="0.9" fill="none" stroke={facePiercing.color ?? "#c0c0c0"} strokeWidth="0.6" />;
      })()}

      {/* big round blush cheeks */}
      <circle cx={HEAD_CX - rx * 0.6} cy={HEAD_CY + 9} r="3" fill={blush} opacity="0.55" />
      <circle cx={HEAD_CX + rx * 0.6} cy={HEAD_CY + 9} r="3" fill={blush} opacity="0.55" />

      {/* ear extras */}
      <EarExtra id={dressup.ears} side="L" rx={rx} ry={ry} />
      <EarExtra id={dressup.ears} side="R" rx={rx} ry={ry} />

      {/* === HAT (emoji overlay) === */}
      {hat && (
        <text x={HEAD_CX} y={HEAD_CY - ry + 2} textAnchor="middle" fontSize="26" dominantBaseline="middle">
          {hat.overlayEmoji ?? hat.emoji}
        </text>
      )}

      {/* === ACCESSORY (face overlay e.g. glasses) === */}
      {accessory && (
        <text x={HEAD_CX} y={HEAD_CY + 4} textAnchor="middle" fontSize="16" dominantBaseline="middle">
          {accessory.overlayEmoji ?? accessory.emoji}
        </text>
      )}
    </svg>
  );
}