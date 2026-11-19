import type { AgentId } from "./agents";

/**
 * Provider integration point. SCAFFOLDED: no implementation exists and
 * getAiProvider() returns null, so callers must handle "not configured".
 * BLOCKED on provider choice, server-side key management and cost limits.
 */
export type AiRequest = {
  agent: AgentId;
  userId: string;
  system: string;
  input: string;
  maxOutputTokens: number;
};

export type AiResponse = {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export interface AiProvider {
  readonly name: string;
  complete(request: AiRequest): Promise<AiResponse>;
}

export function getAiProvider(): AiProvider | null {
  // TODO(ai): construct the provider from server-only env vars (never NEXT_PUBLIC_*).
  return null;
}
