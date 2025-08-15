import { describe, it, expect } from 'vitest';
import {
  paramsToCacheKey,
  cacheKeyToParams,
  paramsToApi,
  apiToParams,
  Heritage,
  AgeCategory,
  GenderExpression,
  HairStyle,
  ColorPalette,
  SkinTone,
  FacialType,
  OutfitStyle,
  AccessoryType,
  EmotionalExpression,
  Pose,
  ArtStyle,
  QualityTier,
  type CharacterParameters
} from '../src/characters/parameters.js';

describe('parameter conversions', () => {
  const params: CharacterParameters = {
    heritage: Heritage.MOUNTAIN_FOLK,
    ageCategory: AgeCategory.ADULT,
    genderExpression: GenderExpression.MASCULINE,
    hairStyle: HairStyle.SHORT,
    hairColor: ColorPalette.NATURAL,
    eyeColor: ColorPalette.VIBRANT,
    skinTone: SkinTone.TAN,
    facialStructure: FacialType.OVAL,
    clothingStyle: OutfitStyle.CASUAL,
    accessories: [AccessoryType.SCAR],
    expression: EmotionalExpression.NEUTRAL,
    pose: Pose.NEUTRAL,
    artSeed: 123,
    styleVariant: ArtStyle.REALISTIC,
    qualityLevel: QualityTier.STANDARD
  };

  it('round-trips through cache key', () => {
    const key = paramsToCacheKey(params);
    const round = cacheKeyToParams(key);
    expect(round).toEqual(params);
  });

  it('round-trips through API conversion', () => {
    const api = paramsToApi(params);
    const round = apiToParams(api);
    expect(round).toEqual(params);
  });

  it('throws on invalid input', () => {
    expect(() => apiToParams(null as any)).toThrow();
  });
});
