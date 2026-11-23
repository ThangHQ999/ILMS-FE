'use client';

import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { CustomSelect } from '@/components/shared';
import '@xyflow/react/dist/style.css';
import { useDraftRevisionGraph } from './hooks/useIngestionJobs';
import {
  addEntityToDraft,
  addRelationToDraft,
  addTopicToDraft,
  deleteNodeByPath,
  getNodeFields,
  parseDraftGraph,
  stringifyDraftGraph,
  updateNodeFieldByPath,
  type DraftEntity,
} from './utils/draft-graph-crud';
import { DraftCreateEntityModal } from './components/hub/modals/DraftCreateEntityModal';
import { DraftCreateRelationModal } from './components/hub/modals/DraftCreateRelationModal';
import { DraftCreateTopicModal } from './components/hub/modals/DraftCreateTopicModal';
import { DraftNodeEditModal } from './components/hub/modals/DraftNodeEditModal';
import { DraftEntityEditorModal } from './components/hub/modals/DraftEntityEditorModal';

const COLUMNS: Record<string, number> = {
  Topic: 0,
  Chunk: 0,
  KnowledgeEntity: 1,
  Definition: 2,
  Exercise: 2,
  Process: 2,
  Example: 2,
  Argument: 2,
  ExerciseStep: 3,
  ProcessStep: 3,
};

const NODE_KIND_PALETTES: Record<
  string,
  {
    light: { border: string; bg: string; tag: string; text: string };
    dark: { border: string; bg: string; tag: string; text: string };
  }
> = {
  Topic: {
    light: { border: '#7c3aed', bg: '#f5f3ff', tag: '#6d28d9', text: '#1e1b4b' },
    dark: { border: '#a855f7', bg: '#2e1065', tag: '#c084fc', text: '#f3e8ff' },
  },
  KnowledgeEntity: {
    light: { border: '#0059bb', bg: '#eff6ff', tag: '#0059bb', text: '#172554' },
    dark: { border: '#3b82f6', bg: '#172554', tag: '#60a5fa', text: '#ffffff' },
  },
  Definition: {
    light: { border: '#0284c7', bg: '#f0f9ff', tag: '#0369a1', text: '#082f49' },
    dark: { border: '#38bdf8', bg: '#082f49', tag: '#7dd3fc', text: '#ffffff' },
  },
  Process: {
    light: { border: '#2563eb', bg: '#eff6ff', tag: '#1d4ed8', text: '#1e3a8a' },
    dark: { border: '#60a5fa', bg: '#1e3a8a', tag: '#93c5fd', text: '#ffffff' },
  },
  ProcessStep: {
    light: { border: '#60a5fa', bg: '#f8fafc', tag: '#2563eb', text: '#0f172a' },
    dark: { border: '#93c5fd', bg: '#0f172a', tag: '#bfdbfe', text: '#f8fafc' },
  },
  Exercise: {
    light: { border: '#059669', bg: '#ecfdf5', tag: '#047857', text: '#064e3b' },
    dark: { border: '#10b981', bg: '#064e3b', tag: '#34d399', text: '#ffffff' },
  },
  ExerciseStep: {
    light: { border: '#34d399', bg: '#f8fafc', tag: '#059669', text: '#0f172a' },
    dark: { border: '#6ee7b7', bg: '#0f172a', tag: '#a7f3d0', text: '#f8fafc' },
  },
  Example: {
    light: { border: '#d97706', bg: '#fffbeb', tag: '#b45309', text: '#451a03' },
    dark: { border: '#f59e0b', bg: '#451a03', tag: '#fbbf24', text: '#ffffff' },
  },
  Argument: {
    light: { border: '#db2777', bg: '#fdf2f8', tag: '#be185d', text: '#500724' },
    dark: { border: '#f472b6', bg: '#500724', tag: '#f9a8d4', text: '#ffffff' },
  },
};

interface DraftGraphEditorProps {
  jobId: string;
  revisionId: string;
  jobStatus: string;
  text: string;
  editable: boolean;
  onChange: (text: string) => void;
}

