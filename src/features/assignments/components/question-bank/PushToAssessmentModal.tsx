'use client';

import React, { useEffect, useState } from 'react';
import { CustomSelect } from '@/components/shared';
import type { BankClassOption } from '../../schemas/question-bank.schema';
import {
  useClassTargetAssessments,
  usePushToAssessment,
} from '../../hooks/useQuestionBankManager';

interface PushToAssessmentModalProps {
  isOpen: boolean;
  questionIds: string[];
  classes: BankClassOption[];
  defaultClassId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PushToAssessmentModal({
  isOpen,
  questionIds,
  classes,
  defaultClassId,
  onClose,
  onSuccess,
}: PushToAssessmentModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedAssessmentKey, setSelectedAssessmentKey] = useState<string>('');
  const [pointPerQuestion, setPointPerQuestion] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;
    if (defaultClassId && defaultClassId !== 'ALL') {
      setSelectedClassId(defaultClassId);
    } else if (classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
    setSelectedAssessmentKey('');
  }, [isOpen, defaultClassId, classes]);

  const { data: assessments = [], isLoading } = useClassTargetAssessments(selectedClassId);
  const pushMutation = usePushToAssessment();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedAssessmentKey || questionIds.length === 0) return;
    const [kind, targetId] = selectedAssessmentKey.split('::') as ['QUIZ' | 'EXAM', string];
    if (!kind || !targetId) return;

    await pushMutation.mutateAsync({
      kind,
      targetId,
      questionIds,
      pointPerQuestion: Math.max(0.25, pointPerQuestion),
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              Đưa {questionIds.length} câu hỏi vào đề
            </h2>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
              Chọn lớp học và Quiz hoặc Bài kiểm tra đích
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1.5">
              Lớp học
            </label>
            <CustomSelect
              value={selectedClassId}
              onChange={(val) => {
                setSelectedClassId(val);
                setSelectedAssessmentKey('');
              }}
              options={
                classes.length > 0
                  ? classes.map((c) => ({
                      value: c.id,
                      label: c.code ? `${c.code} · ${c.name}` : c.name,
                    }))
                  : [{ value: '', label: 'Bạn chưa phụ trách lớp học nào' }]
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1.5">
              Quiz / Bài kiểm tra đích
            </label>
            <CustomSelect
              value={selectedAssessmentKey}
              disabled={!selectedClassId || isLoading || assessments.length === 0}
              onChange={setSelectedAssessmentKey}
              options={
                isLoading
                  ? [{ value: '', label: 'Đang tải danh sách đề...' }]
                  : assessments.length === 0
                    ? [{ value: '', label: 'Lớp này chưa có Quiz hoặc Bài kiểm tra' }]
                    : [
                        { value: '', label: 'Chọn Quiz hoặc Bài kiểm tra...' },
                        ...assessments.map((a) => ({
                          value: `${a.kind}::${a.id}`,
                          label: `[${a.kind === 'QUIZ' ? 'Quiz' : 'Bài kiểm tra'}] ${a.title}`,
                        })),
                      ]
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1.5">
              Điểm mỗi câu hỏi
            </label>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={pointPerQuestion}
              onChange={(e) => setPointPerQuestion(Number(e.target.value) || 1)}
              className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!selectedAssessmentKey || pushMutation.isPending}
            onClick={handleConfirm}
            className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-6 py-2.5 text-sm font-medium text-white dark:text-[#062E6F] disabled:opacity-50"
          >
            {pushMutation.isPending ? 'Đang thêm...' : 'Xác nhận thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}
