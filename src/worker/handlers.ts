import { isTokenRequest } from "../type-guards";
import type { TokenRequest, TokenResponse, WorkerError } from "../types";
import type { Handler } from "./types";
import { dispatch } from "./util";

/**
 * A message handler for token requests. Handles the generation of tokens
 * using a token pool. The type is `token-request`.
 *
 * This handler generates tokens and sends them back to the main thread,
 * along with the duration of the operation. If an error occurs, it sends
 * an error message instead.
 */
export const tokenRequest: Handler<TokenRequest> = {
  type: "token-request",
  check: isTokenRequest,
  handle: async ({ id, count }, { pool }) => {
    if (!Number.isSafeInteger(count)) {
      throw new RangeError("Count must be a safe integer");
    } else if (count <= 0) {
      throw new RangeError("Count must be greater than zero");
    }

    const tokens: Uint8Array[] = [];
    const start = performance.now();

    try {
      for (let i = 0; i < count; i++) {
        tokens.push(await pool.getToken());
      }

      dispatch<TokenResponse>({
        type: "token-response",
        payload: {
          id,
          tokens,
          duration: performance.now() - start,
        },
      }, tokens);
    } catch (error: any) {
      type Meta = { id: number };

      dispatch<WorkerError<Meta>>({
        type: "token-response",
        error: true,
        payload: error.message ?? String(error),
        meta: { id },
      });
    }
  },
};
