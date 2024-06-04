import type { WorkerMessage } from "../types";
import type { Context, Handler } from "./types";

/** A map of message handlers. */
const handlers = new Map<string, Handler>();

/**
 * Adds a message handler.
 * @param handler The message handler.
 */
export function addHandler<M extends WorkerMessage>(handler: Handler<M>) {
  handlers.set(handler.type, handler);
}

/**
 * Creates a message handler.
 * @param context The handler context.
 */
export function createMessageHandler(context: Context) {
  return async function messageHandler({ data }: MessageEvent<WorkerMessage>) {
    const handler = handlers.get(data.type);

    if (handler?.check(data)) {
      try {
        await handler.handle(data.payload, context);
      } catch (error) {
        // TODO: Log the error
      }
    }
  };
}
