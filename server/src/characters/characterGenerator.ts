import { requestGeneration, GenerationParams } from './generationQueue.js';

export class CharacterGenerator {
  async generate(params: GenerationParams) {
    return requestGeneration(params, this.generateImmediate.bind(this));
  }

  private async generateImmediate(params: GenerationParams) {
    // Placeholder implementation for character generation logic.
    return { portrait: null, parameters: params };
  }
}

export const characterGenerator = new CharacterGenerator();
