'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CustomSelect } from '@/components/shared';
import { uploadFile } from '@/lib/upload';
import {
  useCreateAssignment,
  useCourseLessons,
  createQuiz,
  addQuestionsBatchToQuiz,
  publishQuiz,
  createExam,
  addExamQuestion,
  publishExam,
} from '@/features/assignments';
import { postClassAnnouncement } from '../../services/class-detail.service';
import type { ClassCourse } from '../../schemas/class-detail.schema';
import {
  QuizQuestionPickerPanel,
  type SelectedClassworkQuestion,
} from './QuizQuestionPickerPanel';

export type ClassworkType = 'NOTICE' | 'ASSIGNMENT' | 'QUIZ' | 'EXAM';

interface CreateClassworkDrawerProps {
  isOpen: boolean;
  initialType: ClassworkType;
  classId: string;
  courses: ClassCourse[];
  onClose: () => void;
  onSuccess: (createdType: ClassworkType) => void;
  onToast: (msg: string) => void;
}

const TYPE_META: Record<
  ClassworkType,
  { label: string; icon: string; badgeClass: string; submitLabel: string }
> = {
  NOTICE: {
    label: 'Lời nhắn / Nhắc nhở',
    icon: 'campaign',
    badgeClass: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
    submitLabel: 'Đăng lời nhắn',
  },
  ASSIGNMENT: {
    label: 'Bài tập tự luận / Nộp tệp',
    icon: 'assignment',
    badgeClass: 'bg-blue-100 dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA]',
    submitLabel: 'Giao bài tập',
  },
  QUIZ: {
    label: 'Bài tập Trắc nghiệm (Quiz)',
    icon: 'quiz',
    badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
    submitLabel: 'Giao bài Quiz',
  },
  EXAM: {
    label: 'Bài kiểm tra / Đề thi',
    icon: 'school',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    submitLabel: 'Giao bài kiểm tra',
  },
};

