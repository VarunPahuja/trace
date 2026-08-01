"use client";

import { useTrackerStore } from "@/lib/store/trackerStore";

/** Phase 8: one-time prompt on first sign-in when the browser has local
 * entries and the (empty) cloud tracker hasn't been asked about them yet.
 * Shows exactly once ever, regardless of which button gets clicked. */
export default function ImportPromptModal() {
  const importPrompt = useTrackerStore((s) => s.importPrompt);
  const importing = useTrackerStore((s) => s.importing);
  const confirmImport = useTrackerStore((s) => s.confirmImport);
  const dismissImportPrompt = useTrackerStore((s) => s.dismissImportPrompt);

  if (!importPrompt) return null;
  const count = importPrompt.localEntries.length;

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4">
      <div className="card-neo bg-paper p-5 w-full max-w-sm flex flex-col gap-3 text-center">
        <div className="font-display uppercase text-lg">Bring your problems along?</div>
        <p className="font-body text-sm text-ink/70">
          You&apos;ve got {count} problem{count === 1 ? "" : "s"} logged on this device. Import
          {count === 1 ? " it" : " them"} into your account so they follow you everywhere?
        </p>
        <div className="flex gap-2 justify-center mt-1">
          <button
            type="button"
            onClick={dismissImportPrompt}
            disabled={importing}
            className="btn-neo text-xs py-1.5 disabled:opacity-40"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void confirmImport()}
            disabled={importing}
            className="btn-neo-accent text-xs py-1.5 disabled:opacity-40"
          >
            {importing ? "Importing…" : `Import ${count === 1 ? "it" : "them"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
