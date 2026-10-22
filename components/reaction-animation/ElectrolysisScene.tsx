// Electrolysis (NCERT Fig. 1.6): two electrodes through the base of the
// cell, wired to a battery. When `collect` is set, a water-filled tube is
// inverted over each electrode and the gas pushes the water down — in
// proportion to anim.electrolysis volumes, so hydrogen fills twice as fast
// as oxygen.

import {
  BEAKER,
  Beaker,
  BeakerLiquid,
  Bubbles,
  GasCloud,
  lerpColor,
  seg,
  type SceneProps,
} from "./shared";

const SURFACE = 70;
const ELECTRODE_TOP = 142;
const CATHODE_X = 58;
const ANODE_X = 102;
const TUBE_TOP = 48;
const TUBE_BOTTOM = 150;
const TUBE_HALF = 11;

function GasLabel({ x, y, gas }: { x: number; y: number; gas: string }) {
  // "H2" → H + subscript 2
  const m = gas.match(/^([A-Za-z]+)(\d*)$/);
  return (
    <text x={x} y={y} textAnchor="middle" fill="#9CA3AF" fontSize={9} fontWeight={600} fontFamily="Inter, sans-serif">
      {m ? m[1] : gas}
      {m && m[2] && (
        <tspan fontSize={6.5} dy={2.5}>
          {m[2]}
        </tspan>
      )}
    </text>
  );
}

// Height of the gas/water boundary in a collecting tube that is `fill` full.
function gasLevel(fill: number): number {
  return TUBE_TOP + 4 + fill * (TUBE_BOTTOM - TUBE_TOP - 8);
}

function CollectingTube({ cx, fill, colour }: { cx: number; fill: number; colour: string | null }) {
  const gasBottom = gasLevel(fill);
  return (
    <g>
      <rect x={cx - TUBE_HALF} y={gasBottom} width={TUBE_HALF * 2} height={TUBE_BOTTOM - gasBottom} fill="#9fc5e8" opacity={0.28} />
      {fill > 0 && (
        <rect
          x={cx - TUBE_HALF}
          y={TUBE_TOP + 4}
          width={TUBE_HALF * 2}
          height={gasBottom - TUBE_TOP - 4}
          fill={colour ?? "#f4f4f6"}
          opacity={colour ? 0.5 : 0.07}
        />
      )}
      <line x1={cx - TUBE_HALF + 1} x2={cx + TUBE_HALF - 1} y1={gasBottom} y2={gasBottom} stroke="#9fc5e8" strokeWidth={1.2} opacity={0.8} />
      <path
        d={`M${cx - TUBE_HALF},${TUBE_BOTTOM} L${cx - TUBE_HALF},${TUBE_TOP + TUBE_HALF} A${TUBE_HALF},${TUBE_HALF} 0 0 1 ${cx + TUBE_HALF},${TUBE_TOP + TUBE_HALF} L${cx + TUBE_HALF},${TUBE_BOTTOM}`}
        fill="none"
        stroke="#3a3650"
        strokeWidth={2}
      />
    </g>
  );
}

export default function ElectrolysisScene({ anim, progress, uid }: SceneProps) {
  const e = anim.electrolysis!;
  const on = seg(progress, 0.04, 0.1);
  const run = seg(progress, 0.08, 1);
  const maxVolume = Math.max(e.cathode.volume, e.anode.volume);
  // Whichever gas has the larger volume fills its tube to ~90%.
  const cathodeFill = run * 0.9 * (e.cathode.volume / maxVolume);
  const anodeFill = run * 0.9 * (e.anode.volume / maxVolume);
  const solution = anim.solution!;

  return (
    <>
      {/* coloured gas escaping above the anode when it isn't collected */}
      {!e.collect && e.anode.colour && (
        <GasCloud
          id={`${uid}-anode-gas`}
          colour={e.anode.colour}
          fill={run * 0.8}
          x={ANODE_X - 22}
          y={BEAKER.rim - 4}
          w={44}
          h={SURFACE - BEAKER.rim + 2}
          progress={progress}
          clipPathId={`${uid}-beaker-clip`}
          maxOpacity={0.6}
        />
      )}
      <Beaker />
      <BeakerLiquid uid={uid} colour={lerpColor(solution.from, solution.to, run)} top={SURFACE} />

      {/* electrodes through the base */}
      <rect x={CATHODE_X - 3} y={ELECTRODE_TOP} width={6} height={BEAKER.bottom - ELECTRODE_TOP + 4} fill="#3b3b3f" />
      <rect x={ANODE_X - 3} y={ELECTRODE_TOP} width={6} height={BEAKER.bottom - ELECTRODE_TOP + 4} fill="#3b3b3f" />

      <Bubbles
        count={e.cathode.volume >= e.anode.volume ? 7 : 4}
        xMin={CATHODE_X - 4}
        xMax={CATHODE_X + 4}
        fromY={ELECTRODE_TOP + 4}
        toY={e.collect ? gasLevel(cathodeFill) + 2 : SURFACE + 2}
        progress={progress}
        speed={1.8 * (e.cathode.volume / maxVolume) + 0.6}
        startAt={0.08}
        radius={2}
        colour={e.cathode.colour ?? "#f4f4f6"}
      />
      <Bubbles
        count={e.anode.volume >= e.cathode.volume ? 7 : 4}
        xMin={ANODE_X - 4}
        xMax={ANODE_X + 4}
        fromY={ELECTRODE_TOP + 4}
        toY={e.collect ? gasLevel(anodeFill) + 2 : SURFACE + 2}
        progress={progress}
        speed={1.8 * (e.anode.volume / maxVolume) + 0.6}
        startAt={0.08}
        radius={2}
        colour={e.anode.colour ?? "#f4f4f6"}
        seed={11}
      />

      {e.collect && (
        <>
          <CollectingTube cx={CATHODE_X} fill={cathodeFill} colour={e.cathode.colour} />
          <CollectingTube cx={ANODE_X} fill={anodeFill} colour={e.anode.colour} />
        </>
      )}
      <GasLabel x={CATHODE_X} y={TUBE_TOP - 6} gas={e.cathode.gas} />
      <GasLabel x={ANODE_X} y={TUBE_TOP - 6} gas={e.anode.gas} />

      {/* battery and wiring: cathode to −, anode to + */}
      <path d={`M${CATHODE_X},${BEAKER.bottom + 4} L${CATHODE_X},204 L70,204`} fill="none" stroke="#6b6478" strokeWidth={1.5} />
      <path d={`M${ANODE_X},${BEAKER.bottom + 4} L${ANODE_X},204 L90,204`} fill="none" stroke="#6b6478" strokeWidth={1.5} />
      <rect x={70} y={197} width={20} height={14} rx={2} fill="#2a2738" stroke="#6b6478" strokeWidth={1.2} />
      <text x={75} y={207.5} textAnchor="middle" fill="#9CA3AF" fontSize={8} fontFamily="Inter, sans-serif">
        −
      </text>
      <text x={85} y={207.5} textAnchor="middle" fill="#9CA3AF" fontSize={8} fontFamily="Inter, sans-serif">
        +
      </text>
      {/* current indicator */}
      <circle cx={80} cy={194} r={1.6} fill="#4ADE80" opacity={on} />
    </>
  );
}
