"use client";

import { useTraceStore } from "@/lib/store/traceStore";
import { resolveScene, type RendererSpec } from "@/lib/renderers/registry";
import ArrayRenderer from "./renderers/ArrayRenderer";
import HashMapRenderer from "./renderers/HashMapRenderer";
import StackRenderer from "./renderers/StackRenderer";
import WindowOverlay from "./renderers/WindowOverlay";
import LinkedListRenderer from "./renderers/LinkedListRenderer";
import TreeRenderer from "./renderers/TreeRenderer";
import GridRenderer from "./renderers/GridRenderer";
import GraphRenderer from "./renderers/GraphRenderer";
import IntervalRenderer from "./renderers/IntervalRenderer";
import BitsRenderer from "./renderers/BitsRenderer";
import CallTreeRenderer from "./renderers/CallTreeRenderer";
import TrieRenderer from "./renderers/TrieRenderer";
import HeapRenderer from "./renderers/HeapRenderer";

function renderSpec(spec: RendererSpec, key: string) {
  switch (spec.kind) {
    case "array":
      return (
        <ArrayRenderer
          key={key}
          varName={spec.varName}
          dimRangeStartVar={spec.dimRangeStartVar}
          dimRangeEndVar={spec.dimRangeEndVar}
          overlay={
            spec.windowStartVar || spec.windowEndVar ? (
              <WindowOverlay startVar={spec.windowStartVar} endVar={spec.windowEndVar} />
            ) : undefined
          }
        />
      );
    case "hashmap":
      return <HashMapRenderer key={key} varName={spec.varName} />;
    case "stack":
      return <StackRenderer key={key} varName={spec.varName} />;
    case "linkedlist":
      return <LinkedListRenderer key={key} headVars={spec.headVars} pointerVars={spec.pointerVars} />;
    case "tree":
      return <TreeRenderer key={key} rootVars={spec.rootVars} pointerVars={spec.pointerVars} />;
    case "grid":
      return <GridRenderer key={key} varName={spec.varName} rowVar={spec.rowVar} colVar={spec.colVar} />;
    case "graph":
      return (
        <GraphRenderer
          key={key}
          graphVar={spec.graphVar}
          visitedVar={spec.visitedVar}
          pointerVars={spec.pointerVars}
          distanceVar={spec.distanceVar}
        />
      );
    case "interval":
      return <IntervalRenderer key={key} varName={spec.varName} />;
    case "bits":
      return <BitsRenderer key={key} varNames={spec.varNames} />;
    case "calltree":
      return <CallTreeRenderer key={key} />;
    case "trie":
      return <TrieRenderer key={key} rootVars={spec.rootVars} pointerVars={spec.pointerVars} />;
    case "heap":
      return <HeapRenderer key={key} varName={spec.varName} />;
    default:
      return null;
  }
}

export default function VisualizationStage() {
  const status = useTraceStore((s) => s.status);
  const errorMessage = useTraceStore((s) => s.errorMessage);
  const truncated = useTraceStore((s) => s.truncated);
  const meta = useTraceStore((s) => s.meta);
  const steps = useTraceStore((s) => s.steps);
  const visualize = useTraceStore((s) => s.visualize);

  const scene = resolveScene(meta);

  if (status === "idle" && steps.length === 0) {
    return (
      <div className="flex-1 min-h-[420px] flex items-center justify-center font-body text-ink/50">
        paste code and press Visualize
      </div>
    );
  }
  if (status === "preprocessing") {
    return (
      <div className="flex-1 min-h-[420px] flex items-center justify-center font-body text-ink/60">
        reading your code…
      </div>
    );
  }
  if (status === "warming") {
    return (
      <div className="flex-1 min-h-[420px] flex items-center justify-center font-body text-ink/60">
        warming up the python engine…
      </div>
    );
  }
  if (status === "running") {
    return (
      <div className="flex-1 min-h-[420px] flex items-center justify-center font-body text-ink/60">
        tracing…
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex-1 min-h-[420px] flex items-center justify-center p-6">
        <div className="border-4 border-alarm shadow-neo rounded-[14px] bg-alarm/10 p-4 max-w-md text-center flex flex-col items-center gap-3">
          <div className="font-display uppercase text-alarm">Couldn&apos;t run that</div>
          <div className="font-mono text-sm text-ink/80 whitespace-pre-wrap">{errorMessage}</div>
          <button type="button" onClick={() => void visualize()} className="btn-neo text-xs py-1.5">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (scene.primary.length === 0 && scene.secondary.length === 0) {
    return (
      <div className="flex-1 min-h-[420px] flex items-center justify-center font-body text-ink/50 p-6 text-center">
        no renderer matched this trace yet — check the variables strip below
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[420px] flex flex-col gap-6 p-6 overflow-auto">
      {truncated && (
        <div className="border-neo shadow-neo-sm rounded-lg bg-pop/20 px-3 py-2 text-xs font-mono">
          trace truncated — try a smaller input
        </div>
      )}
      <div className="flex flex-col gap-6">{scene.primary.map((spec, i) => renderSpec(spec, `p-${i}`))}</div>
      {scene.secondary.length > 0 && (
        <div className="flex flex-col gap-4 border-t-2 border-ink/10 pt-4">
          {scene.secondary.map((spec, i) => renderSpec(spec, `s-${i}`))}
        </div>
      )}
    </div>
  );
}
