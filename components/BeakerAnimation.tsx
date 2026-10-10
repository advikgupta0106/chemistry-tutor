"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RotateCcw, WifiOff } from "lucide-react";
import type { BeakerView } from "@/lib/content";

const DURATION_MS = 4500;

// SVG beaker geometry (viewBox 0 0 160 220) — shared by every reaction so
// the "strip"/"granules"/bubble/particle helpers below can all assume the
// same coordinate space.
const BEAKER_LEFT = 30;
const BEAKER_RIGHT = 130;
const BEAKER_RIM_Y = 28;
const BEAKER_BOTTOM_Y = 185;
const BEAKER_PATH = `M${BEAKER_LEFT},${BEAKER_RIM_Y} L${BEAKER_LEFT},165 Q${BEAKER_LEFT},${BEAKER_BOTTOM_Y} 50,${BEAKER_BOTTOM_Y} L110,${BEAKER_BOTTOM_Y} Q${BEAKER_RIGHT},${BEAKER_BOTTOM_Y} ${BEAKER_RIGHT},165 L${BEAKER_RIGHT},${BEAKER_RIM_Y}`;
const LIQUID_TOP_Y = 85;
const SOLID_IN_LIQUID_Y = 138;
const SOLID_NO_LIQUID_Y = 158;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// Deterministic pseudo-random in [0, 1), seeded by index — avoids a real
// RNG so scrubbing to the same progress always renders identically, and
// avoids any hydration mismatch risk from Math.random().
function fakeRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const VIGOR_BUBBLE_COUNT: Record<string, number> = { vigorous: 8, moderate: 5, gentle: 3 };
// x1.5 over the original 1.6/1.1/0.7 — each bubble now completes roughly
// 2-3 rises across the animation instead of ~1, so there are more chances
// to catch one at peak opacity rather than relying on a single pass.
const VIGOR_SPEED: Record<string, number> = { vigorous: 2.4, moderate: 1.65, gentle: 1.05 };

