"use client";

import { useCallback, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import type { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTraceStore } from "@/lib/store/traceStore";
import { dispatchHighlightLine, lineHighlightExtension } from "@/lib/codemirror/lineHighlight";

export default function Editor() {
  const code = useTraceStore((s) => s.code);
  const setCode = useTraceStore((s) => s.setCode);
  const steps = useTraceStore((s) => s.steps);
  const currentStep = useTraceStore((s) => s.currentStep);
  const status = useTraceStore((s) => s.status);
  const errorLine = useTraceStore((s) => s.errorLine);

  const viewRef = useRef<EditorView | null>(null);

  const onCreateEditor = useCallback((view: EditorView) => {
    viewRef.current = view;
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (status === "error" && errorLine !== null) {
      dispatchHighlightLine(view, errorLine);
      return;
    }
    const line = steps[currentStep]?.line ?? null;
    dispatchHighlightLine(view, line);
  }, [steps, currentStep, status, errorLine]);

  return (
    <div className="card-neo overflow-hidden flex-1 min-h-[420px] flex flex-col">
      <CodeMirror
        value={code}
        height="100%"
        theme={oneDark}
        extensions={[python(), lineHighlightExtension()]}
        onChange={setCode}
        onCreateEditor={onCreateEditor}
        className="flex-1 text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono"
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false }}
      />
    </div>
  );
}
