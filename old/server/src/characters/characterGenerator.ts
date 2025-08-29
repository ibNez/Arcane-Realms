import { generateCharacter } from './generator.js';
import type { ContentFilter } from './contentFilter.js';
import { FallbackManager, fallbackManager as defaultFallback } from './fallback.js';

export interface Cache {
  get: (key: string) => Promise<any | undefined>;
  set: (key: string, value: any) => Promise<void>;
}

class MemoryCache implements Cache {
  private store = new Map<string, any>();
  async get(key: string) { return this.store.get(key); }
  async set(key: string, value: any) { this.store.set(key, value); }
}

interface Deps {
  generate?: (params: Record<string, any>) => Promise<any>;
  cache?: Cache;
  filter?: ContentFilter;
  fallback?: FallbackManager;
}

export class CharacterGenerator {
  private queue: Promise<void> = Promise.resolve();
  private generateFn: (params: Record<string, any>) => Promise<any>;
  private cache: Cache;
  private filter?: ContentFilter;
  private fallback: FallbackManager;

  constructor(deps: Deps = {}) {
    this.generateFn = deps.generate ?? generateCharacter;
    this.cache = deps.cache ?? new MemoryCache();
    this.filter = deps.filter;
    this.fallback = deps.fallback ?? defaultFallback;
  }

  private cacheKey(params: Record<string, any>): string {
    return JSON.stringify(params);
  }

  async generate(params: Record<string, any> = {}) {
    const key = this.cacheKey(params);
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const run = () => this.generateImmediate(params, key);
    const p = this.queue.then(run);
    this.queue = p.then(() => undefined);
    return p;
  }

  private async generateImmediate(params: Record<string, any>, key: string) {
    try {
      const result = await this.generateFn(params);
      const filter = await this.getFilter();
      if (!(await filter.validate(result.portrait))) {
        return this.fallback.get(params);
      }
      await this.cache.set(key, result);
      return result;
    } catch {
      return this.fallback.get(params);
    }
  }

  private async getFilter(): Promise<ContentFilter> {
    if (!this.filter) {
      const mod = await import('./contentFilter.js');
      this.filter = new mod.ContentFilter();
    }
    return this.filter;
  }
}

export const characterGenerator = new CharacterGenerator();
export type Character = Awaited<ReturnType<typeof generateCharacter>>;
