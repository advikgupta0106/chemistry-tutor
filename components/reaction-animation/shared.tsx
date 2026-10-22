// Shared geometry and drawing primitives for the reaction scenes. Every
// scene draws into the same viewBox (0 0 160 220) and is a pure function of
// `progress` (0 → 1), so scrubbing to a given point always renders the same
// frame and nothing depends on Math.random() (no hydration mismatch).

import type { ReactionAnimation } from "@/lib/content";

export type SceneProps = {
  anim: ReactionAnimation;
  progress: number;
  // Prefix for SVG ids (clip paths, filters) so two open animations on the
  // same page never collide.
  uid: string;
};

export const VIEW_W = 160;
export const VIEW_H = 220;

export const GLASS = "#3a3650";
export const GLASS_FILL = "rgba(244, 244, 246, 0.04)";

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

// Progress within the window [a, b] of the overall timeline, clamped to 0–1.
export function seg(p: number, a: number, b: number): number {
  return clamp01((p - a) / (b - a));
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// Deterministic pseudo-random in [0, 1), seeded by index.
export function fakeRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const INTENSITY_SPEED: Record<ReactionAnimation["intensity"], number> = {
  slow: 1,
  steady: 1.8,
  violent: 3,
};

export const GAS_BUBBLES: Record<ReactionAnimation["gas"]["amount"], number> = {
  none: 0,
  little: 3,
  some: 6,
  lots: 11,
};

// ---------------------------------------------------------------- vessels

// Beaker: open top at y=28, flat bottom at y=185.
export const BEAKER = { left: 30, right: 130, rim: 28, bottom: 185, liquidTop: 85 };
export const BEAKER_PATH = `M${BEAKER.left},${BEAKER.rim} L${BEAKER.left},165 Q${BEAKER.left},${BEAKER.bottom} 50,${BEAKER.bottom} L110,${BEAKER.bottom} Q${BEAKER.right},${BEAKER.bottom} ${BEAKER.right},165 L${BEAKER.right},${BEAKER.rim}`;

export function Beaker() {
  return (
    <>
      <path d={`${BEAKER_PATH} Z`} fill={GLASS_FILL} />
      <path d={BEAKER_PATH} fill="none" stroke={GLASS} strokeWidth={2.5} />
      <path d={`M${BEAKER.left - 4},${BEAKER.rim} L${BEAKER.left},${BEAKER.rim}`} stroke={GLASS} strokeWidth={2.5} />
    </>
  );
}

// Upright test tube with a round bottom.
export type TubeGeom = { cx: number; top: number; bottom: number; halfWidth: number };

export function tubePath({ cx, top, bottom, halfWidth: w }: TubeGeom): string {
  return `M${cx - w},${top} L${cx - w},${bottom - w} A${w},${w} 0 0 0 ${cx + w},${bottom - w} L${cx + w},${top}`;
}

export function TestTube({ geom }: { geom: TubeGeom }) {
  const d = tubePath(geom);
  return (
    <>
      <path d={`${d} Z`} fill={GLASS_FILL} />
      <path d={d} fill="none" stroke={GLASS} strokeWidth={2} />
      <path
        d={`M${geom.cx - geom.halfWidth - 3},${geom.top} L${geom.cx + geom.halfWidth + 3},${geom.top}`}
        stroke={GLASS}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  );
}

// Spirit lamp with a small steady blue flame — the heat source NCERT draws
// under a boiling tube. `flameTop` is where the flame tip reaches.
export function Burner({ cx, flameTop, base = 212 }: { cx: number; flameTop: number; base?: number }) {
  const bodyTop = base - 22;
  const wickTop = bodyTop - 6;
  const flameH = wickTop - flameTop;
  return (
    <g>
      <path
        d={`M${cx - 18},${base} L${cx - 14},${bodyTop + 4} Q${cx},${bodyTop - 2} ${cx + 14},${bodyTop + 4} L${cx + 18},${base} Z`}
        fill="#2a2738"
        stroke={GLASS}
        strokeWidth={1.5}
      />
      <rect x={cx - 3} y={wickTop} width={6} height={bodyTop - wickTop + 2} rx={1} fill="#6b6478" />
      <g className="anim-flicker" style={{ transformOrigin: `${cx}px ${wickTop}px` }}>
        <path
          d={`M${cx},${flameTop} C${cx + 9},${flameTop + flameH * 0.45} ${cx + 8},${wickTop} ${cx},${wickTop} C${cx - 8},${wickTop} ${cx - 9},${flameTop + flameH * 0.45} ${cx},${flameTop} Z`}
          fill="#5b8fe0"
          opacity={0.85}
        />
        <path
          d={`M${cx},${flameTop + flameH * 0.45} C${cx + 4},${flameTop + flameH * 0.7} ${cx + 4},${wickTop} ${cx},${wickTop} C${cx - 4},${wickTop} ${cx - 4},${flameTop + flameH * 0.7} ${cx},${flameTop + flameH * 0.45} Z`}
          fill="#cfe3ff"
          opacity={0.85}
        />
      </g>
    </g>
  );
}

// ------------------------------------------------------------ indicators

// Thermometer standing in the vessel. The column moves from its starting
// level toward a higher (hot) or lower (cold) one over the reaction.
export function Thermometer({
  x,
  top,
  bulbY,
  temperature,
  progress,
}: {
  x: number;
  top: number;
  bulbY: number;
  temperature: "hot" | "cold";
  progress: number;
}) {
  const span = bulbY - top - 8;
  const start = 0.45;
  const end = temperature === "hot" ? 0.88 : 0.12;
  const level = start + (end - start) * easeInOut(seg(progress, 0.1, 0.85));
  const columnTop = bulbY - 4 - span * level;
  const colour = temperature === "hot" ? "#ef4444" : "#60a5fa";
  return (
    <g>
      <rect x={x - 3} y={top} width={6} height={bulbY - top} rx={3} fill="#1e1b2a" stroke="#6b6478" strokeWidth={1} />
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={x + 3} x2={x + 6} y1={bulbY - 4 - span * t} y2={bulbY - 4 - span * t} stroke="#6b6478" strokeWidth={0.8} />
      ))}
      <rect x={x - 1.3} y={columnTop} width={2.6} height={bulbY - columnTop} fill={colour} />
      <circle cx={x} cy={bulbY + 2} r={5} fill={colour} stroke="#6b6478" strokeWidth={1} />
    </g>
  );
}

