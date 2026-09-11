import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (client) return client;

  const apiKey =
    process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ??
    process.env.ANTHROPIC_API_KEY;
  const baseURL =
    process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL ??
    process.env.ANTHROPIC_BASE_URL;

  if (!apiKey) {
    throw new Error(
      "Anthropic AI integration is not configured. The AI prototype feature is unavailable.",
    );
  }

  client = new Anthropic({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  return client;
}
