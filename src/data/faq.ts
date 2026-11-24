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
      'Yes. In Settings or the tray menu, you can target your primary display, pick any specific screen, or run across all connected displays simultaneously. Each screen pauses independently when a game or full-screen app covers it.',
  },
  {
    id: 'subscription',
    question: 'Is NekoScape Pro a subscription?',
    answer:
      'No. Pay $2.49 once and keep NekoScape Pro forever, including all v2 updates.',
  },
  {
    id: 'activation',
    question: 'How do license keys and installation work?',
    answer:
      'Download the free Windows app once. After upgrading to Pro, you get a license key right away—paste it in Settings → License (or click Activate in NekoScape) with no account required.',
  },
  {
    id: 'uninstall',
    question: 'Can I return to my normal wallpaper anytime?',
    answer:
      'Yes. Exiting NekoScape immediately restores your original Windows wallpaper without leaving anything behind.',
  },
];
