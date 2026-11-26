'use client';

import React, { useMemo, useState } from 'react';
import {
  AZOTA_SAMPLE_TEXT,
  applyAnswerAndDifficultyOverrides,
  batchCreateQuestions,
  parseAzotaQuestionsText,
  parseQuickAnswerKey,
} from '@/features/assignments';
import type { SelectedClassworkQuestion } from './QuizQuestionPickerPanel';

interface AzotaInlinePasteTabProps {
  classId?: string;
  courseId?: string;
  onQuestionsAdded: (added: SelectedClassworkQuestion[]) => void;
  onToast: (msg: string) => void;
}

export function AzotaInlinePasteTab({
  classId,
  courseId,
  onQuestionsAdded,
  onToast,
}: AzotaInlinePasteTabProps) {
  const [rawText, setRawText] = useState('');
  const [quickKey, setQuickKey] = useState('');
  const [answerOverrides, setAnswerOverrides] = useState<Record<number, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const parsed = useMemo(() => {
    const base = parseAzotaQuestionsText(rawText, {
      difficultyLevel: 'MEDIUM',
      bloomLevel: 'UNDERSTAND',
    });
    return applyAnswerAndDifficultyOverrides(base, answerOverrides, {});
  }, [rawText, answerOverrides]);

  const validSingleChoice = useMemo(
    () =>
      parsed.filter(
        (q) =>
          q.isValid &&
          q.options.length >= 2 &&
          q.options.filter((o) => o.isCorrect).length === 1
      ),
    [parsed]
  );

  const handleApplyQuickKey = () => {
    const map = parseQuickAnswerKey(quickKey);
    const count = Object.keys(map).length;
    if (count === 0) {
      onToast('Không nhận diện được chuỗi đáp án. Ví dụ: 1B 2A 3C');
      return;
    }
    setAnswerOverrides((prev) => ({ ...prev, ...map }));
    onToast(`Đã áp dụng đáp án nhanh cho ${count} câu`);
  };

  const handleSaveAndAdd = async () => {
    if (validSingleChoice.length === 0) {
      onToast('Chưa có câu hỏi trắc nghiệm 1 đáp án hợp lệ nào để thêm.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await batchCreateQuestions(
        validSingleChoice.map((q) => ({
          content: q.content,
          questionType: 'SINGLE_CHOICE',
          difficultyLevel: q.difficultyLevel,
          bloomLevel: q.bloomLevel,
          explanation: q.explanation,
          conceptIds: [],
          answers: q.options.map((opt) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
          })),
          ...(courseId ? { courseId } : {}),
          ...(classId ? { classId } : {}),
        }))
      );

      const mapped: SelectedClassworkQuestion[] = created.map((item) => ({
        id: item.id,
        content: item.content,
        type: 'SINGLE_CHOICE',
        difficultyLevel: item.difficultyLevel,
        point: 1,
        conceptCount: item.conceptIds.length,
        answers: item.answers.map((a) => ({
          content: a.content,
          isCorrect: Boolean(a.isCorrect),
        })),
      }));

      onQuestionsAdded(mapped);
      setRawText('');
      setQuickKey('');
      setAnswerOverrides({});
      onToast(`Đã lưu và thêm ${mapped.length} câu hỏi vào đề!`);
    } catch {
      onToast('Không thể lưu bộ câu hỏi lúc này. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
          Dán trực tiếp từ Word/Text theo mẫu Azota (<code>Câu 1: ...</code>, <code>*A. ...</code> hoặc <code>Đáp án: A</code>)
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRawText(AZOTA_SAMPLE_TEXT);
              setAnswerOverrides({});
            }}
            className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1.5 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
          >
            Chèn mẫu Azota
          </button>
          {rawText && (
            <button
              type="button"
              onClick={() => {
                setRawText('');
                setAnswerOverrides({});
              }}
              className="rounded-full bg-[#F9DEDC]/60 dark:bg-[#8C1D18]/40 px-3 py-1.5 text-xs font-medium text-[#B3261E] dark:text-[#F2B8B5] cursor-pointer"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#131314] p-2.5">
        <input
          type="text"
          value={quickKey}
          onChange={(e) => setQuickKey(e.target.value)}
          placeholder="Bảng đáp án nhanh (VD: 1B 2A 3C 4D)..."
          className="flex-1 bg-transparent px-2 text-xs text-[#1F1F1F] dark:text-[#E3E3E3] placeholder:text-[#747775] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleApplyQuickKey}
          className="rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3.5 py-1.5 text-xs font-semibold text-[#041E49] dark:text-[#C2E7FF] cursor-pointer"
        >
          Áp dụng đáp án
        </button>
      </div>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        rows={9}
        placeholder="Câu 1: Nội dung câu hỏi...&#10;*A. Đáp án đúng&#10;B. Đáp án nhiễu&#10;C. Đáp án nhiễu&#10;D. Đáp án nhiễu"
        className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#131314] p-4 text-xs sm:text-sm leading-relaxed text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-1 font-medium">
            Nhận diện: {parsed.length} câu
          </span>
          <span className="rounded-full bg-[#C4EED0] dark:bg-[#0F5223] px-3 py-1 font-medium text-[#072711] dark:text-[#C4EED0]">
            Hợp lệ (1 đáp án): {validSingleChoice.length}
          </span>
        </div>

        <button
          type="button"
          disabled={validSingleChoice.length === 0 || isSaving}
          onClick={handleSaveAndAdd}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2 text-xs font-semibold text-white dark:text-[#062E6F] disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          {isSaving
            ? 'Đang lưu...'
            : `Lưu & Thêm ${validSingleChoice.length} câu vào đề`}
        </button>
      </div>
    </div>
  );
}
