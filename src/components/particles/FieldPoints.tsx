import { forwardRef, useMemo } from "react";
import type { Ref } from "react";
import * as THREE from "three";
import { fieldVertex, fieldFragment } from "@/shaders/field";

export interface FieldPointsProps {
  positions: Float32Array;
  count: number;
  seeds?: Float32Array;
  color?: THREE.Color;
  size?: number;
  opacity?: number;
  visible?: boolean;
  materialRef?: Ref<THREE.ShaderMaterial>;
}

/**
 * A single instanced Points field with the shared opportunity shader.
 * The parent owns the material's uTime (so freeze/pause is explicit).
 */
export const FieldPoints = forwardRef<THREE.Points, FieldPointsProps>(
  function FieldPoints(
    {
      positions,
      count,
      seeds,
      color,
      size = 2.2,
      opacity = 0.65,
      visible = true,
      materialRef,
    },
    ref
  ) {
    const geometry = useMemo(() => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const s =
        seeds ??
        (() => {
          const a = new Float32Array(count);
          for (let i = 0; i < count; i++) a[i] = Math.random();
          return a;
        })();
      g.setAttribute("aSeed", new THREE.BufferAttribute(s, 1));
      return g;
    }, [positions, seeds, count]);
    const col = color ?? new THREE.Color(0.5, 0.65, 0.78);
    return (
      <points
        ref={ref}
        geometry={geometry}
        visible={visible}
        frustumCulled={false}
      >
        <shaderMaterial
          ref={materialRef}
          vertexShader={fieldVertex}
          fragmentShader={fieldFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uSize: { value: size },
            uColor: { value: col },
            uOpacity: { value: opacity },
          }}
        />
      </points>
    );
  }
);