export function CreateClassworkDrawer({
  isOpen,
  initialType,
  classId,
  courses,
  onClose,
  onSuccess,
  onToast,
}: CreateClassworkDrawerProps) {
  const [classworkType, setClassworkType] = useState<ClassworkType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || '');
  const [lessonId, setLessonId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState<number>(10);
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);

  // Attachment upload (NOTICE / ASSIGNMENT)
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz / Exam specific settings
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedClassworkQuestion[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [maxAttempts, setMaxAttempts] = useState<number>(2);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [examType, setExamType] = useState<'QUIZ' | 'MIDTERM' | 'FINAL'>('QUIZ');
  const [publishNow, setPublishNow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAssignmentMutation = useCreateAssignment(classId);
  const { data: lessons = [] } = useCourseLessons(courseId || undefined);

  useEffect(() => {
    if (isOpen) {
      setClassworkType(initialType);
      setCourseId((prev) => prev || courses[0]?.id || '');
    }
  }, [isOpen, initialType, courses]);

  useEffect(() => {
    if ((classworkType === 'QUIZ' || classworkType === 'EXAM') && selectedQuestions.length > 0) {
      const sum = selectedQuestions.reduce((acc, q) => acc + (Number(q.point) || 0), 0);
      if (sum > 0) setMaxScore(sum);
    }
  }, [classworkType, selectedQuestions]);

  if (!isOpen) return null;

  const meta = TYPE_META[classworkType];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const uploaded = await uploadFile(file, 'ilms/assignments');
      setAttachmentUrl(uploaded.url);
      setAttachmentName(uploaded.originalFilename || file.name);
      onToast(`Đã đính kèm tệp "${uploaded.originalFilename || file.name}".`);
    } catch {
      onToast('Không thể tải tệp đính kèm lên lúc này.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLessonId('');
    setDueDate('');
    setMaxScore(10);
    setAttachmentUrl('');
    setAttachmentName('');
    setSelectedQuestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Vui lòng nhập tiêu đề!');
      return;
    }
    if (isUploadingFile) {
      onToast('Vui lòng chờ tệp đính kèm tải lên hoàn tất.');
      return;
    }

    const effectiveCourseId = courseId || courses[0]?.id || classId;

    setIsSubmitting(true);
    try {
      if (classworkType === 'NOTICE') {
        const finalContent = [
          description.trim() || title.trim(),
          attachmentUrl ? `\n\n📎 Tài liệu đính kèm: [${attachmentName || 'Tệp'}](${attachmentUrl})` : '',
        ]
          .filter(Boolean)
          .join('');
        await postClassAnnouncement(classId, {
          title: title.trim(),
          content: finalContent,
        });
        onToast('Đã đăng lời nhắn cho lớp học!');
      } else if (classworkType === 'ASSIGNMENT') {
        await createAssignmentMutation.mutateAsync({
          courseId: effectiveCourseId,
          lessonId: lessonId || undefined,
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          maxScore: Number(maxScore) || 10,
          allowLateSubmission,
          fileAttachmentUrl: attachmentUrl || undefined,
        });
        onToast('Đã giao bài tập mới thành công!');
      } else if (classworkType === 'QUIZ') {
        if (selectedQuestions.length === 0) {
          onToast('Vui lòng chọn hoặc soạn ít nhất 1 câu hỏi cho bài Quiz.');
          setIsSubmitting(false);
          return;
        }
        const createdQuiz = await createQuiz({
          classId,
          title: title.trim(),
          description: description.trim() || '',
          durationMinutes: Number(durationMinutes) || 15,
          maxAttempts: Number(maxAttempts) || 1,
          shuffleQuestions,
          shuffleAnswers,
          startTime: new Date().toISOString(),
          endTime: dueDate
            ? new Date(dueDate).toISOString()
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        await addQuestionsBatchToQuiz(createdQuiz.id, {
          questions: selectedQuestions.map((q, idx) => ({
            questionId: q.id,
            point: Number(q.point) || 1,
            orderIndex: idx + 1,
          })),
        });
        if (publishNow) {
          await publishQuiz(createdQuiz.id).catch(() => {});
        }
        onToast(`Đã tạo và giao bài Quiz (${selectedQuestions.length} câu hỏi)!`);
      } else if (classworkType === 'EXAM') {
        if (selectedQuestions.length === 0) {
          onToast('Vui lòng chọn hoặc soạn ít nhất 1 câu hỏi cho bài kiểm tra.');
          setIsSubmitting(false);
          return;
        }
        const totalScore =
          selectedQuestions.reduce((acc, q) => acc + (Number(q.point) || 0), 0) ||
          Number(maxScore) ||
          10;
        const createdExam = await createExam(classId, {
          courseId: effectiveCourseId,
          title: title.trim(),
          description: description.trim() || '',
          examType,
          durationMinutes: Number(durationMinutes) || 45,
          totalScore,
          startTime: new Date().toISOString(),
          endTime: dueDate
            ? new Date(dueDate).toISOString()
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        for (let i = 0; i < selectedQuestions.length; i++) {
          const q = selectedQuestions[i];
          await addExamQuestion(createdExam.id, {
            questionId: q.id,
            score: Number(q.point) || 1,
            orderIndex: i + 1,
          });
        }
        if (publishNow) {
          await publishExam(createdExam.id).catch(() => {});
        }
        onToast(`Đã tạo và công bố bài kiểm tra (${selectedQuestions.length} câu hỏi)!`);
      }

      resetForm();
      onSuccess(classworkType);
      onClose();
    } catch {
      onToast('Không thể tạo nội dung giao bài lúc này. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#F0F4F8] dark:bg-[#131314] w-full max-w-6xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-none"
      >
        {/* Top Bar (Google Classroom Style) */}
        <div className="bg-white dark:bg-[#1E1F20] px-5 py-3.5 flex items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-[#C4C7C5] flex items-center justify-center border-none bg-transparent cursor-pointer"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${meta.badgeClass}`}>
              <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-[#E3E3E3] truncate">
                {meta.label}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-[#8E918F] hidden sm:block">
                Giao nội dung học tập cho lớp học theo chuẩn Google Classroom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/10 border-none bg-transparent cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFile}
              className="px-5 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all border-none cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>{meta.submitLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN (70%): Title, Instructions, Attachments, Question Builder */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    classworkType === 'NOTICE'
                      ? 'Ví dụ: Nhắc nhở chuẩn bị tài liệu trước buổi Lab tuần 5...'
                      : classworkType === 'QUIZ'
                        ? 'Ví dụ: Quiz 02 - Cấu trúc dữ liệu Cây nhị phân...'
                        : classworkType === 'EXAM'
                          ? 'Ví dụ: Kiểm tra giữa kỳ - Giải thuật & Đồ thị...'
                          : 'Ví dụ: Lab 03 - Cài đặt thuật toán Dijkstra...'
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                  {classworkType === 'NOTICE' ? 'Nội dung lời nhắn' : 'Hướng dẫn & Yêu cầu chi tiết'}
                </label>
                <textarea
                  rows={classworkType === 'QUIZ' || classworkType === 'EXAM' ? 3 : 5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả, yêu cầu định dạng bài nộp hoặc ghi chú cho học viên..."
                  className="w-full p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs sm:text-sm text-gray-900 dark:text-[#E3E3E3] border-none outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Attachment area for NOTICE / ASSIGNMENT */}
              {(classworkType === 'NOTICE' || classworkType === 'ASSIGNMENT') && (
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F0F4F8] dark:bg-[#282A2C] hover:opacity-85 text-xs font-semibold text-gray-700 dark:text-[#E3E3E3] border-none cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA]">
                        attach_file
                      </span>
                      <span>{isUploadingFile ? 'Đang tải tệp...' : 'Đính kèm tệp tài liệu'}</span>
                    </button>
                    {attachmentUrl && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                        <span className="material-symbols-outlined text-[15px]">description</span>
                        <span className="max-w-[180px] truncate">{attachmentName || 'Tệp đính kèm'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentUrl('');
                            setAttachmentName('');
                          }}
                          className="text-emerald-700 dark:text-emerald-300 hover:text-rose-600 border-none bg-transparent cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Embedded Question Builder for QUIZ / EXAM */}
              {(classworkType === 'QUIZ' || classworkType === 'EXAM') && (
                <QuizQuestionPickerPanel
                  selectedQuestions={selectedQuestions}
                  onChange={setSelectedQuestions}
                  onToast={onToast}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (30%): Google Classroom Metadata & Settings */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white dark:bg-[#1E1F20] rounded-3xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
                Cấu hình giao bài
              </h4>

              {/* Switch Type quickly */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                  Loại nội dung
                </label>
                <CustomSelect<ClassworkType>
                  value={classworkType}
                  onChange={setClassworkType}
                  options={[
                    { value: 'NOTICE', label: 'Lời nhắn / Nhắc nhở', icon: 'campaign' },
                    { value: 'ASSIGNMENT', label: 'Bài tập tự luận / Nộp tệp', icon: 'assignment' },
                    { value: 'QUIZ', label: 'Bài tập Trắc nghiệm (Quiz)', icon: 'quiz' },
                    { value: 'EXAM', label: 'Bài kiểm tra / Đề thi', icon: 'school' },
                  ]}
                  triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                />
              </div>

              {/* Linked Course */}
              {courses.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                    Môn học liên kết
                  </label>
                  <CustomSelect<string>
                    value={courseId}
                    onChange={(val) => {
                      setCourseId(val);
                      setLessonId('');
                    }}
                    options={courses.map((c) => ({
                      value: c.id,
                      label: c.code ? `${c.code} • ${c.name}` : c.name,
                      icon: 'book',
                    }))}
                    triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                  />
                </div>
              )}

              {/* Lesson Topic (for ASSIGNMENT) */}
              {classworkType === 'ASSIGNMENT' && lessons.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                    Chủ đề / Bài học
                  </label>
                  <CustomSelect<string>
                    value={lessonId}
                    onChange={setLessonId}
                    options={[
                      { value: '', label: 'Không gắn bài học cụ thể' },
                      ...lessons.map((l) => ({
                        value: l.id,
                        label: l.title,
                      })),
                    ]}
                    triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                  />
                </div>
              )}

              {/* Score */}
              {classworkType === 'NOTICE' ? (
                <div className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-600 dark:text-[#8E918F] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>Lời nhắn không tạo cột điểm trong Bảng điểm.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                      Thang điểm
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={0.5}
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                      Hạn nộp
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Assignment Late Submission */}
              {classworkType === 'ASSIGNMENT' && (
                <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                  <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                    Cho phép nộp muộn
                  </span>
                  <input
                    type="checkbox"
                    checked={allowLateSubmission}
                    onChange={(e) => setAllowLateSubmission(e.target.checked)}
                    className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                  />
                </label>
              )}

              {/* Quiz / Exam Specific Settings */}
              {(classworkType === 'QUIZ' || classworkType === 'EXAM') && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                        Thời lượng (phút)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={240}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                      />
                    </div>
                    {classworkType === 'QUIZ' ? (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                          Số lần làm tối đa
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={maxAttempts}
                          onChange={(e) => setMaxAttempts(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] block mb-1.5">
                          Loại kỳ thi
                        </label>
                        <CustomSelect<'QUIZ' | 'MIDTERM' | 'FINAL'>
                          value={examType}
                          onChange={setExamType}
                          options={[
                            { value: 'QUIZ', label: 'Kiểm tra' },
                            { value: 'MIDTERM', label: 'Giữa kỳ' },
                            { value: 'FINAL', label: 'Cuối kỳ' },
                          ]}
                          triggerClassName="h-10 text-xs font-medium rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none"
                        />
                      </div>
                    )}
                  </div>

                  {classworkType === 'QUIZ' && (
                    <>
                      <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                        <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                          Xáo trộn thứ tự câu hỏi
                        </span>
                        <input
                          type="checkbox"
                          checked={shuffleQuestions}
                          onChange={(e) => setShuffleQuestions(e.target.checked)}
                          className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                        <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                          Xáo trộn đáp án A/B/C/D
                        </span>
                        <input
                          type="checkbox"
                          checked={shuffleAnswers}
                          onChange={(e) => setShuffleAnswers(e.target.checked)}
                          className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                        />
                      </label>
                    </>
                  )}

                  <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] cursor-pointer">
                    <span className="text-xs font-medium text-gray-800 dark:text-[#E3E3E3]">
                      Công bố ngay cho học viên
                    </span>
                    <input
                      type="checkbox"
                      checked={publishNow}
                      onChange={(e) => setPublishNow(e.target.checked)}
                      className="w-4 h-4 accent-[#0B57D0] cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
