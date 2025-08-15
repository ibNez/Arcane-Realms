import { requestGeneration, GenerationParams } from './generationQueue.js';
import { generateCharacter } from './generator.js';
import ContentFilter from './contentFilter.js';
import { FallbackManager, fallbackManager as defaultFallback } from './fallback.js';

export class CharacterGenerator {
  constructor(
    private filter: ContentFilter = new ContentFilter(),
    private fallback: FallbackManager = defaultFallback
  ) {}

  async generate(params: GenerationParams) {
    return requestGeneration(params, this.generateImmediate.bind(this));
  }

  private async generateImmediate(params: GenerationParams) {
    try {
      const result = await generateCharacter(params);
      if (!this.filter.validate(result.portrait)) {
        return this.fallback.get(params);
      }
      return result;
    } catch {
      return this.fallback.get(params);
    }
  }
}

export const characterGenerator = new CharacterGenerator();
