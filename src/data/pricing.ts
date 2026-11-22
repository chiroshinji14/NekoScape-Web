import type { PricingTier } from '../types/nekoscape';

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'personal',
    name: 'Personal',
    priceLabel: '$0',
    cadence: 'Free forever',
    summary: 'Start with a calm living desktop.',
    recommended: false,
    ctaLabel: 'Download Free',
    highlights: [
      '4 classic rooms',
      'Up to 6 cats on screen',
      'Automatic day and night lighting',
      'Auto-pause for games and apps',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    priceLabel: '$2.49',
    cadence: 'One-time purchase',
    summary: 'Every room, every breed, yours to keep.',
    recommended: true,
    ctaLabel: 'Get Studio',
    highlights: [
      'All 13 handcrafted rooms',
      'All 14 cat breeds and Kitten Mode',
      'Unlimited cats, toys, and ambient sounds',
      'Photo capture and free v2 updates',
    ],
  },
];
