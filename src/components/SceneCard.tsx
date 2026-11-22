import type { LightingMode, SceneDefinition } from '../types/nekoscape';

export interface SceneCardProps {
  scene: SceneDefinition;
  lightingMode?: LightingMode;
}

export function SceneCard({ scene, lightingMode = 'golden' }: SceneCardProps) {
  const grade = scene.lightingGrades[lightingMode];

  return (
    <figure className="group flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[18px] bg-ns-elevated">
        <img
          src={scene.imagePath}
          alt={scene.label}
          width={640}
          height={360}
          loading="lazy"
          style={{ filter: grade.cssFilter }}
          className="h-full w-full object-cover transition-[transform,filter] duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.02]"
        />
        <div
          aria-hidden="true"
          style={{ backgroundColor: grade.overlayColor }}
          className="pointer-events-none absolute inset-0 transition-colors duration-300 ease-[var(--ease-out)]"
        />
      </div>

      <figcaption className="mt-3">
        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ns-ink">
          {scene.label}
        </h3>
        <p className="mt-0.5 text-sm text-ns-ink-secondary">{scene.subtitle}</p>
      </figcaption>
    </figure>
  );
}

export default SceneCard;
