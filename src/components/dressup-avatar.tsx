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
  // Only soft, human-like chibi head silhouettes. Older saved square/diamond
  // values are intentionally softened so every hairstyle fully covers the head.
  switch (shape) {
    case "oval":    return { rx: 27, ry: 31 };
    case "heart":   return { rx: 29, ry: 30 };
    case "square":
    case "diamond":
    case "round":
    default:        return { rx: HEAD_R_BASE, ry: HEAD_R_BASE };
  }
}

function headPath(_shape: FaceShape, rx: number, ry: number): string {
  const cx = HEAD_CX, cy = HEAD_CY;
  // One clean oval/round path keeps the avatar cute and prevents hard corners
  // from peeking out beneath hair on any saved head option.
  return `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0`;
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
  const hi = lighten(color, 0.34);
  const sh = darken(color, 0.28);
  const cx = HEAD_CX;
  const cy = HEAD_CY;
  const top = cy - ry;
  const bottom = cy + ry;
  const sideL = cx - rx;
  const sideR = cx + rx;

  const fullCap = (lower = cy + 4, lift = 6) => (
    <path
      d={`M ${sideL - 2},${lower}
          C ${sideL - 6},${top + 8} ${sideL + 4},${top - lift} ${cx},${top - lift - 2}
          C ${sideR - 4},${top - lift} ${sideR + 6},${top + 8} ${sideR + 2},${lower}
          C ${sideR - 6},${top + 15} ${sideL + 6},${top + 15} ${sideL - 2},${lower} Z`}
      fill={color}
    />
  );

  const roundedBack = (length = 24, flare = 4) => (
    <path
      d={`M ${sideL - 3},${cy - 5}
          C ${sideL - 8},${cy + 12} ${sideL - flare},${bottom + length - 4} ${cx - 9},${bottom + length}
          L ${cx + 9},${bottom + length}
          C ${sideR + flare},${bottom + length - 4} ${sideR + 8},${cy + 12} ${sideR + 3},${cy - 5}
          C ${sideR},${top - 5} ${sideL},${top - 5} ${sideL - 3},${cy - 5} Z`}
      fill={color}
    />
  );

  const bluntBangs = (y = top + 17) => (
    <path
      d={`M ${sideL + 2},${top + 12}
          C ${sideL + 8},${top + 4} ${sideR - 8},${top + 4} ${sideR - 2},${top + 12}
          L ${sideR - 2},${y}
          C ${sideR - 10},${y - 3} ${sideR - 15},${y + 1} ${cx + 8},${y - 1}
          C ${cx + 3},${y + 4} ${cx - 3},${y + 4} ${cx - 8},${y - 1}
          C ${sideL + 15},${y + 1} ${sideL + 10},${y - 3} ${sideL + 2},${y} Z`}
      fill={color}
    />
  );

  const sideBang = (flip = false) => {
    const partX = flip ? sideR - 8 : sideL + 8;
    const sweepX = flip ? sideL + 9 : sideR - 9;
    const tipX = flip ? cx - 5 : cx + 5;
    return (
      <path
        d={`M ${sideL + 3},${top + 12}
            C ${sideL + 10},${top + 4} ${sideR - 10},${top + 4} ${sideR - 3},${top + 12}
            C ${sweepX},${top + 17} ${tipX},${cy + 3} ${tipX},${cy + 10}
            C ${cx + (flip ? 7 : -7)},${cy + 4} ${partX},${top + 14} ${sideL + 3},${top + 12} Z`}
        fill={color}
      />
    );
  };

  const smallShine = (x = cx - 8, y = top + 9) => (
    <path d={`M ${x},${y} C ${x + 7},${y - 4} ${x + 15},${y - 3} ${x + 22},${y + 1}`}
          stroke={hi} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.42" />
  );

  switch (style) {
    case "short":
      return {
        back: null,
        front: (
          <g>
            {fullCap(cy + 4, 5)}
            <path d={`M ${sideL + 3},${cy - 1} C ${sideL + 12},${cy + 4} ${sideL + 15},${cy + 13} ${sideL + 7},${cy + 18}
                      M ${sideR - 3},${cy - 1} C ${sideR - 12},${cy + 4} ${sideR - 15},${cy + 13} ${sideR - 7},${cy + 18}`}
                  stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
            {sideBang()}
            {smallShine()}
          </g>
        ),
      };

    case "long":
      return {
        back: roundedBack(34, 9),
        front: (
          <g>
            {fullCap(cy + 7, 5)}
            {sideBang()}
            <path d={`M ${sideL + 1},${cy + 2} C ${sideL + 1},${cy + 19} ${sideL + 3},${bottom + 22} ${sideL + 10},${bottom + 31}
                      M ${sideR - 1},${cy + 2} C ${sideR - 1},${cy + 19} ${sideR - 3},${bottom + 22} ${sideR - 10},${bottom + 31}`}
                  stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            {smallShine(cx - 5, top + 8)}
          </g>
        ),
      };

    case "bob":
      return {
        back: roundedBack(10, 3),
        front: (
          <g>
            {fullCap(cy + 7, 4)}
            {bluntBangs(top + 19)}
            <path d={`M ${sideL + 3},${cy + 5} C ${sideL + 2},${cy + 18} ${sideL + 5},${bottom + 6} ${sideL + 14},${bottom + 7}
                      M ${sideR - 3},${cy + 5} C ${sideR - 2},${cy + 18} ${sideR - 5},${bottom + 6} ${sideR - 14},${bottom + 7}`}
                  stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        ),
      };

    case "wavy":
      return {
        back: roundedBack(26, 10),
        front: (
          <g>
            {fullCap(cy + 7, 5)}
            {sideBang(true)}
            <path d={`M ${sideL + 1},${cy + 2} C ${sideL - 4},${cy + 15} ${sideL + 9},${cy + 23} ${sideL + 4},${cy + 37}
                      M ${sideR - 1},${cy + 2} C ${sideR + 4},${cy + 15} ${sideR - 9},${cy + 23} ${sideR - 4},${cy + 37}`}
                  stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            {smallShine(cx - 2, top + 9)}
          </g>
        ),
      };

    case "curly":
      return {
        back: <ellipse cx={cx} cy={cy - 5} rx={rx + 5} ry={ry - 2} fill={color} />,
        front: (
          <g>
            <path d={`M ${sideL - 3},${cy + 4}
                      C ${sideL - 6},${top + 3} ${cx - 16},${top - 10} ${cx},${top - 8}
                      C ${cx + 16},${top - 10} ${sideR + 6},${top + 3} ${sideR + 3},${cy + 4}
                      C ${sideR - 4},${top + 16} ${sideL + 4},${top + 16} ${sideL - 3},${cy + 4} Z`}
                  fill={color} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={cx - 24 + i * 9.5} cy={top + 9 + (i % 2) * 2} r="5.8" fill={color} />
            ))}
            <circle cx={cx - 7} cy={top + 3} r="2.4" fill={hi} opacity="0.5" />
          </g>
        ),
      };

    case "afro":
      return {
        back: <ellipse cx={cx} cy={cy - ry * 0.12} rx={rx + 14} ry={ry + 10} fill={color} />,
        front: (
          <g>
            <ellipse cx={cx} cy={cy - 8} rx={rx + 10} ry={ry - 1} fill={color} />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <circle key={i} cx={cx - 30 + i * 10} cy={top + 4 + Math.sin(i) * 2} r="7" fill={color} />
            ))}
            <circle cx={cx - 10} cy={top} r="3" fill={hi} opacity="0.5" />
          </g>
        ),
      };

    case "ponytail":
      return {
        back: (
          <g>
            <ellipse cx={sideR - 3} cy={cy - 1} rx="6" ry="7" fill={color} />
            <path
              d={`M ${sideR - 3},${cy - 2}
                  C ${sideR + 18},${cy + 2} ${sideR + 18},${cy + 23} ${sideR + 9},${cy + 37}
                  C ${sideR + 3},${cy + 47} ${sideR - 6},${cy + 42} ${sideR - 3},${cy + 29}
                  C ${sideR + 1},${cy + 15} ${sideR + 2},${cy + 6} ${sideR - 3},${cy - 2} Z`}
              fill={color}
            />
          </g>
        ),
        front: (
          <g>
            {fullCap(cy + 6, 4)}
            {sideBang(true)}
            <ellipse cx={sideR - 1} cy={cy - 1} rx="2.7" ry="2" fill={sh} />
          </g>
        ),
      };

    case "pigtails":
      return {
        back: (
          <g>
            <ellipse cx={sideL + 3} cy={cy + 1} rx="6" ry="7" fill={color} />
            <ellipse cx={sideR - 3} cy={cy + 1} rx="6" ry="7" fill={color} />
            <path d={`M ${sideL + 2},${cy + 1} C ${sideL - 15},${cy + 9} ${sideL - 15},${cy + 32} ${sideL - 4},${cy + 41}
                      C ${sideL + 6},${cy + 37} ${sideL + 6},${cy + 16} ${sideL + 2},${cy + 1} Z`} fill={color} />
            <path d={`M ${sideR - 2},${cy + 1} C ${sideR + 15},${cy + 9} ${sideR + 15},${cy + 32} ${sideR + 4},${cy + 41}
                      C ${sideR - 6},${cy + 37} ${sideR - 6},${cy + 16} ${sideR - 2},${cy + 1} Z`} fill={color} />
          </g>
        ),
        front: (
          <g>
            {fullCap(cy + 6, 4)}
            {bluntBangs(top + 18)}
            <ellipse cx={sideL + 2} cy={cy + 1} rx="2.5" ry="1.8" fill={sh} />
            <ellipse cx={sideR - 2} cy={cy + 1} rx="2.5" ry="1.8" fill={sh} />
          </g>
        ),
      };

    case "bun":
      return {
        back: <ellipse cx={cx} cy={top - 4} rx="11" ry="9" fill={color} />,
        front: (
          <g>
            {fullCap(cy + 5, 5)}
            {bluntBangs(top + 18)}
            <ellipse cx={cx} cy={top - 5} rx="11" ry="9" fill={color} />
            <path d={`M ${cx - 7},${top - 4} C ${cx - 2},${top - 9} ${cx + 5},${top - 8} ${cx + 8},${top - 3}`}
                  stroke={hi} strokeWidth="1" fill="none" opacity="0.45" />
          </g>
        ),
      };

    case "side-bun":
      return {
        back: <ellipse cx={sideR + 2} cy={top + 7} rx="10" ry="9" fill={color} />,
        front: (
          <g>
            {fullCap(cy + 6, 5)}
            {sideBang()}
            <ellipse cx={sideR + 2} cy={top + 7} rx="10" ry="9" fill={color} />
            <circle cx={sideR} cy={top + 5} r="2.5" fill={hi} opacity="0.45" />
          </g>
        ),
      };

    case "double-bun":
      return {
        back: (
          <g>
            <ellipse cx={cx - rx * 0.62} cy={top - 2} rx="9" ry="8" fill={color} />
            <ellipse cx={cx + rx * 0.62} cy={top - 2} rx="9" ry="8" fill={color} />
          </g>
        ),
        front: (
          <g>
            {fullCap(cy + 5, 4)}
            {bluntBangs(top + 17)}
            <ellipse cx={cx - rx * 0.62} cy={top - 2} rx="9" ry="8" fill={color} />
            <ellipse cx={cx + rx * 0.62} cy={top - 2} rx="9" ry="8" fill={color} />
          </g>
        ),
      };

    case "topknot":
      return {
        back: null,
        front: (
          <g>
            {fullCap(cy + 5, 4)}
            {sideBang()}
            <ellipse cx={cx} cy={top - 8} rx="7" ry="7.5" fill={color} />
            <rect x={cx - 5} y={top - 2} width="10" height="2.5" rx="1.2" fill={sh} />
          </g>
        ),
      };

    case "braids":
      return {
        back: (
          <g>
            <path d={`M ${sideL + 5},${cy + 3} C ${sideL - 2},${cy + 16} ${sideL + 1},${bottom + 16} ${sideL + 7},${bottom + 24}`} stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d={`M ${sideR - 5},${cy + 3} C ${sideR + 2},${cy + 16} ${sideR - 1},${bottom + 16} ${sideR - 7},${bottom + 24}`} stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
            {[0, 1, 2].map((k) => (
              <g key={k}>
                <ellipse cx={sideL + 5 + (k % 2 ? -1.5 : 1.5)} cy={cy + 13 + k * 10} rx="4" ry="3.2" fill={k % 2 ? sh : color} />
                <ellipse cx={sideR - 5 + (k % 2 ? 1.5 : -1.5)} cy={cy + 13 + k * 10} rx="4" ry="3.2" fill={k % 2 ? sh : color} />
              </g>
            ))}
          </g>
        ),
        front: (
          <g>
            {fullCap(cy + 6, 4)}
            {bluntBangs(top + 18)}
          </g>
        ),
      };

    case "fade":
      return {
        back: null,
        front: (
          <g>
            <path
              d={`M ${sideL + 4},${cy - 4}
                  C ${sideL + 5},${top + 4} ${sideR - 7},${top - 6} ${sideR - 4},${cy - 3}
                  C ${cx + 8},${top + 14} ${cx - 8},${top + 15} ${sideL + 4},${cy - 4} Z`}
              fill={color}
            />
            {smallShine(cx - 3, top + 5)}
          </g>
        ),
      };

    case "mohawk":
      return {
        back: null,
        front: (
          <g>
            <path
              d={`M ${cx - 9},${top + 11}
                  C ${cx - 8},${top - 4} ${cx - 2},${top - 13} ${cx},${top - 15}
                  C ${cx + 2},${top - 13} ${cx + 8},${top - 4} ${cx + 9},${top + 11}
                  C ${cx + 4},${top + 7} ${cx - 4},${top + 7} ${cx - 9},${top + 11} Z`}
              fill={color}
            />
            <path d={`M ${cx - 3},${top - 7} C ${cx},${top - 12} ${cx + 3},${top - 7} ${cx + 4},${top + 3}`}
                  stroke={hi} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        ),
      };

    case "undercut":
      return {
        back: null,
        front: (
          <g>
            {fullCap(cy + 1, 4)}
            <path d={`M ${sideL + 4},${top + 13} C ${cx - 4},${top - 2} ${sideR - 8},${top + 4} ${sideR - 3},${top + 18}
                      C ${cx + 5},${top + 18} ${cx - 8},${top + 21} ${sideL + 4},${top + 13} Z`}
                  fill={color} />
            {smallShine(cx + 1, top + 7)}
          </g>
        ),
      };

    default:
      return { back: null, front: fullCap(cy + 5, 5) };
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