type StructureKind = "benzene" | "nitronium" | "arenium" | "nitrobenzene";

// Hexagon vertices, pointy-top, centered at (60,60).
const V0 = { x: 60, y: 32 }; // top (ipso carbon for substituents)
const V1 = { x: 84, y: 46 };
const V2 = { x: 84, y: 74 };
const V3 = { x: 60, y: 88 };
const V4 = { x: 36, y: 74 };
const V5 = { x: 36, y: 46 };
const HEX_POINTS = [V0, V1, V2, V3, V4, V5].map((p) => `${p.x},${p.y}`).join(" ");

function AromaticRing({ substituentLabel }: { substituentLabel?: string }) {
  return (
    <>
      <polygon points={HEX_POINTS} fill="none" stroke="white" strokeWidth={1.5} />
      <circle cx={60} cy={60} r={16} fill="none" stroke="white" strokeWidth={1.5} />
      {substituentLabel && (
        <>
          <line x1={V0.x} y1={V0.y} x2={V0.x} y2={V0.y - 14} stroke="white" strokeWidth={1.5} />
          <text x={V0.x} y={V0.y - 18} textAnchor="middle" fontSize="11" fill="white">
            {substituentLabel}
          </text>
        </>
      )}
    </>
  );
}

function AreniumRing() {
  // Aromaticity broken: no inscribed circle, two explicit double bonds,
  // the ipso carbon (V0) is sp3 with the incoming substituent, and the
  // positive charge is shown delocalized in the ring.
  function doubleBond(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ox = (-dy / len) * 3;
    const oy = (dx / len) * 3;
    return (
      <>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="white" strokeWidth={1.5} />
        <line
          x1={a.x + ox}
          y1={a.y + oy}
          x2={b.x + ox}
          y2={b.y + oy}
          stroke="white"
          strokeWidth={1.5}
        />
      </>
    );
  }

  return (
    <>
      <polygon points={HEX_POINTS} fill="none" stroke="white" strokeWidth={1.5} />
      {doubleBond(V1, V2)}
      {doubleBond(V3, V4)}
      <line x1={V0.x} y1={V0.y} x2={V0.x} y2={V0.y - 14} stroke="white" strokeWidth={1.5} />
      <text x={V0.x} y={V0.y - 18} textAnchor="middle" fontSize="11" fill="white">
        NO&#8322;
      </text>
      <text x={60} y={64} textAnchor="middle" fontSize="14" fill="white">
        +
      </text>
    </>
  );
}

function NitroniumIon() {
  return (
    <>
      <text x={20} y={64} textAnchor="middle" fontSize="14" fill="white">O</text>
      <text x={60} y={64} textAnchor="middle" fontSize="14" fill="white">N</text>
      <text x={100} y={64} textAnchor="middle" fontSize="14" fill="white">O</text>
      <line x1={28} y1={58} x2={50} y2={58} stroke="white" strokeWidth={1.5} />
      <line x1={28} y1={64} x2={50} y2={64} stroke="white" strokeWidth={1.5} />
      <line x1={70} y1={58} x2={92} y2={58} stroke="white" strokeWidth={1.5} />
      <line x1={70} y1={64} x2={92} y2={64} stroke="white" strokeWidth={1.5} />
      <text x={68} y={44} fontSize="12" fill="white">+</text>
    </>
  );
}

export default function MechanismStructure({ kind }: { kind: StructureKind }) {
  return (
    <svg viewBox="0 0 120 96" className="h-20 w-28">
      {kind === "benzene" && <AromaticRing />}
      {kind === "nitrobenzene" && <AromaticRing substituentLabel="NO₂" />}
      {kind === "arenium" && <AreniumRing />}
      {kind === "nitronium" && <NitroniumIon />}
    </svg>
  );
}
