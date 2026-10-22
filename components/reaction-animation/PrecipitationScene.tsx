// Precipitation: a cloud of solid forms where the reactants meet, spreads
// through the liquid, and — only where the prose says it settles — sinks
// into a layer at the bottom. Reactants arrive either poured in from a
// second tube or, when a gas is the reactant, bubbled in through a tube.

import {
  BEAKER,
  Beaker,
  BeakerLiquid,
  Bubbles,
  Cloudiness,
  GAS_BUBBLES,
  easeInOut,
  fakeRandom,
  lerpColor,
  seg,
  type SceneProps,
} from "./shared";

const SURFACE = BEAKER.liquidTop;

export default function PrecipitationScene({ anim, progress, uid }: SceneProps) {
  const ppt = anim.precipitate!;
  const bubbledIn = anim.gas.amount !== "none";
  const settles = (anim.effects ?? []).includes("settles");
  const solution = anim.solution!;
  // Mixed solutions react at once; a bubbled-in gas builds the cloud up
  // gradually, and "slow" reactions (crystals appearing) more gradually still.
  const formStart = bubbledIn ? 0.15 : 0.1;
  const formEnd = anim.intensity === "slow" ? 0.8 : bubbledIn ? 0.6 : 0.35;
  const form = easeInOut(seg(progress, formStart, formEnd));
  const settle = settles ? easeInOut(seg(progress, Math.max(formEnd, 0.45), 1)) : 0;
  const liquid = lerpColor(solution.from, solution.to, seg(progress, formStart, formEnd + 0.1));

  // The cloud blooms out from where the reactant enters, then (if it
  // settles) sinks and flattens.
  const originX = bubbledIn ? 92 : 62;
  const originY = bubbledIn ? BEAKER.bottom - 22 : SURFACE + 14;
  const cloudCx = originX + (80 - originX) * form;
  const cloudCy = originY + ((SURFACE + BEAKER.bottom) / 2 - originY) * form + settle * 40;
  const cloudRx = 10 + form * 38 + settle * 8;
  const cloudRy = 8 + form * 36 - settle * 26;
  const sediment = settle;

  const pouring = !bubbledIn && progress < 0.16;
  const tilt = bubbledIn ? 0 : Math.min(1, progress / 0.06) * (progress < 0.16 ? 1 : Math.max(0, 1 - (progress - 0.16) / 0.06));

  return (
    <>
      <defs>
        <filter id={`${uid}-ppt`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
        <clipPath id={`${uid}-ppt-clip`}>
          <rect x={BEAKER.left} y={SURFACE} width={BEAKER.right - BEAKER.left} height={BEAKER.bottom - SURFACE} />
        </clipPath>
      </defs>

      <Beaker />
      <BeakerLiquid uid={uid} colour={liquid} />

      <g clipPath={`url(#${uid}-ppt-clip)`}>
        {form > 0 && (
          <ellipse
            cx={cloudCx}
            cy={cloudCy}
            rx={cloudRx}
            ry={Math.max(cloudRy, 6)}
            fill={ppt}
            opacity={0.75 * form * (1 - settle * 0.85)}
            filter={`url(#${uid}-ppt)`}
          />
        )}
        {/* curdy flecks inside the cloud */}
        <Cloudiness
          colour={ppt}
          amount={form * (1 - settle * 0.9) * 0.9}
          x={cloudCx - cloudRx}
          y={cloudCy - Math.max(cloudRy, 6)}
          w={cloudRx * 2}
          h={Math.max(cloudRy, 6) * 2}
          seed={7}
        />
        {/* settled layer */}
        {sediment > 0 && (
          <>
            <path
              d={`M${BEAKER.left},${BEAKER.bottom - 12 * sediment} Q80,${BEAKER.bottom - 15 * sediment} ${BEAKER.right},${BEAKER.bottom - 12 * sediment} L${BEAKER.right},${BEAKER.bottom} L${BEAKER.left},${BEAKER.bottom} Z`}
              fill={ppt}
              opacity={0.9}
              clipPath={`url(#${uid}-beaker-clip)`}
            />
            {Array.from({ length: 10 }).map((_, i) => {
              const y0 = SURFACE + 20 + fakeRandom(i * 2.2) * 50;
              const local = seg(settle, fakeRandom(i * 4.4) * 0.5, 1);
              return (
                <circle
                  key={i}
                  cx={BEAKER.left + 10 + fakeRandom(i * 1.7) * 80}
                  cy={y0 + (BEAKER.bottom - 10 - y0) * local}
                  r={1.2 + fakeRandom(i) * 0.8}
                  fill={ppt}
                  opacity={1 - local * 0.6}
                />
              );
            })}
          </>
        )}
      </g>

      {bubbledIn ? (
        <>
          <path d={`M150,10 L150,22 L${originX + 4},22 L${originX + 4},${BEAKER.bottom - 14}`} fill="none" stroke="#6b6478" strokeWidth={2.5} />
          <Bubbles
            count={GAS_BUBBLES[anim.gas.amount]}
            xMin={originX}
            xMax={originX + 8}
            fromY={BEAKER.bottom - 16}
            toY={SURFACE + 2}
            progress={progress}
            speed={1.8}
            startAt={0.05}
          />
        </>
      ) : (
        // Second solution poured in from a test tube at the top-left.
        <g opacity={tilt}>
          {/* tube pivots about its mouth at (50, 30), body pointing up-left */}
          <g transform={`translate(50 30) rotate(${-75 + tilt * 25})`}>
            <rect x={-6} y={-46} width={12} height={46} rx={6} fill="rgba(244,244,246,0.06)" stroke="#3a3650" strokeWidth={1.5} />
          </g>
          {pouring && <path d={`M51,32 Q56,50 ${originX},${SURFACE}`} stroke="#e8f1f4" strokeWidth={2} fill="none" opacity={0.5} />}
        </g>
      )}
    </>
  );
}
