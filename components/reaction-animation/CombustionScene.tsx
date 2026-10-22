// Combustion: the fuel and its flame are the whole picture. The flame's
// colour and whether it smokes come straight from anim.flame, so a clean
// blue methane flame and a sooty yellow benzene flame look nothing alike.

import { Flame, GLASS, TestTube, fakeRandom, lerpColor, seg, type SceneProps } from "./shared";

const PLATE = { x: 38, y: 34, w: 84, h: 5 };

// Cool plate held above the flame (as in NCERT Activity 4.3) — collects
// soot from a smoky flame, or fogs with water from a clean one.
function Plate({ soot, droplets, uid }: { soot: number; droplets: number; uid: string }) {
  return (
    <g>
      <line x1={PLATE.x + PLATE.w} y1={PLATE.y + 2} x2={152} y2={12} stroke="#6b6478" strokeWidth={2} strokeLinecap="round" />
      <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} rx={1.5} fill="#b9b8c2" />
      {soot > 0 && (
        <>
          <defs>
            <filter id={`${uid}-soot`} x="-20%" y="-50%" width="140%" height="300%">
              <feGaussianBlur stdDeviation={2.5} />
            </filter>
          </defs>
          <ellipse
            cx={80}
            cy={PLATE.y + PLATE.h + 1}
            rx={10 + soot * 26}
            ry={2.5 + soot * 3.5}
            fill="#0d0d0f"
            opacity={0.5 + soot * 0.5}
            filter={`url(#${uid}-soot)`}
          />
        </>
      )}
      {Array.from({ length: 12 }).map((_, i) => {
        const appear = fakeRandom(i * 4.3) * 0.8;
        if (droplets <= appear) return null;
        const x = 52 + fakeRandom(i * 2.1) * 56;
        return (
          <circle
            key={i}
            cx={x}
            cy={PLATE.y + PLATE.h + 2 + fakeRandom(i * 6.1) * 1.5}
            r={1 + fakeRandom(i) * 0.9}
            fill="#bfe3ff"
            opacity={0.85 * Math.min(1, (droplets - appear) / 0.15)}
          />
        );
      })}
    </g>
  );
}

// Black smoke puffs rising off the flame tip — only for sooty flames.
function Smoke({ colour, fromY, toY, progress }: { colour: string; fromY: number; toY: number; progress: number }) {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => {
        const pos = (progress * 1.6 + i / 7) % 1;
        const fade = Math.min(1, progress / 0.15);
        const y = fromY - pos * (fromY - toY);
        const x = 80 + Math.sin(pos * 5 + i) * (3 + pos * 8);
        // Lifted slightly toward grey with a faint rim so black smoke still
        // reads against the near-black page background.
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3.5 + pos * 9}
            fill={lerpColor(colour, "#8a8794", 0.3)}
            stroke="#6b6478"
            strokeWidth={0.6}
            opacity={fade * (1 - pos * 0.35) * 0.9}
          />
        );
      })}
    </>
  );
}

