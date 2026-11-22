import type { LightingMode, SceneDefinition } from '../types/nekoscape';

export interface SceneCardProps {
  scene: SceneDefinition;
  lightingMode?: LightingMode;
}

export function SceneCard({ scene, lightingMode = 'golden' }: SceneCardProps) {
  return (
    <figure className="group flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[18px] bg-ns-elevated">
        <img
          src={scene.images[lightingMode]}
          alt={scene.label}
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.02]"
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
