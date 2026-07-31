// Pyodide worker — master.md §7. Loaded from the CDN at runtime, never
// bundled (master.md §4/§7).
//
// Two environment quirks we work around here, both verified directly (not
// guessed) against this app's actual built output:
//
// 1. Turbopack bundles `new Worker(new URL(...), { type: "module" })` as a
//    classic worker at runtime regardless of the `type` option — confirmed
//    by probing `importScripts` from inside the running worker in both dev
//    and production builds. So this file must work under classic-worker
//    semantics even though it's written as an ES module.
// 2. Pyodide's bundle (both the .js and .mjs builds ship the same check)
//    self-detects "classic worker" by probing whether `importScripts` is
//    callable, and throws "Classic web workers are not supported" if so —
//    it now requires module-worker semantics. Since (1) means we're really
//    in a classic worker, we fetch pyodide.js's source ourselves and eval
//    it (it assigns its export via `globalThis.loadPyodide = ...`, so
//    indirect eval exposes it just the same as importScripts would), with
//    `importScripts` briefly shadowed to throw so Pyodide's self-check
//    reads the environment as a module worker — which is otherwise true
//    (real `self instanceof WorkerGlobalScope`, no DOM), so nothing else
//    about Pyodide's browser/worker detection is actually being misled.
//
// The tracer harness itself (public/tracer-harness.py) is fetched the same
// way rather than bundled via a JS import: a `?raw`/Turbopack `type: "raw"`
// import built fine but resolved to `undefined` at runtime in this worker's
// bundled output — fetching it as a static asset sidesteps that entirely.
import type { TraceResult } from "@/lib/trace/types";
import type { WorkerInboundMessage, WorkerOutboundMessage } from "@/lib/trace/workerProtocol";

// Loosely typed worker-global surface — avoids pulling in the "webworker"
// lib project-wide, which conflicts with the "dom" lib this project also
// needs (both declare incompatible globals like `self`/`postMessage`).
declare const self: {
  onmessage: ((event: { data: WorkerOutboundMessage }) => void) | null;
  postMessage: (message: WorkerInboundMessage) => void;
  loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  importScripts?: (...urls: string[]) => void;
};

const PYODIDE_VERSION = "314.0.3";
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PyodideInterface {
  runPython: (code: string) => unknown;
  globals: { get: (name: string) => (code: string) => string };
}

let pyodideReadyPromise: Promise<PyodideInterface> | null = null;

function initPyodide(): Promise<PyodideInterface> {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      const resp = await fetch(PYODIDE_CDN_BASE + "pyodide.js");
      if (!resp.ok) {
        throw new Error(`Failed to fetch pyodide.js: HTTP ${resp.status}`);
      }
      const scriptText = await resp.text();

      const originalImportScripts = self.importScripts;
      self.importScripts = () => {
        throw new Error("importScripts is not available in module workers");
      };
      try {
        // Trusted, version-pinned CDN source (not user input) — indirect
        // eval runs it in global scope so `globalThis.loadPyodide` gets set.
        (0, eval)(scriptText);
      } finally {
        self.importScripts = originalImportScripts;
      }

      if (!self.loadPyodide) {
        throw new Error("pyodide.js did not define loadPyodide");
      }
      const pyodide = await self.loadPyodide({ indexURL: PYODIDE_CDN_BASE });

      const harnessResp = await fetch("/tracer-harness.py");
      if (!harnessResp.ok) {
        throw new Error(`Failed to fetch tracer-harness.py: HTTP ${harnessResp.status}`);
      }
      const tracerHarnessSource = await harnessResp.text();
      pyodide.runPython(tracerHarnessSource);
      return pyodide;
    })();
  }
  return pyodideReadyPromise;
}

async function handleRun(requestId: number, code: string) {
  try {
    const pyodide = await initPyodide();
    const traceFn = pyodide.globals.get("__trace_run");
    const jsonStr = traceFn(code);
    const result = JSON.parse(jsonStr) as TraceResult;
    self.postMessage({ type: "result", requestId, result });
  } catch (err) {
    const result: TraceResult = {
      steps: [],
      truncated: false,
      error: { message: err instanceof Error ? err.message : String(err), line: null },
    };
    self.postMessage({ type: "result", requestId, result });
  }
}

self.onmessage = (event: { data: WorkerOutboundMessage }) => {
  const msg = event.data;
  if (msg.type === "run") {
    void handleRun(msg.requestId, msg.code);
  }
};

initPyodide()
  .then(() => self.postMessage({ type: "ready" }))
  .catch((err) => {
    self.postMessage({
      type: "fatal-error",
      message: err instanceof Error ? err.message : String(err),
    });
  });
