type Node = { x: number; y: number; r: number };

const NODES: Node[] = [
  { x: 160, y: 120, r: 22 },
  { x: 260, y: 90, r: 14 },
  { x: 240, y: 210, r: 18 },
  { x: 110, y: 230, r: 11 },
  { x: 320, y: 190, r: 9 },
  { x: 70, y: 140, r: 8 },
  { x: 190, y: 260, r: 7 },
];

const BONDS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [2, 4],
  [3, 5],
  [2, 6],
];

// Faint scattered background nodes, decorative only, ~5% opacity.
const SCATTER: Node[] = [
  { x: 30, y: 40, r: 3 },
  { x: 340, y: 40, r: 2 },
  { x: 20, y: 280, r: 2 },
  { x: 360, y: 260, r: 3 },
  { x: 300, y: 30, r: 2 },
  { x: 60, y: 300, r: 2 },
];

export default function MoleculeHero() {
  return (
    <svg
      viewBox="0 0 380 320"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sphereGradient" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="var(--color-accent-2)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g opacity={0.05} stroke="var(--color-text)" strokeWidth="1">
        {SCATTER.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="var(--color-text)" />
        ))}
      </g>

      <g filter="url(#glow)">
        {BONDS.map(([a, b], i) => {
          const from = NODES[a];
          const to = NODES[b];
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--color-accent)"
              strokeOpacity={0.5}
              strokeWidth={2}
            />
          );
        })}
        {NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="url(#sphereGradient)" />
        ))}
      </g>
    </svg>
  );
}
