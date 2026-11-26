'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { api } from '@/lib/axios';
import {
  createQuestion,
  getQuestionsPage,
  type QuestionRequestDTO,
} from '@/features/assignments';
import { distributeQuestionPoints } from '../../utils/distribute-points';
import { AzotaQuizQuestionList } from './AzotaQuizQuestionList';
import { AzotaInlinePasteTab } from './AzotaInlinePasteTab';

export interface SelectedClassworkQuestion {
  id: string;
  content: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  difficultyLevel?: string;
  point: number;
  conceptCount?: number;
  answers?: Array<{ content: string; isCorrect?: boolean }>;
}

interface QuizQuestionPickerPanelProps {
  classId?: string;
  courseId?: string;
  maxScore?: number;
  autoDistributePoints?: boolean;
  onToggleAutoDistribute?: (enabled: boolean) => void;
  selectedQuestions: SelectedClassworkQuestion[];
  onChange: (questions: SelectedClassworkQuestion[]) => void;
  onToast: (msg: string) => void;
}

type OptionKey = 'A' | 'B' | 'C' | 'D';

export function QuizQuestionPickerPanel({
  classId,
  courseId,
  maxScore = 10,
  autoDistributePoints = false,
  onToggleAutoDistribute,
  selectedQuestions,
  onChange,
  onToast,
}: QuizQuestionPickerPanelProps) {
  const t = useTranslations('assessmentHeatmap');
  const [activeMode, setActiveMode] = useState<'selected' | 'azota' | 'bank' | 'create'>('selected');
  const [bankSearch, setBankSearch] = useState('');

  // Inline create question form state
  const [qContent, setQContent] = useState('');
  const [qType, setQType] = useState<'SINGLE_CHOICE' | 'TRUE_FALSE'>('SINGLE_CHOICE');
  const [conceptCode, setConceptCode] = useState('');
  const [qPoint, setQPoint] = useState(1);
  const [options, setOptions] = useState<Record<OptionKey, string>>({
    A: '',
    B: '',
    C: '',
    D: '',
  });
  const [correctKeys, setCorrectKeys] = useState<OptionKey[]>(['A']);
  const [isCreating, setIsCreating] = useState(false);

  const bank = useQuery({
    queryKey: ['classwork-question-bank', classId, courseId, bankSearch.trim()],
    queryFn: () => getQuestionsPage({ classId, courseId, search: bankSearch.trim(), page: 1, size: 20 }),
    enabled: Boolean(courseId) && activeMode === 'bank',
  });
  const catalog = useQuery({
    queryKey: ['assessment-concepts', classId, courseId],
    enabled: Boolean(classId && courseId) && activeMode === 'create',
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}/assessment-concepts`, { params: { classId } });
      return z.array(z.object({ canonicalCode: z.string(), label: z.string() })).parse(data.data.concepts);
    },
  });

  const bankQuestions = (bank.data?.items ?? []).filter(q =>
    ['SINGLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_CHOICE'].includes(q.questionType ?? '')
    && q.answers.filter(answer => answer.isCorrect).length === 1
  );
  const selectedIds = new Set(selectedQuestions.map((q) => q.id));
  const totalPoints = Number(
    selectedQuestions.reduce((sum, q) => sum + (Number(q.point) || 0), 0).toFixed(2)
  );

  const emitChange = (nextList: SelectedClassworkQuestion[]) => {
    onChange(
      autoDistributePoints
        ? distributeQuestionPoints(nextList, maxScore)
        : nextList
    );
  };

  const handleAddFromBank = (q: (typeof bankQuestions)[number]) => {
    if (selectedIds.has(q.id)) {
      emitChange(selectedQuestions.filter((item) => item.id !== q.id));
      return;
    }
    emitChange([
      ...selectedQuestions,
      {
        id: q.id,
        content: q.content,
        type: (q.questionType as SelectedClassworkQuestion['type']) || 'SINGLE_CHOICE',
        difficultyLevel: q.difficultyLevel,
        conceptCount: q.conceptIds.length,
        point: 1,
        answers: q.answers.map((a) => ({
          content: a.content,
          isCorrect: Boolean(a.isCorrect),
        })),
      },
    ]);
  };

  const handleMoveQuestion = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedQuestions.length) return;
    const next = [...selectedQuestions];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    emitChange(next);
  };

  const handleUpdatePoint = (id: string, point: number) => {
    onChange(
      selectedQuestions.map((q) =>
        q.id === id ? { ...q, point: Math.max(0.25, Math.min(100, point || 1)) } : q
      )
    );
  };

  const handleRemoveQuestion = (id: string) => {
    onChange(selectedQuestions.filter((q) => q.id !== id));
  };

  const handleToggleCorrect = (key: OptionKey) => {
    setCorrectKeys([key]);
  };

  const handleCreateInlineQuestion = async () => {
    if (!courseId) {
      onToast(t('pickScope'));
      return;
    }
    if (!qContent.trim()) {
      onToast('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const keysToUse: OptionKey[] = qType === 'TRUE_FALSE' ? ['A', 'B'] : ['A', 'B', 'C', 'D'];
    const filledAnswers = keysToUse
      .map((k) => ({
        content: qType === 'TRUE_FALSE' ? (k === 'A' ? 'Đúng' : 'Sai') : options[k].trim(),
        isCorrect: correctKeys.includes(k),
      }))
      .filter((a) => a.content.length > 0);

    if (filledAnswers.length < 2) {
      onToast('Vui lòng nhập ít nhất 2 phương án trả lời.');
      return;
    }
    if (!filledAnswers.some((a) => a.isCorrect)) {
      onToast('Vui lòng chọn ít nhất 1 đáp án đúng.');
      return;
    }

    setIsCreating(true);
    try {
      const concept = catalog.data?.find(item => item.canonicalCode === conceptCode);
      const payload: QuestionRequestDTO = {
        courseId,
        content: qContent.trim(),
        questionType: qType,
        difficultyLevel: 'MEDIUM',
        answers: filledAnswers,
      };
      const created = await createQuestion({
        ...payload,
        ...(concept && { concepts: [{ conceptId: concept.canonicalCode, name: concept.label }] }),
      });
      emitChange([
        ...selectedQuestions,
        {
          id: created.id,
          content: created.content || qContent.trim(),
          type: qType,
          difficultyLevel: 'MEDIUM',
          conceptCount: concept ? 1 : 0,
          point: Number(qPoint) || 1,
          answers: payload.answers.map((a) => ({
            content: a.content,
            isCorrect: Boolean(a.isCorrect),
          })),
        },
      ]);
      setQContent('');
      setOptions({ A: '', B: '', C: '', D: '' });
      setCorrectKeys(['A']);
      setConceptCode('');
      setActiveMode('selected');
      void bank.refetch();
      onToast('Đã tạo câu hỏi mới và thêm vào bài tập!');
    } catch {
      onToast('Không thể tạo câu hỏi lúc này. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#F8FAFC] dark:bg-[#131314] p-4 space-y-4 border border-black/5 dark:border-white/5">
      {/* Header & Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#0B57D0] dark:text-[#A8C7FA]">
            quiz
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3]">
              Bộ câu hỏi ({selectedQuestions.length} câu • {totalPoints} điểm)
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-[#8E918F]">
              Chọn từ ngân hàng câu hỏi hoặc soạn câu hỏi mới trực tiếp
            </p>
            {selectedQuestions.length > 0 && selectedQuestions.every(question => question.conceptCount != null) && <p className="text-[11px] text-muted-foreground">
              {t('tagged', { tagged: selectedQuestions.filter(q => Boolean(q.conceptCount)).length, total: selectedQuestions.length })}
            </p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C]">
          <button
            type="button"
            onClick={() => setActiveMode('selected')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              activeMode === 'selected'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] bg-transparent'
            }`}
          >
            Danh sách ({selectedQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('azota')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              activeMode === 'azota'
                ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] bg-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Soạn nhanh Azota
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('bank')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              activeMode === 'bank'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] bg-transparent'
            }`}
          >
            Ngân hàng
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('create')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border-none cursor-pointer ${
              activeMode === 'create'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] bg-transparent'
            }`}
          >
            + Soạn lẻ
          </button>
        </div>
      </div>

      {/* Auto-Distribute Points Bar (Azota style) */}
      {onToggleAutoDistribute && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white dark:bg-[#1E1F20] px-4 py-3 border border-black/5 dark:border-white/5">
          <label className="inline-flex items-center gap-2.5 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer">
            <input
              type="checkbox"
              checked={autoDistributePoints}
              onChange={(e) => onToggleAutoDistribute(e.target.checked)}
              className="h-4 w-4 rounded accent-[#0B57D0] dark:accent-[#A8C7FA]"
            />
            <span>
              Tự động chia đều điểm theo thang điểm tổng (<strong>{maxScore} điểm</strong>)
            </span>
          </label>

          {!autoDistributePoints &&
            selectedQuestions.length > 0 &&
            Math.abs(totalPoints - maxScore) > 0.01 && (
              <button
                type="button"
                onClick={() =>
                  onChange(distributeQuestionPoints(selectedQuestions, maxScore))
                }
                className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3 py-1 text-[11px] font-semibold text-[#041E49] dark:text-[#C2E7FF] cursor-pointer"
              >
                Chia đều lại ({maxScore}đ)
              </button>
            )}
        </div>
      )}

      {/* Mode 1: Azota Question Cards */}
      {activeMode === 'selected' && (
        <AzotaQuizQuestionList
          questions={selectedQuestions}
          autoDistributePoints={autoDistributePoints}
          onPointChange={handleUpdatePoint}
          onMove={handleMoveQuestion}
          onRemove={(id) => emitChange(selectedQuestions.filter((q) => q.id !== id))}
        />
      )}

      {/* Mode 1b: Inline Azota Bulk Paste */}
      {activeMode === 'azota' && (
        <AzotaInlinePasteTab
          classId={classId}
          courseId={courseId}
          onQuestionsAdded={(added) => {
            emitChange([...selectedQuestions, ...added]);
            setActiveMode('selected');
            void bank.refetch();
          }}
          onToast={onToast}
        />
      )}

      {/* Mode 2: Pick from Question Bank */}
      {activeMode === 'bank' && (
        <div className="space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-gray-400">
              search
            </span>
            <input
              type="text"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Tìm câu hỏi theo nội dung hoặc chủ đề..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white dark:bg-[#1E1F20] text-xs text-gray-900 dark:text-[#E3E3E3] border-none outline-none shadow-2xs"
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {bank.isError ? (
              <button type="button" className="text-xs underline" onClick={() => void bank.refetch()}>{t('loadError')} {t('retry')}</button>
            ) : bank.isFetching ? (
              <div className="py-6 text-center text-xs text-gray-400">Đang tải ngân hàng câu hỏi...</div>
            ) : bankQuestions.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-[#8E918F]">
                Không tìm thấy câu hỏi nào trong ngân hàng. Bạn có thể chuyển sang tab &ldquo;+ Soạn câu mới&rdquo;.
              </div>
            ) : (
              bankQuestions.map((bq) => {
                const isAdded = selectedIds.has(bq.id);
                return (
                  <div
                    key={bq.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-[#E3E3E3] line-clamp-2">
                        {bq.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-mono">
                        <span>{bq.questionType}</span>
                        {bq.difficultyLevel && <span>• {bq.difficultyLevel}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFromBank(bq)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer shrink-0 transition-colors ${
                        isAdded
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] hover:brightness-95'
                      }`}
                    >
                      {isAdded ? '✓ Đã chọn' : '+ Thêm'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Inline Create New Question */}
      {activeMode === 'create' && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 flex items-center gap-2">
              {(['SINGLE_CHOICE', 'TRUE_FALSE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setQType(t);
                    setCorrectKeys(['A']);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border-none cursor-pointer transition-colors ${
                    qType === t
                      ? 'bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA]'
                      : 'bg-[#F0F4F8] dark:bg-[#131314] text-gray-600 dark:text-[#8E918F]'
                  }`}
                >
                  {t === 'SINGLE_CHOICE' ? '1 đáp án' : 'Đúng / Sai'}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[11px] text-gray-500">Điểm:</span>
              <input
                type="number"
                min={0.01}
                max={100}
                step={0.01}
                value={qPoint}
                onChange={(e) => setQPoint(Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 rounded-xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-center text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
              />
            </div>
          </div>

          {classId && courseId && <label className="flex flex-col gap-1 text-xs">
            {t('concept')}
            <select value={conceptCode} onChange={event => setConceptCode(event.target.value)}
              className="rounded-xl border bg-card p-2" disabled={catalog.isFetching}>
              <option value="">{t('noTag')}</option>
              {catalog.data?.map(item => <option key={item.canonicalCode} value={item.canonicalCode}>{item.label}</option>)}
            </select>
            {catalog.isError && <button type="button" className="self-start underline" onClick={() => void catalog.refetch()}>{t('loadError')} {t('retry')}</button>}
          </label>}
          <textarea
            rows={2}
            value={qContent}
            onChange={(e) => setQContent(e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
            className="w-full p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-900 dark:text-[#E3E3E3] border-none outline-none resize-none"
          />

          {qType === 'TRUE_FALSE' ? (
            <div className="grid grid-cols-2 gap-2">
              {(['A', 'B'] as const).map((key) => {
                const isCorrect = correctKeys.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleCorrect(key)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border-none cursor-pointer ${
                      isCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-[#F0F4F8] dark:bg-[#131314] text-gray-700 dark:text-[#C4C7C5]'
                    }`}
                  >
                    <span>{key === 'A' ? 'Đúng' : 'Sai'}</span>
                    {isCorrect && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const isCorrect = correctKeys.includes(key);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500/40'
                        : 'bg-[#F0F4F8] dark:bg-[#131314]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(key)}
                      title="Đánh dấu đáp án đúng"
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 border-none cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5]'
                      }`}
                    >
                      {key}
                    </button>
                    <input
                      type="text"
                      value={options[key]}
                      onChange={(e) => setOptions((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Đáp án ${key}...`}
                      className="flex-1 min-w-0 bg-transparent text-xs text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreateInlineQuestion}
              className="px-4 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold border-none cursor-pointer disabled:opacity-50"
            >
              {isCreating ? 'Đang lưu câu hỏi...' : 'Thêm câu hỏi vào đề'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