export default function CombustionScene({ anim, progress, uid }: SceneProps) {
  const flame = anim.flame;
  const effects = anim.effects ?? [];
  const ignite = seg(progress, 0.05, 0.2);

  // Glowing ember with no flame (charcoal: NCERT notes it "just glows red").
  if (!flame) {
    const solid = anim.solid!;
    const burn = seg(progress, 0.1, 1);
    const glow = effects.includes("glow") ? Math.sin(seg(progress, 0.1, 1) * Math.PI * 0.9) : 0;
    const body = lerpColor(solid.from, solid.to ?? solid.from, seg(progress, 0.6, 1));
    const scale = 1 - burn * 0.55;
    return (
      <>
        <defs>
          <filter id={`${uid}-ember`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={6} />
          </filter>
        </defs>
        <rect x={34} y={176} width={92} height={6} rx={2} fill="#2a2738" />
        <circle cx={80} cy={160} r={30} fill="#ff5a1f" opacity={glow * 0.55} filter={`url(#${uid}-ember)`} />
        <path
          d={`M${80 - 24 * scale},176 Q${80 - 26 * scale},${176 - 26 * scale} ${80 - 4 * scale},${176 - 30 * scale} Q${80 + 22 * scale},${176 - 30 * scale} ${80 + 24 * scale},176 Z`}
          fill={body}
        />
        <g opacity={glow * 0.9}>
          <path
            d={`M${80 - 16 * scale},174 Q${80 - 14 * scale},${174 - 18 * scale} ${80},${174 - 22 * scale} Q${80 + 14 * scale},${174 - 18 * scale} ${80 + 16 * scale},174 Z`}
            fill="#ff6a2b"
            className="anim-pulse"
          />
        </g>
      </>
    );
  }

  // Hydrogen + oxygen in a test tube: a lit splint at the mouth sets off a
  // pop and a brief flash, then water droplets mist the inside of the tube.
  if (flame.fuel === "mixture") {
    const tube = { cx: 72, top: 70, bottom: 190, halfWidth: 14 };
    const splintIn = seg(progress, 0, 0.3);
    const flash = progress > 0.32 ? Math.max(0, 1 - (progress - 0.32) / 0.12) : 0;
    const droplets = seg(progress, 0.42, 0.9);
    const splintTipX = 150 - splintIn * 62;
    return (
      <>
        <TestTube geom={tube} />
        {Array.from({ length: 14 }).map((_, i) => {
          const appear = fakeRandom(i * 3.3) * 0.7;
          if (droplets <= appear) return null;
          const side = i % 2 === 0 ? -1 : 1;
          return (
            <circle
              key={i}
              cx={tube.cx + side * (tube.halfWidth - 2.5)}
              cy={tube.top + 20 + fakeRandom(i * 5.7) * 85}
              r={1.2 + fakeRandom(i) * 0.8}
              fill="#bfe3ff"
              opacity={0.85}
            />
          );
        })}
        <line x1={splintTipX} y1={58} x2={splintTipX + 60} y2={40} stroke="#b0875a" strokeWidth={3} strokeLinecap="round" />
        {progress < 0.34 && <Flame cx={splintTipX - 1} baseY={60} height={12} halfWidth={4} colour="#f5b638" />}
        {flash > 0 && (
          <g opacity={flash}>
            <circle cx={tube.cx} cy={tube.top - 4} r={10 + (1 - flash) * 26} fill="#fffbe6" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r1 = 14 + (1 - flash) * 10;
              const r2 = r1 + 10;
              return (
                <line
                  key={i}
                  x1={tube.cx + Math.cos(a) * r1}
                  y1={tube.top - 4 + Math.sin(a) * r1}
                  x2={tube.cx + Math.cos(a) * r2}
                  y2={tube.top - 4 + Math.sin(a) * r2}
                  stroke="#ffe58a"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}
            <text x={tube.cx + 22} y={tube.top - 18} fill="#ffe58a" fontSize={13} fontWeight={700} fontFamily="Inter, sans-serif">
              pop!
            </text>
          </g>
        )}
      </>
    );
  }

  // Magnesium ribbon in tongs: the burning front climbs the ribbon with a
  // dazzling white flame, leaving white powder behind.
  if (flame.fuel === "solid" && anim.solid?.shape === "strip") {
    const solid = anim.solid;
    const burn = seg(progress, 0.12, 0.9);
    const ribbonTop = 70;
    const ribbonBottom = 170;
    const front = ribbonBottom - burn * (ribbonBottom - ribbonTop);
    const burning = progress > 0.12 && progress < 0.92;
    return (
      <>
        <defs>
          <filter id={`${uid}-halo`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={9} />
          </filter>
        </defs>
        <path d={`M150,30 L84,${ribbonTop - 2} M150,40 L84,${ribbonTop + 4}`} stroke="#6b6478" strokeWidth={2.5} strokeLinecap="round" />
        <rect x={77} y={ribbonTop} width={6} height={front - ribbonTop} fill={solid.from} />
        {/* white powder dropping into a watch-glass below (NCERT Activity 1.1) */}
        <path d="M46,196 Q80,212 114,196" fill="none" stroke={GLASS} strokeWidth={2} />
        <ellipse cx={80} cy={200} rx={4 + burn * 18} ry={1 + burn * 3.5} fill={solid.to ?? "#f1f1ee"} opacity={burn > 0 ? 1 : 0} />
        {burning &&
          Array.from({ length: 6 }).map((_, i) => {
            const pos = (progress * 2.2 + i / 6) % 1;
            const y = front + 8 + pos * (196 - front - 8);
            return <circle key={i} cx={78 + fakeRandom(i * 1.9) * 5} cy={y} r={1.3 + fakeRandom(i) * 1.1} fill={solid.to ?? "#f1f1ee"} opacity={1 - pos * 0.4} />;
          })}
        {burning && effects.includes("glow") && (
          <g opacity={0.55 * ignite}>
            <circle cx={80} cy={front} r={30} fill="#ffffff" filter={`url(#${uid}-halo)`} className="anim-pulse" />
          </g>
        )}
        {burning && <Flame cx={80} baseY={front + 6} height={26 * ignite} halfWidth={11} colour={flame.colour} ragged />}
      </>
    );
  }

  // Powder in a deflagrating spoon (sulphur): burns away under its flame.
  if (flame.fuel === "solid") {
    const solid = anim.solid!;
    const left = 1 - seg(progress, 0.15, 1) * 0.85;
    return (
      <>
        <path d="M150,40 L98,140" stroke="#6b6478" strokeWidth={2.5} strokeLinecap="round" />
        <path d="M60,140 Q80,164 100,140 Z" fill="#2a2738" stroke="#6b6478" strokeWidth={2} />
        <ellipse cx={80} cy={142} rx={17 * left + 2} ry={4 * left + 1} fill={solid.from} />
        <Flame cx={80} baseY={140} height={40 * ignite * (0.5 + left * 0.5)} halfWidth={12} colour={flame.colour} />
      </>
    );
  }

  // Gas jet (methane) or a liquid at a wick (benzene). Both get the cool
  // plate held above so the difference shows: droplets vs soot.
  const sooty = flame.smoke != null;
  const baseY = 150;
  const height = (sooty ? 62 : 50) * ignite;
  return (
    <>
      {flame.fuel === "gas_jet" ? (
        <g>
          <rect x={73} y={baseY} width={14} height={50} fill="#2a2738" stroke="#6b6478" strokeWidth={1.5} />
          <rect x={60} y={200} width={40} height={10} rx={2} fill="#2a2738" stroke="#6b6478" strokeWidth={1.5} />
        </g>
      ) : (
        <g>
          <path d="M50,180 Q80,212 110,180 Z" fill="#2a2738" stroke="#6b6478" strokeWidth={1.5} />
          <rect x={77} y={baseY + 2} width={6} height={30} fill="#d8cfb8" />
        </g>
      )}
      {sooty && <Smoke colour={flame.smoke!} fromY={baseY - height} toY={PLATE.y + 8} progress={progress} />}
      <Flame cx={80} baseY={baseY + 4} height={height} halfWidth={sooty ? 15 : 10} colour={flame.colour} ragged={sooty} />
      <Plate
        uid={uid}
        soot={effects.includes("soot") ? seg(progress, 0.2, 1) : 0}
        droplets={effects.includes("condensation") ? seg(progress, 0.25, 1) : 0}
      />
    </>
  );
}
