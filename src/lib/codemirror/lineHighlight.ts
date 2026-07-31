import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView } from "@codemirror/view";

export const setHighlightedLine = StateEffect.define<number | null>();

const lineHighlightMark = Decoration.line({ attributes: { class: "cm-current-line-trace" } });

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    let deco = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlightedLine)) {
        if (effect.value === null || effect.value < 1 || effect.value > tr.state.doc.lines) {
          deco = Decoration.none;
        } else {
          const line = tr.state.doc.line(effect.value);
          deco = Decoration.set([lineHighlightMark.range(line.from)]);
        }
      }
    }
    return deco;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const highlightTheme = EditorView.baseTheme({
  ".cm-current-line-trace": {
    backgroundColor: "rgba(79, 70, 229, 0.22)",
    borderLeft: "3px solid #4F46E5",
  },
});

export function lineHighlightExtension() {
  return [highlightField, highlightTheme];
}

/** Highlights `line` (1-based) and auto-scrolls it into view; pass null to clear. */
export function dispatchHighlightLine(view: EditorView, line: number | null) {
  if (line === null || line < 1 || line > view.state.doc.lines) {
    view.dispatch({ effects: setHighlightedLine.of(null) });
    return;
  }
  const linePos = view.state.doc.line(line).from;
  view.dispatch({
    effects: [setHighlightedLine.of(line), EditorView.scrollIntoView(linePos, { y: "center" })],
  });
}
