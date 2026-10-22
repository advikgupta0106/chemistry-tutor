// Photolytic decomposition (NCERT Activity 1.8): a china dish of silver
// halide left in sunlight. Light rays reach the solid, and grey specks of
// silver spread across the exposed surface until the whole surface is grey.

import { fakeRandom, lerpColor, seg, type SceneProps } from "./shared";

const SUN = { x: 30, y: 34 };
const DISH_Y = 150;

export default function PhotolyticScene({ anim, progress, uid }: SceneProps) {
  const solid = anim.solid!;
  const target = solid.to ?? solid.from;
  const light = seg(progress, 0, 0.12);
  const darken = seg(progress, 0.15, 0.95);
  return (
    <>
      <defs>
        <filter id={`${uid}-sun`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      {/* sun */}
      <circle cx={SUN.x} cy={SUN.y} r={22} fill="#fde68a" opacity={0.35 * light} filter={`url(#${uid}-sun)`} />
      <circle cx={SUN.x} cy={SUN.y} r={11} fill="#fcd34d" opacity={light} />
      {/* rays falling on the dish, drifting so they read as light, not lines */}
      {Array.from({ length: 5 }).map((_, i) => {
        const tx = 56 + i * 12;
        const shimmer = 0.45 + 0.25 * Math.sin(progress * 14 + i * 1.7);
        return (
          <line
            key={i}
            x1={SUN.x + 10 + i * 2}
            y1={SUN.y + 10 + i * 2}
            x2={tx}
            y2={DISH_Y - 6}
            stroke="#fde68a"
            strokeWidth={1.6}
            strokeDasharray="6 5"
            strokeDashoffset={-progress * 120}
            opacity={light * shimmer}
          />
        );
      })}

      {/* china dish */}
      <path d={`M42,${DISH_Y - 8} Q80,${DISH_Y + 26} 118,${DISH_Y - 8} Z`} fill="#b8b4c4" stroke="#9b97a6" strokeWidth={1.5} />
      <ellipse cx={80} cy={DISH_Y - 4} rx={32} ry={6} fill={lerpColor(solid.from, target, darken * 0.6)} />
      {/* grey silver specks spreading over the lit surface */}
      {Array.from({ length: 34 }).map((_, i) => {
        const appear = fakeRandom(i * 3.7) * 0.75;
        const local = seg(darken, appear, appear + 0.25);
        if (local <= 0) return null;
        const a = fakeRandom(i * 1.9) * Math.PI * 2;
        const rr = Math.sqrt(fakeRandom(i * 5.3));
        return (
          <circle
            key={i}
            cx={80 + Math.cos(a) * rr * 28}
            cy={DISH_Y - 4 + Math.sin(a) * rr * 4.5}
            r={1.4 + fakeRandom(i) * 1.6}
            fill={target}
            opacity={local}
          />
        );
      })}
      <path d={`M42,${DISH_Y - 8} Q80,${DISH_Y + 26} 118,${DISH_Y - 8}`} fill="none" stroke="#9b97a6" strokeWidth={1.5} />
    </>
  );
}
