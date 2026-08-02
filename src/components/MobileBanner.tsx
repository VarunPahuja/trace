"use client";

import { usePathname } from "next/navigation";

/** The landing page has nothing simplified on mobile — it's the same page
 * either way — so the "built for desktop" disclaimer would be confusing
 * copy there. Every other route (the actual workspace tooling) keeps it. */
export default function MobileBanner() {
  const isLanding = usePathname() === "/";
  if (isLanding) return null;

  return (
    <div className="sm:hidden border-b-2 border-ink bg-pop text-ink font-body text-sm px-4 py-2 text-center">
      TRACE is built for desktop — some features are simplified here.
    </div>
  );
}
