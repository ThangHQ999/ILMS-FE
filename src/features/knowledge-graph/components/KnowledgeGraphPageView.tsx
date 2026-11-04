'use client';

import React from 'react';
import { useCurrentUser } from '@/features/auth';
import { useGraphMode } from '../hooks/useGraphMode';
import { useGraphData } from '../hooks/useGraphData';
import { KnowledgeAnalyticsView } from './analytics/KnowledgeAnalyticsView';
import { KnowledgeFocusView } from './focus/KnowledgeFocusView';

export function KnowledgeGraphPageView() {
  const { data: user } = useCurrentUser();
  const { isFocus, switchMode } = useGraphMode();
  const graphState = useGraphData();

  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : 'Trần Nhật Minh';

  if (isFocus) {
    return (
      <KnowledgeFocusView
        userFullName={userFullName}
        nodesData={graphState.nodesData}
        rawNodes={graphState.rawNodes}
        rawEdges={graphState.rawEdges}
        selectedNodeId={graphState.selectedNodeId}
        selectedNode={graphState.selectedNode}
        onSelectNode={graphState.setSelectedNodeId}
        hoveredNodeId={graphState.hoveredNodeId}
        onHoverNode={graphState.setHoveredNodeId}
        onExitFocus={() => switchMode('analytics')}
      />
    );
  }

  return (
    <KnowledgeAnalyticsView
      userFullName={userFullName}
      nodesData={graphState.nodesData}
      rawNodes={graphState.rawNodes}
      rawEdges={graphState.rawEdges}
      selectedNodeId={graphState.selectedNodeId}
      selectedNode={graphState.selectedNode}
      onSelectNode={graphState.setSelectedNodeId}
      hoveredNodeId={graphState.hoveredNodeId}
      onHoverNode={graphState.setHoveredNodeId}
      filterCategory={graphState.filterCategory}
      onSelectCategory={graphState.setFilterCategory}
      searchQuery={graphState.searchQuery}
      onSearchChange={graphState.setSearchQuery}
      depth={graphState.depth}
      onDepthChange={graphState.setDepth}
      isSmartDimActive={graphState.isSmartDimActive}
      onToggleSmartDim={() =>
        graphState.setIsSmartDimActive(!graphState.isSmartDimActive)
      }
      isEditMode={graphState.isEditMode}
      onToggleEditMode={() => graphState.setIsEditMode(!graphState.isEditMode)}
      activeTool={graphState.activeTool}
      onSelectTool={graphState.setActiveTool}
      layoutMode={graphState.layoutMode}
      onLayoutModeChange={graphState.setLayoutMode}
      onAddNode={graphState.addNode}
      onUpdateNode={graphState.updateNode}
      onDeleteNode={graphState.deleteNode}
      onConnectNodes={graphState.addEdge}
      onSwitchToFocus={() => switchMode('focus')}
    />
  );
}
