import type { } from './types/contracts.js';

export interface CharacterParams {
  heritage?: string;
}

export interface Character {
  prompt: string;
  image: string;
  params: CharacterParams;
}

export interface StableDiffusionClient {
  generate: (prompt: string) => Promise<string>;
}

export interface Cache {
  get: (key: string) => Promise<Character | undefined>;
  set: (key: string, value: Character) => Promise<void>;
}

export interface ContentFilter {
  validate: (image: string) => boolean;
}

export interface FallbackProvider {
  get: () => Promise<Character>;
}

interface Deps {
  stableDiffusion: StableDiffusionClient;
  cache: Cache;
  contentFilter: ContentFilter;
  fallback: FallbackProvider;
}

export class CharacterGenerator {
  private queue: Promise<void> = Promise.resolve();

  constructor(private deps: Deps) {}

  assemblePrompt(params: CharacterParams): string {
    const heritage = params.heritage || 'mystic';
    return `Portrait of a fantasy game character, heritage: ${heritage}`;
  }

  private cacheKey(params: CharacterParams): string {
    return JSON.stringify(params);
  }

  async generate(params: CharacterParams = {}): Promise<Character> {
    const prompt = this.assemblePrompt(params);
    const key = this.cacheKey(params);

    const cached = await this.deps.cache.get(key);
    if (cached) return cached;

    const run = async (): Promise<Character> => {
      try {
        const image = await this.deps.stableDiffusion.generate(prompt);
        if (!this.deps.contentFilter.validate(image)) {
          return await this.deps.fallback.get();
        }
        const character: Character = { prompt, image, params };
        await this.deps.cache.set(key, character);
        return character;
      } catch {
        return await this.deps.fallback.get();
      }
    };

    const p = this.queue.then(() => run());
    this.queue = p.then(() => undefined);
    return p;
  }
}
