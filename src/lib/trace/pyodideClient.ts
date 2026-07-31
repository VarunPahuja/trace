"use client";

import type { TraceResult } from "./types";
import type { WorkerInboundMessage } from "./workerProtocol";

export type PyodideClientStatus = "idle" | "loading" | "ready" | "error";

interface PendingRequest {
  resolve: (result: TraceResult) => void;
}

class PyodideClient {
  private worker: Worker | null = null;
  private status: PyodideClientStatus = "idle";
  private readyListeners: Array<() => void> = [];
  private errorListeners: Array<(message: string) => void> = [];
  private pending = new Map<number, PendingRequest>();
  private nextRequestId = 1;

  getStatus() {
    return this.status;
  }

  onReady(listener: () => void) {
    this.readyListeners.push(listener);
    return () => {
      this.readyListeners = this.readyListeners.filter((l) => l !== listener);
    };
  }

  onError(listener: (message: string) => void) {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener);
    };
  }

  /** Lazily spins up the worker on first call — never on page load (§17). */
  ensureStarted() {
    if (this.worker) return;
    this.status = "loading";
    // Turbopack bundles this as a classic worker regardless of a `type`
    // option here (verified against dev and prod builds) — pyodideWorker.ts
    // is written accordingly. See the comment at its top for details.
    this.worker = new Worker(new URL("../../workers/pyodideWorker.ts", import.meta.url));
    this.worker.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
      const msg = event.data;
      if (msg.type === "ready") {
        this.status = "ready";
        this.readyListeners.forEach((l) => l());
      } else if (msg.type === "result") {
        const pending = this.pending.get(msg.requestId);
        if (pending) {
          this.pending.delete(msg.requestId);
          pending.resolve(msg.result);
        }
      } else if (msg.type === "fatal-error") {
        this.status = "error";
        this.errorListeners.forEach((l) => l(msg.message));
      }
    };
    this.worker.onerror = (event: ErrorEvent) => {
      this.status = "error";
      this.errorListeners.forEach((l) => l(event.message));
    };
  }

  runTrace(code: string): Promise<TraceResult> {
    this.ensureStarted();
    const requestId = this.nextRequestId++;
    return new Promise((resolve) => {
      this.pending.set(requestId, { resolve });
      this.worker!.postMessage({ type: "run", requestId, code });
    });
  }
}

let singleton: PyodideClient | null = null;

export function getPyodideClient(): PyodideClient {
  if (!singleton) singleton = new PyodideClient();
  return singleton;
}
