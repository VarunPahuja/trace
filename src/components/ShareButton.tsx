"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
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
