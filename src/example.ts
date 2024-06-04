import cryptoGen from "./main";

// Create a token generator.
const { get } = await cryptoGen();

// Get 10 tokens.
const [tokens, duration] = await get(10);

console.log(`Generated ${tokens.length} tokens in ${duration}ms`);
