/// <reference lib="webworker" />

import type { WorkerMessage } from "../types";

/**
 * Dispatch a message to the main thread.
 * @param message The message to dispatch.
 * @param transfer An optional list of transferable objects.
 */
export function dispatch<M extends WorkerMessage>(
  message: M,
  transfer?: Transferable[],
): void {
  self.postMessage(message, { transfer });
}
