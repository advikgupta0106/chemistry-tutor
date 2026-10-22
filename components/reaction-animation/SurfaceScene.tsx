// Slow changes to a solid in air: tarnish, rust, a green coat, a dull
// oxide film — drawn as patches spreading over the surface rather than a
// flat colour fade. Also covers a powder setting into a hard mass
// (Plaster of Paris) and a gas absorbed into a dry powder.

import { GasCloud, fakeRandom, lerpColor, seg, type SceneProps } from "./shared";

function Patches({ x, y, w, h, colour, amount, seed }: { x: number; y: number; w: number; h: number; colour: string; amount: number; seed: number }) {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => {
        const appear = fakeRandom(i * 2.9 + seed) * 0.7;
        const local = seg(amount, appear, appear + 0.3);
        if (local <= 0) return null;
        return (
          <ellipse
            key={i}
            cx={x + fakeRandom(i * 1.7 + seed) * w}
            cy={y + fakeRandom(i * 4.3 + seed) * h}
            rx={(2 + fakeRandom(i + seed) * 4) * (0.5 + local * 0.8)}
            ry={(1.5 + fakeRandom(i * 3 + seed) * 2.5) * (0.5 + local * 0.8)}
            fill={colour}
            opacity={local}
          />
        );
      })}
    </>
  );
}

export default function SurfaceScene({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const target = solid.to ?? solid.from;
  const change = seg(progress, 0.1, 0.95);

  // Powder in a dish (plaster setting, lime absorbing chlorine).
  if (solid.shape === "granules") {
    const set = anim.solution != null ? change : 0;
    const gas = anim.gas.colour;
    return (
      <>
        {gas && (
          <GasCloud
            id={`${uid}-gas`}
            colour={gas}
            fill={1 - change}
            x={40}
            y={60}
            w={80}
            h={80}
            progress={progress}
            maxOpacity={0.55}
          />
        )}
        <path d="M36,150 Q80,190 124,150 Z" fill="#b8b4c4" stroke="#9b97a6" strokeWidth={1.5} />
        {/* loose grains merging into one smooth, hard surface as it sets */}
        <ellipse cx={80} cy={153} rx={36} ry={7} fill={lerpColor(solid.from, target, change)} />
        {Array.from({ length: 26 }).map((_, i) => (
          <circle
            key={i}
            cx={50 + fakeRandom(i * 2.1) * 60}
            cy={150 + fakeRandom(i * 3.1) * 6}
            r={2.2}
            fill={solid.from}
            stroke="#c9c5d3"
            strokeWidth={0.4}
            opacity={1 - set}
          />
        ))}
        {set > 0.6 && <ellipse cx={72} cy={151} rx={14} ry={2} fill="#ffffff" opacity={(set - 0.6) * 0.8} />}
      </>
    );
  }

  // A nail/strip/plate exposed to air.
  const strip = { x: 60, y: 60, w: 40, h: 110 };
  return (
    <>
      <rect x={strip.x} y={strip.y} width={strip.w} height={strip.h} rx={4} fill={solid.from} />
      <rect x={strip.x + 4} y={strip.y + 6} width={6} height={strip.h - 12} rx={3} fill="#ffffff" opacity={0.25 * (1 - change)} />
      <Patches x={strip.x + 3} y={strip.y + 3} w={strip.w - 6} h={strip.h - 6} colour={target} amount={change} seed={1} />
      <rect x={strip.x} y={strip.y} width={strip.w} height={strip.h} rx={4} fill={target} opacity={seg(change, 0.6, 1) * 0.8} />
      <rect x={30} y={174} width={100} height={6} rx={2} fill="#2a2738" />
    </>
  );
}
