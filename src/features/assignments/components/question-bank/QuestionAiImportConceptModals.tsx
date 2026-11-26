'use client';

import React, { useState } from 'react';
import type {
  BankCourseOption,
  BankQuestionItem,
  QuestionConcept,
} from '../../schemas/question-bank.schema';
import {
  useBatchCreateQuestions,
  useCreateQuestionConcept,
  useDeleteQuestionConcept,
  useGenerateQuestionsAi,
  useImportQuestionsFile,
} from '../../hooks/useQuestionBankManager';

/* ============================================================================
 * 1. AI RAG Question Generator Modal (POST /questions/generate-ai + /batch)
 * ==========================================================================*/
interface AiGenerateModalProps {
  isOpen: boolean;
  concepts: QuestionConcept[];
  courses: BankCourseOption[];
  defaultCourseId?: string;
  defaultClassId?: string;
  onClose: () => void;
}

export function AiGenerateQuestionsModal({
  isOpen,
  concepts,
  courses,
  defaultCourseId,
  defaultClassId,
  onClose,
}: AiGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [questionType, setQuestionType] = useState<
    'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
  >('SINGLE_CHOICE');
  const [difficultyLevel, setDifficultyLevel] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [count, setCount] = useState(5);
  const [courseId, setCourseId] = useState(defaultCourseId && defaultCourseId !== 'ALL' ? defaultCourseId : '');
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<BankQuestionItem[]>([]);

  const generateMutation = useGenerateQuestionsAi();
  const batchSaveMutation = useBatchCreateQuestions();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (prompt.trim().length < 3) return;
    const res = await generateMutation.mutateAsync({
      prompt: prompt.trim(),
      questionType,
      difficultyLevel,
      bloomLevel: 'UNDERSTAND',
      count,
      courseId,
      classId: defaultClassId && defaultClassId !== 'ALL' ? defaultClassId : '',
      conceptIds: selectedConceptIds,
    });
    setDrafts(res);
  };

  const handleSaveAll = async () => {
    if (drafts.length === 0) return;
    await batchSaveMutation.mutateAsync(
      drafts.map((d) => ({
        content: d.content,
        questionType: d.questionType,
        difficultyLevel: d.difficultyLevel,
        bloomLevel: d.bloomLevel ?? 'UNDERSTAND',
        explanation: d.explanation ?? '',
        conceptIds: d.conceptIds.length > 0 ? d.conceptIds : selectedConceptIds,
        answers: d.answers.map((a) => ({
          content: a.content,
          isCorrect: Boolean(a.isCorrect),
        })),
        ...(courseId ? { courseId } : {}),
      }))
    );
    setDrafts([]);
    setPrompt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px] text-[#0B57D0] dark:text-[#A8C7FA]">
              auto_awesome
            </span>
            <div>
              <h2 className="text-lg font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                AI Sinh câu hỏi từ Học liệu & Khái niệm
              </h2>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                Sinh câu hỏi nháp và kiểm duyệt trước khi lưu vào ngân hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Mô tả chủ đề cần sinh câu hỏi (VD: Thuật toán Dijkstra, định tuyến OSPF...)"
            className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={questionType}
              onChange={(e) =>
                setQuestionType(e.target.value as typeof questionType)
              }
              className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-2 text-sm text-[#1F1F1F] dark:text-[#E3E3E3]"
            >
              <option value="SINGLE_CHOICE">1 đáp án</option>
              <option value="MULTIPLE_CHOICE">Nhiều đáp án</option>
              <option value="TRUE_FALSE">Đúng / Sai</option>
              <option value="ESSAY">Tự luận</option>
            </select>

            <select
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value as typeof difficultyLevel)}
              className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-2 text-sm text-[#1F1F1F] dark:text-[#E3E3E3]"
            >
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>

            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 5)))}
              className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-2 text-sm text-[#1F1F1F] dark:text-[#E3E3E3]"
              placeholder="Số câu"
            />

            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3 py-2 text-sm text-[#1F1F1F] dark:text-[#E3E3E3]"
            >
              <option value="">Tất cả môn</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {concepts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {concepts.slice(0, 20).map((c) => {
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
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
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

          <div className="flex justify-end">
            <button
              type="button"
              disabled={prompt.trim().length < 3 || generateMutation.isPending}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-full bg-[#D3E3FD] dark:bg-[#004A77] px-5 py-2.5 text-sm font-medium text-[#041E49] dark:text-[#C2E7FF] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              {generateMutation.isPending ? 'AI đang sinh câu hỏi...' : 'Sinh câu hỏi nháp'}
            </button>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                Kết quả AI ({drafts.length} câu)
              </h3>
              <button
                type="button"
                disabled={batchSaveMutation.isPending}
                onClick={handleSaveAll}
                className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2 text-sm font-medium text-white dark:text-[#062E6F]"
              >
                {batchSaveMutation.isPending ? 'Đang lưu...' : 'Lưu tất cả vào ngân hàng'}
              </button>
            </div>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {drafts.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] p-3.5 text-sm space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                      {idx + 1}. {q.content}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDrafts((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-[#B3261E] dark:text-[#F2B8B5]"
                    >
                      Bỏ
                    </button>
                  </div>
                  {q.answers.length > 0 && (
                    <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
                      Đáp án đúng:{' '}
                      {q.answers
                        .filter((a) => a.isCorrect)
                        .map((a) => a.content)
                        .join('; ') || 'Chưa đánh dấu'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. Import File Modal (POST /questions/import)
 * ==========================================================================*/
interface ImportQuestionsModalProps {
  isOpen: boolean;
  courses: BankCourseOption[];
  defaultCourseId?: string;
  onClose: () => void;
}

export function ImportQuestionsModal({
  isOpen,
  courses,
  defaultCourseId,
  onClose,
}: ImportQuestionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState(defaultCourseId && defaultCourseId !== 'ALL' ? defaultCourseId : '');
  const importMutation = useImportQuestionsFile();

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!file) return;
    await importMutation.mutateAsync({
      file,
      courseId: courseId || undefined,
      saveToBank: true,
    });
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              Nhập câu hỏi từ tệp
            </h2>
            <p className="text-xs text-[#444746] dark:text-[#C4C7C5]">
              Hỗ trợ định dạng .docx, .xlsx, .csv, .json, .txt
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
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-3.5 py-2.5 text-sm text-[#1F1F1F] dark:text-[#E3E3E3]"
          >
            <option value="">Không gắn môn cụ thể</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <label className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-[#F0F4F9] dark:bg-[#282A2C] p-8 text-center cursor-pointer hover:bg-[#E9EEF6] dark:hover:bg-[#333537] transition-colors">
            <span className="material-symbols-outlined text-[32px] text-[#0B57D0] dark:text-[#A8C7FA]">
              upload_file
            </span>
            <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              {file ? file.name : 'Chọn tệp câu hỏi để tải lên'}
            </span>
            <input
              type="file"
              accept=".docx,.xlsx,.csv,.json,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-[#444746] dark:text-[#C4C7C5]"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!file || importMutation.isPending}
            onClick={handleImport}
            className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-6 py-2.5 text-sm font-medium text-white dark:text-[#062E6F] disabled:opacity-50"
          >
            {importMutation.isPending ? 'Đang nhập...' : 'Tải lên & Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. Question Concepts Modal (GET/POST/DELETE /question-concepts)
 * ==========================================================================*/
interface ConceptManagerModalProps {
  isOpen: boolean;
  concepts: QuestionConcept[];
  onClose: () => void;
}

export function ConceptManagerModal({
  isOpen,
  concepts,
  onClose,
}: ConceptManagerModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createConceptMutation = useCreateQuestionConcept();
  const deleteConceptMutation = useDeleteQuestionConcept();

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createConceptMutation.mutateAsync({
      name: name.trim(),
      description: description.trim(),
    });
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
            Quản lý Khái niệm Tri thức
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#444746] dark:text-[#C4C7C5] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên khái niệm mới..."
            className="flex-1 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-2 text-sm text-[#1F1F1F] dark:text-[#E3E3E3] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!name.trim() || createConceptMutation.isPending}
            className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2 text-sm font-medium text-white dark:text-[#062E6F] disabled:opacity-50"
          >
            {createConceptMutation.isPending ? 'Đang thêm...' : 'Thêm'}
          </button>
        </form>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {concepts.length === 0 ? (
            <p className="text-sm text-[#444746] dark:text-[#C4C7C5] text-center py-6">
              Chưa có khái niệm nào.
            </p>
          ) : (
            concepts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-2.5"
              >
                <span className="text-sm font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                  {c.name}
                </span>
                <button
                  type="button"
                  disabled={deleteConceptMutation.isPending}
                  onClick={() => deleteConceptMutation.mutate(c.id)}
                  className="rounded-full p-1.5 text-[#B3261E] dark:text-[#F2B8B5] hover:bg-[#F9DEDC]/50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
