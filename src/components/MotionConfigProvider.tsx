"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** master.md §12: "Respect prefers-reduced-motion: cut springs to fades."
 * The CSS `prefers-reduced-motion` block in globals.css only catches real
 * CSS transitions/animations — Framer Motion's spring/layout animations
 * are driven by JS (inline transforms via requestAnimationFrame), so they
 * need this separately. `reducedMotion="user"` respects the OS setting
 * automatically across every motion component in the tree. */
export default function MotionConfigProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
