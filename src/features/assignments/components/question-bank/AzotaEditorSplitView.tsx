'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CustomSelect, EmptyState } from '@/components/shared';
import type { BloomLevel, DifficultyLevel } from '../../schemas/quiz.schema';
import {
  useBatchCreateQuestions,
  useClassCoursesForBank,
  useQuestionConcepts,
  useTeacherBankClasses,
} from '../../hooks/useQuestionBankManager';
import {
  AZOTA_SAMPLE_TEXT,
  applyAnswerAndDifficultyOverrides,
  parseAzotaQuestionsText,
  parseQuickAnswerKey,
} from '../../utils/azota-question-parser';
import { AzotaPreviewCard } from './AzotaPreviewCard';
import { PushToAssessmentModal } from './PushToAssessmentModal';

interface AzotaEditorSplitViewProps {
  userFullName?: string;
}

export function AzotaEditorSplitView({
  userFullName: _userFullName,
}: AzotaEditorSplitViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState<string>(AZOTA_SAMPLE_TEXT);
  const [quickKeyText, setQuickKeyText] = useState<string>('');
  const [answerOverrides, setAnswerOverrides] = useState<Record<number, string[]>>({});
  const [difficultyOverrides, setDifficultyOverrides] = useState<
    Record<number, DifficultyLevel>
  >({});

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [defaultDifficulty, setDefaultDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [defaultBloom, setDefaultBloom] = useState<BloomLevel>('UNDERSTAND');
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);

  const [savedQuestionIds, setSavedQuestionIds] = useState<string[]>([]);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);

  const { data: classes = [] } = useTeacherBankClasses();
  const { data: courses = [], isLoading: isLoadingCourses } =
    useClassCoursesForBank(selectedClassId);
  const { data: concepts = [] } = useQuestionConcepts();
  const batchSaveMutation = useBatchCreateQuestions();

  const parsedQuestions = useMemo(() => {
    const base = parseAzotaQuestionsText(rawText, {
      difficultyLevel: defaultDifficulty,
      bloomLevel: defaultBloom,
    });
    return applyAnswerAndDifficultyOverrides(
      base,
      answerOverrides,
      difficultyOverrides
    );
  }, [rawText, defaultDifficulty, defaultBloom, answerOverrides, difficultyOverrides]);

  const validQuestions = useMemo(
    () => parsedQuestions.filter((q) => q.isValid),
    [parsedQuestions]
  );
  const invalidCount = parsedQuestions.length - validQuestions.length;

  const handleApplyQuickKey = () => {
    if (!quickKeyText.trim()) return;
    const keyMap = parseQuickAnswerKey(quickKeyText);
    const count = Object.keys(keyMap).length;
    if (count === 0) {
      toast.error('Không nhận diện được đáp án. Ví dụ hợp lệ: 1A 2BC 3D');
      return;
    }
    setAnswerOverrides((prev) => ({ ...prev, ...keyMap }));
    toast.success(`Đã áp dụng đáp án nhanh cho ${count} câu hỏi`);
  };

  const handleToggleOption = (questionIndex: number, letter: string) => {
    const target = parsedQuestions.find((q) => q.index === questionIndex);
    if (!target) return;

    const currentCorrect = target.options
      .filter((o) => o.isCorrect)
      .map((o) => o.letter);

    const nextCorrect = currentCorrect.includes(letter)
      ? currentCorrect.filter((l) => l !== letter)
      : [...currentCorrect, letter];

    setAnswerOverrides((prev) => ({
      ...prev,
      [questionIndex]: nextCorrect,
    }));
  };

  const handleChangeDifficulty = (questionIndex: number, difficulty: DifficultyLevel) => {
    setDifficultyOverrides((prev) => ({
      ...prev,
      [questionIndex]: difficulty,
    }));
  };

  const handleTextFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setRawText(text);
      setAnswerOverrides({});
      setDifficultyOverrides({});
      toast.success(`Đã nạp nội dung từ ${file.name}`);
    } catch {
      toast.error('Không thể đọc tệp văn bản này.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveBatch = async (openPushAfter: boolean) => {
    if (validQuestions.length === 0) {
      toast.error('Chưa có câu hỏi hợp lệ nào để lưu.');
      return;
    }

    const created = await batchSaveMutation.mutateAsync(
      validQuestions.map((q) => ({
        content: q.content,
        questionType: q.questionType,
        difficultyLevel: q.difficultyLevel,
        bloomLevel: q.bloomLevel,
        explanation: q.explanation,
        conceptIds: selectedConceptIds,
        answers: q.options.map((opt) => ({
          content: opt.content,
          isCorrect: opt.isCorrect,
        })),
        ...(selectedCourseId !== 'ALL' ? { courseId: selectedCourseId } : {}),
        ...(selectedClassId !== 'ALL' ? { classId: selectedClassId } : {}),
      }))
    );

    const ids = created.map((item) => item.id).filter(Boolean);
    setSavedQuestionIds(ids);

    if (openPushAfter && ids.length > 0) {
      setIsPushModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] flex flex-col">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#1E1F20] px-4 sm:px-6 py-3.5 shadow-sm dark:shadow-none">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/assignments/question-bank"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#E9EEF6] dark:hover:bg-[#333537]"
              title="Quay lại Ngân hàng câu hỏi"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-medium">
                Soạn bộ câu hỏi kiểu Azota
              </h1>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                Dán hoặc gõ văn bản bên trái, kiểm tra & chọn đáp án trực tiếp bên phải
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {savedQuestionIds.length > 0 && (
              <button
                type="button"
                onClick={() => setIsPushModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-4 py-2 text-sm font-medium text-[#072711] dark:text-[#C4EED0]"
              >
                <span className="material-symbols-outlined text-[18px]">playlist_add</span>
                Đưa {savedQuestionIds.length} câu vừa lưu vào đề
              </button>
            )}

            <button
              type="button"
              disabled={validQuestions.length === 0 || batchSaveMutation.isPending}
              onClick={() => handleSaveBatch(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-4 py-2 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Lưu & Đưa vào đề
            </button>

            <button
              type="button"
              disabled={validQuestions.length === 0 || batchSaveMutation.isPending}
              onClick={() => handleSaveBatch(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2 text-sm font-medium text-white dark:text-[#062E6F] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {batchSaveMutation.isPending
                ? 'Đang lưu...'
                : `Lưu ${validQuestions.length} câu hợp lệ`}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: Raw Azota Text Editor */}
        <section className="flex flex-col rounded-3xl bg-white dark:bg-[#1E1F20] p-5 shadow-sm dark:shadow-none space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              1. Nhập / Dán văn bản đề thi
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRawText(AZOTA_SAMPLE_TEXT);
                  setAnswerOverrides({});
                  setDifficultyOverrides({});
                }}
                className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-1.5 text-xs font-medium hover:bg-[#E9EEF6] dark:hover:bg-[#333537]"
              >
                Chèn mẫu Azota
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-1.5 text-xs font-medium hover:bg-[#E9EEF6] dark:hover:bg-[#333537]"
              >
                Nạp file .txt
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleTextFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  setRawText('');
                  setAnswerOverrides({});
                  setDifficultyOverrides({});
                }}
                className="rounded-full bg-[#F9DEDC]/60 dark:bg-[#8C1D18]/40 px-3.5 py-1.5 text-xs font-medium text-[#B3261E] dark:text-[#F2B8B5]"
              >
                Xóa trắng
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3">
            <input
              type="text"
              value={quickKeyText}
              onChange={(e) => setQuickKeyText(e.target.value)}
              placeholder="Bảng đáp án nhanh (VD: 1B 2AB 3C 4D)..."
              className="flex-1 bg-transparent px-2 py-1 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyQuickKey}
              className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-4 py-1.5 text-xs font-medium text-white dark:text-[#062E6F]"
            >
              Áp dụng đáp án
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Dán nội dung đề thi vào đây...&#10;&#10;Câu 1: Nội dung câu hỏi...&#10;*A. Đáp án đúng&#10;B. Đáp án nhiễu&#10;C. Đáp án nhiễu&#10;D. Đáp án nhiễu"
            className="flex-1 min-h-[460px] w-full resize-none rounded-2xl bg-[#F0F4F9] dark:bg-[#131314] p-4 text-sm leading-relaxed text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
          />

          <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
            Mẹo: Bắt đầu mỗi câu bằng <code>Câu 1:</code> hoặc <code>1.</code> · Đánh dấu đáp án đúng bằng dấu <code>*</code> trước <code>A.</code> hoặc dòng <code>Đáp án: A</code> hoặc click trực tiếp bên phải.
          </p>
        </section>

        {/* RIGHT COLUMN: Batch Settings + Live Preview */}
        <section className="flex flex-col space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-5 shadow-sm dark:shadow-none space-y-3">
            <h2 className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              2. Cấu hình chung cho bộ câu hỏi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <CustomSelect
                value={selectedClassId}
                onChange={(val) => {
                  setSelectedClassId(val);
                  setSelectedCourseId('ALL');
                }}
                options={[
                  { value: 'ALL', label: 'Không gắn lớp' },
                  ...classes.map((c) => ({
                    value: c.id,
                    label: c.code ? `${c.code} · ${c.name}` : c.name,
                  })),
                ]}
              />

              <CustomSelect
                value={selectedCourseId}
                disabled={selectedClassId === 'ALL' || isLoadingCourses}
                onChange={setSelectedCourseId}
                options={[
                  {
                    value: 'ALL',
                    label:
                      selectedClassId === 'ALL'
                        ? 'Chọn lớp để gắn môn'
                        : isLoadingCourses
                          ? 'Đang tải môn...'
                          : 'Không gắn môn',
                  },
                  ...courses.map((c) => ({ value: c.id, label: c.title })),
                ]}
              />

              <CustomSelect
                value={defaultDifficulty}
                onChange={(val) => setDefaultDifficulty(val as DifficultyLevel)}
                options={[
                  { value: 'EASY', label: 'Mặc định: Dễ' },
                  { value: 'MEDIUM', label: 'Mặc định: Trung bình' },
                  { value: 'HARD', label: 'Mặc định: Khó' },
                ]}
              />

              <CustomSelect
                value={defaultBloom}
                onChange={(val) => setDefaultBloom(val as BloomLevel)}
                options={[
                  { value: 'REMEMBER', label: 'Bloom: Nhớ' },
                  { value: 'UNDERSTAND', label: 'Bloom: Hiểu' },
                  { value: 'APPLY', label: 'Bloom: Vận dụng' },
                  { value: 'ANALYZE', label: 'Bloom: Phân tích' },
                  { value: 'EVALUATE', label: 'Bloom: Đánh giá' },
                  { value: 'CREATE', label: 'Bloom: Sáng tạo' },
                ]}
              />
            </div>

            {concepts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pt-1">
                {concepts.map((c) => {
                  const active = selectedConceptIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setSelectedConceptIds((prev) =>
                          active ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                          : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5]'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 font-medium">
                Tổng nhận diện: {parsedQuestions.length} câu
              </span>
              <span className="rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-3 py-1 font-medium text-[#072711] dark:text-[#C4EED0]">
                Hợp lệ: {validQuestions.length}
              </span>
              {invalidCount > 0 && (
                <span className="rounded-full bg-[#F9DEDC] dark:bg-[#8C1D18] px-3 py-1 font-medium text-[#410E0B] dark:text-[#F9DEDC]">
                  Cần sửa: {invalidCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {parsedQuestions.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-[#1E1F20] p-10">
                <EmptyState
                  icon="edit_note"
                  title="Chưa có câu hỏi nào được nhận diện"
                  description="Nhập hoặc dán đề thi vào khung bên trái, hoặc bấm 'Chèn mẫu Azota' để xem cấu trúc chuẩn."
                />
              </div>
            ) : (
              parsedQuestions.map((q) => (
                <AzotaPreviewCard
                  key={q.index}
                  question={q}
                  onToggleOption={handleToggleOption}
                  onChangeDifficulty={handleChangeDifficulty}
                />
              ))
            )}
          </div>
        </section>
      </main>

      <PushToAssessmentModal
        isOpen={isPushModalOpen}
        questionIds={savedQuestionIds}
        classes={classes}
        defaultClassId={selectedClassId}
        onClose={() => setIsPushModalOpen(false)}
        onSuccess={() => setSavedQuestionIds([])}
      />
    </div>
  );
}
