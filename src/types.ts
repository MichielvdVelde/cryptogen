/**
 * A cryptographically secure token generator.
 */
export interface Cryptogen {
  /**
   * The worker used for generating tokens.
   */
  worker: Worker;
  /**
   * Get a number of tokens. The tokens are generated asynchronously using a worker,
   * so this method returns a promise that resolves with the generated tokens and the duration of the operation.
   * @param count The number of tokens to generate. Defaults to `1`.
   * @returns A promise that resolves with the generated tokens and the duration of the operation.
   */
  get: (count?: number) => Promise<[Uint8Array[], number]>;
}

/**
 * A function that creates a new worker instance.
 */
export type CreateWorkerFn = () => Worker;

/**
 * A worker message.
 */
export interface WorkerMessage<Payload = unknown, Meta = unknown> {
  /** The type of the message. */
  type: string;
  /** The payload of the message. */
  payload?: Payload;
  /** Whether the message is an error. */
  error?: boolean;
  /** Additional metadata. */
  meta?: Meta;
}

/**
 * A message sent by the worker to indicate that it is ready to receive messages.
 */
export interface ReadyMessage extends WorkerMessage {
  type: "ready";
}

/**
 * A message sent by the worker to indicate an error.
 */
export interface WorkerError<Meta = unknown> extends MetaMessage<string, Meta> {
  error: true;
  payload: string;
}

/**
 * A message with additional metadata.
 */
export interface MetaMessage<Payload = unknown, Meta = unknown>
  extends WorkerMessage<Payload, Meta> {
  meta: Meta;
}

/**
 * A message sent by the worker to request tokens.
 */
export interface TokenRequest extends WorkerMessage {
  type: "token-request";
  payload: {
    /** The ID of the token request. */
    id: number;
    /** The number of tokens to generate. */
    count: number;
  };
}

/**
 * A message sent by the worker in response to a token request.
 */
export interface TokenResponse extends WorkerMessage {
  type: "token-response";
  payload: {
    /** The ID of the token request. */
    id: number;
    /** The generated tokens. */
    tokens: Uint8Array[];
    /** The duration of the operation. */
    duration: number;
  };
}
