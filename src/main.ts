import type { CreateWorkerFn, Cryptogen } from "./types";
import { generateTokens, idGenerator, waitForReady } from "./util";

/**
 * Create a new worker instance.
 */
function createWorker(): Worker {
  return new Worker(new URL("./worker/worker.ts", import.meta.url), {
    type: "module",
  });
}

/**
 * Create a new cryptogen instance.
 * @param create A function that creates a new worker instance. Defaults to the default worker creator.
 * @returns A promise that resolves with a new cryptogen instance.
 */
export default async function cryptoGen(
  create: CreateWorkerFn = createWorker,
): Promise<Cryptogen> {
  const worker = create();

  try {
    await waitForReady(worker);
  } catch (error) {
    worker.terminate();
    throw new AggregateError([error], "Failed to initialize worker");
  }

  const id = idGenerator();

  return {
    worker,
    get: (count = 1) => generateTokens(worker, id(), count),
  };
}