export function DraftGraphEditor({
  jobId,
  revisionId,
  text,
  editable,
  onChange,
}: DraftGraphEditorProps) {
  const t = useTranslations('materialsHub.draftGraph');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [selectedPath, setSelectedPath] = useState('');

  // Modal dialog states
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isAddRelationOpen, setIsAddRelationOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isNodeEditModalOpen, setIsNodeEditModalOpen] = useState(false);
  const [isEntityFullEditorOpen, setIsEntityFullEditorOpen] = useState(false);

  const {
    data: snapshot,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useDraftRevisionGraph(jobId, revisionId, Boolean(jobId && revisionId));

  const data = useMemo(() => parseDraftGraph(text), [text]);

  // Build reactive graph nodes and edges from `data` with fallback to `snapshot`
  const diagram = useMemo(() => {
    const snapshotNodes = snapshot?.nodes ?? [];
    const snapshotEdges = snapshot?.edges ?? [];

    const synthesizedNodes: Array<{ id: string; kind: string; path: string; label: string }> = [];
    const synthesizedEdges: Array<{ source: string; target: string; kind: string }> = [];

    // 1. Topics
    if (Array.isArray(data.topics)) {
      data.topics.forEach((top, tIdx) => {
        const topicId = `topic-${tIdx}`;
        synthesizedNodes.push({
          id: topicId,
          kind: 'Topic',
          path: `topics/${tIdx}`,
          label: top.name || `Topic #${tIdx + 1}`,
        });
      });
    }

    // 2. Entities and nested items
    if (Array.isArray(data.entities)) {
      data.entities.forEach((ent, eIdx) => {
        const entId = `entity-${eIdx}`;
        synthesizedNodes.push({
          id: entId,
          kind: 'KnowledgeEntity',
          path: `entities/${eIdx}`,
          label: ent.name || `Entity #${eIdx + 1}`,
        });

        // Link topic to entity if topic includes concept
        if (Array.isArray(data.topics)) {
          data.topics.forEach((top, tIdx) => {
            if (
              Array.isArray(top.concepts_included) &&
              top.concepts_included.some(
                (c) => c.trim().toLowerCase() === ent.name.trim().toLowerCase()
              )
            ) {
              synthesizedEdges.push({
                source: `topic-${tIdx}`,
                target: entId,
                kind: 'INCLUDES',
              });
            }
          });
        }

        // Definition
        const defText =
          typeof ent.definition === 'string'
            ? ent.definition
            : typeof ent.definition === 'object' && ent.definition !== null
              ? (ent.definition as { content?: string }).content
              : '';
        if (defText) {
          const defId = `def-${eIdx}`;
          synthesizedNodes.push({
            id: defId,
            kind: 'Definition',
            path: `entities/${eIdx}/definition`,
            label: defText,
          });
          synthesizedEdges.push({
            source: entId,
            target: defId,
            kind: 'DEFINES',
          });
        }

        // Processes
        if (Array.isArray(ent.processes)) {
          ent.processes.forEach((proc, pIdx) => {
            const procId = `proc-${eIdx}-${pIdx}`;
            synthesizedNodes.push({
              id: procId,
              kind: 'Process',
              path: `entities/${eIdx}/processes/${pIdx}`,
              label: proc.name,
            });
            synthesizedEdges.push({
              source: entId,
              target: procId,
              kind: 'HAS_PROCESS',
            });

            if (Array.isArray(proc.steps)) {
              proc.steps.forEach((st, sIdx) => {
                const stepId = `step-p-${eIdx}-${pIdx}-${sIdx}`;
                const actionText =
                  typeof st === 'string'
                    ? st
                    : typeof st === 'object' && st !== null
                      ? (st as { action?: string }).action || `Bước #${sIdx + 1}`
                      : `Bước #${sIdx + 1}`;
                synthesizedNodes.push({
                  id: stepId,
                  kind: 'ProcessStep',
                  path: `entities/${eIdx}/processes/${pIdx}/steps/${sIdx}`,
                  label: actionText,
                });
                synthesizedEdges.push({
                  source: procId,
                  target: stepId,
                  kind: 'STEP',
                });
              });
            }
          });
        }

        // Exercises
        if (Array.isArray(ent.exercises)) {
          ent.exercises.forEach((ex, exIdx) => {
            const exId = `ex-${eIdx}-${exIdx}`;
            synthesizedNodes.push({
              id: exId,
              kind: 'Exercise',
              path: `entities/${eIdx}/exercises/${exIdx}`,
              label: ex.title,
            });
            synthesizedEdges.push({
              source: entId,
              target: exId,
              kind: 'HAS_EXERCISE',
            });

            if (Array.isArray(ex.steps)) {
              ex.steps.forEach((st, sIdx) => {
                const stepId = `step-e-${eIdx}-${exIdx}-${sIdx}`;
                const actionText =
                  typeof st === 'string'
                    ? st
                    : typeof st === 'object' && st !== null
                      ? (st as { action?: string }).action || `Bước #${sIdx + 1}`
                      : `Bước #${sIdx + 1}`;
                synthesizedNodes.push({
                  id: stepId,
                  kind: 'ExerciseStep',
                  path: `entities/${eIdx}/exercises/${exIdx}/steps/${sIdx}`,
                  label: actionText,
                });
                synthesizedEdges.push({
                  source: exId,
                  target: stepId,
                  kind: 'STEP',
                });
              });
            }
          });
        }

        // Examples
        if (Array.isArray(ent.examples)) {
          ent.examples.forEach((item, xIdx) => {
            const xId = `exm-${eIdx}-${xIdx}`;
            synthesizedNodes.push({
              id: xId,
              kind: 'Example',
              path: `entities/${eIdx}/examples/${xIdx}`,
              label: item.title,
            });
            synthesizedEdges.push({
              source: entId,
              target: xId,
              kind: 'HAS_EXAMPLE',
            });
          });
        }

        // Arguments
        if (Array.isArray(ent.arguments)) {
          ent.arguments.forEach((item, aIdx) => {
            const aId = `arg-${eIdx}-${aIdx}`;
            synthesizedNodes.push({
              id: aId,
              kind: 'Argument',
              path: `entities/${eIdx}/arguments/${aIdx}`,
              label: item.hypothesis || `Argument #${aIdx + 1}`,
            });
            synthesizedEdges.push({
              source: entId,
              target: aId,
              kind: 'HAS_ARGUMENT',
            });
          });
        }
      });
    }

    // 3. Knowledge Relations between entities
    if (Array.isArray(data.knowledge_relations) && Array.isArray(data.entities)) {
      data.knowledge_relations.forEach((rel) => {
        const srcIdx = data.entities!.findIndex(
          (e) => e.name.trim().toLowerCase() === rel.source.trim().toLowerCase()
        );
        const tgtIdx = data.entities!.findIndex(
          (e) => e.name.trim().toLowerCase() === rel.target.trim().toLowerCase()
        );
        if (srcIdx !== -1 && tgtIdx !== -1) {
          synthesizedEdges.push({
            source: `entity-${srcIdx}`,
            target: `entity-${tgtIdx}`,
            kind: rel.relation_type || 'REQUIRES',
          });
        }
      });
    }

    const activeRawNodes = synthesizedNodes.length > 0 ? synthesizedNodes : snapshotNodes;
    const activeRawEdges = synthesizedEdges.length > 0 ? synthesizedEdges : snapshotEdges;

    // 4. Calculate Hierarchical Sub-tree Cluster Layout with generous spacing
    const initialPositions = new Map<string, { x: number; y: number }>();

    // Column 0: Topics (x: 40)
    let topicY = 40;
    if (Array.isArray(data.topics)) {
      data.topics.forEach((_, tIdx) => {
        initialPositions.set(`topic-${tIdx}`, { x: 40, y: topicY });
        topicY += 160;
      });
    }

    // Column coordinates for clustered trees
    const COL_X = {
      Topic: 40,
      KnowledgeEntity: 440,
      Child: 880,
      Step: 1320,
    };

    let clusterStartY = 40;

    if (Array.isArray(data.entities)) {
      data.entities.forEach((ent, eIdx) => {
        const entId = `entity-${eIdx}`;
        const currentEntityY = clusterStartY;
        initialPositions.set(entId, { x: COL_X.KnowledgeEntity, y: currentEntityY });

        let childY = currentEntityY;

        // Definition
        const defText =
          typeof ent.definition === 'string'
            ? ent.definition
            : typeof ent.definition === 'object' && ent.definition !== null
              ? (ent.definition as { content?: string }).content
              : '';
        if (defText) {
          initialPositions.set(`def-${eIdx}`, { x: COL_X.Child, y: childY });
          childY += 140;
        }

        // Examples
        if (Array.isArray(ent.examples)) {
          ent.examples.forEach((_, xIdx) => {
            initialPositions.set(`exm-${eIdx}-${xIdx}`, { x: COL_X.Child, y: childY });
            childY += 140;
          });
        }

        // Processes & ProcessSteps
        if (Array.isArray(ent.processes)) {
          ent.processes.forEach((proc, pIdx) => {
            const procId = `proc-${eIdx}-${pIdx}`;
            const procStartY = childY;
            initialPositions.set(procId, { x: COL_X.Child, y: procStartY });

            let stepY = procStartY;
            if (Array.isArray(proc.steps)) {
              proc.steps.forEach((_, sIdx) => {
                initialPositions.set(`step-p-${eIdx}-${pIdx}-${sIdx}`, {
                  x: COL_X.Step,
                  y: stepY,
                });
                stepY += 135;
              });
            }

            childY = Math.max(childY + 140, stepY);
          });
        }

        // Exercises & ExerciseSteps
        if (Array.isArray(ent.exercises)) {
          ent.exercises.forEach((ex, exIdx) => {
            const exId = `ex-${eIdx}-${exIdx}`;
            const exStartY = childY;
            initialPositions.set(exId, { x: COL_X.Child, y: exStartY });

            let stepY = exStartY;
            if (Array.isArray(ex.steps)) {
              ex.steps.forEach((_, sIdx) => {
                initialPositions.set(`step-e-${eIdx}-${exIdx}-${sIdx}`, {
                  x: COL_X.Step,
                  y: stepY,
                });
                stepY += 135;
              });
            }

            childY = Math.max(childY + 140, stepY);
          });
        }

        // Arguments
        if (Array.isArray(ent.arguments)) {
          ent.arguments.forEach((_, aIdx) => {
            initialPositions.set(`arg-${eIdx}-${aIdx}`, { x: COL_X.Child, y: childY });
            childY += 140;
          });
        }

        // Cluster gap: Next Entity starts well below this whole cluster
        clusterStartY = Math.max(childY, currentEntityY + 160) + 100;
      });
    }

    let fallbackY = 40;
    const nodes: Node[] = activeRawNodes.map((item) => {
      let pos = initialPositions.get(item.id);
      if (!pos) {
        const col = COLUMNS[item.kind] ?? 4;
        fallbackY += 140;
        pos = { x: col * 420 + 40, y: fallbackY };
      }

      const nodeFields = getNodeFields(data, item.path, item.kind);
      const displayTitle = nodeFields.label || item.label || item.kind;

      const palette = NODE_KIND_PALETTES[item.kind] ?? {
        light: { border: '#94a3b8', bg: '#ffffff', tag: '#475569', text: '#0f172a' },
        dark: { border: '#cbd5e1', bg: '#1e293b', tag: '#94a3b8', text: '#f8fafc' },
      };

      const activeColor = isDark ? palette.dark : palette.light;
      const isSelected = item.path === selectedPath;

      return {
        id: item.id,
        position: pos,
        selected: isSelected,
        data: {
          path: item.path,
          label: (
            <div className="text-left px-0.5 select-none">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
                  style={{
                    color: activeColor.tag,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  }}
                >
                  {item.kind}
                </span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px] text-blue-400">
                    check_circle
                  </span>
                )}
              </div>
              <div
                className="text-xs font-bold line-clamp-2 leading-snug"
                style={{ color: activeColor.text }}
              >
                {displayTitle}
              </div>
            </div>
          ),
        },
        style: {
          background: activeColor.bg,
          border: `${isSelected ? 2.5 : 1.5}px solid ${isSelected ? '#38bdf8' : activeColor.border}`,
          borderRadius: '14px',
          padding: '8px 11px',
          width: 250,
          boxShadow: isSelected
            ? '0 0 0 3px rgba(56, 189, 248, 0.3), 0 8px 24px rgba(0,0,0,0.3)'
            : isDark
              ? '0 4px 12px rgba(0,0,0,0.4)'
              : '0 2px 6px rgba(0,0,0,0.06)',
          cursor: 'grab',
        },
      };
    });

    const edges: Edge[] = activeRawEdges.map((edge) => ({
      id: `${edge.source}:${edge.kind}:${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.kind,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#94a3b8' : '#64748b' },
      style: { stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 1.8 },
      labelStyle: {
        fontSize: 10,
        fontWeight: 800,
        fill: isDark ? '#f8fafc' : '#1e293b',
      },
      labelBgStyle: {
        fill: isDark ? '#1e293b' : '#ffffff',
        fillOpacity: 0.9,
      },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    }));

    return { nodes, edges, rawNodes: activeRawNodes };
  }, [data, isDark, selectedPath, snapshot]);

  const selectedNodeMeta = diagram.rawNodes.find((n) => n.path === selectedPath);
  const selectedNodeInfo = selectedNodeMeta
    ? getNodeFields(data, selectedNodeMeta.path, selectedNodeMeta.kind)
    : null;

  // Single field edit from inspector
  function handleEditField(field: string, value: string) {
    if (!selectedNodeMeta || !editable) return;
    const next = updateNodeFieldByPath(
      data,
      selectedNodeMeta.path,
      selectedNodeMeta.kind,
      field,
      value
    );
    onChange(stringifyDraftGraph(next));
  }

  // Delete current selected node
  function handleDeleteSelectedNode() {
    if (!selectedNodeMeta || !editable) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa [${selectedNodeMeta.kind}] "${selectedNodeInfo?.label || selectedNodeMeta.label}"?`
      )
    ) {
      return;
    }
    const next = deleteNodeByPath(data, selectedNodeMeta.path);
    setSelectedPath('');
    onChange(stringifyDraftGraph(next));
  }

  // Move exercise between entities
  function moveExercise(destination: number) {
    if (!selectedNodeMeta || !editable) return;
    const parts = selectedNodeMeta.path.split('/');
    const owner = parts[1];
    const index = parts[3];

    const next = structuredClone(data);
    const from = next.entities?.[Number(owner)];
    const to = next.entities?.[destination];
    if (
      !from ||
      !to ||
      !Array.isArray(from.exercises) ||
      Number(owner) === destination
    ) {
      return;
    }
    const moved = from.exercises.splice(Number(index), 1)[0];
    if (!moved) return;
    if (!Array.isArray(to.exercises)) to.exercises = [];
    to.exercises.push(moved);
    setSelectedPath('');
    onChange(stringifyDraftGraph(next));
  }

  // Extract selected entity index if selecting an entity or its sub-items
  const selectedEntityIndex = useMemo(() => {
    if (!selectedPath.startsWith('entities/')) return null;
    const parts = selectedPath.split('/');
    const idx = Number(parts[1]);
    return Number.isNaN(idx) ? null : idx;
  }, [selectedPath]);

  // Keep track of user-dragged node coordinates to persist layout customizations
  const userPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  // Synchronize ReactFlow nodes state with diagram nodes while preserving manual drag coordinates
  useEffect(() => {
    setNodes(
      diagram.nodes.map((n) => {
        const customPos = userPositions.current.get(n.id);
        return customPos ? { ...n, position: customPos } : n;
      })
    );
  }, [diagram.nodes, setNodes]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((c) => {
        if (c.type === 'position' && c.position && c.id) {
          userPositions.current.set(c.id, c.position);
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleAutoSpread = useCallback(() => {
    userPositions.current.clear();
    setNodes(diagram.nodes);
  }, [diagram.nodes, setNodes]);

  return (
    <section className="space-y-3 text-left">
      {/* Top Toolbar with High-contrast Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            {t('heading')}
          </h3>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {diagram.nodes.length} {t('nodesUnit')} · {diagram.edges.length} {t('edgesUnit')}
          </span>
        </div>

        {/* Action Toolbar for Knowledge Graph CRUD */}
        {editable && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsAddEntityOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Thêm thực thể</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddRelationOpen(true)}
              disabled={!data.entities || data.entities.length < 2}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-40"
              title={
                !data.entities || data.entities.length < 2
                  ? 'Cần ít nhất 2 thực thể để nối quan hệ'
                  : 'Nối quan hệ giữa 2 thực thể'
              }
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>+ Nối quan hệ</span>
            </button>

            <button
              type="button"
              onClick={setIsAddTopicOpen.bind(null, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-bold cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">folder_special</span>
              <span>+ Thêm chủ đề</span>
            </button>

            <button
              type="button"
              onClick={handleAutoSpread}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold cursor-pointer transition-colors shadow-xs"
              title="Tự động giãn cách và tách rời các cụm thực thể cho thoáng đãng, dễ nhìn"
            >
              <span className="material-symbols-outlined text-[16px]">unfold_more</span>
              <span>Tách &amp; Giãn cách</span>
            </button>

            <button
              type="button"
              onClick={() => void refetch()}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              title={t('reload')}
            >
              <span className={`material-symbols-outlined text-[18px] ${isFetching ? 'animate-spin' : ''}`}>
                sync
              </span>
            </button>
          </div>
        )}
      </div>

      {isLoading && diagram.nodes.length === 0 && (
        <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900 p-6 flex flex-col items-center justify-center gap-2 text-center min-h-[260px]">
          <span className="material-symbols-outlined text-[24px] text-blue-600 dark:text-blue-400 animate-spin">
            sync
          </span>
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
            {t('syncing')}
          </p>
        </div>
      )}

      {isError && diagram.nodes.length === 0 && (
        <div
          role="alert"
          className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-5 text-center space-y-2.5"
        >
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
            {error instanceof Error ? error.message : 'Không thể tải đồ thị bản nháp.'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
          >
            {t('reload')}
          </button>
        </div>
      )}

      {/* Interactive Visual Canvas */}
      <div className="h-[32rem] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-[#121417] overflow-hidden relative shadow-inner">
        <ReactFlow
          key={`${revisionId}-${isDark ? 'dark' : 'light'}`}
          nodes={nodes}
          edges={diagram.edges}
          onNodesChange={handleNodesChange}
          fitView
          minZoom={0.05}
          nodesDraggable={true}
          nodesConnectable={false}
          onNodeClick={(_, node) => {
            const found = diagram.rawNodes.find((item) => item.id === node.id);
            setSelectedPath(found?.path ?? '');
          }}
          onNodeDoubleClick={(_, node) => {
            const found = diagram.rawNodes.find((item) => item.id === node.id);
            if (found) {
              setSelectedPath(found.path);
              setIsNodeEditModalOpen(true);
            }
          }}
        >
          <Background
            color={isDark ? '#334155' : '#cbd5e1'}
            gap={18}
            size={1.2}
          />
          <Controls />
        </ReactFlow>

        {/* Floating Quick Action Bar when Node Selected */}
        {selectedNodeMeta && (
          <div className="absolute bottom-3 left-14 z-10 flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-xs">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 px-1 truncate max-w-[180px]">
              {selectedNodeInfo?.label || selectedNodeMeta.label}
            </span>

            {editable && (
              <>
                <button
                  type="button"
                  onClick={() => setIsNodeEditModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Sửa nội dung node</span>
                </button>

                {selectedNodeMeta.kind === 'KnowledgeEntity' && (
                  <button
                    type="button"
                    onClick={() => setIsEntityFullEditorOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">hub</span>
                    <span>Biên tập 5 tab</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeleteSelectedNode}
                  className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500 cursor-pointer"
                  title="Xóa node này"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Node Inline Inspector */}
      {!selectedNodeMeta ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          💡 <strong>Mẹo:</strong> Nhấp vào một node trên đồ thị để kiểm tra, hoặc <strong>nhấp đúp (Double Click)</strong> để mở cửa sổ chỉnh sửa nhanh. Bạn có thể kéo thả để sắp xếp các node tùy ý.
        </p>
      ) : (
        <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {selectedNodeMeta.kind}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedNodeInfo?.label || selectedNodeMeta.label}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">{selectedNodeMeta.path}</span>
              </div>
            </div>

            {editable && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNodeEditModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Mở cửa sổ sửa nhanh</span>
                </button>

                {selectedNodeMeta.kind === 'KnowledgeEntity' && (
                  <button
                    type="button"
                    onClick={() => setIsEntityFullEditorOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">hub</span>
                    <span>Biên tập 5 tab toàn diện</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeleteSelectedNode}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                  title="Xóa node này khỏi bản nháp"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  <span>Xóa node</span>
                </button>
              </div>
            )}
          </div>

          {/* Editable Property Fields with Full Support for String and Object nodes */}
          <div className="space-y-3">
            {selectedNodeInfo?.fields.map((field) => (
              <label
                key={field.key}
                className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span>{field.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">[{field.key}]</span>
                </div>
                <textarea
                  className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/30"
                  rows={field.rows || 2}
                  value={field.value}
                  readOnly={!editable}
                  onChange={(event) => handleEditField(field.key, event.target.value)}
                />
              </label>
            ))}
          </div>

          {/* Special Exercise Move Control */}
          {selectedNodeMeta.kind === 'Exercise' &&
            editable &&
            Array.isArray(data.entities) && (
              <div className="grid gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{t('moveExercise')}</span>
                <CustomSelect<number>
                  variant="pill"
                  value={Number(selectedNodeMeta.path.split('/')[1])}
                  onChange={(val) => moveExercise(val)}
                  options={data.entities.map((entity, index) => ({
                    value: index,
                    label: entity.name || String(index + 1),
                  }))}
                />
              </div>
            )}
        </div>
      )}

      {/* CRUD Modals */}
      <DraftCreateEntityModal
        isOpen={isAddEntityOpen}
        topics={data.topics}
        onClose={() => setIsAddEntityOpen(false)}
        onSubmit={(payload) => {
          const next = addEntityToDraft(data, payload);
          onChange(stringifyDraftGraph(next));
        }}
      />

      <DraftCreateRelationModal
        isOpen={isAddRelationOpen}
        entities={data.entities}
        onClose={() => setIsAddRelationOpen(false)}
        onSubmit={(payload) => {
          const next = addRelationToDraft(data, payload);
          onChange(stringifyDraftGraph(next));
        }}
      />

      <DraftCreateTopicModal
        isOpen={isAddTopicOpen}
        entities={data.entities}
        onClose={() => setIsAddTopicOpen(false)}
        onSubmit={(payload) => {
          const next = addTopicToDraft(data, payload);
          onChange(stringifyDraftGraph(next));
        }}
      />

      {/* Direct Node Edit Modal on Double Click or Click Sửa */}
      {selectedNodeMeta && selectedNodeInfo && (
        <DraftNodeEditModal
          isOpen={isNodeEditModalOpen}
          kind={selectedNodeMeta.kind}
          label={selectedNodeInfo.label}
          path={selectedNodeMeta.path}
          fields={selectedNodeInfo.fields}
          onClose={() => setIsNodeEditModalOpen(false)}
          onSaveField={handleEditField}
          onDelete={handleDeleteSelectedNode}
          onOpenFullEntityEditor={
            selectedNodeMeta.kind === 'KnowledgeEntity'
              ? () => setIsEntityFullEditorOpen(true)
              : undefined
          }
        />
      )}

      {/* Full 5-Tab Entity Editor Modal */}
      {selectedEntityIndex !== null && data.entities?.[selectedEntityIndex] && (
        <DraftEntityEditorModal
          isOpen={isEntityFullEditorOpen}
          entity={data.entities[selectedEntityIndex]}
          entityIndex={selectedEntityIndex}
          onClose={() => setIsEntityFullEditorOpen(false)}
          onSave={(updated) => {
            const next = structuredClone(data);
            if (Array.isArray(next.entities) && next.entities[selectedEntityIndex]) {
              next.entities[selectedEntityIndex] = updated;
              onChange(stringifyDraftGraph(next));
            }
          }}
          onDelete={() => handleDeleteSelectedNode()}
        />
      )}
    </section>
  );
}
