'use client';

import React, { useEffect, useState } from 'react';
import {
  questionEditorFormSchema,
  type BankCourseOption,
  type BankQuestionItem,
  type QuestionConcept,
  type QuestionEditorFormValues,
} from '../../schemas/question-bank.schema';
import type { QuestionRequestDTO } from '../../schemas/quiz.schema';

interface QuestionEditorModalProps {
  isOpen: boolean;
  editingQuestion: BankQuestionItem | null;
  concepts: QuestionConcept[];
  courses: BankCourseOption[];
  defaultCourseId?: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitQuestion: (
    payload: QuestionRequestDTO & { courseId?: string; tags?: string[] }
  ) => Promise<void>;
}

const DEFAULT_ANSWERS = [
  { content: '', isCorrect: true },
  { content: '', isCorrect: false },
  { content: '', isCorrect: false },
  { content: '', isCorrect: false },
];

export function QuestionEditorModal({
  isOpen,
  editingQuestion,
  concepts,
  courses,
  defaultCourseId,
  isSubmitting,
  onClose,
  onSubmitQuestion,
}: QuestionEditorModalProps) {
  const [content, setContent] = useState('');
  const [questionType, setQuestionType] =
    useState<QuestionEditorFormValues['questionType']>('SINGLE_CHOICE');
  const [difficultyLevel, setDifficultyLevel] =
    useState<QuestionEditorFormValues['difficultyLevel']>('MEDIUM');
  const [bloomLevel, setBloomLevel] =
    useState<QuestionEditorFormValues['bloomLevel']>('UNDERSTAND');
  const [explanation, setExplanation] = useState('');
  const [courseId, setCourseId] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [conceptIds, setConceptIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Array<{ content: string; isCorrect: boolean }>>(
    DEFAULT_ANSWERS
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (editingQuestion) {
      setContent(editingQuestion.content);
      setQuestionType(editingQuestion.questionType);
      setDifficultyLevel(editingQuestion.difficultyLevel);
      setBloomLevel(editingQuestion.bloomLevel ?? 'UNDERSTAND');
      setExplanation(editingQuestion.explanation ?? '');
      setCourseId(editingQuestion.courseId ?? '');
      setTagsText(editingQuestion.tags.join(', '));
      setConceptIds(editingQuestion.conceptIds ?? []);
      setAnswers(
        editingQuestion.answers.length > 0
          ? editingQuestion.answers.map((a) => ({
              content: a.content,
              isCorrect: Boolean(a.isCorrect),
            }))
          : DEFAULT_ANSWERS
      );
    } else {
      setContent('');
      setQuestionType('SINGLE_CHOICE');
      setDifficultyLevel('MEDIUM');
      setBloomLevel('UNDERSTAND');
      setExplanation('');
      setCourseId(defaultCourseId && defaultCourseId !== 'ALL' ? defaultCourseId : '');
      setTagsText('');
      setConceptIds([]);
      setAnswers(DEFAULT_ANSWERS);
    }
  }, [isOpen, editingQuestion, defaultCourseId]);

  if (!isOpen) return null;

  const handleTypeChange = (nextType: QuestionEditorFormValues['questionType']) => {
    setQuestionType(nextType);
    if (nextType === 'TRUE_FALSE') {
      setAnswers([
        { content: 'Đúng', isCorrect: true },
        { content: 'Sai', isCorrect: false },
      ]);
    } else if (nextType === 'ESSAY') {
      setAnswers([]);
    } else if (answers.length < 2) {
      setAnswers(DEFAULT_ANSWERS);
    }
  };

  const handleToggleCorrect = (index: number) => {
    setAnswers((prev) =>
      prev.map((ans, i) => {
        if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
          return { ...ans, isCorrect: i === index };
        }
        return i === index ? { ...ans, isCorrect: !ans.isCorrect } : ans;
      })
    );
  };

  const handleAnswerContentChange = (index: number, nextContent: string) => {
    setAnswers((prev) =>
      prev.map((ans, i) => (i === index ? { ...ans, content: nextContent } : ans))
    );
  };

  const toggleConcept = (conceptId: string) => {
    setConceptIds((prev) =>
      prev.includes(conceptId) ? prev.filter((id) => id !== conceptId) : [...prev, conceptId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = questionEditorFormSchema.safeParse({
      content: content.trim(),
      questionType,
      difficultyLevel,
      bloomLevel,
      explanation: explanation.trim(),
      courseId,
      tagsText,
      conceptIds,
      answers: questionType === 'ESSAY' ? [] : answers,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Vui lòng kiểm tra lại thông tin câu hỏi.');
      return;
    }

    if (questionType !== 'ESSAY' && answers.length < 2) {
      setFormError('Cần tối thiểu 2 lựa chọn đáp án.');
      return;
    }

    if (questionType !== 'ESSAY' && !answers.some((a) => a.isCorrect)) {
      setFormError('Vui lòng chọn ít nhất 1 đáp án đúng.');
      return;
    }

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: QuestionRequestDTO & { courseId?: string; tags?: string[] } = {
      content: parsed.data.content,
      questionType: parsed.data.questionType,
      difficultyLevel: parsed.data.difficultyLevel,
      bloomLevel: parsed.data.bloomLevel,
      explanation: parsed.data.explanation || '',
      conceptIds: parsed.data.conceptIds,
      answers:
        questionType === 'ESSAY'
          ? []
          : answers.map((a) => ({
              content: a.content.trim(),
              isCorrect: a.isCorrect,
            })),
      ...(courseId ? { courseId } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    };

    await onSubmitQuestion(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
            </h2>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
              Lưu trực tiếp vào Ngân hàng câu hỏi hệ thống
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-2xl bg-[#F9DEDC] dark:bg-[#8C1D18] px-4 py-2.5 text-xs font-medium text-[#410E0B] dark:text-[#F9DEDC]">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
                Loại câu hỏi
              </label>
              <select
                value={questionType}
                onChange={(e) =>
                  handleTypeChange(e.target.value as QuestionEditorFormValues['questionType'])
                }
                className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
              >
                <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="ESSAY">Tự luận</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
                Độ khó
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) =>
                  setDifficultyLevel(
                    e.target.value as QuestionEditorFormValues['difficultyLevel']
                  )
                }
                className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
              >
                <option value="EASY">Dễ (EASY)</option>
                <option value="MEDIUM">Trung bình (MEDIUM)</option>
                <option value="HARD">Khó (HARD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
                Mức độ Bloom
              </label>
              <select
                value={bloomLevel}
                onChange={(e) =>
                  setBloomLevel(e.target.value as QuestionEditorFormValues['bloomLevel'])
                }
                className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
              >
                <option value="REMEMBER">Nhớ (Remember)</option>
                <option value="UNDERSTAND">Hiểu (Understand)</option>
                <option value="APPLY">Vận dụng (Apply)</option>
                <option value="ANALYZE">Phân tích (Analyze)</option>
                <option value="EVALUATE">Đánh giá (Evaluate)</option>
                <option value="CREATE">Sáng tạo (Create)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
              Nội dung câu hỏi *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Nhập đề bài câu hỏi..."
              className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] dark:focus:ring-[#A8C7FA]"
            />
          </div>

          {questionType !== 'ESSAY' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                  Danh sách đáp án (chọn đáp án đúng)
                </label>
                {questionType !== 'TRUE_FALSE' && (
                  <button
                    type="button"
                    onClick={() => setAnswers((prev) => [...prev, { content: '', isCorrect: false }])}
                    className="inline-flex items-center gap-1 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-3 py-1 text-xs font-medium text-[#041E49] dark:text-[#C2E7FF]"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    Thêm đáp án
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {answers.map((ans, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(index)}
                      title="Đánh dấu đáp án đúng"
                      className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                        ans.isCorrect
                          ? 'bg-[#C4EED0] text-[#072711] dark:bg-[#0F5223] dark:text-[#C4EED0]'
                          : 'bg-[#F0F4F9] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {ans.isCorrect ? 'check' : 'radio_button_unchecked'}
                      </span>
                    </button>
                    <input
                      value={ans.content}
                      onChange={(e) => handleAnswerContentChange(index, e.target.value)}
                      placeholder={`Đáp án ${index + 1}`}
                      className="flex-1 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
                    />
                    {questionType !== 'TRUE_FALSE' && answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="rounded-full p-2 text-[#B3261E] dark:text-[#F2B8B5] hover:bg-[#F9DEDC]/50"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
                Môn học (tuỳ chọn)
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
              >
                <option value="">Không gắn môn cụ thể</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `${c.code} · ${c.title}` : c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
                Thẻ (cách nhau bởi dấu phẩy)
              </label>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="VD: OSPF, Subnetting"
                className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
              />
            </div>
          </div>

          {concepts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1.5">
                Khái niệm tri thức liên kết
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]">
                {concepts.map((c) => {
                  const active = conceptIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleConcept(c.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                          : 'bg-white dark:bg-[#1E1F20] text-[#444746] dark:text-[#C4C7C5]'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#444746] dark:text-[#C4C7C5] mb-1">
              Giải thích đáp án
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Giải thích ngắn gọn lý do đáp án đúng..."
              className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
            />
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
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-6 py-2.5 text-sm font-medium text-white dark:text-[#062E6F] disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : editingQuestion ? 'Cập nhật' : 'Lưu câu hỏi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
