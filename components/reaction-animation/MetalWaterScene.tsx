// Metals with water, scaled by reactivity (NCERT Class 10, 3.2.2):
// potassium and sodium dart across the surface and the hydrogen catches
// fire; calcium and magnesium (hot water) start floating as hydrogen
// bubbles cling to them while the water turns cloudy; aluminium and iron
// only react with steam, drawn as NCERT Fig. 3.3 with the hydrogen
// collected over water.

import {
  BEAKER,
  Beaker,
  BeakerLiquid,
  Bubbles,
  Burner,
  Cloudiness,
  Flame,
  GAS_BUBBLES,
  GasCollector,
  INTENSITY_SPEED,
  SteamWisps,
  TestTube,
  easeInOut,
  fakeRandom,
  lerpColor,
  seg,
  type SceneProps,
} from "./shared";

const SURFACE = BEAKER.liquidTop;

// Small metal lump (K, Na, Ca) or ribbon (Mg).
function MetalPiece({ x, y, scale, colour, shape }: { x: number; y: number; scale: number; colour: string; shape: string }) {
  if (scale <= 0.02) return null;
  if (shape === "strip") {
    return <rect x={x - 18 * scale} y={y - 2.5} width={36 * scale} height={5} rx={1.5} fill={colour} />;
  }
  return <rect x={x - 7 * scale} y={y - 4.5 * scale} width={14 * scale} height={9 * scale} rx={2.5} fill={colour} />;
}

