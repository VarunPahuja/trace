"use client";

import { useTrackerStore } from "@/lib/store/trackerStore";

export default function TrackerExportButton() {
  const entries = useTrackerStore((s) => s.entries);

  function handleExport() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trace-tracker-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={handleExport} className="btn-neo text-xs py-1.5">
      Export JSON
    </button>
  );
}
