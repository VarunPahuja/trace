"use client";

import Editor from "@/components/Editor";
import ExamplesDrawer from "@/components/ExamplesDrawer";
import IntuitionCard from "@/components/IntuitionCard";
import VisualizeButton from "@/components/VisualizeButton";
import VisualizationStage from "@/components/VisualizationStage";
import ControlDeck from "@/components/ControlDeck";
import VariablesStrip from "@/components/VariablesStrip";
import { useTraceStore } from "@/lib/store/traceStore";
import { useKeyboardShortcuts } from "@/lib/store/useKeyboardShortcuts";

export default function WorkspacePage() {
  useKeyboardShortcuts();
  const input = useTraceStore((s) => s.input);
  const setInput = useTraceStore((s) => s.setInput);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] w-full mx-auto">
      {/* Left panel ~42%: editor + input + examples */}
      <section className="lg:w-[42%] flex flex-col gap-4">
        <Editor />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="input (informational — edit code directly to change values)"
          className="card-neo p-3 font-mono text-sm text-ink placeholder:text-ink/40 outline-none"
        />
        <VisualizeButton />
        <ExamplesDrawer />
        <IntuitionCard />
      </section>

      {/* Right panel ~58%: visualization stage + controls + variables */}
      <section className="lg:w-[58%] flex flex-col gap-4">
        <div className="card-neo flex-1 min-h-[420px] flex flex-col">
          <VisualizationStage />
        </div>
        <ControlDeck />
        <VariablesStrip />
      </section>
    </div>
  );
}
