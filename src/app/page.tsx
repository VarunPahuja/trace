export default function WorkspacePage() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] w-full mx-auto">
      {/* Left panel ~42%: editor + input + examples (wired in Phase 2) */}
      <section className="lg:w-[42%] flex flex-col gap-4">
        <div className="card-neo bg-editor-bg text-paper flex-1 min-h-[420px] flex items-center justify-center font-mono text-sm text-paper/60">
          editor coming in Phase 2
        </div>
        <div className="card-neo p-3 font-mono text-sm text-ink/50">input field — Phase 2</div>
        <button type="button" disabled className="btn-neo-accent opacity-50 cursor-not-allowed">
          Visualize
        </button>
      </section>

      {/* Right panel ~58%: visualization stage + controls (wired in Phase 2/3) */}
      <section className="lg:w-[58%] flex flex-col gap-4">
        <div className="card-neo flex-1 min-h-[420px] flex items-center justify-center font-body text-ink/50">
          visualization stage — Phase 2/3
        </div>
        <div className="card-neo p-3 font-body text-sm text-ink/50">control deck — Phase 2</div>
      </section>
    </div>
  );
}
