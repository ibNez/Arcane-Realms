import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

// Basic character types
export type Character = Record<string, any>;
export type CharacterParameters = Record<string, any>;

// Helper for deterministic JSON stringification
function stableStringify(value: any): string {
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export function createCacheKey(params: CharacterParameters): string {
  const str = stableStringify(params);
  return createHash('sha256').update(str).digest('hex');
}

class CharacterCache {
  private memory = new Map<string, Character>();
  private redis: RedisClientType | null = null;
  private fileDir: string;

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      this.redis = createClient({ url });
      this.redis.connect().catch(() => { this.redis = null; });
    }
    this.fileDir = path.join(process.cwd(), 'cache', 'characters');
  }

  async get(cacheKey: string): Promise<Character | null> {
    // 1. Memory
    const mem = this.memory.get(cacheKey);
    if (mem) return mem;

    // 2. Redis
    if (this.redis) {
      try {
        const data = await this.redis.get(cacheKey);
        if (data) {
          const character: Character = JSON.parse(data);
          this.memory.set(cacheKey, character);
          return character;
        }
      } catch {}
    }

    // 3. File storage
    try {
      const filePath = path.join(this.fileDir, `${cacheKey}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const character: Character = JSON.parse(data);
      if (this.redis) {
        try { await this.redis.set(cacheKey, data, { EX: 3600 }); } catch {}
      }
      this.memory.set(cacheKey, character);
      return character;
    } catch {
      return null;
    }
  }

  async store(cacheKey: string, character: Character): Promise<void> {
    const data = JSON.stringify(character);
    // Memory
    this.memory.set(cacheKey, character);

    // Redis
    if (this.redis) {
      try { await this.redis.set(cacheKey, data, { EX: 3600 }); } catch {}
    }

    // File storage
    const filePath = path.join(this.fileDir, `${cacheKey}.json`);
    await fs.mkdir(this.fileDir, { recursive: true });
    await fs.writeFile(filePath, data, 'utf-8');
  }
}

export const characterCache = new CharacterCache();
export const get = characterCache.get.bind(characterCache);
export const store = characterCache.store.bind(characterCache);
