'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useInView } from 'react-intersection-observer';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Atom as AtomIcon } from 'lucide-react';

// ==========================================
// 1. DATA TYPES & INTERFACES
// ==========================================

export interface AtomNucleus {
  protons: number;
  neutrons: number;
  label?: string;
}

export interface AtomElectronShell {
  shell_level: number;
  electrons: number;
  label?: string;
}

export interface AtomData {
  nucleus: AtomNucleus;
  electron_shells: AtomElectronShell[];
  element_name?: string;
  symbol?: string;
}

export interface Atom3DViewerProps {
  data: AtomData;
  className?: string;
  height?: string | number;
  enableAnimation?: boolean;
  showControls?: boolean;
}

// ==========================================
// 2. INNER 3D SCENE COMPONENTS
// ==========================================

/**
 * Nucleus Component
 * - Rendered at [0, 0, 0]
 * - Orange/Red shiny MeshStandardMaterial
 * - Label offset downwards at [0, -1.5, 0] to avoid obscuring the center
 */
function Nucleus({ nucleus }: { nucleus: AtomNucleus }) {
  const labelText = nucleus.label || `Hạt nhân (${nucleus.protons}p, ${nucleus.neutrons}n)`;

  return (
    <group position={[0, 0, 0]}>
      {/* Nucleus Core Sphere */}
      <Sphere args={[0.85, 32, 32]}>
        <meshStandardMaterial
          color="#ea580c" // Vibrant Red-Orange
          roughness={0.25}
          metalness={0.3}
          emissive="#c2410c"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* HTML Label shifted to [0, -1.5, 0] to avoid covering the nucleus */}
      <Html position={[0, -1.5, 0]} center>
        <div className="select-none pointer-events-none whitespace-nowrap rounded-lg bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-orange-200 shadow-xl border border-orange-500/30 backdrop-blur-md flex items-center gap-1.5 ring-1 ring-orange-500/20">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>{labelText}</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Single Electron Shell Component
 * - Orbit Torus rotated horizontally ([Math.PI / 2, 0, 0])
 * - Electrons evenly spaced around circle using Math.cos & Math.sin
 * - Anti-collision Label offset diagonally at [radius * cos(PI/4), 0, radius * sin(PI/4)]
 */
function ElectronShell({
  shell,
  isAnimating,
}: {
  shell: AtomElectronShell;
  isAnimating: boolean;
}) {
  // Radius proportional to shell level: shell_level * 2.5
  const radius = shell.shell_level * 2.5;
  const electronsGroupRef = useRef<THREE.Group>(null);

  // Diagonal coordinates for shell label to prevent stacking
  const labelX = radius * Math.cos(Math.PI / 4);
  const labelZ = radius * Math.sin(Math.PI / 4);
  const labelText = shell.label || `Lớp ${shell.shell_level}`;

  // Pre-calculate positions of electrons around the orbit
  const electronPositions = useMemo(() => {
    const count = Math.max(0, shell.electrons);
    const positions: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      positions.push([x, 0, z]);
    }
    return positions;
  }, [radius, shell.electrons]);

  // Smooth orbital revolution of electrons (outer shells revolve slightly slower)
  useFrame((_, delta) => {
    if (isAnimating && electronsGroupRef.current) {
      const speed = 0.8 / Math.sqrt(shell.shell_level);
      electronsGroupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group>
      {/* 1. Orbit Torus (Horizontal, Light Gray, Semi-transparent) */}
      <Torus
        args={[radius, 0.05, 16, 100]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.45}
          roughness={0.5}
        />
      </Torus>

      {/* 2. Anti-collision Diagonal Label (Stays in fixed angle direction) */}
      <Html position={[labelX, 0, labelZ]} center>
        <div className="select-none pointer-events-none whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-0.5 text-[11px] font-medium text-slate-200 shadow-md border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5">
          <span className="text-sky-400 font-semibold">{labelText}</span>
          <span className="text-[10px] text-slate-400">({shell.electrons}e⁻)</span>
        </div>
      </Html>

      {/* 3. Revolving Electrons Group */}
      <group ref={electronsGroupRef}>
        {electronPositions.map((pos, idx) => (
          <Sphere key={idx} args={[0.2, 16, 16]} position={pos}>
            <meshStandardMaterial
              color="#38bdf8" // Cyan / Blue
              roughness={0.2}
              metalness={0.5}
              emissive="#0284c7"
              emissiveIntensity={0.5}
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

/**
 * 3D World Scene containing lights, controls, nucleus and all shells
 */
function AtomScene({
  data,
  isAnimating,
  controlsRef,
}: {
  data: AtomData;
  isAnimating: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <pointLight position={[12, 15, 12]} intensity={1.8} />
      <pointLight position={[-12, -10, -12]} intensity={0.6} color="#60a5fa" />

      {/* Camera Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={3}
        maxDistance={40}
        maxPolarAngle={Math.PI / 1.05}
      />

      {/* Nucleus at [0, 0, 0] */}
      <Nucleus nucleus={data.nucleus} />

      {/* Electron Shells */}
      {data.electron_shells.map((shell) => (
        <ElectronShell
          key={shell.shell_level}
          shell={shell}
          isAnimating={isAnimating}
        />
      ))}
    </>
  );
}

// ==========================================
// 3. MAIN EXPORTED COMPONENT
// ==========================================

export const Atom3DViewer = React.memo(function Atom3DViewer({
  data,
  className = '',
  height = '480px',
  enableAnimation = true,
  showControls = true,
}: Atom3DViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(enableAnimation);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceActive, setForceActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Unmount Canvas khi không nằm trong viewport để giải phóng vRAM
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: false, // Lặp lại kiểm tra khi cuộn lên/xuống
    threshold: 0.1, // Kích hoạt khi ít nhất 10% component hiển thị
  });

  // Giữ callback ref ổn định, tránh disconnect/re-connect observer mỗi khi render
  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    inViewRef(node);
  }, [inViewRef]);

  const isCanvasActive = inView || isFullscreen || forceActive;

  // Next.js App Router Client Mount Guard (avoids SSR hydration mismatch for WebGL)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Total electrons count
  const totalElectrons = useMemo(() => {
    return data.electron_shells.reduce((acc, shell) => acc + shell.electrons, 0);
  }, [data.electron_shells]);

  // Max radius to calculate initial camera distance
  const maxShellLevel = useMemo(() => {
    return Math.max(...data.electron_shells.map((s) => s.shell_level), 1);
  }, [data.electron_shells]);

  const cameraDistance = useMemo(() => {
    return Math.max(12, maxShellLevel * 2.5 * 2);
  }, [maxShellLevel]);

  // Cố định camera config reference tránh R3F recalculate camera mỗi keystroke
  const cameraConfig = useMemo(() => ({
    position: [cameraDistance * 0.7, cameraDistance * 0.7, cameraDistance * 0.8] as [number, number, number],
    fov: 45,
    near: 0.1,
    far: 1000,
  }), [cameraDistance]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(cameraDistance * 0.7, cameraDistance * 0.7, cameraDistance * 0.8);
      controlsRef.current.object.lookAt(0, 0, 0);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-2xl border border-slate-800 bg-slate-950/70 p-6 flex flex-col items-center justify-center text-slate-400 gap-3 ${className}`}
      >
        <AtomIcon className="w-8 h-8 animate-spin text-sky-400 opacity-60" />
        <span className="text-sm font-medium">Đang khởi tạo không gian nguyên tử 3D...</span>
      </div>
    );
  }

  return (
    <div
      ref={setRootRef}
      style={{ height: isFullscreen ? '100vh' : height }}
      className={`relative w-full rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-3.5 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/60 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <AtomIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                {data.element_name || 'Mô hình nguyên tử 3D (Bohr Model)'}
              </span>
              {data.symbol && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                  {data.symbol}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span>Hạt nhân: <strong className="text-orange-400">{data.nucleus.protons}p</strong> + <strong className="text-amber-300">{data.nucleus.neutrons}n</strong></span>
              <span>•</span>
              <span>Tổng: <strong className="text-sky-400">{totalElectrons}e⁻</strong> ({data.electron_shells.length} lớp)</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {showControls && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAnimating((prev) => !prev)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 px-2.5 border border-slate-700"
              title={isAnimating ? 'Tạm dừng chuyển động quỹ đạo' : 'Tiếp tục chuyển động'}
            >
              {isAnimating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isAnimating ? 'Dừng' : 'Chạy'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetCamera}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title="Đặt lại góc nhìn camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* R3F WebGL Canvas - Unmount khi cuộn khuất để giải phóng GPU vRAM */}
      <div className="w-full h-full flex-1 relative flex flex-col pt-14">
        {isCanvasActive ? (
          <div className="w-full h-full flex-1 cursor-grab active:cursor-grabbing">
            <Canvas
              camera={cameraConfig}
              gl={{ antialias: true, alpha: true }}
            >
              <AtomScene
                data={data}
                isAnimating={isAnimating}
                controlsRef={controlsRef}
              />
            </Canvas>
          </div>
        ) : (
          <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950/75 select-none">
            <div className="p-3.5 rounded-full bg-slate-900 border border-slate-800 mb-3 shadow-inner">
              <AtomIcon className="w-7 h-7 text-sky-500/60" />
            </div>
            <p className="text-xs font-medium text-slate-200">
              Mô hình 3D đã tạm dừng để giải phóng bộ nhớ & vRAM
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Mô hình đã cuộn ra khỏi màn hình. Cuộn vào vùng nhìn hoặc bấm bên dưới để tiếp tục.
            </p>
            <button
              type="button"
              onClick={() => setForceActive(true)}
              className="mt-3.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-medium border border-sky-500/30 transition-colors flex items-center gap-1.5 cursor-pointer pointer-events-auto"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Tiếp tục mô hình</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      {isCanvasActive && (
        <div className="absolute bottom-2.5 right-3 pointer-events-none text-[11px] text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/50 backdrop-blur-sm">
          Kéo chuột để xoay • Cuộn để phóng to/thu nhỏ
        </div>
      )}
    </div>
  );
});

export default Atom3DViewer;
