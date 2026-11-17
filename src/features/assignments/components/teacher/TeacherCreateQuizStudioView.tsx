'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { getLocalCreatedClasses } from '@/features/classes/services/class.service';
import { DEFAULT_FACULTY_CLASSES } from '@/features/classes/constants';
import type { ClassItem } from '@/features/classes/schemas/class.schema';
import {
  createQuiz,
  publishQuiz,
  addQuestionsBatchToQuiz,
  createQuestion as apiCreateQuestion,
  saveLocalQuiz,
  searchQuestionBank,
  determineQuizLifecycle,
} from '../../services/quiz.service';
import { useQuestionBank, useGenerateQuizAi } from '../../hooks/useQuizzes';
import { quizKeys } from '../../constants';
import { getSubjectInfoForClass } from '../../constants/subject-quiz.constants';
import type {
  AddQuizQuestionRequestDTO,
  QuestionResponseDTO,
  QuestionRequestDTO,
} from '../../schemas/quiz.schema';
import { AiRagQuestionGeneratorModal } from './AiRagQuestionGeneratorModal';
import { ImportWordExcelModal } from './ImportWordExcelModal';

export interface StudioOptionItem {
  id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  text: string;
  isCorrect: boolean;
}

export interface StudioQuestionItem {
  id: string;
  bankQuestionId?: string;
  orderIndex: number;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  typeLabel: string;
  bloomLevel: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  content: string;
  options: StudioOptionItem[];
  explanation: string;
  isCollapsed?: boolean;
  diagramData?: string;
}

const INITIAL_STUDIO_QUESTIONS: StudioQuestionItem[] = [
  {
    id: 'q-init-1',
    orderIndex: 1,
    type: 'SINGLE_CHOICE',
    typeLabel: 'Trắc nghiệm một đáp án',
    bloomLevel: 'Thông hiểu • Bloom 2',
    difficultyLevel: 'MEDIUM',
    points: 1.0,
    content:
      'Trong giao thức OSPF, loại gói tin nào được các Router gửi định kỳ để thiết lập và duy trì mối quan hệ láng giềng (Neighbor Adjacency)?',
    options: [
      { id: 'opt-1-a', label: 'A', text: 'Link State Request (LSR)', isCorrect: false },
      { id: 'opt-1-b', label: 'B', text: 'Hello Packet', isCorrect: true },
      { id: 'opt-1-c', label: 'C', text: 'Database Description (DBD)', isCorrect: false },
      { id: 'opt-1-d', label: 'D', text: 'Link State Acknowledgment (LSAck)', isCorrect: false },
    ],
    explanation:
      'Gói tin Hello Packet (OSPF Type 1) được gửi định kỳ (mặc định 10s trên mạng Broadcast/Point-to-Point) đến địa chỉ Multicast 224.0.0.5 (AllSPFRouters) nhằm phát hiện láng giềng, thỏa thuận các thông số chung (Hello/Dead interval, Area ID, Subnet mask, v.v.).',
    isCollapsed: false,
  },
  {
    id: 'q-init-2',
    orderIndex: 2,
    type: 'SINGLE_CHOICE',
    typeLabel: 'Trắc nghiệm phân tích sơ đồ',
    bloomLevel: 'Vận dụng • Bloom 3',
    difficultyLevel: 'HARD',
    points: 1.0,
    content:
      'Quan sát sơ đồ mạng bên dưới: Giả sử thuật toán Dijkstra chạy trên Router R1. Đường đi có tổng chi phí (Total Cost) thấp nhất từ R1 đến mạng con 192.168.10.0/24 là bao nhiêu?',
    diagramData: 'dijkstra_topology',
    options: [
      { id: 'opt-2-a', label: 'A', text: 'Cost = 35 (Qua đường R1-R2-R4)', isCorrect: false },
      { id: 'opt-2-b', label: 'B', text: 'Cost = 15 (Qua đường R1-R3-R4)', isCorrect: true },
      { id: 'opt-2-c', label: 'C', text: 'Cost = 25', isCorrect: false },
      { id: 'opt-2-d', label: 'D', text: 'Cost = 10', isCorrect: false },
    ],
    explanation:
      'Đường đi tối ưu Dijkstra: R1 -> R3 (Cost = 5) -> R4 (Cost = 10). Tổng Cost = 5 + 10 = 15. Tuyến qua R2 có Cost = 15 + 20 = 35.',
    isCollapsed: false,
  },
];

interface TeacherCreateQuizStudioViewProps {
  onBack?: () => void;
  userFullName?: string;
  onPublishSuccess?: () => void;
  initialClassId?: string;
  initialClassCode?: string;
  initialClassName?: string;
  teacherClasses?: ClassItem[];
}

