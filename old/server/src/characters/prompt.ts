// Character prompt building utilities
// Provides functions to assemble Stable Diffusion prompts for
// character generation along with negative prompts to maintain
// output quality.

export type Heritage =
  | 'NORTHERN_KINGDOMS'
  | 'DESERT_REALMS'
  | 'ISLAND_NATIONS'
  | 'FOREST_CLANS'
  | 'MOUNTAIN_FOLK'
  | 'PLAINS_RIDERS'
  | 'COASTAL_CITIES'
  | 'MYSTIC_ENCLAVES';

export interface CharacterPromptParams {
  heritage: Heritage;
  ageCategory: string;
  genderExpression: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  clothingStyle: string;
  expression: string;
  artSeed: number;
}

// Mapping of heritage to descriptive prompt fragments.
export const HERITAGE_PROMPTS: Record<Heritage, string> = {
  NORTHERN_KINGDOMS: 'nordic inspired, pale skin, angular features, cold climate clothing',
  DESERT_REALMS: 'middle eastern inspired, warm tones, ornate jewelry, desert appropriate',
  ISLAND_NATIONS: 'polynesian inspired, tan skin, flowing clothing, ocean motifs',
  FOREST_CLANS: 'celtic inspired, earth tones, natural accessories, woodland aesthetic',
  MOUNTAIN_FOLK: 'alpine inspired, sturdy build, practical clothing, mountain aesthetic',
  PLAINS_RIDERS: 'steppe inspired, weathered look, travel clothing, nomadic aesthetic',
  COASTAL_CITIES: 'mediterranean inspired, olive skin, maritime clothing, coastal aesthetic',
  MYSTIC_ENCLAVES: 'fantasy original, magical features, ethereal appearance, mystical clothing'
};

/**
 * Assemble a positive prompt for character generation.
 * Combines base descriptors with heritage specific overrides.
 */
export function buildCharacterPrompt(params: CharacterPromptParams): string {
  const heritage = HERITAGE_PROMPTS[params.heritage];
  const parts = [
    'Portrait of a fantasy game character',
    heritage,
    params.ageCategory,
    params.genderExpression,
    `with ${params.hairStyle} ${params.hairColor} hair`,
    `${params.eyeColor} eyes`,
    `${params.skinTone} skin`,
    `wearing ${params.clothingStyle}`,
    `${params.expression} expression`,
    'detailed digital art, fantasy game portrait',
    'isometric character art style',
    'clean background, professional quality',
    `art seed: ${params.artSeed}`
  ];
  return parts.filter(Boolean).join(', ');
}

/**
 * Build a negative prompt used to discourage low quality or
 * inappropriate generation artifacts.
 */
export function buildNegativePrompt(): string {
  return [
    'blurry',
    'low quality',
    'distorted',
    'inappropriate',
    'realistic photo',
    'modern clothing',
    'weapons',
    'multiple people',
    'full body',
    'landscape',
    'text',
    'watermark',
    'signature'
  ].join(', ');
}

export default { buildCharacterPrompt, buildNegativePrompt };
