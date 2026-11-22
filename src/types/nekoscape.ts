export type SceneId =
  | 'study'
  | 'tatami'
  | 'garden'
  | 'cafe'
  | 'living_room'
  | 'rainy_window'
  | 'night_balcony'
  | 'kitchen'
  | 'bedroom'
  | 'snowy_window'
  | 'sunbeam'
  | 'aquarium'
  | 'rooftop';

export type SceneCategory = 'indoor' | 'window' | 'outdoor';

export type LightingMode = 'day' | 'golden' | 'night';

export interface SceneLightingGrade {
  label: string;
  overlayColor: string;
  cssFilter: string;
  moteHex: string;
  moteAlpha: number;
  ambientGlow: string;
}

export interface SceneDefinition {
  id: SceneId;
  key: SceneId;
  label: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  category: SceneCategory;
  swatches: readonly [string, string, string];
  floorHex: string;
  rugName: string;
  rugHex: string;
  accentHex: string;
  featuredProps: readonly string[];
  lightingGrades: Record<LightingMode, SceneLightingGrade>;
  images: Record<LightingMode, string>;
}

export type BreedId =
  | 'persian'
  | 'siamese'
  | 'british_shorthair'
  | 'munchkin'
  | 'sphynx'
  | 'domestic_shorthair'
  | 'maine_coon'
  | 'scottish_fold'
  | 'bengal'
  | 'ragdoll'
  | 'russian_blue'
  | 'abyssinian'
  | 'american_curl'
  | 'japanese_bobtail';

export interface BreedDefinition {
  id: BreedId;
  label: string;
  summary: string;
  earStyle: 'rounded' | 'pointed' | 'tufted' | 'folded' | 'bat' | 'curled';
  tailStyle: 'plume' | 'sleek' | 'bobtail' | 'plush';
  furColor: string;
  accentColor: string;
  eyeColor: string;
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: readonly string[];
}

export interface PricingTier {
  id: 'personal' | 'studio' | 'team';
  name: string;
  priceLabel: string;
  cadence: string;
  summary: string;
  recommended: boolean;
  ctaLabel: string;
  highlights: readonly string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
