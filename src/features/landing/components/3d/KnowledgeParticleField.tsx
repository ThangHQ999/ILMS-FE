'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface KnowledgeParticleFieldProps {
  scrollProgress: number;
  pointerNormalized: { x: number; y: number };
  isDark: boolean;
  particleCount: number;
}

export function KnowledgeParticleField({
  scrollProgress,
  pointerNormalized,
  isDark,
  particleCount,
}: KnowledgeParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const orbGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const paletteDark = [
      new THREE.Color('#38BDF8'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#818CF8'),
      new THREE.Color('#2DD4BF'),
    ];
    const paletteLight = [
      new THREE.Color('#0284C7'),
      new THREE.Color('#2563EB'),
      new THREE.Color('#4F46E5'),
      new THREE.Color('#0D9488'),
    ];
    const palette = isDark ? paletteDark : paletteLight;

    for (let i = 0; i < particleCount; i++) {
      // Deterministic pseudo-random distribution so particles never flicker
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const seed3 = Math.sin(i * 39.425) * 43758.5453;

      const r1 = seed1 - Math.floor(seed1);
      const r2 = seed2 - Math.floor(seed2);
      const r3 = seed3 - Math.floor(seed3);

      pos[i * 3] = (r1 - 0.5) * 26;
      pos[i * 3 + 1] = (r2 - 0.5) * 20;
      pos[i * 3 + 2] = (r3 - 0.5) * 18 - 4;

      const pickedColor = palette[i % palette.length];
      col[i * 3] = pickedColor.r;
      col[i * 3 + 1] = pickedColor.g;
      col[i * 3 + 2] = pickedColor.b;
    }

    return { positions: pos, colors: col };
  }, [particleCount, isDark]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.getElapsedTime();

    if (pointsRef.current) {
      const targetRotY = pointerNormalized.x * 0.28 + elapsed * 0.035;
      const targetRotX = -pointerNormalized.y * 0.22 + scrollProgress * 1.15;

      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        targetRotY,
        dt * 3.5
      );
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        targetRotX,
        dt * 3.5
      );
      pointsRef.current.position.z = THREE.MathUtils.lerp(
        pointsRef.current.position.z,
        scrollProgress * 5.2,
        dt * 3
      );
    }

    if (orbGroupRef.current) {
      const targetX = Math.sin(scrollProgress * Math.PI * 2) * 3.4 + pointerNormalized.x * 0.9;
      const targetY = Math.cos(scrollProgress * Math.PI * 1.5) * 1.4 + pointerNormalized.y * 0.7;

      orbGroupRef.current.position.x = THREE.MathUtils.lerp(
        orbGroupRef.current.position.x,
        targetX,
        dt * 2.8
      );
      orbGroupRef.current.position.y = THREE.MathUtils.lerp(
        orbGroupRef.current.position.y,
        targetY,
        dt * 2.8
      );
      orbGroupRef.current.rotation.y += dt * 0.28;
      orbGroupRef.current.rotation.x += dt * 0.16;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z -= dt * 0.35;
    }
  });

  const wireColor = isDark ? '#38BDF8' : '#2563EB';
  const ringColor = isDark ? '#818CF8' : '#4F46E5';

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isDark ? 0.085 : 0.075}
          vertexColors
          transparent
          opacity={isDark ? 0.78 : 0.48}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <group ref={orbGroupRef} position={[3.2, 0.8, -5.5]}>
        <mesh>
          <icosahedronGeometry args={[2.1, 1]} />
          <meshBasicMaterial
            color={wireColor}
            wireframe
            transparent
            opacity={isDark ? 0.16 : 0.11}
          />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0.4, 0]}>
          <torusGeometry args={[2.9, 0.015, 12, 72]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={isDark ? 0.26 : 0.18}
          />
        </mesh>
      </group>
    </>
  );
}
