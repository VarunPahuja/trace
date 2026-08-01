"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTraceStore } from "@/lib/store/traceStore";
import { decodeSharePayload, type SharePayload } from "@/lib/share/sharePayload";
import { EXAMPLES } from "@/lib/examples";

interface ShareLinkLoaderProps {
  encoded: string | null;
}

/** master.md §15: decode, load code+input (or the matching built-in
 * example's verified meta — no API call), auto-run, then hand off to the
 * workspace at "/app" (Phase 7 moved the workspace off "/", which is now
 * the landing page). Malformed/oversized payloads get a designed error
 * with an escape hatch instead of crashing. */
export default function ShareLinkLoader({ encoded }: ShareLinkLoaderProps) {
  const router = useRouter();
  // Pure function of the prop — computed directly during render rather
  // than via setState-in-an-effect (which would trigger a redundant
  // cascading render for what's really just derived state).
  const payload: SharePayload | null = encoded ? decodeSharePayload(encoded) : null;

  useEffect(() => {
    if (!payload) return;

    const store = useTraceStore.getState();
    const matchedExample = payload.exampleId ? EXAMPLES.find((e) => e.id === payload.exampleId) : undefined;
    if (matchedExample) {
      store.loadExample(matchedExample);
    } else {
      store.setCode(payload.code);
      store.setInput(payload.input);
    }

    router.replace("/app");
    void useTraceStore.getState().visualize();
    // payload is derived fresh from `encoded` each render; re-running this
    // effect should track that source, not a new object identity each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encoded, router]);

  if (!payload) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card-neo p-6 max-w-md text-center flex flex-col gap-3 items-center">
          <div className="font-display uppercase text-alarm">Broken share link</div>
          <p className="font-body text-sm text-ink/70">
            This link couldn&apos;t be read — it may be malformed, too old, or too large.
          </p>
          <Link href="/app" className="btn-neo-accent text-xs py-1.5">
            Start fresh
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="card-neo p-6 font-body text-ink/60">loading shared trace…</div>
    </div>
  );
}
