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
import { GoogleKnowledgeEdge } from './GoogleKnowledgeEdge';
import { KnowledgeNodeData, KnowledgeCategory, EditTool, LayoutMode } from '../../types';
import { useForceLayout } from '../../hooks/useForceLayout';
import { DraggableMinimap } from '../focus/DraggableMinimap';

const nodeTypes = {
  knowledgeNode: KnowledgeNode,
};

const edgeTypes = {
  googleEdge: GoogleKnowledgeEdge,
  default: GoogleKnowledgeEdge,
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
  onConnectStartNodeChange?: (nodeId: string | null) => void;
  highlightPathIds?: string[] | null;
  isFocusMode?: boolean;
  isMinimapVisible?: boolean;
  onToggleMinimap?: () => void;
  onCloseMinimap?: () => void;
  onOpenAiRepairModal?: () => void;
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
  onConnectStartNodeChange,
  highlightPathIds,
  isFocusMode = false,
  isMinimapVisible,
  onToggleMinimap,
  onCloseMinimap,
  onOpenAiRepairModal,
}: GraphCanvasProps) {
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow();
  const { applyLayout } = useForceLayout();

  const [internalMinimapVisible, setInternalMinimapVisible] = useState(false);
  const effectiveMinimapVisible =
    isMinimapVisible !== undefined ? isMinimapVisible : internalMinimapVisible;

  const handleCloseMinimap = useCallback(() => {
    if (onCloseMinimap) {
      onCloseMinimap();
    } else {
      setInternalMinimapVisible(false);
    }
  }, [onCloseMinimap]);

  const handleToggleMinimap = useCallback(() => {
    if (onToggleMinimap) {
      onToggleMinimap();
    } else {
      setInternalMinimapVisible((prev) => !prev);
    }
  }, [onToggleMinimap]);

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
        type: 'googleEdge',
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

  // Reset connect start node when switching away from connect tool
  useEffect(() => {
    if (!isEditMode || activeTool !== 'connect') {
      if (connectStartNodeId) {
        setConnectStartNodeId(null);
        onConnectStartNodeChange?.(null);
      }
    }
  }, [isEditMode, activeTool, connectStartNodeId, onConnectStartNodeChange]);

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
            onConnectStartNodeChange?.(node.id);
          } else {
            if (connectStartNodeId !== node.id) {
              onConnectNodes?.(connectStartNodeId, node.id);
            }
            setConnectStartNodeId(null);
            onConnectStartNodeChange?.(null);
          }
          return;
        }
      }
      onSelectNode(node.id);
    },
    [isEditMode, activeTool, connectStartNodeId, onDeleteNode, onConnectNodes, onConnectStartNodeChange, onSelectNode]
  );

  // Canvas Click for 'add-node' tool or deselecting active node
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (isEditMode && activeTool === 'add-node') {
        const bounds = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - bounds.left;
        const clickY = event.clientY - bounds.top;
        onAddNodeAtPosition?.({ x: clickX, y: clickY });
      } else {
        onSelectNode(null);
      }
    },
    [isEditMode, activeTool, onAddNodeAtPosition, onSelectNode]
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
        edgeTypes={edgeTypes}
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
        proOptions={{ hideAttribution: true }}
        className={`bg-transparent transition-all ${
          isEditMode && activeTool === 'add-node'
            ? '!cursor-crosshair'
            : isEditMode && activeTool === 'connect'
            ? '!cursor-cell'
            : isEditMode && activeTool === 'delete'
            ? '!cursor-pointer'
            : ''
        }`}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          className="opacity-40 dark:opacity-20"
        />
        {effectiveMinimapVisible && (
          <DraggableMinimap
            isVisible={effectiveMinimapVisible}
            onClose={handleCloseMinimap}
            onSelectNode={onSelectNode ? (id) => onSelectNode(id) : undefined}
          />
        )}
      </ReactFlow>

      {/* Floating Canvas Dock (Bottom-Right) - Google M3 Pill */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-md gap-1">
        <button
          onClick={() => zoomIn({ duration: 300 })}
          className="p-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
          title="Phóng to (+)"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          className="p-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
          title="Thu nhỏ (-)"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <div className="w-[1px] h-5 bg-[#E1E5EA] dark:bg-[#282A2C] my-auto" />
        <button
          onClick={() => fitView({ duration: 600, padding: 0.2 })}
          className="p-2 rounded-full text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors border-none cursor-pointer"
          title="Vừa khung hình"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>
        <button
          onClick={handleCenterCenterpiece}
          className="p-2 rounded-full text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#D3E3FD]/50 dark:hover:bg-[#162B4D] transition-colors border-none cursor-pointer"
          title="Căn giữa Segment Tree"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">filter_center_focus</span>
        </button>
        <div className="w-[1px] h-5 bg-[#E1E5EA] dark:bg-[#282A2C] my-auto" />
        <button
          onClick={handleToggleMinimap}
          className={`p-2 rounded-full transition-colors border-none cursor-pointer ${
            effectiveMinimapVisible
              ? 'text-[#0B57D0] dark:text-[#A8C7FA] bg-[#D3E3FD]/50 dark:bg-[#162B4D]'
              : 'text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
          }`}
          title={effectiveMinimapVisible ? 'Ẩn minimap vùng nhìn' : 'Hiện minimap vùng nhìn'}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
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
