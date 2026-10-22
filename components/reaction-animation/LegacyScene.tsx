// The original generic beaker renderer, driven by beaker_view.colors. Used
// only for reactions that don't have a beaker_view.animation yet.

import type { BeakerView } from "@/lib/content";
import { BEAKER, BEAKER_PATH, fakeRandom, lerpColor } from "./shared";

const SOLID_IN_LIQUID_Y = 138;
const SOLID_NO_LIQUID_Y = 158;
const VIGOR_BUBBLE_COUNT: Record<string, number> = { vigorous: 8, moderate: 5, gentle: 3 };
const VIGOR_SPEED: Record<string, number> = { vigorous: 2.4, moderate: 1.65, gentle: 1.05 };

export default function LegacyScene({
  beakerView,
  progress,
  uid,
}: {
  beakerView: BeakerView;
  progress: number;
  uid: string;
}) {
  const colors = beakerView.colors;
  const clipId = `${uid}-legacy-clip`;

  const hasLiquid = colors.thermal_visual_style !== "flame" && colors.initial_solution != null;
  const hasSolid = colors.thermal_visual_style !== "flame" && colors.initial_solid != null;
  const solidConsumed = colors.final_solid == null;
  const solidY = hasLiquid ? SOLID_IN_LIQUID_Y : SOLID_NO_LIQUID_Y;

  const liquidColor =
    hasLiquid && colors.final_solution
      ? lerpColor(colors.initial_solution!, colors.final_solution, progress)
      : colors.initial_solution ?? undefined;
  const solidColor = hasSolid
    ? lerpColor(colors.initial_solid!, colors.final_solid ?? colors.initial_solid!, Math.min(progress * 1.4, 1))
    : undefined;
  const solidScale = hasSolid ? (solidConsumed ? Math.max(1 - progress * 1.05, 0) : 1 - progress * 0.25) : 1;
  const solidOpacity = hasSolid ? (solidConsumed ? Math.max(1 - progress * 1.2, 0) : 1) : 0;

  const gas = beakerView.gas_evolution;
  const bubbleCount = gas.occurs ? VIGOR_BUBBLE_COUNT[gas.vigor ?? "gentle"] : 0;
  const bubbleSpeed = VIGOR_SPEED[gas.vigor ?? "gentle"];
  const bubbleColor = gas.colour ?? "#f4f4f6";
  const bubbleOpacityPeak = gas.colour ? 0.9 : 0.6;
  const bubbleTopY = hasLiquid ? BEAKER.liquidTop : BEAKER.rim - 18;
  const bubbleBottomY = hasSolid ? solidY : BEAKER.bottom - 10;

  const showPrecipitate = beakerView.precipitate.forms && colors.precipitate;
  const style = colors.thermal_visual_style;

  return (
    <>
      {style === "steam" &&
        [0, 1, 2].map((i) => {
          const local = Math.max(0, Math.min(1, (progress - 0.15 - i * 0.12) / 0.7));
          if (local <= 0) return null;
          const x = 70 + i * 10;
          const y = BEAKER.rim - 4 - local * 30;
          return (
            <path
              key={i}
              d={`M${x},${y} q4,-6 0,-12 q-4,-6 0,-12`}
              stroke="#f4f4f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
              opacity={Math.sin(local * Math.PI) * 0.55}
            />
          );
        })}

      {style === "glow" && (
        <>
          <circle cx={80} cy={solidY} r={10 + progress * 34} fill="#ff8c3a" opacity={Math.max(0, progress - 0.25) * 0.5} />
          {progress > 0.45 &&
            [0, 1, 2, 3, 4].map((i) => {
              const angle = (i / 5) * Math.PI * 2 + progress * 3;
              const dist = 20 + fakeRandom(i) * 22 * Math.min(1, (progress - 0.45) / 0.4);
              return (
                <circle
                  key={i}
                  cx={80 + Math.cos(angle) * dist}
                  cy={solidY - 10 + Math.sin(angle) * dist * 0.6}
                  r={1.6}
                  fill="#ffd27a"
                  opacity={0.85}
                />
              );
            })}
        </>
      )}

      <path d={BEAKER_PATH} fill="none" stroke="#2A2738" strokeWidth={2.5} />

      {hasLiquid && (
        <>
          <clipPath id={clipId}>
            <path d={BEAKER_PATH} />
          </clipPath>
          <rect
            x={BEAKER.left}
            y={BEAKER.liquidTop}
            width={BEAKER.right - BEAKER.left}
            height={BEAKER.bottom - BEAKER.liquidTop}
            fill={liquidColor}
            opacity={0.88}
            clipPath={`url(#${clipId})`}
          />
        </>
      )}

      {showPrecipitate &&
        Array.from({ length: 10 }).map((_, i) => {
          const appearAt = fakeRandom(i * 3.1) * 0.35;
          const local = Math.max(0, Math.min(1, (progress - appearAt) / (1 - appearAt)));
          const startX = BEAKER.left + 15 + fakeRandom(i * 1.7) * (BEAKER.right - BEAKER.left - 30);
          const startY = BEAKER.liquidTop + 10 + fakeRandom(i * 2.3) * 40;
          const restY = BEAKER.bottom - 6 - fakeRandom(i * 4.1) * 6;
          return (
            <circle
              key={i}
              cx={startX}
              cy={startY + (restY - startY) * local}
              r={1.8 + fakeRandom(i * 5.2) * 1.4}
              fill={colors.precipitate!}
              opacity={0.4 + local * 0.5}
            />
          );
        })}

      {hasSolid && solidOpacity > 0 && colors.solid_shape === "strip" && (
        <rect
          x={76}
          y={solidY - 28 * solidScale}
          width={8}
          height={56 * solidScale}
          rx={2}
          fill={solidColor}
          opacity={solidOpacity}
        />
      )}
      {hasSolid &&
        solidOpacity > 0 &&
        colors.solid_shape === "granules" &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const dist = 10 * solidScale;
          return (
            <circle
              key={i}
              cx={80 + Math.cos(angle) * dist}
              cy={solidY + Math.sin(angle) * dist * 0.5}
              r={5 * solidScale}
              fill={solidColor}
              opacity={solidOpacity}
            />
          );
        })}

      {Array.from({ length: bubbleCount }).map((_, i) => {
        const cyclePos = (progress * bubbleSpeed + fakeRandom(i * 7.3)) % 1;
        const y = bubbleBottomY - cyclePos * (bubbleBottomY - bubbleTopY);
        const fadeIn = Math.min(1, progress / 0.08);
        const opacity =
          fadeIn * (cyclePos < 0.1 ? cyclePos / 0.1 : cyclePos > 0.85 ? (1 - cyclePos) / 0.15 : 1) * bubbleOpacityPeak;
        return (
          <circle key={i} cx={70 + fakeRandom(i * 9.1) * 20} cy={y} r={2.8 + fakeRandom(i) * 1.7} fill={bubbleColor} opacity={opacity} />
        );
      })}
    </>
  );
}
