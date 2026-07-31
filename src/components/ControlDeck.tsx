"use client";

import { useMemo } from "react";
import { useTraceStore } from "@/lib/store/traceStore";
import { usePlaybackTicker } from "@/lib/store/usePlaybackTicker";
import { SPEEDS } from "@/lib/store/playbackSpeeds";

export default function ControlDeck() {
  usePlaybackTicker();

  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const playing = useTraceStore((s) => s.playing);
  const speed = useTraceStore((s) => s.speed);
  const play = useTraceStore((s) => s.play);
  const pause = useTraceStore((s) => s.pause);
  const stepForward = useTraceStore((s) => s.stepForward);
  const stepBack = useTraceStore((s) => s.stepBack);
  const seek = useTraceStore((s) => s.seek);
  const setSpeed = useTraceStore((s) => s.setSpeed);

  const hasTrace = steps.length > 0;
  const maxIndex = Math.max(steps.length - 1, 0);

  const tickPositions = useMemo(
    () =>
      steps
        .map((step, i) => ({ i, event: step.event }))
        .filter((s) => s.event === "call" || s.event === "return"),
    [steps],
  );

  return (
    <div className="card-neo p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasTrace}
          onClick={stepBack}
          className="btn-neo text-xs py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Step back"
        >
          ◀◀
        </button>
        <button
          type="button"
          disabled={!hasTrace}
          onClick={() => (playing ? pause() : play())}
          className="btn-neo-accent text-xs py-1 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "PAUSE" : "PLAY"}
        </button>
        <button
          type="button"
          disabled={!hasTrace}
          onClick={stepForward}
          className="btn-neo text-xs py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Step forward"
        >
          ▶▶
        </button>

        <div className="flex items-center gap-1 ml-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`font-mono text-xs px-2 py-1 rounded border-2 border-ink press-neo ${
                speed === s ? "bg-accent text-paper" : "bg-paper text-ink"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <span className="font-mono text-xs text-ink/60 ml-auto">
          {hasTrace ? `${currentStep + 1} / ${steps.length}` : "0 / 0"}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={0}
          max={maxIndex}
          value={currentStep}
          disabled={!hasTrace}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full accent-accent disabled:opacity-40"
          aria-label="Scrub timeline"
        />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-1">
          {tickPositions.map(({ i, event }) => (
            <div
              key={i}
              className={`absolute top-0 w-0.5 h-2 -translate-y-1/2 ${
                event === "call" ? "bg-go" : "bg-alarm"
              }`}
              style={{ left: `${maxIndex === 0 ? 0 : (i / maxIndex) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
