'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Network,
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { InteractiveGraphNode, LandingRolePerspective } from '../../types';
import { useSceneScrollVars } from '../../hooks/useSceneScrollVars';
import { FloatingSocraticMascot } from '../mascot/FloatingSocraticMascot';
import { TiltCard } from '../shared/TiltCard';

const GRAPH_NODES: readonly InteractiveGraphNode[] = [
  {
    id: 'recursion',
    titleKey: 'classroom.nodes.recursion.title',
    categoryKey: 'classroom.nodes.recursion.category',
    status: 'mastered',
    masteryPercent: 96,
    x: 90,
    y: 72,
    connections: ['dp', 'pointers'],
    diagnosticKey: 'classroom.nodes.recursion.diagnostic',
    recommendedActionKey: 'classroom.nodes.recursion.action',
    formulaHint: 'T(n) = 2T(n/2) + O(n) ⇒ O(n log n)',
  },
  {
    id: 'pointers',
    titleKey: 'classroom.nodes.pointers.title',
    categoryKey: 'classroom.nodes.pointers.category',
    status: 'gap',
    masteryPercent: 42,
    x: 155,
    y: 185,
    connections: ['recursion', 'segmentTree'],
    diagnosticKey: 'classroom.nodes.pointers.diagnostic',
    recommendedActionKey: 'classroom.nodes.pointers.action',
    formulaHint: '*(ptr + i) ≡ arr[i]  [Memory Gap Detected]',
  },
  {
    id: 'dp',
    titleKey: 'classroom.nodes.dp.title',
    categoryKey: 'classroom.nodes.dp.category',
    status: 'mastered',
    masteryPercent: 91,
    x: 270,
    y: 58,
    connections: ['recursion', 'segmentTree', 'dijkstra'],
    diagnosticKey: 'classroom.nodes.dp.diagnostic',
    recommendedActionKey: 'classroom.nodes.dp.action',
    formulaHint: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-w_i] + v_i)',
  },
  {
    id: 'segmentTree',
    titleKey: 'classroom.nodes.segmentTree.title',
    categoryKey: 'classroom.nodes.segmentTree.category',
    status: 'inProgress',
    masteryPercent: 74,
    x: 315,
    y: 168,
    connections: ['pointers', 'dp', 'fenwick'],
    diagnosticKey: 'classroom.nodes.segmentTree.diagnostic',
    recommendedActionKey: 'classroom.nodes.segmentTree.action',
    formulaHint: 'tree[node] = merge(tree[2*node], tree[2*node+1])',
  },
  {
    id: 'dijkstra',
    titleKey: 'classroom.nodes.dijkstra.title',
    categoryKey: 'classroom.nodes.dijkstra.category',
    status: 'mastered',
    masteryPercent: 89,
    x: 445,
    y: 74,
    connections: ['dp', 'fenwick'],
    diagnosticKey: 'classroom.nodes.dijkstra.diagnostic',
    recommendedActionKey: 'classroom.nodes.dijkstra.action',
    formulaHint: 'd[v] = min(d[v], d[u] + w(u, v))',
  },
  {
    id: 'fenwick',
    titleKey: 'classroom.nodes.fenwick.title',
    categoryKey: 'classroom.nodes.fenwick.category',
    status: 'gap',
    masteryPercent: 48,
    x: 465,
    y: 186,
    connections: ['segmentTree', 'dijkstra'],
    diagnosticKey: 'classroom.nodes.fenwick.diagnostic',
    recommendedActionKey: 'classroom.nodes.fenwick.action',
    formulaHint: 'idx += idx & (-idx)  [Bitwise Review Needed]',
  },
] as const;

export interface SmartClassroomSectionProps {
  role: LandingRolePerspective;
}

