'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import {
  KnowledgeNodeData,
  KnowledgeCategory,
  EditTool,
  LayoutMode,
  KnowledgeGraphStats,
} from '../types';
import {
  mockKnowledgeNodes,
  mockKnowledgeEdges,
  getKnowledgeStats,
} from '../services/knowledge-graph.service';

export function useGraphData() {
  const [nodesData, setNodesData] = useState<KnowledgeNodeData[]>(mockKnowledgeNodes);
  const [edgesData, setEdgesData] = useState(mockKnowledgeEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('seg-tree');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<KnowledgeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [depth, setDepth] = useState<number>(2);
  const [isSmartDimActive, setIsSmartDimActive] = useState<boolean>(true);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<EditTool>('select');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force');

  // Convert to React Flow nodes with initial positions
  const rawNodes: Node<KnowledgeNodeData>[] = useMemo(() => {
    return nodesData.map((data, index) => {
      // Giá trị tọa độ cơ bản phân tán
      const angle = (index / nodesData.length) * 2 * Math.PI;
      const radius = data.isCenterpiece ? 0 : 250 + (index % 3) * 80;
      const defaultX = 500 + radius * Math.cos(angle);
      const defaultY = 320 + radius * Math.sin(angle);

      return {
        id: data.id,
        type: 'knowledgeNode',
        position: { x: defaultX, y: defaultY },
        data,
      };
    });
  }, [nodesData]);

  // Convert to React Flow edges
  const rawEdges: Edge[] = useMemo(() => {
    return edgesData.map((e) => ({
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
  }, [edgesData]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodesData.find((n) => n.id === selectedNodeId) || null;
  }, [nodesData, selectedNodeId]);

  const stats: KnowledgeGraphStats = useMemo(() => {
    return getKnowledgeStats(nodesData);
  }, [nodesData]);

  const addNode = useCallback(
    (newNodeData: KnowledgeNodeData, position?: { x: number; y: number }) => {
      setNodesData((prev) => [...prev, newNodeData]);
      setSelectedNodeId(newNodeData.id);
    },
    []
  );

  const updateNode = useCallback((id: string, updates: Partial<KnowledgeNodeData>) => {
    setNodesData((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
      setNodesData((prev) => prev.filter((n) => n.id !== id));
      setEdgesData((prev) => prev.filter((e) => e.source !== id && e.target !== id));
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId]
  );

  const addEdge = useCallback((source: string, target: string, label?: string) => {
    const newEdgeId = `e-${source}-${target}-${Date.now()}`;
    setEdgesData((prev) => [
      ...prev,
      {
        id: newEdgeId,
        source,
        target,
        label: label || 'liên kết',
        relationshipType: 'extends',
        weight: 1.0,
      },
    ]);
  }, []);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdgesData((prev) => prev.filter((e) => e.id !== edgeId));
  }, []);

  return {
    nodesData,
    edgesData,
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
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
  };
}
