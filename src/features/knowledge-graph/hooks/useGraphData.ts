'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type {
  KnowledgeNodeData,
  KnowledgeEdgeData,
  KnowledgeCategory,
  EditTool,
  LayoutMode,
  KnowledgeGraphStats,
} from '../types';
import {
  getKnowledgeStats,
  cleanDocTitle,
  deriveTopicDisplayName,
  getPedagogicalDefinition,
  isUuidOrCode,
} from '../services/knowledge-graph.service';
import {
  usePublishedKnowledgeGraphs,
  usePublishedMaterialGraph,
  useCourseKnowledgeGraphQuery,
  usePublishedConceptDetail,
} from './useKnowledgeGraphQueries';

export interface UseGraphDataOptions {
  initialCourseId?: string | null;
  initialMaterialId?: string | null;
  initialConceptCode?: string | null;
}

export function useGraphData(options?: UseGraphDataOptions) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    options?.initialCourseId ?? null
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    options?.initialMaterialId ?? null
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    options?.initialConceptCode ?? null
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<KnowledgeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [depth, setDepth] = useState<number>(2);
  const [isSmartDimActive, setIsSmartDimActive] = useState<boolean>(true);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<EditTool>('select');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');
  const [showAuxiliaryNodes, setShowAuxiliaryNodes] = useState<boolean>(false);

  // Local optimistic overlay when teacher is experimenting in Studio
  const [localNodeOverrides, setLocalNodeOverrides] = useState<KnowledgeNodeData[] | null>(null);
  const [localEdgeOverrides, setLocalEdgeOverrides] = useState<KnowledgeEdgeData[] | null>(null);

  const publishedQuery = usePublishedKnowledgeGraphs({
    courseId: selectedCourseId ?? undefined,
    limit: 30,
  });

  const publishedGraphs = useMemo(
    () => publishedQuery.data?.items ?? [],
    [publishedQuery.data?.items]
  );

  // Auto-select first published material when neither courseId nor materialId is chosen
  const effectiveMaterialId = useMemo(() => {
    if (selectedMaterialId) return selectedMaterialId;
    if (!selectedCourseId && publishedGraphs.length > 0) {
      return publishedGraphs[0].materialId;
    }
    return null;
  }, [publishedGraphs, selectedCourseId, selectedMaterialId]);

  const selectedMaterial = useMemo(
    () => publishedGraphs.find((g) => g.materialId === effectiveMaterialId) ?? null,
    [publishedGraphs, effectiveMaterialId]
  );

  const materialGraphQuery = usePublishedMaterialGraph(effectiveMaterialId, {
    depth,
    limit: 200,
    enabled: Boolean(effectiveMaterialId),
  });

  const courseGraphQuery = useCourseKnowledgeGraphQuery(
    selectedCourseId,
    Boolean(selectedCourseId) && !selectedMaterialId
  );

  const activeGraphQuery = effectiveMaterialId ? materialGraphQuery : courseGraphQuery;

  // Reset local overrides when switching graph scope
  useEffect(() => {
    setLocalNodeOverrides(null);
    setLocalEdgeOverrides(null);
  }, [selectedCourseId, effectiveMaterialId]);

  const rawBaseNodes = useMemo<KnowledgeNodeData[]>(() => {
    if (localNodeOverrides) return localNodeOverrides;
    const base = activeGraphQuery.data?.nodes ?? [];
    if (base.length === 0) return base;

    const contextTitle =
      selectedMaterial?.title ||
      base.find((n) => n.materialTitle)?.materialTitle ||
      base.find((n) => n.isCenterpiece)?.label ||
      '';
    const cleanedMatTitle = cleanDocTitle(contextTitle);

    return base.map((node) => {
      const isCore =
        !node.isAuxiliary &&
        (node.isCenterpiece ||
          (node.kind && node.kind.toUpperCase().includes('KNOWLEDGE')) ||
          (node.kind && node.kind.toUpperCase() === 'CONCEPT') ||
          (node.kind && node.kind.toUpperCase() !== 'TOPIC'));

      if (isCore) {
        const finalLabel =
          cleanedMatTitle && (node.label === 'Khái niệm tri thức' || node.label.startsWith('Thực thể #'))
            ? cleanedMatTitle
            : node.label;
        const fallbackDef = getPedagogicalDefinition(finalLabel, contextTitle);
        const resolvedDef = node.definitionText || node.description || fallbackDef;
        return {
          ...node,
          label: finalLabel,
          materialTitle: node.materialTitle || selectedMaterial?.title || contextTitle,
          definitionText: resolvedDef,
          description: node.description || resolvedDef,
        };
      }

      if (
        (node.kind && node.kind.toUpperCase() === 'TOPIC') ||
        node.label.startsWith('Chủ đề #') ||
        node.label === 'Chủ đề' ||
        isUuidOrCode(node.label)
      ) {
        return {
          ...node,
          label: deriveTopicDisplayName(
            node.topic && !node.topic.startsWith('Chủ đề #') ? node.topic : null,
            cleanedMatTitle,
            contextTitle,
            1
          ),
        };
      }
      return node;
    });
  }, [activeGraphQuery.data?.nodes, localNodeOverrides, selectedMaterial]);

  const nodesData = rawBaseNodes;

  const edgesData = useMemo<KnowledgeEdgeData[]>(() => {
    if (localEdgeOverrides) return localEdgeOverrides;
    return activeGraphQuery.data?.edges ?? [];
  }, [activeGraphQuery.data?.edges, localEdgeOverrides]);

  const auxiliaryCount = useMemo(
    () => nodesData.filter((n) => n.isAuxiliary).length,
    [nodesData]
  );

  const displayNodesData = useMemo(() => {
    if (showAuxiliaryNodes) return nodesData;
    const filtered = nodesData.filter((n) => !n.isAuxiliary);
    return filtered.length > 0 ? filtered : nodesData;
  }, [nodesData, showAuxiliaryNodes]);

  const displayEdgesData = useMemo(() => {
    if (showAuxiliaryNodes) return edgesData;
    const filtered = edgesData.filter((e) => !e.isAuxiliary);
    return filtered.length > 0 ? filtered : edgesData;
  }, [edgesData, showAuxiliaryNodes]);

  // Keep selectedNodeId synced to a valid node in the current graph
  useEffect(() => {
    if (displayNodesData.length === 0) {
      setSelectedNodeId(null);
      return;
    }
    if (selectedNodeId && displayNodesData.some((n) => n.id === selectedNodeId || n.canonicalCode === selectedNodeId)) {
      return;
    }
    const centerpiece = displayNodesData.find((n) => n.isCenterpiece) ?? displayNodesData[0];
    setSelectedNodeId(centerpiece?.id ?? null);
  }, [displayNodesData, selectedNodeId]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return (
      nodesData.find(
        (n) => n.id === selectedNodeId || n.canonicalCode === selectedNodeId
      ) ?? null
    );
  }, [nodesData, selectedNodeId]);

  const conceptDetailQuery = usePublishedConceptDetail(
    selectedNode?.canonicalCode ?? selectedNode?.id ?? null,
    Boolean(selectedNode)
  );

  const rawNodes: Node<KnowledgeNodeData>[] = useMemo(() => {
    const count = displayNodesData.length;
    if (count === 0) return [];

    return displayNodesData.map((data, index) => {
      let defaultX = 500;
      let defaultY = 320;

      if (count === 1) {
        defaultX = 500;
        defaultY = 320;
      } else if (count === 2) {
        defaultX = index === 0 ? 360 : 640;
        defaultY = 320;
      } else if (count === 3) {
        const positions = [
          { x: 500, y: 220 },
          { x: 360, y: 400 },
          { x: 640, y: 400 },
        ];
        defaultX = positions[index].x;
        defaultY = positions[index].y;
      } else {
        const angle = (index / count) * 2 * Math.PI;
        const radius = data.isCenterpiece ? 0 : 240 + (index % 3) * 70;
        defaultX = 500 + radius * Math.cos(angle);
        defaultY = 320 + radius * Math.sin(angle);
      }

      return {
        id: data.id,
        type: 'knowledgeNode',
        position: { x: defaultX, y: defaultY },
        data,
      };
    });
  }, [displayNodesData]);

  const rawEdges: Edge[] = useMemo(() => {
    return displayEdgesData.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.animated,
      type: 'default',
      style: {
        strokeWidth: 2.2,
        strokeDasharray: e.dashed ? '4,4' : undefined,
      },
    }));
  }, [displayEdgesData]);

  const stats: KnowledgeGraphStats = useMemo(() => {
    return getKnowledgeStats(displayNodesData, displayEdgesData);
  }, [displayNodesData, displayEdgesData]);

  const addNode = useCallback(
    (newNodeData: KnowledgeNodeData) => {
      setLocalNodeOverrides((prev) => [...(prev ?? nodesData), newNodeData]);
      setSelectedNodeId(newNodeData.id);
    },
    [nodesData]
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<KnowledgeNodeData>) => {
      setLocalNodeOverrides((prev) =>
        (prev ?? nodesData).map((n) => (n.id === id ? { ...n, ...updates } : n))
      );
    },
    [nodesData]
  );

  const deleteNode = useCallback(
    (id: string) => {
      setLocalNodeOverrides((prev) => (prev ?? nodesData).filter((n) => n.id !== id));
      setLocalEdgeOverrides((prev) =>
        (prev ?? edgesData).filter((e) => e.source !== id && e.target !== id)
      );
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
    },
    [edgesData, nodesData, selectedNodeId]
  );

  const addEdge = useCallback(
    (source: string, target: string, rawRelation?: string, label?: string) => {
      const newEdgeId = `e-${source}-${target}-${Date.now()}`;
      const rel = (rawRelation || 'PREREQUISITE').toUpperCase();
      const isPrereq = rel === 'PREREQUISITE' || rel === 'REQUIRES';
      setLocalEdgeOverrides((prev) => [
        ...(prev ?? edgesData),
        {
          id: newEdgeId,
          source,
          target,
          label: label || (isPrereq ? 'Tiên quyết' : 'Liên kết'),
          rawRelation: rel,
          relationshipType: isPrereq ? 'requires' : 'extends',
          weight: 1.0,
        },
      ]);
    },
    [edgesData]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setLocalEdgeOverrides((prev) => (prev ?? edgesData).filter((e) => e.id !== edgeId));
    },
    [edgesData]
  );

  const resetDraftChanges = useCallback(() => {
    setLocalNodeOverrides(null);
    setLocalEdgeOverrides(null);
  }, []);

  const hasUnsavedChanges = Boolean(localNodeOverrides !== null || localEdgeOverrides !== null);
  const unsavedCount =
    (localNodeOverrides ? Math.abs(localNodeOverrides.length - nodesData.length) + 1 : 0) +
    (localEdgeOverrides ? Math.abs(localEdgeOverrides.length - edgesData.length) + 1 : 0);

  const isLoading =
    publishedQuery.isLoading || (Boolean(effectiveMaterialId || selectedCourseId) && activeGraphQuery.isLoading);
  const isFetching = publishedQuery.isFetching || activeGraphQuery.isFetching;
  const isError = publishedQuery.isError || activeGraphQuery.isError;

  const refetch = useCallback(() => {
    void publishedQuery.refetch();
    if (effectiveMaterialId) {
      void materialGraphQuery.refetch();
    } else if (selectedCourseId) {
      void courseGraphQuery.refetch();
    }
  }, [courseGraphQuery, effectiveMaterialId, materialGraphQuery, publishedQuery, selectedCourseId]);

  return {
    // Scope & Real API state
    graphTitle: activeGraphQuery.data?.title,
    publishedGraphs,
    selectedCourseId,
    setSelectedCourseId,
    selectedMaterialId: effectiveMaterialId,
    setSelectedMaterialId,
    conceptDetail: conceptDetailQuery.data ?? null,
    isConceptDetailLoading: conceptDetailQuery.isLoading,
    isLoading,
    isFetching,
    isError,
    refetch,
    // Canvas state
    nodesData: displayNodesData,
    allNodesData: nodesData,
    edgesData: displayEdgesData,
    allEdgesData: edgesData,
    showAuxiliaryNodes,
    setShowAuxiliaryNodes,
    onToggleAuxiliaryNodes: () => setShowAuxiliaryNodes((prev) => !prev),
    auxiliaryCount,
    rawNodes,
    rawEdges,
    selectedNodeId,
    selectedNode,
    setSelectedNodeId,
    hoveredNodeId,
    setHoveredNodeId,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    depth,
    setDepth,
    isSmartDimActive,
    setIsSmartDimActive,
    isEditMode,
    setIsEditMode,
    activeTool,
    setActiveTool,
    layoutMode,
    setLayoutMode,
    stats,
    hasUnsavedChanges,
    unsavedCount,
    resetDraftChanges,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
  };
}
