import { describe, it, expect, vi } from 'vitest';
import { CharacterGenerator, Character } from '../src/characters/characterGenerator.js';

function createGenerator() {
  const store = new Map<string, Character>();
  const generate = vi.fn();
  const cache = {
    get: vi.fn(async (k: string) => store.get(k)),
    set: vi.fn(async (k: string, v: Character) => { store.set(k, v); })
  };
  const filter = { validate: vi.fn(async () => true) };
  const fallbackChar: Character = { portrait: 'fb', parameters: {}, generatedAt: new Date() } as any;
  const fallback = { get: vi.fn(async () => fallbackChar) };
  const gen = new CharacterGenerator({ generate, cache, filter: filter as any, fallback: fallback as any });
  return { gen, generate, cache, filter, fallback, fallbackChar };
}

describe('CharacterGenerator', () => {
  it('uses cache on repeated requests', async () => {
    const { gen, generate } = createGenerator();
    generate.mockResolvedValue({ portrait: 'img', parameters: {}, generatedAt: new Date() });
    await gen.generate({ heritage: 'mountain' });
    await gen.generate({ heritage: 'mountain' });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('processes requests sequentially via queue', async () => {
    const { gen, generate } = createGenerator();
    const order: string[] = [];
    let i = 0;
    generate.mockImplementation(async () => {
      const idx = ++i;
      order.push('start' + idx);
      await new Promise(r => setTimeout(r, 10));
      order.push('end' + idx);
      return { portrait: 'img' + idx, parameters: {}, generatedAt: new Date() };
    });
    const p1 = gen.generate({ heritage: 'north' });
    const p2 = gen.generate({ heritage: 'south' });
    await Promise.all([p1, p2]);
    expect(order).toEqual(['start1', 'end1', 'start2', 'end2']);
  });

  it('returns fallback when generation fails', async () => {
    const { gen, generate, fallback, fallbackChar } = createGenerator();
    generate.mockRejectedValue(new Error('fail'));
    const result = await gen.generate({ heritage: 'coast' });
    expect(fallback.get).toHaveBeenCalled();
    expect(result).toEqual(fallbackChar);
  });

  it('returns fallback when content filter rejects', async () => {
    const { gen, generate, filter, fallback, fallbackChar } = createGenerator();
    generate.mockResolvedValue({ portrait: 'img', parameters: {}, generatedAt: new Date() });
    filter.validate.mockResolvedValue(false);
    const result = await gen.generate({ heritage: 'plains' });
    expect(fallback.get).toHaveBeenCalled();
    expect(result).toEqual(fallbackChar);
  });
});
