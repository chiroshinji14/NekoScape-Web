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

export type CoatPatternKind =
  | 'Solid'
  | 'Shaded'
  | 'Colorpoint'
  | 'MittedColorpoint'
  | 'TabbyMackerel'
  | 'TabbyClassic'
  | 'RosetteSpotted'
  | 'RosetteMarbled'
  | 'TickedAgouti'
  | 'Tortoiseshell'
  | 'Tuxedo'
  | 'Calico'
  | 'MikeCalico'
  | 'Bicolor'
  | 'HairlessSolid'
  | 'HairlessBicolor';

export type CoatTextureType =
  | 'Longhair'
  | 'ShaggyLonghair'
  | 'SilkySemilong'
  | 'SilkyMedium'
  | 'Sleek'
  | 'GlitterSleek'
  | 'PlushDense'
  | 'SilverPlush'
  | 'ShortPlush'
  | 'TickedShort'
  | 'SilkyShort'
  | 'Hairless'
  | 'Shorthair';

export type HeadShapeKind =
  | 'Brachycephalic'
  | 'Wedge'
  | 'RoundJowls'
  | 'CuteRound'
  | 'AngularCheekbones'
  | 'Classic'
  | 'SquareMuzzle'
  | 'OwlRound'
  | 'WildBroad'
  | 'BroadWedge'
  | 'SculptedWedge'
  | 'ModifiedWedge'
  | 'ModifiedRound'
  | 'ChiseledTriangle';

export type EarShapeKind =
  | 'SmallRounded'
  | 'LargePointed'
  | 'MediumRounded'
  | 'PerkyAlert'
  | 'GiantBat'
  | 'MediumPointed'
  | 'LynxTufted'
  | 'FoldedOwl'
  | 'AlertMediumRounded'
  | 'MediumTilted'
  | 'TallWidePointed'
  | 'CuppedAlert'
  | 'CurledBack'
  | 'UprightLarge';

export type EyeShapeKind =
  | 'LargeRound'
  | 'SlantedAlmond'
  | 'Walnut'
  | 'Lemon'
  | 'Almond'
  | 'OvalExpressive'
  | 'SaucerRound'
  | 'VividAlmond'
  | 'SapphireOval'
  | 'JewelRound'
  | 'ExpressiveAlmond'
  | 'BrightWalnut'
  | 'LivelyOval';

export type TailStyleKind =
  | 'PlumeBrush'
  | 'GiantPlume'
  | 'SilkyPlume'
  | 'FeatheredPlume'
  | 'Whip'
  | 'PlushBlunt'
  | 'PlushTapered'
  | 'PlumpUpright'
  | 'HairlessWhip'
  | 'MuscularLeopard'
  | 'SleekTapered'
  | 'SlenderDarkTipped'
  | 'PomPomBobtail'
  | 'Tapered';

export interface BreedCoatVariant {
  id: string;
  name: string;
  pattern: CoatPatternKind;
  baseColor: string;
  shadowColor: string;
  highlightColor: string;
  bellyColor: string;
  muzzleColor: string;
  pawColor: string;
  earOuterColor: string;
  earInnerColor: string;
  noseColor: string;
  eyeIrisColor: string;
  eyeRimColor: string;
  tailBaseColor: string;
  tailTipColor: string;
  stripeColor: string;
  secondaryPatchColor: string;
  whiskerColor: string;
  pointColor: string;
  wrinkleColor: string;
}

export interface BreedAnatomy {
  body: {
    bodyScale: number;
    headToTorsoLen: number;
    torsoToHipsLen: number;
    hipRadius: number;
    torsoRadius: number;
    neckRadius: number;
    shadowScale: number;
    coatType: CoatTextureType;
    furScallopCount: number;
    furScallopDepth: number;
    hasChestMane: boolean;
    maneScale: number;
    hasCheekRuffs: boolean;
    cheekRuffScale: number;
    hasWrinkles: boolean;
    wrinkleAlpha: number;
  };
  head: {
    shape: HeadShapeKind;
    radiusX: number;
    radiusY: number;
    muzzleOffset: number;
    noseSize: number;
    noseOffsetX: number;
    whiskerLength: number;
    whiskerSpread: number;
    whiskerCountPerSide: number;
  };
  ears: {
    shape: EarShapeKind;
    offsetX: number;
    offsetY: number;
    length: number;
    width: number;
    baseAngle: number;
    hasEarTufts: boolean;
    tuftLength: number;
    hasLynxTips: boolean;
    isFolded: boolean;
    isCurledBack: boolean;
    hasCartilageDetail: boolean;
    innerScale: number;
  };
  eyes: {
    shape: EyeShapeKind;
    offsetX: number;
    offsetY: number;
    irisRadius: number;
    slantRad: number;
  };
  legs: {
    pawRadius: number;
    pawAspectX: number;
    frontReach: number;
    backReach: number;
    frontSideSpan: number;
    backSideSpan: number;
    tuckedClose: boolean;
    fluffyPaws: boolean;
    visibleToes: boolean;
  };
  tail: {
    style: TailStyleKind;
    segments: number;
    segmentLength: number;
    rootOffset: number;
    rootWidth: number;
    midWidth: number;
    tipWidth: number;
    swayAmpMultiplier: number;
    swayFreqMultiplier: number;
    restCurveBias: number;
  };
}

export interface BreedDefinition {
  id: BreedId;
  label: string;
  summary: string;
  anatomy: BreedAnatomy;
  coatVariants: readonly BreedCoatVariant[];
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
  id: 'personal' | 'pro';
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
