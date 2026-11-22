import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_SEQUENCE_IMAGES } from '../data/scenes';
import type { LightingMode } from '../types/nekoscape';
import { useLenis } from '../hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

interface SequenceChapter {
  id: LightingMode;
  label: string;
  caption: string;
  targetProgress: number;
}

const CHAPTERS: readonly SequenceChapter[] = [
  {
    id: 'day',
    label: 'Morning light',
    caption: 'Bright daylight drifts across the room as you start your day.',
    targetProgress: 0.14,
  },
  {
    id: 'golden',
    label: 'Golden hour',
    caption: 'Warm late-afternoon sunbeams stretch across the rug.',
    targetProgress: 0.52,
  },
  {
    id: 'night',
    label: 'Quiet nights',
    caption: 'Soft moonlight settles in beside a warm desk lamp.',
    targetProgress: 0.88,
  },
] as const;

interface DustMote {
  x: number;
  y: number;
  r: number;
  speedX: number;
  phase: number;
  alpha: number;
}

const DUST_MOTES: readonly DustMote[] = Array.from({ length: 24 }, (_, i) => {
  const frac = (n: number) => n - Math.floor(n);
  return {
    x: frac(Math.sin(i * 12.9898 + 1.23) * 43758.5453),
    y: frac(Math.sin(i * 78.233 + 4.56) * 23421.6312),
    r: 1.3 + frac(Math.sin(i * 39.11) * 9182.11) * 2.1,
    speedX: 0.08 + frac(Math.cos(i * 19.7) * 5142.3) * 0.14,
    phase: i * 0.72,
    alpha: 0.3 + frac(Math.sin(i * 51.4) * 3211.7) * 0.45,
  };
});

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  alpha: number,
) {
  if (!img.complete || img.naturalWidth === 0 || alpha <= 0.005) {
    return;
  }

  const baseScale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const drawW = img.naturalWidth * baseScale * zoom;
  const drawH = img.naturalHeight * baseScale * zoom;
  const offsetX = (width - drawW) / 2 + panX * width;
  const offsetY = (height - drawH) / 2 + panY * height;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  ctx.restore();
}

