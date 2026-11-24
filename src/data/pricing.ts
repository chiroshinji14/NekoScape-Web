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
      '4 classic rooms (Study, Tatami, Garden, Cafe)',
      'Up to 6 cats & 4 starter breeds',
      'Core toys (Laser, Yarn, Box, Treat) + auto lighting',
      'Multi-monitor support & auto-pause for games',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '$2.49',
    cadence: 'One-time purchase',
    summary: 'Every room, every breed, yours to keep.',
    recommended: true,
    ctaLabel: 'Get Pro',
    highlights: [
      'All 13 handcrafted rooms',
      'All 14 cat breeds and Kitten Mode',
      'Unlimited cats, all 15 toys, and cat sounds',
      'Photo capture, instant unlock & free v2 updates',
    ],
  },
];
