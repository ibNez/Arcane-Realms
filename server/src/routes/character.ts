import type { Request, Response } from 'express';

export type CharacterParameters = Record<string, any>;

export type GeneratedCharacter = {
  portraitUrl: string;
  parameters: CharacterParameters;
};

class CharacterGenerator {
  async generate(parameters?: CharacterParameters): Promise<GeneratedCharacter> {
    const params = parameters || { seed: Math.floor(Math.random() * 1_000_000) };
    // Placeholder portrait URL; in real implementation this would point to a generated asset
    const portraitUrl = 'https://example.com/portrait.png';
    return { portraitUrl, parameters: params };
  }
}

class FallbackManager {
  async getFallbackCharacter(parameters?: CharacterParameters): Promise<GeneratedCharacter> {
    const params = parameters || { seed: 0 };
    const portraitUrl = 'https://example.com/fallback.png';
    return { portraitUrl, parameters: params };
  }
}

class GenerationQueue {
  private generator: CharacterGenerator;

  constructor() {
    this.generator = new CharacterGenerator();
  }

  async requestGeneration(parameters?: CharacterParameters): Promise<GeneratedCharacter> {
    return this.generator.generate(parameters);
  }
}

const generationQueue = new GenerationQueue();
const fallbackManager = new FallbackManager();

export async function generateCharacter(req: Request, res: Response) {
  const params = (req.body as CharacterParameters) || undefined;
  try {
    const result = await generationQueue.requestGeneration(params);
    res.json(result);
  } catch {
    const fallback = await fallbackManager.getFallbackCharacter(params);
    res.json(fallback);
  }
}

