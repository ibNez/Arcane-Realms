import type { Request, Response } from 'express';
import { characterGenerator } from '../characters/characterGenerator.js';
import {
  apiToParams,
  paramsToCacheKey,
  type CharacterParameters
} from '../characters/parameters.js';
import { ContentFilter } from '../characters/contentFilter.js';
import { get as cacheGet, store as cacheStore } from '../characters/cache.js';
import { getFallbackCharacter } from '../characters/fallback.js';

const filter = new ContentFilter();

export async function generateCharacter(req: Request, res: Response) {
  const params: CharacterParameters = apiToParams(req.body || {});
  const cacheKey = paramsToCacheKey(params);

  const cached = await cacheGet(cacheKey);
  if (cached && typeof (cached as any).portraitUrl === 'string') {
    res.json({ portraitUrl: (cached as any).portraitUrl, parameters: params });
    return;
  }

  try {
    const result = await characterGenerator.generate(params);
    const portrait: any = (result as any)?.portrait;
    if (!portrait) throw new Error('no portrait');
    if (!filter.validate(portrait)) throw new Error('content rejected');

    const portraitUrl = `data:image/png;base64,${portrait.toString('base64')}`;
    const out = { portraitUrl, parameters: params };
    await cacheStore(cacheKey, out);
    res.json(out);
  } catch {
    const fallback = getFallbackCharacter(params as any);
    res.json({ portraitUrl: fallback.portraitUrl || '', parameters: params });
  }
}

