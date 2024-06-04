# Cryptogen

Generate cryptographically secure opaque tokens using the Web Crypto API and Web
Workers.

## Installation

The package is not yet published to npm. You can clone the repository and build
the package yourself.

```sh
git clone https://github.com/MichielvdVelde/cryptogen.git
cd cryptogen
npm install
npm run build
```

## Features

- Generate cryptographically secure opaque tokens.
- Use Web Workers to offload the generation of tokens.
- Use a pool of tokens for better performance.

## Example

```ts
import cryptoGen from "./main";

// Create a token generator.
const { get } = await cryptoGen();

// Get 10 tokens.
const [tokens, duration] = await get(10);

console.log(`Generated ${tokens.length} tokens in ${duration}ms`);
```

## License

This project is licensed under the [MIT License](./LICENSE).

---

Made with ❤️ by [Michiel van der Velde](https://michielvdvelde.nl).
