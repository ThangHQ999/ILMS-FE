'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { KnowledgeNode } from '../nodes/KnowledgeNode';
import { KnowledgeNodeData, KnowledgeCategory, EditTool, LayoutMode } from '../../types';
import { useForceLayout } from '../../hooks/useForceLayout';

const nodeTypes = {
  knowledgeNode: KnowledgeNode,
};

export interface GraphCanvasProps {
  nodes: Node<KnowledgeNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  hoveredNodeId: string | null;
  onHoverNode: (id: string | null) => void;
  filterCategory: KnowledgeCategory;
  searchQuery: string;
  depth: number;
  isSmartDimActive: boolean;
  isEditMode: boolean;
  activeTool: EditTool;
  layoutMode: LayoutMode;
  onAddNodeAtPosition?: (position: { x: number; y: number }) => void;
  onDeleteNode?: (id: string) => void;
  onConnectNodes?: (source: string, target: string) => void;
  highlightPathIds?: string[] | null;
  isFocusMode?: boolean;
}

function GraphCanvasContent({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
  filterCategory,
  searchQuery,
  depth,
  isSmartDimActive,
  isEditMode,
  activeTool,
  layoutMode,
  onAddNodeAtPosition,
  onDeleteNode,
  onConnectNodes,
  highlightPathIds,
  isFocusMode = false,
}: GraphCanvasProps) {
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow();
  const { applyLayout } = useForceLayout();

  const [connectStartNodeId, setConnectStartNodeId] = useState<string | null>(null);

  // Apply layout whenever layoutMode changes or initial nodes load
  const positionedNodes = useMemo(() => {
    return applyLayout(initialNodes, initialEdges, layoutMode, 1000, 650);
  }, [initialNodes, initialEdges, layoutMode, applyLayout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(positionedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep state synced with props changes
  useEffect(() => {
    setNodes(positionedNodes);
  }, [positionedNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Compute 1st-degree neighbors for Smart Dimming
  const activeHoverTarget = hoveredNodeId;

  const neighborNodeIds = useMemo(() => {
    if (!activeHoverTarget) return null;
    const set = new Set<string>([activeHoverTarget]);
    edges.forEach((e) => {
      if (e.source === activeHoverTarget) set.add(e.target);
      if (e.target === activeHoverTarget) set.add(e.source);
    });
    return set;
  }, [activeHoverTarget, edges]);

  // Calculate styled nodes with Category Filter + Smart Dimming + Search
  const displayNodes = useMemo(() => {
    return nodes.map((n) => {
      const isSelected = n.id === selectedNodeId;
      const isHighlightedPath = highlightPathIds?.includes(n.id);

      // Check category filter
      const matchesCategory =
        filterCategory === 'all' || n.data.category === filterCategory;

      // Check search match
      const matchesSearch =
        !searchQuery.trim() ||
        n.data.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.sublabel?.toLowerCase().includes(searchQuery.toLowerCase());

      let opacity = 1;
      let filter = 'none';

      if (!matchesCategory || !matchesSearch) {
        opacity = 0.15;
        filter = 'grayscale(90%)';
      } else if (isSmartDimActive && neighborNodeIds) {
        if (neighborNodeIds.has(n.id)) {
          opacity = 1;
        } else {
          opacity = 0.2;
          filter = 'grayscale(70%)';
        }
      }

      if (isHighlightedPath) {
        opacity = 1;
      }

      return {
        ...n,
        selected: isSelected,
        style: {
          ...n.style,
          opacity,
          filter,
          transition: 'all 300ms ease-in-out',
        },
      };
    });
  }, [
    nodes,
    selectedNodeId,
    highlightPathIds,
    filterCategory,
    searchQuery,
    isSmartDimActive,
    neighborNodeIds,
  ]);

  // Calculate styled edges with Smart Dimming & Path Highlight
  const displayEdges = useMemo(() => {
    return edges.map((e) => {
      let strokeOpacity = 0.65;
      let strokeColor = '#0059bb';
      let strokeWidth = 2;
      let isAnimated = Boolean(e.animated);

      // Check if this edge is in the highlighted path
      let isInPath = false;
      if (highlightPathIds && highlightPathIds.length > 1) {
        for (let i = 0; i < highlightPathIds.length - 1; i++) {
          if (
            (e.source === highlightPathIds[i] && e.target === highlightPathIds[i + 1]) ||
            (e.target === highlightPathIds[i] && e.source === highlightPathIds[i + 1])
          ) {
            isInPath = true;
            break;
          }
        }
      }

      if (isInPath) {
        strokeOpacity = 1;
        strokeColor = '#0070ea';
        strokeWidth = 3.5;
        isAnimated = true;
      } else if (isSmartDimActive && neighborNodeIds) {
        const isConnectedToTarget =
          (e.source === activeHoverTarget && neighborNodeIds.has(e.target)) ||
          (e.target === activeHoverTarget && neighborNodeIds.has(e.source));

        if (isConnectedToTarget) {
          strokeOpacity = 1;
          strokeWidth = 2.8;
        } else {
          strokeOpacity = 0.15;
          strokeWidth = 1.2;
        }
      }

      return {
        ...e,
        animated: isAnimated,
        style: {
          ...e.style,
          stroke: strokeColor,
          strokeWidth,
          opacity: strokeOpacity,
          transition: 'all 300ms ease-in-out',
        },
      };
    });
  }, [edges, highlightPathIds, isSmartDimActive, neighborNodeIds, activeHoverTarget]);

  // Node Click handler according to active tool
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (isEditMode) {
        if (activeTool === 'delete') {
          onDeleteNode?.(node.id);
          return;
        }
        if (activeTool === 'connect') {
          if (!connectStartNodeId) {
            setConnectStartNodeId(node.id);
          } else {
            if (connectStartNodeId !== node.id) {
              onConnectNodes?.(connectStartNodeId, node.id);
            }
            setConnectStartNodeId(null);
          }
          return;
        }
      }
      onSelectNode(node.id);
    },
    [isEditMode, activeTool, connectStartNodeId, onDeleteNode, onConnectNodes, onSelectNode]
  );

  // Canvas Click for 'add-node' tool
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (isEditMode && activeTool === 'add-node') {
        const bounds = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - bounds.left;
        const clickY = event.clientY - bounds.top;
        onAddNodeAtPosition?.({ x: clickX, y: clickY });
      }
    },
    [isEditMode, activeTool, onAddNodeAtPosition]
  );

  const handleNodeMouseEnter: NodeMouseHandler = useCallback(
    (_, node) => {
      onHoverNode(node.id);
    },
    [onHoverNode]
  );

  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    onHoverNode(null);
  }, [onHoverNode]);

  // Center node on Segment Tree
  const handleCenterCenterpiece = useCallback(() => {
    const centerNode = nodes.find((n) => n.data.isCenterpiece) || nodes[0];
    if (centerNode) {
      setCenter(centerNode.position.x + 40, centerNode.position.y + 40, {
        zoom: 1.2,
        duration: 800,
      });
    }
  }, [nodes, setCenter]);

  return (
    <div className="relative w-full h-full select-none">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        fitView
        minZoom={0.3}
        maxZoom={2.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        attributionPosition="bottom-right"
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          className="opacity-40 dark:opacity-20"
        />
        {!isFocusMode && (
          <Controls
            showInteractive={false}
            className="!bg-white/90 dark:!bg-slate-900/90 !border !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-lg backdrop-blur-md overflow-hidden"
          />
        )}
      </ReactFlow>

      {/* Floating Canvas Dock (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl gap-1">
        <button
          onClick={() => zoomIn({ duration: 300 })}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Phóng to (+)"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Thu nhỏ (-)"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 my-auto" />
        <button
          onClick={() => fitView({ duration: 600, padding: 0.2 })}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Vừa khung hình"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>
        <button
          onClick={handleCenterCenterpiece}
          className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          title="Căn giữa Segment Tree"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">filter_center_focus</span>
        </button>
      </div>
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
