import type { ChangelogEntry } from '../types/nekoscape';

export const CHANGELOG: readonly ChangelogEntry[] = [
  {
    version: '2.1.2',
    date: 'November 22, 2026',
    title: 'Light Latte theme and calmer controls',
    items: [
      'Added a warm Light Latte appearance alongside Dark Espresso in Settings.',
      'Made the quick tray menu cleaner, easier to read, and always responsive even while paused.',
      'Polished the Windows setup flow and welcome experience.',
    ],
  },
  {
    version: '2.1.0',
    date: 'November 21, 2026',
    title: 'A fresh look and Windowed Mode',
    items: [
      'Redesigned the tray flyout, Settings window, and guided first-run tour.',
      'Added Windowed Mode so you can enjoy NekoScape as a calm companion window alongside your work.',
      'Added a one-click Windows installer for effortless setup.',
    ],
  },
  {
    version: '2.0.0',
    date: 'November 21, 2026',
    title: 'Lighter, faster native Windows engine',
    items: [
      'Rebuilt NekoScape natively for Windows for dramatically lower memory and instant startup.',
      'Smoother animations across high-refresh displays with effortless auto-pause when apps cover the screen.',
    ],
  },
  {
    version: '1.1.0',
    date: 'November 21, 2026',
    title: '13 rooms, 14 breeds, toys, and gentle audio',
    items: [
      'Expanded to 13 atmospheric rooms from Kyoto Tatami to Snowy Window and Sunset Rooftop.',
      'Added 14 distinct cat breeds, Kitten Mode, unlimited cats, and 11 interactive toys.',
      'Introduced optional soft purrs and chirps plus one-click Photo Mode.',
    ],
  },
  {
    version: '1.0.0',
    date: 'November 20, 2026',
    title: 'First release',
    items: [
      'Launched NekoScape for Windows with roaming desktop cats, icon perching, cardboard box leaps, and automatic day-to-night lighting.',
      'Cleanly restores your original Windows wallpaper whenever you exit.',
    ],
  },
];
