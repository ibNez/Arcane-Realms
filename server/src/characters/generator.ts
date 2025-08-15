import { Buffer } from 'node:buffer';
import { buildCharacterPrompt, buildNegativePrompt } from './prompt.js';
import type { CharacterParameters } from './parameters.js';

class StableDiffusionClient {
  async generate(opts: { prompt: string; negativePrompt: string; width: number; height: number; guidance: number; steps: number; seed: number }): Promise<Buffer> {
    const hex = '89504E470D0A1A0A0000000D49484452000000010000000108020000009077240000000A49444154789C636000000200015F0A2DB40000000049454E44AE426082';
    return Buffer.from(hex, 'hex');
  }
}

async function postProcessImage(img: Buffer): Promise<Buffer> {
  return img;
}

export async function generateCharacter(params: CharacterParameters) {
  const prompt = buildCharacterPrompt(params);
  const negativePrompt = buildNegativePrompt();
  const seed = typeof params?.artSeed === 'number' ? params.artSeed : Math.floor(Math.random() * 1e9);
  const client = new StableDiffusionClient();
  const raw = await client.generate({ prompt, negativePrompt, width: 512, height: 512, guidance: 7.5, steps: 20, seed });
  const portrait = await postProcessImage(raw);
  return { portrait, parameters: params, generatedAt: new Date() };
}

