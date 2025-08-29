export type ChatMessage = { role: 'system'|'user'|'assistant'; content: string };
export type LlmRequest = { messages: ChatMessage[]; tools?: { name: string; schema: any; strict?: boolean }[] };
export type LlmResponse = { text: string; toolCalls?: { name: string; args: any }[] };
export type EmbedRequest = { texts: string[] };
export type EmbedResponse = { vectors: number[][] };
export type MemoryUpsert = { collection: string; rows: any[] };
export type MemorySearch = { collection: string; vector: number[]; topK: number; filter?: any };
