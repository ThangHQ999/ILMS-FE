'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomSelect } from '@/components/shared';
import { useCourseKnowledgeGraph } from '../../hooks/useCourse';
import type { CourseKnowledgeGraphNode } from '../../schemas/course.schema';
import { CourseConceptInspectorCard } from './CourseConceptInspectorCard';

interface CourseKnowledgeGraphTabProps {
  courseId: string;
  courseName?: string;
  canEdit?: boolean;
  initialMaterialId?: string | null;
  onAskAiConcept?: (conceptLabel: string) => void;
}

const RELATION_VI_LABELS: Record<string, string> = {
  REQUIRES: 'Yêu cầu',
  DEPENDS_ON: 'Phụ thuộc',
  PREREQUISITE: 'Tiên quyết',
  IS_A: 'Là loại',
  PART_OF: 'Thuộc phần',
  CONTRASTS_WITH: 'Đối chiếu',
  USES: 'Sử dụng',
  APPLIES_TO: 'Áp dụng',
};

function getNodeBorderColor(status: string, isSelected: boolean): string {
  if (isSelected) return '#0059bb';
  const s = status.toUpperCase();
  if (s === 'MASTERED' || s === 'COMPLETED') return '#10b981';
  if (s === 'IN_PROGRESS' || s === 'LEARNING') return '#3b82f6';
  return '#94a3b8';
}

