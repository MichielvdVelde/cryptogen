# TokenPool API Documentation

## `TokenPoolOptions`

Options for configuring the `TokenPool`.

### Properties

- **`maxSize`**: `number`\
  The maximum number of tokens to store in the pool.

- **`tokenByteLength`**: `number`\
  The byte length of each token.

## `TokenPool`

A pool of tokens that can be used to generate cryptographically secure opaque
tokens of a fixed length.

### Constructor

#### `new TokenPool(options: TokenPoolOptions)`

Creates a new token pool.

- **`options`**: `TokenPoolOptions`\
  The options for the token pool.

### Properties

- **`maxSize`**: `number`\
  The maximum number of tokens to store in the pool.
  - **Getter**: Returns the current maximum size.
  - **Setter**: If changed, the pool will be refilled with new tokens up to the
    new maximum size. Tokens over the new maximum size will be kept until they
    are used.
  - **Event**: Dispatches a `"maxsizechange"` event when the value changes.

- **`size`**: `number`\
  The current number of tokens in the pool.

- **`refilling`**: `boolean`\
  Whether the pool is currently refilling.

- **`pendingRefill`**: `Promise<void> | null`\
  The promise that refills the pool, or `null` if the pool is not currently
  refilling.

- **`tokenByteLength`**: `number`\
  The byte length of each token.
  - **Getter**: Returns the current byte length of each token.
  - **Setter**: If changed, the pool array will be discarded and refilled with
    new tokens using the new byte length.
  - **Event**: Dispatches a `"tokenbytelengthchange"` event when the value
    changes.

### Methods

- **`getToken(): Promise<Uint8Array>`**\
  Get a token from the pool. If the pool is empty, wait for it to be refilled.
  - **Returns**: `Promise<Uint8Array>`\
    A promise that resolves to a `Uint8Array` representing the token.
  - **Event**: Dispatches a `"tokenpop"` event when a token is retrieved from
    the pool.

### Events

- **`"maxsizechange"`**\
  Dispatched when the `maxSize` property changes.

- **`"tokenbytelengthchange"`**\
  Dispatched when the `tokenByteLength` property changes.

- **`"tokenpop"`**\
  Dispatched when a token is retrieved from the pool.

- **`"refilling"`**\
  Dispatched when the pool starts refilling.

- **`"refilled"`**\
  Dispatched when the pool has been refilled.

### Private Methods

- **`#refill(): Promise<void>`**\
  Refill the pool with new tokens.
  - **Event**: Dispatches a `"refilling"` event when the refill starts and a
    `"refilled"` event when the refill completes.

- **`#ensureRefill(): void`**\
  Ensure that the pool is refilled if it is below the maximum size.

### Example Usage

```ts
const pool = new TokenPool({ maxSize: 100, tokenByteLength: 16 });

pool.addEventListener("maxsizechange", () => {
  console.log("Max size changed to", pool.maxSize);
});

pool.addEventListener("tokenbytelengthchange", () => {
  console.log("Token byte length changed to", pool.tokenByteLength);
});

pool.addEventListener("tokenpop", () => {
  console.log("A token was retrieved from the pool");
});

pool.addEventListener("refilling", () => {
  console.log("Token pool is refilling");
});

pool.addEventListener("refilled", () => {
  console.log("Token pool has been refilled");
});

// Dynamically change properties and retrieve tokens
pool.maxSize = 200;
pool.tokenByteLength = 32;

pool.getToken().then((token) => {
  console.log("Received token:", token);
});
```
