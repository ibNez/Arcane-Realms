export enum Heritage {
  NORTHERN_KINGDOMS = 'nordic_inspired',
  DESERT_REALMS = 'middle_eastern_inspired',
  ISLAND_NATIONS = 'polynesian_inspired',
  FOREST_CLANS = 'celtic_inspired',
  MOUNTAIN_FOLK = 'alpine_inspired',
  PLAINS_RIDERS = 'steppe_inspired',
  COASTAL_CITIES = 'mediterranean_inspired',
  MYSTIC_ENCLAVES = 'fantasy_original'
}

export enum AgeCategory {
  YOUNG_ADULT = 'young_adult',
  ADULT = 'adult',
  MATURE = 'mature'
}

export enum GenderExpression {
  MASCULINE = 'masculine',
  FEMININE = 'feminine',
  ANDROGYNOUS = 'androgynous'
}

export enum HairStyle {
  BALD = 'bald',
  SHORT = 'short',
  LONG = 'long',
  BRAIDED = 'braided',
  PONYTAIL = 'ponytail'
}

export enum ColorPalette {
  NATURAL = 'natural',
  FANTASY = 'fantasy',
  VIBRANT = 'vibrant',
  MUTED = 'muted',
  MONOCHROME = 'monochrome'
}

export enum SkinTone {
  FAIR = 'fair',
  TAN = 'tan',
  OLIVE = 'olive',
  DARK = 'dark',
  EBONY = 'ebony'
}

export enum FacialType {
  OVAL = 'oval',
  ROUND = 'round',
  SQUARE = 'square',
  HEART = 'heart',
  ANGULAR = 'angular'
}

export enum OutfitStyle {
  CASUAL = 'casual',
  FORMAL = 'formal',
  ARMORED = 'armored',
  ROBES = 'robes',
  ADVENTURER = 'adventurer'
}

export enum AccessoryType {
  SCAR = 'scar',
  TATTOO = 'tattoo',
  JEWELRY = 'jewelry',
  HAT = 'hat',
  GLASSES = 'glasses'
}

export enum EmotionalExpression {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  DETERMINED = 'determined'
}

export enum Pose {
  NEUTRAL = 'neutral',
  ACTION = 'action',
  GUARD = 'guard',
  CASUAL = 'casual',
  HEROIC = 'heroic'
}

export enum ArtStyle {
  REALISTIC = 'realistic',
  ANIME = 'anime',
  CARTOON = 'cartoon',
  PAINTERLY = 'painterly',
  PIXEL = 'pixel'
}

export enum QualityTier {
  DRAFT = 'draft',
  STANDARD = 'standard',
  HIGH = 'high',
  ULTRA = 'ultra'
}

export interface CharacterParameters {
  heritage: Heritage;
  ageCategory: AgeCategory;
  genderExpression: GenderExpression;
  hairStyle: HairStyle;
  hairColor: ColorPalette;
  eyeColor: ColorPalette;
  skinTone: SkinTone;
  facialStructure: FacialType;
  clothingStyle: OutfitStyle;
  accessories: AccessoryType[];
  expression: EmotionalExpression;
  pose: Pose;
  artSeed: number;
  styleVariant: ArtStyle;
  qualityLevel: QualityTier;
}

export function paramsToCacheKey(p: CharacterParameters): string {
  const parts = [
    p.heritage,
    p.ageCategory,
    p.genderExpression,
    p.hairStyle,
    p.hairColor,
    p.eyeColor,
    p.skinTone,
    p.facialStructure,
    p.clothingStyle,
    p.accessories.slice().sort().join(','),
    p.expression,
    p.pose,
    String(p.artSeed),
    p.styleVariant,
    p.qualityLevel
  ];
  return parts.join('|');
}

export function cacheKeyToParams(key: string): CharacterParameters {
  const [
    heritage,
    ageCategory,
    genderExpression,
    hairStyle,
    hairColor,
    eyeColor,
    skinTone,
    facialStructure,
    clothingStyle,
    accessories,
    expression,
    pose,
    artSeed,
    styleVariant,
    qualityLevel
  ] = key.split('|');
  return {
    heritage: heritage as Heritage,
    ageCategory: ageCategory as AgeCategory,
    genderExpression: genderExpression as GenderExpression,
    hairStyle: hairStyle as HairStyle,
    hairColor: hairColor as ColorPalette,
    eyeColor: eyeColor as ColorPalette,
    skinTone: skinTone as SkinTone,
    facialStructure: facialStructure as FacialType,
    clothingStyle: clothingStyle as OutfitStyle,
    accessories: accessories ? accessories.split(',').filter(Boolean) as AccessoryType[] : [],
    expression: expression as EmotionalExpression,
    pose: (pose as Pose) || Pose.NEUTRAL,
    artSeed: Number(artSeed) || 0,
    styleVariant: styleVariant as ArtStyle,
    qualityLevel: qualityLevel as QualityTier
  };
}

export function paramsToApi(p: CharacterParameters) {
  return {
    heritage: p.heritage,
    age_category: p.ageCategory,
    gender_expression: p.genderExpression,
    hair_style: p.hairStyle,
    hair_color: p.hairColor,
    eye_color: p.eyeColor,
    skin_tone: p.skinTone,
    facial_structure: p.facialStructure,
    clothing_style: p.clothingStyle,
    accessories: p.accessories,
    expression: p.expression,
    pose: p.pose,
    art_seed: p.artSeed,
    style_variant: p.styleVariant,
    quality_level: p.qualityLevel
  };
}

export function apiToParams(obj: any): CharacterParameters {
  return {
    heritage: obj.heritage as Heritage,
    ageCategory: obj.age_category as AgeCategory,
    genderExpression: obj.gender_expression as GenderExpression,
    hairStyle: obj.hair_style as HairStyle,
    hairColor: obj.hair_color as ColorPalette,
    eyeColor: obj.eye_color as ColorPalette,
    skinTone: obj.skin_tone as SkinTone,
    facialStructure: obj.facial_structure as FacialType,
    clothingStyle: obj.clothing_style as OutfitStyle,
    accessories: Array.isArray(obj.accessories) ? obj.accessories as AccessoryType[] : [],
    expression: obj.expression as EmotionalExpression,
    pose: (obj.pose as Pose) || Pose.NEUTRAL,
    artSeed: Number(obj.art_seed) || 0,
    styleVariant: obj.style_variant as ArtStyle,
    qualityLevel: obj.quality_level as QualityTier
  };
}