// --------------------------------------------------------------- gases

// Rising bubbles between two heights. `speed` is how many full rises each
// bubble makes over the animation.
export function Bubbles({
  count,
  xMin,
  xMax,
  fromY,
  toY,
  progress,
  speed,
  colour = "#f4f4f6",
  startAt = 0,
  radius = 2.8,
  seed = 0,
}: {
  count: number;
  xMin: number;
  xMax: number;
  fromY: number;
  toY: number;
  progress: number;
  speed: number;
  colour?: string;
  startAt?: number;
  radius?: number;
  seed?: number;
}) {
  if (progress < startAt) return null;
  const local = progress - startAt;
  const fadeIn = Math.min(1, local / 0.06);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const phase = fakeRandom(i * 7.3 + seed);
        const pos = (local * speed + phase) % 1;
        const x = xMin + fakeRandom(i * 9.1 + seed) * (xMax - xMin) + Math.sin((pos + i) * 9) * 1.5;
        const y = fromY - pos * (fromY - toY);
        const edge = pos < 0.1 ? pos / 0.1 : pos > 0.85 ? (1 - pos) / 0.15 : 1;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={radius * (0.7 + fakeRandom(i + seed) * 0.6)}
            fill="none"
            stroke={colour}
            strokeWidth={1.1}
            opacity={fadeIn * edge * 0.75}
          />
        );
      })}
    </>
  );
}

