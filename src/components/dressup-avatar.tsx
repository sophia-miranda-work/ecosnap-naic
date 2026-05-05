import {
  type BodyShape,
  type Dressup,
  type FaceShape,
  type HairStyleId,
  type EyebrowStyle,
  type FacialHairStyle,
} from "@/hooks/use-character";
import type { ReactElement } from "react";
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

  const cx = HEAD_CX;
  const cy = HEAD_CY;
  const top = cy - ry;
  const sideL = cx - rx;
  const sideR = cx + rx;

  const browY = top + ry * 0.62;
  const dark = darken(color, 0.18);
  const shine = lighten(color, 0.35);
  const soft = darken(color, 0.08);

  // ============================================================
  // MODULAR HAIR SYSTEM
  // Every hairstyle is BASE + (optional) BANGS + (optional) STYLE
  // ============================================================

  // ---- BASES -------------------------------------------------
  // FullBase: covers the entire head — top, crown, AND both sides
  // down past the ears. No bald spots, ever.
  const FullBase = (length = ry * 0.9) => (
    <path
      d={`M ${sideL - 3.5},${browY + 1}
          C ${sideL - 5},${cy + length * 0.35} ${sideL - 4},${cy + length * 0.78} ${sideL - 1.5},${cy + length}
          L ${cx - rx * 0.55},${cy + length + 1}
          L ${cx + rx * 0.55},${cy + length + 1}
          L ${sideR + 1.5},${cy + length}
          C ${sideR + 4},${cy + length * 0.78} ${sideR + 5},${cy + length * 0.35} ${sideR + 3.5},${browY + 1}
          C ${sideR + 5},${cy - ry * 0.2} ${sideR + 3},${top - 1} ${cx + rx * 0.55},${top - 4}
          C ${cx + rx * 0.25},${top - 6} ${cx - rx * 0.25},${top - 6} ${cx - rx * 0.55},${top - 4}
          C ${sideL - 3},${top - 1} ${sideL - 5},${cy - ry * 0.2} ${sideL - 3.5},${browY + 1} Z`}
      fill={color}
    />
  );

  // ShortBase: tight to head, ear-length sides
  const ShortBase = () => (
    <path
      d={`M ${sideL - 2},${browY + 2}
          C ${sideL - 3},${cy + ry * 0.25} ${sideL - 1.5},${cy + ry * 0.5} ${sideL + 1},${cy + ry * 0.55}
          L ${cx - rx * 0.5},${cy + ry * 0.55}
          L ${cx + rx * 0.5},${cy + ry * 0.55}
          L ${sideR - 1},${cy + ry * 0.55}
          C ${sideR + 1.5},${cy + ry * 0.5} ${sideR + 3},${cy + ry * 0.25} ${sideR + 2},${browY + 2}
          C ${sideR + 3},${cy - ry * 0.2} ${sideR + 2},${top - 2} ${cx + rx * 0.55},${top - 4}
          C ${cx + rx * 0.25},${top - 6} ${cx - rx * 0.25},${top - 6} ${cx - rx * 0.55},${top - 4}
          C ${sideL - 2},${top - 2} ${sideL - 3},${cy - ry * 0.2} ${sideL - 2},${browY + 2} Z`}
      fill={color}
    />
  );

  // AfroBase: large round cloud, fully covering sides
  const AfroBase = () => {
    const baseR = rx + 10;
    const els: ReactElement[] = [];
    els.push(
      <ellipse key="b" cx={cx} cy={cy - 3} rx={baseR} ry={baseR * 0.95} fill={color} />,
    );
    // outline puffs around top half
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (Math.PI * i) / (n - 1);
      const px = cx + Math.cos(a) * (baseR + 1);
      const py = cy - 3 + Math.sin(a) * (baseR + 1);
      if (py > browY + 5) continue;
      els.push(<circle key={`p${i}`} cx={px} cy={py} r={6.5} fill={color} />);
    }
    // side puffs (ensures ear-level coverage)
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      els.push(
        <circle key={`sl${i}`} cx={sideL - 3} cy={browY - 4 + t * 14} r={6.2} fill={color} />,
        <circle key={`sr${i}`} cx={sideR + 3} cy={browY - 4 + t * 14} r={6.2} fill={color} />,
      );
    }
    els.push(
      <ellipse key="sh" cx={cx - rx * 0.3} cy={top - 3} rx={rx * 0.35} ry={ry * 0.18} fill={shine} opacity="0.4" />,
    );
    return <g>{els}</g>;
  };

  // ---- BANGS -------------------------------------------------
  // Soft curved bangs — a smooth single arc across the forehead
  const SoftBangs = () => (
    <path
      d={`M ${cx - rx * 0.95},${browY - 1}
          C ${cx - rx * 0.6},${browY + 5} ${cx + rx * 0.6},${browY + 5} ${cx + rx * 0.95},${browY - 1}
          C ${cx + rx * 0.6},${browY + 1} ${cx - rx * 0.6},${browY + 1} ${cx - rx * 0.95},${browY - 1} Z`}
      fill={color}
    />
  );

  // Side-swept bangs — diagonal fringe sweeping across forehead
  const SideSweptBangs = () => (
    <path
      d={`M ${cx - rx * 0.95},${browY - 1}
          C ${cx - rx * 0.5},${browY + 6} ${cx + rx * 0.7},${browY + 4} ${cx + rx * 0.95},${browY - 2}
          C ${cx + rx * 0.5},${browY - 1} ${cx - rx * 0.4},${browY + 1} ${cx - rx * 0.95},${browY - 1} Z`}
      fill={color}
    />
  );

  // Layered anime bangs — separated chunks
  const AnimeBangs = () => (
    <g>
      <path d={`M ${cx - rx * 0.9},${browY - 2} Q ${cx - rx * 0.7},${browY + 4} ${cx - rx * 0.4},${browY + 3.5} Q ${cx - rx * 0.55},${browY + 1} ${cx - rx * 0.9},${browY - 2} Z`} fill={color} />
      <path d={`M ${cx - rx * 0.45},${browY - 2.5} Q ${cx - rx * 0.15},${browY + 5} ${cx + rx * 0.05},${browY + 4} Q ${cx - rx * 0.1},${browY + 1} ${cx - rx * 0.45},${browY - 2.5} Z`} fill={color} />
      <path d={`M ${cx + rx * 0.05},${browY - 2.5} Q ${cx + rx * 0.35},${browY + 4.5} ${cx + rx * 0.55},${browY + 3.5} Q ${cx + rx * 0.4},${browY + 0.5} ${cx + rx * 0.05},${browY - 2.5} Z`} fill={color} />
      <path d={`M ${cx + rx * 0.55},${browY - 2} Q ${cx + rx * 0.8},${browY + 3} ${cx + rx * 0.95},${browY + 1.5} Q ${cx + rx * 0.85},${browY - 0.5} ${cx + rx * 0.55},${browY - 2} Z`} fill={color} />
    </g>
  );

  // ---- ATTACHMENTS -------------------------------------------
  // Bun anchored at given point with soft base blend
  const Bun = (bx: number, by: number, r: number) => (
    <g>
      <ellipse cx={bx} cy={by + r * 0.7} rx={r * 0.95} ry={r * 0.5} fill={soft} />
      <ellipse cx={bx} cy={by} rx={r} ry={r * 0.95} fill={color} />
      <ellipse cx={bx - r * 0.3} cy={by - r * 0.32} rx={r * 0.4} ry={r * 0.24} fill={shine} opacity="0.5" />
    </g>
  );

  // Tail (pony / pigtail). Anchored to head, falls to tip.
  const Tail = (ax: number, ay: number, tx: number, ty: number, w: number) => {
    const mx = (ax + tx) / 2;
    const my = (ay + ty) / 2;
    const fw = w * 1.25;
    return (
      <g>
        <ellipse cx={ax} cy={ay} rx={fw * 0.7} ry={fw * 0.5} fill={soft} />
        <path
          d={`M ${ax - fw / 2},${ay} Q ${mx - fw * 0.55},${my} ${tx - fw * 0.6},${ty}
              Q ${tx},${ty + fw * 0.75} ${tx + fw * 0.6},${ty}
              Q ${mx + fw * 0.55},${my} ${ax + fw / 2},${ay} Z`}
          fill={color}
        />
      </g>
    );
  };

  // Long flowing back hair attached to base
  const BackFlow = (length: number, width: number) => (
    <path
      d={`M ${sideL + 2},${cy - 4}
          C ${sideL - width},${cy + length * 0.4} ${sideL - width * 0.6},${cy + length} ${cx - width * 0.6},${cy + length + 4}
          Q ${cx},${cy + length + 7} ${cx + width * 0.6},${cy + length + 4}
          C ${sideR + width * 0.6},${cy + length} ${sideR + width},${cy + length * 0.4} ${sideR - 2},${cy - 4}
          C ${sideR - 4},${top + 4} ${sideL + 4},${top + 4} ${sideL + 2},${cy - 4} Z`}
      fill={color}
    />
  );

  // Dreads attached to base — thick rope strands hanging downward
  const Dreads = () => {
    const els: ReactElement[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const sx = sideL + 1 + t * (rx * 2 - 2);
      const sy = cy + ry * 0.3;
      const ex = sx + (t - 0.5) * 4;
      const ey = sy + ry * 1.1 + ((i * 7) % 5);
      els.push(
        <path
          key={`d${i}`}
          d={`M ${sx - 2.4},${sy} Q ${sx - 1.5},${(sy + ey) / 2} ${ex - 2.2},${ey}
              Q ${ex},${ey + 2.6} ${ex + 2.2},${ey}
              Q ${sx + 1.5},${(sy + ey) / 2} ${sx + 2.4},${sy} Z`}
          fill={color}
        />,
      );
      for (let s = 1; s < 4; s++) {
        els.push(
          <ellipse
            key={`d${i}s${s}`}
            cx={sx + (ex - sx) * (s / 4)}
            cy={sy + (ey - sy) * (s / 4)}
            rx={2.4}
            ry={0.7}
            fill={dark}
            opacity="0.4"
          />,
        );
      }
    }
    return <g>{els}</g>;
  };

  // Cornrow lines drawn over a base
  const CornrowLines = () => {
    const els: ReactElement[] = [];
    const rowCount = 7;
    for (let i = 0; i < rowCount; i++) {
      const t = i / (rowCount - 1);
      const x = cx + (t - 0.5) * (rx * 1.7);
      els.push(
        <path
          key={`r${i}`}
          d={`M ${x},${browY} Q ${x + (t - 0.5) * 3},${cy - ry * 0.4} ${x + (t - 0.5) * 5},${top}`}
          stroke={dark}
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />,
      );
      for (let s = 0; s < 4; s++) {
        const u = s / 3;
        const px = x + (t - 0.5) * (3 + u * 2);
        const py = browY + u * (top - browY);
        els.push(
          <ellipse key={`r${i}b${s}`} cx={px} cy={py} rx={1.4} ry={0.7} fill={shine} opacity="0.55" />,
        );
      }
    }
    return <g>{els}</g>;
  };

  // ---- STYLE ASSEMBLY ----------------------------------------
  let backNode: React.ReactNode = null;
  let frontNode: React.ReactNode = null;

  switch (style) {
    case "soft-bob":
    case "short":
    case "bob": {
      frontNode = (
        <g>
          <FullBase length={ry * 0.7} />
          <SoftBangs />
        </g>
      );
      break;
    }

    case "long-bangs":
    case "long":
    case "straight-bangs":
    case "curtain-cut":
    case "wavy": {
      backNode = <BackFlow length={ry * 1.6} width={rx * 0.55} />;
      frontNode = (
        <g>
          <FullBase length={ry * 1.0} />
          <SoftBangs />
        </g>
      );
      break;
    }

    case "high-pony":
    case "ponytail": {
      const ax = cx + rx * 0.4;
      const ay = top - 1;
      backNode = <Tail ax={ax} ay={ay} tx={sideR + rx * 0.4} ty={cy + ry * 1.4} w={rx * 0.32} />;
      frontNode = (
        <g>
          <FullBase length={ry * 0.75} />
          <ellipse cx={ax} cy={ay + 2} rx={rx * 0.22} ry={rx * 0.15} fill={dark} />
          <AnimeBangs />
        </g>
      );
      break;
    }

    case "side-pony": {
      const ax = sideR - 2;
      const ay = cy + 2;
      backNode = <Tail ax={ax} ay={ay} tx={sideR + rx * 0.6} ty={cy + ry * 1.3} w={rx * 0.34} />;
      frontNode = (
        <g>
          <FullBase length={ry * 0.8} />
          <ellipse cx={ax - 1} cy={ay} rx={rx * 0.2} ry={rx * 0.16} fill={dark} />
          <SideSweptBangs />
        </g>
      );
      break;
    }

    case "low-pigtails":
    case "pigtails": {
      const yAnchor = cy + ry * 0.35;
      backNode = (
        <g>
          <Tail ax={sideL + 2} ay={yAnchor} tx={sideL - rx * 0.15} ty={cy + ry * 1.35} w={rx * 0.28} />
          <Tail ax={sideR - 2} ay={yAnchor} tx={sideR + rx * 0.15} ty={cy + ry * 1.35} w={rx * 0.28} />
        </g>
      );
      frontNode = (
        <g>
          <FullBase length={ry * 0.9} />
          <SoftBangs />
        </g>
      );
      break;
    }

    case "long-pigtails": {
      const yAnchor = cy + ry * 0.35;
      backNode = (
        <g>
          <Tail ax={sideL + 2} ay={yAnchor} tx={sideL - rx * 0.25} ty={cy + ry * 1.9} w={rx * 0.32} />
          <Tail ax={sideR - 2} ay={yAnchor} tx={sideR + rx * 0.25} ty={cy + ry * 1.9} w={rx * 0.32} />
        </g>
      );
      frontNode = (
        <g>
          <FullBase length={ry * 0.95} />
          <SoftBangs />
        </g>
      );
      break;
    }

    case "space-buns":
    case "double-bun": {
      // Anchored at ear level on each side, like Mickey ears
      const bxL = cx - rx * 0.95;
      const bxR = cx + rx * 0.95;
      const by = top + ry * 0.18;
      frontNode = (
        <g>
          <FullBase length={ry * 0.65} />
          {Bun(bxL, by, rx * 0.3)}
          {Bun(bxR, by, rx * 0.3)}
          <SoftBangs />
        </g>
      );
      break;
    }

    case "bun":
    case "side-bun":
    case "topknot": {
      const bx = style === "side-bun" ? cx + rx * 0.55 : cx;
      const by = top - rx * 0.1;
      frontNode = (
        <g>
          <FullBase length={ry * 0.65} />
          {Bun(bx, by, rx * 0.38)}
          <SoftBangs />
        </g>
      );
      break;
    }

    case "fluffy-curls":
    case "curly":
    case "afro": {
      frontNode = <AfroBase />;
      break;
    }

    case "twin-braids":
    case "braids": {
      const yAnchor = cy + ry * 0.4;
      const segs = 5;
      const braidEls = (ax: number, ay: number, tx: number, ty: number, w: number) => {
        const els: ReactElement[] = [];
        for (let i = 0; i <= segs; i++) {
          const t = i / segs;
          const x = ax + (tx - ax) * t;
          const y = ay + (ty - ay) * t;
          els.push(
            <ellipse key={i} cx={x} cy={y} rx={w * 0.55} ry={w * 0.42} fill={i % 2 ? color : darken(color, 0.1)} />,
          );
        }
        return els;
      };
      backNode = (
        <g>
          {braidEls(sideL + 1, yAnchor, sideL - rx * 0.1, cy + ry * 1.5, rx * 0.22)}
          {braidEls(sideR - 1, yAnchor, sideR + rx * 0.1, cy + ry * 1.5, rx * 0.22)}
        </g>
      );
      frontNode = (
        <g>
          <FullBase length={ry * 0.85} />
          <SoftBangs />
        </g>
      );
      break;
    }

    case "dreads": {
      backNode = <Dreads />;
      frontNode = (
        <g>
          <FullBase length={ry * 0.6} />
          <SoftBangs />
        </g>
      );
      break;
    }

    case "cornrows": {
      frontNode = (
        <g>
          <FullBase length={ry * 0.55} />
          <CornrowLines />
        </g>
      );
      break;
    }

    case "fade":
    case "undercut": {
      // Pixie: short base + soft bangs
      frontNode = (
        <g>
          <ShortBase />
          <SoftBangs />
          <ellipse cx={cx - rx * 0.25} cy={top - 4} rx={rx * 0.25} ry={ry * 0.16} fill={shine} opacity="0.45" />
        </g>
      );
      break;
    }

    case "side-sweep": {
      frontNode = (
        <g>
          <FullBase length={ry * 0.75} />
          <SideSweptBangs />
        </g>
      );
      break;
    }

    case "mohawk": {
      frontNode = <ShortBase />;
      break;
    }

    default:
      frontNode = (
        <g>
          <FullBase length={ry * 0.8} />
          <SoftBangs />
        </g>
      );
      break;
  }

  return { back: backNode, front: frontNode };
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
  const accent = lighten(color, 0.34);
  const pale = lighten(color, 0.58);
  const trim = darken(color, 0.24);
  const waistY = torsoTop + 13;
  const hemY = legTop + 12;

  const flowerPrint = (baseY = waistY + 4) => (
    <g opacity="0.9">
      {[-11, -3, 6, 13].map((dx, i) => (
        <g key={dx} transform={`translate(${50 + dx} ${baseY + (i % 2) * 5}) scale(0.75)`}>
          <circle cx="0" cy="-1.2" r="1" fill={pale} />
          <circle cx="1.2" cy="0" r="1" fill={pale} />
          <circle cx="0" cy="1.2" r="1" fill={pale} />
          <circle cx="-1.2" cy="0" r="1" fill={pale} />
          <circle cx="0" cy="0" r="0.55" fill={trim} />
        </g>
      ))}
    </g>
  );

  if (id?.includes("sailor")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 1},${torsoTop + 1} Q 50,${torsoTop - 5} ${50 + shoulderW / 2 + 1},${torsoTop + 1} L ${50 + hipW / 2 + 4},${waistY + 2} L ${50 - hipW / 2 - 4},${waistY + 2} Z`} fill={color} />
        <path d={`M ${50 - 12},${torsoTop + 2} L 50,${torsoTop + 12} L ${50 + 12},${torsoTop + 2} L ${50 + 8},${torsoTop + 13} L ${50 - 8},${torsoTop + 13} Z`} fill={pale} opacity="0.9" />
        <path d={`M 50,${torsoTop + 8} l -3,5 h 6 Z`} fill={darken(color, 0.42)} />
        <path d={`M ${50 - hipW / 2 - 8},${waistY + 1} L ${50 + hipW / 2 + 8},${waistY + 1} L ${50 + hipW / 2 + 11},${hemY} Q 50,${hemY + 5} ${50 - hipW / 2 - 11},${hemY} Z`} fill={lighten(color, 0.1)} />
        <g stroke={trim} strokeWidth="0.55" opacity="0.72">
          {[-3, -1.5, 0, 1.5, 3].map((k) => <line key={k} x1={50 + k * 3} y1={waistY + 3} x2={50 + k * 4.1} y2={hemY + 1} />)}
        </g>
      </g>
    );
  }

  if (id?.includes("sweater") || id?.includes("smock")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 4},${torsoTop + 2} Q 50,${torsoTop - 3} ${50 + shoulderW / 2 + 4},${torsoTop + 2} L ${50 + hipW / 2 + 6},${hemY - 2} Q 50,${hemY + 2} ${50 - hipW / 2 - 6},${hemY - 2} Z`} fill={color} />
        <path d={`M ${50 - 7},${torsoTop + 1} Q 50,${torsoTop + 6} ${50 + 7},${torsoTop + 1} L ${50 + 5},${torsoTop + 7} Q 50,${torsoTop + 10} ${50 - 5},${torsoTop + 7} Z`} fill={pale} opacity="0.85" />
        <g stroke={trim} strokeWidth="0.55" opacity="0.55">
          {[-8, -4, 0, 4, 8].map((dx) => <path key={dx} d={`M ${50 + dx},${torsoTop + 10} q 1.2,4 0,8 q -1.2,4 0,8`} fill="none" />)}
        </g>
        <g fill={trim} opacity="0.75">
          <circle cx="47" cy={torsoTop + 20} r="1.1" />
          <circle cx="53" cy={torsoTop + 20} r="1.1" />
          <path d={`M 46,${torsoTop + 24} Q 50,${torsoTop + 27} 54,${torsoTop + 24}`} fill="none" stroke={trim} strokeWidth="0.7" strokeLinecap="round" />
        </g>
      </g>
    );
  }

  if (id?.includes("pinafore")) {
    return (
      <g>
        <path d={`M ${50 - 10},${torsoTop + 1} L ${50 + 10},${torsoTop + 1} L ${50 + hipW / 2 + 9},${hemY} Q 50,${hemY + 3} ${50 - hipW / 2 - 9},${hemY} Z`} fill={color} />
        <path d={`M ${50 - 15},${torsoTop + 5} Q 50,${torsoTop - 2} ${50 + 15},${torsoTop + 5} L ${50 + 10},${torsoTop + 10} Q 50,${torsoTop + 6} ${50 - 10},${torsoTop + 10} Z`} fill={pale} opacity="0.95" />
        <rect x={50 - 8.5} y={torsoTop} width="3.2" height="17" rx="1.2" fill={pale} opacity="0.9" />
        <rect x={50 + 5.3} y={torsoTop} width="3.2" height="17" rx="1.2" fill={pale} opacity="0.9" />
        <rect x={50 - 5} y={waistY + 2} width="10" height="6" rx="1.2" fill={pale} stroke={trim} strokeWidth="0.45" opacity="0.95" />
        <path d={`M ${50 - hipW / 2 - 5},${hemY - 2} Q 50,${hemY + 1} ${50 + hipW / 2 + 5},${hemY - 2}`} stroke={trim} strokeWidth="0.6" fill="none" />
      </g>
    );
  }

  if (id?.includes("tutu") || id?.includes("party") || id?.includes("lavender")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 2},${torsoTop + 1} Q 50,${torsoTop - 5} ${50 + shoulderW / 2 + 2},${torsoTop + 1} L ${50 + 9},${waistY + 2} L ${50 - 9},${waistY + 2} Z`} fill={color} />
        <path d={`M ${50 - 7},${torsoTop + 2} Q 50,${torsoTop + 6} ${50 + 7},${torsoTop + 2} Q 50,${torsoTop + 13} ${50 - 7},${torsoTop + 2} Z`} fill={pale} opacity="0.8" />
        <path d={`M ${50 - hipW / 2 - 14},${waistY + 2} Q 50,${waistY + 14} ${50 + hipW / 2 + 14},${waistY + 2} L ${50 + hipW / 2 + 10},${hemY + 1} Q 50,${hemY + 7} ${50 - hipW / 2 - 10},${hemY + 1} Z`} fill={lighten(color, 0.22)} opacity="0.88" />
        <path d={`M ${50 - hipW / 2 - 11},${waistY + 7} Q 50,${waistY + 18} ${50 + hipW / 2 + 11},${waistY + 7} L ${50 + hipW / 2 + 8},${hemY + 4} Q 50,${hemY + 9} ${50 - hipW / 2 - 8},${hemY + 4} Z`} fill={pale} opacity="0.38" />
        <path d={`M ${50 - 5},${waistY + 1} L ${50 + 5},${waistY + 1} M 50,${waistY + 1} l -4,4 M 50,${waistY + 1} l 4,4`} stroke={trim} strokeWidth="0.75" strokeLinecap="round" />
      </g>
    );
  }

  if (id?.includes("princess") || id?.includes("rose") || id?.includes("night") || id?.includes("starlight")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 1},${torsoTop} Q 50,${torsoTop - 6} ${50 + shoulderW / 2 + 1},${torsoTop} L ${50 + 8},${waistY + 3} L ${50 - 8},${waistY + 3} Z`} fill={color} />
        <path d={`M ${50 - hipW / 2 - 17},${waistY + 2} C ${50 - 23},${hemY + 5} ${50 + 23},${hemY + 5} ${50 + hipW / 2 + 17},${waistY + 2} L ${50 + hipW / 2 + 20},${hemY + 12} Q 50,${hemY + 20} ${50 - hipW / 2 - 20},${hemY + 12} Z`} fill={color} />
        <path d={`M ${50 - 7},${torsoTop + 3} L 50,${waistY + 4} L ${50 + 7},${torsoTop + 3}`} fill={pale} opacity="0.55" />
        <g fill={pale} opacity="0.8">
          <circle cx="41" cy={hemY + 6} r="1" />
          <circle cx="58" cy={hemY + 2} r="0.9" />
          <path d={`M 50,${hemY + 3} l 1,2 l 2,0.5 l -2,0.7 l -1,2 l -1,-2 l -2,-0.7 l 2,-0.5 Z`} />
        </g>
      </g>
    );
  }

  if (id?.includes("sundress") || id?.includes("floral") || id?.includes("meadow")) {
    return (
      <g>
        <path d={`M ${50 - 8},${torsoTop} L ${50 + 8},${torsoTop} L ${50 + hipW / 2 + 10},${hemY + 2} Q 50,${hemY + 7} ${50 - hipW / 2 - 10},${hemY + 2} Z`} fill={color} />
        <path d={`M ${50 - 9},${torsoTop} C ${50 - 6},${torsoTop + 5} ${50 - 2},${torsoTop + 5} 50,${torsoTop + 1} C ${50 + 2},${torsoTop + 5} ${50 + 6},${torsoTop + 5} ${50 + 9},${torsoTop} L ${50 + 6},${waistY} L ${50 - 6},${waistY} Z`} fill={lighten(color, 0.12)} />
        <path d={`M ${50 - 11},${torsoTop - 1} Q ${50 - 14},${torsoTop - 7} ${50 - 18},${torsoTop + 1} M ${50 + 11},${torsoTop - 1} Q ${50 + 14},${torsoTop - 7} ${50 + 18},${torsoTop + 1}`} stroke={trim} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {flowerPrint()}
      </g>
    );
  }

  return (
    <g>
      <path d={`M ${50 - shoulderW / 2},${torsoTop} Q ${50 - shoulderW / 2 - 3},${torsoTop + 11} ${50 - hipW / 2 - 8},${hemY} L ${50 + hipW / 2 + 8},${hemY} Q ${50 + shoulderW / 2 + 3},${torsoTop + 11} ${50 + shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`} fill={color} />
      <path d={`M ${50 - 7},${torsoTop + 2} Q 50,${torsoTop + 7} ${50 + 7},${torsoTop + 2}`} stroke={pale} strokeWidth="1.2" fill="none" />
      {flowerPrint(waistY + 3)}
    </g>
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
  const accent = lighten(color, 0.38);
  const pale = lighten(color, 0.58);
  const dark = darken(color, 0.24);

  if (id?.includes("cloak")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 5},${torsoTop + 1} Q 50,${torsoTop - 8} ${50 + shoulderW / 2 + 5},${torsoTop + 1} L ${50 + torsoW / 2 + 9},${torsoBottom + 8} Q 50,${torsoBottom + 12} ${50 - torsoW / 2 - 9},${torsoBottom + 8} Z`} fill={color} />
        <path d={`M 50,${torsoTop + 1} L ${50 - 7},${torsoBottom + 6} M 50,${torsoTop + 1} L ${50 + 7},${torsoBottom + 6}`} stroke={dark} strokeWidth="0.7" opacity="0.65" />
        <circle cx="50" cy={torsoTop + 8} r="2" fill={accent} />
      </g>
    );
  }

  if (id?.includes("hoodie")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 3},${torsoTop + 3} Q 50,${torsoTop - 4} ${50 + shoulderW / 2 + 3},${torsoTop + 3} L ${50 + torsoW / 2 + 4},${torsoBottom + 2} Q 50,${torsoBottom + 5} ${50 - torsoW / 2 - 4},${torsoBottom + 2} Z`} fill={color} />
        <path d={`M ${50 - 8},${torsoTop + 2} Q 50,${torsoTop + 10} ${50 + 8},${torsoTop + 2} Q 50,${torsoTop - 2} ${50 - 8},${torsoTop + 2} Z`} fill={dark} opacity="0.65" />
        <rect x={50 - 5} y={torsoTop + 15} width="10" height="6" rx="1.5" fill={accent} opacity="0.85" />
        <path d={`M ${50 - 3},${torsoTop + 10} q -4,3 -4,7 M ${50 + 3},${torsoTop + 10} q 4,3 4,7`} stroke={pale} strokeWidth="0.7" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  if (id?.includes("poncho")) {
    return (
      <g>
        <path d={`M 50,${torsoTop - 4} L ${50 + shoulderW / 2 + 8},${torsoBottom + 8} Q 50,${torsoBottom + 13} ${50 - shoulderW / 2 - 8},${torsoBottom + 8} Z`} fill={color} />
        <path d={`M ${50 - 12},${torsoTop + 13} H ${50 + 12} M ${50 - 15},${torsoTop + 18} H ${50 + 15}`} stroke={accent} strokeWidth="1.1" opacity="0.8" />
        <path d={`M ${50 - 4},${torsoTop + 1} Q 50,${torsoTop + 5} ${50 + 4},${torsoTop + 1}`} stroke={dark} strokeWidth="0.9" fill="none" />
      </g>
    );
  }

  if (id?.includes("cardigan") || id?.includes("jacket")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 1},${torsoTop} Q ${50 - shoulderW / 2 - 3},${torsoTop + 14} ${50 - torsoW / 2 - 1},${torsoBottom + 1} L 50,${torsoBottom - 1} L 50,${torsoTop + 4} Q ${50 - 6},${torsoTop + 2} ${50 - shoulderW / 2 - 1},${torsoTop} Z`} fill={color} />
        <path d={`M ${50 + shoulderW / 2 + 1},${torsoTop} Q ${50 + shoulderW / 2 + 3},${torsoTop + 14} ${50 + torsoW / 2 + 1},${torsoBottom + 1} L 50,${torsoBottom - 1} L 50,${torsoTop + 4} Q ${50 + 6},${torsoTop + 2} ${50 + shoulderW / 2 + 1},${torsoTop} Z`} fill={color} />
        <path d={`M ${50 - 5},${torsoTop + 2} L 50,${torsoTop + 8} L ${50 + 5},${torsoTop + 2}`} fill={accent} opacity="0.82" />
        <line x1="50" y1={torsoTop + 4} x2="50" y2={torsoBottom} stroke={dark} strokeWidth="0.65" />
        {[0, 1, 2].map((i) => <circle key={i} cx="48.3" cy={torsoTop + 10 + i * 5} r="0.65" fill={dark} />)}
      </g>
    );
  }

  if (id?.includes("raincoat")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 2},${torsoTop + 1} Q 50,${torsoTop - 4} ${50 + shoulderW / 2 + 2},${torsoTop + 1} L ${50 + torsoW / 2 + 3},${torsoBottom + 3} L ${50 - torsoW / 2 - 3},${torsoBottom + 3} Z`} fill={color} />
        <path d={`M ${50 - 10},${torsoTop + 1} Q 50,${torsoTop + 10} ${50 + 10},${torsoTop + 1} Q 50,${torsoTop - 4} ${50 - 10},${torsoTop + 1} Z`} fill={accent} />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${50 - 4},${torsoTop + 10 + i * 5} h 8`} stroke={dark} strokeWidth="0.9" strokeLinecap="round" />)}
      </g>
    );
  }

  if (id?.includes("flannel")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2},${torsoTop} Q ${50 - shoulderW / 2 - 2},${torsoTop + 12} ${50 - torsoW / 2},${torsoBottom} L ${50 + torsoW / 2},${torsoBottom} Q ${50 + shoulderW / 2 + 2},${torsoTop + 12} ${50 + shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`} fill={color} />
        <path d={`M ${50 - 8},${torsoTop + 1} L 50,${torsoTop + 7} L ${50 + 8},${torsoTop + 1} L ${50 + 6},${torsoTop + 9} L ${50 - 6},${torsoTop + 9} Z`} fill={accent} opacity="0.85" />
        <g stroke={dark} strokeWidth="0.55" opacity="0.55">
          {[-8, -3, 2, 7].map((dx) => <line key={dx} x1={50 + dx} y1={torsoTop + 1} x2={50 + dx} y2={torsoBottom - 1} />)}
          {[5, 10, 15].map((dy) => <line key={dy} x1={50 - torsoW / 2} y1={torsoTop + dy} x2={50 + torsoW / 2} y2={torsoTop + dy} />)}
        </g>
      </g>
    );
  }

  if (id?.includes("sweater") || id?.includes("knit")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2 - 1},${torsoTop + 1} Q 50,${torsoTop - 4} ${50 + shoulderW / 2 + 1},${torsoTop + 1} L ${50 + torsoW / 2 + 2},${torsoBottom + 2} Q 50,${torsoBottom + 4} ${50 - torsoW / 2 - 2},${torsoBottom + 2} Z`} fill={color} />
        <path d={`M ${50 - 8},${torsoTop + 2} Q 50,${torsoTop + 8} ${50 + 8},${torsoTop + 2}`} stroke={accent} strokeWidth="1.1" fill="none" />
        <g stroke={dark} strokeWidth="0.55" opacity="0.55">
          {[-6, -2, 2, 6].map((dx) => <path key={dx} d={`M ${50 + dx},${torsoTop + 8} q 1.1,3 0,6 q -1.1,3 0,6`} fill="none" />)}
        </g>
      </g>
    );
  }

  if (id?.includes("tank")) {
    return (
      <g>
        <path d={`M ${50 - 7},${torsoTop} L ${50 + 7},${torsoTop} L ${50 + torsoW / 2},${torsoBottom} L ${50 - torsoW / 2},${torsoBottom} Z`} fill={color} />
        <path d={`M ${50 - 7},${torsoTop} Q ${50 - 10},${torsoTop - 4} ${50 - 13},${torsoTop + 1} M ${50 + 7},${torsoTop} Q ${50 + 10},${torsoTop - 4} ${50 + 13},${torsoTop + 1}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d={`M ${50 - 5},${torsoTop + 8} H ${50 + 5}`} stroke={accent} strokeWidth="1" />
      </g>
    );
  }

  if (id?.includes("crop")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 + shoulderW / 2},${torsoTop} L ${50 + torsoW / 2 + 1},${torsoTop + 13} L ${50 - torsoW / 2 - 1},${torsoTop + 13} Z`} fill={color} />
        <path d={`M ${50 - torsoW / 2 - 1},${torsoTop + 10.5} H ${50 + torsoW / 2 + 1} M ${50 - torsoW / 2 - 1},${torsoTop + 12.3} H ${50 + torsoW / 2 + 1}`} stroke={accent} strokeWidth="0.55" />
        <circle cx="50" cy={torsoTop + 6} r="2.3" fill={pale} opacity="0.8" />
      </g>
    );
  }

  if (id?.includes("longsleeve")) {
    return (
      <g>
        <path d={`M ${50 - shoulderW / 2},${torsoTop} Q ${50 - shoulderW / 2 - 1},${torsoTop + 12} ${50 - torsoW / 2},${torsoBottom} L ${50 + torsoW / 2},${torsoBottom} Q ${50 + shoulderW / 2 + 1},${torsoTop + 12} ${50 + shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`} fill={color} />
        <g stroke={accent} strokeWidth="0.8" opacity="0.85">
          {[torsoTop + 5, torsoTop + 10, torsoTop + 15].map((y) => <line key={y} x1={50 - torsoW / 2} y1={y} x2={50 + torsoW / 2} y2={y} />)}
        </g>
      </g>
    );
  }

  return (
    <g>
      <path d={`M ${50 - shoulderW / 2},${torsoTop} Q ${50 - shoulderW / 2 - 1},${torsoTop + 12} ${50 - torsoW / 2},${torsoBottom} L ${50 + torsoW / 2},${torsoBottom} Q ${50 + shoulderW / 2 + 1},${torsoTop + 12} ${50 + shoulderW / 2},${torsoTop} Q 50,${torsoTop - 3} ${50 - shoulderW / 2},${torsoTop} Z`} fill={color} />
      <path d={`M ${50 - 6},${torsoTop + 2} Q 50,${torsoTop + 7} ${50 + 6},${torsoTop + 2}`} stroke={accent} strokeWidth="1" fill="none" />
      <path d={`M ${50 - 4},${torsoTop + 12} h 8`} stroke={pale} strokeWidth="1" strokeLinecap="round" />
    </g>
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
  const accent = lighten(color, 0.36);
  const dark = darken(color, 0.24);
  if (id?.includes("skirt")) {
    const denim = id?.includes("denim");
    return (
      <g>
        <path d={`M ${50 - hipW / 2 - 4},${torsoBottom - 2} L ${50 + hipW / 2 + 4},${torsoBottom - 2} L ${50 + hipW / 2 + (denim ? 5 : 9)},${legTop + (denim ? 9 : 12)} Q 50,${legTop + (denim ? 12 : 16)} ${50 - hipW / 2 - (denim ? 5 : 9)},${legTop + (denim ? 9 : 12)} Z`} fill={color} />
        {denim ? (
          <>
            <path d={`M ${50 - hipW / 2 - 3},${torsoBottom + 1.5} H ${50 + hipW / 2 + 3}`} stroke={accent} strokeWidth="0.55" strokeDasharray="0.9 0.9" />
            <rect x={50 - 1.5} y={torsoBottom - 1} width="3" height="2.5" rx="0.4" fill={accent} opacity="0.9" />
            <path d={`M ${50 - 8},${torsoBottom + 2} q 3,3 6,0 M ${50 + 2},${torsoBottom + 2} q 3,3 6,0`} stroke={dark} strokeWidth="0.45" fill="none" />
          </>
        ) : (
          <g stroke={dark} strokeWidth="0.45" opacity="0.7">
            {[-2, -1, 0, 1, 2].map((k) => <line key={k} x1={50 + k * 3} y1={torsoBottom - 1} x2={50 + k * 4.2} y2={legTop + 12} />)}
          </g>
        )}
      </g>
    );
  }

  if (id?.includes("short")) {
    return (
      <g>
        <path d={`M ${50 - hipW / 2 - 1},${torsoBottom - 1} L ${50 + hipW / 2 + 1},${torsoBottom - 1} L ${50 + hipW / 2 + 1},${legTop + 8} L ${52},${legTop + 8} L 50,${legTop + 4} L 48,${legTop + 8} L ${50 - hipW / 2 - 1},${legTop + 8} Z`} fill={color} />
        <path d={`M 50,${legTop + 3} V ${legTop + 8}`} stroke={dark} strokeWidth="0.55" />
        <path d={`M ${50 - hipW / 2 + 2},${torsoBottom + 2} q 3,2 6,0 M ${50 + hipW / 2 - 2},${torsoBottom + 2} q -3,2 -6,0`} stroke={accent} strokeWidth="0.45" fill="none" />
      </g>
    );
  }

  if (id?.includes("overalls")) {
    return (
      <g>
        <path d={`M ${50 - hipW / 2 + 1},${legTop} h ${hipW - 2} v ${legTop - torsoBottom + 13} h -${hipW - 2} Z`} fill={color} />
        <rect x={50 - 7} y={torsoBottom - 8} width="14" height="8" rx="1" fill={color} />
        <rect x={50 - 8} y={torsoBottom - 15} width="3" height="9" rx="1" fill={color} />
        <rect x={50 + 5} y={torsoBottom - 15} width="3" height="9" rx="1" fill={color} />
        <rect x={50 - 4} y={torsoBottom - 5.5} width="8" height="4" rx="0.8" fill={accent} opacity="0.75" />
        <circle cx={50 - 5.3} cy={torsoBottom - 6.2} r="0.7" fill={dark} />
        <circle cx={50 + 5.3} cy={torsoBottom - 6.2} r="0.7" fill={dark} />
      </g>
    );
  }

  if (id?.includes("cargo")) {
    return (
      <g>
        <path d={`M ${50 - hipW / 2 + 1},${legTop} h ${hipW - 2} v 13 h -${hipW - 2} Z`} fill={color} />
        <rect x={50 - 11} y={legTop + 4} width="6" height="5" rx="1" fill={dark} opacity="0.55" />
        <rect x={50 + 5} y={legTop + 4} width="6" height="5" rx="1" fill={dark} opacity="0.55" />
        <path d={`M 50,${legTop + 1} V ${legTop + 13}`} stroke={dark} strokeWidth="0.55" />
        <path d={`M ${50 - hipW / 2 + 3},${torsoBottom + 1.5} H ${50 + hipW / 2 - 3}`} stroke={accent} strokeWidth="0.55" />
      </g>
    );
  }

  if (id?.includes("legging")) {
    return (
      <g>
        <path d={`M ${50 - hipW / 2 + 2},${legTop} h ${hipW - 4} v 13 h -${hipW - 4} Z`} fill={color} />
        <path d={`M 50,${legTop + 1} V ${legTop + 13}`} stroke={accent} strokeWidth="0.45" opacity="0.75" />
        <path d={`M ${50 - hipW / 2 + 4},${legTop + 3} H ${50 + hipW / 2 - 4}`} stroke={dark} strokeWidth="0.5" opacity="0.55" />
      </g>
    );
  }

  return (
    <g>
      <path d={`M ${50 - hipW / 2 + 1},${legTop} h ${hipW - 2} v 13 h -${hipW - 2} Z`} fill={color} />
      <path d={`M 50,${legTop + 1} V ${legTop + 13}`} stroke={dark} strokeWidth="0.55" opacity="0.7" />
      <path d={`M ${50 - hipW / 2 + 3},${legTop + 3} h 6 M ${50 + hipW / 2 - 9},${legTop + 3} h 6`} stroke={accent} strokeWidth="0.55" strokeLinecap="round" />
    </g>
  );
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
            {(() => {
              const eb: EyebrowStyle = dressup.eyebrows ?? "none";
              if (eb === "none") return null;
              const browY = eyeY - 6.2;
              const browColor = darken(dressup.hair, 0.1);
              const w = 4.6;
              if (eb === "straight") {
                return (
                  <g fill={browColor}>
                    <rect x={HEAD_CX - eyeOffset - w} y={browY - 0.6} width={w * 2} height="1.2" rx="0.6" />
                    <rect x={HEAD_CX + eyeOffset - w} y={browY - 0.6} width={w * 2} height="1.2" rx="0.6" />
                  </g>
                );
              }
              if (eb === "thick") {
                return (
                  <g fill={browColor}>
                    <path d={`M ${HEAD_CX - eyeOffset - w},${browY + 0.4} Q ${HEAD_CX - eyeOffset},${browY - 2.2} ${HEAD_CX - eyeOffset + w},${browY + 0.4} Q ${HEAD_CX - eyeOffset},${browY - 0.4} ${HEAD_CX - eyeOffset - w},${browY + 0.4} Z`} />
                    <path d={`M ${HEAD_CX + eyeOffset - w},${browY + 0.4} Q ${HEAD_CX + eyeOffset},${browY - 2.2} ${HEAD_CX + eyeOffset + w},${browY + 0.4} Q ${HEAD_CX + eyeOffset},${browY - 0.4} ${HEAD_CX + eyeOffset - w},${browY + 0.4} Z`} />
                  </g>
                );
              }
              if (eb === "thin") {
                return (
                  <g stroke={browColor} strokeWidth="0.7" fill="none" strokeLinecap="round">
                    <path d={`M ${HEAD_CX - eyeOffset - w},${browY + 0.3} Q ${HEAD_CX - eyeOffset},${browY - 1.4} ${HEAD_CX - eyeOffset + w},${browY + 0.3}`} />
                    <path d={`M ${HEAD_CX + eyeOffset - w},${browY + 0.3} Q ${HEAD_CX + eyeOffset},${browY - 1.4} ${HEAD_CX + eyeOffset + w},${browY + 0.3}`} />
                  </g>
                );
              }
              if (eb === "raised") {
                return (
                  <g stroke={browColor} strokeWidth="1.1" fill="none" strokeLinecap="round">
                    <path d={`M ${HEAD_CX - eyeOffset - w},${browY + 0.6} Q ${HEAD_CX - eyeOffset},${browY - 2.4} ${HEAD_CX - eyeOffset + w},${browY}`} />
                    <path d={`M ${HEAD_CX + eyeOffset - w},${browY} Q ${HEAD_CX + eyeOffset},${browY - 2.4} ${HEAD_CX + eyeOffset + w},${browY + 0.6}`} />
                  </g>
                );
              }
              // soft-arch (default)
              return (
                <g stroke={browColor} strokeWidth="1.1" fill="none" strokeLinecap="round">
                  <path d={`M ${HEAD_CX - eyeOffset - w},${browY + 0.4} Q ${HEAD_CX - eyeOffset},${browY - 1.8} ${HEAD_CX - eyeOffset + w},${browY + 0.4}`} />
                  <path d={`M ${HEAD_CX + eyeOffset - w},${browY + 0.4} Q ${HEAD_CX + eyeOffset},${browY - 1.8} ${HEAD_CX + eyeOffset + w},${browY + 0.4}`} />
                </g>
              );
            })()}
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

      {(() => {
        const fh: FacialHairStyle = dressup.facialHair ?? "none";
        if (fh === "none") return null;
        const c = darken(dressup.hair, 0.1);
        const mouthY = HEAD_CY + 15;
        if (fh === "stubble") {
          return (
            <g fill={c} opacity="0.45">
              {Array.from({ length: 22 }).map((_, i) => {
                const ang = (i / 22) * Math.PI;
                const r = rx * 0.62;
                const x = HEAD_CX + Math.cos(ang) * r * (i % 2 ? 1 : -1) * 0.5 + (i - 11) * 0.6;
                const y = mouthY + 1 + (i % 3) * 0.8;
                return <circle key={i} cx={x} cy={y} r="0.45" />;
              })}
            </g>
          );
        }
        if (fh === "mustache") {
          return (
            <path
              d={`M ${HEAD_CX - 5},${mouthY - 1.5} Q ${HEAD_CX - 2.5},${mouthY - 3} ${HEAD_CX},${mouthY - 1.2} Q ${HEAD_CX + 2.5},${mouthY - 3} ${HEAD_CX + 5},${mouthY - 1.5} Q ${HEAD_CX + 2.5},${mouthY - 0.4} ${HEAD_CX},${mouthY - 0.8} Q ${HEAD_CX - 2.5},${mouthY - 0.4} ${HEAD_CX - 5},${mouthY - 1.5} Z`}
              fill={c}
            />
          );
        }
        if (fh === "goatee") {
          return (
            <g fill={c}>
              <path d={`M ${HEAD_CX - 3.2},${mouthY + 1.5} Q ${HEAD_CX},${mouthY + 5.5} ${HEAD_CX + 3.2},${mouthY + 1.5} Q ${HEAD_CX},${mouthY + 2.5} ${HEAD_CX - 3.2},${mouthY + 1.5} Z`} />
              <path d={`M ${HEAD_CX - 4},${mouthY - 1.6} Q ${HEAD_CX},${mouthY - 2.6} ${HEAD_CX + 4},${mouthY - 1.6} Q ${HEAD_CX},${mouthY - 0.8} ${HEAD_CX - 4},${mouthY - 1.6} Z`} />
            </g>
          );
        }
        // full-beard
        return (
          <g fill={c}>
            <path
              d={`M ${HEAD_CX - rx * 0.85},${HEAD_CY + 8}
                  Q ${HEAD_CX - rx},${HEAD_CY + ry - 2} ${HEAD_CX},${HEAD_CY + ry + 2}
                  Q ${HEAD_CX + rx},${HEAD_CY + ry - 2} ${HEAD_CX + rx * 0.85},${HEAD_CY + 8}
                  Q ${HEAD_CX + 5},${HEAD_CY + 13} ${HEAD_CX},${HEAD_CY + 12}
                  Q ${HEAD_CX - 5},${HEAD_CY + 13} ${HEAD_CX - rx * 0.85},${HEAD_CY + 8} Z`}
            />
            <path
              d={`M ${HEAD_CX - 5},${mouthY - 1.5} Q ${HEAD_CX},${mouthY - 3} ${HEAD_CX + 5},${mouthY - 1.5} Q ${HEAD_CX},${mouthY - 0.5} ${HEAD_CX - 5},${mouthY - 1.5} Z`}
            />
          </g>
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
