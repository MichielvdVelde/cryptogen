/**
 * Options for the token pool.
 */
export interface TokenPoolOptions {
  /** The maximum number of tokens to store in the pool. */
  maxSize: number;
  /** The byte length of each token. */
  tokenByteLength: number;
}

/**
 * A pool of tokens that can be used to generate cryptographically secure opaque tokens of a fixed length.
 */
export default class TokenPool extends EventTarget {
  /** The pool of tokens. */
  #pool: Uint8Array[] = [];
  /** The promise that refills the pool. */
  #pendingRefill: Promise<void> | null = null;
  /** The maximum number of tokens to store in the pool. */
  #maxSize: number;
  /** The byte length of each token. */
  #tokenByteLength: number;
  /** A flag to indicate an ongoing refill. */
  #isRefilling: boolean = false;

  /**
   * Create a new token pool.
   * @param options The options for the token pool.
   * @param options.maxSize The maximum number of tokens to store in the pool.
   * @param options.tokenByteLength The byte length of each token.
   */
  constructor(options: TokenPoolOptions) {
    super();
    this.#maxSize = options.maxSize;
    this.#tokenByteLength = options.tokenByteLength;
    this.#refill();
  }

  /**
   * The maximum number of tokens to store in the pool.
   *
   * If changed, the pool will be refilled with new tokens up to the new maximum size.
   * Tokens over the new maximum size will be kept until they are used.
   */
  get maxSize(): number {
    return this.#maxSize;
  }

  set maxSize(value: number) {
    if (value !== this.#maxSize) {
      this.#maxSize = value;
      this.#ensureRefill();
      this.dispatchEvent(new Event("maxsizechange"));
    }
  }

  /**
   * The current number of tokens in the pool.
   */
  get size(): number {
    return this.#pool.length;
  }

  /**
   * Whether the pool is currently refilling.
   */
  get refilling(): boolean {
    return this.#isRefilling;
  }

  /**
   * The promise that refills the pool, or `null` if the pool is not currently refilling.
   */
  get pendingRefill(): Promise<void> | null {
    return this.#pendingRefill;
  }

  /**
   * The byte length of each token.
   *
   * If changed, the pool array will be discarded and refilled with new tokens using the new byte length.
   */
  get tokenByteLength(): number {
    return this.#tokenByteLength;
  }

  set tokenByteLength(value: number) {
    if (value !== this.#tokenByteLength) {
      this.#tokenByteLength = value;
      this.#pool = [];
      this.#ensureRefill();
      this.dispatchEvent(new Event("tokenbytelengthchange"));
    }
  }

  /**
   * Get a token from the pool. If the pool is empty, wait for it to be refilled.
   */
  async getToken(): Promise<Uint8Array> {
    const pop = () => {
      const token = this.#pool.pop()!;
      this.dispatchEvent(new Event("tokenpop"));
      return token;
    };

    if (this.#pool.length) {
      return pop();
    }

    if (!this.#pendingRefill) {
      this.#pendingRefill = this.#refill();
    }

    await this.#pendingRefill;
    this.#pendingRefill = null;

    return pop();
  }

  /**
   * Refill the pool with new tokens.
   */
  async #refill(): Promise<void> {
    if (this.#isRefilling) return;

    this.#isRefilling = true;
    this.dispatchEvent(new Event("refilling"));

    try {
      const length = this.#maxSize - this.#pool.length;

      if (length) {
        const tokens = new Array(length).fill(null).map(() =>
          crypto.getRandomValues(new Uint8Array(this.#tokenByteLength))
        );

        this.#pool.push(...tokens);
      }
    } catch (error) {
      throw new AggregateError([error], "Failed to refill token pool");
    } finally {
      this.#isRefilling = false;
      this.dispatchEvent(new Event("refilled"));
    }
  }

  /**
   * Ensure that the pool is refilled if it is below the maximum size.
   */
  #ensureRefill(): void {
    if (this.#pool.length < this.#maxSize && !this.#isRefilling) {
      this.#pendingRefill = this.#refill();
    }
  }
}
