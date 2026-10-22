// Reactions whose whole story is in a beaker of solution:
// - displacement: the solution changes colour while a coating of the
//   displaced metal builds up on the strip/granules;
// - dissolution: a solid quietly shrinks away, tinting the solution if the
//   prose says so;
// - colour_change: the liquid itself changes — added drop by drop, with a
//   gas bubbled in, clearing a milky suspension, or separating as a layer.

import {
  BEAKER,
  Beaker,
  BeakerLiquid,
  Bubbles,
  Cloudiness,
  GAS_BUBBLES,
  SolidPiece,
  fakeRandom,
  lerpColor,
  seg,
  type SceneProps,
} from "./shared";

const SURFACE = BEAKER.liquidTop;

// Rough coating of deposited metal over a strip or granule heap.
function Coating({ shape, colour, amount }: { shape: string; colour: string; amount: number }) {
  if (amount <= 0) return null;
  const spots = 24;
  return (
    <g opacity={amount}>
      {Array.from({ length: spots }).map((_, i) => {
        const appear = fakeRandom(i * 3.9) * 0.6;
        if (amount < appear) return null;
        const x = shape === "strip" ? 76 + fakeRandom(i * 1.3) * 8 : 64 + fakeRandom(i * 1.3) * 32;
        const y = shape === "strip" ? BEAKER.bottom - 3 - fakeRandom(i * 2.7) * 60 : BEAKER.bottom - 4 - fakeRandom(i * 2.7) * 12;
        return <circle key={i} cx={x} cy={y} r={1.4 + fakeRandom(i) * 1.6} fill={colour} />;
      })}
    </g>
  );
}

export default function SolutionScene({ anim, progress, uid }: SceneProps) {
  const effects = anim.effects ?? [];
  const solution = anim.solution!;
  const solid = anim.solid;
  const change = seg(progress, 0.1, 0.95);
  const liquid = lerpColor(solution.from, solution.to, change);
  const layer = effects.includes("layer");
  const drops = effects.includes("drops");
  const bubbled = anim.gas.amount !== "none";

  return (
    <>
      <Beaker />
      <BeakerLiquid uid={uid} colour={layer ? solution.from : liquid} />

      {/* new denser layer forming at the bottom (nitrobenzene) */}
      {layer && (
        <path
          d={`M${BEAKER.left},${BEAKER.bottom - 34 * change} Q80,${BEAKER.bottom - 37 * change} ${BEAKER.right},${BEAKER.bottom - 34 * change} L${BEAKER.right},${BEAKER.bottom} L${BEAKER.left},${BEAKER.bottom} Z`}
          fill={solution.to}
          opacity={0.85}
          clipPath={`url(#${uid}-beaker-clip)`}
        />
      )}

      {/* milky suspension that clears (or appears) with the change */}
      {anim.precipitate && (
        <Cloudiness
          colour={anim.precipitate}
          amount={effects.includes("clears") ? 0.9 * (1 - change) : 0.9 * change}
          x={BEAKER.left + 2}
          y={SURFACE + 2}
          w={96}
          h={BEAKER.bottom - SURFACE - 6}
        />
      )}

      {solid && anim.type === "dissolution" && (
        <SolidPiece shape={solid.shape} cx={80} baseY={BEAKER.bottom - 3} colour={solid.from} scale={1 - seg(progress, 0.08, 0.9)} />
      )}

      {solid && anim.type === "displacement" && (
        <>
          <SolidPiece shape={solid.shape} cx={80} baseY={BEAKER.bottom - 3} colour={solid.from} scale={1} height={62} />
          <Coating shape={solid.shape} colour={solid.to ?? solid.from} amount={change} />
        </>
      )}

      {bubbled && (
        <>
          <path d={`M150,10 L150,22 L96,22 L96,${BEAKER.bottom - 14}`} fill="none" stroke="#6b6478" strokeWidth={2.5} />
          <Bubbles
            count={GAS_BUBBLES[anim.gas.amount]}
            xMin={92}
            xMax={100}
            fromY={BEAKER.bottom - 16}
            toY={SURFACE + 2}
            progress={progress}
            speed={1.8}
            startAt={0.05}
          />
        </>
      )}

      {/* dropper adding the second liquid drop by drop */}
      {drops && (
        <>
          <rect x={74} y={6} width={12} height={22} rx={5} fill="#6b6478" />
          <path d="M76,28 L84,28 L81,46 L79,46 Z" fill="rgba(244,244,246,0.12)" stroke="#3a3650" strokeWidth={1.2} />
          {Array.from({ length: 3 }).map((_, i) => {
            const pos = (progress * 3 + i / 3) % 1;
            if (progress > 0.9) return null;
            return <circle key={i} cx={80} cy={48 + pos * (SURFACE - 48)} r={1.8} fill="#e8f1f4" opacity={0.8} />;
          })}
        </>
      )}
    </>
  );
}
