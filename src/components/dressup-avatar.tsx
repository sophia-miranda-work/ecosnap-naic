import {
  type BodyShape,
  type Dressup,
  type FaceShape,
  type HairStyleId,
} from "@/hooks/use-character";
import { getItemById } from "@/lib/shop";

export const HEAD_CX = 50;
export const HEAD_CY = 42;
const BASE_RX = 28;
const BASE_RY = 29;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function headRadii(shape: FaceShape): { rx: number; ry: number } {
  switch (shape) {
    case "round":
      return { rx: 29, ry: 29 };
    case "oval":
      return { rx: 26.5, ry: 31 };
    case "heart":
      return { rx: 28, ry: 30 };
    case "diamond":
      return { rx: 27, ry: 30 };
    case "octagon":
      return { rx: 28, ry: 29 };
    case "long":
      return { rx: 25, ry: 32 };
    case "square":
      return { rx: 28, ry: 28 };
    default:
      return { rx: BASE_RX, ry: BASE_RY };
  }
}

function headPath(shape: FaceShape, rx: number, ry: number): string {
  const cx = HEAD_CX;
  const cy = HEAD_CY;
  if (shape === "heart") {
    return `M ${cx},${cy - ry}
      C ${cx - rx * 0.8},${cy - ry} ${cx - rx},${cy - ry * 0.35} ${cx - rx},${cy - ry * 0.02}
      C ${cx - rx},${cy + ry * 0.58} ${cx - rx * 0.45},${cy + ry} ${cx},${cy + ry * 1.02}
      C ${cx + rx * 0.45},${cy + ry} ${cx + rx},${cy + ry * 0.58} ${cx + rx},${cy - ry * 0.02}
      C ${cx + rx},${cy - ry * 0.35} ${cx + rx * 0.8},${cy - ry} ${cx},${cy - ry} Z`;
  }
  if (shape === "diamond") {
    return `M ${cx},${cy - ry}
      C ${cx - rx * 0.68},${cy - ry * 0.92} ${cx - rx},${cy - ry * 0.38} ${cx - rx * 0.96},${cy}
      C ${cx - rx * 0.9},${cy + ry * 0.48} ${cx - rx * 0.42},${cy + ry * 0.92} ${cx},${cy + ry}
      C ${cx + rx * 0.42},${cy + ry * 0.92} ${cx + rx * 0.9},${cy + ry * 0.48} ${cx + rx * 0.96},${cy}
      C ${cx + rx},${cy - ry * 0.38} ${cx + rx * 0.68},${cy - ry * 0.92} ${cx},${cy - ry} Z`;
  }
  if (shape === "octagon") {
    return `M ${cx - rx * 0.42},${cy - ry}
      C ${cx - rx * 0.78},${cy - ry * 0.96} ${cx - rx},${cy - ry * 0.65} ${cx - rx},${cy - ry * 0.28}
      L ${cx - rx},${cy + ry * 0.26}
      C ${cx - rx},${cy + ry * 0.65} ${cx - rx * 0.68},${cy + ry} ${cx - rx * 0.28},${cy + ry}
      L ${cx + rx * 0.28},${cy + ry}
      C ${cx + rx * 0.68},${cy + ry} ${cx + rx},${cy + ry * 0.65} ${cx + rx},${cy + ry * 0.26}
      L ${cx + rx},${cy - ry * 0.28}
      C ${cx + rx},${cy - ry * 0.65} ${cx + rx * 0.78},${cy - ry * 0.96} ${cx + rx * 0.42},${cy - ry} Z`;
  }
  if (shape === "square") {
    return `M ${cx - rx * 0.72},${cy - ry}
      C ${cx - rx},${cy - ry} ${cx - rx},${cy - ry * 0.7} ${cx - rx},${cy - ry * 0.42}
      L ${cx - rx},${cy + ry * 0.45}
      C ${cx - rx},${cy + ry * 0.78} ${cx - rx * 0.72},${cy + ry} ${cx - rx * 0.36},${cy + ry}
      L ${cx + rx * 0.36},${cy + ry}
      C ${cx + rx * 0.72},${cy + ry} ${cx + rx},${cy + ry * 0.78} ${cx + rx},${cy + ry * 0.45}
      L ${cx + rx},${cy - ry * 0.42}
      C ${cx + rx},${cy - ry * 0.7} ${cx + rx * 0.72},${cy - ry} ${cx + rx * 0.72},${cy - ry} Z`;
  }
  return `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 ${-rx * 2},0`;
}

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

