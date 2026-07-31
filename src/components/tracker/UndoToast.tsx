"use client";

import { useTrackerStore } from "@/lib/store/trackerStore";

export default function UndoToast() {
  const pendingDelete = useTrackerStore((s) => s.pendingDelete);
  const undoDelete = useTrackerStore((s) => s.undoDelete);
  const dismissUndo = useTrackerStore((s) => s.dismissUndo);

  if (!pendingDelete) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 card-neo bg-ink text-paper px-4 py-2 flex items-center gap-3 font-mono text-xs">
      <span>Deleted &quot;{pendingDelete.entry.name}&quot;</span>
      <button type="button" onClick={undoDelete} className="underline text-pop">
        Undo
      </button>
      <button type="button" onClick={dismissUndo} className="text-paper/50">
        ✕
      </button>
    </div>
  );
}
