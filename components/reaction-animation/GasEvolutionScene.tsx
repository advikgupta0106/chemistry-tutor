// Gas evolution: colourless gases are bubbles whose number and speed follow
// the reaction's intensity (a brisk fizz froths at the surface); a coloured
// gas like chlorine visibly fills the space above the liquid. Where the
// prose says the gas turns lime water milky, it's piped into a second tube.

import {
  BEAKER,
  Beaker,
  BeakerLiquid,
  Bubbles,
  Cloudiness,
  GAS_BUBBLES,
  GasCloud,
  INTENSITY_SPEED,
  SolidPiece,
  TestTube,
  Thermometer,
  TubeLiquid,
  fakeRandom,
  lerpColor,
  seg,
  type SceneProps,
} from "./shared";

// Froth on the surface during a brisk fizz.
function Froth({ x, w, y, amount }: { x: number; w: number; y: number; amount: number }) {
  if (amount <= 0) return null;
  return (
    <g opacity={amount}>
      {Array.from({ length: 18 }).map((_, i) => (
        <circle
          key={i}
          cx={x + fakeRandom(i * 3.3) * w}
          cy={y - fakeRandom(i * 5.1) * 5}
          r={1.5 + fakeRandom(i) * 1.6}
          fill="none"
          stroke="#f4f4f6"
          strokeWidth={0.8}
          opacity={0.75}
        />
      ))}
    </g>
  );
}

function activityAt(progress: number, consumed: boolean): number {
  // Fizzing builds quickly, then dies away once the solid is used up.
  return seg(progress, 0.03, 0.12) * (consumed ? 1 - seg(progress, 0.8, 1) : 1);
}

function LimewaterTest({ anim, progress, uid }: SceneProps) {
  const reactTube = { cx: 50, top: 50, bottom: 175, halfWidth: 15 };
  const limeTube = { cx: 118, top: 70, bottom: 185, halfWidth: 13 };
  const surface = 120;
  const limeTop = 115;
  const solid = anim.solid;
  const consumed = solid?.to == null;
  const activity = activityAt(progress, consumed);
  const speed = INTENSITY_SPEED[anim.intensity];
  const solution = anim.solution ?? { from: "#e8f1f4", to: "#e8f1f4" };
  const milky = seg(progress, 0.25, 0.85);
  return (
    <>
      <TubeLiquid uid={uid} name="react" geom={reactTube} top={surface} colour={lerpColor(solution.from, solution.to, progress)} />
      {solid && (
        <SolidPiece
          shape={solid.shape}
          cx={reactTube.cx}
          baseY={reactTube.bottom - 3}
          colour={solid.from}
          scale={consumed ? 1 - seg(progress, 0.08, 0.85) : 1}
        />
      )}
      <Bubbles
        count={Math.round(GAS_BUBBLES[anim.gas.amount] * activity)}
        xMin={reactTube.cx - 10}
        xMax={reactTube.cx + 10}
        fromY={reactTube.bottom - 8}
        toY={surface + 2}
        progress={progress}
        speed={speed}
      />
      <Froth x={reactTube.cx - 13} w={26} y={surface} amount={anim.intensity === "violent" ? activity : 0} />
      <TestTube geom={reactTube} />
      {/* stopper + delivery tube */}
      <rect x={reactTube.cx - 13} y={reactTube.top - 6} width={26} height={10} rx={2} fill="#6b6478" />
      <path d={`M${reactTube.cx},${reactTube.top - 6} L${reactTube.cx},28 L${limeTube.cx},28 L${limeTube.cx},${limeTube.bottom - 14}`} fill="none" stroke="#6b6478" strokeWidth={2} />
      <TubeLiquid uid={uid} name="lime" geom={limeTube} top={limeTop} colour={lerpColor("#e8f1f4", "#f2efe8", milky)} />
      <Cloudiness colour="#f1f1ee" amount={milky * 0.85} x={limeTube.cx - 12} y={limeTop + 2} w={24} h={limeTube.bottom - limeTop - 8} seed={3} />
      <Bubbles
        count={Math.round(3 * activity)}
        xMin={limeTube.cx - 3}
        xMax={limeTube.cx + 3}
        fromY={limeTube.bottom - 14}
        toY={limeTop + 2}
        progress={progress}
        speed={2}
        radius={2}
        seed={5}
      />
      <TestTube geom={limeTube} />
    </>
  );
}

export default function GasEvolutionScene(props: SceneProps) {
  const { anim, progress, uid } = props;
  if ((anim.effects ?? []).includes("limewater_test")) return <LimewaterTest {...props} />;

  const solid = anim.solid;
  const consumed = solid?.to == null;
  const activity = activityAt(progress, consumed);
  const speed = INTENSITY_SPEED[anim.intensity];
  const solution = anim.solution!;
  const surface = BEAKER.liquidTop;
  const solidScale = solid ? (consumed ? 1 - seg(progress, 0.08, 0.9) : 1 - seg(progress, 0.1, 1) * 0.2) : 0;
  const gasColour = anim.gas.colour;
  const hasThermo = anim.temperature !== "none";
  const solidCx = hasThermo ? 72 : 80;

  return (
    <>
      {gasColour && (
        <GasCloud
          id={`${uid}-gas`}
          colour={gasColour}
          fill={seg(progress, 0.12, 0.9)}
          x={BEAKER.left + 2}
          y={BEAKER.rim - 6}
          w={BEAKER.right - BEAKER.left - 4}
          h={surface - BEAKER.rim + 4}
          progress={progress}
          clipPathId={`${uid}-beaker-clip`}
        />
      )}
      <Beaker />
      <BeakerLiquid uid={uid} colour={lerpColor(solution.from, solution.to, seg(progress, 0.1, 0.95))} />
      {solid && (
        <SolidPiece
          shape={solid.shape}
          cx={solidCx}
          baseY={BEAKER.bottom - 3}
          colour={lerpColor(solid.from, solid.to ?? solid.from, progress)}
          scale={solidScale}
          height={60}
        />
      )}
      {solid && (
        <Bubbles
          count={Math.round(GAS_BUBBLES[anim.gas.amount] * activity)}
          xMin={solidCx - (solid.shape === "strip" ? 6 : 16)}
          xMax={solidCx + (solid.shape === "strip" ? 6 : 16)}
          fromY={solid.shape === "strip" ? BEAKER.bottom - 8 - 30 * solidScale : BEAKER.bottom - 10}
          toY={surface + 2}
          progress={progress}
          speed={speed}
          colour={gasColour ?? "#f4f4f6"}
        />
      )}
      {!solid && (
        <Bubbles
          count={Math.round(GAS_BUBBLES[anim.gas.amount] * activity)}
          xMin={BEAKER.left + 12}
          xMax={BEAKER.right - (hasThermo ? 30 : 12)}
          fromY={BEAKER.bottom - 10}
          toY={surface + 2}
          progress={progress}
          speed={speed}
          colour={gasColour ?? "#f4f4f6"}
        />
      )}
      <Froth x={BEAKER.left + 6} w={BEAKER.right - BEAKER.left - 12} y={surface} amount={anim.intensity === "violent" ? activity : 0} />
      {hasThermo && (
        <Thermometer x={114} top={BEAKER.rim - 12} bulbY={BEAKER.bottom - 14} temperature={anim.temperature as "hot" | "cold"} progress={progress} />
      )}
    </>
  );
}