// A coloured gas that visibly fills a region from the bottom up (brown NO₂,
// yellow-green Cl₂) — soft blobs under a blur filter, not discrete dots.
export function GasCloud({
  id,
  colour,
  fill,
  x,
  y,
  w,
  h,
  progress,
  clipPathId,
  maxOpacity = 0.75,
}: {
  id: string;
  colour: string;
  fill: number;
  x: number;
  y: number;
  w: number;
  h: number;
  progress: number;
  clipPathId?: string;
  maxOpacity?: number;
}) {
  if (fill <= 0) return null;
  const filled = h * fill;
  const blobs = 9;
  return (
    <g clipPath={clipPathId ? `url(#${clipPathId})` : undefined}>
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      <g filter={`url(#${id})`} opacity={maxOpacity}>
        <rect x={x} y={y + h - filled} width={w} height={filled} fill={colour} opacity={0.55} />
        {Array.from({ length: blobs }).map((_, i) => {
          const bx = x + fakeRandom(i * 3.7) * w;
          const drift = Math.sin(progress * 6 + i) * 4;
          const by = y + h - filled * fakeRandom(i * 5.9) + drift;
          return <ellipse key={i} cx={bx} cy={by} rx={8 + fakeRandom(i) * 8} ry={6 + fakeRandom(i * 2) * 5} fill={colour} opacity={0.7} />;
        })}
      </g>
    </g>
  );
}

// Classic two-lobe flame shape. `className` lets the caller add flicker.
export function flamePath(cx: number, baseY: number, height: number, halfWidth: number): string {
  const tip = baseY - height;
  return `M${cx},${tip} C${cx + halfWidth * 0.6},${tip + height * 0.35} ${cx + halfWidth * 1.1},${baseY - height * 0.25} ${cx},${baseY} C${cx - halfWidth * 1.1},${baseY - height * 0.25} ${cx - halfWidth * 0.6},${tip + height * 0.35} ${cx},${tip} Z`;
}

export function Flame({
  cx,
  baseY,
  height,
  halfWidth,
  colour,
  ragged,
}: {
  cx: number;
  baseY: number;
  height: number;
  halfWidth: number;
  colour: string;
  ragged?: boolean;
}) {
  if (height <= 0) return null;
  const inner = lerpColor(colour.startsWith("#") ? colour : "#ffffff", "#ffffff", 0.55);
  return (
    <g className={ragged ? "anim-flicker-fast" : "anim-flicker"} style={{ transformOrigin: `${cx}px ${baseY}px` }}>
      <path d={flamePath(cx, baseY, height, halfWidth)} fill={colour} opacity={0.9} />
      {ragged && (
        <>
          <path d={flamePath(cx - 6, baseY - height * 0.25, height * 0.55, halfWidth * 0.45)} fill={colour} opacity={0.8} />
          <path d={flamePath(cx + 7, baseY - height * 0.2, height * 0.5, halfWidth * 0.4)} fill={colour} opacity={0.8} />
        </>
      )}
      <path d={flamePath(cx, baseY, height * 0.5, halfWidth * 0.5)} fill={inner} opacity={0.85} />
    </g>
  );
}

// Liquid filling the beaker up to `top`, clipped to the beaker's shape.
// Colourless/pale solutions are drawn mostly see-through so the metal,
// bubbles and precipitate inside stay visible; coloured ones more solidly.
function liquidOpacity(colour: string): number {
  const m = colour.match(/\d+/g);
  const [r, g, b] = colour.startsWith("#") ? hexToRgb(colour) : (m ?? []).map(Number);
  const minChannel = Math.min(r, g, b);
  return minChannel > 215 ? 0.2 : minChannel > 170 ? 0.45 : 0.82;
}

export function BeakerLiquid({ uid, colour, top = BEAKER.liquidTop, opacity }: { uid: string; colour: string; top?: number; opacity?: number }) {
  const id = `${uid}-beaker-clip`;
  return (
    <>
      <line x1={BEAKER.left + 1} x2={BEAKER.right - 1} y1={top} y2={top} stroke={colour} strokeWidth={1.2} opacity={0.7} />
      <clipPath id={id}>
        <path d={`${BEAKER_PATH} Z`} />
      </clipPath>
      <rect
        x={BEAKER.left}
        y={top}
        width={BEAKER.right - BEAKER.left}
        height={BEAKER.bottom - top}
        fill={colour}
        opacity={opacity ?? liquidOpacity(colour)}
        clipPath={`url(#${id})`}
      />
    </>
  );
}

