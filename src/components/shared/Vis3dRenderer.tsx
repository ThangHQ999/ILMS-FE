'use client';

import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { useTranslations } from 'next-intl';
import { useInView } from 'react-intersection-observer';

export interface Vis3dRendererProps {
  rawCode: string;
  isStreaming?: boolean;
  className?: string;
}

export interface Vis3dElement {
  shape?: 'node' | 'sphere' | 'vector' | 'line' | 'box' | 'cylinder' | string;
  id?: string | number;
  label?: string;
  position?: [number, number, number];
  from?: [number, number, number];
  to?: [number, number, number];
  color?: string;
  radius?: number;
  size?: [number, number, number];
  [key: string]: unknown;
}

export interface Vis3dSceneData {
  type?: string;
  title?: string;
  elements?: Vis3dElement[];
  nodes?: Array<{ id?: string | number; label?: string; position?: [number, number, number]; color?: string }>;
  edges?: Array<{ from?: [number, number, number]; to?: [number, number, number]; color?: string; label?: string }>;
  camera?: {
    position?: [number, number, number];
    target?: [number, number, number];
  };
  grid?: boolean;
  [key: string]: unknown;
}

export const Vis3dRenderer = memo(function Vis3dRenderer({
  rawCode,
  isStreaming = false,
  className = '',
}: Vis3dRendererProps) {
  const t = useTranslations('aiTutor');
  const [activeTab, setActiveTab] = useState<'viewport' | 'config'>('viewport');
  const [copied, setCopied] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [forceActive, setForceActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Unmount Three.js Canvas khi bị cuộn khuất khỏi màn hình để giải phóng vRAM
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const isCanvasActive = inView || isFullscreen || forceActive;

  const cleanCode = rawCode.trim();

  // Safely attempt to parse JSON data
  const { data, isValidJson } = useMemo(() => {
    if (!cleanCode) return { data: null, isValidJson: false };
    try {
      const parsed = JSON.parse(cleanCode) as Vis3dSceneData;
      return { data: parsed, isValidJson: true };
    } catch {
      return { data: null, isValidJson: false };
    }
  }, [cleanCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Three.js Scene Setup, Element Drawing, and Cleanup Effect
  useEffect(() => {
    const container = isFullscreen ? fullscreenContainerRef.current : containerRef.current;
    if (!container || !isValidJson || !data || activeTab !== 'viewport' || !isCanvasActive) {
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3.5, 6);

    // 3. WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. CSS2DRenderer for floating labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.left = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // Critical for OrbitControls drag interaction
    container.appendChild(labelRenderer.domElement);

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.maxDistance = 60;
    controls.minDistance = 0.5;
    controlsRef.current = controls;

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(6, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    // 7. Grid & Axes Helpers
    const gridHelper = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.01;
    gridHelper.visible = showGrid;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1.5);
    scene.add(axesHelper);

    // 8. Normalize Elements from Data
    const elementsList: Vis3dElement[] = [];
    if (Array.isArray(data.elements)) {
      elementsList.push(...data.elements);
    }
    // Fallback: support graph nodes/edges format
    if (Array.isArray(data.nodes)) {
      data.nodes.forEach((n) => {
        elementsList.push({
          shape: 'node',
          id: n.id,
          label: n.label,
          position: n.position || [0, 0, 0],
          color: n.color || '#3b82f6',
        });
      });
    }
    if (Array.isArray(data.edges)) {
      data.edges.forEach((e) => {
        elementsList.push({
          shape: 'vector',
          from: e.from || [0, 0, 0],
          to: e.to || [1, 1, 1],
          color: e.color || '#38bdf8',
          label: e.label,
        });
      });
    }

    // 9. Render Elements into Scene
    const boundingBox = new THREE.Box3();
    let hasPoints = false;

    elementsList.forEach((elem) => {
      const shapeType = (elem.shape || 'node').toLowerCase();

      // Case A: Node or Sphere
      if (shapeType === 'node' || shapeType === 'sphere') {
        const pos = elem.position || [0, 0, 0];
        const radius = elem.radius ?? (shapeType === 'node' ? 0.28 : 0.45);
        const colorHex = elem.color || (shapeType === 'node' ? '#3b82f6' : '#ef4444');

        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.3,
          metalness: 0.2,
          emissive: new THREE.Color(colorHex),
          emissiveIntensity: 0.15,
        });
        const sphereMesh = new THREE.Mesh(geometry, material);
        sphereMesh.position.set(pos[0], pos[1], pos[2]);
        scene.add(sphereMesh);

        boundingBox.expandByPoint(sphereMesh.position);
        hasPoints = true;

        // Floating HTML label via CSS2DObject
        if (elem.label) {
          const labelDiv = document.createElement('div');
          labelDiv.className =
            'px-2 py-0.5 rounded-md text-[11px] font-medium font-sans bg-slate-900/90 text-slate-100 border border-slate-700/80 shadow-lg pointer-events-none select-none backdrop-blur-xs whitespace-nowrap';
          labelDiv.textContent = elem.label;

          const labelObj = new CSS2DObject(labelDiv);
          labelObj.position.set(0, radius + 0.25, 0);
          sphereMesh.add(labelObj);
        }
      }

      // Case B: Vector (Arrow)
      else if (shapeType === 'vector') {
        const fromPos = elem.from || [0, 0, 0];
        const toPos = elem.to || [1, 1, 1];
        const colorHex = elem.color || '#3b82f6';

        const origin = new THREE.Vector3(...fromPos);
        const destination = new THREE.Vector3(...toPos);
        const direction = new THREE.Vector3().subVectors(destination, origin);
        const length = direction.length();

        if (length > 0.0001) {
          direction.normalize();
          const headLength = Math.min(0.35 * length, 0.4);
          const headWidth = Math.min(0.2 * length, 0.25);

          const arrow = new THREE.ArrowHelper(
            direction,
            origin,
            length,
            new THREE.Color(colorHex).getHex(),
            headLength,
            headWidth
          );
          scene.add(arrow);

          boundingBox.expandByPoint(origin);
          boundingBox.expandByPoint(destination);
          hasPoints = true;

          // Vector Label at Midpoint
          if (elem.label) {
            const labelDiv = document.createElement('div');
            labelDiv.className =
              'px-2 py-0.5 rounded-md text-[11px] font-medium font-sans bg-blue-950/90 text-cyan-300 border border-blue-800 shadow-md pointer-events-none select-none backdrop-blur-xs whitespace-nowrap';
            labelDiv.textContent = elem.label;

            const labelObj = new CSS2DObject(labelDiv);
            const mid = new THREE.Vector3().addVectors(origin, destination).multiplyScalar(0.5);
            labelObj.position.set(mid.x, mid.y + 0.2, mid.z);
            scene.add(labelObj);
          }
        }
      }

      // Case C: Line
      else if (shapeType === 'line') {
        const fromPos = elem.from || [0, 0, 0];
        const toPos = elem.to || [1, 1, 1];
        const colorHex = elem.color || '#38bdf8';

        const points = [new THREE.Vector3(...fromPos), new THREE.Vector3(...toPos)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(colorHex).getHex(),
          linewidth: 2,
        });
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        scene.add(lineMesh);

        boundingBox.expandByPoint(points[0]);
        boundingBox.expandByPoint(points[1]);
        hasPoints = true;

        if (elem.label) {
          const labelDiv = document.createElement('div');
          labelDiv.className =
            'px-2 py-0.5 rounded-md text-[11px] font-sans bg-slate-900/90 text-slate-200 border border-slate-700 shadow-md pointer-events-none select-none backdrop-blur-xs';
          labelDiv.textContent = elem.label;

          const labelObj = new CSS2DObject(labelDiv);
          const mid = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);
          labelObj.position.set(mid.x, mid.y + 0.15, mid.z);
          scene.add(labelObj);
        }
      }

      // Case D: Box
      else if (shapeType === 'box') {
        const pos = elem.position || [0, 0, 0];
        const size = elem.size || [1, 1, 1];
        const colorHex = elem.color || '#10b981';

        const geometry = new THREE.BoxGeometry(...size);
        const material = new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.4,
          metalness: 0.1,
        });
        const boxMesh = new THREE.Mesh(geometry, material);
        boxMesh.position.set(pos[0], pos[1], pos[2]);
        scene.add(boxMesh);

        boundingBox.expandByPoint(boxMesh.position);
        hasPoints = true;

        if (elem.label) {
          const labelDiv = document.createElement('div');
          labelDiv.className =
            'px-2 py-0.5 rounded-md text-[11px] font-sans bg-slate-900/90 text-emerald-300 border border-emerald-800 shadow-md pointer-events-none select-none';
          labelDiv.textContent = elem.label;

          const labelObj = new CSS2DObject(labelDiv);
          labelObj.position.set(0, size[1] / 2 + 0.25, 0);
          boxMesh.add(labelObj);
        }
      }
    });

    // 10. Auto-Fit Camera to all 3D Elements
    const initialCamPos = new THREE.Vector3(4, 3.5, 6);
    const initialTarget = new THREE.Vector3(0, 0, 0);

    if (hasPoints) {
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      controls.target.copy(center);
      initialTarget.copy(center);

      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z, 2);
      const fovRad = camera.fov * (Math.PI / 180);
      let cameraDistance = Math.abs(maxDim / 2 / Math.tan(fovRad / 2)) * 1.6;
      cameraDistance = Math.max(cameraDistance, 3.5);

      const targetPos = new THREE.Vector3(
        center.x + cameraDistance * 0.7,
        center.y + cameraDistance * 0.5,
        center.z + cameraDistance * 0.8
      );
      camera.position.copy(targetPos);
      initialCamPos.copy(targetPos);
      camera.lookAt(center);
    }

    // Reset camera function handler
    resetCameraRef.current = () => {
      controls.target.copy(initialTarget);
      camera.position.copy(initialCamPos);
      camera.lookAt(initialTarget);
      controls.update();
    };

    // 11. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
          labelRenderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 12. Animation Loop
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // 13. Comprehensive Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      controls.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
      controlsRef.current = null;
      resetCameraRef.current = null;
    };
  }, [isValidJson, data, activeTab, isFullscreen, showGrid, isAutoRotate, isCanvasActive]);

  // Synchronize autoRotate prop when controls are active
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  // State: Streaming & Incomplete JSON
  if (isStreaming && !isValidJson) {
    return (
      <div className={`rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden my-3.5 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-100/50 dark:bg-indigo-900/30 border-b border-indigo-200/60 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-xs font-semibold font-mono tracking-wide">
              {t('vis3dTitle')} • {t('vis3dStreaming')}
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">vis-3d</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-200 bg-[#0f172a] overflow-x-auto">
          <code>{cleanCode}</code>
        </pre>
      </div>
    );
  }

  const elementsCount = Array.isArray(data?.elements)
    ? data.elements.length
    : (data?.nodes?.length || 0) + (data?.edges?.length || 0);

  return (
    <>
      <div
        ref={inViewRef}
        className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0B0F19] overflow-hidden shadow-md my-4 transition-all duration-200 ${className}`}
      >
        {/* 3D Viewport Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-cyan-400">
              view_in_ar
            </span>
            <span className="text-xs font-semibold tracking-wide font-sans text-slate-100">
              {data?.title || t('vis3dTitle')}
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded-full font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
              {elementsCount} Objects • Interactive 3D
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab(activeTab === 'viewport' ? 'config' : 'viewport')}
              type="button"
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              title={activeTab === 'config' ? 'Xem khung nhìn 3D' : t('vis3dConfig')}
            >
              <span className="material-symbols-outlined text-[14px]">
                {activeTab === 'config' ? 'view_in_ar' : 'data_object'}
              </span>
              <span className="hidden sm:inline">
                {activeTab === 'config' ? '3D Viewport' : t('vis3dConfig')}
              </span>
            </button>

            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title={t('vis3dCopyConfig')}
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              type="button"
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
              title={t('zoomFullscreen')}
            >
              <span className="material-symbols-outlined text-[14px]">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Content Body: Three.js WebGL Canvas or JSON Config */}
        {activeTab === 'config' ? (
          <pre className="p-4 text-xs font-mono text-cyan-300 bg-[#070b14] overflow-x-auto leading-relaxed border-t border-slate-800/80">
            <code>{cleanCode}</code>
          </pre>
        ) : (
          <div className="relative w-full h-[360px] bg-gradient-to-b from-[#0B0F19] via-[#070B14] to-[#04060A] overflow-hidden select-none">
            {/* Interactive Three.js Container */}
            {isCanvasActive ? (
              <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-950/80">
                <span className="material-symbols-outlined text-[28px] text-cyan-500/60 mb-2">view_in_ar</span>
                <p className="text-xs font-medium text-slate-200">
                  Mô hình 3D đã tạm dừng để giải phóng tài nguyên đồ họa (vRAM)
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Mô hình đã cuộn ra khỏi màn hình. Cuộn vào vùng nhìn hoặc bấm nút bên dưới để tiếp tục.
                </p>
                <button
                  type="button"
                  onClick={() => setForceActive(true)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/80 text-xs font-medium transition-colors cursor-pointer pointer-events-auto"
                >
                  Kích hoạt lại
                </button>
              </div>
            )}

            {/* Viewport Floating HUD Controls */}
            {isCanvasActive && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 text-slate-400 shadow-lg">
              {/* Reset View Button */}
              <button
                onClick={() => resetCameraRef.current?.()}
                type="button"
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Đặt lại góc nhìn (Reset Camera)"
              >
                <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
              </button>

              {/* Auto Rotate Toggle */}
              <button
                onClick={() => setIsAutoRotate((prev) => !prev)}
                type="button"
                className={`p-1 rounded transition-colors ${
                  isAutoRotate ? 'text-cyan-400 bg-cyan-950/50' : 'hover:bg-slate-800 text-slate-400'
                }`}
                title="Tự động xoay 360°"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
              </button>

              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid((prev) => !prev)}
                type="button"
                className={`p-1 rounded transition-colors ${
                  showGrid ? 'text-cyan-400 bg-cyan-950/50' : 'hover:bg-slate-800 text-slate-400'
                }`}
                title="Bật/tắt lưới tọa độ"
              >
                <span className="material-symbols-outlined text-[16px]">grid_4x4</span>
              </button>
              </div>
            )}

            {/* Quick Interaction Tip HUD */}
            {isCanvasActive && (
              <div className="absolute bottom-2.5 left-3 z-20 text-[10px] font-mono text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800/60 pointer-events-none">
                Chuột trái: Xoay 360° • Cuộn chuột: Zoom • Chuột phải: Kéo không gian
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Interactive 3D Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-cyan-400">view_in_ar</span>
              <span className="font-semibold text-sm">
                {data?.title || t('vis3dTitle')} • {t('zoomFullscreen')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resetCameraRef.current?.()}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs flex items-center gap-1.5 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">center_focus_strong</span>
                <span>Đặt lại góc nhìn</span>
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                type="button"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                title="Đóng toàn màn hình"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative bg-[#070B14] rounded-2xl overflow-hidden border border-slate-800">
            <div ref={fullscreenContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>
        </div>
      )}
    </>
  );
});
