// Thermal decomposition and other "heat it and watch" reactions: a boiling
// tube (or china dish) held over a spirit lamp. The solid changes colour
// from the hot bottom upward — only where the prose/NCERT says it does.
// A coloured gas (brown NO₂) fills the tube and spills from the mouth;
// steam curls out; CO₂ can be piped into lime water.

import {
  Burner,
  Bubbles,
  Cloudiness,
  GasCloud,
  SteamWisps,
  TestTube,
  TubeLiquid,
  fakeRandom,
  lerpColor,
  seg,
  tubePath,
  type SceneProps,
} from "./shared";

// Heap of granules; lower ones (nearest the flame) change colour first.
function HeatedSolid({
  cx,
  baseY,
  from,
  to,
  change,
  shrink,
  halfWidth,
}: {
  cx: number;
  baseY: number;
  from: string;
  to: string;
  change: number;
  shrink: number;
  halfWidth: number;
}) {
  const count = 16;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const row = Math.floor(i / 5);
        const x = cx - halfWidth + 4 + fakeRandom(i * 2.3) * (halfWidth * 2 - 8);
        const r = (3 + fakeRandom(i * 1.1) * 1.4) * (1 - shrink);
        const y = baseY - r - row * 5 * (1 - shrink);
        // Bottom row starts changing first; top row lags.
        const t = seg(change, row * 0.12, 0.64 + row * 0.12);
        return <circle key={i} cx={x} cy={y} r={r} fill={lerpColor(from, to, t)} />;
      })}
    </>
  );
}

export default function ThermalScene({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const effects = anim.effects ?? [];
  const limewater = effects.includes("limewater_test");
  const dish = anim.apparatus === "dish";
  const change = seg(progress, 0.15, 0.95);
  const target = solid.to ?? solid.from;
  const shrink = solid.to == null ? seg(progress, 0.15, 1) * 0.8 : anim.gas.amount !== "none" ? seg(progress, 0.2, 1) * 0.15 : 0;
  const gasColour = anim.gas.colour;
  const evolving = seg(progress, 0.15, 0.3);

  if (dish) {
    // China dish on a tripod over the lamp (copper powder heated in air).
    return (
      <>
        <Burner cx={80} flameTop={150} />
        <path d="M44,150 L116,150 M52,150 L46,190 M108,150 L114,190" stroke="#6b6478" strokeWidth={2} />
        <path d="M46,128 Q80,160 114,128 Z" fill="#e9e6ee" stroke="#9b97a6" strokeWidth={1.5} />
        <HeatedSolid cx={80} baseY={140} from={solid.from} to={target} change={change} shrink={shrink} halfWidth={24} />
      </>
    );
  }

  const tube = limewater
    ? { cx: 52, top: 60, bottom: 160, halfWidth: 14 }
    : { cx: 80, top: 40, bottom: 160, halfWidth: 16 };
  const clipId = `${uid}-tube-clip`;
  const lime = { cx: 124, top: 92, bottom: 192, halfWidth: 12 };
  const limeTop = 130;
  const milky = seg(progress, 0.3, 0.9);

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={`${tubePath(tube)} Z`} />
        </clipPath>
      </defs>
      <Burner cx={tube.cx} flameTop={tube.bottom + 6} />
      {/* holder clamped near the mouth */}
      <path d={`M${tube.cx - tube.halfWidth - 2},${tube.top + 14} L${tube.cx - tube.halfWidth - 30},${tube.top + 4}`} stroke="#6b6478" strokeWidth={3} strokeLinecap="round" />

      {gasColour && (
        <GasCloud
          id={`${uid}-gas`}
          colour={gasColour}
          fill={seg(progress, 0.2, 0.7)}
          x={tube.cx - tube.halfWidth}
          y={tube.top}
          w={tube.halfWidth * 2}
          h={tube.bottom - tube.top - 10}
          progress={progress}
          clipPathId={clipId}
          maxOpacity={0.9}
        />
      )}
      <TestTube geom={tube} />
      <HeatedSolid
        cx={tube.cx}
        baseY={tube.bottom - 2}
        from={solid.from}
        to={target}
        change={change}
        shrink={shrink}
        halfWidth={tube.halfWidth}
      />

      {/* coloured fumes spilling out of the mouth */}
      {gasColour &&
        Array.from({ length: 5 }).map((_, i) => {
          const pos = (progress * 1.2 + i / 5) % 1;
          const vis = seg(progress, 0.55, 0.7);
          return (
            <circle
              key={i}
              cx={tube.cx + Math.sin(pos * 4 + i) * 6 + pos * 10}
              cy={tube.top - 4 - pos * 30}
              r={5 + pos * 8}
              fill={gasColour}
              opacity={vis * (1 - pos) * 0.75}
            />
          );
        })}

      {effects.includes("steam") && !limewater && (
        <SteamWisps x={tube.cx} y={tube.top - 6} progress={progress} amount={evolving} spread={8} />
      )}

      {effects.includes("condensation") &&
        Array.from({ length: 8 }).map((_, i) => {
          const appear = 0.3 + fakeRandom(i * 3.3) * 0.5;
          if (progress < appear) return null;
          const side = i % 2 === 0 ? -1 : 1;
          return (
            <circle
              key={i}
              cx={tube.cx + side * (tube.halfWidth - 2.5)}
              cy={tube.top + 8 + fakeRandom(i * 5.7) * 30}
              r={1.4 + fakeRandom(i) * 0.6}
              fill="#bfe3ff"
              opacity={0.85}
            />
          );
        })}

      {limewater && (
        <>
          <rect x={tube.cx - 12} y={tube.top - 7} width={24} height={9} rx={2} fill="#6b6478" />
          <path d={`M${tube.cx},${tube.top - 7} L${tube.cx},30 L${lime.cx},30 L${lime.cx},${lime.bottom - 14}`} fill="none" stroke="#6b6478" strokeWidth={2} />
          <TubeLiquid uid={uid} name="lime" geom={lime} top={limeTop} colour={lerpColor("#e8f1f4", "#f2efe8", milky)} />
          <Cloudiness colour="#f1f1ee" amount={milky * 0.85} x={lime.cx - 11} y={limeTop + 2} w={22} h={lime.bottom - limeTop - 8} seed={3} />
          <Bubbles
            count={3}
            xMin={lime.cx - 3}
            xMax={lime.cx + 3}
            fromY={lime.bottom - 14}
            toY={limeTop + 2}
            progress={progress}
            speed={1.6}
            radius={2}
            startAt={0.2}
          />
          <TestTube geom={lime} />
        </>
      )}
    </>
  );
}
