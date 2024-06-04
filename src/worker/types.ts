import type TokenPool from "../pool";
import type { WorkerMessage } from "../types";

/**
 * The handler context.
 */
export interface Context {
  /** The token pool. */
  pool: TokenPool;
}

/**
 * A message handler.
 * @template M The message type.
 */
export interface Handler<Message extends WorkerMessage = WorkerMessage> {
  /** The type of the message. */
  type: string;
  /**
   * Checks whether the message is of the correct type.
   * @param data The message data.
   */
  check(data: WorkerMessage): data is Message;
  /**
   * Handles the message.
   * @param payload The message payload.
   * @param context The handler context.
   */
  handle(payload: Message["payload"], context: Context): Promise<void>;
}
