import type { Request, Response } from 'express';
import { characterGenerator } from '../characters/characterGenerator.js';
import {
  apiToParams,
  paramsToApi,
  paramsToCacheKey,
  type CharacterParameters
} from '../characters/parameters.js';
import { contentFilter } from '../characters/contentFilter.js';
import { get as cacheGet, store as cacheStore } from '../characters/cache.js';
import { getFallbackCharacter } from '../characters/fallback.js';
import {
  createCharacter,
  getCharacter as getStoredCharacter,
  type PlayerCharacter
} from '../characters/playerCharacter.js';

export async function generateCharacter(req: Request, res: Response) {
  let params: CharacterParameters;
  try {
    params = apiToParams(req.body || {});
  } catch (err: any) {
    res.status(400).json({ error: (err && err.message) || 'invalid parameters' });
    return;
  }
  const cacheKey = paramsToCacheKey(params);

  const cached = await cacheGet(cacheKey);
  if (cached && typeof (cached as any).portraitUrl === 'string') {
    res.json({ portraitUrl: (cached as any).portraitUrl, parameters: paramsToApi(params) });
    return;
  }

  try {
    const result = await characterGenerator.generate(params);
    const portrait: any = (result as any)?.portrait;
    if (!portrait) throw new Error('no portrait');
    if (!(await contentFilter.validate(portrait))) throw new Error('content rejected');

    const portraitUrl = `data:image/png;base64,${portrait.toString('base64')}`;
    const out = { portraitUrl, parameters: paramsToApi(params) };
    await cacheStore(cacheKey, out);
    res.json(out);
  } catch {
    const fallback = getFallbackCharacter(params as any);
    res.json({ portraitUrl: fallback.portraitUrl || '', parameters: paramsToApi(params) });
  }
}

export function saveCharacter(req: Request, res: Response) {
  try {
    const data = req.body as Omit<PlayerCharacter, 'createdAt' | 'updatedAt'>;
    const saved = createCharacter(data);
    res.json(saved);
  } catch {
    res.status(400).json({ error: 'invalid character data' });
  }
}

export function getCharacter(req: Request, res: Response) {
  const id = req.params.id;
  const character = getStoredCharacter(id);
  if (!character) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(character);
}

