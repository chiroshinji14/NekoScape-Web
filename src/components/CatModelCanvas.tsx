import { useEffect, useRef } from 'react';
import type { BreedCoatVariant, BreedDefinition } from '../types/nekoscape';
import { useLenis } from '../hooks/useLenis';

export interface CatModelCanvasProps {
  breed: BreedDefinition;
  variantIndex: number;
  isKitten: boolean;
}

const KITTEN_BODY_SCALE = 0.68;
const KITTEN_HEAD_SCALE = 0.84;
const KITTEN_EAR_SCALE = 1.15;
const KITTEN_EYE_SCALE = 1.18;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lerpHex(hexA: string, hexB: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(r1 + (r2 - r1) * k);
  const g = Math.round(g1 + (g2 - g1) * k);
  const b = Math.round(b1 + (b2 - b1) * k);
  return `rgb(${r}, ${g}, ${b})`;
}

function drawRotatedEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  angle: number,
  fillStyle?: string,
  strokeStyle?: string,
  lineWidth = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function drawQuadArc(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

function drawForeheadM(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  color: string,
  width: number,
  alpha: number,
) {
  ctx.save();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(rx * 0.36, -ry * 0.38);
  ctx.lineTo(-rx * 0.06, -ry * 0.27);
  ctx.lineTo(rx * 0.24, -ry * 0.12);
  ctx.lineTo(-rx * 0.14, 0);
  ctx.lineTo(rx * 0.24, ry * 0.12);
  ctx.lineTo(-rx * 0.06, ry * 0.27);
  ctx.lineTo(rx * 0.36, ry * 0.38);
  ctx.stroke();
  ctx.restore();
}

function fillSkullShape(
  ctx: CanvasRenderingContext2D,
  shape: BreedDefinition['anatomy']['head']['shape'],
  rx: number,
  ry: number,
  expand: number,
  fillStyle: string,
) {
  const erx = rx + expand;
  const ery = ry + expand;
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  if (shape === 'Wedge' || shape === 'SculptedWedge' || shape === 'ChiseledTriangle') {
    ctx.moveTo(erx * 1.04, 0);
    ctx.bezierCurveTo(erx * 0.72, -ery * 0.76, -erx * 0.18, -ery * 1.06, -erx * 0.88, -ery * 0.62);
    ctx.quadraticCurveTo(-erx * 1.04, 0, -erx * 0.88, ery * 0.62);
    ctx.bezierCurveTo(-erx * 0.18, ery * 1.06, erx * 0.72, ery * 0.76, erx * 1.04, 0);
  } else if (shape === 'SquareMuzzle') {
    ctx.moveTo(erx * 0.96, -ery * 0.34);
    ctx.quadraticCurveTo(erx * 1.04, 0, erx * 0.96, ery * 0.34);
    ctx.bezierCurveTo(erx * 0.65, ery * 0.96, -erx * 0.4, ery * 1.04, -erx * 0.92, ery * 0.62);
    ctx.quadraticCurveTo(-erx * 1.04, 0, -erx * 0.92, -ery * 0.62);
    ctx.bezierCurveTo(-erx * 0.4, -ery * 1.04, erx * 0.65, -ery * 0.96, erx * 0.96, -ery * 0.34);
  } else {
    ctx.ellipse(0, 0, erx, ery, 0, 0, Math.PI * 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBreedTail(
  ctx: CanvasRenderingContext2D,
  breed: BreedDefinition,
  coat: BreedCoatVariant,
  hipsX: number,
  isKitten: boolean,
  timeSec: number,
) {
  const tSpec = breed.anatomy.tail;
  const kMul = isKitten ? 0.78 : 1;
  const segCount = Math.max(2, tSpec.segments);
  const segLen = tSpec.segmentLength * kMul;
  const rootX = hipsX - tSpec.rootOffset * (isKitten ? KITTEN_BODY_SCALE : 1);

  const nodes: { x: number; y: number }[] = [{ x: rootX, y: 0 }];
  let cx = rootX;
  let cy = 0;
  const sway = Math.sin(timeSec * 1.85 * tSpec.swayFreqMultiplier) * 0.24 * tSpec.swayAmpMultiplier;

  for (let i = 1; i <= segCount; i++) {
    const frac = i / segCount;
    const angle = Math.PI + tSpec.restCurveBias * 1.15 * frac + sway * frac * frac * 1.8;
    cx += Math.cos(angle) * segLen;
    cy += Math.sin(angle) * segLen;
    nodes.push({ x: cx, y: cy });
  }

  const widthAt = (t: number) => {
    const base =
      t < 0.5
        ? tSpec.rootWidth + (tSpec.midWidth - tSpec.rootWidth) * (t * 2)
        : tSpec.midWidth + (tSpec.tipWidth - tSpec.midWidth) * ((t - 0.5) * 2);
    return base * kMul;
  };

  if (tSpec.style === 'PomPomBobtail') {
    const root = nodes[0];
    const tip = nodes[nodes.length - 1];
    const px = (root.x + tip.x) * 0.5;
    const py = (root.y + tip.y) * 0.5;
    const puffR = tSpec.midWidth * 0.52 * kMul;
    const isCalico = coat.pattern === 'MikeCalico' || coat.pattern === 'Calico';

    drawRotatedEllipse(ctx, px, py, puffR + 1.4, puffR + 1.4, 0, rgba(coat.eyeRimColor, 0.24));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const lx = px + Math.cos(a) * puffR * 0.42;
      const ly = py + Math.sin(a) * puffR * 0.42;
      const col = isCalico
        ? i % 3 === 0
          ? coat.secondaryPatchColor
          : i % 3 === 1
            ? coat.stripeColor
            : coat.baseColor
        : coat.tailBaseColor;
      drawRotatedEllipse(ctx, lx, ly, puffR * 0.64, puffR * 0.64, 0, rgba(col, 0.98));
    }
    drawRotatedEllipse(
      ctx,
      tip.x,
      tip.y,
      puffR * 0.72,
      puffR * 0.72,
      0,
      rgba(isCalico ? coat.tailTipColor : coat.highlightColor, 0.85),
    );
    return;
  }

  const isPlume =
    tSpec.style === 'PlumeBrush' ||
    tSpec.style === 'GiantPlume' ||
    tSpec.style === 'SilkyPlume' ||
    tSpec.style === 'FeatheredPlume';

  if (isPlume) {
    for (let i = 0; i < segCount; i++) {
      const p0 = nodes[i];
      const p1 = nodes[i + 1];
      const tMid = (i + 0.5) / segCount;
      const w = widthAt(tMid);
      const segColor =
        coat.pattern === 'Calico' || coat.pattern === 'MikeCalico' || coat.pattern === 'Tortoiseshell'
          ? i >= segCount - 2
            ? coat.tailTipColor
            : coat.tailBaseColor
          : coat.pattern === 'MittedColorpoint' || coat.pattern === 'Colorpoint'
            ? lerpHex(coat.tailBaseColor, coat.pointColor, Math.pow(tMid, 0.7))
            : lerpHex(coat.tailBaseColor, coat.tailTipColor, tMid * 0.85);
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = rgba(coat.eyeRimColor, 0.22);
      ctx.lineWidth = w + 2.2;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      const steps = tSpec.style === 'GiantPlume' ? 3 : 2;
      const prx = Math.max(4.0, w * 0.56);
      const pry = Math.max(4.3, w * 0.64);
      for (let s = 0; s < steps; s++) {
        const u = (s + 0.5) / steps;
        drawRotatedEllipse(
          ctx,
          p0.x + (p1.x - p0.x) * u,
          p0.y + (p1.y - p0.y) * u,
          prx,
          pry,
          ang,
          segColor,
        );
      }
    }
    for (let i = 0; i < segCount; i++) {
      const p0 = nodes[i];
      const p1 = nodes[i + 1];
      const w = widthAt((i + 0.5) / segCount);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = rgba(coat.highlightColor, 0.36);
      ctx.lineWidth = w * 0.34;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
    return;
  }

  // Standard / Whip / Plush / Leopard / Hairless tail
  for (let i = 0; i < segCount; i++) {
    const p0 = nodes[i];
    const p1 = nodes[i + 1];
    const tMid = (i + 0.5) / segCount;
    const w = widthAt(tMid);
    let col: string;
    if (coat.pattern === 'Colorpoint' || coat.pattern === 'MittedColorpoint') {
      col = lerpHex(coat.tailBaseColor, coat.pointColor, Math.pow(tMid, 0.72));
    } else if (coat.pattern === 'Tuxedo' || coat.pattern === 'Bicolor') {
      col = i === segCount - 1 ? coat.tailTipColor : coat.tailBaseColor;
    } else if (coat.pattern === 'Calico' || coat.pattern === 'MikeCalico' || coat.pattern === 'Tortoiseshell') {
      col = i >= segCount - 2 ? coat.tailTipColor : coat.tailBaseColor;
    } else if (coat.pattern === 'TickedAgouti') {
      col = i >= segCount - 2 ? lerpHex(coat.tailBaseColor, coat.tailTipColor, (tMid - 0.5) * 2) : coat.tailBaseColor;
    } else {
      col = lerpHex(coat.tailBaseColor, coat.tailTipColor, (i / segCount) * 0.85);
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(coat.eyeRimColor, 0.24);
    ctx.lineWidth = w + 1.8;
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.stroke();

    // Tail rings for tabby & bengal
    if (
      (coat.pattern === 'TabbyMackerel' ||
        coat.pattern === 'TabbyClassic' ||
        coat.pattern === 'RosetteSpotted' ||
        coat.pattern === 'RosetteMarbled') &&
      i > 0 &&
      i < segCount
    ) {
      const mx = (p0.x + p1.x) * 0.5;
      const my = (p0.y + p1.y) * 0.5;
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x) + Math.PI / 2;
      drawRotatedEllipse(ctx, mx, my, w * 0.48, 1.35 * kMul, ang, rgba(coat.stripeColor, 0.72));
    }
    ctx.restore();
  }
}

function drawBreedPaws(
  ctx: CanvasRenderingContext2D,
  breed: BreedDefinition,
  coat: BreedCoatVariant,
  torsoX: number,
  hipsX: number,
  scale: number,
) {
  const leg = breed.anatomy.legs;
  const pawR = leg.pawRadius * scale;
  const rx = pawR * leg.pawAspectX;
  const ry = pawR;

  const points = [
    { x: torsoX + leg.frontReach * scale, y: -leg.frontSideSpan * scale },
    { x: torsoX + leg.frontReach * scale, y: leg.frontSideSpan * scale },
    { x: hipsX + leg.backReach * scale, y: -leg.backSideSpan * scale },
    { x: hipsX + leg.backReach * scale, y: leg.backSideSpan * scale },
  ];

  for (const p of points) {
    if (leg.fluffyPaws) {
      drawRotatedEllipse(ctx, p.x, p.y, rx * 1.18, ry * 1.14, 0, rgba(coat.highlightColor, 0.45));
    }
    drawRotatedEllipse(ctx, p.x, p.y, rx, ry, 0, coat.pawColor, rgba(coat.eyeRimColor, 0.32), 0.9);
    if (leg.visibleToes) {
      ctx.save();
      ctx.strokeStyle = rgba(coat.wrinkleColor, 0.45);
      ctx.lineWidth = 0.7;
      ctx.lineCap = 'round';
      for (const off of [-0.34, 0.34]) {
        ctx.beginPath();
        ctx.moveTo(p.x + rx * 0.25, p.y + ry * off);
        ctx.lineTo(p.x + rx * 0.85, p.y + ry * off * 1.1);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function drawBodyAndMarkings(
  ctx: CanvasRenderingContext2D,
  breed: BreedDefinition,
  coat: BreedCoatVariant,
  hipsX: number,
  torsoX: number,
  headX: number,
  sx: number,
  sy: number,
  isKitten: boolean,
) {
  const b = breed.anatomy.body;
  const scale = Math.min(sx, sy);
  const rHip = b.hipRadius * scale;
  const rTorso = b.torsoRadius * scale;
  const rNeck = b.neckRadius * scale;
  const midX = (hipsX + torsoX) * 0.5;

  // Kitten downy fluff ring
  if (isKitten) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const useTorso = Math.cos(a) >= 0;
      const ax = useTorso ? torsoX : hipsX;
      const br = useTorso ? rTorso : rHip;
      drawRotatedEllipse(ctx, ax + Math.cos(a) * (br - 0.4), Math.sin(a) * (br - 0.4), 2.3, 2.3, 0, rgba(coat.highlightColor, 0.42));
    }
  }

  // Longhair fur scallops
  if (b.furScallopCount > 0 && b.furScallopDepth > 0) {
    const depth = b.furScallopDepth * scale;
    for (let pass = 0; pass < 2; pass++) {
      const fill = pass === 0 ? rgba(coat.eyeRimColor, 0.18) : rgba(coat.baseColor, 0.98);
      const rr = pass === 0 ? depth * 1.28 + 1.0 : depth * 1.24;
      for (let i = 0; i < b.furScallopCount; i++) {
        const a = (i / b.furScallopCount) * Math.PI * 2;
        const useTorso = Math.cos(a) >= 0;
        const ax = useTorso ? torsoX : hipsX;
        const br = useTorso ? rTorso : rHip;
        drawRotatedEllipse(ctx, ax + Math.cos(a) * (br - depth * 0.18), Math.sin(a) * (br - depth * 0.18), rr, rr, 0, fill);
      }
    }
  }

  // Base organic body outline + fill
  const fillBodySilhouette = (expand: number, fillStyle: string) => {
    const rh = rHip + expand;
    const rt = rTorso + expand;
    const rn = rNeck * 0.74 + expand;
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(hipsX, 0, rh, Math.PI * 0.5, Math.PI * 1.5);
    ctx.quadraticCurveTo(torsoX, -rt * 1.05, headX, -rn);
    ctx.arc(headX, 0, rn, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.quadraticCurveTo(torsoX, rt * 1.05, hipsX, rh);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  fillBodySilhouette(1.05, rgba(coat.eyeRimColor, 0.24));
  fillBodySilhouette(0, coat.baseColor);

  // Subtle top-down coat shading
  drawRotatedEllipse(ctx, midX, 0, (torsoX - hipsX) * 0.55 + rTorso * 0.45, rTorso * 0.72, 0, rgba(coat.shadowColor, 0.14));

  // Chest mane for Persian / Maine Coon / Ragdoll
  if (b.hasChestMane && b.maneScale > 0) {
    const ms = b.maneScale * scale;
    const mx = torsoX + 5.6 * sx;
    drawRotatedEllipse(ctx, mx, 0, 5.2 * ms, 7.6 * ms, 0, rgba(coat.highlightColor, 0.36));
    drawRotatedEllipse(ctx, mx + 1.2 * sx, 0, 3.8 * ms, 6.2 * ms, 0, rgba(coat.bellyColor, 0.42));
  }

  // Coat pattern markings (directly ported from DrawBodyMarkings)
  switch (coat.pattern) {
    case 'HairlessBicolor': {
      drawRotatedEllipse(ctx, torsoX - 2.5 * sx, -2.6 * sy, 7.6 * sx, 5.4 * sy, 0, rgba(coat.secondaryPatchColor, 0.84));
      drawRotatedEllipse(ctx, hipsX - 1.5 * sx, 2.2 * sy, 6.8 * sx, 4.8 * sy, 0, rgba(coat.secondaryPatchColor, 0.8));
      break;
    }
    case 'HairlessSolid': {
      drawRotatedEllipse(ctx, torsoX + 1.5 * sx, 0, 6.8 * sx, 5.2 * sy, 0, rgba(coat.highlightColor, 0.24));
      break;
    }
    case 'Colorpoint': {
      drawRotatedEllipse(ctx, midX - 1 * sx, 0, 11.4 * sx, 6.0 * sy, 0, rgba(coat.stripeColor, 0.16));
      drawRotatedEllipse(ctx, midX - 1.6 * sx, 0, 8.2 * sx, 3.4 * sy, 0, rgba(coat.pointColor, 0.14));
      drawRotatedEllipse(ctx, hipsX - 4.8 * sx, 0, 4.4 * sx, 4.2 * sy, 0, rgba(coat.pointColor, 0.28));
      break;
    }
    case 'MittedColorpoint': {
      drawRotatedEllipse(ctx, midX - 1.2 * sx, 0, 12.0 * sx, 7.2 * sy, 0, rgba(coat.stripeColor, 0.18));
      drawRotatedEllipse(ctx, hipsX - 5.0 * sx, 0, 4.8 * sx, 4.4 * sy, 0, rgba(coat.pointColor, 0.26));
      drawRotatedEllipse(ctx, torsoX + 6.8 * sx, 0, 5.4 * sx, 6.8 * sy, 0, rgba(coat.bellyColor, 0.96));
      break;
    }
    case 'Shaded': {
      drawRotatedEllipse(ctx, midX - 0.5 * sx, 0, 12.2 * sx, 8.6 * sy, 0, rgba(coat.stripeColor, 0.26));
      drawRotatedEllipse(ctx, midX - 1.0 * sx, 0, 9.5 * sx, 4.8 * sy, 0, rgba(coat.stripeColor, 0.22));
      break;
    }
    case 'RosetteSpotted': {
      for (const s of [-0.58, -0.18, 0.22, 0.58]) {
        drawRotatedEllipse(ctx, midX + s * 14 * sx, 0, 2.2 * sx, 1.35 * sy, 0, rgba(coat.stripeColor, 0.86));
      }
      const rosettes: [number, number, number][] = [
        [-4.2, -5.8, 3.0],
        [-3.8, 5.9, 2.9],
        [1.8, -6.2, 3.2],
        [2.2, 6.1, 3.1],
        [7.4, -4.8, 2.6],
        [7.0, 4.9, 2.7],
        [-9.2, -4.2, 2.5],
        [-8.8, 4.4, 2.5],
      ];
      for (const [fwd, sideOff, r] of rosettes) {
        const rr = r * scale;
        drawRotatedEllipse(
          ctx,
          midX + fwd * sx,
          sideOff * sy,
          rr * 1.16,
          rr * 0.92,
          sideOff * 0.04,
          rgba(coat.secondaryPatchColor, 0.9),
          rgba(coat.stripeColor, 0.88),
          1.55 * scale,
        );
      }
      break;
    }
    case 'RosetteMarbled': {
      for (const side of [-1, 1]) {
        drawRotatedEllipse(
          ctx,
          midX,
          side * 5.4 * sy,
          9.2 * sx,
          3.6 * sy,
          side * 0.14,
          rgba(coat.secondaryPatchColor, 0.84),
          rgba(coat.stripeColor, 0.86),
          1.7 * scale,
        );
        drawRotatedEllipse(ctx, midX + side * 1.5 * sx, side * 5.2 * sy, 4.4 * sx, 1.7 * sy, 0, rgba(coat.highlightColor, 0.42));
      }
      break;
    }
    case 'TickedAgouti': {
      drawQuadArc(ctx, hipsX - 6.2 * sx, 0, midX, 0, torsoX + 6.2 * sx, 0, rgba(coat.stripeColor, 0.56), 3.4 * sy);
      drawRotatedEllipse(ctx, midX, 0, 10.6 * sx, 5.2 * sy, 0, rgba(coat.shadowColor, 0.24));
      for (const [fwd, sideOff] of [
        [-6, -4.5],
        [-3, 4.2],
        [0.5, -5.2],
        [3.5, 4.8],
        [6.2, -3.6],
      ]) {
        drawRotatedEllipse(ctx, midX + fwd * sx, sideOff * sy, 1.15 * scale, 1.15 * scale, 0, rgba(coat.stripeColor, 0.42));
        drawRotatedEllipse(ctx, midX + (fwd + 1.6) * sx, sideOff * sy, 0.9 * scale, 0.9 * scale, 0, rgba(coat.highlightColor, 0.48));
      }
      break;
    }
    case 'Tortoiseshell': {
      const sw = b.torsoRadius / 12.2;
      const patches: [number, number, number, number, string][] = [
        [-4.5, -4.6, 5.8, 4.0, coat.secondaryPatchColor],
        [3.2, 4.4, 6.2, 4.2, coat.secondaryPatchColor],
        [-1.0, 2.2, 4.4, 3.2, coat.highlightColor],
        [5.5, -3.5, 4.8, 3.4, coat.highlightColor],
        [-7.0, 3.2, 4.0, 2.8, coat.secondaryPatchColor],
      ];
      for (const [fwd, sideOff, prx, pry, col] of patches) {
        drawRotatedEllipse(ctx, midX + fwd * sx, sideOff * sy * sw, prx * sx * sw, pry * sy * sw, sideOff * 0.05, rgba(col, 0.78));
      }
      break;
    }
    case 'Calico':
    case 'MikeCalico': {
      const sw = b.torsoRadius / 12.2;
      const isMiKe = coat.pattern === 'MikeCalico';
      drawRotatedEllipse(ctx, torsoX - 2 * sx, -5.2 * sy * sw, 8.2 * sx * sw, 5.6 * sy * sw, 0, rgba(coat.secondaryPatchColor, isMiKe ? 0.97 : 0.94));
      drawRotatedEllipse(ctx, hipsX + 2 * sx, 4.6 * sy * sw, 7.6 * sx * sw, 5.2 * sy * sw, 0, rgba(coat.stripeColor, isMiKe ? 0.96 : 0.92));
      drawRotatedEllipse(
        ctx,
        hipsX - 5 * sx,
        -2.0 * sy * sw,
        4.0 * scale * sw,
        4.0 * scale * sw,
        0,
        rgba(isMiKe ? coat.stripeColor : coat.secondaryPatchColor, 0.92),
      );
      break;
    }
    case 'Tuxedo': {
      drawRotatedEllipse(ctx, torsoX + 6.2 * sx, 0, 5.0 * sx, 6.4 * sy, 0, rgba(coat.bellyColor, 0.98));
      drawRotatedEllipse(ctx, midX, 0, 9.2 * sx, 4.4 * sy, 0, rgba(coat.highlightColor, 0.3));
      break;
    }
    case 'Bicolor': {
      drawRotatedEllipse(ctx, torsoX + 6.4 * sx, 0, 5.4 * sx, 6.6 * sy, 0, rgba(coat.secondaryPatchColor, 0.96));
      drawRotatedEllipse(ctx, midX + 0.5 * sx, -7.2 * sy, 7.4 * sx, 3.6 * sy, 0, rgba(coat.secondaryPatchColor, 0.94));
      drawRotatedEllipse(ctx, midX + 1.0 * sx, 7.2 * sy, 7.0 * sx, 3.4 * sy, 0, rgba(coat.secondaryPatchColor, 0.94));
      break;
    }
    case 'TabbyMackerel': {
      drawQuadArc(ctx, hipsX - 6 * sx, 0, midX, 0, torsoX + 6 * sx, 0, rgba(coat.stripeColor, 0.8), 2.5 * sy);
      const stations =
        breed.id === 'munchkin' || breed.id === 'maine_coon'
          ? [-0.62, -0.25, 0.12, 0.48, 0.78]
          : [-0.55, -0.15, 0.25, 0.65];
      const maxHalf = b.torsoRadius * 0.78;
      for (const s of stations) {
        const cx = midX + s * 15 * sx;
        const span = (maxHalf - Math.abs(s) * 2.0) * sy;
        drawQuadArc(ctx, cx - 2.8 * sx, -span, cx, 0, cx - 2.8 * sx, span, rgba(coat.stripeColor, 0.7), 2.0 * sy);
      }
      break;
    }
    case 'TabbyClassic': {
      drawQuadArc(ctx, hipsX - 6.5 * sx, 0, midX, 0, torsoX + 6.5 * sx, 0, rgba(coat.stripeColor, 0.78), 3.1 * sy);
      for (const side of [-1, 1]) {
        const fy = side * b.torsoRadius * 0.52 * sy;
        drawRotatedEllipse(ctx, midX - 1.2 * sx, fy, 6.2 * sx, 4.0 * sy, 0, undefined, rgba(coat.stripeColor, 0.76), 2.1 * sy);
        drawRotatedEllipse(ctx, midX - 1.2 * sx, fy, 2.5 * sx, 1.6 * sy, 0, rgba(coat.stripeColor, 0.78));
        drawRotatedEllipse(ctx, torsoX + 3.8 * sx, side * 5.2 * sy, 3.8 * sx, 2.4 * sy, side * 0.45, rgba(coat.stripeColor, 0.68));
      }
      break;
    }
    case 'Solid': {
      if (coat.id === 'dsh_glossy_black_void') {
        drawQuadArc(ctx, midX - 7.4 * sx, -1.5 * sy, midX + 1 * sx, -4.3 * sy, midX + 9.4 * sx, -1.5 * sy, rgba(coat.highlightColor, 0.48), 3.3 * sy);
      } else {
        drawRotatedEllipse(ctx, midX, 0, 11.2 * sx, 5.6 * sy, 0, rgba(coat.highlightColor, 0.34));
        drawRotatedEllipse(ctx, torsoX + 1.5 * sx, 0, 5.8 * scale, 5.8 * scale, 0, rgba(coat.secondaryPatchColor, 0.22));
      }
      break;
    }
  }

  // Feathered longhair wisps
  if (b.coatType === 'Longhair' || b.coatType === 'ShaggyLonghair' || b.coatType === 'SilkySemilong') {
    const span = b.torsoRadius * 0.56 * sy;
    for (const s of [-0.45, 0.05, 0.48]) {
      const cx = midX + s * 12 * sx;
      drawQuadArc(ctx, cx, -span, cx - 2.8 * sx, 0, cx, span, rgba(coat.highlightColor, 0.36), 1.5 * sy);
    }
  }

  // Sphynx anatomical skin-fold wrinkles
  if (b.hasWrinkles) {
    const ba = b.wrinkleAlpha;
    for (const [fwd, span, curve, alpha] of [
      [7.4, 5.4, -1.6, ba * 1.1],
      [5.2, 6.4, -1.8, ba],
      [2.8, 7.0, -1.6, ba * 0.88],
    ]) {
      const cx = torsoX + fwd * sx;
      drawQuadArc(ctx, cx, -span * sy, cx + curve * sx, 0, cx, span * sy, rgba(coat.wrinkleColor, alpha), 1.15);
    }
    for (const [fwd, span, curve, alpha] of [
      [1.8, 6.4, 1.6, ba * 0.88],
      [-2.2, 5.4, 1.5, ba * 0.82],
    ]) {
      const cx = hipsX + fwd * sx;
      drawQuadArc(ctx, cx, -span * sy, cx + curve * sx, 0, cx, span * sy, rgba(coat.wrinkleColor, alpha), 1.05);
    }
  }
}

function drawBreedEar(
  ctx: CanvasRenderingContext2D,
  breed: BreedDefinition,
  coat: BreedCoatVariant,
  side: -1 | 1,
  isKitten: boolean,
) {
  const ear = breed.anatomy.ears;
  const headScale = isKitten ? KITTEN_HEAD_SCALE : 1;
  const earScale = isKitten ? KITTEN_HEAD_SCALE * KITTEN_EAR_SCALE : 1;
  const x = ear.offsetX * headScale;
  const y = ear.offsetY * side * headScale;
  const angle = side * ear.baseAngle;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const T = (lx: number, ly: number): [number, number] => [x + lx * cos - ly * sin, y + lx * sin + ly * cos];

  const len = ear.length * earScale;
  const halfW = ear.width * 0.5 * earScale;

  if (ear.isFolded || ear.shape === 'FoldedOwl') {
    const foldX = (ear.offsetX + 1.8) * headScale;
    const foldY = ear.offsetY * 0.92 * side * headScale;
    const foldAng = side * 0.28;
    drawRotatedEllipse(ctx, foldX, foldY, len * 0.64, halfW * 0.84, foldAng, coat.earOuterColor, rgba(coat.eyeRimColor, 0.36), 0.95);
    drawRotatedEllipse(
      ctx,
      foldX + Math.cos(foldAng) * len * 0.24,
      foldY + Math.sin(foldAng) * len * 0.24,
      len * 0.32,
      halfW * 0.62,
      foldAng,
      rgba(coat.shadowColor, 0.45),
    );
    return;
  }

  if (ear.isCurledBack || ear.shape === 'CurledBack') {
    const b1 = T(-len * 0.28, -halfW * 0.88 * side);
    const b2 = T(-len * 0.42, halfW * 0.96 * side);
    const tip = T(len * 0.42, -halfW * 0.84 * side);
    const c1 = T(len * 0.48, -halfW * 0.56 * side);
    const c2 = T(len * 0.62, halfW * 0.42 * side);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(b1[0], b1[1]);
    ctx.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]);
    ctx.quadraticCurveTo(c2[0], c2[1], b2[0], b2[1]);
    ctx.closePath();
    ctx.fillStyle = coat.earOuterColor;
    ctx.fill();
    ctx.strokeStyle = rgba(coat.eyeRimColor, 0.34);
    ctx.lineWidth = 0.95;
    ctx.stroke();

    const sc = ear.innerScale;
    const ib1 = T(-len * 0.28 * sc, -halfW * 0.88 * side * sc);
    const ib2 = T(-len * 0.42 * sc, halfW * 0.96 * side * sc);
    const ic = T(len * 0.46, -halfW * 0.14 * side);
    ctx.beginPath();
    ctx.moveTo(ib1[0], ib1[1]);
    ctx.quadraticCurveTo(ic[0], ic[1], ib2[0], ib2[1]);
    ctx.closePath();
    ctx.fillStyle = rgba(coat.earInnerColor, 0.9);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (ear.shape === 'GiantBat') {
    const b1 = T(-len * 0.24, -halfW * 0.92 * side);
    const b2 = T(-len * 0.34, halfW * 1.05 * side);
    const tip = T(len * 0.86, halfW * 0.08 * side);
    const c1 = T(len * 0.38, -halfW * 0.72 * side);
    const c2 = T(len * 0.36, halfW * 0.96 * side);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(b1[0], b1[1]);
    ctx.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]);
    ctx.quadraticCurveTo(c2[0], c2[1], b2[0], b2[1]);
    ctx.closePath();
    ctx.fillStyle = coat.earOuterColor;
    ctx.fill();
    ctx.strokeStyle = rgba(coat.eyeRimColor, 0.38);
    ctx.lineWidth = 1.0;
    ctx.stroke();

    const sc = ear.innerScale;
    const ib1 = T(-len * 0.24 * sc, -halfW * 0.92 * side * sc);
    const ib2 = T(-len * 0.34 * sc, halfW * 1.05 * side * sc);
    const itip = T(len * 0.86 * 0.76, halfW * 0.08 * side);
    const ic1 = T(len * 0.36, -halfW * 0.44 * side);
    const ic2 = T(len * 0.34, halfW * 0.62 * side);
    ctx.beginPath();
    ctx.moveTo(ib1[0], ib1[1]);
    ctx.quadraticCurveTo(ic1[0], ic1[1], itip[0], itip[1]);
    ctx.quadraticCurveTo(ic2[0], ic2[1], ib2[0], ib2[1]);
    ctx.closePath();
    ctx.fillStyle = rgba(coat.earInnerColor, 0.92);
    ctx.fill();
    ctx.restore();

    if (ear.hasCartilageDetail) {
      const p0 = T(len * 0.02, -halfW * 0.14 * side);
      const pc = T(len * 0.28, -halfW * 0.06 * side);
      const p1 = T(len * 0.56, halfW * 0.02 * side);
      drawQuadArc(ctx, p0[0], p0[1], pc[0], pc[1], p1[0], p1[1], rgba(coat.wrinkleColor, 0.46), 0.85);
    }
    return;
  }

  if (ear.shape === 'SmallRounded' || ear.shape === 'MediumRounded' || ear.shape === 'AlertMediumRounded') {
    const b1 = T(-len * 0.35, -halfW * 0.95 * side);
    const b2 = T(-len * 0.45, halfW * 1.05 * side);
    const tip = T(len * 0.72, 0);
    const c1 = T(len * 0.38, -halfW * 0.88 * side);
    const c2 = T(len * 0.72 + 0.8, -halfW * 0.44 * side);
    const c3 = T(len * 0.72 + 0.8, halfW * 0.46 * side);
    const c4 = T(len * 0.34, halfW * 0.92 * side);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(b1[0], b1[1]);
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], tip[0], tip[1]);
    ctx.bezierCurveTo(c3[0], c3[1], c4[0], c4[1], b2[0], b2[1]);
    ctx.closePath();
    ctx.fillStyle = coat.earOuterColor;
    ctx.fill();
    ctx.strokeStyle = rgba(coat.eyeRimColor, 0.3);
    ctx.lineWidth = 0.9;
    ctx.stroke();

    const sc = ear.innerScale;
    const ib1 = T(-len * 0.35 * sc, -halfW * 0.95 * side * sc);
    const ib2 = T(-len * 0.45 * sc, halfW * 1.05 * side * sc);
    const ic = T(len * 0.72 * 0.78, 0);
    ctx.beginPath();
    ctx.moveTo(ib1[0], ib1[1]);
    ctx.quadraticCurveTo(ic[0], ic[1], ib2[0], ib2[1]);
    ctx.closePath();
    ctx.fillStyle = rgba(coat.earInnerColor, 0.86);
    ctx.fill();

    if (ear.hasEarTufts && ear.tuftLength > 0) {
      ctx.strokeStyle = rgba(coat.highlightColor, 0.92);
      ctx.lineWidth = 1.25;
      ctx.lineCap = 'round';
      for (const spread of [-0.38, 0, 0.38]) {
        const s0 = T(len * 0.14, spread * halfW * 0.36 * side);
        const e0 = T(len * 0.14 + ear.tuftLength * headScale * 0.96, (spread * halfW * 0.36 + spread * ear.tuftLength * headScale * 0.62) * side);
        ctx.beginPath();
        ctx.moveTo(s0[0], s0[1]);
        ctx.lineTo(e0[0], e0[1]);
        ctx.stroke();
      }
    }
    ctx.restore();
    return;
  }

  // Pointed triangular ears (+ Maine Coon lynx tips & tufts)
  const b1 = T(-len * 0.34, -halfW * 0.92 * side);
  const b2 = T(-len * 0.48, halfW * 1.12 * side);
  const tip = T(len * 0.78, 0);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(b1[0], b1[1]);
  ctx.lineTo(tip[0], tip[1]);
  ctx.lineTo(b2[0], b2[1]);
  ctx.closePath();
  ctx.fillStyle = coat.earOuterColor;
  ctx.fill();
  ctx.strokeStyle = rgba(coat.eyeRimColor, 0.32);
  ctx.lineWidth = 0.9;
  ctx.stroke();

  const sc = ear.innerScale;
  const ib1 = T(-len * 0.34 * sc, -halfW * 0.92 * side * sc);
  const ib2 = T(-len * 0.48 * sc, halfW * 1.12 * side * sc);
  const itip = T(len * 0.56, 0);
  ctx.beginPath();
  ctx.moveTo(ib1[0], ib1[1]);
  ctx.lineTo(itip[0], itip[1]);
  ctx.lineTo(ib2[0], ib2[1]);
  ctx.closePath();
  ctx.fillStyle = rgba(coat.earInnerColor, 0.88);
  ctx.fill();

  if (ear.hasLynxTips) {
    const lynxEnd = T(len * 0.78 + ear.tuftLength * headScale * 0.72, -halfW * 0.08 * side);
    ctx.strokeStyle = coat.earOuterColor;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(lynxEnd[0], lynxEnd[1]);
    ctx.stroke();
  }
  if (ear.hasEarTufts && ear.tuftLength > 0) {
    ctx.strokeStyle = rgba(coat.highlightColor, 0.88);
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    for (const spread of [-0.32, 0.32]) {
      const s0 = T(len * 0.08, spread * halfW * 0.32 * side);
      const e0 = T(len * 0.08 + ear.tuftLength * headScale * 0.7, spread * ear.tuftLength * headScale * 0.46 * side);
      ctx.beginPath();
      ctx.moveTo(s0[0], s0[1]);
      ctx.lineTo(e0[0], e0[1]);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBreedHead(
  ctx: CanvasRenderingContext2D,
  breed: BreedDefinition,
  coat: BreedCoatVariant,
  headX: number,
  isKitten: boolean,
  isBlinking: boolean,
) {
  const h = breed.anatomy.head;
  const b = breed.anatomy.body;
  const headScale = isKitten ? KITTEN_HEAD_SCALE : 1;
  const rx = h.radiusX * headScale;
  const ry = h.radiusY * headScale;

  ctx.save();
  ctx.translate(headX, 0);

  // 1. Ears
  drawBreedEar(ctx, breed, coat, -1, isKitten);
  drawBreedEar(ctx, breed, coat, 1, isKitten);

  // 2. Skull contour + cheek ruffs / jowls
  fillSkullShape(ctx, h.shape, rx, ry, 1.05, rgba(coat.eyeRimColor, 0.26));

  if ((h.shape === 'Brachycephalic' || h.shape === 'SquareMuzzle') && b.hasCheekRuffs) {
    const rs = b.cheekRuffScale * headScale;
    for (const side of [-1, 1]) {
      drawRotatedEllipse(ctx, -1.8 * headScale, side * ry * 0.82, 4.4 * rs + 0.9, 3.8 * rs + 0.9, 0, rgba(coat.eyeRimColor, 0.2));
      drawRotatedEllipse(ctx, 1.4 * headScale, side * ry * 0.78, 4.1 * rs + 0.9, 3.4 * rs + 0.9, 0, rgba(coat.eyeRimColor, 0.2));
      drawRotatedEllipse(ctx, -4.6 * headScale, side * ry * 0.64, 3.8 * rs + 0.9, 3.2 * rs + 0.9, 0, rgba(coat.eyeRimColor, 0.2));
    }
  }

  fillSkullShape(ctx, h.shape, rx, ry, 0, coat.baseColor);

  if (h.shape === 'Brachycephalic' || h.shape === 'SquareMuzzle') {
    const rs = b.cheekRuffScale * headScale;
    for (const side of [-1, 1]) {
      drawRotatedEllipse(ctx, -1.8 * headScale, side * ry * 0.82, 4.4 * rs, 3.8 * rs, 0, coat.baseColor);
      drawRotatedEllipse(ctx, 1.4 * headScale, side * ry * 0.78, 4.1 * rs, 3.4 * rs, 0, coat.baseColor);
      drawRotatedEllipse(ctx, -4.6 * headScale, side * ry * 0.64, 3.8 * rs, 3.2 * rs, 0, coat.baseColor);
      drawRotatedEllipse(ctx, 0.6 * headScale, side * ry * 0.8, 2.8 * rs, 1.9 * rs, 0, rgba(coat.highlightColor, 0.32));
    }
  } else if (h.shape === 'RoundJowls' || h.shape === 'OwlRound') {
    const js = b.cheekRuffScale * headScale;
    for (const side of [-1, 1]) {
      drawRotatedEllipse(ctx, 2.2 * headScale, side * ry * 0.72, 4.8 * js * 0.74, 4.0 * js * 0.74, 0, rgba(coat.eyeRimColor, 0.18));
      drawRotatedEllipse(ctx, 2.2 * headScale, side * ry * 0.7, 4.6 * js * 0.72, 3.8 * js * 0.72, 0, coat.baseColor);
    }
  } else if (b.hasCheekRuffs && b.cheekRuffScale > 0) {
    const sc = b.cheekRuffScale * headScale;
    for (const side of [-1, 1]) {
      drawRotatedEllipse(ctx, 1.4 * headScale, side * ry * 0.7, 4.2 * sc, 3.1 * sc, 0, coat.baseColor);
    }
  }

  // 3. Facial markings
  switch (coat.pattern) {
    case 'Colorpoint': {
      drawRotatedEllipse(ctx, rx * 0.32, 0, rx * 0.64, ry * 0.68, 0, rgba(coat.pointColor, 0.34));
      ctx.save();
      ctx.fillStyle = rgba(coat.pointColor, 0.88);
      ctx.beginPath();
      ctx.moveTo(rx * 1.0, 0);
      ctx.lineTo(rx * 0.42, -ry * 0.56);
      ctx.lineTo(-rx * 0.14, 0);
      ctx.lineTo(rx * 0.42, ry * 0.56);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawRotatedEllipse(ctx, rx * 0.58, 0, rx * 0.4, ry * 0.44, 0, rgba(coat.pointColor, 0.94));
      break;
    }
    case 'MittedColorpoint': {
      drawRotatedEllipse(ctx, rx * 0.28, 0, rx * 0.64, ry * 0.7, 0, rgba(coat.pointColor, 0.48));
      drawRotatedEllipse(ctx, rx * 0.56, 0, rx * 0.42, ry * 0.46, 0, rgba(coat.pointColor, 0.78));
      if (coat.id === 'ragdoll_blue_bicolor') {
        ctx.save();
        ctx.fillStyle = rgba(coat.bellyColor, 0.96);
        ctx.beginPath();
        ctx.moveTo(rx * 0.08, 0);
        ctx.lineTo(rx * 0.92, -ry * 0.42);
        ctx.lineTo(rx * 0.98, 0);
        ctx.lineTo(rx * 0.92, ry * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        drawRotatedEllipse(ctx, rx * 0.72, 0, rx * 0.24, ry * 0.32, 0, rgba(coat.bellyColor, 0.92));
      }
      break;
    }
    case 'HairlessBicolor': {
      drawRotatedEllipse(ctx, -rx * 0.25, -ry * 0.35, rx * 0.45, ry * 0.38, 0, rgba(coat.secondaryPatchColor, 0.8));
      drawRotatedEllipse(ctx, rx * 0.62, 0, rx * 0.34, ry * 0.32, 0, rgba(coat.muzzleColor, 0.72));
      break;
    }
    case 'HairlessSolid': {
      drawRotatedEllipse(ctx, -rx * 0.1, 0, rx * 0.46, ry * 0.38, 0, rgba(coat.highlightColor, 0.28));
      break;
    }
    case 'Tortoiseshell': {
      drawRotatedEllipse(ctx, -rx * 0.15, -ry * 0.42, rx * 0.48, ry * 0.38, 0, rgba(coat.secondaryPatchColor, 0.86));
      drawRotatedEllipse(ctx, rx * 0.48, ry * 0.25, rx * 0.32, ry * 0.28, 0, rgba(coat.highlightColor, 0.78));
      break;
    }
    case 'Calico':
    case 'MikeCalico': {
      drawRotatedEllipse(ctx, -rx * 0.22, -ry * 0.46, rx * 0.56, ry * 0.44, 0, rgba(coat.secondaryPatchColor, 0.95));
      drawRotatedEllipse(ctx, -rx * 0.3, ry * 0.44, rx * 0.5, ry * 0.42, 0, rgba(coat.stripeColor, 0.94));
      break;
    }
    case 'Tuxedo':
    case 'Bicolor': {
      ctx.save();
      ctx.fillStyle = rgba(coat.muzzleColor, 0.98);
      ctx.beginPath();
      ctx.moveTo(rx * 0.06, 0);
      ctx.lineTo(rx * 0.88, -ry * 0.38);
      ctx.lineTo(rx * 0.96, 0);
      ctx.lineTo(rx * 0.88, ry * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'RosetteSpotted':
    case 'RosetteMarbled': {
      drawRotatedEllipse(ctx, rx * 0.56, -ry * 0.24, rx * 0.3, ry * 0.24, 0, rgba(coat.muzzleColor, 0.94));
      drawRotatedEllipse(ctx, rx * 0.56, ry * 0.24, rx * 0.3, ry * 0.24, 0, rgba(coat.muzzleColor, 0.94));
      drawForeheadM(ctx, rx, ry, coat.stripeColor, 1.75, 0.9);
      break;
    }
    case 'TickedAgouti': {
      drawRotatedEllipse(ctx, rx * 0.58, 0, rx * 0.3, ry * 0.34, 0, rgba(coat.muzzleColor, 0.86));
      drawForeheadM(ctx, rx, ry, coat.stripeColor, 1.3, 0.72);
      break;
    }
    case 'TabbyMackerel':
    case 'TabbyClassic': {
      drawRotatedEllipse(ctx, rx * 0.56, -2.7, rx * 0.3, ry * 0.24, 0, rgba(coat.muzzleColor, 0.92));
      drawRotatedEllipse(ctx, rx * 0.56, 2.7, rx * 0.3, ry * 0.24, 0, rgba(coat.muzzleColor, 0.92));
      drawForeheadM(ctx, rx, ry, coat.stripeColor, 1.5, 0.84);
      break;
    }
    case 'Shaded': {
      drawRotatedEllipse(ctx, -rx * 0.22, 0, rx * 0.52, ry * 0.62, 0, rgba(coat.stripeColor, 0.24));
      drawRotatedEllipse(ctx, rx * 0.44, -2.6, rx * 0.28, ry * 0.22, 0, rgba(coat.muzzleColor, 0.9));
      drawRotatedEllipse(ctx, rx * 0.44, 2.6, rx * 0.28, ry * 0.22, 0, rgba(coat.muzzleColor, 0.9));
      break;
    }
    case 'Solid': {
      if (coat.id === 'dsh_glossy_black_void') {
        drawRotatedEllipse(ctx, -2, -1.8, rx * 0.46, ry * 0.32, 0, rgba(coat.highlightColor, 0.42));
      } else {
        drawRotatedEllipse(ctx, rx * 0.42, 0, rx * 0.38, ry * 0.52, 0, rgba(coat.muzzleColor, 0.34));
      }
      break;
    }
  }

  if (h.shape === 'Brachycephalic') {
    drawRotatedEllipse(ctx, rx * h.muzzleOffset, -2.8, 3.0, 2.7, 0, rgba(coat.muzzleColor, 0.72));
    drawRotatedEllipse(ctx, rx * h.muzzleOffset, 2.8, 3.0, 2.7, 0, rgba(coat.muzzleColor, 0.72));
  }

  if (b.hasWrinkles) {
    for (const wx of [-3.4, -1.4, 0.5]) {
      const span = 4.2 - (wx + 3.4) * 0.28;
      drawQuadArc(ctx, wx - 0.7, -span, wx + 0.9, 0, wx - 0.7, span, rgba(coat.wrinkleColor, b.wrinkleAlpha), 1.0);
    }
  }

  // 4. Eyes
  const eyeSpec = breed.anatomy.eyes;
  const eyeScale = isKitten ? KITTEN_HEAD_SCALE * KITTEN_EYE_SCALE : 1;
  const ex = eyeSpec.offsetX * headScale;
  const ey = eyeSpec.offsetY * headScale;
  const irisR = eyeSpec.irisRadius * eyeScale;
  const isAlmond =
    eyeSpec.shape === 'SlantedAlmond' ||
    eyeSpec.shape === 'Lemon' ||
    eyeSpec.shape === 'VividAlmond' ||
    eyeSpec.shape === 'ExpressiveAlmond';

  for (const side of [-1, 1] as const) {
    const cy = side * ey;
    if (isBlinking) {
      drawQuadArc(
        ctx,
        ex - 1.1 * eyeScale,
        cy - 2.4 * eyeScale,
        ex + 1.6 * eyeScale,
        cy,
        ex - 1.1 * eyeScale,
        cy + 2.4 * eyeScale,
        rgba(coat.eyeRimColor, 0.92),
        1.6,
      );
      continue;
    }

    const erx = isAlmond ? irisR * 1.12 : irisR;
    const ery = isAlmond ? irisR * 0.84 : irisR;
    const slant = side * eyeSpec.slantRad;

    drawRotatedEllipse(ctx, ex, cy, erx + 0.45, ery + 0.45, slant, rgba(coat.eyeRimColor, 0.86));
    drawRotatedEllipse(ctx, ex, cy, erx, ery, slant, coat.eyeIrisColor);
    drawRotatedEllipse(ctx, ex + 0.25, cy, erx * 0.58, ery * 0.34, slant, '#1A130F');
    drawRotatedEllipse(ctx, ex - erx * 0.22, cy - ery * 0.26, erx * 0.28, erx * 0.28, 0, 'rgba(255,252,246,0.95)');
    drawRotatedEllipse(ctx, ex + erx * 0.28, cy + ery * 0.22, erx * 0.14, erx * 0.14, 0, 'rgba(255,252,246,0.75)');
  }

  // 5. Nose
  const noseX = rx * h.noseOffsetX;
  const ns = h.noseSize * headScale;
  ctx.save();
  ctx.fillStyle = rgba(coat.noseColor, 0.96);
  if (h.shape === 'Brachycephalic') {
    ctx.beginPath();
    ctx.ellipse(noseX, 0, ns * 0.78, ns * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(noseX - ns * 0.85, -ns);
    ctx.lineTo(noseX + ns * 0.45, 0);
    ctx.lineTo(noseX - ns * 0.85, ns);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 6. Whiskers
  const wLen = h.whiskerLength * headScale;
  const wCount = h.whiskerCountPerSide;
  ctx.save();
  ctx.strokeStyle = rgba(coat.whiskerColor, 0.68);
  ctx.lineWidth = 0.75;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    for (let i = 0; i < wCount; i++) {
      const t = wCount === 1 ? 0 : i / (wCount - 1) - 0.5;
      const baseAngle = side * (Math.PI * 0.48) + t * h.whiskerSpread * 2.1;
      const sx0 = rx * 0.66;
      const sy0 = side * ry * 0.26 + t * 1.6;
      const ex0 = sx0 + Math.cos(baseAngle) * wLen;
      const ey0 = sy0 + Math.sin(baseAngle) * wLen;
      ctx.beginPath();
      ctx.moveTo(sx0, sy0);
      ctx.lineTo(ex0, ey0);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.restore();
}

function renderCatFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  breed: BreedDefinition,
  coat: BreedCoatVariant,
  isKitten: boolean,
  timeSec: number,
) {
  ctx.clearRect(0, 0, width, height);

  const b = breed.anatomy.body;
  const kMul = isKitten ? KITTEN_BODY_SCALE : 1;
  const breath = Math.sin(timeSec * 2.2) * 0.022;
  const sx = (1 + breath * 0.6) * kMul;
  const sy = (1 + breath) * kMul;

  const torsoToHips = b.torsoToHipsLen * kMul;
  const headToTorso = b.headToTorsoLen * kMul;

  const torsoX = 6 * kMul;
  const hipsX = torsoX - torsoToHips;
  const headX = torsoX + headToTorso;

  const blinkCycle = timeSec % 4.8;
  const isBlinking = blinkCycle > 4.55 && blinkCycle < 4.74;

  // Normalize visual zoom so giant Maine Coon and petite Munchkin both look natural and scaled accurately relative to each other
  const baseZoom = Math.min(width, height) / 86;

  ctx.save();
  ctx.translate(width * 0.54, height * 0.53);
  ctx.scale(baseZoom, baseZoom);
  ctx.rotate(-0.18);

  // Soft ground contact shadow
  const shScale = b.shadowScale * kMul;
  drawRotatedEllipse(ctx, hipsX + 2.4, 3.6, (b.hipRadius + 0.8) * shScale, (b.hipRadius + 0.8) * shScale, 0, 'rgba(34, 20, 11, 0.16)');
  drawRotatedEllipse(ctx, torsoX + 2.4, 3.6, (b.torsoRadius + 0.8) * shScale, (b.torsoRadius + 0.8) * shScale, 0, 'rgba(34, 20, 11, 0.16)');
  const headShR = Math.max(breed.anatomy.head.radiusX, breed.anatomy.head.radiusY) * 0.94 * (isKitten ? KITTEN_HEAD_SCALE : 1);
  drawRotatedEllipse(ctx, headX + 2.4, 3.6, headShR, headShR, 0, 'rgba(34, 20, 11, 0.16)');

  // 1. Tail
  drawBreedTail(ctx, breed, coat, hipsX, isKitten, timeSec);

  // 2. Paws
  drawBreedPaws(ctx, breed, coat, torsoX, hipsX, Math.min(sx, sy));

  // 3. Body & markings
  drawBodyAndMarkings(ctx, breed, coat, hipsX, torsoX, headX, sx, sy, isKitten);

  // 4. Head
  drawBreedHead(ctx, breed, coat, headX, isKitten, isBlinking);

  ctx.restore();
}

export function CatModelCanvas({ breed, variantIndex, isKitten }: CatModelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useLenis();
  const coat = breed.coatVariants[variantIndex] ?? breed.coatVariants[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cssW = 248;
    const cssH = 188;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (reducedMotion) {
      renderCatFrame(ctx, cssW, cssH, breed, coat, isKitten, 0.4);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      renderCatFrame(ctx, cssW, cssH, breed, coat, isKitten, elapsed);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [breed, coat, isKitten, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      width={248}
      height={188}
      aria-label={`Top-down NekoScape ${breed.label} (${coat.name}) ${isKitten ? 'kitten' : 'cat'} model`}
      className="h-[188px] w-[248px] max-w-full"
    />
  );
}

export default CatModelCanvas;
