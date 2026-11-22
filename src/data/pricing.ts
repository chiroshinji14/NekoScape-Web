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
    priceLabel: '$9',
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
  {
    id: 'team',
    name: 'Family & Team',
    priceLabel: '$24',
    cadence: 'Up to 5 Windows PCs',
    summary: 'Share NekoScape across home or studio.',
    recommended: false,
    ctaLabel: 'Get Family Pack',
    highlights: [
      'Everything in Studio',
      'License for 5 Windows computers',
      'Offline portable install included',
      'Early access to new rooms',
    ],
  },
];
