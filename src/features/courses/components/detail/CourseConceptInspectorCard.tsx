'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCourseConceptDetail } from '../../hooks/useCourse';
import type { CourseKnowledgeGraphNode } from '../../schemas/course.schema';

interface CourseConceptInspectorCardProps {
  courseId: string;
  node: CourseKnowledgeGraphNode | null;
  allNodes: CourseKnowledgeGraphNode[];
  onSelectNode: (id: string) => void;
  onAskAiConcept?: (conceptLabel: string) => void;
}

type DetailTabKey = 'overview' | 'processes' | 'exercises' | 'examples';

export function CourseConceptInspectorCard({
  courseId,
  node,
  allNodes,
  onSelectNode,
  onAskAiConcept,
}: CourseConceptInspectorCardProps) {
  const t = useTranslations('courseKg');
  const [activeTab, setActiveTab] = useState<DetailTabKey>('overview');

  const conceptCode = node?.canonicalCode || node?.id || null;
  const { data: detail, isLoading: isDetailLoading } = useCourseConceptDetail(conceptCode);

  if (!node) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center min-h-[420px] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[26px]">touch_app</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Chọn một khái niệm để xem tri thức chi tiết
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Xem định nghĩa chuẩn, quy trình từng bước, bài tập mẫu, ví dụ và liên kết tới bài giảng trong khóa học.
        </p>
      </div>
    );
  }

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const prereqNodes = node.prerequisites
    .map((id) => nodeMap.get(id))
    .filter((n): n is CourseKnowledgeGraphNode => Boolean(n));

  const successorNodes = allNodes.filter((n) => n.prerequisites.includes(node.id));
  const definitionText = detail?.definition || detail?.description || node.description || '';
  const processes = detail?.processes ?? [];
  const exercises = detail?.exercises ?? [];
  const examples = detail?.examples ?? [];
  const argumentsList = detail?.arguments ?? [];

  const studioHref = `/knowledge-graph?courseId=${encodeURIComponent(courseId)}&concept=${encodeURIComponent(
    node.canonicalCode || node.id
  )}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden sticky top-24">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
            {node.topic || node.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {node.level}
          </span>
          {node.materialTitle && (
            <span className="text-[11px] text-slate-400 truncate max-w-[180px]" title={node.materialTitle}>
              • {node.materialTitle}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
          {node.label}
        </h3>

        {/* Mastery Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Mức độ nắm vững
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {node.masteryPercent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                node.masteryPercent >= 80
                  ? 'bg-emerald-500'
                  : node.masteryPercent > 0
                    ? 'bg-blue-600'
                    : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, node.masteryPercent))}%` }}
            />
          </div>
        </div>

        {/* 4 Rich Knowledge Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          {(
            [
              ['overview', 'Tổng quan', null],
              ['processes', 'Quy trình', processes.length],
              ['exercises', 'Bài tập', exercises.length],
              ['examples', 'Ví dụ', examples.length],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer truncate ${
                activeTab === key
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
              {count !== null && count > 0 ? ` (${count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto text-xs">
        {isDetailLoading && activeTab !== 'overview' ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ) : activeTab === 'overview' ? (
          <>
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700 dark:text-slate-200">
                Định nghĩa &amp; Mô tả
              </div>
              {definitionText ? (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {definitionText}
                </p>
              ) : (
                <p className="text-slate-400 italic">
                  Chưa có định nghĩa chi tiết từ Neo4j cho khái niệm này.
                </p>
              )}
            </div>

            {argumentsList.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Lập luận trọng tâm
                </div>
                {argumentsList.map((arg, idx) => (
                  <div
                    key={`arg-${idx}`}
                    className="rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 p-3 space-y-1"
                  >
                    {arg.hypothesis && (
                      <div className="font-semibold text-purple-900 dark:text-purple-200">
                        {arg.hypothesis}
                      </div>
                    )}
                    {arg.evidence && (
                      <div className="text-slate-600 dark:text-slate-300">{arg.evidence}</div>
                    )}
                    {arg.conclusion && (
                      <div className="font-medium text-purple-700 dark:text-purple-300">
                        → {arg.conclusion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Prerequisites & Successors */}
            {prereqNodes.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Kiến thức tiên quyết ({prereqNodes.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prereqNodes.map((pre) => (
                    <button
                      key={pre.id}
                      type="button"
                      onClick={() => onSelectNode(pre.id)}
                      className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200/70 dark:border-amber-900 transition-colors cursor-pointer"
                    >
                      ← {pre.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {successorNodes.length > 0 && (
              <div className="space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Mở đường tới ({successorNodes.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {successorNodes.map((succ) => (
                    <button
                      key={succ.id}
                      type="button"
                      onClick={() => onSelectNode(succ.id)}
                      className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/70 dark:border-blue-900 transition-colors cursor-pointer"
                    >
                      {succ.label} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Lessons */}
            {node.linkedLessonIds.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  Bài học gắn kết ({node.linkedLessonIds.length})
                </div>
                <div className="flex flex-col gap-1.5">
                  {node.linkedLessonIds.map((lessonId, idx) => (
                    <Link
                      key={lessonId}
                      href={`/courses/${courseId}/lessons/${lessonId}`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200/70 dark:border-slate-700 transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                          menu_book
                        </span>
                        <span>Mở bài học liên quan #{idx + 1}</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'processes' ? (
          processes.length === 0 ? (
            <p className="text-slate-400 italic text-center py-6">
              Khái niệm này chưa có quy trình từng bước nào được trích xuất.
            </p>
          ) : (
            <div className="space-y-3">
              {processes.map((proc, idx) => (
                <div
                  key={`proc-${idx}`}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 p-3.5 space-y-2"
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100">{proc.name}</div>
                  {proc.description && (
                    <p className="text-slate-600 dark:text-slate-300">{proc.description}</p>
                  )}
                  {proc.steps.length > 0 && (
                    <ol className="space-y-1.5 pt-1">
                      {proc.steps.map((s) => (
                        <li key={s.stepNumber} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {s.stepNumber}
                          </span>
                          <span className="text-slate-700 dark:text-slate-200 leading-relaxed">
                            {s.action}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'exercises' ? (
          exercises.length === 0 ? (
            <p className="text-slate-400 italic text-center py-6">
              Chưa có bài tập mẫu nào gắn với khái niệm này.
            </p>
          ) : (
            <div className="space-y-3">
              {exercises.map((ex, idx) => (
                <div
                  key={`ex-${idx}`}
                  className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 p-3.5 space-y-2"
                >
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">{ex.title}</div>
                  {ex.content && (
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                      {ex.content}
                    </p>
                  )}
                  {ex.steps.length > 0 && (
                    <ol className="space-y-1 pt-1">
                      {ex.steps.map((s) => (
                        <li key={s.stepNumber} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            Bước {s.stepNumber}:
                          </span>
                          <span className="text-slate-700 dark:text-slate-200">{s.action}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )
        ) : examples.length === 0 ? (
          <p className="text-slate-400 italic text-center py-6">
            Chưa có ví dụ minh họa nào cho khái niệm này.
          </p>
        ) : (
          <div className="space-y-3">
            {examples.map((eg, idx) => (
              <div
                key={`eg-${idx}`}
                className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 p-3.5 space-y-2"
              >
                <div className="font-bold text-amber-900 dark:text-amber-200">{eg.title}</div>
                {eg.explanation && (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {eg.explanation}
                  </p>
                )}
                {eg.codeSnippet && (
                  <pre className="rounded-xl bg-slate-950 text-emerald-200 p-3 font-mono text-[11px] overflow-x-auto">
                    {eg.codeSnippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Quick Actions */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
        {onAskAiConcept && (
          <button
            type="button"
            onClick={() => onAskAiConcept(node.label)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0059bb] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>{t('askSocraticAi')}</span>
          </button>
        )}
        <Link
          href={studioHref}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_full</span>
          <span>Studio</span>
        </Link>
      </div>
    </div>
  );
}
