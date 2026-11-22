import { useEffect, useRef } from 'react';
import { useLenis } from '../hooks/useLenis';

export interface HeroCatChaseSvgProps {
  /** Pause animation immediately when pushed out of view during hero scroll. */
  paused?: boolean;
}

interface BladeSpec {
  dx: number;
  height: number;
  width: number;
  curve: number;
  gradIndex: number;
  hasVein: boolean;
}

interface FlowerSpec {
  dx: number;
  stemH: number;
  lean: number;
  petalColor: string;
}

interface GrassCluster {
  x: number;
  blades: BladeSpec[];
  flower?: FlowerSpec;
}

const TRACK_W = 540;
const TRACK_H = 84;
const BASE_Y = 76;
const SURFACE_Y = 71;

function frac(n: number): number {
  return n - Math.floor(n);
}

function rand(seed: number): number {
  return frac(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);
}

function buildClusters(
  count: number,
  seedBase: number,
  layer: 'back' | 'mid' | 'front',
): GrassCluster[] {
  const flowerColors = ['#FFFFFF', '#FFD86B', '#F294AF'];
  const clusters: GrassCluster[] = [];

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1);
    const x = 14 + u * (TRACK_W - 28) + (rand(seedBase + i * 7.1) - 0.5) * 4.5;
    const edgeTaper = Math.min(1, Math.min(u * 14, (1 - u) * 14) * 0.45 + 0.55);

    const bladesPerCluster = layer === 'front' ? 2 : 3;
    const blades: BladeSpec[] = [];

    for (let b = 0; b < bladesPerCluster; b++) {
      const s = seedBase + i * 31.3 + b * 11.7;
      const rH = rand(s + 1.1);
      const rC = rand(s + 2.3);
      const rW = rand(s + 3.7);

      const dx =
        (b - (bladesPerCluster - 1) / 2) * (layer === 'front' ? 4.4 : 3.6) +
        (rand(s + 5.1) - 0.5) * 2.2;
      const baseH =
        layer === 'back'
          ? 17 + rH * 13
          : layer === 'mid'
            ? 12 + rH * 10
            : 8.5 + rH * 8.5;
      const height = baseH * edgeTaper;
      const width = (layer === 'back' ? 2.4 : layer === 'mid' ? 2.5 : 2.1) + rW * 1.1;
      const curve = (rC - 0.5) * (layer === 'back' ? 11 : 8.5);
      const gradIndex =
        layer === 'back' ? (b % 2) : layer === 'mid' ? 2 + (b % 2) : 4 + (b % 2);

      blades.push({
        dx,
        height,
        width,
        curve,
        gradIndex,
        hasVein: layer !== 'back' && b === 0 && i % 2 === 0,
      });
    }

    let flower: FlowerSpec | undefined;
    if (layer === 'mid' && i >= 2 && i <= count - 3 && i % 5 === 2) {
      const fs = seedBase + i * 19.9;
      flower = {
        dx: (rand(fs) - 0.5) * 4,
        stemH: (14 + rand(fs + 2) * 8) * edgeTaper,
        lean: (rand(fs + 4) - 0.5) * 5,
        petalColor: flowerColors[Math.floor(i / 5) % flowerColors.length],
      };
    }

    clusters.push({ x, blades, flower });
  }

  return clusters;
}

const BACK_CLUSTERS = buildClusters(42, 11, 'back');
const MID_CLUSTERS = buildClusters(46, 107, 'mid');
const FRONT_CLUSTERS = buildClusters(38, 233, 'front');

function turfHeightAt(x: number): number {
  return SURFACE_Y + Math.sin(x * 0.032) * 0.9 + Math.cos(x * 0.075) * 0.4;
}

