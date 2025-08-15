import { describe, it, expect, vi } from 'vitest';
import { CharacterGenerator, Character } from '../src/characterGeneration.js';

function createGenerator() {
  const store = new Map<string, Character>();
  const stableDiffusion = { generate: vi.fn() };
  const cache = {
    get: vi.fn(async (k: string) => store.get(k)),
    set: vi.fn(async (k: string, v: Character) => { store.set(k, v); })
  };
  const contentFilter = { validate: vi.fn(() => true) };
  const fallbackChar: Character = { prompt: 'fallback', image: 'fb', params: {} };
  const fallback = { get: vi.fn(async () => fallbackChar) };
  const gen = new CharacterGenerator({ stableDiffusion, cache, contentFilter, fallback });
  return { gen, stableDiffusion, cache, contentFilter, fallback, fallbackChar };
}

describe('CharacterGenerator', () => {
  it('assembles prompt with heritage', () => {
    const { gen } = createGenerator();
    const prompt = gen.assemblePrompt({ heritage: 'forest' });
    expect(prompt).toContain('forest');
    expect(prompt).toContain('Portrait of a fantasy game character');
  });

  it('uses cache on repeated requests', async () => {
    const { gen, stableDiffusion } = createGenerator();
    stableDiffusion.generate.mockResolvedValue('img');
    await gen.generate({ heritage: 'mountain' });
    await gen.generate({ heritage: 'mountain' });
    expect(stableDiffusion.generate).toHaveBeenCalledTimes(1);
  });

  it('processes requests sequentially via queue', async () => {
    const { gen, stableDiffusion } = createGenerator();
    const order: string[] = [];
    let i = 0;
    stableDiffusion.generate.mockImplementation(async () => {
      const idx = ++i;
      order.push('start' + idx);
      await new Promise(r => setTimeout(r, 10));
      order.push('end' + idx);
      return 'img' + idx;
    });
    const p1 = gen.generate({ heritage: 'north' });
    const p2 = gen.generate({ heritage: 'south' });
    await Promise.all([p1, p2]);
    expect(order).toEqual(['start1', 'end1', 'start2', 'end2']);
  });

  it('returns fallback when generation fails', async () => {
    const { gen, stableDiffusion, fallback, fallbackChar } = createGenerator();
    stableDiffusion.generate.mockRejectedValue(new Error('fail'));
    const result = await gen.generate({ heritage: 'coast' });
    expect(fallback.get).toHaveBeenCalled();
    expect(result).toEqual(fallbackChar);
  });

  it('returns fallback when content filter rejects', async () => {
    const { gen, stableDiffusion, contentFilter, fallback, fallbackChar } = createGenerator();
    stableDiffusion.generate.mockResolvedValue('img');
    contentFilter.validate.mockReturnValue(false);
    const result = await gen.generate({ heritage: 'plains' });
    expect(fallback.get).toHaveBeenCalled();
    expect(result).toEqual(fallbackChar);
  });
});
