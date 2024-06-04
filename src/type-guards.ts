import type {
  ReadyMessage,
  TokenRequest,
  TokenResponse,
  WorkerError,
} from "./types";

/**
 * Check if a value is a "ready" message.
 * @param value The value to check.
 */
export function isReadyMessage(value: unknown): value is ReadyMessage {
  return typeof value === "object" && value !== null &&
    (value as ReadyMessage).type === "ready";
}

/**
 * Check if a value is a worker error message.
 * @param value The value to check.
 */
export function isWorkerError(value: unknown): value is WorkerError {
  return typeof value === "object" && value !== null &&
    (value as WorkerError).error === true;
}

/**
 * Check if a value is a token request message.
 * @param value The value to check.
 */
export function isTokenRequest(value: unknown): value is TokenRequest {
  return typeof value === "object" && value !== null &&
    (value as TokenRequest).type === "token-request";
}

/**
 * Check if a value is a token response message.
 * @param value The value to check.
 */
export function isTokenResponse(
  value: unknown,
  id?: number,
): value is TokenResponse {
  return typeof value === "object" && value !== null &&
    (value as TokenResponse).type === "token-response" &&
    (id === undefined || (value as TokenResponse).payload.id === id);
}
