'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useGraphMode } from '../hooks/useGraphMode';
import { useGraphData } from '../hooks/useGraphData';
import {
  useCreateCourseKnowledgeEdgeMutation,
  useCreateCourseKnowledgeNodeMutation,
  useDeleteCourseKnowledgeEdgeMutation,
  useDeleteCourseKnowledgeNodeMutation,
  useImportKnowledgeGraphMutation,
  useRetryGraphPublicationMutation,
  useUpdateCourseKnowledgeNodeMutation,
  useWithdrawPublishedGraphMutation,
} from '../hooks/useKnowledgeGraphQueries';
import type { ImportKnowledgeGraphRequestDTO } from '../knowledge-graph.schema';
import {
  getStudioCourseOptions,
  deriveTopicDisplayName,
  getPedagogicalDefinition,
  deduplicateParagraphs,
  type StudioCourseOption,
} from '../services/knowledge-graph.service';
import { askOwlAboutConcept } from '@/hooks/useSocraticLessonContext';
import type { KnowledgeNodeData } from '../types';
import { KnowledgeAnalyticsView } from './analytics/KnowledgeAnalyticsView';
import { KnowledgeFocusView } from './focus/KnowledgeFocusView';

export function KnowledgeGraphPageView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isTeacher, isAdmin } = useUserRole();

  const initialCourseId = searchParams.get('courseId');
  const initialMaterialId = searchParams.get('materialId');
  const initialConceptCode = searchParams.get('concept');

  const { isFocus, switchMode } = useGraphMode();
  const graphState = useGraphData({
    initialCourseId,
    initialMaterialId,
    initialConceptCode,
  });

  const [courseOptions, setCourseOptions] = useState<StudioCourseOption[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const importGraphMutation = useImportKnowledgeGraphMutation();
  const createNodeMutation = useCreateCourseKnowledgeNodeMutation();
  const updateNodeMutation = useUpdateCourseKnowledgeNodeMutation();
  const deleteNodeMutation = useDeleteCourseKnowledgeNodeMutation();
  const createEdgeMutation = useCreateCourseKnowledgeEdgeMutation();
  const deleteEdgeMutation = useDeleteCourseKnowledgeEdgeMutation();
  const withdrawMutation = useWithdrawPublishedGraphMutation();
  const retryPubMutation = useRetryGraphPublicationMutation();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    void getStudioCourseOptions(user.id)
      .then((list) => {
        if (active) setCourseOptions(list);
      })
      .catch(() => {
        // Optional dropdown: keep empty if endpoint unavailable
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const activePublishedSummary = useMemo(() => {
    if (!graphState.selectedMaterialId) return null;
    return (
      graphState.publishedGraphs.find(
        (g) => g.materialId === graphState.selectedMaterialId
      ) ?? null
    );
  }, [graphState.publishedGraphs, graphState.selectedMaterialId]);

  const syncScopeUrl = useCallback(
    (nextCourseId: string | null, nextMaterialId: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (nextCourseId) next.set('courseId', nextCourseId);
      else next.delete('courseId');
      if (nextMaterialId) next.set('materialId', nextMaterialId);
      else next.delete('materialId');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleSelectCourse = useCallback(
    (courseId: string | null) => {
      graphState.setSelectedCourseId(courseId);
      graphState.setSelectedMaterialId(null);
      syncScopeUrl(courseId, null);
    },
    [graphState, syncScopeUrl]
  );

  const handleSelectMaterial = useCallback(
    (materialId: string | null) => {
      graphState.setSelectedMaterialId(materialId);
      syncScopeUrl(graphState.selectedCourseId, materialId);
    },
    [graphState, syncScopeUrl]
  );

  // Lưu toàn bộ đồ thị phẳng (nodes + edges) qua Spring Boot POST /api/v1/knowledge-graphs/courses/{courseId}/import-json
  const handleSaveCourseGraph = useCallback(() => {
    const courseId = graphState.selectedCourseId;
    if (!courseId) {
      showToast('Vui lòng chọn môn học từ danh sách trước khi lưu đồ thị tri thức!');
      return;
    }

    const payload: ImportKnowledgeGraphRequestDTO = {
      title: graphState.graphTitle || 'Đồ thị tri thức môn học',
      description: 'Cập nhật từ Canvas đồ thị tri thức môn học',
      nodes: graphState.nodesData.map((n) => ({
        id: n.id,
        label: n.label || n.id,
        level: (n.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') || 'BEGINNER',
        category: n.category || 'Chung',
        description: n.description || n.definitionText || '',
        prerequisites: n.prerequisites || [],
      })),
      edges: graphState.edgesData.map((e) => ({
        source: e.source,
        target: e.target,
        relation: e.rawRelation || 'PREREQUISITE',
      })),
    };

    importGraphMutation.mutate(
      { courseId, payload },
      {
        onSuccess: (res) => {
          showToast(
            `Đã lưu đồ thị môn học thành công qua Spring Boot! (${res.totalNodes ?? graphState.nodesData.length} nút, ${res.totalEdges ?? graphState.edgesData.length} cạnh)`
          );
          graphState.resetDraftChanges();
          graphState.refetch();
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Không thể lưu đồ thị vào khóa học.');
        },
      }
    );
  }, [graphState, importGraphMutation, showToast]);

  // Thêm Node trực tiếp qua POST /api/v1/knowledge-graphs/courses/{courseId}/nodes
  const handleAddNode = useCallback(
    (newNode: KnowledgeNodeData) => {
      graphState.addNode(newNode);
      const courseId = graphState.selectedCourseId;
      if (courseId) {
        createNodeMutation.mutate(
          {
            courseId,
            payload: {
              id: newNode.id,
              label: newNode.label,
              description: newNode.description || newNode.definitionText || '',
              level: (newNode.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') || 'BEGINNER',
              category: newNode.category || 'Chung',
              prerequisites: newNode.prerequisites || [],
            },
          },
          {
            onSuccess: () => {
              showToast(`Đã thêm nút "${newNode.label}" vào đồ thị môn học.`);
            },
            onError: (err) => {
              showToast(err instanceof Error ? err.message : 'Lỗi khi lưu nút vào server.');
            },
          }
        );
      }
    },
    [createNodeMutation, graphState, showToast]
  );

  // Sửa Node trực tiếp qua PUT /api/v1/knowledge-graphs/courses/{courseId}/nodes/{nodeId}
  const handleUpdateNode = useCallback(
    (id: string, updates: Partial<KnowledgeNodeData>) => {
      graphState.updateNode(id, updates);
      const courseId = graphState.selectedCourseId;
      if (courseId) {
        updateNodeMutation.mutate(
          {
            courseId,
            nodeId: id,
            payload: {
              label: updates.label,
              description: updates.description || updates.definitionText,
              level: updates.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | undefined,
              category: updates.category,
              prerequisites: updates.prerequisites,
            },
          },
          {
            onSuccess: () => {
              showToast(`Đã cập nhật nút "${updates.label || id}" thành công.`);
            },
            onError: (err) => {
              showToast(err instanceof Error ? err.message : 'Lỗi khi cập nhật nút.');
            },
          }
        );
      }
    },
    [graphState, showToast, updateNodeMutation]
  );

  // Xóa Node trực tiếp qua DELETE /api/v1/knowledge-graphs/courses/{courseId}/nodes/{nodeId}
  const handleDeleteNode = useCallback(
    (id: string) => {
      graphState.deleteNode(id);
      const courseId = graphState.selectedCourseId;
      if (courseId) {
        deleteNodeMutation.mutate(
          { courseId, nodeId: id },
          {
            onSuccess: () => {
              showToast(`Đã xóa nút khỏi đồ thị môn học.`);
            },
            onError: (err) => {
              showToast(err instanceof Error ? err.message : 'Lỗi khi xóa nút.');
            },
          }
        );
      }
    },
    [deleteNodeMutation, graphState, showToast]
  );

  // Thêm Cạnh trực tiếp qua POST /api/v1/knowledge-graphs/courses/{courseId}/edges
  const handleConnectNodes = useCallback(
    (source: string, target: string, rawRelation?: string, label?: string) => {
      graphState.addEdge(source, target, rawRelation, label);
      const courseId = graphState.selectedCourseId;
      if (courseId) {
        createEdgeMutation.mutate(
          {
            courseId,
            payload: {
              source,
              target,
              relation: (rawRelation || 'PREREQUISITE').toUpperCase(),
            },
          },
          {
            onSuccess: () => {
              showToast(`Đã lưu quan hệ liên kết mới vào đồ thị môn học.`);
            },
            onError: (err) => {
              showToast(err instanceof Error ? err.message : 'Lỗi khi tạo quan hệ liên kết.');
            },
          }
        );
      }
    },
    [createEdgeMutation, graphState, showToast]
  );

  const handleWithdrawPublication = useCallback(
    (materialId: string, publicationId: string, reason?: string) => {
      withdrawMutation.mutate(
        { materialId, publicationId, reason },
        {
          onSuccess: () => {
            showToast('Đã thu hồi phiên bản đồ thị tri thức khỏi Neo4j.');
            graphState.setSelectedMaterialId(null);
            graphState.refetch();
          },
          onError: (err) => {
            showToast(
              err instanceof Error ? err.message : 'Không thể thu hồi phiên bản xuất bản này.'
            );
          },
        }
      );
    },
    [graphState, showToast, withdrawMutation]
  );

  const handleRetryPublication = useCallback(
    (publicationId: string) => {
      retryPubMutation.mutate(publicationId, {
        onSuccess: () => {
          showToast('Đã gửi yêu cầu thử xuất bản lại phiên bản đồ thị.');
          graphState.refetch();
        },
        onError: (err) => {
          showToast(
            err instanceof Error ? err.message : 'Không thể thử lại xuất bản đồ thị.'
          );
        },
      });
    },
    [graphState, retryPubMutation, showToast]
  );

  const handleFocusOpenLesson = useCallback(
    (node: KnowledgeNodeData) => {
      const courseId =
        graphState.selectedCourseId || activePublishedSummary?.courseId || null;
      const firstLessonId =
        node.linkedLessonIds?.[0] || graphState.conceptDetail?.linkedLessonIds?.[0] || null;

      if (courseId && firstLessonId) {
        router.push(`/courses/${courseId}/lessons/${firstLessonId}`);
      } else if (courseId) {
        router.push(`/courses/${courseId}?tab=syllabus`);
      }
    },
    [activePublishedSummary?.courseId, graphState.conceptDetail?.linkedLessonIds, graphState.selectedCourseId, router]
  );

  const handleFocusAskAi = useCallback(
    (node: KnowledgeNodeData) => {
      const courseId =
        graphState.selectedCourseId || activePublishedSummary?.courseId || undefined;
      const rawDef =
        (typeof graphState.conceptDetail?.definition === 'string'
          ? graphState.conceptDetail.definition
          : (graphState.conceptDetail?.definition as unknown as { content?: string })?.content) ||
        graphState.conceptDetail?.description ||
        node.definitionText ||
        node.description ||
        getPedagogicalDefinition(node.label, node.topic || node.materialTitle);
      const definition = deduplicateParagraphs(rawDef);

      askOwlAboutConcept({
        id: node.id,
        label: node.label,
        definition,
        materialTitle: node.materialTitle,
        topic: deriveTopicDisplayName(node.topic || node.materialTitle),
        courseId,
        courseName: graphState.graphTitle,
        processes:
          graphState.conceptDetail?.processes && graphState.conceptDetail.processes.length > 0
            ? graphState.conceptDetail.processes
            : node.processes,
        exercises:
          graphState.conceptDetail?.exercises && graphState.conceptDetail.exercises.length > 0
            ? graphState.conceptDetail.exercises
            : node.exercises,
        examples:
          graphState.conceptDetail?.examples && graphState.conceptDetail.examples.length > 0
            ? graphState.conceptDetail.examples
            : node.examples,
      });
    },
    [
      activePublishedSummary?.courseId,
      graphState.conceptDetail,
      graphState.graphTitle,
      graphState.selectedCourseId,
    ]
  );

  const canManageGraph = isTeacher || isAdmin;
  const userFullName =
    user?.firstName || user?.lastName
      ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
      : '';

  const canOpenLessonFromFocus = Boolean(
    graphState.selectedCourseId || activePublishedSummary?.courseId
  );

  if (isFocus) {
    return (
      <KnowledgeFocusView
        userFullName={userFullName}
        courseId={graphState.selectedCourseId}
        courseOptions={courseOptions}
        nodesData={graphState.nodesData}
        edgesData={graphState.edgesData}
        rawNodes={graphState.rawNodes}
        rawEdges={graphState.rawEdges}
        selectedNodeId={graphState.selectedNodeId}
        selectedNode={graphState.selectedNode}
        conceptDetail={graphState.conceptDetail}
        isConceptDetailLoading={graphState.isConceptDetailLoading}
        canOpenLesson={canOpenLessonFromFocus}
        onSelectNode={graphState.setSelectedNodeId}
        hoveredNodeId={graphState.hoveredNodeId}
        onHoverNode={graphState.setHoveredNodeId}
        onOpenLesson={handleFocusOpenLesson}
        onAskAiTutor={handleFocusAskAi}
        onExitFocus={() => switchMode('analytics')}
        onRefetch={graphState.refetch}
      />
    );
  }

  return (
    <KnowledgeAnalyticsView
      userFullName={userFullName}
      canManageGraph={canManageGraph}
      graphTitle={graphState.graphTitle}
      courseOptions={courseOptions}
      publishedGraphs={graphState.publishedGraphs}
      selectedCourseId={graphState.selectedCourseId}
      onSelectCourse={handleSelectCourse}
      selectedMaterialId={graphState.selectedMaterialId}
      onSelectMaterial={handleSelectMaterial}
      isLoading={graphState.isLoading}
      isFetching={graphState.isFetching}
      isError={graphState.isError}
      onRefetch={graphState.refetch}
      conceptDetail={graphState.conceptDetail}
      isConceptDetailLoading={graphState.isConceptDetailLoading}
      activePublicationId={activePublishedSummary?.publicationId ?? null}
      activePublicationStatus={activePublishedSummary?.status ?? null}
      isWithdrawing={withdrawMutation.isPending}
      isRetryingPublication={retryPubMutation.isPending}
      onWithdrawPublication={handleWithdrawPublication}
      onRetryPublication={handleRetryPublication}
      onSaveCourseGraph={handleSaveCourseGraph}
      isSavingCourseGraph={importGraphMutation.isPending}
      externalToastMessage={toastMessage}
      nodesData={graphState.nodesData}
      allNodesData={graphState.allNodesData}
      edgesData={graphState.edgesData}
      showAuxiliaryNodes={graphState.showAuxiliaryNodes}
      onToggleAuxiliaryNodes={graphState.onToggleAuxiliaryNodes}
      auxiliaryCount={graphState.auxiliaryCount}
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
      onAddNode={handleAddNode}
      onUpdateNode={handleUpdateNode}
      onDeleteNode={handleDeleteNode}
      onConnectNodes={handleConnectNodes}
      hasUnsavedChanges={graphState.hasUnsavedChanges}
      unsavedCount={graphState.unsavedCount}
      onResetDraftChanges={graphState.resetDraftChanges}
      onSwitchToFocus={() => switchMode('focus')}
    />
  );
}