export function SmartClassroomSection({ role }: SmartClassroomSectionProps) {
  const t = useTranslations('landing.story');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('pointers');
  const [pulseCount, setPulseCount] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  useSceneScrollVars(sectionRef);

  const activeNode =
    GRAPH_NODES.find((n) => n.id === selectedNodeId) ?? GRAPH_NODES[1];

  const handleSelectNode = (id: string) => {
    setSelectedNodeId(id);
    setPulseCount((c) => c + 1);
  };

  return (
    <section
      ref={sectionRef}
      id="khong-gian-lop-hoc"
      className="ilms-scroll-scene relative w-full py-20 lg:py-32 overflow-visible"
    >
      {/* Floating Planet-Robot Companion on Outer Left Orbital Edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden lg:block absolute left-[2%] xl:left-[4%] -top-10 z-20"
        style={{
          transform:
            'translate3d(0, calc((var(--s, 0.5) - 0.5) * -65px), 0)',
        }}
      >
        <img
          src="/images/landing/companion-planet-robot.png"
          alt=""
          draggable={false}
          className="ilms-zero-g-float w-36 h-40 xl:w-48 xl:h-52 object-contain drop-shadow-[0_22px_40px_rgba(6,182,212,0.36)]"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-20">
        {/* Section Header */}
        <div className="ilms-scroll-rise flex flex-col items-center text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <div className="ilms-world-glass inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-blue-900 dark:text-sky-200 text-xs font-bold mb-4">
            <Network className="w-4 h-4 text-sky-500 dark:text-sky-300" />
            <span>{t('classroom.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight text-balance">
            {t('classroom.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-sky-100/85 mt-3.5 leading-relaxed">
            {t('classroom.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: Interactive Knowledge Constellation + Node Inspector */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <TiltCard
              maxTilt={4}
              scaleOnHover={1.005}
              className="ilms-world-glass-radiant p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-sky-300" />
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white">
                    {t('classroom.graphCardTitle')}
                  </h3>
                </div>
                <span className="text-xs font-bold text-blue-700 dark:text-sky-300">
                  {t('classroom.clickNodeHint')}
                </span>
              </div>

              {/* Interactive SVG Constellation Canvas with Scroll-Driven Route Filament */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-br from-[#061844] via-[#08245e] to-[#041030] border border-sky-300/20 shadow-inner overflow-hidden">
                <svg
                  viewBox="0 0 560 240"
                  className="w-full h-full select-none"
                  aria-label={t('classroom.graphCardTitle')}
                >
                  <defs>
                    <linearGradient id="ilms-constellation-route" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="50%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>

                  {/* Self-Drawing Constellation Spine Curve */}
                  <path
                    d="M 90 72 C 125 140, 130 185, 155 185 C 205 185, 225 58, 270 58 C 295 58, 295 168, 315 168 C 370 168, 395 74, 445 74 C 455 74, 458 140, 465 186"
                    fill="none"
                    stroke="url(#ilms-constellation-route)"
                    strokeWidth="2.5"
                    strokeOpacity="0.45"
                    strokeDasharray="6 6"
                  />

                  {/* Edges */}
                  {GRAPH_NODES.map((node) =>
                    node.connections.map((targetId) => {
                      const target = GRAPH_NODES.find((n) => n.id === targetId);
                      if (!target || node.id > target.id) return null;
                      const isHighlighted =
                        node.id === activeNode.id || target.id === activeNode.id;
                      return (
                        <line
                          key={`${node.id}-${target.id}`}
                          x1={node.x}
                          y1={node.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={isHighlighted ? '#7DD3FC' : 'rgba(148,163,184,0.32)'}
                          strokeWidth={isHighlighted ? 2.8 : 1.5}
                          strokeDasharray={
                            node.status === 'gap' || target.status === 'gap'
                              ? '5 4'
                              : undefined
                          }
                        />
                      );
                    })
                  )}

                  {/* Clickable Constellation Nodes */}
                  {GRAPH_NODES.map((node) => {
                    const isSelected = node.id === activeNode.id;
                    const fill =
                      node.status === 'mastered'
                        ? '#10B981'
                        : node.status === 'inProgress'
                        ? '#38BDF8'
                        : '#F43F5E';

                    return (
                      <g
                        key={node.id}
                        onClick={() => handleSelectNode(node.id)}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={26}
                            fill={fill}
                            opacity={0.26}
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isSelected ? 15 : 12}
                          fill={fill}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 3 : 1.5}
                        />
                        <text
                          x={node.x}
                          y={node.y + 29}
                          textAnchor="middle"
                          fill={isSelected ? '#7DD3FC' : '#E2E8F0'}
                          fontSize="11.5"
                          fontWeight={isSelected ? '700' : '600'}
                        >
                          {t(node.titleKey)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected Node Live Diagnostic Inspector */}
              <div className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {activeNode.status === 'mastered' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : activeNode.status === 'inProgress' ? (
                      <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {t(activeNode.titleKey)} — {activeNode.masteryPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-sky-100/85">
                    {t(activeNode.diagnosticKey)}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white dark:from-sky-300 dark:to-cyan-200 dark:text-slate-950 text-xs font-bold whitespace-nowrap self-start sm:self-center shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t(activeNode.recommendedActionKey)}</span>
                </span>
              </div>
            </TiltCard>

            {/* Open Spatial Classroom KPI Strip */}
            <div className="grid grid-cols-3 gap-4">
              <TiltCard maxTilt={5} className="p-4 sm:p-5">
                <span className="text-xl sm:text-3xl font-extrabold text-blue-700 dark:text-sky-300">
                  98.6%
                </span>
                <p className="text-xs text-slate-700 dark:text-sky-100/85 mt-1 font-semibold">
                  {role === 'teacher'
                    ? t('classroom.kpi1Teacher')
                    : t('classroom.kpi1Student')}
                </p>
              </TiltCard>
              <TiltCard maxTilt={5} className="p-4 sm:p-5">
                <span className="text-xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-300">
                  +42%
                </span>
                <p className="text-xs text-slate-700 dark:text-sky-100/85 mt-1 font-semibold">
                  {t('classroom.kpi2')}
                </p>
              </TiltCard>
              <TiltCard maxTilt={5} className="p-4 sm:p-5">
                <span className="text-xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-300">
                  24/7
                </span>
                <p className="text-xs text-slate-700 dark:text-sky-100/85 mt-1 font-semibold">
                  {t('classroom.kpi3')}
                </p>
              </TiltCard>
            </div>
          </div>

          {/* RIGHT COLUMN: Unboxed Mascot Graph Navigator Pose */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <FloatingSocraticMascot
              pose="graph"
              altText="ILMS Knowledge Graph Navigator Owl Mascot"
              badgeText={t(activeNode.categoryKey)}
              quotes={[
                t(activeNode.diagnosticKey),
                t('classroom.mascotQuote2'),
                t('classroom.mascotQuote3'),
              ]}
              formula={activeNode.formulaHint}
              nextTipLabel={t('hero.nextHintBtn')}
              floatingTagTop={t('classroom.tagTop')}
              floatingTagBottom={t('classroom.tagBottom')}
              externalPulse={pulseCount}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