export function CourseKnowledgeGraphTab({
  courseId,
  courseName,
  canEdit = false,
  initialMaterialId,
  onAskAiConcept,
}: CourseKnowledgeGraphTabProps) {
  const t = useTranslations('courseKg');
  const { data: graph, isLoading, isFetching, isError, refetch } =
    useCourseKnowledgeGraph(courseId);

  const [viewMode, setViewMode] = useState<'graph' | 'topics'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const allNodes = useMemo(() => graph?.nodes ?? [], [graph?.nodes]);
  const allEdges = useMemo(() => graph?.edges ?? [], [graph?.edges]);

  const topicOptions = useMemo(() => {
    const unique = new Set<string>();
    allNodes.forEach((n) => {
      const key = n.topic || n.category || 'Chung';
      unique.add(key);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [allNodes]);

  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allNodes.filter((n) => {
      const nodeTopic = n.topic || n.category || 'Chung';
      const matchesTopic = selectedTopic === 'ALL' || nodeTopic === selectedTopic;
      const matchesMaterial =
        !initialMaterialId || !n.materialId || n.materialId === initialMaterialId;
      const matchesSearch =
        !q ||
        n.label.toLowerCase().includes(q) ||
        nodeTopic.toLowerCase().includes(q) ||
        (n.description ?? '').toLowerCase().includes(q);
      return matchesTopic && matchesMaterial && matchesSearch;
    });
  }, [allNodes, initialMaterialId, searchQuery, selectedTopic]);

  const activeNode: CourseKnowledgeGraphNode | null = useMemo(() => {
    if (selectedNodeId) {
      const found = allNodes.find((n) => n.id === selectedNodeId);
      if (found) return found;
    }
    return filteredNodes[0] ?? allNodes[0] ?? null;
  }, [allNodes, filteredNodes, selectedNodeId]);

  // Group nodes by Topic for Topic List view
  const groupedByTopic = useMemo(() => {
    const groups = new Map<string, CourseKnowledgeGraphNode[]>();
    filteredNodes.forEach((node) => {
      const key = node.topic || node.category || 'Chủ đề chung';
      const bucket = groups.get(key) ?? [];
      bucket.push(node);
      groups.set(key, bucket);
    });
    return Array.from(groups.entries());
  }, [filteredNodes]);

  // Compute deterministic layered positions for compact Course React Flow canvas
  const flowElements = useMemo(() => {
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    const topicIndexMap = new Map<string, number>();
    topicOptions.forEach((t, idx) => topicIndexMap.set(t, idx));

    const rowCounter = new Map<number, number>();
    const rfNodes: Node[] = filteredNodes.map((item) => {
      const tKey = item.topic || item.category || 'Chung';
      const col = (topicIndexMap.get(tKey) ?? 0) % 4;
      const row = rowCounter.get(col) ?? 0;
      rowCounter.set(col, row + 1);

      const isSelected = activeNode?.id === item.id;
      const borderColor = getNodeBorderColor(item.status, isSelected);

      return {
        id: item.id,
        position: { x: col * 240 + 20, y: row * 96 + 20 },
        data: {
          label: (
            <div className="text-left px-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {tKey}
              </div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                {item.label}
              </div>
            </div>
          ),
        },
        style: {
          background: isSelected ? '#eff6ff' : '#ffffff',
          border: `2px solid ${borderColor}`,
          borderRadius: '14px',
          padding: '6px 10px',
          width: 210,
          boxShadow: isSelected ? '0 6px 18px rgba(0, 89, 187, 0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
        },
      };
    });

    const rfEdges: Edge[] = allEdges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((e, idx) => {
        const relKey = e.relation.toUpperCase();
        return {
          id: `course-edge-${e.source}-${e.target}-${idx}`,
          source: e.source,
          target: e.target,
          label: e.label || RELATION_VI_LABELS[relKey] || e.relation,
          animated: relKey === 'REQUIRES' || relKey === 'PREREQUISITE',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          style: { stroke: '#64748b', strokeWidth: 1.8 },
          labelStyle: { fontSize: 10, fontWeight: 700, fill: '#475569' },
        };
      });

    return { rfNodes, rfEdges };
  }, [activeNode?.id, allEdges, filteredNodes, topicOptions]);

  const hasFilters = Boolean(searchQuery.trim()) || selectedTopic !== 'ALL';
  const studioHref = `/knowledge-graph?courseId=${encodeURIComponent(courseId)}${
    initialMaterialId ? `&materialId=${encodeURIComponent(initialMaterialId)}` : ''
  }`;

  return (
    <div className="flex flex-col gap-5">
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('title')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {graph?.totalNodes ?? allNodes.length} {t('conceptsUnit')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {graph?.totalEdges ?? allEdges.length} {t('edgesUnit')}
              </span>
              {isFetching && !isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                  Đang cập nhật...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tổng hợp thực thể tri thức đã xuất bản Neo4j từ giáo trình của môn {courseName || 'này'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span>{t('viewGraph')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('topics')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'topics'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">topic</span>
                <span>{t('viewTopics')}</span>
              </button>
            </div>

            <Link
              href={studioHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_full</span>
              <span>{t('openStudio')}</span>
            </Link>
          </div>
        </div>

        {/* Search & Topic Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm khái niệm, chủ đề hoặc từ khóa..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <CustomSelect<string>
            value={selectedTopic}
            onChange={setSelectedTopic}
            options={[
              { value: 'ALL', label: `Tất cả chủ đề (${topicOptions.length})` },
              ...topicOptions.map((topic) => ({ value: topic, label: topic })),
            ]}
            className="min-w-[200px]"
          />

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('ALL');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT + 7-STATE MATRIX */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-pulse">
          <div className="lg:col-span-7 h-[520px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800" />
          <div className="lg:col-span-5 h-[520px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800" />
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">cloud_off</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Không thể tải Đồ thị tri thức của môn học
          </h3>
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-4 py-2 rounded-xl bg-[#0059bb] text-white text-xs font-bold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : allNodes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">hub</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Môn học chưa có Đồ thị tri thức nào được xuất bản
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            {canEdit
              ? 'Hãy sang tab "Tài liệu & Học liệu", tải lên giáo trình và bấm "Bóc tách AI" để hệ thống tự động xây dựng Đồ thị tri thức Neo4j cho môn học này.'
              : 'Giảng viên chưa xuất bản đồ thị tri thức cho môn học này. Hãy quay lại sau nhé!'}
          </p>
          {canEdit && (
            <Link
              href={`/courses/${courseId}?tab=materials`}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              <span>Đi tới Tab Tài liệu để Bóc tách AI</span>
            </Link>
          )}
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-slate-400">search_off</span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Không có khái niệm nào khớp từ khóa hoặc chủ đề đang chọn.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTopic('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (7/12): Interactive Graph or Topic List */}
          <div className="lg:col-span-7">
            {viewMode === 'graph' ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden h-[560px] shadow-xs relative">
                <ReactFlow
                  nodes={flowElements.rfNodes}
                  edges={flowElements.rfEdges}
                  fitView
                  minZoom={0.2}
                  maxZoom={1.8}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                >
                  <Background gap={20} size={1} />
                  <Controls />
                </ReactFlow>
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Đã vững
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Đang học
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Chưa học
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedByTopic.map(([topicName, nodesInTopic]) => (
                  <div
                    key={topicName}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {topicName}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {nodesInTopic.length} khái niệm
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {nodesInTopic.map((item) => {
                        const isSelected = activeNode?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedNodeId(item.id)}
                            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-xs'
                                : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                              {item.label}
                            </div>
                            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <span>{item.level}</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {item.masteryPercent}%
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (5/12): Rich Concept Knowledge Card */}
          <div className="lg:col-span-5">
            <CourseConceptInspectorCard
              courseId={courseId}
              node={activeNode}
              allNodes={allNodes}
              onSelectNode={(id) => setSelectedNodeId(id)}
              onAskAiConcept={onAskAiConcept}
            />
          </div>
        </div>
      )}
    </div>
  );
}
