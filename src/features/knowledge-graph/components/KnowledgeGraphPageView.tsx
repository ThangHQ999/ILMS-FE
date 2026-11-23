'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useGraphMode } from '../hooks/useGraphMode';
import { useGraphData } from '../hooks/useGraphData';
import {
  useRetryGraphPublicationMutation,
  useStartMaterialGraphDraftMutation,
  useWithdrawPublishedGraphMutation,
} from '../hooks/useKnowledgeGraphQueries';
import {
  getStudioCourseOptions,
  deriveTopicDisplayName,
  getPedagogicalDefinition,
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

  const startDraftMutation = useStartMaterialGraphDraftMutation();
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

  const handleStartDraftEdit = useCallback(
    (materialId: string) => {
      startDraftMutation.mutate(materialId, {
        onSuccess: (created) => {
          showToast('Đã tạo bản nháp chỉnh sửa Neo4j. Đang chuyển tới trình duyệt nháp...');
          if (created.jobId) {
            router.push(`/materials/tasks?jobId=${encodeURIComponent(created.jobId)}`);
          } else {
            router.push('/materials/tasks');
          }
        },
        onError: (err) => {
          showToast(
            err instanceof Error ? err.message : 'Không thể tạo bản nháp chỉnh sửa Neo4j.'
          );
        },
      });
    },
    [router, showToast, startDraftMutation]
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
      const definition =
        graphState.conceptDetail?.definition ||
        node.definitionText ||
        node.description ||
        getPedagogicalDefinition(node.label, node.topic || node.materialTitle);

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
        nodesData={graphState.nodesData}
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
      isStartingDraft={startDraftMutation.isPending}
      isWithdrawing={withdrawMutation.isPending}
      isRetryingPublication={retryPubMutation.isPending}
      onStartDraftEdit={handleStartDraftEdit}
      onWithdrawPublication={handleWithdrawPublication}
      onRetryPublication={handleRetryPublication}
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
      onAddNode={graphState.addNode}
      onUpdateNode={graphState.updateNode}
      onDeleteNode={graphState.deleteNode}
      onConnectNodes={graphState.addEdge}
      hasUnsavedChanges={graphState.hasUnsavedChanges}
      unsavedCount={graphState.unsavedCount}
      onResetDraftChanges={graphState.resetDraftChanges}
      onSwitchToFocus={() => switchMode('focus')}
    />
  );
}
