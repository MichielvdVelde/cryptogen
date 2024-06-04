import type { MetaMessage, TokenRequest } from "./types";
import { isReadyMessage, isTokenResponse, isWorkerError } from "./type-guards";

/**
 * Factory function for generating unique IDs.
 * @param start The starting ID.
 * @throws {RangeError} If the start value is less than zero.
 * @throws {RangeError} If the start value is not a safe integer.
 * @returns A function that generates a unique ID.
 */
export function idGenerator(start = 0): () => number {
  if (!Number.isSafeInteger(start)) {
    throw new RangeError("Start must be a safe integer");
  } else if (start < 0) {
    throw new RangeError("Start must be greater than or equal to zero");
  }

  let id = start;

  return () => {
    if (id >= Number.MAX_SAFE_INTEGER) {
      id = start;
    } else {
      id++;
    }

    return id;
  };
}

/**
 * Wait for a worker to become ready.
 * @param worker The worker to wait for.
 */
export async function waitForReady(worker: Worker): Promise<void> {
  return new Promise((resolve, reject) => {
    const removeListeners = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };

    const onMessage = ({ data }: MessageEvent<unknown>) => {
      if (isReadyMessage(data)) {
        removeListeners();
        resolve();
      } else if (isWorkerError(data)) {
        removeListeners();
        reject(new Error(data.payload));
      }
    };

    const onError = ({ error }: ErrorEvent) => {
      removeListeners();
      reject(error);
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
  });
}

/**
 * Generate a number of tokens using a worker.
 * @param worker The worker to use for generating tokens.
 * @param id The ID of the token request.
 * @param count The number of tokens to generate (default is 1).
 * @returns A promise that resolves with the generated tokens and the duration of the operation.
 */
export async function generateTokens(
  worker: Worker,
  id: number,
  count = 1,
): Promise<[Uint8Array[], number]> {
  if (!Number.isSafeInteger(count)) {
    throw new RangeError("Count must be a safe integer");
  } else if (count <= 0) {
    throw new RangeError("Count must be greater than zero");
  }

  return new Promise<[Uint8Array[], number]>((resolve, reject) => {
    const request: TokenRequest = {
      type: "token-request",
      payload: { id, count },
    };

    const removeEventListeners = () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };

    const onMessage = ({ data }: MessageEvent<unknown>) => {
      if (isWorkerError(data)) {
        type Meta = { id: number };

        const { id: metaId } = (data as MetaMessage<string, Meta>).meta;

        if (id === metaId) {
          removeEventListeners();
          reject(new Error(data.payload));
        }
      } else if (isTokenResponse(data, id)) {
        removeEventListeners();

        const { tokens, duration } = data.payload;
        resolve([tokens, duration]);
      }
    };

    const onError = (event: ErrorEvent) => {
      removeEventListeners();
      reject(event.error);
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage(request);
  });
}
