import type { Request, Response } from 'express';
import fetch from 'node-fetch';
import { FileMemory } from '../memory/fileMemory.js';
import type { LlmRequest, LlmResponse, EmbedRequest, EmbedResponse } from '../types/contracts.js';

const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const memory = new FileMemory();

export async function llm(req: Request, res: Response) {
  const body = req.body as LlmRequest;
  try {
    const r = await fetch(OLLAMA + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.1:8b', messages: body.messages, stream: false })
    });
    if (!r.ok) throw new Error('LLM HTTP ' + r.status);
    const data = await r.json();
    const text = data?.message?.content || data?.response || '';
    const out: LlmResponse = { text, toolCalls: [] };
    res.json(out);
  } catch (e:any) {
    res.json({ text: '(offline) The guide nods thoughtfully.', toolCalls: [] });
  }
}

export async function embed(req: Request, res: Response) {
  const body = req.body as EmbedRequest;
  try {
    const r = await fetch(OLLAMA + '/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: body.texts.join('\n') })
    });
    if (!r.ok) throw new Error('Embed HTTP ' + r.status);
    const data = await r.json();
    const vectors = data?.embedding ? [data.embedding] : body.texts.map(_ => Array(768).fill(0));
    const out: EmbedResponse = { vectors };
    res.json(out);
  } catch (e:any) {
    const vectors = body.texts.map((t,i)=>Array(32).fill(0).map((_,j)=>Math.sin((i+1)*(j+3))));
    res.json({ vectors });
  }
}

export async function memorySearch(req: Request, res: Response) {
  const { collection, vector, topK } = req.body;
  const hits = memory.search(collection, vector, topK || 5);
  res.json(hits);
}

export async function memoryUpsert(req: Request, res: Response) {
  const { collection, rows } = req.body;
  const ok = memory.upsert(collection, rows);
  res.json(ok);
}

export async function stt(_req: Request, res: Response) {
  res.json({ text: '(offline) hello there' });
}

export async function tts(_req: Request, res: Response) {
  const wav = Buffer.from('');
  res.json({ audioWavBase64: wav.toString('base64') });
}

export async function genImage(_req: Request, res: Response) {
  const png1x1 = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108020000009077240000000A49444154789C636000000200015F0A2DB40000000049454E44AE426082','hex');
  res.json({ imagePngBase64: png1x1.toString('base64'), assetKey: 'stub-1x1' });
}
