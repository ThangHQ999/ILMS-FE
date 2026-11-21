'use client';

import React, { useMemo } from 'react';
import type { KnowledgeNodeData } from '../../types';
import type { ConceptDetail } from '../../knowledge-graph.schema';
import {
  deriveTopicDisplayName,
  getPedagogicalDefinition,
} from '../../services/knowledge-graph.service';
import { askOwlAboutConcept } from '@/hooks/useSocraticLessonContext';

interface FloatingNodeCardProps {
  node: KnowledgeNodeData | null;
  conceptDetail?: ConceptDetail | null;
  isConceptLoading?: boolean;
  canOpenLesson?: boolean;
  onClose: () => void;
  onOpenLesson?: (node: KnowledgeNodeData) => void;
  onAskAiTutor?: (node: KnowledgeNodeData) => void;
}

export function FloatingNodeCard({
  node,
  conceptDetail,
  isConceptLoading = false,
  canOpenLesson = false,
  onClose,
  onOpenLesson,
  onAskAiTutor,
}: FloatingNodeCardProps) {
  const topicDisplayName = useMemo(() => {
    if (!node) return 'Khái niệm cốt lõi';
    return (
      deriveTopicDisplayName(node.topic || node.materialTitle) ||
      (node.sublabel && !node.sublabel.includes('trung tâm') ? node.sublabel : null) ||
      'Khái niệm cốt lõi'
    );
  }, [node]);

  const definition = useMemo(() => {
    if (!node) return '';
    if (conceptDetail?.definition && conceptDetail.definition.trim()) {
      return conceptDetail.definition.trim();
    }
    if (
      conceptDetail?.description &&
      conceptDetail.description.trim() &&
      !conceptDetail.description.startsWith('INGESTION_') &&
      !conceptDetail.description.startsWith('NODE_')
    ) {
      return conceptDetail.description.trim();
    }
    if (node.definitionText && node.definitionText.trim()) {
      return node.definitionText.trim();
    }
    if (
      node.description &&
      node.description.trim() &&
      !node.description.startsWith('INGESTION_') &&
      !node.description.startsWith('NODE_')
    ) {
      return node.description.trim();
    }
    return getPedagogicalDefinition(node.label, node.topic || node.materialTitle);
  }, [conceptDetail, node]);

  const processes = useMemo(() => {
    if (conceptDetail?.processes && conceptDetail.processes.length > 0) {
      return conceptDetail.processes;
    }
    if (node?.processes && node.processes.length > 0) {
      return node.processes;
    }
    return [];
  }, [conceptDetail?.processes, node?.processes]);

  const exercises = useMemo(() => {
    if (conceptDetail?.exercises && conceptDetail.exercises.length > 0) {
      return conceptDetail.exercises;
    }
    if (node?.exercises && node.exercises.length > 0) {
      return node.exercises;
    }
    return [];
  }, [conceptDetail?.exercises, node?.exercises]);

  const examples = useMemo(() => {
    if (conceptDetail?.examples && conceptDetail.examples.length > 0) {
      return conceptDetail.examples;
    }
    if (node?.examples && node.examples.length > 0) {
      return node.examples;
    }
    return [];
  }, [conceptDetail?.examples, node?.examples]);

  if (!node) return null;

  const processesCount =
    processes.reduce((acc, p) => acc + (p.steps?.length ?? 0), 0) ||
    processes.length ||
    (node.kind?.toUpperCase() === 'PROCESS' ? 1 : 0);
  const exercisesCount = exercises.length || (node.kind?.toUpperCase() === 'EXERCISE' ? 1 : 0);
  const examplesCount = examples.length || (node.kind?.toUpperCase() === 'EXAMPLE' ? 1 : 0);
  const firstProcess = processes[0];

  const handleAskAi = () => {
    askOwlAboutConcept({
      id: node.id,
      label: node.label,
      definition,
      materialTitle: node.materialTitle,
      topic: topicDisplayName,
      processes,
      exercises,
      examples,
    });
    onAskAiTutor?.(node);
  };

  return (
    <div className="fixed z-40 w-96 max-w-[calc(100vw-2rem)] rounded-3xl p-6 bg-white dark:bg-[#1E1F20] border border-slate-200/70 dark:border-slate-800 shadow-2xl text-[#1F1F1F] dark:text-[#E3E3E3] right-6 top-24 animate-scale-up">
      {/* Header Tag & Close Button */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[11px] font-bold text-[#041E49] dark:text-[#A8C7FA] truncate">
          <span className="material-symbols-outlined text-[15px]">gps_fixed</span>
          <span className="truncate">{topicDisplayName}</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#444746] hover:text-[#1F1F1F] dark:text-[#8E918F] dark:hover:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] p-1.5 rounded-full transition-colors cursor-pointer shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Title Block */}
      <div className="mt-1 mb-2.5">
        <h3 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight leading-snug">
          {node.label}
        </h3>
        {node.materialTitle && (
          <p className="text-[11px] text-[#444746] dark:text-[#C4C7C5] font-medium mt-0.5 truncate">
            Nguồn: {node.materialTitle}
          </p>
        )}
      </div>

      {/* Real Definition from Neo4j */}
      {isConceptLoading ? (
        <div className="space-y-2 mb-4 animate-pulse">
          <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : definition ? (
        <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed font-normal mb-4 line-clamp-4 whitespace-pre-line">
          {definition}
        </p>
      ) : (
        <p className="text-xs text-slate-400 italic mb-4">
          Chưa có mô tả chi tiết cho khái niệm này trên Neo4j.
        </p>
      )}

      {/* First Process Step Preview if available */}
      {firstProcess && firstProcess.steps.length > 0 && (
        <div className="mb-4 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 text-[11px] space-y-1">
          <div className="font-bold text-[#041E49] dark:text-[#A8C7FA]">
            Quy trình: {firstProcess.name}
          </div>
          <p className="text-[#444746] dark:text-[#C4C7C5] line-clamp-2">
            Bước 1:{' '}
            {typeof firstProcess.steps[0] === 'string'
              ? firstProcess.steps[0]
              : firstProcess.steps[0].action}
          </p>
        </div>
      )}

      {/* Real Neo4j Content Metrics (3 columns) */}
      <div className="bg-[#F0F4F9] dark:bg-[#282A2C] rounded-2xl p-3 grid grid-cols-3 gap-2 text-center mb-4">
        <div>
          <span className="text-[10px] text-[#444746] dark:text-[#8E918F] font-semibold uppercase tracking-wider block">
            Quy trình
          </span>
          <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold text-sm mt-0.5 block">
            {processesCount}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#444746] dark:text-[#8E918F] font-semibold uppercase tracking-wider block">
            Bài tập
          </span>
          <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm mt-0.5 block">
            {exercisesCount}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#444746] dark:text-[#8E918F] font-semibold uppercase tracking-wider block">
            Ví dụ
          </span>
          <span className="text-amber-700 dark:text-amber-300 font-bold text-sm mt-0.5 block">
            {examplesCount}
          </span>
        </div>
      </div>

      {/* Mastery Progress Row */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#444746] dark:text-[#8E918F] text-[11px]">
            Độ thành thạo kiến thức
          </span>
          <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-bold font-mono">
            {node.masteryScore}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#E1E5EA] dark:bg-[#131314] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, node.masteryScore))}%` }}
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-2">
        {canOpenLesson && (
          <button
            onClick={() => onOpenLesson?.(node)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-bold text-xs transition-colors cursor-pointer"
            type="button"
          >
            <span>Vào bài học</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
        <button
          onClick={handleAskAi}
          className={`${
            canOpenLesson ? 'px-4' : 'flex-1'
          } flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">smart_toy</span>
          <span>Hỏi Gia sư AI</span>
        </button>
      </div>
    </div>
  );
}
