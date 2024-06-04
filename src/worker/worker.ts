/// <reference lib="webworker" />

import type { ReadyMessage } from "../types";
import { dispatch } from "./util";
import { addHandler, createMessageHandler } from "./handler";
import { tokenRequest } from "./handlers";
import TokenPool from "../pool";

// Create a token pool instance
const pool = new TokenPool({
  maxSize: 100,
  tokenByteLength: 32,
});

// Add the message handlers
addHandler(tokenRequest);

// Handle messages from the main thread
self.addEventListener("message", createMessageHandler({ pool }));

// Let the main thread know that the worker is ready
dispatch<ReadyMessage>({ type: "ready" });
