import { type Dressup, type HairStyleId, type FaceShape, type BodyShape } from "@/hooks/use-character";
import { getItemById } from "@/lib/shop";

/**
 * New cartoon avatar.
 *
 * Design goals (per user feedback):
 *  - Big expressive head, real eyes (whites + pupils + highlight), real mouth,
 *    visible ears, fingers on the hands, shaped torso & legs, nail polish.
 *  - Hair pieces are anchored to the head silhouette so ponytails / pigtails /
 *    bangs always look attached.
 *  - Slot-based overlays for jewelry, hair clips, piercings, hearing aids /
 *    headphones, and dresses.
 *
 * Coordinate system: viewBox 100x160. Head sits in the upper third; body & legs
 * fill the rest. All hair / face pieces reference HEAD_* constants below so a
 * future change to head position or size won't break attachment.
 */

// ---------------------------- geometry constants ----------------------------
const HEAD_CX = 50;
const HEAD_CY = 36;
const HEAD_RX_BASE = 20;
const HEAD_RY_BASE = 22;

function headRadii(shape: FaceShape): { rx: number; ry: number } {
  switch (shape) {
    case "round":   return { rx: 21, ry: 21 };
    case "oval":    return { rx: 19, ry: 23 };
    case "square":  return { rx: 21, ry: 22 };
    case "heart":   return { rx: 21, ry: 22 };
    case "diamond": return { rx: 18, ry: 23 };
    default:        return { rx: HEAD_RX_BASE, ry: HEAD_RY_BASE };
  }
}

/** SVG path for the head silhouette by face shape. All shapes are designed to
 *  fit roughly within (HEAD_CX ± rx, HEAD_CY ± ry). */