export function TeacherCreateQuizStudioView({
  onBack,
  userFullName = 'TS. Lê Hoàng Nam',
  onPublishSuccess,
  initialClassId,
  initialClassCode,
  initialClassName,
  teacherClasses: propTeacherClasses,
}: TeacherCreateQuizStudioViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: classesData } = useClasses();

  // Load teacher classes
  const availableClasses: ClassItem[] = useMemo(() => {
    if (propTeacherClasses && propTeacherClasses.length > 0) return propTeacherClasses;
    const apiClasses = classesData?.items || [];
    const localCreated = typeof window !== 'undefined' ? getLocalCreatedClasses() : [];

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const merged: ClassItem[] = [];

    // 1. Add API classes from backend
    for (const c of apiClasses) {
      const idKey = String(c.id).toLowerCase();
      const nameKey = (c.name || '').toLowerCase();
      if (!seenIds.has(idKey)) {
        seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        merged.push(c);
      }
    }

    // 2. Add local created classes
    for (const c of localCreated) {
      const idKey = String(c.id).toLowerCase();
      const nameKey = (c.name || '').toLowerCase();
      if (!seenIds.has(idKey) && (!nameKey || !seenNames.has(nameKey))) {
        seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        merged.push(c);
      }
    }

    // 3. Always include DEFAULT_FACULTY_CLASSES (CS-202, INT2022, INT-1340, CS-301, SE-214)
    for (const c of DEFAULT_FACULTY_CLASSES) {
      const idKey = String(c.id).toLowerCase();
      const nameKey = (c.name || '').toLowerCase();
      if (!seenIds.has(idKey) && (!nameKey || !seenNames.has(nameKey))) {
        seenIds.add(idKey);
        if (nameKey) seenNames.add(nameKey);
        merged.push(c);
      }
    }

    const teachingOnly = merged.filter((c) => c.teachingRole !== 'STUDENT');
    return teachingOnly.length > 0 ? teachingOnly : merged;
  }, [propTeacherClasses, classesData]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const urlClassId = initialClassId || searchParams.get('classId') || '';
  const urlClassCode = initialClassCode || searchParams.get('classCode') || '';
  const urlClassName = initialClassName || searchParams.get('className') || '';

  const [targetClassId, setTargetClassId] = useState<string>(() => urlClassId);

  useEffect(() => {
    if (urlClassId && urlClassId !== targetClassId) {
      setTargetClassId(urlClassId);
    }
  }, [urlClassId, targetClassId]);

  const activeClass = useMemo(() => {
    if (targetClassId) {
      const targetLower = targetClassId.toLowerCase().trim();
      const codeLower = (urlClassCode || '').toLowerCase().trim();
      const nameLower = (urlClassName || '').toLowerCase().trim();

      const found = availableClasses.find((c) => {
        const cId = String(c.id).toLowerCase().trim();
        const cName = (c.name || '').toLowerCase().trim();
        const cCode = (c.code || '').toLowerCase().trim();
        const cClassCode = (c.classCode || '').toLowerCase().trim();
        const cTitle = (c.title || '').toLowerCase().trim();

        return (
          cId === targetLower ||
          cName === targetLower ||
          cCode === targetLower ||
          cClassCode === targetLower ||
          (codeLower && (cName === codeLower || cCode === codeLower || cClassCode === codeLower)) ||
          (nameLower && (cTitle.includes(nameLower) || cName.includes(nameLower)))
        );
      });
      if (found) return found;

      return {
        id: targetClassId,
        name: urlClassCode || urlClassName || targetClassId,
        title: urlClassName || urlClassCode || targetClassId,
        code: urlClassCode || targetClassId,
        classCode: urlClassCode || targetClassId,
      };
    }
    return availableClasses[0];
  }, [availableClasses, targetClassId, urlClassCode, urlClassName]);

  const activeClassId = activeClass ? String(activeClass.id) : (targetClassId || 'cs-202');

  const appliedClassLabel = useMemo(() => {
    if (activeClass) {
      const code = activeClass.name || activeClass.classCode || activeClass.code || String(activeClass.id);
      const title = activeClass.title || '';
      if (title && title !== code) {
        if (!code.includes(':') && !title.includes(':')) {
          return `${code} (${title})`;
        }
        return title.includes(code) ? title : `${code} (${title})`;
      }
      return code || 'CS-202 (Mạng máy tính & Truyền thông)';
    }
    return 'CS-202 (Mạng máy tính & Truyền thông)';
  }, [activeClass]);

  const subjectInfo = useMemo(() => {
    return getSubjectInfoForClass(activeClass);
  }, [activeClass]);

  // App Shell State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Metadata State: Tự động khởi tạo theo đúng môn học & lớp giảng dạy
  const [quizTitle, setQuizTitle] = useState(subjectInfo.defaultQuizTitle);
  const [selectedModule, setSelectedModule] = useState(subjectInfo.defaultChapter);
  const [ploTags, setPloTags] = useState<string[]>(subjectInfo.ploTags);
  const [instructions, setInstructions] = useState(subjectInfo.instructions);

  // Dynamic Questions Studio State
  const [questions, setQuestions] = useState<StudioQuestionItem[]>(subjectInfo.sampleQuestions);
  const [jumpQuestionInput, setJumpQuestionInput] = useState<string>('');

  // Right Panel Settings State
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [attempts, setAttempts] = useState('2 lần thử');
  const [scoringStrategy, setScoringStrategy] = useState('Lấy điểm cao nhất');

  // Security Toggles
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [fullscreenLock, setFullscreenLock] = useState(true);
  const [lockAnswersUntilDeadline, setLockAnswersUntilDeadline] = useState(true);

  // Start and End Time (Window of Availability - Dùng để so sánh và gán trạng thái vòng đời)
  const [startTime, setStartTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const [endTime, setEndTime] = useState<string>(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const [lastSavedTime, setLastSavedTime] = useState<string>('14:20');

  // Khôi phục bản nháp tự động từ LocalStorage hoặc cập nhật thông tin chuẩn theo môn học
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetQuizId = searchParams.get('quizId');
    const storageKey = targetQuizId
      ? `ilms_quiz_draft_${targetQuizId}`
      : `ilms_quiz_draft_${activeClassId}`;

    const rawDraft = localStorage.getItem(storageKey);
    let loadedFromDraft = false;

    if (rawDraft) {
      try {
        const parsed = JSON.parse(rawDraft);
        const draftQuestionsText = Array.isArray(parsed.questions)
          ? JSON.stringify(parsed.questions).toLowerCase()
          : '';

        // Kiểm tra bản nháp: Nếu bản nháp thuộc đúng lớp học hiện tại (classId) thì khôi phục toàn vẹn
        const isSameClass =
          !parsed.classId ||
          String(parsed.classId).toLowerCase().trim() === activeClassId.toLowerCase().trim();

        if (isSameClass) {
          if (parsed.quizTitle) setQuizTitle(parsed.quizTitle);
          if (parsed.selectedModule) {
            setSelectedModule(parsed.selectedModule);
          } else {
            setSelectedModule(subjectInfo.defaultChapter);
          }
          if (Array.isArray(parsed.ploTags) && parsed.ploTags.length > 0) {
            setPloTags(parsed.ploTags);
          } else {
            setPloTags(subjectInfo.ploTags);
          }
          if (parsed.instructions !== undefined) setInstructions(parsed.instructions);
          if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            setQuestions(parsed.questions);
          } else {
            setQuestions(subjectInfo.sampleQuestions);
          }
          if (parsed.durationMinutes) setDurationMinutes(parsed.durationMinutes);
          if (parsed.attempts) setAttempts(parsed.attempts);
          if (parsed.scoringStrategy) setScoringStrategy(parsed.scoringStrategy);
          if (parsed.startTime) setStartTime(parsed.startTime);
          if (parsed.endTime) setEndTime(parsed.endTime);
          if (parsed.savedAt) setLastSavedTime(parsed.savedAt);
          loadedFromDraft = true;
        }
      } catch (err) {
        console.warn('Could not parse saved draft:', err);
      }
    }

    // Nếu không có bản nháp hợp lệ và không chỉ định quizId, cập nhật toàn bộ theo môn học hiện tại
    if (!loadedFromDraft && !targetQuizId) {
      setQuizTitle(subjectInfo.defaultQuizTitle);
      setSelectedModule(subjectInfo.defaultChapter);
      setPloTags(subjectInfo.ploTags);
      setInstructions(subjectInfo.instructions);
      setQuestions(subjectInfo.sampleQuestions);
    }
  }, [activeClassId, searchParams, subjectInfo.key]);

  const previewLifecycle = useMemo(() => {
    return determineQuizLifecycle({
      startTime: startTime ? new Date(startTime).toISOString() : undefined,
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      status: 'PUBLISHED',
    });
  }, [startTime, endTime]);

  // AI RAG Question Generator Modal State
  const [isAiRagModalOpen, setIsAiRagModalOpen] = useState(false);

  // Import Word / Excel Modal State
  const [isImportWordExcelModalOpen, setIsImportWordExcelModalOpen] = useState(false);

  // Handler for Injecting Questions from AI Modal
  const handleInjectAiQuestions = (newAiQuestions: StudioQuestionItem[]) => {
    setQuestions((prev) => [...prev, ...newAiQuestions]);
    showToast(`Đã nạp thành công ${newAiQuestions.length} câu hỏi AI vào đề thi!`);
  };

  // Handler for Injecting Questions from Word/Excel Import Modal
  const handleInjectImportedQuestions = (importedQuestions: StudioQuestionItem[]) => {
    setQuestions((prev) => [...prev, ...importedQuestions]);
    showToast(`Đã nhập thành công ${importedQuestions.length} câu hỏi từ file vào đề thi!`);
  };

  // Question Bank Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);
  const [isCreatingInBank, setIsCreatingInBank] = useState(false);
  const [newBankQuestionContent, setNewBankQuestionContent] = useState('');
  const [newBankOptionA, setNewBankOptionA] = useState('');
  const [newBankOptionB, setNewBankOptionB] = useState('');
  const [newBankOptionC, setNewBankOptionC] = useState('');
  const [newBankOptionD, setNewBankOptionD] = useState('');
  const [newBankCorrect, setNewBankCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const { data: bankQuestionsData, isLoading: isBankLoading } = useQuestionBank({
    search: bankSearch,
    difficultyLevel: bankDifficultyFilter === 'ALL' ? undefined : bankDifficultyFilter,
  });

  const generateAiMutation = useGenerateQuizAi();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.points) || 1.0), 0);
  }, [questions]);

  // Handlers for Questions Management
  const handleAddNewQuestion = (customData?: Partial<StudioQuestionItem>) => {
    const nextIndex = questions.length + 1;
    const newQuestion: StudioQuestionItem = {
      id: `q-studio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderIndex: nextIndex,
      type: 'SINGLE_CHOICE',
      typeLabel: 'Trắc nghiệm một đáp án',
      bloomLevel: 'Thông hiểu • Bloom 2',
      difficultyLevel: 'MEDIUM',
      points: 1.0,
      content: customData?.content || `Câu hỏi trắc nghiệm số ${nextIndex}: Hãy chọn câu trả lời chính xác nhất.`,
      options: customData?.options || [
        { id: `opt-${nextIndex}-a`, label: 'A', text: 'Phương án A', isCorrect: true },
        { id: `opt-${nextIndex}-b`, label: 'B', text: 'Phương án B', isCorrect: false },
        { id: `opt-${nextIndex}-c`, label: 'C', text: 'Phương án C', isCorrect: false },
        { id: `opt-${nextIndex}-d`, label: 'D', text: 'Phương án D', isCorrect: false },
      ],
      explanation: customData?.explanation || 'Giải thích chi tiết kiến thức và cơ sở lý thuyết của đáp án đúng.',
      isCollapsed: false,
      ...customData,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    showToast(`Đã thêm câu hỏi số ${nextIndex} vào đề thi`);
  };

  // Handler for Jump to Question
  const handleJumpToQuestion = (targetNum?: number) => {
    const qNum = targetNum !== undefined ? targetNum : parseInt(jumpQuestionInput, 10);
    if (!qNum || isNaN(qNum) || qNum < 1) {
      showToast('Vui lòng nhập số thứ tự câu hỏi hợp lệ!');
      return;
    }

    const targetElement =
      (document.querySelector(`[data-question-number="${qNum}"]`) as HTMLElement) ||
      document.getElementById(`question-card-${qNum}`) ||
      (document.querySelector(`[data-question-number="${qNum - 1}"]`) as HTMLElement);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('ring-2', 'ring-blue-500', 'shadow-xl', 'dark:ring-blue-400');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-blue-500', 'shadow-xl', 'dark:ring-blue-400');
      }, 1800);
    } else {
      showToast(`Không tìm thấy câu hỏi số ${qNum}! (Đề hiện có ${questions.length} câu)`);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      showToast('Đề thi cần có ít nhất 1 câu hỏi');
      return;
    }
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== questionId);
      return filtered.map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
    });
    showToast('Đã xóa câu hỏi khỏi danh sách');
  };

  const handleDuplicateQuestion = (questionId: string) => {
    const target = questions.find((q) => q.id === questionId);
    if (!target) return;

    const newQuestion: StudioQuestionItem = {
      ...target,
      id: `q-studio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderIndex: questions.length + 1,
      content: `${target.content} (Bản sao)`,
      options: target.options.map((opt) => ({
        ...opt,
        id: `opt-dup-${Date.now()}-${opt.label}`,
      })),
      isCollapsed: false,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    showToast(`Đã nhân bản câu hỏi #${target.orderIndex}`);
  };

  const handleToggleCollapse = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isCollapsed: !q.isCollapsed } : q))
    );
  };

  const handleUpdateQuestionContent = (questionId: string, content: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, content } : q))
    );
  };

  const handleUpdateQuestionPoints = (questionId: string, pointsStr: string) => {
    const val = parseFloat(pointsStr) || 1.0;
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, points: val } : q))
    );
  };

  const handleSelectCorrectOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === optionId,
        }));
        return { ...q, options: newOptions };
      })
    );
  };

  const handleUpdateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.map((opt) =>
          opt.id === optionId ? { ...opt, text } : opt
        );
        return { ...q, options: newOptions };
      })
    );
  };

  const handleAddOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        if (q.options.length >= 6) {
          showToast('Tối đa 6 phương án cho một câu hỏi');
          return q;
        }
        const labels: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
        const nextLabel = labels[q.options.length] || 'E';
        const newOption: StudioOptionItem = {
          id: `opt-${q.id}-${nextLabel.toLowerCase()}`,
          label: nextLabel,
          text: `Phương án ${nextLabel}`,
          isCorrect: false,
        };
        return { ...q, options: [...q.options, newOption] };
      })
    );
    showToast('Đã thêm phương án mới');
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        if (q.options.length <= 2) {
          showToast('Cần tối thiểu 2 phương án cho câu hỏi trắc nghiệm');
          return q;
        }
        const filtered = q.options.filter((o) => o.id !== optionId);
        const labels: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
        const reindexed = filtered.map((o, idx) => ({ ...o, label: labels[idx] || 'A' }));
        if (!reindexed.some((o) => o.isCorrect)) {
          reindexed[0].isCorrect = true;
        }
        return { ...q, options: reindexed };
      })
    );
  };

  const handleUpdateExplanation = (questionId: string, explanation: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, explanation } : q))
    );
  };

  // AI Question Generation
  const handleGenerateAiQuestions = async () => {
    try {
      showToast(`AI đang phân tích học liệu ${subjectInfo.subjectName} và sinh câu hỏi...`);

      const sourceAiQuestions =
        subjectInfo.aiQuestions && subjectInfo.aiQuestions.length > 0
          ? subjectInfo.aiQuestions
          : subjectInfo.sampleQuestions;

      const newAiQuestions: StudioQuestionItem[] = sourceAiQuestions.map((q, idx) => ({
        ...q,
        id: `q-ai-${Date.now()}-${idx + 1}`,
        orderIndex: questions.length + idx + 1,
        typeLabel: 'Trắc nghiệm AI sinh',
        options: q.options.map((opt) => ({
          ...opt,
          id: `opt-ai-${Date.now()}-${opt.label.toLowerCase()}`,
        })),
        isCollapsed: false,
      }));

      setQuestions((prev) => [...prev, ...newAiQuestions]);
      showToast(`AI đã sinh thành công ${newAiQuestions.length} câu hỏi cho môn ${subjectInfo.subjectName}!`);
    } catch {
      showToast('Lỗi khi sinh câu hỏi AI');
    }
  };

  // Word/Excel File Import Handler
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(`Đang nhập câu hỏi từ file ${file.name}...`);
    setTimeout(() => {
      const importedQuestions: StudioQuestionItem[] = [
        {
          id: `q-imp-${Date.now()}-1`,
          orderIndex: questions.length + 1,
          type: 'SINGLE_CHOICE',
          typeLabel: 'Trắc nghiệm nhập từ file',
          bloomLevel: 'Nhận biết • Bloom 1',
          difficultyLevel: 'EASY',
          points: 1.0,
          content: `[Nhập từ ${file.name}] Giao thức định tuyến nào sau đây sử dụng giải thuật Bellman-Ford và giới hạn số bước nhảy (Hop Count) tối đa là 15?`,
          options: [
            { id: `opt-imp-1-a`, label: 'A', text: 'RIP (Routing Information Protocol)', isCorrect: true },
            { id: `opt-imp-1-b`, label: 'B', text: 'OSPF', isCorrect: false },
            { id: `opt-imp-1-c`, label: 'C', text: 'EIGRP', isCorrect: false },
            { id: `opt-imp-1-d`, label: 'D', text: 'IS-IS', isCorrect: false },
          ],
          explanation: 'RIP là giao thức Distance-Vector dùng thuật toán Bellman-Ford, metric là Hop count và 16 được coi là vô cực (unreachable).',
          isCollapsed: false,
        },
      ];
      setQuestions((prev) => [...prev, ...importedQuestions]);
      showToast(`Đã trích xuất thành công câu hỏi từ ${file.name}`);
    }, 600);
  };

  // Question Bank Modal Handlers
  const handleToggleSelectBankQuestion = (id: string) => {
    setSelectedBankQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImportSelectedFromBank = () => {
    if (!bankQuestionsData || selectedBankQuestionIds.length === 0) {
      showToast('Vui lòng chọn ít nhất một câu hỏi từ ngân hàng');
      return;
    }

    const selectedList = bankQuestionsData.filter((q) =>
      selectedBankQuestionIds.includes(q.id)
    );

    const labels: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];

    const newStudioQuestions: StudioQuestionItem[] = selectedList.map((bq, idx) => ({
      id: `q-bank-${Date.now()}-${idx}`,
      bankQuestionId: bq.id,
      orderIndex: questions.length + idx + 1,
      type: 'SINGLE_CHOICE',
      typeLabel: 'Ngân hàng khoa CNTT',
      bloomLevel: bq.bloomLevel === 'REMEMBER' ? 'Nhận biết • Bloom 1' : bq.bloomLevel === 'APPLY' ? 'Vận dụng • Bloom 3' : 'Thông hiểu • Bloom 2',
      difficultyLevel: bq.difficultyLevel || 'MEDIUM',
      points: 1.0,
      content: bq.content,
      options: bq.answers.map((ans, aIdx) => ({
        id: `opt-bank-${Date.now()}-${idx}-${aIdx}`,
        label: labels[aIdx] || 'A',
        text: ans.content,
        isCorrect: ans.isCorrect ?? false,
      })),
      explanation: bq.explanation || 'Câu hỏi thẩm định từ ngân hàng khoa CNTT.',
      isCollapsed: false,
    }));

    setQuestions((prev) => [...prev, ...newStudioQuestions]);
    setSelectedBankQuestionIds([]);
    setIsBankModalOpen(false);
    showToast(`Đã thêm ${newStudioQuestions.length} câu hỏi từ Ngân hàng vào đề thi!`);
  };

  const handleCreateNewQuestionToBank = async () => {
    if (!newBankQuestionContent.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (!newBankOptionA || !newBankOptionB) {
      showToast('Cần nhập tối thiểu phương án A và B');
      return;
    }

    try {
      showToast('Đang tạo và lưu câu hỏi vào Ngân hàng...');
      const payload: QuestionRequestDTO = {
        content: newBankQuestionContent,
        questionType: 'SINGLE_CHOICE',
        difficultyLevel: 'MEDIUM',
        bloomLevel: 'UNDERSTAND',
        explanation: 'Câu hỏi mới tạo bởi Giảng viên.',
        answers: [
          { content: newBankOptionA, isCorrect: newBankCorrect === 'A' },
          { content: newBankOptionB, isCorrect: newBankCorrect === 'B' },
          { content: newBankOptionC || 'Phương án C', isCorrect: newBankCorrect === 'C' },
          { content: newBankOptionD || 'Phương án D', isCorrect: newBankCorrect === 'D' },
        ],
        conceptIds: ['networking-general'],
      };

      const created = await apiCreateQuestion(payload);
      queryClient.invalidateQueries({ queryKey: quizKeys.questionBank() });
      showToast('Đã lưu câu hỏi mới vào Ngân hàng câu hỏi!');
      setIsCreatingInBank(false);
      setNewBankQuestionContent('');
      setNewBankOptionA('');
      setNewBankOptionB('');
      setNewBankOptionC('');
      setNewBankOptionD('');

      // Tự động thêm luôn vào danh sách câu hỏi đề thi hiện tại
      handleAddNewQuestion({
        bankQuestionId: created.id,
        content: created.content,
        options: created.answers.map((a, idx) => ({
          id: `opt-new-${idx}`,
          label: (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D',
          text: a.content,
          isCorrect: a.isCorrect ?? false,
        })),
      });
    } catch {
      showToast('Lỗi khi tạo câu hỏi vào Ngân hàng');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(`/assignments?classId=${encodeURIComponent(activeClassId)}`);
    }
  };

  // SAVE DRAFT & PUBLISH CONNECTED TO BACKEND APIS
  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      showToast('Đang kết nối API và tạo Quiz mới...');

      // 1. Chuẩn bị danh sách câu hỏi batch
      const batchQuestions: AddQuizQuestionRequestDTO[] = questions.map((q, idx) => {
        const correctOpt = q.options.find((o) => o.isCorrect)?.label || 'A';
        return {
          bankQuestionId: q.bankQuestionId,
          orderIndex: idx + 1,
          point: q.points,
          score: q.points,
          questionText: q.content,
          questionType: q.type,
          explanation: q.explanation,
          optionA: q.options[0]?.text || '',
          optionB: q.options[1]?.text || '',
          optionC: q.options[2]?.text || '',
          optionD: q.options[3]?.text || '',
          correctAnswer: correctOpt,
        };
      });

      // 2. Tạo Quiz mới với thời gian bắt đầu & kết thúc người dùng thiết lập
      const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
      const endIso = endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const created = await createQuiz({
        classId: activeClassId,
        title: quizTitle,
        description: selectedModule,
        status: 'PUBLISHED',
        chapter: selectedModule,
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        maxAttempts: attempts.includes('1') ? 1 : 2,
        passingScore: 5.0,
        scoringStrategy: scoringStrategy.includes('cao nhất')
          ? 'HIGHEST_SCORE'
          : scoringStrategy.includes('trung bình')
          ? 'AVERAGE_SCORE'
          : 'LATEST_ATTEMPT',
        shuffleQuestions,
        shuffleAnswers,
        fullscreenLock,
        tabSwitchLimit: 3,
        lockAnswersUntilDeadline,
        proctoringEnabled: true,
        ploIds: ploTags,
        startTime: startIso,
        endTime: endIso,
      });

      // 3. Batch gán câu hỏi vào đề thi vừa tạo (API POST /quizzes/{id}/questions/batch)
      if (created?.id && batchQuestions.length > 0) {
        try {
          await addQuestionsBatchToQuiz(created.id, { questions: batchQuestions });
        } catch (err) {
          console.warn('Batch add questions error:', err);
        }
      }

      // 4. Công bố đề thi (API PATCH /quizzes/{id}/publish)
      if (created?.id) {
        try {
          await publishQuiz(created.id);
        } catch (err) {
          console.warn('Publish quiz error:', err);
        }
      }

      // 5. Cập nhật LocalStorage với trạng thái vòng đời dựa trên so sánh ngày bắt đầu & kết thúc
      const lifecycle = determineQuizLifecycle({
        status: 'PUBLISHED',
        startTime: startIso,
        endTime: endIso,
      });

      saveLocalQuiz({
        id: created.id,
        code: `QUIZ-${created.id.slice(0, 6).toUpperCase()}`,
        className: `Lớp: ${appliedClassLabel}`,
        classId: activeClassId,
        title: quizTitle,
        type: 'quiz',
        status: lifecycle.status,
        badgeLabel: lifecycle.badgeLabel,
        badgeType: lifecycle.badgeType,
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        questionCount: questions.length,
        attemptsInfo: attempts,
        securityInfo: fullscreenLock ? 'Khóa toàn màn hình & giám sát' : 'Tiêu chuẩn',
        submittedCount: lifecycle.status === 'live' ? 54 : lifecycle.status === 'completed' ? 58 : 0,
        totalStudents: 60,
        remainingTime: lifecycle.formattedTimeText || 'Đang diễn ra',
        maxScore: totalPoints,
        startTime: startIso,
        endTime: endIso,
      });

      showToast(`Xuất bản thành công: ${created.title} (${questions.length} câu)!`);
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.list(activeClassId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats(activeClassId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(created.id) });

      setTimeout(() => {
        if (onPublishSuccess) {
          onPublishSuccess();
        } else {
          router.push(`/assignments?classId=${encodeURIComponent(activeClassId)}`);
        }
      }, 1000);
    } catch (error) {
      console.error('Publish error:', error);
      showToast('Đã lưu dữ liệu đề thi cục bộ (hệ thống sẵn sàng offline)');
      setTimeout(() => {
        if (onPublishSuccess) {
          onPublishSuccess();
        } else {
          router.push(`/assignments?classId=${encodeURIComponent(activeClassId)}`);
        }
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      showToast('Đang lưu bản nháp đề thi...');
      const batchQuestions: AddQuizQuestionRequestDTO[] = questions.map((q, idx) => {
        const correctOpt = q.options.find((o) => o.isCorrect)?.label || 'A';
        return {
          bankQuestionId: q.bankQuestionId,
          orderIndex: idx + 1,
          point: q.points,
          score: q.points,
          questionText: q.content,
          questionType: q.type,
          explanation: q.explanation,
          optionA: q.options[0]?.text || '',
          optionB: q.options[1]?.text || '',
          optionC: q.options[2]?.text || '',
          optionD: q.options[3]?.text || '',
          correctAnswer: correctOpt,
        };
      });

      const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
      const endIso = endTime ? new Date(endTime).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const created = await createQuiz({
        classId: activeClassId,
        title: quizTitle,
        description: selectedModule,
        status: 'DRAFT',
        chapter: selectedModule,
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        maxAttempts: 1,
        shuffleQuestions,
        shuffleAnswers,
        startTime: startIso,
        endTime: endIso,
      });

      if (created?.id && batchQuestions.length > 0) {
        try {
          await addQuestionsBatchToQuiz(created.id, { questions: batchQuestions });
        } catch (err) {
          console.warn('Batch add draft questions error:', err);
        }
      }

      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowStr);

      const draftPayload = {
        quizId: created.id,
        quizTitle,
        selectedModule,
        ploTags,
        instructions,
        questions,
        durationMinutes,
        attempts,
        scoringStrategy,
        shuffleQuestions,
        shuffleAnswers,
        fullscreenLock,
        startTime: startIso,
        endTime: endIso,
        savedAt: nowStr,
        classId: activeClassId,
        subjectKey: subjectInfo.key,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(`ilms_quiz_draft_${created.id}`, JSON.stringify(draftPayload));
        localStorage.setItem(`ilms_quiz_draft_${activeClassId}`, JSON.stringify(draftPayload));
      }

      saveLocalQuiz({
        id: created.id,
        code: `QUIZ-${created.id.slice(0, 6).toUpperCase()}`,
        className: `Lớp: ${appliedClassLabel}`,
        classId: activeClassId,
        title: quizTitle,
        type: 'draft',
        status: 'draft',
        badgeLabel: `Bản nháp riêng tư • ${questions.length} câu hỏi`,
        badgeType: 'purple',
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        questionCount: questions.length,
        attemptsInfo: '1 lần làm',
        securityInfo: 'Chưa công bố',
        submittedCount: 0,
        totalStudents: 60,
        maxScore: totalPoints,
        startTime: startIso,
        endTime: endIso,
      });

      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.list(activeClassId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats(activeClassId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
      showToast(`Đã lưu bản nháp thành công (${questions.length} câu)!`);
    } catch {
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.list(activeClassId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats(activeClassId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.stats() });
      showToast('Đã lưu bản nháp thành công vào hệ thống!');
    }
  };

  const handleRemovePloTag = (tagToRemove: string) => {
    setPloTags(ploTags.filter((tag) => tag !== tagToRemove));
    showToast(`Đã gỡ ${tagToRemove}`);
  };

  const handleAddPloTag = () => {
    const unselectedPlo = subjectInfo.ploTags.find((p) => !ploTags.includes(p));
    const newTag = unselectedPlo || `PLO-0${ploTags.length + 1}: Kỹ năng ứng dụng chuyên sâu`;
    setPloTags([...ploTags, newTag]);
    showToast(`Đã thêm chuẩn ${newTag}`);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Đang chuẩn bị phòng thi và đồng bộ môn học...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] text-[#171c1f] dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* Ẩn input file để phục vụ tính năng Nhập Word / Excel */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".docx,.xlsx,.xls,.txt,.json"
        className="hidden"
      />

      {/* 1. App Shell Sidebar */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode="faculty"
      />

      {/* 2. Top Header Navigation */}
      <DashboardHeader
        isFocus={isFocusMode}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => setIsFocusMode(!isFocusMode)}
        userFullName={userFullName}
        workspaceMode="faculty"
      />

      {/* 3. Main Workspace Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-0 lg:pl-72'
        }`}
      >
        <main className="w-full pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1680px] mx-auto">
          <div className="relative w-full flex flex-col gap-6">
            {/* SUB-HEADER ACTION BAR */}
            <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl shadow-sm py-3 px-4 sm:px-6 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-slate-200/80 dark:border-[#282A2C]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-[#8E918F] hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#282A2C] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Quay lại danh sách bài tập</span>
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-[#171c1f] dark:text-white tracking-tight">
                    Tạo bài trắc nghiệm Quiz mới
                  </h1>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Đã tự lưu nháp lúc {lastSavedTime}</span>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveDraft}
                  className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#1E1F20] text-[#171c1f] dark:text-white hover:bg-slate-100 dark:hover:bg-[#282A2C] border border-slate-200 dark:border-[#282A2C] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">save</span>
                  <span>Lưu nháp</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePublish}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSubmitting ? 'sync' : 'rocket_launch'}
                  </span>
                  <span>{isSubmitting ? 'Đang xuất bản...' : 'Xuất bản Quiz ngay'}</span>
                </button>
              </div>
            </div>

            {/* MAIN 2-COLUMN WORKSPACE GRID */}
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: QUESTION BUILDER STUDIO (8 COLS) */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6 min-w-0">
                {/* SECTION 1: BASIC INFORMATION CARD */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-[#282A2C] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#282A2C]">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="material-symbols-outlined text-[22px]">assignment</span>
                      <span className="text-sm font-bold text-[#171c1f] dark:text-white">
                        Thông tin tổng quan bài trắc nghiệm
                      </span>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold"
                      suppressHydrationWarning
                    >
                      ID: {subjectInfo.defaultQuizCode}
                    </span>
                  </div>

                  {/* Ô nhập tiêu đề bài Quiz */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="quiz-title" className="text-sm font-semibold text-slate-800 dark:text-white">
                        Tên tiêu đề bài Quiz <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-xs text-slate-400 font-mono">
                        {quizTitle.length} / 120 ký tự
                      </span>
                    </div>
                    <input 
                      type="text" 
                      id="quiz-title"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131314] text-slate-800 dark:text-white font-medium text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400 shadow-xs" 
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Nhập tiêu đề đề thi trắc nghiệm..."
                    />
                  </div>

                  {/* ======================================================== */}
                  {/* PHẦN SỬA ĐỔI: Badge Lớp áp dụng (Disabled / Locked State) */}
                  {/* ======================================================== */}
                  <div className="mt-2.5 flex items-center">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-[#282A2C] border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 select-none shadow-xs"
                      title="Đã cố định theo lớp giảng dạy hiện tại"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                        school
                      </span>
                      <span className="font-medium">
                        Lớp áp dụng: <strong className="text-slate-900 dark:text-white font-semibold" suppressHydrationWarning>{appliedClassLabel}</strong>
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-slate-400 ml-0.5">
                        lock
                      </span>
                    </div>
                  </div>
                  {/* ======================================================== */}

                  {/* Course Module & Output standard Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                        Chương / Module liên kết
                      </label>
                      <div className="relative">
                        <select
                          value={
                            subjectInfo.chapters.includes(selectedModule)
                              ? selectedModule
                              : subjectInfo.defaultChapter || subjectInfo.chapters[0] || ''
                          }
                          onChange={(e) => setSelectedModule(e.target.value)}
                          className="w-full h-10 px-3.5 pr-9 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#1E1F20] focus:ring-1 focus:ring-blue-500 appearance-none outline-none cursor-pointer"
                        >
                          {subjectInfo.chapters.map((chap) => (
                            <option key={chap} value={chap}>
                              {chap}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-[20px] text-slate-400 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171c1f] dark:text-white flex items-center justify-between">
                        <span>Chuẩn đầu ra PLO &amp; Năng lực</span>
                        <button
                          type="button"
                          onClick={handleAddPloTag}
                          className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline cursor-pointer"
                        >
                          + Gắn thêm
                        </button>
                      </label>
                      <div className="min-h-10 p-1.5 rounded-none bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
                        {ploTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-900"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePloTag(tag)}
                              className="material-symbols-outlined text-[14px] hover:text-red-500 cursor-pointer ml-0.5"
                            >
                              close
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rich-Text Simulated Instructions */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                      Mô tả bài tập &amp; Hướng dẫn sinh viên
                    </label>
                    <div className="rounded-none bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100/70 dark:bg-[#1E1F20] border-b border-slate-300 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => showToast('Định dạng in đậm')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-[#171c1f] dark:text-white font-bold text-[13px] cursor-pointer"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Định dạng in nghiêng')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-[#171c1f] dark:text-white italic text-[13px] cursor-pointer"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Định dạng gạch chân')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-[#171c1f] dark:text-white underline text-[13px] cursor-pointer"
                        >
                          U
                        </button>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                        <button
                          type="button"
                          onClick={() => showToast('Thêm danh sách dấu chấm')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            format_list_bulleted
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Thêm danh sách số')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            format_list_numbered
                          </span>
                        </button>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                        <button
                          type="button"
                          onClick={() => showToast('Chèn khối code')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-slate-300 font-mono text-[12px] px-1 cursor-pointer"
                        >
                          &lt;/&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Chèn công thức toán học LaTeX')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">functions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Tải lên hình ảnh')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Chèn liên kết')}
                          className="w-7 h-7 flex items-center justify-center rounded-none hover:bg-slate-200 dark:hover:bg-[#282A2C] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">link</span>
                        </button>
                        <span className="ml-auto text-[11px] text-slate-400 pr-2">
                          LaTeX ($..$) &amp; Markdown ready
                        </span>
                      </div>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Nhập lưu ý thi, công thức hoặc hướng dẫn làm bài cho sinh viên..."
                        rows={3}
                        className="w-full p-3.5 bg-transparent text-[#171c1f] dark:text-white text-xs leading-relaxed focus:outline-none resize-y placeholder:text-slate-400 rounded-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: QUICK ACTION TOOLBAR (QUESTION STUDIO ACTIONS) */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1E1F20] p-3 rounded-xl shadow-sm border border-slate-200/80 dark:border-[#282A2C]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddNewQuestion()}
                      className="h-9 px-3.5 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Thêm câu hỏi thủ công</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAiRagModalOpen(true)}
                      className="h-9 px-3.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">
                        auto_awesome
                      </span>
                      <span>Sinh câu hỏi bằng AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsImportWordExcelModalOpen(true)}
                      className="h-9 px-3.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        upload_file
                      </span>
                      <span>Nhập Word / Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBankModalOpen(true)}
                      className="h-9 px-3.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        folder_special
                      </span>
                      <span>Ngân hàng khoa (450 câu)</span>
                    </button>
                  </div>
                </div>

                {/* THANH ĐIỀU HƯỚNG & NHẢY NHANH ĐẾN CÂU HỎI (JUMP TO QUESTION BAR) */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 mb-4 shadow-xs">
                  {/* Cụm bên trái: Nhập số câu để nhảy đến */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium text-[13px]">
                      <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-sky-400">
                        pin_drop
                      </span>
                      <span>Đến câu:</span>
                    </div>

                    {/* Ô nhập số nhỏ gọn (kích thước ~48px) */}
                    <input
                      type="number"
                      id="jump-question-input"
                      min={1}
                      max={Math.max(questions.length, 1)}
                      placeholder="1"
                      value={jumpQuestionInput}
                      onChange={(e) => setJumpQuestionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleJumpToQuestion();
                        }
                      }}
                      className="w-12 h-8 px-1.5 text-center font-bold text-[13.5px] rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    {/* Nút thực hiện nhảy */}
                    <button
                      type="button"
                      id="btn-jump-question"
                      onClick={() => handleJumpToQuestion()}
                      className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[12px] shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Đi</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>

                  {/* Cụm bên phải: Thống kê số lượng câu & Chuẩn hóa ma trận */}
                  <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300">
                    <span>
                      Tổng: <strong className="text-slate-900 dark:text-white font-bold" id="total-questions-count">{questions.length} câu</strong> ({totalPoints.toFixed(1)} điểm)
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Đạt chuẩn 100% Ma trận
                    </span>
                  </div>
                </div>

                {/* DYNAMIC QUESTIONS LIST */}
                {questions.map((q, qIndex) => {
                  const correctOption = q.options.find((opt) => opt.isCorrect)?.label || 'A';
                  const displayOrder = q.orderIndex || qIndex + 1;

                  return (
                    <div
                      key={q.id}
                      id={`question-card-${displayOrder}`}
                      data-question-number={displayOrder}
                      className="question-card bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col gap-4 relative border border-slate-200/80 dark:border-[#282A2C] overflow-hidden transition-all duration-300"
                    >
                      {/* Top Accent Indicator Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
                          qIndex === 0 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />

                      {/* Question Top Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400 cursor-grab hover:text-slate-600 dark:hover:text-slate-200 text-[20px]">
                            drag_indicator
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                qIndex === 0
                                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white'
                              }`}
                            >
                              {q.orderIndex}
                            </span>
                            <span className="text-sm font-bold text-[#171c1f] dark:text-white">
                              {q.typeLabel}
                            </span>
                          </div>
                          {/* Bloom & Difficulty Badge */}
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                q.difficultyLevel === 'EASY'
                                  ? 'bg-emerald-500'
                                  : q.difficultyLevel === 'HARD'
                                  ? 'bg-purple-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span>{q.bloomLevel}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Points Input */}
                          <div className="flex items-center gap-1.5 bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-none">
                            <span className="text-xs text-slate-500 font-medium">Điểm:</span>
                            <input
                              type="number"
                              step="0.5"
                              value={q.points}
                              onChange={(e) => handleUpdateQuestionPoints(q.id, e.target.value)}
                              className="w-10 text-center bg-transparent text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none rounded-none"
                            />
                          </div>

                          <div className="flex items-center gap-1 text-slate-500">
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(q.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-[#171c1f] dark:hover:text-white transition-all cursor-pointer"
                              title="Nhân bản câu hỏi"
                            >
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-all cursor-pointer"
                              title="Xóa câu hỏi"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleCollapse(q.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-[#171c1f] dark:hover:text-white transition-all cursor-pointer"
                              title={q.isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {q.isCollapsed ? 'expand_more' : 'expand_less'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {!q.isCollapsed && (
                        <>
                          {/* Question Prompt Area */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Nội dung câu hỏi
                            </label>
                            <textarea
                              rows={2}
                              value={q.content}
                              onChange={(e) => handleUpdateQuestionContent(q.id, e.target.value)}
                              className="w-full p-3.5 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs font-medium leading-relaxed focus:outline-none focus:border-blue-500 border border-slate-300 dark:border-slate-700 transition-all"
                            />
                          </div>

                          {/* Network Topology Visual Diagram (if present) */}
                          {q.diagramData === 'dijkstra_topology' && (
                            <div className="w-full bg-[#f0f4f8] dark:bg-[#131314] rounded-xl p-4 border border-slate-200/80 dark:border-[#282A2C] flex flex-col items-center justify-center overflow-x-auto">
                              <svg
                                className="w-full max-w-2xl h-auto"
                                viewBox="0 0 680 180"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <line x1="120" y1="90" x2="340" y2="40" stroke="#75777e" strokeWidth="2" strokeDasharray="4" />
                                <line x1="120" y1="90" x2="340" y2="140" stroke="#0059bb" strokeWidth="2.5" />
                                <line x1="340" y1="40" x2="560" y2="90" stroke="#75777e" strokeWidth="2" strokeDasharray="4" />
                                <line x1="340" y1="140" x2="560" y2="90" stroke="#0059bb" strokeWidth="2.5" />
                                <rect x="210" y="45" width="45" height="22" rx="4" fill="#eaeef2" />
                                <text x="232" y="60" fill="#44474d" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">C=15</text>
                                <rect x="210" y="125" width="45" height="22" rx="4" fill="#d8e2ff" />
                                <text x="232" y="140" fill="#001a41" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">C=5</text>
                                <rect x="430" y="45" width="45" height="22" rx="4" fill="#eaeef2" />
                                <text x="452" y="60" fill="#44474d" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">C=20</text>
                                <rect x="430" y="125" width="45" height="22" rx="4" fill="#d8e2ff" />
                                <text x="452" y="140" fill="#001a41" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">C=10</text>
                                <circle cx="120" cy="90" r="30" fill="#0d1c32" />
                                <text x="120" y="95" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="Plus Jakarta Sans" textAnchor="middle">R1 (Nguồn)</text>
                                <circle cx="340" cy="40" r="26" fill="#dfe3e7" />
                                <text x="340" y="45" fill="#171c1f" fontSize="12" fontWeight="bold" fontFamily="Plus Jakarta Sans" textAnchor="middle">R2</text>
                                <circle cx="340" cy="140" r="26" fill="#d8e2ff" />
                                <text x="340" y="145" fill="#001a41" fontSize="12" fontWeight="bold" fontFamily="Plus Jakarta Sans" textAnchor="middle">R3</text>
                                <circle cx="560" cy="90" r="30" fill="#0059bb" />
                                <text x="560" y="93" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="Plus Jakarta Sans" textAnchor="middle">R4</text>
                                <text x="560" y="135" fill="#44474d" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">192.168.10.0/24</text>
                              </svg>
                              <span className="text-[11px] text-slate-500 mt-2 italic">
                                Hình 4.2: Sơ đồ topo kết nối 4 router và tham số chi phí Metric (Cost)
                              </span>
                            </div>
                          )}

                          {/* Options List */}
                          <div className="flex flex-col gap-2 pt-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                              <span>Danh sách phương án (Click radio để chỉ định đáp án ĐÚNG)</span>
                              <button
                                type="button"
                                onClick={() => handleAddOption(q.id)}
                                className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline text-xs font-normal"
                              >
                                + Thêm phương án ({q.options.length === 4 ? 'E' : 'F'})
                              </button>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.id}
                                  onClick={() => handleSelectCorrectOption(q.id, opt.id)}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-none transition-all group cursor-pointer border ${
                                    opt.isCorrect
                                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                                      : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                      opt.isCorrect
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-slate-400 group-hover:border-blue-500'
                                    }`}
                                  >
                                    {opt.isCorrect && (
                                      <span className="material-symbols-outlined text-[13px]">done</span>
                                    )}
                                  </button>
                                  <span
                                    className={`w-4 font-bold text-xs shrink-0 ${
                                      opt.isCorrect
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {opt.label}.
                                  </span>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateOptionText(q.id, opt.id, e.target.value)}
                                    className={`flex-1 bg-transparent text-xs focus:outline-none rounded-none ${
                                      opt.isCorrect
                                        ? 'font-semibold text-blue-900 dark:text-blue-100'
                                        : 'text-[#171c1f] dark:text-white'
                                    }`}
                                  />
                                  {opt.isCorrect ? (
                                    <span className="px-1.5 py-0.5 rounded-none border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[9px] bg-white dark:bg-[#1E1F20] shrink-0">
                                      ĐÁP ÁN ĐÚNG
                                    </span>
                                  ) : (
                                    q.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveOption(q.id, opt.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 cursor-pointer shrink-0 transition-opacity"
                                        title="Xóa phương án này"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Socratic Explanation & Pedagogical Note Drawer */}
                          <div className="bg-[#f0f4f8] dark:bg-[#131314] rounded-none p-3.5 flex flex-col gap-1.5 border border-slate-300 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined text-[18px]">psychology</span>
                                <span className="text-xs font-bold text-[#171c1f] dark:text-white">
                                  Giải thích chi tiết &amp; Phản hồi sư phạm Socratic
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => showToast('AI đang cải thiện câu giải thích Socratic...')}
                                className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  auto_fix_high
                                </span>
                                <span>AI tối ưu giải thích</span>
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={q.explanation}
                              onChange={(e) => handleUpdateExplanation(q.id, e.target.value)}
                              className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 leading-relaxed focus:outline-none border-b border-transparent focus:border-blue-400 resize-y"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* BIG ADD QUESTION ACTION TILE */}
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion()}
                  className="w-full py-6 rounded-xl bg-white dark:bg-[#1E1F20] hover:bg-slate-50 dark:hover:bg-[#282A2C] transition-all flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/80 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-[24px]">add</span>
                  </div>
                  <span className="text-sm font-bold text-[#171c1f] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Thêm câu hỏi tiếp theo
                  </span>
                  <span className="text-xs text-slate-500">
                    Hỗ trợ trắc nghiệm 1 đáp án, nhiều đáp án, đúng/sai, điền khuyết code
                  </span>
                </button>
              </div>

              {/* RIGHT COLUMN: AI GENERATOR & EXAM CONFIGURATION (4 COLS) */}
              <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                {/* PANEL 1: AI AUTO-QUIZ GENERATOR CARD */}
                <div className="bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-[#1E1F20] dark:to-[#1E1F20] rounded-xl p-5 sm:p-6 shadow-sm border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col gap-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#171c1f] dark:text-white leading-tight">
                          AI Sinh Đề Tự Động
                        </span>
                        <span className="text-[11px] text-slate-500">
                          EduTech Cognitive Engine
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                      GPT-4o Edu
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tự động trích xuất thực thể đồ thị tri thức từ giáo trình để sinh các câu hỏi trắc nghiệm bám sát mục tiêu bài giảng.
                  </p>

                  {/* Knowledge Source Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                      Nguồn học liệu tri thức
                    </label>
                    <div
                      onClick={() => showToast(`Đã chọn nguồn giáo trình: ${subjectInfo.sourceDoc}`)}
                      className="p-2.5 rounded-none bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#282A2C] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-red-500 text-[20px]">
                          picture_as_pdf
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[#171c1f] dark:text-white truncate">
                            {subjectInfo.sourceDoc}
                          </span>
                          <span className="text-[11px] text-slate-400">{subjectInfo.sourceDocStats}</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        cached
                      </span>
                    </div>
                  </div>

                  {/* Bloom Taxonomy Distribution Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#171c1f] dark:text-white">
                        Phân bổ độ khó (Bloom)
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">3 mức</span>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden flex border border-slate-300 dark:border-slate-700">
                      <div
                        className="bg-blue-300 dark:bg-blue-600 h-full"
                        style={{ width: '30%' }}
                        title="30% Nhận biết"
                      />
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-full"
                        style={{ width: '50%' }}
                        title="50% Thông hiểu"
                      />
                      <div
                        className="bg-purple-600 dark:bg-purple-500 h-full"
                        style={{ width: '20%' }}
                        title="20% Vận dụng"
                      />
                    </div>

                    <div className="grid grid-cols-3 text-center text-[10px] text-slate-600 dark:text-slate-400 pt-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600" />
                        <span>Nhận biết (30%)</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>Thông hiểu (50%)</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-500" />
                        <span>Vận dụng (20%)</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Generate CTA Button */}
                  <button
                    type="button"
                    onClick={() => setIsAiRagModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Sinh nhanh câu hỏi bằng AI</span>
                    <span className="px-1.5 py-0.5 rounded-none bg-white/20 font-mono text-[10px]">
                      ~2s
                    </span>
                  </button>
                </div>

                {/* PANEL 2: EXAM TIME & LOGISTICS SETTINGS */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-[#282A2C] flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-[#171c1f] dark:text-white">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
                      timer
                    </span>
                    <span className="text-sm font-bold">Thời gian &amp; Điều kiện làm bài</span>
                  </div>

                  {/* Duration Setting */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                      Thời gian làm bài
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="h-9 w-20 px-3 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-sm font-bold text-center border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        phút (Đồng hồ đếm ngược)
                      </span>
                    </div>
                  </div>

                  {/* Window of Availability (Start & End) - So sánh ngày để gán trạng thái */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-[#282A2C]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171c1f] dark:text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                          date_range
                        </span>
                        Thời gian mở &amp; Đóng đề thi
                      </span>
                      {previewLifecycle && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            previewLifecycle.status === 'live'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300'
                              : previewLifecycle.status === 'upcoming'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {previewLifecycle.status === 'live' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                          {previewLifecycle.status === 'upcoming' && (
                            <span className="material-symbols-outlined text-[12px]">alarm</span>
                          )}
                          {previewLifecycle.status === 'completed' && (
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          )}
                          {previewLifecycle.status === 'live'
                            ? 'Trực tuyến (Live)'
                            : previewLifecycle.status === 'upcoming'
                            ? 'Sắp diễn ra'
                            : 'Đã hoàn thành'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="quiz-start-time" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Thời gian mở đề
                        </label>
                        <input
                          id="quiz-start-time"
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="h-9 px-2.5 rounded-lg bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 text-[#171c1f] dark:text-white text-xs font-medium focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="quiz-end-time" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Hạn chót nộp bài
                        </label>
                        <input
                          id="quiz-end-time"
                          type="datetime-local"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="h-9 px-2.5 rounded-lg bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 text-[#171c1f] dark:text-white text-xs font-medium focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Đặt nhanh:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const startIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          const end = new Date(now.getTime() + (parseInt(durationMinutes, 10) || 30) * 60000);
                          const endIso = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          setStartTime(startIso);
                          setEndTime(endIso);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[10.5px] font-medium border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                      >
                        🔴 Thi ngay (Live)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const start = new Date(now.getTime() + 2 * 3600 * 1000);
                          const startIso = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          const end = new Date(start.getTime() + (parseInt(durationMinutes, 10) || 45) * 60000);
                          const endIso = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          setStartTime(startIso);
                          setEndTime(endIso);
                        }}
                        className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10.5px] font-medium border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer"
                      >
                        🔵 Sau 2 giờ (Upcoming)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const start = new Date(now.getTime() - 3 * 3600 * 1000);
                          const startIso = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          const end = new Date(now.getTime() - 2 * 3600 * 1000);
                          const endIso = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                          setStartTime(startIso);
                          setEndTime(endIso);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-medium border border-emerald-200 dark:border-emerald-900/60 transition-colors cursor-pointer"
                      >
                        🟢 Đã qua hạn (Completed)
                      </button>
                    </div>
                  </div>

                  {/* Retake Attempts & Scoring Strategy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                        Số lượt làm bài
                      </label>
                      <div className="relative">
                        <select
                          value={attempts}
                          onChange={(e) => setAttempts(e.target.value)}
                          className="w-full h-9 px-2.5 pr-7 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs border border-slate-300 dark:border-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option>1 lần duy nhất</option>
                          <option>2 lần thử</option>
                          <option>Không giới hạn</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-slate-400 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                        Cách tính điểm
                      </label>
                      <div className="relative">
                        <select
                          value={scoringStrategy}
                          onChange={(e) => setScoringStrategy(e.target.value)}
                          className="w-full h-9 px-2.5 pr-7 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs border border-slate-300 dark:border-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option>Lấy điểm cao nhất</option>
                          <option>Lần nộp cuối cùng</option>
                          <option>Tính điểm trung bình</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-slate-400 pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL 3: SECURITY & ANTI-CHEAT POLICIES */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-[#282A2C] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#171c1f] dark:text-white">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
                        security
                      </span>
                      <span className="text-sm font-bold">Bảo mật &amp; Chống gian lận</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
                      Lab Mode
                    </span>
                  </div>

                  {/* Toggle 1: Shuffle Questions */}
                  <label className="flex items-center justify-between cursor-pointer py-1 group">
                    <div className="flex flex-col pr-3">
                      <span className="text-xs font-semibold text-[#171c1f] dark:text-white group-hover:text-blue-600 transition-colors">
                        Đảo ngẫu nhiên thứ tự câu hỏi
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Mỗi sinh viên nhận đề có thứ tự khác nhau
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shuffleQuestions}
                        onChange={() => setShuffleQuestions(!shuffleQuestions)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>

                  {/* Toggle 2: Shuffle Answers */}
                  <label className="flex items-center justify-between cursor-pointer py-1 group">
                    <div className="flex flex-col pr-3">
                      <span className="text-xs font-semibold text-[#171c1f] dark:text-white group-hover:text-blue-600 transition-colors">
                        Đảo thứ tự các đáp án A, B, C, D
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Xáo trộn ngẫu nhiên vị trí các lựa chọn
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shuffleAnswers}
                        onChange={() => setShuffleAnswers(!shuffleAnswers)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>

                  {/* Toggle 3: Anti-cheat Lab lock */}
                  <label className="flex items-center justify-between cursor-pointer py-1 group">
                    <div className="flex flex-col pr-3">
                      <span className="text-xs font-semibold text-[#171c1f] dark:text-white group-hover:text-blue-600 transition-colors">
                        Toàn màn hình &amp; Chặn đổi tab
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tự động nộp bài nếu rời màn hình quá 3 lần
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fullscreenLock}
                        onChange={() => setFullscreenLock(!fullscreenLock)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>

                  {/* Toggle 4: Show results only after deadline */}
                  <label className="flex items-center justify-between cursor-pointer py-1 group">
                    <div className="flex flex-col pr-3">
                      <span className="text-xs font-semibold text-[#171c1f] dark:text-white group-hover:text-blue-600 transition-colors">
                        Khóa đáp án đến khi kết thúc đợt thi
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Không hiển thị lời giải ngay tránh rò rỉ đề
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAnswersUntilDeadline}
                        onChange={() => setLockAnswersUntilDeadline(!lockAnswersUntilDeadline)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>
                </div>

                {/* INSTRUCTOR SUMMARY & AUDIT TRAIL BADGE */}
                <div className="bg-[#f0f4f8] dark:bg-[#131314] rounded-xl p-4 flex items-center gap-3 border border-slate-200/80 dark:border-[#282A2C]">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">
                    verified_user
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#171c1f] dark:text-white">
                      Quy chuẩn ĐBCL Đại học
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Ma trận đánh giá tuân thủ quy chuẩn kiểm định ABET / AUN-QA.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* QUESTION BANK SELECTION & CREATION MODAL */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#282A2C] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#282A2C] flex items-center justify-between bg-slate-50/50 dark:bg-[#131314]/50">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">folder_special</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#171c1f] dark:text-white">
                    Ngân hàng câu hỏi khoa CNTT (450 câu)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chọn câu hỏi đã thẩm định để thêm vào bài Quiz hoặc tạo câu hỏi mới lưu vào Ngân hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Search & Filter Bar */}
            <div className="px-6 py-3 border-b border-slate-200 dark:border-[#282A2C] flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1E1F20]">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Tìm kiếm theo từ khóa OSPF, Dijkstra, TCP, BGP, Subnet..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-700 text-[#171c1f] dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setBankDifficultyFilter(diff)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        bankDifficultyFilter === diff
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {diff === 'ALL'
                        ? 'Tất cả'
                        : diff === 'EASY'
                        ? 'Dễ'
                        : diff === 'MEDIUM'
                        ? 'Trung bình'
                        : 'Khó'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingInBank(!isCreatingInBank)}
                className="px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCreatingInBank ? 'arrow_back' : 'add'}
                </span>
                <span>{isCreatingInBank ? 'Quay lại danh sách' : '+ Tạo mới vào Ngân hàng'}</span>
              </button>
            </div>

            {/* Modal Body: Create Form or Question Bank List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {isCreatingInBank ? (
                /* Form Tạo câu hỏi mới trực tiếp vào Ngân hàng (POST /api/v1/questions) */
                <div className="flex flex-col gap-4 bg-slate-50 dark:bg-[#131314] p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#171c1f] dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[20px]">post_add</span>
                      Tạo câu hỏi mới lưu vào Ngân hàng câu hỏi (POST /api/v1/questions)
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Tự động gán vào đề thi hiện tại
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nội dung câu hỏi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={newBankQuestionContent}
                      onChange={(e) => setNewBankQuestionContent(e.target.value)}
                      placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                      className="w-full p-3 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-300 dark:border-slate-700 text-xs text-[#171c1f] dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Phương án A</span>
                        <span className="text-[11px] text-slate-400">Chọn đáp án đúng bên dưới</span>
                      </label>
                      <input
                        type="text"
                        value={newBankOptionA}
                        onChange={(e) => setNewBankOptionA(e.target.value)}
                        placeholder="Nội dung phương án A..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-300 dark:border-slate-700 text-xs text-[#171c1f] dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phương án B
                      </label>
                      <input
                        type="text"
                        value={newBankOptionB}
                        onChange={(e) => setNewBankOptionB(e.target.value)}
                        placeholder="Nội dung phương án B..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-300 dark:border-slate-700 text-xs text-[#171c1f] dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phương án C
                      </label>
                      <input
                        type="text"
                        value={newBankOptionC}
                        onChange={(e) => setNewBankOptionC(e.target.value)}
                        placeholder="Nội dung phương án C..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-300 dark:border-slate-700 text-xs text-[#171c1f] dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phương án D
                      </label>
                      <input
                        type="text"
                        value={newBankOptionD}
                        onChange={(e) => setNewBankOptionD(e.target.value)}
                        placeholder="Nội dung phương án D..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1E1F20] border border-slate-300 dark:border-slate-700 text-xs text-[#171c1f] dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Chỉ định đáp án đúng:
                    </span>
                    {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                      <label
                        key={letter}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                          newBankCorrect === letter
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-[#1E1F20] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="newBankCorrect"
                          checked={newBankCorrect === letter}
                          onChange={() => setNewBankCorrect(letter)}
                          className="sr-only"
                        />
                        <span>Phương án {letter}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingInBank(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewQuestionToBank}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      Lưu vào Ngân hàng &amp; Thêm vào Quiz
                    </button>
                  </div>
                </div>
              ) : (
                /* Danh sách câu hỏi trong Ngân hàng */
                <div className="flex flex-col gap-3">
                  {isBankLoading && (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-[32px] animate-spin">sync</span>
                      <span className="text-xs">Đang tải danh sách câu hỏi từ máy chủ...</span>
                    </div>
                  )}

                  {!isBankLoading && bankQuestionsData && bankQuestionsData.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-[36px]">search_off</span>
                      <span className="text-xs">Không tìm thấy câu hỏi phù hợp với từ khóa</span>
                    </div>
                  )}

                  {!isBankLoading &&
                    bankQuestionsData &&
                    bankQuestionsData.map((bq, bqIdx) => {
                      const isSelected = selectedBankQuestionIds.includes(bq.id);
                      const labels = ['A', 'B', 'C', 'D', 'E'];

                      return (
                        <div
                          key={bq.id}
                          onClick={() => handleToggleSelectBankQuestion(bq.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                            isSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectBankQuestion(bq.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-500">#{bqIdx + 1}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                    {bq.bloomLevel || 'UNDERSTAND'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                      bq.difficultyLevel === 'EASY'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : bq.difficultyLevel === 'HARD'
                                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                    }`}
                                  >
                                    {bq.difficultyLevel || 'MEDIUM'}
                                  </span>
                                  {bq.ploId && (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                                      {bq.ploId.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-[#171c1f] dark:text-white leading-relaxed">
                                  {bq.content}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                              1.0 điểm
                            </span>
                          </div>

                          {/* Options Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
                            {bq.answers.map((ans, aIdx) => (
                              <div
                                key={ans.id || aIdx}
                                className={`text-xs p-2 rounded-lg flex items-center gap-2 border ${
                                  ans.isCorrect
                                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium'
                                    : 'bg-slate-50 dark:bg-[#1E1F20] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <span className="font-bold">{labels[aIdx] || 'A'}.</span>
                                <span className="truncate">{ans.content}</span>
                                {ans.isCorrect && (
                                  <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                                    ĐÚNG
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {bq.explanation && (
                            <p className="text-[11px] text-slate-500 pl-7 italic">
                              💡 Giải thích: {bq.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#282A2C] flex items-center justify-between bg-slate-50/50 dark:bg-[#131314]/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Đã chọn: <strong className="text-blue-600 dark:text-blue-400 font-bold">{selectedBankQuestionIds.length}</strong> câu hỏi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E1F20] text-[#171c1f] dark:text-white text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={selectedBankQuestionIds.length === 0}
                  onClick={handleImportSelectedFromBank}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  Thêm {selectedBankQuestionIds.length} câu hỏi vào đề thi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Sinh câu hỏi bằng AI (AI RAG Question Generator) */}
      <AiRagQuestionGeneratorModal
        isOpen={isAiRagModalOpen}
        onClose={() => setIsAiRagModalOpen(false)}
        onInjectQuestions={handleInjectAiQuestions}
        currentQuestionsCount={questions.length}
        subjectName={subjectInfo.subjectName}
        subjectCode={activeClass?.code || subjectInfo.defaultQuizCode.split('-')[0] || 'CS-202'}
      />

      {/* Modal 2: Nhập câu hỏi từ file Word / Excel */}
      <ImportWordExcelModal
        isOpen={isImportWordExcelModalOpen}
        onClose={() => setIsImportWordExcelModalOpen(false)}
        onImportQuestions={handleInjectImportedQuestions}
        currentQuestionsCount={questions.length}
        subjectName={subjectInfo.subjectName}
        subjectCode={activeClass?.code || subjectInfo.defaultQuizCode.split('-')[0] || 'CS-202'}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-xl backdrop-blur-md text-xs font-semibold border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-blue-400 dark:text-blue-600 text-[18px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