function createGrassGradients(ctx: CanvasRenderingContext2D): CanvasGradient[] {
  const specs: [string, string, string][] = [
    ['#355826', '#588B38', '#82BD4E'], // back-a
    ['#2D4C20', '#4A7A30', '#72AB43'], // back-b
    ['#4E7E32', '#7BB84A', '#AEDB65'], // mid-a
    ['#426E2B', '#6BA53E', '#99CB57'], // mid-b
    ['#5D923B', '#8AC752', '#BCE672'], // front-a
    ['#528333', '#7AB546', '#A9DA62'], // front-b
  ];
  return specs.map(([c0, c1, c2]) => {
    const g = ctx.createLinearGradient(0, BASE_Y, 0, BASE_Y - 30);
    g.addColorStop(0, c0);
    g.addColorStop(0.55, c1);
    g.addColorStop(1, c2);
    return g;
  });
}

function drawBlade(
  ctx: CanvasRenderingContext2D,
  x: number,
  b: BladeSpec,
  gradients: CanvasGradient[],
  veinAlpha: number,
) {
  const bx = x + b.dx;
  const hw = b.width * 0.5;
  const tipX = bx + b.curve;
  const tipY = BASE_Y - b.height;
  const c1x = bx - hw * 0.5 + b.curve * 0.32;
  const c1y = BASE_Y - b.height * 0.52;
  const c2x = bx + hw * 0.5 + b.curve * 0.42;
  const c2y = BASE_Y - b.height * 0.48;

  ctx.fillStyle = gradients[b.gradIndex];
  ctx.beginPath();
  ctx.moveTo(bx - hw, BASE_Y);
  ctx.quadraticCurveTo(c1x, c1y, tipX, tipY);
  ctx.quadraticCurveTo(c2x, c2y, bx + hw, BASE_Y);
  ctx.closePath();
  ctx.fill();

  if (b.hasVein) {
    ctx.strokeStyle = `rgba(232, 252, 186, ${veinAlpha})`;
    ctx.lineWidth = 0.65;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, BASE_Y - 1);
    ctx.quadraticCurveTo(bx + b.curve * 0.34, BASE_Y - b.height * 0.46, bx + b.curve * 0.82, BASE_Y - b.height * 0.82);
    ctx.stroke();
  }
}