function headPath(shape: FaceShape, rx: number, ry: number): string {
  const cx = HEAD_CX, cy = HEAD_CY;
  switch (shape) {
    case "round":
      return `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0`;
    case "square":
      // Rounded rectangle face (strong jaw)
      return `M ${cx - rx},${cy - ry + 4}
              Q ${cx - rx},${cy - ry} ${cx - rx + 4},${cy - ry}
              L ${cx + rx - 4},${cy - ry}
              Q ${cx + rx},${cy - ry} ${cx + rx},${cy - ry + 4}
              L ${cx + rx},${cy + ry - 6}
              Q ${cx + rx},${cy + ry} ${cx + rx - 6},${cy + ry}
              L ${cx - rx + 6},${cy + ry}
              Q ${cx - rx},${cy + ry} ${cx - rx},${cy + ry - 6} Z`;
    case "heart":
      // Wider at top, pointed chin
      return `M ${cx - rx},${cy - ry * 0.4}
              Q ${cx - rx},${cy - ry} ${cx - rx * 0.4},${cy - ry}
              Q ${cx},${cy - ry * 0.85} ${cx + rx * 0.4},${cy - ry}
              Q ${cx + rx},${cy - ry} ${cx + rx},${cy - ry * 0.4}
              Q ${cx + rx * 0.9},${cy + ry * 0.5} ${cx},${cy + ry}
              Q ${cx - rx * 0.9},${cy + ry * 0.5} ${cx - rx},${cy - ry * 0.4} Z`;
    case "diamond":
      return `M ${cx},${cy - ry}
              Q ${cx + rx},${cy - ry * 0.2} ${cx + rx * 0.85},${cy + ry * 0.2}
              Q ${cx + rx * 0.5},${cy + ry} ${cx},${cy + ry}
              Q ${cx - rx * 0.5},${cy + ry} ${cx - rx * 0.85},${cy + ry * 0.2}
              Q ${cx - rx},${cy - ry * 0.2} ${cx},${cy - ry} Z`;
    case "oval":
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

// ---------------------------- hair layer ------------------------------------
/**
 * The hair is rendered in two passes: a BACK layer (drawn behind the head, e.g.
 * long flowing hair, ponytail trail, pigtail tails) and a FRONT layer (drawn
 * after the head so the hairline & fringe sit ON the head). Each style returns
 * `{ back, front }` JSX. Pieces use the live head radii so they stay attached
 * even when the face shape changes.
 */
function hairLayers(style: HairStyleId, color: string, rx: number, ry: number) {
  if (style === "bald") return { back: null, front: null };
  const hi = lighten(color, 0.3);
  const sh = darken(color, 0.2);
  const cx = HEAD_CX;
  const cy = HEAD_CY;
  const top = cy - ry;
  const sideL = cx - rx;
  const sideR = cx + rx;

  // Anchor helpers — points right on the head silhouette
  const A = {
    crown:    { x: cx,           y: top },
    foreheadL:{ x: cx - rx * 0.6, y: top + 2 },
    foreheadR:{ x: cx + rx * 0.6, y: top + 2 },
    templeL:  { x: sideL + 2,    y: cy - ry * 0.3 },
    templeR:  { x: sideR - 2,    y: cy - ry * 0.3 },
    earL:     { x: sideL,        y: cy },
    earR:     { x: sideR,        y: cy },
  };

  // Reusable hair-cap path (covers the top of the head with a soft fringe)
  const cap = (
    <path
      d={`M ${A.templeL.x - 2},${cy + 2}
          Q ${cx - rx - 2},${top + 4} ${cx},${top - 2}
          Q ${cx + rx + 2},${top + 4} ${A.templeR.x + 2},${cy + 2}
          Q ${cx + rx * 0.7},${top + 6} ${cx},${top + 4}
          Q ${cx - rx * 0.7},${top + 6} ${A.templeL.x - 2},${cy + 2} Z`}
      fill={color}
    />
  );

  switch (style) {
    case "short":
      return {
        back: null,
        front: (
          <g>
            {cap}
            <path d={`M ${cx - 8},${top + 4} Q ${cx},${top + 1} ${cx + 8},${top + 4}
                      Q ${cx + 4},${top + 8} ${cx},${top + 6}
                      Q ${cx - 4},${top + 8} ${cx - 8},${top + 4} Z`} fill={hi} opacity="0.55" />
          </g>
        ),
      };

    case "long":
      return {
        back: (
          // long flowing hair down the back
          <path
            d={`M ${sideL - 1},${cy - 4}
                Q ${sideL - 4},${cy + ry + 20} ${cx - 6},${cy + ry + 30}
                L ${cx + 6},${cy + ry + 30}
                Q ${sideR + 4},${cy + ry + 20} ${sideR + 1},${cy - 4}
                Q ${cx},${top - 6} ${sideL - 1},${cy - 4} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {cap}
            {/* side bangs */}
            <path d={`M ${cx - rx * 0.95},${cy - ry * 0.4}
                      Q ${cx - rx * 0.5},${top + 8} ${cx},${top + 5}
                      Q ${cx + rx * 0.5},${top + 8} ${cx + rx * 0.95},${cy - ry * 0.4}
                      Q ${cx + rx * 0.6},${top + 4} ${cx},${top + 1}
                      Q ${cx - rx * 0.6},${top + 4} ${cx - rx * 0.95},${cy - ry * 0.4} Z`}
                  fill={color} />
            <path d={`M ${cx - 8},${top + 5} Q ${cx},${top + 1} ${cx + 8},${top + 5}`}
                  stroke={hi} strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        ),
      };

    case "bun":
      return {
        back: <ellipse cx={cx} cy={top - 2} rx="9" ry="8" fill={color} />,
        front: (
          <g>
            {cap}
            <ellipse cx={cx} cy={top - 2} rx="9" ry="8" fill={color} />
            <ellipse cx={cx - 3} cy={top - 4} rx="3" ry="2" fill={hi} opacity="0.6" />
            <rect x={cx - 4} y={top + 3} width="8" height="2.5" rx="1.2" fill={sh} />
          </g>
        ),
      };

    case "side-bun":
      return {
        back: <ellipse cx={sideR + 2} cy={top + 6} rx="8" ry="7" fill={color} />,
        front: (
          <g>
            {cap}
            <ellipse cx={sideR + 2} cy={top + 6} rx="8" ry="7" fill={color} />
            <ellipse cx={sideR + 1} cy={top + 4} rx="2.5" ry="1.8" fill={hi} opacity="0.6" />
          </g>
        ),
      };

    case "double-bun":
      return {
        back: (
          <g>
            <ellipse cx={cx - rx * 0.6} cy={top - 2} rx="6.5" ry="6" fill={color} />
            <ellipse cx={cx + rx * 0.6} cy={top - 2} rx="6.5" ry="6" fill={color} />
          </g>
        ),
        front: (
          <g>
            {cap}
            <ellipse cx={cx - rx * 0.6} cy={top - 2} rx="6.5" ry="6" fill={color} />
            <ellipse cx={cx + rx * 0.6} cy={top - 2} rx="6.5" ry="6" fill={color} />
          </g>
        ),
      };

    case "topknot":
      return {
        back: null,
        front: (
          <g>
            {cap}
            <ellipse cx={cx} cy={top - 6} rx="5" ry="6" fill={color} />
            <rect x={cx - 4} y={top - 1} width="8" height="2" rx="1" fill={sh} />
          </g>
        ),
      };

    case "curly":
      return {
        back: null,
        front: (
          <g>
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI - Math.PI / 2;
              const r = rx + 1;
              const x = cx + Math.cos(angle) * r;
              const y = top + 6 + Math.sin(angle) * 5;
              return <circle key={i} cx={x} cy={y} r="6" fill={color} />;
            })}
            <circle cx={cx} cy={top + 2} r="7" fill={color} />
            <circle cx={cx - 5} cy={top + 1} r="3" fill={hi} opacity="0.55" />
          </g>
        ),
      };

    case "afro":
      return {
        back: (
          <ellipse cx={cx} cy={cy - ry * 0.2} rx={rx + 9} ry={ry + 6} fill={color} />
        ),
        front: (
          <g>
            {/* front bumps for texture */}
            {[...Array(7)].map((_, i) => {
              const t = i / 6;
              const x = cx - rx - 4 + t * (rx * 2 + 8);
              const y = top - 2 + Math.sin(t * Math.PI) * -4;
              return <circle key={i} cx={x} cy={y} r="5.5" fill={color} />;
            })}
            <circle cx={cx - 6} cy={top - 2} r="2.5" fill={hi} opacity="0.5" />
          </g>
        ),
      };

    case "ponytail":
      // ponytail trails behind from the back/right
      return {
        back: (
          <g>
            <path
              d={`M ${sideR - 4},${cy - 4}
                  Q ${sideR + 8},${cy + 8} ${sideR + 10},${cy + 24}
                  Q ${sideR + 10},${cy + 38} ${sideR + 2},${cy + 40}
                  Q ${sideR - 4},${cy + 36} ${sideR - 2},${cy + 22}
                  Q ${sideR + 2},${cy + 10} ${sideR - 6},${cy} Z`}
              fill={color}
            />
            <ellipse cx={sideR - 2} cy={cy - 2} rx="6" ry="6" fill={color} />
          </g>
        ),
        front: (
          <g>
            {cap}
            <circle cx={sideR - 2} cy={cy - 2} r="2.4" fill={sh} />
          </g>
        ),
      };

    case "pigtails":
      return {
        back: (
          <g>
            {/* left tail */}
            <path
              d={`M ${sideL + 4},${cy - 4}
                  Q ${sideL - 8},${cy + 8} ${sideL - 10},${cy + 22}
                  Q ${sideL - 10},${cy + 32} ${sideL - 2},${cy + 34}
                  Q ${sideL + 4},${cy + 30} ${sideL + 2},${cy + 18}
                  Q ${sideL + 6},${cy + 8} ${sideL + 6},${cy} Z`}
              fill={color}
            />
            <ellipse cx={sideL + 4} cy={cy - 2} rx="6" ry="6" fill={color} />
            {/* right tail */}
            <path
              d={`M ${sideR - 4},${cy - 4}
                  Q ${sideR + 8},${cy + 8} ${sideR + 10},${cy + 22}
                  Q ${sideR + 10},${cy + 32} ${sideR + 2},${cy + 34}
                  Q ${sideR - 4},${cy + 30} ${sideR - 2},${cy + 18}
                  Q ${sideR - 6},${cy + 8} ${sideR - 6},${cy} Z`}
              fill={color}
            />
            <ellipse cx={sideR - 4} cy={cy - 2} rx="6" ry="6" fill={color} />
          </g>
        ),
        front: (
          <g>
            {cap}
            <circle cx={sideL + 4} cy={cy - 2} r="2.2" fill={sh} />
            <circle cx={sideR - 4} cy={cy - 2} r="2.2" fill={sh} />
          </g>
        ),
      };

    case "braids":
      return {
        back: (
          <g>
            {/* Two braided plaits down the sides */}
            {[sideL + 3, sideR - 3].map((bx, i) => (
              <g key={i}>
                <path
                  d={`M ${bx},${cy - 4} L ${bx + (i ? 2 : -2)},${cy + ry + 20} L ${bx + (i ? -2 : 2)},${cy + ry + 20} Z`}
                  fill={color}
                />
                {[0, 1, 2, 3].map((k) => (
                  <ellipse
                    key={k}
                    cx={bx + (k % 2 ? 1.5 : -1.5)}
                    cy={cy + 4 + k * 9}
                    rx="3.5"
                    ry="3"
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
              d={`M ${sideL + 1},${cy - 2}
                  Q ${cx - rx},${top + 2} ${cx},${top - 1}
                  Q ${cx + rx},${top + 2} ${sideR - 1},${cy - 2}
                  Q ${cx + rx * 0.7},${top + 5} ${cx},${top + 3}
                  Q ${cx - rx * 0.7},${top + 5} ${sideL + 1},${cy - 2} Z`}
              fill={color}
            />
            {/* short sides shading */}
            <path d={`M ${sideL + 1},${cy - 2} Q ${sideL},${cy + 6} ${sideL + 4},${cy + 8}`}
                  stroke={sh} strokeWidth="3" fill="none" opacity="0.5" />
            <path d={`M ${sideR - 1},${cy - 2} Q ${sideR},${cy + 6} ${sideR - 4},${cy + 8}`}
                  stroke={sh} strokeWidth="3" fill="none" opacity="0.5" />
          </g>
        ),
      };

    case "mohawk":
      return {
        back: null,
        front: (
          <g>
            <path
              d={`M ${cx - 5},${top + 4}
                  Q ${cx - 8},${top - 8} ${cx},${top - 12}
                  Q ${cx + 8},${top - 8} ${cx + 5},${top + 4}
                  L ${cx + 4},${top + 8} L ${cx - 4},${top + 8} Z`}
              fill={color}
            />
            <path d={`M ${cx - 4},${top - 6} L ${cx},${top - 10} L ${cx + 4},${top - 6}`}
                  stroke={hi} strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        ),
      };

    case "bob":
      return {
        back: (
          <path
            d={`M ${sideL - 1},${cy - 4}
                Q ${sideL - 2},${cy + 8} ${cx - 6},${cy + 12}
                L ${cx + 6},${cy + 12}
                Q ${sideR + 2},${cy + 8} ${sideR + 1},${cy - 4}
                Q ${cx},${top - 4} ${sideL - 1},${cy - 4} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {cap}
            <path d={`M ${cx - rx * 0.7},${top + 5} Q ${cx},${top + 1} ${cx + rx * 0.7},${top + 5}`}
                  stroke={hi} strokeWidth="1" fill="none" opacity="0.6" />
          </g>
        ),
      };

    case "wavy":
      return {
        back: (
          <path
            d={`M ${sideL - 2},${cy - 4}
                Q ${sideL - 6},${cy + ry + 10} ${cx - 8},${cy + ry + 18}
                Q ${cx},${cy + ry + 14} ${cx + 8},${cy + ry + 18}
                Q ${sideR + 6},${cy + ry + 10} ${sideR + 2},${cy - 4}
                Q ${cx},${top - 4} ${sideL - 2},${cy - 4} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {cap}
            <path d={`M ${cx - rx},${top + 8} Q ${cx - rx / 2},${top + 4} ${cx},${top + 7} Q ${cx + rx / 2},${top + 10} ${cx + rx},${top + 7}`}
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
              d={`M ${cx - rx + 2},${cy - 6}
                  Q ${cx - rx},${top + 2} ${cx},${top - 2}
                  Q ${cx + rx},${top + 2} ${cx + rx - 2},${cy - 6}
                  Q ${cx + rx * 0.6},${top + 6} ${cx - rx * 0.6},${top + 6}
                  Q ${cx - rx + 2},${top + 4} ${cx - rx + 2},${cy - 6} Z`}
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
  switch (shape) {
    case "slim":    return { torsoW: 30, hipW: 28, shoulderW: 32, legW: 9 };
    case "stocky":  return { torsoW: 40, hipW: 38, shoulderW: 44, legW: 12 };
    case "average":
    default:        return { torsoW: 34, hipW: 32, shoulderW: 38, legW: 10 };
  }
}

// ---------------------------- ear extras ------------------------------------
function EarExtra({ id, side, ry }: { id: string | null | undefined; side: "L" | "R"; ry: number }) {
  const item = getItemById(id);
  if (!item) return null;
  const cx = side === "L" ? HEAD_CX - 22 : HEAD_CX + 22;
  const cy = HEAD_CY + 2;
  if (item.id === "prem-ears-headphones") {
    // big over-ear cans
    return (
      <>
        {/* headband only on right call */}
        {side === "R" && (
          <path d={`M ${HEAD_CX - 22},${HEAD_CY - ry} Q ${HEAD_CX},${HEAD_CY - ry - 12} ${HEAD_CX + 22},${HEAD_CY - ry}`}
                stroke={item.color ?? "#333"} strokeWidth="3" fill="none" />
        )}
        <ellipse cx={cx} cy={cy} rx="6" ry="7" fill={item.color ?? "#333"} />
        <ellipse cx={cx} cy={cy} rx="3" ry="4" fill={lighten(item.color ?? "#333", 0.3)} />
      </>
    );
  }
  if (item.id === "prem-ears-pods") {
    return (
      <>
        <ellipse cx={cx} cy={cy} rx="2.2" ry="3" fill={item.color ?? "#fff"} />
        <rect x={cx - 1} y={cy + 2} width="2" height="4" rx="1" fill={item.color ?? "#fff"} />
      </>
    );
  }
  // hearing aid (default)
  return (
    <>
      <path d={`M ${cx - (side === "L" ? -2 : 2)},${cy - 3} q ${side === "L" ? -3 : 3},2 0,5`}
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

  const faceShape: FaceShape = dressup.faceShape ?? "oval";
  const bodyShape: BodyShape = dressup.bodyShape ?? "average";
  const { rx, ry } = headRadii(faceShape);
  const { torsoW, hipW, shoulderW, legW } = bodyMetrics(bodyShape);

  const skinDark = darken(dressup.skin, 0.18);
  const blush = "#e89a9a";
  const lipColor = darken(dressup.skin, 0.35);

  const topColor = dress?.color ?? top?.color ?? "#cbb999";
  const bottomColor = dress?.color ?? bottom?.color ?? "#7a6a55";
  const shoesColor = shoes?.color ?? "#3a2a1a";

  const hair = hairLayers(dressup.hairstyle as HairStyleId, dressup.hair, rx, ry);

  // Body coordinates
  const neckTop = HEAD_CY + ry - 2;
  const torsoTop = neckTop + 6;
  const torsoBottom = torsoTop + 38;
  const legTop = torsoBottom;
  const legBottom = legTop + 32;

  return (
    <svg
      viewBox="0 0 100 160"
      width={size}
      height={size * 1.6}
      className={className}
      role="img"
      aria-label="Your dress-up avatar"
    >
      {/* shadow */}
      <ellipse cx="50" cy="155" rx="24" ry="3" fill="#000" opacity="0.15" />

      {/* === BACK HAIR === (drawn first, behind body) */}
      {hair.back}

      {/* === LEGS === */}
      <path
        d={`M ${50 - hipW / 2 + 2},${legTop}
            Q ${50 - legW},${legTop + 16} ${50 - legW + 1},${legBottom}
            L ${50 - 1},${legBottom}
            L ${50 - 1},${legTop + 4} Z`}
        fill={bottomColor}
      />
      <path
        d={`M ${50 + hipW / 2 - 2},${legTop}
            Q ${50 + legW},${legTop + 16} ${50 + legW - 1},${legBottom}
            L ${50 + 1},${legBottom}
            L ${50 + 1},${legTop + 4} Z`}
        fill={bottomColor}
      />

      {/* === SHOES === */}
      <ellipse cx={50 - legW + 1} cy={legBottom + 3} rx="8" ry="4" fill={shoesColor} />
      <ellipse cx={50 + legW - 1} cy={legBottom + 3} rx="8" ry="4" fill={shoesColor} />

      {/* === TORSO / TOP or DRESS === */}
      {dress ? (
        // A-line silhouette
        <path
          d={`M ${50 - shoulderW / 2},${torsoTop}
              Q ${50 - shoulderW / 2 - 2},${torsoTop + 14} ${50 - hipW / 2 - 6},${legTop + 8}
              L ${50 + hipW / 2 + 6},${legTop + 8}
              Q ${50 + shoulderW / 2 + 2},${torsoTop + 14} ${50 + shoulderW / 2},${torsoTop}
              Q ${50},${torsoTop - 4} ${50 - shoulderW / 2},${torsoTop} Z`}
          fill={dress.color ?? "#e89ab8"}
        />
      ) : (
        <path
          d={`M ${50 - shoulderW / 2},${torsoTop}
              Q ${50 - shoulderW / 2 - 2},${torsoTop + 18} ${50 - torsoW / 2},${torsoBottom}
              L ${50 + torsoW / 2},${torsoBottom}
              Q ${50 + shoulderW / 2 + 2},${torsoTop + 18} ${50 + shoulderW / 2},${torsoTop}
              Q ${50},${torsoTop - 4} ${50 - shoulderW / 2},${torsoTop} Z`}
          fill={topColor}
        />
      )}

      {/* === ARMS === */}
      <path d={`M ${50 - shoulderW / 2 - 1},${torsoTop + 2}
                Q ${50 - shoulderW / 2 - 6},${torsoTop + 22} ${50 - shoulderW / 2 - 4},${torsoBottom - 2}
                L ${50 - shoulderW / 2 + 3},${torsoBottom - 4}
                Q ${50 - shoulderW / 2 + 4},${torsoTop + 18} ${50 - shoulderW / 2 + 2},${torsoTop + 2} Z`}
            fill={dress?.color ?? topColor} />
      <path d={`M ${50 + shoulderW / 2 + 1},${torsoTop + 2}
                Q ${50 + shoulderW / 2 + 6},${torsoTop + 22} ${50 + shoulderW / 2 + 4},${torsoBottom - 2}
                L ${50 + shoulderW / 2 - 3},${torsoBottom - 4}
                Q ${50 + shoulderW / 2 - 4},${torsoTop + 18} ${50 + shoulderW / 2 - 2},${torsoTop + 2} Z`}
            fill={dress?.color ?? topColor} />

      {/* === HANDS WITH FINGERS === */}
      {(["L", "R"] as const).map((side) => {
        const hx = side === "L" ? 50 - shoulderW / 2 - 4 : 50 + shoulderW / 2 + 4;
        const hy = torsoBottom + 1;
        return (
          <g key={side}>
            {/* palm */}
            <ellipse cx={hx} cy={hy} rx="4.5" ry="5" fill={dressup.skin} stroke={skinDark} strokeWidth="0.4" />
            {/* four fingers as small ovals at the bottom of the palm */}
            {[0, 1, 2, 3].map((i) => (
              <ellipse
                key={i}
                cx={hx - 3 + i * 2}
                cy={hy + 4}
                rx="0.9"
                ry="2"
                fill={dressup.skin}
                stroke={skinDark}
                strokeWidth="0.3"
              />
            ))}
            {/* thumb */}
            <ellipse cx={side === "L" ? hx - 4 : hx + 4} cy={hy + 1} rx="1.2" ry="2.2" fill={dressup.skin} />
            {/* nails */}
            {dressup.nail && [0, 1, 2, 3].map((i) => (
              <ellipse
                key={`n${i}`}
                cx={hx - 3 + i * 2}
                cy={hy + 5.5}
                rx="0.7"
                ry="0.9"
                fill={dressup.nail!}
              />
            ))}
            {/* bracelet */}
            {bracelet && (
              <rect
                x={hx - 4.5}
                y={hy - 6}
                width="9"
                height="2.5"
                rx="1.2"
                fill={bracelet.color ?? "#c0a040"}
              />
            )}
          </g>
        );
      })}

      {/* === NECK === */}
      <rect x={45} y={neckTop} width={10} height={8} fill={dressup.skin} />
      <rect x={45} y={neckTop + 6} width={10} height={2} fill={skinDark} opacity="0.4" />

      {/* === NECKLACE === */}
      {necklace && (
        <g>
          <path
            d={`M ${50 - 10},${torsoTop + 2} Q ${50},${torsoTop + 8} ${50 + 10},${torsoTop + 2}`}
            stroke={necklace.color ?? "#c0a040"}
            strokeWidth="0.8"
            fill="none"
          />
          <text x="50" y={torsoTop + 10} textAnchor="middle" fontSize="6" dominantBaseline="middle">
            {necklace.overlayEmoji ?? necklace.emoji}
          </text>
        </g>
      )}

      {/* === EARS === */}
      <ellipse cx={HEAD_CX - rx + 1} cy={HEAD_CY + 2} rx="2.5" ry="4" fill={dressup.skin} stroke={skinDark} strokeWidth="0.4" />
      <ellipse cx={HEAD_CX + rx - 1} cy={HEAD_CY + 2} rx="2.5" ry="4" fill={dressup.skin} stroke={skinDark} strokeWidth="0.4" />
      {/* inner ear shadow */}
      <ellipse cx={HEAD_CX - rx + 1} cy={HEAD_CY + 2.5} rx="1" ry="2" fill={skinDark} opacity="0.4" />
      <ellipse cx={HEAD_CX + rx - 1} cy={HEAD_CY + 2.5} rx="1" ry="2" fill={skinDark} opacity="0.4" />

      {/* === EARRINGS === */}
      {earrings && (
        <>
          <circle cx={HEAD_CX - rx + 1} cy={HEAD_CY + 6} r="1.6" fill={earrings.color ?? "#e0b840"} />
          <circle cx={HEAD_CX + rx - 1} cy={HEAD_CY + 6} r="1.6" fill={earrings.color ?? "#e0b840"} />
        </>
      )}

      {/* === HEAD === */}
      <path d={headPath(faceShape, rx, ry)} fill={dressup.skin} stroke={skinDark} strokeWidth="0.5" />

      {/* ear piercing — second tiny stud above the lobe */}
      {earPiercing && (
        <>
          <circle cx={HEAD_CX - rx + 1} cy={HEAD_CY - 3} r="1" fill={earPiercing.color ?? "#a8d8f0"} />
          <circle cx={HEAD_CX + rx - 1} cy={HEAD_CY - 3} r="1" fill={earPiercing.color ?? "#a8d8f0"} />
        </>
      )}

      {/* === FRONT HAIR === */}
      {hair.front}

      {/* === HAIR CLIP === */}
      {hairClip && (
        <text
          x={HEAD_CX - rx * 0.5}
          y={HEAD_CY - ry + 6}
          textAnchor="middle"
          fontSize="9"
          dominantBaseline="middle"
        >
          {hairClip.overlayEmoji ?? hairClip.emoji}
        </text>
      )}

      {/* === FACE === eyes with whites + pupils + highlight */}
      {(() => {
        const eyeY = HEAD_CY + 2;
        const eyeOffset = rx * 0.35;
        return (
          <>
            {/* eye whites */}
            <ellipse cx={HEAD_CX - eyeOffset} cy={eyeY} rx="2.6" ry="3.2" fill="#fff" stroke={skinDark} strokeWidth="0.4" />
            <ellipse cx={HEAD_CX + eyeOffset} cy={eyeY} rx="2.6" ry="3.2" fill="#fff" stroke={skinDark} strokeWidth="0.4" />
            {/* irises */}
            <circle cx={HEAD_CX - eyeOffset} cy={eyeY + 0.3} r="1.6" fill="#3a4a6a" />
            <circle cx={HEAD_CX + eyeOffset} cy={eyeY + 0.3} r="1.6" fill="#3a4a6a" />
            {/* pupils */}
            <circle cx={HEAD_CX - eyeOffset} cy={eyeY + 0.3} r="0.8" fill="#0a0a0a" />
            <circle cx={HEAD_CX + eyeOffset} cy={eyeY + 0.3} r="0.8" fill="#0a0a0a" />
            {/* highlights */}
            <circle cx={HEAD_CX - eyeOffset + 0.7} cy={eyeY - 0.6} r="0.5" fill="#fff" />
            <circle cx={HEAD_CX + eyeOffset + 0.7} cy={eyeY - 0.6} r="0.5" fill="#fff" />
            {/* eyebrows */}
            <path d={`M ${HEAD_CX - eyeOffset - 2.5},${eyeY - 4} Q ${HEAD_CX - eyeOffset},${eyeY - 5} ${HEAD_CX - eyeOffset + 2.5},${eyeY - 4}`}
                  stroke={darken(dressup.hair, 0.1)} strokeWidth="0.9" fill="none" strokeLinecap="round" />
            <path d={`M ${HEAD_CX + eyeOffset - 2.5},${eyeY - 4} Q ${HEAD_CX + eyeOffset},${eyeY - 5} ${HEAD_CX + eyeOffset + 2.5},${eyeY - 4}`}
                  stroke={darken(dressup.hair, 0.1)} strokeWidth="0.9" fill="none" strokeLinecap="round" />
          </>
        );
      })()}

      {/* nose */}
      <path d={`M ${HEAD_CX - 1},${HEAD_CY + 7} Q ${HEAD_CX},${HEAD_CY + 9} ${HEAD_CX + 1},${HEAD_CY + 7}`}
            stroke={skinDark} strokeWidth="0.6" fill="none" strokeLinecap="round" />

      {/* mouth — proper smile with upper/lower lips */}
      {(() => {
        const my = HEAD_CY + 12;
        return (
          <g>
            <path
              d={`M ${HEAD_CX - 4},${my}
                  Q ${HEAD_CX},${my + 3} ${HEAD_CX + 4},${my}
                  Q ${HEAD_CX},${my + 1.5} ${HEAD_CX - 4},${my} Z`}
              fill={lipColor}
            />
            <path d={`M ${HEAD_CX - 4},${my} Q ${HEAD_CX},${my - 1} ${HEAD_CX + 4},${my}`}
                  stroke={lipColor} strokeWidth="0.5" fill="none" />
          </g>
        );
      })()}

      {/* face piercing */}
      {facePiercing && (() => {
        const my = HEAD_CY + 12;
        if (facePiercing.id === "prem-face-nose") {
          return <circle cx={HEAD_CX + 1.5} cy={HEAD_CY + 8} r="0.8" fill={facePiercing.color ?? "#e0e0f0"} />;
        }
        if (facePiercing.id === "prem-face-eyebrow") {
          return <rect x={HEAD_CX - eyeOffsetForBrow(rx) - 3} y={HEAD_CY - 3} width="2" height="0.8" fill={facePiercing.color ?? "#a0a0b0"} />;
        }
        // lip ring
        return <circle cx={HEAD_CX - 5} cy={my + 1.5} r="0.8" fill="none" stroke={facePiercing.color ?? "#c0c0c0"} strokeWidth="0.5" />;
      })()}

      {/* blush */}
      <circle cx={HEAD_CX - rx * 0.55} cy={HEAD_CY + 6} r="2" fill={blush} opacity="0.5" />
      <circle cx={HEAD_CX + rx * 0.55} cy={HEAD_CY + 6} r="2" fill={blush} opacity="0.5" />

      {/* ear extras (hearing aid / earpods / headphones) */}
      <EarExtra id={dressup.ears} side="L" ry={ry} />
      <EarExtra id={dressup.ears} side="R" ry={ry} />

      {/* === HAT (emoji overlay) === */}
      {hat && (
        <text x={HEAD_CX} y={HEAD_CY - ry + 2} textAnchor="middle" fontSize="22" dominantBaseline="middle">
          {hat.overlayEmoji ?? hat.emoji}
        </text>
      )}

      {/* === ACCESSORY (face overlay e.g. glasses) === */}
      {accessory && (
        <text x={HEAD_CX} y={HEAD_CY + 3} textAnchor="middle" fontSize="14" dominantBaseline="middle">
          {accessory.overlayEmoji ?? accessory.emoji}
        </text>
      )}
    </svg>
  );
}

function eyeOffsetForBrow(rx: number) {
  return rx * 0.35;
}