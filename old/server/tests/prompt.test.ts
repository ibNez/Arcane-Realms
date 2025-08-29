import { describe, it, expect } from 'vitest';
import { buildCharacterPrompt, buildNegativePrompt, HERITAGE_PROMPTS } from '../src/characters/prompt.js';

describe('prompt utilities', () => {
  it('assembles character prompts with heritage and attributes', () => {
    const prompt = buildCharacterPrompt({
      heritage: 'MOUNTAIN_FOLK',
      ageCategory: 'adult',
      genderExpression: 'masculine',
      hairStyle: 'short',
      hairColor: 'brown',
      eyeColor: 'green',
      skinTone: 'tan',
      clothingStyle: 'leather armor',
      expression: 'smiling',
      artSeed: 42
    });
    expect(prompt).toContain('Portrait of a fantasy game character');
    expect(prompt).toContain(HERITAGE_PROMPTS.MOUNTAIN_FOLK);
    expect(prompt).toContain('with short brown hair');
    expect(prompt).toContain('green eyes');
    expect(prompt).toContain('art seed: 42');
  });

  it('produces a negative prompt with common exclusions', () => {
    const neg = buildNegativePrompt();
    expect(neg).toContain('blurry');
    expect(neg).toContain('watermark');
    expect(neg.split(',').length).toBeGreaterThan(5);
  });
});