function renderSequenceFrame(
  canvas: HTMLCanvasElement,
  images: Partial<Record<LightingMode, HTMLImageElement>>,
  progress: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  if (w === 0 || h === 0) return;

  const p = clamp01(progress);

  ctx.fillStyle = '#EDE2D3';
  ctx.fillRect(0, 0, w, h);

  const goldenBlend = smoothstep(0.28, 0.42, p);
  const nightBlend = smoothstep(0.64, 0.78, p);

  const dayWeight = 1 - goldenBlend;
  const goldenWeight = goldenBlend * (1 - nightBlend);
  const nightWeight = nightBlend;

  const zoom = 1.02 + Math.sin(p * Math.PI) * 0.04;
  const panX = (0.5 - p) * 0.02;
  const panY = Math.sin(p * Math.PI * 1.1) * -0.01;

  if (images.day) {
    drawCoverImage(ctx, images.day, w, h, zoom, panX, panY, dayWeight);
  }
  if (images.golden) {
    drawCoverImage(ctx, images.golden, w, h, zoom + 0.008, panX * 0.85, panY, goldenWeight);
  }
  if (images.night) {
    drawCoverImage(ctx, images.night, w, h, zoom + 0.014, panX * 0.7, panY, nightWeight);
  }

  // Warm diagonal sunbeams (Day -> Golden)
  const beamStrength = clamp01(dayWeight * 0.5 + goldenWeight * 0.9);
  if (beamStrength > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sweepShift = p * w * 0.26;
    const shafts = [
      { x0: -0.04 * w + sweepShift, topW: w * 0.16, botShift: w * 0.24, op: 0.13 },
      { x0: 0.15 * w + sweepShift, topW: w * 0.2, botShift: w * 0.28, op: 0.17 },
      { x0: 0.38 * w + sweepShift, topW: w * 0.11, botShift: w * 0.2, op: 0.1 },
    ];

    for (const shaft of shafts) {
      const grad = ctx.createLinearGradient(shaft.x0, 0, shaft.x0 + shaft.botShift, h);
      const warmTint =
        goldenWeight > dayWeight
          ? `rgba(255, 206, 128, ${shaft.op * beamStrength})`
          : `rgba(255, 246, 214, ${shaft.op * beamStrength})`;
      grad.addColorStop(0, warmTint);
      grad.addColorStop(0.65, `rgba(255, 224, 165, ${shaft.op * 0.4 * beamStrength})`);
      grad.addColorStop(1, 'rgba(255, 224, 165, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(shaft.x0, 0);
      ctx.lineTo(shaft.x0 + shaft.topW, 0);
      ctx.lineTo(shaft.x0 + shaft.topW + shaft.botShift, h);
      ctx.lineTo(shaft.x0 + shaft.botShift - w * 0.04, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Gentle sunlit motes
  ctx.save();
  for (const mote of DUST_MOTES) {
    const mx = ((mote.x + p * mote.speedX * 1.6) % 1) * w;
    const my =
      (((mote.y - p * 0.12 + Math.sin(p * Math.PI * 3 + mote.phase) * 0.025) % 1 + 1) % 1) * h;
    const radius = mote.r * Math.max(1, w / 1200);
    const alpha = mote.alpha * (0.55 + 0.45 * Math.sin(p * 10 + mote.phase));

    ctx.fillStyle =
      nightWeight > 0.55
        ? `rgba(255, 208, 122, ${alpha * 0.55})`
        : goldenWeight > 0.3
          ? `rgba(255, 221, 146, ${alpha * 0.78})`
          : `rgba(255, 250, 228, ${alpha * 0.65})`;

    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Warm desk lamp pool at night
  if (nightWeight > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lampX = w * 0.52;
    const lampY = h * 0.54;
    const lampGrad = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, w * 0.34);
    lampGrad.addColorStop(0, `rgba(255, 204, 124, ${0.26 * nightWeight})`);
    lampGrad.addColorStop(0.55, `rgba(240, 166, 82, ${0.1 * nightWeight})`);
    lampGrad.addColorStop(1, 'rgba(240, 166, 82, 0)');
    ctx.fillStyle = lampGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

export function ImageScrollSequence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const imagesRef = useRef<Partial<Record<LightingMode, HTMLImageElement>>>({});
  const progressRef = useRef<number>(0);

  const { reducedMotion } = useLenis();
  const [activeChapter, setActiveChapter] = useState<LightingMode>('day');

  const drawCurrent = useCallback((progress: number) => {
    progressRef.current = progress;
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderSequenceFrame(canvas, imagesRef.current, progress);
  }, []);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = canvasWrapRef.current;
    if (!canvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextW = Math.max(1, Math.round(rect.width * dpr));
    const nextH = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }

    drawCurrent(progressRef.current);
  }, [drawCurrent]);

  useEffect(() => {
    let cancelled = false;
    const entries: readonly [LightingMode, string][] = [
      ['day', HERO_SEQUENCE_IMAGES.day],
      ['golden', HERO_SEQUENCE_IMAGES.golden],
      ['night', HERO_SEQUENCE_IMAGES.night],
    ];

    for (const [mode, src] of entries) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!cancelled) {
          drawCurrent(progressRef.current);
        }
      };
      img.src = src;
      imagesRef.current[mode] = img;
    }

    return () => {
      cancelled = true;
    };
  }, [drawCurrent]);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    syncCanvasSize();
    const ro = new ResizeObserver(() => {
      syncCanvasSize();
    });
    ro.observe(wrap);

    return () => {
      ro.disconnect();
    };
  }, [syncCanvasSize]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const pinEl = pinRef.current;
    if (!sectionEl || !pinEl) return;

    const mm = gsap.matchMedia();

    mm.add(
      '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
      () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top top',
          end: '+=160%',
          scrub: 0.45,
          pin: pinEl,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = clamp01(self.progress);
            drawCurrent(p);
            const nextChapter: LightingMode =
              p < 0.35 ? 'day' : p < 0.7 ? 'golden' : 'night';
            setActiveChapter((prev) => (prev === nextChapter ? prev : nextChapter));
          },
        });

        drawCurrent(0);

        return () => {
          trigger.kill();
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, [drawCurrent]);

  const handleSelectChapter = (chapter: SequenceChapter) => {
    setActiveChapter(chapter.id);
    if (reducedMotion) {
      drawCurrent(chapter.targetProgress);
      return;
    }

    const proxy = { p: progressRef.current };
    gsap.to(proxy, {
      p: chapter.targetProgress,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: () => drawCurrent(proxy.p),
    });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Lighting through the day"
      className="relative bg-ns-elevated/45"
    >
      <div
        ref={pinRef}
        className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col justify-center px-5 py-20 sm:px-8"
      >
        <div className="max-w-xl">
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ns-ink">
            Light that follows your day.
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ns-ink-secondary">
            From bright morning sun to a quiet desk lamp at night.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_260px]">
          <div
            ref={canvasWrapRef}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-ns-elevated"
            style={{ boxShadow: 'var(--ns-specular-top), var(--ns-shadow-ambient)' }}
          >
            <canvas
              ref={canvasRef}
              aria-label="Room lighting transitioning from morning sunlight to golden hour and moonlit night"
              className="block h-full w-full"
            />
          </div>

          <div
            role="group"
            aria-label="Time of day"
            className="flex flex-col divide-y divide-[var(--ns-hairline)]"
          >
            {CHAPTERS.map((chapter) => {
              const isActive = activeChapter === chapter.id;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => handleSelectChapter(chapter)}
                  aria-pressed={isActive}
                  className="ns-pressable cursor-pointer py-5 text-left first:pt-0 last:pb-0"
                >
                  <span
                    className={[
                      'block font-display text-xl font-semibold tracking-[-0.02em] transition-colors duration-200',
                      isActive ? 'text-ns-ink' : 'text-ns-ink-tertiary',
                    ].join(' ')}
                  >
                    {chapter.label}
                  </span>
                  <p
                    className={[
                      'mt-1.5 text-sm leading-relaxed transition-colors duration-200',
                      isActive ? 'text-ns-ink-secondary' : 'text-ns-ink-tertiary/80',
                    ].join(' ')}
                  >
                    {chapter.caption}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImageScrollSequence;
