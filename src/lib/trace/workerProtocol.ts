// Message protocol between the main thread and the Pyodide worker.
import type { TraceResult } from "./types";

export interface WorkerRunRequest {
  type: "run";
  requestId: number;
  code: string;
}

export type WorkerOutboundMessage = WorkerRunRequest;

export interface WorkerReadyMessage {
  type: "ready";
}

export interface WorkerResultMessage {
  type: "result";
  requestId: number;
  result: TraceResult;
}

export interface WorkerFatalErrorMessage {
  type: "fatal-error";
  message: string;
}

export type WorkerInboundMessage =
  | WorkerReadyMessage
  | WorkerResultMessage
  | WorkerFatalErrorMessage;