export function hairLayers(style: HairStyleId, color: string, rx: number, ry: number) {
  if (style === "bald") return { back: null, front: null };
  const hi = lighten(color, 0.35);
  const sh = darken(color, 0.2);
  const cx = HEAD_CX;
  const cy = HEAD_CY;
  const top = cy - ry;
  const bottom = cy + ry;
  const sideL = cx - rx;
  const sideR = cx + rx;

  const scalpCap = (drop = cy + 3, lift = 6) => (
    <path
      d={`M ${sideL - 3},${drop}
        C ${sideL - 5},${top + 8} ${sideL + 8},${top - lift} ${cx},${top - lift}
        C ${sideR - 8},${top - lift} ${sideR + 5},${top + 8} ${sideR + 3},${drop}
        C ${sideR - 4},${top + 18} ${sideL + 4},${top + 18} ${sideL - 3},${drop} Z`}
      fill={color}
    />
  );

  const softBangs = (part = 0) => (
    <path
      d={`M ${sideL + 2},${top + 12}
        C ${sideL + 11},${top + 4} ${sideR - 10},${top + 4} ${sideR - 2},${top + 12}
        C ${sideR - 8},${cy - 1} ${cx + 12 + part},${cy + 5} ${cx + 5 + part},${cy + 12}
        C ${cx + 1},${cy + 4} ${cx - 5},${cy + 4} ${cx - 10},${cy + 12}
        C ${cx - 16 + part},${cy + 4} ${sideL + 8},${cy - 1} ${sideL + 2},${top + 12} Z`}
      fill={color}
    />
  );

  const curtainBangs = () => (
    <g>
      <path
        d={`M ${cx - 1},${top + 8} C ${sideL + 8},${top + 9} ${sideL + 7},${cy + 5} ${cx - 7},${cy + 15} C ${cx - 6},${cy + 3} ${cx - 4},${top + 13} ${cx - 1},${top + 8} Z`}
        fill={color}
      />
      <path
        d={`M ${cx + 1},${top + 8} C ${sideR - 8},${top + 9} ${sideR - 7},${cy + 5} ${cx + 7},${cy + 15} C ${cx + 6},${cy + 3} ${cx + 4},${top + 13} ${cx + 1},${top + 8} Z`}
        fill={color}
      />
    </g>
  );

  const shine = (x = cx - 11, y = top + 7) => (
    <path
      d={`M ${x},${y} C ${x + 8},${y - 4} ${x + 18},${y - 2} ${x + 26},${y + 3}`}
      stroke={hi}
      strokeWidth="1.15"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
    />
  );

  const longCurtainBack = (length = 34, flare = 8) => (
    <path
      d={`M ${sideL + 1},${cy - 6}
        C ${sideL - flare},${cy + 10} ${sideL - 4},${bottom + length - 5} ${cx - 10},${bottom + length}
        L ${cx + 10},${bottom + length}
        C ${sideR + 4},${bottom + length - 5} ${sideR + flare},${cy + 10} ${sideR - 1},${cy - 6}
        C ${sideR - 5},${top - 2} ${sideL + 5},${top - 2} ${sideL + 1},${cy - 6} Z`}
      fill={color}
    />
  );

  const curlRow = (startX: number, y: number, count: number, r: number) => (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={startX + i * r * 1.45} cy={y + (i % 2) * 1.4} r={r} fill={color} />
      ))}
    </g>
  );

  switch (style) {
    case "soft-bob":
    case "short":
    case "bob":
      return {
        back: (
          <path
            d={`M ${sideL - 2},${cy - 2} C ${sideL - 8},${cy + 17} ${sideL + 4},${bottom + 9} ${cx - 13},${bottom + 10} L ${cx + 13},${bottom + 10} C ${sideR - 4},${bottom + 9} ${sideR + 8},${cy + 17} ${sideR + 2},${cy - 2} Z`}
            fill={color}
          />
        ),
        front: (
          <g>
            {scalpCap(cy + 6, 6)}
            {softBangs()}
            <path
              d={`M ${sideL + 5},${cy + 4} C ${sideL + 2},${cy + 18} ${sideL + 8},${bottom + 6} ${sideL + 16},${bottom + 7}`}
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${sideR - 5},${cy + 4} C ${sideR - 2},${cy + 18} ${sideR - 8},${bottom + 6} ${sideR - 16},${bottom + 7}`}
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {shine()}
          </g>
        ),
      };
    case "long-bangs":
    case "long":
      return {
        back: longCurtainBack(38, 9),
        front: (
          <g>
            {scalpCap(cy + 7, 5)}
            {curtainBangs()}
            <path
              d={`M ${sideL + 2},${cy + 2} C ${sideL + 1},${cy + 18} ${sideL + 4},${bottom + 22} ${sideL + 10},${bottom + 34}`}
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${sideR - 2},${cy + 2} C ${sideR - 1},${cy + 18} ${sideR - 4},${bottom + 22} ${sideR - 10},${bottom + 34}`}
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {shine(cx - 7, top + 7)}
          </g>
        ),
      };
    case "straight-bangs":
      return {
        back: longCurtainBack(29, 4),
        front: (
          <g>
            {scalpCap(cy + 7, 5)}
            <path
              d={`M ${sideL + 3},${top + 13} C ${sideL + 11},${top + 5} ${sideR - 11},${top + 5} ${sideR - 3},${top + 13} L ${sideR - 4},${cy + 10} C ${cx + 12},${cy + 8} ${cx - 12},${cy + 8} ${sideL + 4},${cy + 10} Z`}
              fill={color}
            />
            {shine(cx - 12, top + 8)}
          </g>
        ),
      };
    case "curtain-cut":
    case "wavy":
      return {
        back: longCurtainBack(24, 10),
        front: (
          <g>
            {scalpCap(cy + 6, 5)}
            {curtainBangs()}
            <path
              d={`M ${sideL + 2},${cy + 1} C ${sideL - 5},${cy + 13} ${sideL + 9},${cy + 20} ${sideL + 5},${cy + 35}`}
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${sideR - 2},${cy + 1} C ${sideR + 5},${cy + 13} ${sideR - 9},${cy + 20} ${sideR - 5},${cy + 35}`}
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {shine(cx - 4, top + 8)}
          </g>
        ),
      };
    case "high-pony":
    case "ponytail":
      return {
        back: (
          <g>
            <ellipse cx={sideR + 1} cy={cy - 2} rx="7" ry="8" fill={color} />
            <path
              d={`M ${sideR + 1},${cy - 3} C ${sideR + 21},${cy + 2} ${sideR + 20},${cy + 25} ${sideR + 8},${cy + 42} C ${sideR - 2},${cy + 37} ${sideR + 1},${cy + 13} ${sideR + 1},${cy - 3} Z`}
              fill={color}
            />
          </g>
        ),
        front: (
          <g>
            {scalpCap(cy + 5, 6)}
            {curtainBangs()}
            <ellipse cx={sideR} cy={cy - 2} rx="3.2" ry="2.3" fill={sh} />
          </g>
        ),
      };
    case "low-pigtails":
    case "pigtails":
      return {
        back: (
          <g>
            <path
              d={`M ${sideL + 3},${cy + 3} C ${sideL - 15},${cy + 11} ${sideL - 13},${cy + 34} ${sideL - 1},${cy + 43} C ${sideL + 8},${cy + 36} ${sideL + 8},${cy + 17} ${sideL + 3},${cy + 3} Z`}
              fill={color}
            />
            <path
              d={`M ${sideR - 3},${cy + 3} C ${sideR + 15},${cy + 11} ${sideR + 13},${cy + 34} ${sideR + 1},${cy + 43} C ${sideR - 8},${cy + 36} ${sideR - 8},${cy + 17} ${sideR - 3},${cy + 3} Z`}
              fill={color}
            />
          </g>
        ),
        front: (
          <g>
            {scalpCap(cy + 6, 5)}
            {softBangs()}
            <ellipse cx={sideL + 2} cy={cy + 2} rx="3" ry="2.2" fill={sh} />
            <ellipse cx={sideR - 2} cy={cy + 2} rx="3" ry="2.2" fill={sh} />
          </g>
        ),
      };
    case "space-buns":
    case "double-bun":
    case "bun":
    case "side-bun":
    case "topknot":
      return {
        back: (
          <g>
            <ellipse cx={cx - rx * 0.58} cy={top + 1} rx="10" ry="9" fill={color} />
            <ellipse cx={cx + rx * 0.58} cy={top + 1} rx="10" ry="9" fill={color} />
          </g>
        ),
        front: (
          <g>
            {scalpCap(cy + 5, 5)}
            {softBangs()}
            <ellipse cx={cx - rx * 0.58} cy={top + 1} rx="10" ry="9" fill={color} />
            <ellipse cx={cx + rx * 0.58} cy={top + 1} rx="10" ry="9" fill={color} />
            <path
              d={`M ${cx - rx * 0.58 - 4},${top + 1} C ${cx - rx * 0.58},${top - 3} ${cx - rx * 0.58 + 5},${top - 2} ${cx - rx * 0.58 + 6},${top + 2}`}
              stroke={hi}
              strokeWidth="1"
              fill="none"
              opacity="0.45"
            />
          </g>
        ),
      };
    case "fluffy-curls":
    case "curly":
    case "afro":
      return {
        back: <ellipse cx={cx} cy={cy - 4} rx={rx + 9} ry={ry + 4} fill={color} />,
        front: (
          <g>
            <ellipse cx={cx} cy={cy - 4} rx={rx + 6} ry={ry - 1} fill={color} />
            {curlRow(cx - 30, top + 7, 7, 5.4)}
            {curlRow(cx - 24, top + 1, 5, 5.8)}
            <circle cx={cx - 8} cy={top + 2} r="2.7" fill={hi} opacity="0.5" />
          </g>
        ),
      };
    case "twin-braids":
    case "braids":
      return {
        back: (
          <g>
            {[0, 1, 2, 3].map((k) => (
              <g key={k}>
                <ellipse
                  cx={sideL + 4 + (k % 2 ? -1.5 : 1.5)}
                  cy={cy + 9 + k * 9}
                  rx="4.2"
                  ry="3.4"
                  fill={k % 2 ? sh : color}
                />
                <ellipse
                  cx={sideR - 4 + (k % 2 ? 1.5 : -1.5)}
                  cy={cy + 9 + k * 9}
                  rx="4.2"
                  ry="3.4"
                  fill={k % 2 ? sh : color}
                />
              </g>
            ))}
          </g>
        ),
        front: (
          <g>
            {scalpCap(cy + 6, 5)}
            {softBangs()}
          </g>
        ),
      };
    case "side-sweep":
    case "fade":
    case "undercut":
    case "mohawk":
      return {
        back: null,
        front: (
          <g>
            {scalpCap(cy + 2, 6)}
            <path
              d={`M ${sideL + 2},${top + 13} C ${cx - 7},${top - 1} ${sideR - 5},${top + 4} ${sideR - 2},${cy + 7} C ${cx + 5},${cy + 3} ${cx - 11},${cy + 8} ${sideL + 2},${top + 13} Z`}
              fill={color}
            />
            {shine(cx - 2, top + 6)}
          </g>
        ),
      };
    default:
      return {
        back: null,
        front: (
          <g>
            {scalpCap(cy + 5, 5)}
            {softBangs()}
          </g>
        ),
      };
  }
}

function bodyMetrics(shape: BodyShape) {
  switch (shape) {
    case "slim":
      return { torsoW: 22, hipW: 22, shoulderW: 25, legW: 6 };
    case "stocky":
      return { torsoW: 31, hipW: 30, shoulderW: 32, legW: 8.5 };
    case "average":
    default:
      return { torsoW: 26, hipW: 26, shoulderW: 29, legW: 7 };
  }
}

function DressShape({
  id,
  color,
  torsoTop,
  legTop,
  shoulderW,
  hipW,
}: {
  id?: string;
  color: string;
  torsoTop: number;
  legTop: number;
  shoulderW: number;
  hipW: number;
}) {
  const sparkle = lighten(color, 0.35);
  if (id?.includes("princess") || id?.includes("starlight")) {
    return (
      <g>
        <path
          d={`M ${50 - shoulderW / 2},${torsoTop} Q 50,${torsoTop - 5} ${50 + shoulderW / 2},${torsoTop} L ${50 + hipW / 2 + 15},${legTop + 17} Q 50,${legTop + 23} ${50 - hipW / 2 - 15},${legTop + 17} Z`}
          fill={color}
        />
        <path
          d={`M ${50 - 7},${torsoTop + 3} L 50,${torsoTop + 14} L ${50 + 7},${torsoTop + 3}`}
          fill={sparkle}
          opacity="0.55"
        />
        <circle cx="43" cy={legTop + 13} r="1" fill={sparkle} opacity="0.75" />
        <circle cx="57" cy={legTop + 10} r="0.9" fill={sparkle} opacity="0.7" />
      </g>
    );
  }
  if (id?.includes("tutu") || id?.includes("party")) {
    return (
      <g>
        <path
          d={`M ${50 - shoulderW / 2},${torsoTop} Q 50,${torsoTop - 4} ${50 + shoulderW / 2},${torsoTop} L ${50 + hipW / 2 + 6},${legTop + 3} L ${50 - hipW / 2 - 6},${legTop + 3} Z`}
          fill={color}
        />
        <path
          d={`M ${50 - hipW / 2 - 13},${legTop + 3} Q 50,${legTop + 16} ${50 + hipW / 2 + 13},${legTop + 3} L ${50 + hipW / 2 + 9},${legTop + 12} Q 50,${legTop + 20} ${50 - hipW / 2 - 9},${legTop + 12} Z`}
          fill={lighten(color, 0.25)}
          opacity="0.82"
        />
      </g>
    );
  }
  return (
    <path
      d={`M ${50 - shoulderW / 2},${torsoTop} Q ${50 - shoulderW / 2 - 3},${torsoTop + 11} ${50 - hipW / 2 - 8},${legTop + 8} L ${50 + hipW / 2 + 8},${legTop + 8} Q ${50 + shoulderW / 2 + 3},${torsoTop + 11} ${50 + shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`}
      fill={color}
    />
  );
}

function TopShape({
  id,
  color,
  torsoTop,
  torsoBottom,
  shoulderW,
  torsoW,
}: {
  id?: string;
  color: string;
  torsoTop: number;
  torsoBottom: number;
  shoulderW: number;
  torsoW: number;
}) {
  if (id?.includes("crop")) {
    return (
      <path
        d={`M ${50 - shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 + shoulderW / 2},${torsoTop} L ${50 + torsoW / 2},${torsoTop + 13} L ${50 - torsoW / 2},${torsoTop + 13} Z`}
        fill={color}
      />
    );
  }
  if (id?.includes("tank")) {
    return (
      <path
        d={`M ${50 - 8},${torsoTop} L ${50 + 8},${torsoTop} L ${50 + torsoW / 2},${torsoBottom} L ${50 - torsoW / 2},${torsoBottom} Z`}
        fill={color}
      />
    );
  }
  return (
    <path
      d={`M ${50 - shoulderW / 2},${torsoTop} Q ${50 - shoulderW / 2 - 1},${torsoTop + 12} ${50 - torsoW / 2},${torsoBottom} L ${50 + torsoW / 2},${torsoBottom} Q ${50 + shoulderW / 2 + 1},${torsoTop + 12} ${50 + shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`}
      fill={color}
    />
  );
}

function BottomShape({
  id,
  color,
  legTop,
  torsoBottom,
  hipW,
}: {
  id?: string;
  color: string;
  legTop: number;
  torsoBottom: number;
  hipW: number;
}) {
  if (id?.includes("skirt")) {
    return (
      <path
        d={`M ${50 - hipW / 2 - 3},${torsoBottom - 1} L ${50 + hipW / 2 + 3},${torsoBottom - 1} L ${50 + hipW / 2 + 7},${legTop + 10} Q 50,${legTop + 14} ${50 - hipW / 2 - 7},${legTop + 10} Z`}
        fill={color}
      />
    );
  }
  if (id?.includes("short")) {
    return (
      <path
        d={`M ${50 - hipW / 2},${torsoBottom - 1} L ${50 + hipW / 2},${torsoBottom - 1} L ${50 + hipW / 2},${legTop + 7} L ${51},${legTop + 7} L 50,${legTop + 3} L 49,${legTop + 7} L ${50 - hipW / 2},${legTop + 7} Z`}
        fill={color}
      />
    );
  }
  return null;
}

function EarExtra({
  id,
  side,
  rx,
}: {
  id: string | null | undefined;
  side: "L" | "R";
  rx: number;
}) {
  const item = getItemById(id);
  if (!item) return null;
  const cx = side === "L" ? HEAD_CX - rx - 1 : HEAD_CX + rx + 1;
  const cy = HEAD_CY + 4;
  if (item.id === "prem-ears-headphones") {
    return (
      <>
        {side === "R" && (
          <path
            d={`M ${HEAD_CX - rx + 1},${HEAD_CY - 18} Q ${HEAD_CX},${HEAD_CY - 28} ${HEAD_CX + rx - 1},${HEAD_CY - 18}`}
            stroke={item.color ?? "currentColor"}
            strokeWidth="3.4"
            fill="none"
          />
        )}
        <ellipse cx={cx} cy={cy} rx="6.8" ry="8" fill={item.color ?? "currentColor"} />
        <ellipse cx={cx} cy={cy} rx="3" ry="4.2" fill={lighten(item.color ?? "#333333", 0.35)} />
      </>
    );
  }
  if (item.id === "prem-ears-pods") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx="2.3" ry="3" fill={item.color ?? "#f0f0f0"} />
        <rect
          x={cx - 0.9}
          y={cy + 2}
          width="1.8"
          height="4.2"
          rx="0.9"
          fill={item.color ?? "#f0f0f0"}
        />
      </g>
    );
  }
  return (
    <g>
      <path
        d={`M ${cx},${cy - 3} q ${side === "L" ? -3 : 3},2 0,5`}
        stroke={item.color ?? "#e8d8c8"}
        strokeWidth="2.2"
        fill="none"
      />
      <circle cx={cx} cy={cy + 2} r="1.7" fill={item.color ?? "#e8d8c8"} />
    </g>
  );
}

function HairClipShape({ id, color, x, y }: { id?: string; color: string; x: number; y: number }) {
  if (id?.includes("flower")) {
    return (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={x + Math.cos(i * 1.26) * 2.4}
            cy={y + Math.sin(i * 1.26) * 2.4}
            r="1.7"
            fill={color}
          />
        ))}
        <circle cx={x} cy={y} r="1.2" fill="#f3d36b" />
      </g>
    );
  }
  if (id?.includes("pearl"))
    return <circle cx={x} cy={y} r="3" fill={color} stroke="#d8c8a8" strokeWidth="0.5" />;
  return (
    <g>
      <path
        d={`M ${x},${y} L ${x - 5},${y - 3} Q ${x - 8},${y} ${x - 5},${y + 3} Z`}
        fill={color}
      />
      <path
        d={`M ${x},${y} L ${x + 5},${y - 3} Q ${x + 8},${y} ${x + 5},${y + 3} Z`}
        fill={color}
      />
      <circle cx={x} cy={y} r="1.7" fill={darken(color, 0.18)} />
    </g>
  );
}

function HatShape({ id, color, rx, ry }: { id?: string; color: string; rx: number; ry: number }) {
  const top = HEAD_CY - ry;
  if (id?.includes("sunhat") || id?.includes("lily")) {
    return (
      <g>
        <ellipse cx={HEAD_CX} cy={top + 7} rx={rx + 8} ry="4" fill={color} />
        <path
          d={`M ${HEAD_CX - 18},${top + 7} Q ${HEAD_CX},${top - 10} ${HEAD_CX + 18},${top + 7} Z`}
          fill={lighten(color, 0.08)}
        />
      </g>
    );
  }
  if (id?.includes("beanie"))
    return (
      <path
        d={`M ${HEAD_CX - rx + 6},${top + 12} Q ${HEAD_CX},${top - 10} ${HEAD_CX + rx - 6},${top + 12} Q ${HEAD_CX},${top + 17} ${HEAD_CX - rx + 6},${top + 12} Z`}
        fill={color}
      />
    );
  if (id?.includes("cap"))
    return (
      <g>
        <path
          d={`M ${HEAD_CX - rx + 5},${top + 14} Q ${HEAD_CX},${top - 5} ${HEAD_CX + rx - 5},${top + 14} Q ${HEAD_CX},${top + 18} ${HEAD_CX - rx + 5},${top + 14} Z`}
          fill={color}
        />
        <path
          d={`M ${HEAD_CX + 5},${top + 14} Q ${HEAD_CX + 24},${top + 15} ${HEAD_CX + 28},${top + 19} Q ${HEAD_CX + 13},${top + 21} ${HEAD_CX + 4},${top + 17} Z`}
          fill={darken(color, 0.12)}
        />
      </g>
    );
  return (
    <path
      d={`M ${HEAD_CX - 16},${top + 12} L ${HEAD_CX},${top - 18} L ${HEAD_CX + 16},${top + 12} Q ${HEAD_CX},${top + 17} ${HEAD_CX - 16},${top + 12} Z`}
      fill={color}
    />
  );
}

function AccessoryShape({ id, color }: { id?: string; color: string }) {
  if (id?.includes("glasses") || id?.includes("spectacles")) {
    return (
      <g>
        <circle cx="40" cy="47" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="60" cy="47" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M 46 47 L 54 47" stroke={color} strokeWidth="1.3" />
      </g>
    );
  }
  if (id?.includes("scarf"))
    return <path d={`M 39,78 Q 50,83 61,78 L 64,84 Q 50,90 36,84 Z`} fill={color} />;
  if (id?.includes("backpack"))
    return <rect x="65" y="92" width="10" height="18" rx="4" fill={color} opacity="0.9" />;
  if (id?.includes("binoculars"))
    return (
      <g>
        <circle cx="42" cy="83" r="3.8" fill={color} />
        <circle cx="50" cy="83" r="3.8" fill={color} />
        <path d="M45 82 L47 82" stroke={lighten(color, 0.35)} strokeWidth="1" />
      </g>
    );
  return (
    <g>
      <path d="M 50 78 L 54 84 L 50 90 L 46 84 Z" fill={color} />
      <circle cx="50" cy="84" r="1.3" fill={lighten(color, 0.35)} />
    </g>
  );
}

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
  const headScale = clamp(dressup.headSize ?? 1, 0.86, 1.12);
  const base = headRadii(faceShape);
  const rx = base.rx * headScale;
  const ry = base.ry * headScale;
  const { torsoW, hipW, shoulderW, legW } = bodyMetrics(bodyShape);

  const skinDark = darken(dressup.skin, 0.17);
  const skinSoft = lighten(dressup.skin, 0.14);
  const blush = "#f0a4a4";
  const lipColor = darken(dressup.skin, 0.46);
  const topColor = dress?.color ?? top?.color ?? "#e89ab8";
  const bottomColor = dress?.color ?? bottom?.color ?? "#3a4f78";
  const shoesColor = shoes?.color ?? "#5b3a1f";
  const hair = hairLayers(dressup.hairstyle as HairStyleId, dressup.hair, rx, ry);

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
      <ellipse cx="50" cy="137" rx="28" ry="2.5" fill="currentColor" opacity="0.12" />
      {hair.back}

      {!dress && (
        <BottomShape
          id={bottom?.id}
          color={bottomColor}
          legTop={legTop}
          torsoBottom={torsoBottom}
          hipW={hipW}
        />
      )}
      <rect
        x={50 - hipW / 2 + 1}
        y={legTop}
        width={legW * 2}
        height={legBottom - legTop}
        rx="3"
        fill={bottomColor}
      />
      <rect
        x={50 + hipW / 2 - 1 - legW * 2}
        y={legTop}
        width={legW * 2}
        height={legBottom - legTop}
        rx="3"
        fill={bottomColor}
      />

      <ellipse
        cx={50 - hipW / 2 + 1 + legW}
        cy={legBottom + 2}
        rx={legW + (shoes?.id.includes("slipper") || shoes?.id.includes("sandal") ? 3.5 : 2)}
        ry="3"
        fill={shoesColor}
      />
      <ellipse
        cx={50 + hipW / 2 - 1 - legW}
        cy={legBottom + 2}
        rx={legW + (shoes?.id.includes("slipper") || shoes?.id.includes("sandal") ? 3.5 : 2)}
        ry="3"
        fill={shoesColor}
      />
      {shoes?.id.includes("sneaker") && (
        <>
          <path
            d={`M ${50 - hipW / 2 + 1},${legBottom + 1} h ${legW + 4}`}
            stroke={lighten(shoesColor, 0.6)}
            strokeWidth="0.8"
          />
          <path
            d={`M ${50 + hipW / 2 - 1 - legW * 2},${legBottom + 1} h ${legW + 4}`}
            stroke={lighten(shoesColor, 0.6)}
            strokeWidth="0.8"
          />
        </>
      )}

      {dress ? (
        <DressShape
          id={dress.id}
          color={topColor}
          torsoTop={torsoTop}
          legTop={legTop}
          shoulderW={shoulderW}
          hipW={hipW}
        />
      ) : (
        <TopShape
          id={top?.id}
          color={topColor}
          torsoTop={torsoTop}
          torsoBottom={torsoBottom}
          shoulderW={shoulderW}
          torsoW={torsoW}
        />
      )}

      {(["L", "R"] as const).map((side) => {
        const sx = side === "L" ? 50 - shoulderW / 2 - 1 : 50 + shoulderW / 2 + 1;
        const dir = side === "L" ? -1 : 1;
        const sleeveColor = dress?.color ?? topColor;
        const handX = sx + dir * 4;
        const handY = torsoTop + 16;
        return (
          <g key={side}>
            <path
              d={`M ${sx},${torsoTop + 1} Q ${sx + dir * 5},${torsoTop + 10} ${handX - dir * 0.5},${handY - 2} L ${handX - dir * 4},${handY - 4} Q ${sx - dir * 1},${torsoTop + 8} ${sx - dir * 2},${torsoTop + 1} Z`}
              fill={sleeveColor}
            />
            <circle
              cx={handX}
              cy={handY}
              r="3.6"
              fill={dressup.skin}
              stroke={skinDark}
              strokeWidth="0.5"
            />
            <ellipse
              cx={handX - dir * 2.2}
              cy={handY - 1}
              rx="1.2"
              ry="1.6"
              fill={dressup.skin}
              stroke={skinDark}
              strokeWidth="0.3"
            />
            {dressup.nail && (
              <circle cx={handX} cy={handY + 1.5} r="1" fill={dressup.nail} opacity="0.9" />
            )}
            {bracelet && (
              <rect
                x={handX - 4}
                y={handY - 5}
                width="8"
                height="2"
                rx="1"
                fill={bracelet.color ?? "#c0a040"}
              />
            )}
          </g>
        );
      })}

      <rect x="46.5" y={neckTop} width="7" height="6" rx="2" fill={dressup.skin} />
      <ellipse cx="50" cy={neckTop + 5.5} rx="5" ry="1.6" fill={skinDark} opacity="0.12" />

      {necklace && (
        <g>
          <path
            d={`M ${50 - 8},${torsoTop + 1} Q 50,${torsoTop + 6} ${50 + 8},${torsoTop + 1}`}
            stroke={necklace.color ?? "#c0a040"}
            strokeWidth="0.8"
            fill="none"
          />
          <circle cx="50" cy={torsoTop + 5} r="1.4" fill={necklace.color ?? "#c0a040"} />
        </g>
      )}

      <ellipse
        cx={HEAD_CX - rx - 0.5}
        cy={HEAD_CY + 4}
        rx="4.4"
        ry="6.1"
        fill={dressup.skin}
        stroke={skinDark}
        strokeWidth="0.45"
      />
      <ellipse
        cx={HEAD_CX + rx + 0.5}
        cy={HEAD_CY + 4}
        rx="4.4"
        ry="6.1"
        fill={dressup.skin}
        stroke={skinDark}
        strokeWidth="0.45"
      />
      <ellipse
        cx={HEAD_CX - rx - 0.3}
        cy={HEAD_CY + 4.5}
        rx="1.75"
        ry="3"
        fill={skinSoft}
        stroke={skinDark}
        strokeWidth="0.25"
        opacity="0.75"
      />
      <ellipse
        cx={HEAD_CX + rx + 0.3}
        cy={HEAD_CY + 4.5}
        rx="1.75"
        ry="3"
        fill={skinSoft}
        stroke={skinDark}
        strokeWidth="0.25"
        opacity="0.75"
      />

      <path
        d={headPath(faceShape, rx, ry)}
        fill={dressup.skin}
        stroke={skinDark}
        strokeWidth="0.6"
      />

      {earrings && (
        <>
          <circle
            cx={HEAD_CX - rx - 0.6}
            cy={HEAD_CY + 9.5}
            r="1.8"
            fill={earrings.color ?? "#e0b840"}
          />
          <circle
            cx={HEAD_CX + rx + 0.6}
            cy={HEAD_CY + 9.5}
            r="1.8"
            fill={earrings.color ?? "#e0b840"}
          />
        </>
      )}
      {earPiercing && (
        <>
          <circle
            cx={HEAD_CX - rx - 0.5}
            cy={HEAD_CY - 1.5}
            r="1"
            fill={earPiercing.color ?? "#a8d8f0"}
          />
          <circle
            cx={HEAD_CX + rx + 0.5}
            cy={HEAD_CY - 1.5}
            r="1"
            fill={earPiercing.color ?? "#a8d8f0"}
          />
        </>
      )}

      {hair.front}
      {hairClip && (
        <HairClipShape
          id={hairClip.id}
          color={hairClip.color ?? "#c83a5a"}
          x={HEAD_CX - rx * 0.48}
          y={HEAD_CY - ry + 11}
        />
      )}

      {(() => {
        const eyeY = HEAD_CY + 4.6;
        const eyeOffset = rx * 0.33;
        return (
          <>
            <ellipse cx={HEAD_CX - eyeOffset} cy={eyeY} rx="4" ry="5.2" fill="#2b1930" />
            <ellipse cx={HEAD_CX + eyeOffset} cy={eyeY} rx="4" ry="5.2" fill="#2b1930" />
            <circle
              cx={HEAD_CX - eyeOffset + 1.25}
              cy={eyeY - 1.8}
              r="1.25"
              fill="#ffffff"
              opacity="0.92"
            />
            <circle
              cx={HEAD_CX + eyeOffset + 1.25}
              cy={eyeY - 1.8}
              r="1.25"
              fill="#ffffff"
              opacity="0.92"
            />
            <circle
              cx={HEAD_CX - eyeOffset - 0.8}
              cy={eyeY + 1.7}
              r="0.7"
              fill="#ffffff"
              opacity="0.5"
            />
            <circle
              cx={HEAD_CX + eyeOffset - 0.8}
              cy={eyeY + 1.7}
              r="0.7"
              fill="#ffffff"
              opacity="0.5"
            />
          </>
        );
      })()}

      <path
        d={`M ${HEAD_CX + 0.7},${HEAD_CY + 8.3} q 2.2,1.7 -0.4,3.3`}
        stroke={skinDark}
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d={`M ${HEAD_CX - 2.8},${HEAD_CY + 14.2} Q ${HEAD_CX},${HEAD_CY + 16.8} ${HEAD_CX + 2.8},${HEAD_CY + 14.2}`}
        stroke={lipColor}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={HEAD_CX - rx * 0.58} cy={HEAD_CY + 10.2} r="3.1" fill={blush} opacity="0.5" />
      <circle cx={HEAD_CX + rx * 0.58} cy={HEAD_CY + 10.2} r="3.1" fill={blush} opacity="0.5" />

      {facePiercing &&
        (() => {
          if (facePiercing.id === "prem-face-nose")
            return (
              <circle
                cx={HEAD_CX + 3}
                cy={HEAD_CY + 9.6}
                r="0.9"
                fill={facePiercing.color ?? "#e0e0f0"}
              />
            );
          if (facePiercing.id === "prem-face-eyebrow")
            return (
              <rect
                x={HEAD_CX - rx * 0.38 - 3}
                y={HEAD_CY - 3}
                width="3"
                height="1"
                rx="0.4"
                fill={facePiercing.color ?? "#a0a0b0"}
              />
            );
          return (
            <circle
              cx={HEAD_CX - 4}
              cy={HEAD_CY + 16.4}
              r="1"
              fill="none"
              stroke={facePiercing.color ?? "#c0c0c0"}
              strokeWidth="0.7"
            />
          );
        })()}

      <EarExtra id={dressup.ears} side="L" rx={rx} />
      <EarExtra id={dressup.ears} side="R" rx={rx} />
      {hat && <HatShape id={hat.id} color={hat.color ?? "#5b6b3a"} rx={rx} ry={ry} />}
      {accessory && <AccessoryShape id={accessory.id} color={accessory.color ?? "#5b6b3a"} />}
    </svg>
  );
}
