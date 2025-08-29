import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'net';

// Hoisted mocks for dependencies used in routes
const cacheMem = vi.hoisted(() => new Map<string, any>());
const generateMock = vi.hoisted(() => vi.fn());
const validateMock = vi.hoisted(() => vi.fn(async () => true));
const fallbackMock = vi.hoisted(() => vi.fn(() => ({ portraitUrl: 'fallback', parameters: {} })));
const saveMock = vi.hoisted(() => vi.fn((data: any) => ({ ...data, createdAt: 'now', updatedAt: 'now' })));

vi.mock('../src/characters/cache.js', () => ({
  get: vi.fn(async (k: string) => cacheMem.get(k)),
  store: vi.fn(async (k: string, v: any) => { cacheMem.set(k, v); })
}));
vi.mock('../src/characters/contentFilter.js', () => ({
  contentFilter: { validate: validateMock }
}));
vi.mock('../src/characters/characterGenerator.js', () => ({
  characterGenerator: { generate: generateMock }
}));
vi.mock('../src/characters/fallback.js', () => ({
  getFallbackCharacter: fallbackMock
}));
vi.mock('../src/characters/playerCharacter.js', () => ({
  createCharacter: saveMock
}));

import { generateCharacter, saveCharacter } from '../src/routes/character.js';

function createServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.post('/character/generate', generateCharacter);
  app.post('/character/save', saveCharacter);
  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}`;
  return { server, url };
}

const validParams = {
  heritage: 'nordic_inspired',
  age_category: 'adult',
  gender_expression: 'masculine',
  hair_style: 'short',
  hair_color: 'natural',
  eye_color: 'vibrant',
  skin_tone: 'tan',
  facial_structure: 'oval',
  clothing_style: 'casual',
  accessories: ['scar'],
  expression: 'neutral',
  pose: 'neutral',
  art_seed: 123,
  style_variant: 'realistic',
  quality_level: 'standard'
};

beforeEach(() => {
  cacheMem.clear();
  generateMock.mockReset();
  validateMock.mockReset();
  validateMock.mockResolvedValue(true);
  fallbackMock.mockReset();
  fallbackMock.mockReturnValue({ portraitUrl: 'fallback', parameters: {} });
  saveMock.mockReset();
  saveMock.mockImplementation((data: any) => ({ ...data, createdAt: 'now', updatedAt: 'now' }));
});

afterEach(() => {
  vi.clearAllTimers();
});

describe('character routes', () => {
  it('generates and caches characters', async () => {
    generateMock.mockResolvedValue({ portrait: Buffer.from('img'), parameters: {}, generatedAt: new Date() });
    const { server, url } = createServer();
    const res1 = await fetch(url + '/character/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validParams)
    });
    expect(res1.status).toBe(200);
    const out1 = await res1.json();
    expect(out1.portraitUrl).toContain('data:image/png;base64,');
    const res2 = await fetch(url + '/character/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validParams)
    });
    await res2.json();
    expect(generateMock).toHaveBeenCalledTimes(1);
    server.close();
  });

  it('falls back when generation fails', async () => {
    generateMock.mockRejectedValue(new Error('fail'));
    const { server, url } = createServer();
    const res = await fetch(url + '/character/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validParams)
    });
    expect(res.status).toBe(200);
    const out = await res.json();
    expect(out.portraitUrl).toBe('fallback');
    expect(fallbackMock).toHaveBeenCalled();
    server.close();
  });

  it('rejects invalid generation params', async () => {
    const { server, url } = createServer();
    const res = await fetch(url + '/character/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'null'
    });
    expect(res.status).toBe(400);
    server.close();
  });

  it('saves a character', async () => {
    const { server, url } = createServer();
    const body = {
      characterId: 'c1',
      playerId: 'p1',
      name: 'hero',
      portraitUrl: 'url',
      creationParameters: {},
      level: 1,
      experience: 0,
      classType: 'warrior',
      displayName: 'Hero',
      visibility: 'public'
    };
    const res = await fetch(url + '/character/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    expect(res.status).toBe(200);
    const out = await res.json();
    expect(out.characterId).toBe('c1');
    expect(saveMock).toHaveBeenCalled();
    server.close();
  });

  it('rejects invalid character data', async () => {
    const { server, url } = createServer();
    const res = await fetch(url + '/character/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'null'
    });
    expect(res.status).toBe(400);
    server.close();
  });
});
