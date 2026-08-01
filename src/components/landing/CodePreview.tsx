interface CodePreviewProps {
  code: string;
  currentLine: number | null;
}

/** Static, read-only code display for the landing page's demo — deliberately
 * NOT CodeMirror (master.md-adjacent Phase 7 brief: "landing page must be
 * fast: no Pyodide, no CodeMirror in its bundle"). Just enough syntax
 * dressing (line numbers, current-line tint) to read as "the editor" at a
 * glance without pulling in the real editor's dependency weight. */
export default function CodePreview({ code, currentLine }: CodePreviewProps) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className="bg-editor-bg rounded-[14px] border-neo shadow-neo overflow-hidden">
      <pre className="font-mono text-xs sm:text-sm leading-relaxed py-3 overflow-x-auto">
        {lines.map((line, i) => {
          const lineNo = i + 1;
          const isActive = currentLine === lineNo;
          return (
            <div
              key={i}
              className={`px-4 flex gap-4 ${isActive ? "bg-accent/25 border-l-4 border-accent" : "border-l-4 border-transparent"}`}
            >
              <span className="text-white/25 select-none w-4 text-right shrink-0">{lineNo}</span>
              <span className="text-white/85 whitespace-pre">{line || " "}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
