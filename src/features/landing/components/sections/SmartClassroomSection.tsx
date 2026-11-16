'use client';

import React, { useState } from 'react';
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
import { FloatingSocraticMascot } from '../mascot/FloatingSocraticMascot';
import { TiltCard } from '../shared/TiltCard';

const GRAPH_NODES: readonly InteractiveGraphNode[] = [
  {
    id: 'recursion',
    titleKey: 'classroom.nodes.recursion.title',
    categoryKey: 'classroom.nodes.recursion.category',
    status: 'mastered',
    masteryPercent: 96,
    x: 95,
    y: 70,
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
    x: 140,
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
    x: 265,
    y: 55,
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
    x: 295,
    y: 165,
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
    x: 435,
    y: 75,
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
    x: 445,
    y: 185,
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

  const activeNode =
    GRAPH_NODES.find((n) => n.id === selectedNodeId) ?? GRAPH_NODES[1];

  const handleSelectNode = (id: string) => {
    setSelectedNodeId(id);
    setPulseCount((c) => c + 1);
  };

  return (
    <section
      id="khong-gian-lop-hoc"
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-bold mb-4">
          <Network className="w-4 h-4 text-sky-500" />
          <span>{t('classroom.badge')}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('classroom.title')}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          {t('classroom.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: Interactive Knowledge Graph Mesh + Node Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <TiltCard
            maxTilt={4}
            scaleOnHover={1.005}
            className="bg-white/95 dark:bg-[#1E1F20]/95 p-5 sm:p-6 shadow-xl shadow-blue-950/5 dark:shadow-black/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-sky-400" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('classroom.graphCardTitle')}
                </h3>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-sky-400">
                {t('classroom.clickNodeHint')}
              </span>
            </div>

            {/* Interactive SVG Constellation Canvas */}
            <div className="relative w-full h-60 sm:h-68 rounded-2xl bg-slate-900 dark:bg-[#0B0F19] overflow-hidden">
              <svg
                viewBox="0 0 540 240"
                className="w-full h-full select-none"
                aria-label={t('classroom.graphCardTitle')}
              >
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
                        stroke={isHighlighted ? '#38BDF8' : '#334155'}
                        strokeWidth={isHighlighted ? 2.6 : 1.4}
                        strokeDasharray={
                          node.status === 'gap' || target.status === 'gap' ? '5 3' : undefined
                        }
                      />
                    );
                  })
                )}

                {/* Clickable Nodes */}
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
                          r={24}
                          fill={fill}
                          opacity={0.22}
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
                        y={node.y + 28}
                        textAnchor="middle"
                        fill={isSelected ? '#38BDF8' : '#CBD5E1'}
                        fontSize="11"
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
            <div className="mt-4 p-4 rounded-2xl bg-slate-100/90 dark:bg-[#131314] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {activeNode.status === 'mastered' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : activeNode.status === 'inProgress' ? (
                    <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {t(activeNode.titleKey)} — {activeNode.masteryPercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t(activeNode.diagnosticKey)}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950 text-xs font-bold whitespace-nowrap self-start sm:self-center">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t(activeNode.recommendedActionKey)}</span>
              </span>
            </div>
          </TiltCard>

          {/* Live EduPulse Classroom KPI Strip */}
          <div className="grid grid-cols-3 gap-3.5">
            <TiltCard maxTilt={6} className="bg-white/90 dark:bg-[#1E1F20]/90 p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-sky-400">
                98.6%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {role === 'teacher' ? t('classroom.kpi1Teacher') : t('classroom.kpi1Student')}
              </p>
            </TiltCard>
            <TiltCard maxTilt={6} className="bg-white/90 dark:bg-[#1E1F20]/90 p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                +42%
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('classroom.kpi2')}
              </p>
            </TiltCard>
            <TiltCard maxTilt={6} className="bg-white/90 dark:bg-[#1E1F20]/90 p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                24/7
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('classroom.kpi3')}
              </p>
            </TiltCard>
          </div>
        </div>

        {/* RIGHT COLUMN: Mascot Graph Navigator Pose */}
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
    </section>
  );
}
