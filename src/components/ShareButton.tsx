"use client";

import { useState } from "react";
import { useTraceStore } from "@/lib/store/traceStore";
import { encodeSharePayload } from "@/lib/share/sharePayload";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const code = useTraceStore((s) => s.code);
  const input = useTraceStore((s) => s.input);
  const activeExample = useTraceStore((s) => s.activeExample);

  async function handleShare() {
    const encoded = encodeSharePayload({ code, input, exampleId: activeExample?.id });
    const url = `${window.location.origin}/v?d=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — silently ignore, button remains usable
    }
  }

  return (
    <button type="button" onClick={handleShare} className="btn-neo-accent text-xs py-1.5">
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