function DartingMetal({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const speed = INTENSITY_SPEED[anim.intensity];
  const drop = seg(progress, 0, 0.08);
  const life = seg(progress, 0.08, 0.92);
  const scale = 1 - easeInOut(life);
  // Deterministic zig-zag across the surface; faster for more reactive metals.
  const t = life * speed * 3;
  const x = 80 + Math.sin(t * 2.1) * 32 * Math.cos(t * 0.7) * (drop >= 1 ? 1 : 0);
  const y = drop < 1 ? 20 + drop * (SURFACE - 22) : SURFACE - 2 + Math.sin(t * 9) * 0.8;
  const reacting = drop >= 1 && scale > 0.02;
  const flame = anim.flame;
  const liquid = lerpColor(anim.solution!.from, anim.solution!.to, life);

  return (
    <>
      <Beaker />
      <BeakerLiquid uid={uid} colour={liquid} />
      {/* ripples left behind along the path */}
      {reacting &&
        [0.06, 0.12, 0.18].map((lag, i) => {
          const tl = Math.max(0, t - lag * speed * 3);
          const rx = 80 + Math.sin(tl * 2.1) * 32 * Math.cos(tl * 0.7);
          return (
            <ellipse key={i} cx={rx} cy={SURFACE + 1} rx={6 + i * 4} ry={1.4 + i * 0.4} fill="none" stroke="#f4f4f6" strokeWidth={0.8} opacity={0.4 - i * 0.12} />
          );
        })}
      <MetalPiece x={x} y={y} scale={scale} colour={solid.from} shape={solid.shape} />
      {/* fizz: hydrogen spraying off the piece */}
      {reacting &&
        Array.from({ length: anim.intensity === "violent" ? 8 : 5 }).map((_, i) => {
          const pos = (progress * 5 + fakeRandom(i * 3.1)) % 1;
          const a = fakeRandom(i * 7.7) * Math.PI;
          return (
            <circle
              key={i}
              cx={x + Math.cos(a) * (6 + pos * 10)}
              cy={y - 2 - Math.sin(a) * pos * 9}
              r={1}
              fill="#f4f4f6"
              opacity={(1 - pos) * 0.8}
            />
          );
        })}
      {reacting && flame && (
        <Flame cx={x} baseY={y - 3} height={(anim.intensity === "violent" ? 34 : 20) * Math.min(1, scale * 2)} halfWidth={anim.intensity === "violent" ? 10 : 7} colour={flame.colour} ragged />
      )}
      {reacting &&
        (anim.effects ?? []).includes("sparks") &&
        Array.from({ length: 6 }).map((_, i) => {
          const pos = (progress * 4 + i / 6) % 1;
          const a = -Math.PI / 2 + (fakeRandom(i * 5.3) - 0.5) * 2.2;
          const d = 10 + pos * 22;
          return <circle key={i} cx={x + Math.cos(a) * d} cy={y - 6 + Math.sin(a) * d} r={1.1} fill={flame?.colour ?? "#ffd27a"} opacity={1 - pos} />;
        })}
    </>
  );
}

function FloatingMetal({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const speed = INTENSITY_SPEED[anim.intensity];
  const floats = (anim.effects ?? []).includes("floats");
  // Sits on the bottom, gathers bubbles, then lifts toward the surface.
  const rise = floats ? easeInOut(seg(progress, 0.3, 0.8)) : 0;
  const restY = BEAKER.bottom - 8;
  const y = restY - rise * (restY - (SURFACE + 6));
  const scale = solid.to == null ? 1 - seg(progress, 0.2, 1) * 0.9 : 1 - seg(progress, 0.2, 1) * 0.15;
  const liquid = lerpColor(anim.solution!.from, anim.solution!.to, seg(progress, 0.15, 1));
  const cloud = anim.precipitate ? seg(progress, 0.2, 1) : 0;
  const clinging = Math.round(seg(progress, 0.05, 0.4) * (anim.intensity === "slow" ? 4 : 7));
  const hot = (anim.effects ?? []).includes("steam");

  return (
    <>
      {hot && <SteamWisps x={80} y={SURFACE - 4} progress={progress} amount={0.6} spread={16} />}
      <Beaker />
      <BeakerLiquid uid={uid} colour={liquid} />
      {anim.precipitate && (
        <Cloudiness colour={anim.precipitate} amount={cloud * 0.8} x={BEAKER.left + 2} y={SURFACE + 2} w={96} h={BEAKER.bottom - SURFACE - 6} />
      )}
      <Bubbles
        count={GAS_BUBBLES[anim.gas.amount]}
        xMin={64}
        xMax={96}
        fromY={y - 4}
        toY={SURFACE + 2}
        progress={progress}
        speed={speed * 1.3}
        startAt={0.05}
      />
      <MetalPiece x={80} y={y} scale={scale} colour={lerpColor(solid.from, solid.to ?? solid.from, progress)} shape={solid.shape} />
      {/* hydrogen bubbles stuck to the metal — what makes it float */}
      {Array.from({ length: clinging }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        const half = solid.shape === "strip" ? 18 * scale : 7 * scale;
        return (
          <circle
            key={i}
            cx={80 + Math.cos(a) * (half + 1)}
            cy={y + Math.sin(a) * 5}
            r={1.8}
            fill="none"
            stroke="#f4f4f6"
            strokeWidth={0.9}
            opacity={0.8}
          />
        );
      })}
    </>
  );
}

// Metal heated in steam (Al, Fe): boiling tube over a burner, steam
// flowing in, hydrogen bubbling into a collecting tube on the right.
function SteamMetal({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const tube = { cx: 52, top: 60, bottom: 158, halfWidth: 13 };
  const change = seg(progress, 0.15, 0.95);
  const colour = lerpColor(solid.from, solid.to ?? solid.from, change);
  const glow = (anim.effects ?? []).includes("glow");
  const metalY = tube.bottom - 18;
  return (
    <>
      <defs>
        <filter id={`${uid}-hot`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      <Burner cx={tube.cx} flameTop={tube.bottom + 4} />
      {/* steam inlet from the left */}
      <path d={`M8,72 L${tube.cx - 4},72 L${tube.cx - 4},${metalY - 12}`} fill="none" stroke="#6b6478" strokeWidth={2} />
      <TestTube geom={tube} />
      {glow && <circle cx={tube.cx} cy={metalY} r={12} fill="#ff6a2b" opacity={0.6 * seg(progress, 0.05, 0.25)} filter={`url(#${uid}-hot)`} />}
      {solid.shape === "strip" ? (
        <rect x={tube.cx - 3} y={metalY - 22} width={6} height={30} rx={1.5} fill={colour} />
      ) : (
        Array.from({ length: 7 }).map((_, i) => (
          <circle key={i} cx={tube.cx - 7 + fakeRandom(i * 2.3) * 14} cy={metalY + 4 - fakeRandom(i * 3.7) * 9} r={3} fill={colour} />
        ))
      )}
      <SteamWisps x={tube.cx} y={metalY - 16} progress={progress} amount={0.8} spread={5} />
      {/* delivery tube to the collector */}
      <path d={`M${tube.cx + 4},${tube.top - 4} L${tube.cx + 4},40 L140,40 L140,204 L122,204`} fill="none" stroke="#6b6478" strokeWidth={2} />
      <GasCollector cx={120} fill={seg(progress, 0.2, 1) * 0.7} progress={progress} bubbling={progress > 0.2} tubeTop={120} />
    </>
  );
}

export default function MetalWaterScene(props: SceneProps) {
  const { anim } = props;
  if (anim.apparatus === "test_tube_burner") return <SteamMetal {...props} />;
  if ((anim.effects ?? []).includes("darts")) return <DartingMetal {...props} />;
  return <FloatingMetal {...props} />;
}
