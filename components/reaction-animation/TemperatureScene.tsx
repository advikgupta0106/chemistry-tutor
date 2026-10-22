// Reactions taught for their heat change. Endothermic: a thermometer in
// the mixture falls. Exothermic: the thermometer rises, plus whatever the
// prose says you can see — steam off slaking quicklime, or the blinding
// glow and molten metal of a thermite mixture.

import {
  BEAKER,
  Beaker,
  BeakerLiquid,
  Bubbles,
  Cloudiness,
  SteamWisps,
  TestTube,
  Thermometer,
  fakeRandom,
  lerpColor,
  seg,
  type SceneProps,
} from "./shared";

// Thermite-style mixture in a sand tray: spark, flare, then a glowing pool
// of molten metal under a crust of white oxide.
function Thermite({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const effects = anim.effects ?? [];
  const ignite = seg(progress, 0.08, 0.16);
  const flare = progress < 0.16 ? ignite : Math.max(0, 1 - seg(progress, 0.5, 0.85));
  const pool = seg(progress, 0.3, 0.7);
  const cool = seg(progress, 0.75, 1);
  const mix = 1 - seg(progress, 0.2, 0.55);
  return (
    <>
      <defs>
        <filter id={`${uid}-flare`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      {/* sand tray */}
      <path d="M30,160 L40,196 L120,196 L130,160 Z" fill="#2a2738" stroke="#6b6478" strokeWidth={1.5} />
      <rect x={34} y={186} width={92} height={10} fill="#8a7a5c" opacity={0.6} />
      {/* unreacted powder mixture */}
      {mix > 0 &&
        Array.from({ length: 22 }).map((_, i) => (
          <circle
            key={i}
            cx={56 + fakeRandom(i * 2.1) * 48}
            cy={182 - fakeRandom(i * 3.3) * 14 * mix}
            r={2.6 * mix + 0.5}
            fill={i % 2 === 0 ? solid.from : "#c9ced2"}
          />
        ))}
      {/* molten metal pool, cooling slightly at the end */}
      {pool > 0 && (
        <ellipse cx={80} cy={183} rx={8 + pool * 24} ry={2 + pool * 4} fill={lerpColor("#fff3c4", "#ff9a3c", cool * 0.8)} />
      )}
      {/* white oxide crust */}
      {pool > 0.5 && <ellipse cx={80} cy={178} rx={pool * 18} ry={2.5} fill={solid.to ?? "#e8e4de"} opacity={seg(pool, 0.5, 1)} />}
      {effects.includes("glow") && (
        <circle cx={80} cy={170} r={34} fill="#fff6d8" opacity={0.85 * flare} filter={`url(#${uid}-flare)`} />
      )}
      {effects.includes("sparks") &&
        flare > 0.1 &&
        Array.from({ length: 14 }).map((_, i) => {
          const pos = (progress * 3 + fakeRandom(i * 4.7)) % 1;
          const a = -Math.PI * (0.1 + fakeRandom(i * 1.3) * 0.8);
          const d = 6 + pos * 60;
          return (
            <circle
              key={i}
              cx={80 + Math.cos(a) * d}
              cy={172 + Math.sin(a) * d + pos * pos * 30}
              r={1.4}
              fill="#ffe9a8"
              opacity={flare * (1 - pos)}
            />
          );
        })}
    </>
  );
}

// Two white powders mixed in a test tube turn into a damp paste.
function PowderMix({ anim, progress }: SceneProps) {
  const solid = anim.solid!;
  const tube = { cx: 70, top: 40, bottom: 175, halfWidth: 18 };
  const mix = seg(progress, 0.05, 0.6);
  const colour = lerpColor(solid.from, solid.to ?? solid.from, mix);
  return (
    <>
      <TestTube geom={tube} />
      {Array.from({ length: 20 }).map((_, i) => {
        const r = 3.2 * (1 - mix * 0.5) + 0.8;
        const settled = 150 + (i % 4) * 5;
        return (
          <circle
            key={i}
            cx={tube.cx - 13 + fakeRandom(i * 2.9) * 26}
            cy={settled - fakeRandom(i * 1.7) * 18 * (1 - mix)}
            r={r}
            fill={colour}
          />
        );
      })}
      {/* paste filling in the gaps as it gets damp */}
      <path
        d={`M${tube.cx - 17},${172 - 26 * mix} Q${tube.cx},${168 - 30 * mix} ${tube.cx + 17},${172 - 26 * mix} L${tube.cx + 17},${tube.bottom - 18} A18,18 0 0 1 ${tube.cx - 17},${tube.bottom - 18} Z`}
        fill={colour}
        opacity={mix * 0.9}
      />
      {/* glass rod stirring */}
      <line
        x1={tube.cx + Math.sin(progress * 18) * 6 * (1 - seg(progress, 0.6, 0.7))}
        y1={150}
        x2={tube.cx + 30}
        y2={10}
        stroke="#9b97a6"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={1 - seg(progress, 0.6, 0.75)}
      />
      <Thermometer x={118} top={50} bulbY={165} temperature="cold" progress={progress} />
    </>
  );
}

// Water poured onto quicklime: the lumps slake into a white paste, the
// mixture hisses and steams, and the thermometer climbs.
function Slaking({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const solution = anim.solution!;
  const effects = anim.effects ?? [];
  const pour = seg(progress, 0, 0.15);
  const level = 140 - pour * 40;
  const react = seg(progress, 0.15, 0.85);
  const liquid = lerpColor(solution.from, solution.to, react);
  return (
    <>
      {effects.includes("steam") && <SteamWisps x={70} y={level - 4} progress={progress} amount={seg(progress, 0.2, 0.35)} spread={14} />}
      <Beaker />
      {pour > 0 && <BeakerLiquid uid={uid} colour={liquid} top={level} />}
      {Array.from({ length: 7 }).map((_, i) => {
        const s = 1 - react * 0.9;
        if (s <= 0.1) return null;
        return (
          <rect
            key={i}
            x={44 + i * 9 + fakeRandom(i) * 4}
            y={BEAKER.bottom - 12 - (i % 2) * 8}
            width={9 * s}
            height={8 * s}
            rx={2}
            fill={solid.from}
          />
        );
      })}
      {anim.precipitate && (
        <Cloudiness colour={anim.precipitate} amount={react * 0.85} x={BEAKER.left + 2} y={level + 2} w={70} h={BEAKER.bottom - level - 6} />
      )}
      {/* local boiling where the reaction is hottest */}
      <Bubbles count={5} xMin={46} xMax={92} fromY={BEAKER.bottom - 12} toY={level + 2} progress={progress} speed={2.6} startAt={0.2} />
      {progress < 0.16 && (
        <path d={`M40,8 Q52,30 ${60},${level}`} stroke="#9fc5e8" strokeWidth={3} fill="none" opacity={0.6} />
      )}
      <Thermometer x={114} top={BEAKER.rim - 12} bulbY={BEAKER.bottom - 14} temperature="hot" progress={progress} />
    </>
  );
}

export default function TemperatureScene(props: SceneProps) {
  const { anim } = props;
  if ((anim.effects ?? []).includes("glow")) return <Thermite {...props} />;
  if (anim.temperature === "cold") return <PowderMix {...props} />;
  return <Slaking {...props} />;
}