export default function BeakerAnimation({ beakerView }: { beakerView: BeakerView }) {
  const clipId = useId();
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!playing) return;
    function tick(now: number) {
      if (startRef.current === null) {
        startRef.current = now - progressRef.current * DURATION_MS;
      }
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / DURATION_MS);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
        startRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  function handleReplay() {
    startRef.current = null;
    setProgress(0);
    setPlaying(true);
  }

  function handleScrub(value: number) {
    setPlaying(false);
    startRef.current = null;
    setProgress(value);
  }

  const colors = beakerView?.colors;
  if (!colors) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-8 text-center">
        <WifiOff size={20} strokeWidth={1.5} className="text-text-dim" />
        <p className="text-xs text-text-dim">Animation data unavailable for this reaction.</p>
      </div>
    );
  }

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
  // Consumed solids shrink toward nothing; unconsumed ones shrink only
  // slightly (just enough to read as "some of it reacted") and never
  // disappear.
  const solidScale = hasSolid ? (solidConsumed ? Math.max(1 - progress * 1.05, 0) : 1 - progress * 0.25) : 1;
  const solidOpacity = hasSolid ? (solidConsumed ? Math.max(1 - progress * 1.2, 0) : 1) : 0;

  const gas = beakerView.gas_evolution;
  const bubbleCount = gas.occurs ? VIGOR_BUBBLE_COUNT[gas.vigor ?? "gentle"] : 0;
  const bubbleSpeed = VIGOR_SPEED[gas.vigor ?? "gentle"];
  // Most gases are colourless, so the default translucent-white bubble is
  // correct far more often than not — only a handful of reactions (brown
  // NO2 fumes, pale yellow-green chlorine) set an explicit colour. Those
  // need a higher opacity ceiling too — at the same 0.6 peak as a plain
  // white bubble, a muted hue like brown or yellow-green reads as a grey
  // smudge rather than a distinct colour.
  const bubbleColor = gas.colour ?? "#f4f4f6";
  const bubbleOpacityPeak = gas.colour ? 0.9 : 0.6;
  const bubbleTopY = hasLiquid ? LIQUID_TOP_Y : BEAKER_RIM_Y - 18;
  const bubbleBottomY = hasSolid ? solidY : BEAKER_BOTTOM_Y - 10;

  const showPrecipitate = beakerView.precipitate.forms && colors.precipitate;
  const particleCount = 10;

  const style = colors.thermal_visual_style;
  const showSteam = style === "steam";
  const showGlow = style === "glow";
  const showFlame = style === "flame";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-xl bg-gradient-to-b from-bg to-surface-2">
        <svg viewBox="0 0 160 220" className="h-full w-full">
          {/* steam, drawn behind/above the beaker rim */}
          {showSteam &&
            [0, 1, 2].map((i) => {
              const delay = i * 0.12;
              const local = Math.max(0, Math.min(1, (progress - 0.15 - delay) / 0.7));
              if (local <= 0) return null;
              const x = 70 + i * 10;
              const y = BEAKER_RIM_Y - 4 - local * 30;
              const opacity = Math.sin(local * Math.PI) * 0.55;
              return (
                <path
                  key={i}
                  d={`M${x},${y} q4,-6 0,-12 q-4,-6 0,-12`}
                  stroke="#f4f4f6"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  fill="none"
                  opacity={opacity}
                />
              );
            })}

          {/* glow (thermite-style), drawn behind the beaker contents */}
          {showGlow && (
            <>
              <circle
                cx={80}
                cy={solidY}
                r={10 + progress * 34}
                fill="#ff8c3a"
                opacity={Math.max(0, progress - 0.25) * 0.5}
              />
              {progress > 0.45 &&
                [0, 1, 2, 3, 4].map((i) => {
                  const angle = (i / 5) * Math.PI * 2 + progress * 3;
                  const dist = 20 + fakeRandom(i) * 22 * Math.min(1, (progress - 0.45) / 0.4);
                  const x = 80 + Math.cos(angle) * dist;
                  const y = solidY - 10 + Math.sin(angle) * dist * 0.6;
                  return <circle key={i} cx={x} cy={y} r={1.6} fill="#ffd27a" opacity={0.85} />;
                })}
            </>
          )}

          {/* beaker outline */}
          <path d={BEAKER_PATH} fill="none" stroke="#2A2738" strokeWidth={2.5} />

          {/* liquid */}
          {hasLiquid && (
            <>
              <clipPath id={clipId}>
                <path d={BEAKER_PATH} />
              </clipPath>
              <rect
                x={BEAKER_LEFT}
                y={LIQUID_TOP_Y}
                width={BEAKER_RIGHT - BEAKER_LEFT}
                height={BEAKER_BOTTOM_Y - LIQUID_TOP_Y}
                fill={liquidColor}
                opacity={0.88}
                clipPath={`url(#${clipId})`}
              />
            </>
          )}

          {/* flame (no beaker contents at all for this case) */}
          {showFlame && (
            <g opacity={Math.min(1, progress / 0.15)} style={{ transformOrigin: "80px 150px" }}>
              <path
                d="M80,110 C95,130 95,150 80,165 C65,150 65,130 80,110 Z"
                fill="#5b8fe0"
                className="beaker-flame"
              />
              <path d="M80,130 C88,142 88,154 80,163 C72,154 72,142 80,130 Z" fill="#cfe3ff" opacity={0.8} />
            </g>
          )}

          {/* precipitate particles */}
          {showPrecipitate &&
            Array.from({ length: particleCount }).map((_, i) => {
              const appearAt = fakeRandom(i * 3.1) * 0.35;
              const local = Math.max(0, Math.min(1, (progress - appearAt) / (1 - appearAt)));
              const startX = BEAKER_LEFT + 15 + fakeRandom(i * 1.7) * (BEAKER_RIGHT - BEAKER_LEFT - 30);
              const startY = LIQUID_TOP_Y + 10 + fakeRandom(i * 2.3) * 40;
              const restY = BEAKER_BOTTOM_Y - 6 - fakeRandom(i * 4.1) * 6;
              const y = startY + (restY - startY) * local;
              return (
                <circle
                  key={i}
                  cx={startX}
                  cy={y}
                  r={1.8 + fakeRandom(i * 5.2) * 1.4}
                  fill={colors.precipitate!}
                  opacity={0.4 + local * 0.5}
                />
              );
            })}

          {/* the solid */}
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
              const x = 80 + Math.cos(angle) * dist;
              const y = solidY + Math.sin(angle) * dist * 0.5;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={5 * solidScale}
                  fill={solidColor}
                  opacity={solidOpacity}
                />
              );
            })}

          {/* gas bubbles */}
          {Array.from({ length: bubbleCount }).map((_, i) => {
            const phase = fakeRandom(i * 7.3);
            const cyclePos = (progress * bubbleSpeed + phase) % 1;
            const x = 70 + fakeRandom(i * 9.1) * 20;
            const y = bubbleBottomY - cyclePos * (bubbleBottomY - bubbleTopY);
            const fadeIn = Math.min(1, progress / 0.08);
            const opacity =
              fadeIn * (cyclePos < 0.1 ? cyclePos / 0.1 : cyclePos > 0.85 ? (1 - cyclePos) / 0.15 : 1) * bubbleOpacityPeak;
            return <circle key={i} cx={x} cy={y} r={2.8 + fakeRandom(i) * 1.7} fill={bubbleColor} opacity={opacity} />;
          })}
        </svg>
      </div>

      <p className="mt-3 text-sm text-text-dim">{beakerView.observation}</p>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleReplay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white"
          aria-label="Replay"
        >
          <RotateCcw size={14} strokeWidth={2} />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => handleScrub(Number(e.target.value))}
          aria-label="Scrub through the reaction"
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-2 accent-accent"
        />
      </div>

      <style jsx>{`
        .beaker-flame {
          animation: beaker-flicker 0.9s ease-in-out infinite;
          transform-origin: 80px 150px;
        }
        @media (prefers-reduced-motion: reduce) {
          .beaker-flame {
            animation: none;
          }
        }
        @keyframes beaker-flicker {
          0%,
          100% {
            transform: scaleY(1) scaleX(1);
          }
          50% {
            transform: scaleY(1.06) scaleX(0.96);
          }
        }
      `}</style>
    </div>
  );
}
