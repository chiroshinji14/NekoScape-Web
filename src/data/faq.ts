import type { FaqItem } from '../types/nekoscape';

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'performance',
    question: 'Will NekoScape slow down my PC or games?',
    answer:
      'No. The moment you maximize an app or launch a full-screen game, NekoScape pauses automatically so your PC stays completely free.',
  },
  {
    id: 'windows',
    question: 'Which versions of Windows are supported?',
    answer:
      'NekoScape works smoothly on 64-bit Windows 10 and Windows 11, including the latest Windows 11 updates.',
  },
  {
    id: 'icons',
    question: 'Do the cats get in the way of my desktop icons?',
    answer:
      'Never. Your shortcuts stay fully clickable on top, and the cats simply roam behind them, nap beside them, or hop onto a perch.',
  },
  {
    id: 'controls',
    question: 'How do I switch rooms or pause the cats?',
    answer:
      'Click the NekoScape icon in your Windows taskbar tray anytime to switch scenes, adjust lighting, toss toys, or pause in one click.',
  },
  {
    id: 'privacy',
    question: 'Does it collect data or read what I type?',
    answer:
      'Never. NekoScape runs completely offline on your computer with no account and no tracking. Your original wallpaper is restored whenever you quit.',
  },
  {
    id: 'monitors',
    question: 'Does it work with multiple monitors?',
    answer:
      'Yes. You can place NekoScape on your primary screen or choose any connected display.',
  },
  {
    id: 'subscription',
    question: 'Is Studio a subscription?',
    answer:
      'No. Pay once and keep NekoScape Studio forever, including all v2 updates.',
  },
  {
    id: 'uninstall',
    question: 'Can I return to my normal wallpaper anytime?',
    answer:
      'Yes. Exiting NekoScape immediately restores your original Windows wallpaper without leaving anything behind.',
  },
];
