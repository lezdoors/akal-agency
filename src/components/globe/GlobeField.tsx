import { useMemo } from "react";
import type { Ref } from "react";
import * as THREE from "three";
import { FieldPoints } from "@/components/particles/FieldPoints";
import { spherePoints } from "@/lib/geometry";
import { PALETTE } from "@/lib/palette";

export interface GlobeFieldProps {
  count: number;
  radius: number;
  seedStream: () => number;
  color?: THREE.Color;
  materialRef?: Ref<THREE.ShaderMaterial>;
  blending?: THREE.Blending;
  opacity?: number;
  size?: number;
}

/**
 * GlobeField: the opportunity point field as a reusable, tier-scaled surface.
 * Wraps the shared FieldPoints so the globe look is one component.
 */
export function GlobeField({
  count,
  radius,
  seedStream,
  color,
  materialRef,
  blending,
  opacity = 0.7,
  size = 2.2,
}: GlobeFieldProps) {
  const positions = useMemo(
    () => spherePoints(count, radius, seedStream),
    [count, radius, seedStream]
  );
  const seeds = useMemo(() => {
    const a = new Float32Array(count);
    for (let i = 0; i < count; i++) a[i] = seedStream();
    return a;
  }, [count, seedStream]);
  return (
    <FieldPoints
      positions={positions}
      seeds={seeds}
      count={count}
      color={color ?? new THREE.Color(PALETTE.accent)}
      size={size}
      opacity={opacity}
      materialRef={materialRef}
      blending={blending}
    />
  );
}
