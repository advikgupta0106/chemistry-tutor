"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RotateCcw, WifiOff } from "lucide-react";
import type { BeakerView } from "@/lib/content";
import ReactionScene from "@/components/reaction-animation/ReactionScene";

const DURATION_MS = 4500;
// How long the animation holds on the final frame before looping back to
// the start — long enough that the end colour/bubble state is actually
// readable, not just flashed past.
const END_REST_MS = 1300;

export default function BeakerAnimation({ beakerView }: { beakerView: BeakerView }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const restTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // startLoop/stopLoop are called directly wherever the loop needs to
  // (re)start or halt — Replay and the mount effect both call startLoop,
  // rather than one of them going through `playing` and hoping the other
  // reacts to it. That matters specifically because `playing` no longer
  // flips back to false at the end of a cycle (the loop holds on the final
  // frame via restTimeoutRef, then resets and keeps going) — so once
  // playback has started, `playing` just stays true, and a `setPlaying(true)`
  // from Replay wouldn't retrigger a `[playing]`-dependent effect at all.
  // startLoop stops any existing chain first, so calling it is always safe
  // even if a loop (or a pending end-of-cycle reset) is already running.
  function stopLoop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (restTimeoutRef.current) clearTimeout(restTimeoutRef.current);
    rafRef.current = null;
    restTimeoutRef.current = null;
  }

  function startLoop() {
    stopLoop();
    function tick(now: number) {
      if (startRef.current === null) {
        startRef.current = now - progressRef.current * DURATION_MS;
      }
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / DURATION_MS);
      setProgress(p);
      progressRef.current = p;
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Hold on the final frame so the end state is actually readable,
        // then loop back to the start.
        restTimeoutRef.current = setTimeout(() => {
          startRef.current = null;
          progressRef.current = 0;
          setProgress(0);
          rafRef.current = requestAnimationFrame(tick);
        }, END_REST_MS);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    if (playing) startLoop();
    return stopLoop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Reduced motion: don't autoplay — show the finished state, and let the
  // student scrub or press Replay if they want to see it move.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      stopLoop();
      progressRef.current = 1;
      setProgress(1);
    }
  }, []);

  function handleReplay() {
    startRef.current = null;
    progressRef.current = 0;
    setProgress(0);
    setPlaying(true);
    startLoop();
  }

  function handleScrub(value: number) {
    setPlaying(false);
    stopLoop();
    startRef.current = null;
    progressRef.current = value;
    setProgress(value);
  }

  if (!beakerView?.animation) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-8 text-center">
        <WifiOff size={20} strokeWidth={1.5} className="text-text-dim" />
        <p className="text-xs text-text-dim">Animation data unavailable for this reaction.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mx-auto aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-xl bg-gradient-to-b from-bg to-surface-2">
        <svg viewBox="0 0 160 220" className="h-full w-full" role="img" aria-label={beakerView.observation}>
          <ReactionScene beakerView={beakerView} progress={progress} uid={uid} />
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

      <style jsx global>{`
        .anim-flicker {
          animation: anim-flicker 0.9s ease-in-out infinite;
        }
        .anim-flicker-fast {
          animation: anim-flicker-ragged 0.45s ease-in-out infinite;
        }
        .anim-pulse {
          animation: anim-pulse 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-flicker,
          .anim-flicker-fast,
          .anim-pulse {
            animation: none;
          }
        }
        @keyframes anim-flicker {
          0%,
          100% {
            transform: scaleY(1) scaleX(1);
          }
          50% {
            transform: scaleY(1.06) scaleX(0.96);
          }
        }
        @keyframes anim-flicker-ragged {
          0%,
          100% {
            transform: scaleY(1) scaleX(1) skewX(0deg);
          }
          33% {
            transform: scaleY(1.1) scaleX(0.92) skewX(3deg);
          }
          66% {
            transform: scaleY(0.95) scaleX(1.05) skewX(-3deg);
          }
        }
        @keyframes anim-pulse {
          0%,
          100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