function drawFlower(ctx: CanvasRenderingContext2D, cx: number, f: FlowerSpec) {
  const x0 = cx + f.dx;
  const tipX = x0 + f.lean;
  const tipY = BASE_Y - f.stemH;

  ctx.strokeStyle = '#5A8F3A';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, BASE_Y);
  ctx.quadraticCurveTo(x0 + f.lean * 0.45, BASE_Y - f.stemH * 0.55, tipX, tipY);
  ctx.stroke();

  ctx.fillStyle = f.petalColor;
  for (let p = 0; p < 5; p++) {
    const rad = (p * 72 * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(tipX + Math.cos(rad) * 1.55, tipY + Math.sin(rad) * 1.55, 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#E89E2E';
  ctx.beginPath();
  ctx.arc(tipX, tipY, 1.05, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawYarnBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rotRad: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(rotRad);

  ctx.fillStyle = '#7D221D';
  ctx.beginPath();
  ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#C8433B';
  ctx.beginPath();
  ctx.arc(-0.8, -0.8, 9.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(227, 106, 95, 0.75)';
  ctx.beginPath();
  ctx.arc(-2.4, -2.4, 6.0, 0, Math.PI * 2);
  ctx.fill();

  const strands: [number, number, number, number, string, number][] = [
    [0, 9.4, 3.9, (24 * Math.PI) / 180, 'rgba(130, 32, 27, 0.65)', 1.6],
    [0, 9.2, 3.7, (-34 * Math.PI) / 180, 'rgba(218, 88, 78, 0.65)', 1.6],
    [-1.2, 7.9, 2.9, (74 * Math.PI) / 180, 'rgba(242, 146, 134, 0.58)', 1.4],
  ];
  for (const [cy, rx, ry, ang, stroke, lw] of strands) {
    ctx.save();
    ctx.rotate(ang);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(255, 224, 214, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-3.4, -3.4, 2.9, 2.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(72, 21, 18, 0.55)';
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  deg: number,
  w: number,
  h: number,
  furColor: string,
  pawColor: string,
  pawDx: number,
  pawRx: number,
) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.rotate((deg * Math.PI) / 180);

  drawRoundedRect(ctx, -w * 0.5, -1.2, w, h, w * 0.5);
  ctx.fillStyle = furColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(92, 51, 23, 0.28)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = pawColor;
  ctx.beginPath();
  ctx.ellipse(pawDx, h - 1.3, pawRx, 2.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(92, 51, 23, 0.22)';
  ctx.lineWidth = 0.65;
  ctx.stroke();

  ctx.restore();
}

function drawSideCat(
  ctx: CanvasRenderingContext2D,
  catX: number,
  catY: number,
  scale: number,
  bodyPitchDeg: number,
  counterHeadDeg: number,
  frontNearDeg: number,
  frontFarDeg: number,
  backNearDeg: number,
  backFarDeg: number,
  wave1: number,
  wave2: number,
) {
  ctx.save();
  ctx.translate(catX, catY);
  ctx.scale(scale, scale);
  ctx.rotate((bodyPitchDeg * Math.PI) / 180);

  // Raised waving tail
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-15, -3);
  ctx.bezierCurveTo(-24, wave1, -31, wave2 + 5, -37, wave2);
  ctx.strokeStyle = 'rgba(92, 51, 23, 0.3)';
  ctx.lineWidth = 6.4;
  ctx.stroke();
  ctx.strokeStyle = '#DC843C';
  ctx.lineWidth = 4.6;
  ctx.stroke();

  // Far-side legs
  drawLeg(ctx, -10.5, 4.5, backFarDeg, 5.2, 11.5, '#C26E2A', '#EBD0B0', 0.6, 3.1);
  drawLeg(ctx, 10.5, 4.5, frontFarDeg, 4.8, 11.5, '#C26E2A', '#EBD0B0', 0.8, 3.0);

  // Rounded side-view torso
  ctx.fillStyle = '#E08940';
  ctx.strokeStyle = 'rgba(92, 51, 23, 0.3)';
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17.5, 8.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cream belly
  ctx.fillStyle = 'rgba(247, 225, 196, 0.9)';
  ctx.beginPath();
  ctx.moveTo(-11, 4.2);
  ctx.quadraticCurveTo(0, 9.2, 12, 4.5);
  ctx.quadraticCurveTo(2, 6.8, -11, 4.2);
  ctx.closePath();
  ctx.fill();

  // Mackerel tabby stripes
  ctx.strokeStyle = 'rgba(158, 72, 22, 0.76)';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  const stripes: [number, number, number, number, number, number][] = [
    [-9, -8.1, -7.2, -3, -8.5, 0.5],
    [-3, -8.6, -1.2, -3.2, -2.4, 0.8],
    [3, -8.5, 4.8, -3.2, 3.6, 0.6],
    [9, -7.4, 10.4, -3.2, 9.4, -0.2],
  ];
  ctx.beginPath();
  for (const [x0, y0, cx0, cy0, x1, y1] of stripes) {
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx0, cy0, x1, y1);
  }
  ctx.stroke();

  // Subtle back highlight
  ctx.fillStyle = 'rgba(240, 173, 110, 0.38)';
  ctx.beginPath();
  ctx.ellipse(-1, -5.2, 10, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Near-side legs
  drawLeg(ctx, -13.5, 4.5, backNearDeg, 5.6, 12, '#E08940', '#F5DDC1', 0.9, 3.3);
  drawLeg(ctx, 13.5, 4.5, frontNearDeg, 5.0, 12, '#E08940', '#F5DDC1', 1.0, 3.2);

  // Side-profile Head
  ctx.save();
  ctx.translate(17.5, -6.5);
  ctx.rotate((counterHeadDeg * Math.PI) / 180);

  // Far ear
  ctx.fillStyle = '#C26E2A';
  ctx.strokeStyle = 'rgba(92, 51, 23, 0.3)';
  ctx.lineWidth = 0.85;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -5);
  ctx.lineTo(3.6, -13.5);
  ctx.lineTo(6.8, -5.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Skull
  ctx.fillStyle = '#E08940';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(1.5, 0, 9.4, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Near ear + inner ear
  ctx.fillStyle = '#D47C35';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-5.2, -4.4);
  ctx.lineTo(-2.2, -14.4);
  ctx.lineTo(3.4, -6.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(235, 177, 170, 0.9)';
  ctx.beginPath();
  ctx.moveTo(-3.8, -5.8);
  ctx.lineTo(-1.8, -12.0);
  ctx.lineTo(1.6, -6.8);
  ctx.closePath();
  ctx.fill();

  // Forehead stripes
  ctx.strokeStyle = 'rgba(158, 72, 22, 0.78)';
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(1.2, -7.6);
  ctx.lineTo(2.2, -4.8);
  ctx.moveTo(4.2, -7.2);
  ctx.lineTo(4.8, -4.8);
  ctx.stroke();

  // Cream muzzle
  ctx.fillStyle = 'rgba(248, 229, 203, 0.95)';
  ctx.beginPath();
  ctx.ellipse(8.2, 2.6, 4.0, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Green eye + pupil + catchlight
  ctx.fillStyle = 'rgba(92, 51, 23, 0.84)';
  ctx.beginPath();
  ctx.ellipse(6.2, -1.2, 2.5, 2.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#74BD55';
  ctx.beginPath();
  ctx.ellipse(6.3, -1.2, 2.1, 2.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1A130F';
  ctx.beginPath();
  ctx.ellipse(6.9, -1.2, 0.95, 1.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFCF6';
  ctx.beginPath();
  ctx.arc(5.7, -2.1, 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Nose + smile
  ctx.fillStyle = '#DC8578';
  ctx.beginPath();
  ctx.moveTo(10.4, 0.6);
  ctx.lineTo(12.2, 1.8);
  ctx.lineTo(10.2, 2.7);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(92, 51, 23, 0.7)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(9.6, 3.5);
  ctx.quadraticCurveTo(8.4, 4.7, 7.1, 4.0);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = 'rgba(255, 248, 238, 0.88)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(9.2, 2.2);
  ctx.lineTo(16.2, 0.8);
  ctx.moveTo(9.0, 3.2);
  ctx.lineTo(16.0, 3.8);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

/**
 * High-performance 2x HiDPI Canvas animation anchored beneath the hero headline:
 * Multi-layered Sunlit Garden grass with spring-damped wave physics, 5-petal wildflowers,
 * and a side-view NekoScape Mackerel Ginger Tabby chasing the rolling crimson yarn ball.
 * Automatically pauses when offscreen or pushed above the viewport during hero scroll.
 */
export function HeroCatChaseSvg({ paused = false }: HeroCatChaseSvgProps) {
  const { reducedMotion } = useLenis();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(TRACK_W * dpr);
    canvas.height = Math.round(TRACK_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gradients = createGrassGradients(ctx);

    const catScale = 1.38;
    const yarnScale = 1.14;
    const yarnR = 10.5 * yarnScale;
    const trackSpan = 700;
    const gravity = 340;

    const midAngles = new Float32Array(MID_CLUSTERS.length);
    const midVels = new Float32Array(MID_CLUSTERS.length);
    const frontAngles = new Float32Array(FRONT_CLUSTERS.length);
    const frontVels = new Float32Array(FRONT_CLUSTERS.length);

    let yarnX = 240;
    let yarnVx = 110;
    let yarnVy = 0;
    let yarnAirY = 0;
    let yarnRotRad = 0;

    let catX = 138;
    let catVx = 110;
    let catAirY = 0;
    let catVy = 0;
    let gallopPhase = 0.65;
    let elapsedSec = 0;

    const updateSprings = (
      clusters: GrassCluster[],
      angles: Float32Array,
      vels: Float32Array,
      dt: number,
      stiffness: number,
      damping: number,
      strength: number,
      isStatic: boolean,
    ) => {
      for (let i = 0; i < clusters.length; i++) {
        const gx = clusters[i].x;
        const breeze = isStatic
          ? 0
          : Math.sin(elapsedSec * 2.4 - gx * 0.028) * 3.4 +
            Math.sin(elapsedSec * 4.3 - gx * 0.065) * 1.4;

        let push = 0;
        const dYarn = gx - yarnX;
        if (Math.abs(dYarn) < 26) {
          const f = 1 - Math.abs(dYarn) / 26;
          push += (14 + (dYarn >= 0 ? 22 : -10)) * f * f * strength;
        }
        const dCat = gx - catX;
        if (Math.abs(dCat) < 42) {
          const f = 1 - Math.abs(dCat) / 42;
          push += (dCat >= 0 ? 26 : -32) * f * f * strength;
        }

        if (isStatic) {
          angles[i] = push * 0.72;
        } else {
          const acc = (breeze + push - angles[i]) * stiffness - vels[i] * damping;
          vels[i] += acc * dt;
          angles[i] += vels[i] * dt;
          if (angles[i] > 42) angles[i] = 42;
          if (angles[i] < -42) angles[i] = -42;
        }
      }
    };

    const drawFrame = (dt: number, isStatic: boolean) => {
      updateSprings(MID_CLUSTERS, midAngles, midVels, dt, 115, 7.5, 0.85, isStatic);
      updateSprings(FRONT_CLUSTERS, frontAngles, frontVels, dt, 145, 6.8, 1.2, isStatic);

      ctx.clearRect(0, 0, TRACK_W, TRACK_H);

      // Subtle meadow root shadow line
      ctx.strokeStyle = 'rgba(45, 72, 28, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(14, BASE_Y + 1.5);
      ctx.lineTo(TRACK_W - 14, BASE_Y + 1.5);
      ctx.stroke();

      // 1. Back tall grass
      for (let i = 0; i < BACK_CLUSTERS.length; i++) {
        const c = BACK_CLUSTERS[i];
        for (let b = 0; b < c.blades.length; b++) {
          drawBlade(ctx, c.x, c.blades[b], gradients, 0.34);
        }
      }

      // 2. Mid spring-reactive grass + 5-petal wildflowers
      for (let i = 0; i < MID_CLUSTERS.length; i++) {
        const c = MID_CLUSTERS[i];
        ctx.save();
        ctx.translate(c.x, BASE_Y);
        ctx.rotate((midAngles[i] * Math.PI) / 180);
        ctx.translate(-c.x, -BASE_Y);
        for (let b = 0; b < c.blades.length; b++) {
          drawBlade(ctx, c.x, c.blades[b], gradients, 0.34);
        }
        if (c.flower) {
          drawFlower(ctx, c.x, c.flower);
        }
        ctx.restore();
      }

      // 3. Cat & Yarn Ball (clean edge alpha fade when entering/exiting the meadow)
      const yarnGround = turfHeightAt(yarnX);
      const catGround = turfHeightAt(catX);
      const yarnCenterY = yarnGround - yarnR + 2.2 - yarnAirY;

      const edgeAlpha = (px: number) => {
        if (px < 40) return Math.max(0, (px + 10) / 50);
        if (px > TRACK_W - 40) return Math.max(0, (TRACK_W + 10 - px) / 50);
        return 1;
      };

      const yarnAlpha = edgeAlpha(yarnX);
      if (yarnAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = yarnAlpha;

        // Yarn ground shadow
        ctx.fillStyle = `rgba(29, 50, 18, ${Math.max(0.1, 0.28 - yarnAirY * 0.02)})`;
        ctx.beginPath();
        ctx.ellipse(yarnX, yarnGround + 1.5, Math.max(7, 11.5 - yarnAirY * 0.45), 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trailing crimson yarn thread
        const tx0 = yarnX - yarnR * 0.68;
        const t0y = yarnGround - 0.8 - yarnAirY * 0.4;
        const t1x = tx0 - 16;
        const t2x = tx0 - 34;
        const t3x = tx0 - 52;
        const ripple = isStatic ? 0 : Math.sin(elapsedSec * 9.0) * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx0, t0y);
        ctx.bezierCurveTo(
          t1x,
          turfHeightAt(t1x) - 2.0 + ripple,
          t2x,
          turfHeightAt(t2x) - 0.4 - ripple,
          t3x,
          turfHeightAt(t3x) - 1.0,
        );
        ctx.strokeStyle = 'rgba(185, 55, 48, 0.95)';
        ctx.lineWidth = 2.8;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(231, 120, 109, 0.55)';
        ctx.lineWidth = 1.05;
        ctx.stroke();

        drawYarnBall(ctx, yarnX, yarnCenterY, yarnScale, yarnRotRad);
        ctx.restore();
      }

      const catAlpha = edgeAlpha(catX);
      if (catAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = catAlpha;

        const strideSin = Math.sin(gallopPhase);
        const strideCos = Math.cos(gallopPhase);
        const frontNearDeg = isStatic ? -30 : -strideSin * 38 - 6;
        const frontFarDeg = isStatic ? -14 : -Math.sin(gallopPhase - 0.55) * 34 - 4;
        const backNearDeg = isStatic ? 32 : strideSin * 40 + 6;
        const backFarDeg = isStatic ? 16 : Math.sin(gallopPhase - 0.55) * 36 + 4;

        const maxLegAngleRad =
          (Math.min(Math.abs(frontNearDeg), Math.abs(backNearDeg)) * Math.PI) / 180;
        const legFootReachY = (4.5 + 11.4 * Math.cos(maxLegAngleRad)) * catScale;
        const bodyPitch = isStatic ? -2.5 : strideCos * -5.2 - catVy * 0.06;
        const counterHead = -bodyPitch * 0.7 + (isStatic ? 1 : Math.sin(gallopPhase) * 2.0);
        const catCenterY = catGround - legFootReachY + 3.0 - catAirY;

        // Cat ground shadow
        ctx.fillStyle = `rgba(29, 50, 18, ${Math.max(0.1, 0.28 - catAirY * 0.018)})`;
        ctx.beginPath();
        ctx.ellipse(catX + 1.5, catGround + 1.5, Math.max(16, 25 - catAirY * 0.9), 3.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soft paw dust puffs
        if (!isStatic) {
          const p1 = (elapsedSec * 2.5) % 1;
          const p2 = (elapsedSec * 2.5 + 0.5) % 1;
          ctx.fillStyle = `rgba(226, 211, 188, ${(1 - p1) * 0.34})`;
          ctx.beginPath();
          ctx.arc(catX - 22 - p1 * 22, catGround - 2.5 - p1 * 8.5, 1.8 + p1 * 2.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(226, 211, 188, ${(1 - p2) * 0.28})`;
          ctx.beginPath();
          ctx.arc(catX - 16 - p2 * 24, catGround - 1.5 - p2 * 6.5, 1.5 + p2 * 2.0, 0, Math.PI * 2);
          ctx.fill();
        }

        const wave1 = isStatic ? -10 : -11 + Math.sin(gallopPhase * 0.65) * 4.5;
        const wave2 = isStatic ? -22 : -22 + Math.cos(gallopPhase * 0.65 - 0.6) * 5.2;

        drawSideCat(
          ctx,
          catX,
          catCenterY,
          catScale,
          bodyPitch,
          counterHead,
          frontNearDeg,
          frontFarDeg,
          backNearDeg,
          backFarDeg,
          wave1,
          wave2,
        );
        ctx.restore();
      }

      // 4. Foreground sunlit blades with spring-damped wake physics
      for (let i = 0; i < FRONT_CLUSTERS.length; i++) {
        const c = FRONT_CLUSTERS[i];
        ctx.save();
        ctx.translate(c.x, BASE_Y);
        ctx.rotate((frontAngles[i] * Math.PI) / 180);
        ctx.translate(-c.x, -BASE_Y);
        for (let b = 0; b < c.blades.length; b++) {
          drawBlade(ctx, c.x, c.blades[b], gradients, 0.42);
        }
        ctx.restore();
      }
    };

    if (reducedMotion) {
      yarnX = 336;
      catX = 232;
      yarnRotRad = 2.4;
      drawFrame(0.016, true);
      return;
    }

    let rafId = 0;
    let isVisible = true;
    let lastNow = performance.now();

    const step = (now: number) => {
      rafId = 0;
      if (!isVisible || document.hidden || pausedRef.current) {
        lastNow = now;
        return;
      }

      const dt = Math.min(0.035, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      elapsedSec += dt;

      yarnVx = 108 + Math.sin(elapsedSec * 1.9) * 14;
      yarnX += yarnVx * dt;
      yarnRotRad += (yarnVx * dt) / yarnR;

      yarnVy -= gravity * dt;
      yarnAirY += yarnVy * dt;
      if (yarnAirY <= 0) {
        yarnAirY = 0;
        if (Math.abs(Math.sin(yarnX * 0.065)) > 0.96 && yarnVy < -10) {
          yarnVy = 26;
        } else {
          yarnVy = 0;
        }
      }

      const desiredGap = 96 + Math.sin(elapsedSec * 2.7) * 9;
      const targetCatX = yarnX - desiredGap;
      catVx += ((targetCatX - catX) * 10 - (catVx - yarnVx) * 4.5) * dt;
      catVx = Math.max(70, Math.min(170, catVx));
      catX += catVx * dt;

      const prevSin = Math.sin(gallopPhase);
      gallopPhase += (catVx / 110) * 13.5 * dt;
      const currSin = Math.sin(gallopPhase);

      if (catAirY <= 0.01 && prevSin <= 0 && currSin > 0) {
        catVy = 50;
      }
      catVy -= gravity * dt;
      catAirY += catVy * dt;
      if (catAirY <= 0) {
        catAirY = 0;
        catVy = 0;
      }

      if (catX > TRACK_W + 80) {
        yarnX -= trackSpan;
        catX -= trackSpan;
      }

      drawFrame(dt, false);
      rafId = window.requestAnimationFrame(step);
    };

    const startLoop = () => {
      if (rafId === 0 && isVisible && !document.hidden && !pausedRef.current) {
        lastNow = performance.now();
        rafId = window.requestAnimationFrame(step);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) {
          startLoop();
        } else if (rafId !== 0) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const handleVisibility = () => {
      if (!document.hidden) startLoop();
    };
    const handleResumeCheck = () => {
      if (!pausedRef.current) startLoop();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('ns:hero-chase-resume', handleResumeCheck);

    drawFrame(0.016, false);
    startLoop();

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('ns:hero-chase-resume', handleResumeCheck);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!paused) {
      window.dispatchEvent(new Event('ns:hero-chase-resume'));
    }
  }, [paused]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none mx-auto -mt-1 w-full max-w-[600px] select-none sm:-mt-2"
    >
      <canvas
        ref={canvasRef}
        width={TRACK_W}
        height={TRACK_H}
        className="block h-[80px] w-full sm:h-[94px]"
      />
    </div>
  );
}

export default HeroCatChaseSvg;