// A milky suspension spreading through a liquid: many faint specks whose
// count and opacity grow with `amount` (0–1). Used where the prose says the
// liquid "turns cloudy/milky".
export function Cloudiness({
  colour,
  amount,
  x,
  y,
  w,
  h,
  seed = 0,
}: {
  colour: string;
  amount: number;
  x: number;
  y: number;
  w: number;
  h: number;
  seed?: number;
}) {
  if (amount <= 0) return null;
  return (
    <g opacity={amount}>
      <rect x={x} y={y} width={w} height={h} fill={colour} opacity={0.35} />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={x + fakeRandom(i * 1.3 + seed) * w}
          cy={y + fakeRandom(i * 2.9 + seed) * h}
          r={0.8 + fakeRandom(i * 4.1 + seed) * 1.1}
          fill={colour}
          opacity={0.7}
        />
      ))}
    </g>
  );
}

// Curling white wisps rising from a point (visible steam).
export function SteamWisps({ x, y, progress, amount = 1, spread = 10 }: { x: number; y: number; progress: number; amount?: number; spread?: number }) {
  if (amount <= 0) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const pos = (progress * 1.4 + i / 3) % 1;
        const wx = x + (i - 1) * spread;
        const wy = y - pos * 26;
        return (
          <path
            key={i}
            d={`M${wx},${wy} q4,-6 0,-12 q-4,-6 0,-12`}
            stroke="#f4f4f6"
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
            opacity={Math.sin(pos * Math.PI) * 0.55 * amount}
          />
        );
      })}
    </>
  );
}

// Gas collected over water (NCERT Fig. 1.6 / 3.3): a trough with an inverted
// tube; bubbles rise into it and the gas level pushes the water down.
// `fill` is 0–1 of the tube volume.
export function GasCollector({
  cx,
  fill,
  progress,
  bubbling,
  gasColour = null,
  tubeTop = 112,
  tubeBottom = 192,
  seed = 0,
}: {
  cx: number;
  fill: number;
  progress: number;
  bubbling: boolean;
  gasColour?: string | null;
  tubeTop?: number;
  tubeBottom?: number;
  seed?: number;
}) {
  const w = 9;
  const troughTop = 168;
  const gasBottom = tubeTop + 4 + fill * (tubeBottom - tubeTop - 10);
  return (
    <g>
      <rect x={cx - 24} y={troughTop} width={48} height={214 - troughTop} fill="#9fc5e8" opacity={0.25} />
      <path d={`M${cx - 24},${troughTop - 6} L${cx - 24},214 L${cx + 24},214 L${cx + 24},${troughTop - 6}`} fill="none" stroke={GLASS} strokeWidth={2} />
      {/* water inside the tube, below the collected gas */}
      <rect x={cx - w} y={gasBottom} width={w * 2} height={tubeBottom - gasBottom} fill="#9fc5e8" opacity={0.25} />
      {gasColour && fill > 0 && (
        <rect x={cx - w} y={tubeTop + 4} width={w * 2} height={gasBottom - tubeTop - 4} fill={gasColour} opacity={0.6} />
      )}
      <path
        d={`M${cx - w},${tubeBottom} L${cx - w},${tubeTop + w} A${w},${w} 0 0 1 ${cx + w},${tubeTop + w} L${cx + w},${tubeBottom}`}
        fill="none"
        stroke={GLASS}
        strokeWidth={2}
      />
      {bubbling && (
        <Bubbles
          count={4}
          xMin={cx - 5}
          xMax={cx + 5}
          fromY={tubeBottom + 10}
          toY={gasBottom + 2}
          progress={progress}
          speed={3}
          radius={2}
          seed={seed}
        />
      )}
    </g>
  );
}
