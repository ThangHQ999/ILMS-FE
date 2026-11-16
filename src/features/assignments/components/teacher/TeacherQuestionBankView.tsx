'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { getLocalCreatedClasses } from '@/features/classes/services/class.service';
import { DEFAULT_FACULTY_CLASSES } from '@/features/classes/constants';
import type { ClassItem } from '@/features/classes/schemas/class.schema';
import { getSubjectInfoForClass } from '../../constants/subject-quiz.constants';

export interface BankQuestion {
  id: string;
  code: string;
  chapter: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'CALCULATION' | 'ESSAY';
  typeLabel: string;
  bloomLevel: 'BLOOM_1' | 'BLOOM_2' | 'BLOOM_3' | 'BLOOM_4';
  bloomLabel: string;
  bloomColor: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  difficultyLabel: string;
  content: string;
  options?: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  solutionNote?: string;
  explanation: string;
  tags: string[];
  plo: string;
  discriminationIndex: number;
  correctRate: number; // Percentage
  lastExamDate?: string;
}

const DEFAULT_QUESTIONS: BankQuestion[] = [
  {
    id: 'bank-q-1',
    code: '#NET-042',
    chapter: 'Chương 4: Tầng Mạng',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (1 Đáp án)',
    bloomLevel: 'BLOOM_4',
    bloomLabel: 'Vận dụng cao (Bloom 4)',
    bloomColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content:
      'Trong cấu trúc định tuyến phân cấp OSPF, giả sử Router ABR kết nối giữa Backbone Area 0 và Totally Stubby Area 1. Khi một mạng con thuộc Area 2 bị mất kết nối (down link), router ABR nói trên sẽ xử lý các LSA như thế nào để cập nhật trạng thái liên kết vào Area 1?',
    options: [
      {
        id: 'opt-1-a',
        label: 'A',
        text: 'Truyền LSA Type 3 chi tiết mô tả mạng đích bị mất tới tất cả router trong Area 1.',
        isCorrect: false,
      },
      {
        id: 'opt-1-b',
        label: 'B',
        text: 'Không truyền bất kỳ LSA Type 3 cụ thể nào, chỉ duy trì Default Route (0.0.0.0/0) duy nhất. (Đúng)',
        isCorrect: true,
      },
      {
        id: 'opt-1-c',
        label: 'C',
        text: 'Khởi tạo LSA Type 5 External quảng bá ngập lụt (flood) trong toàn bộ Autonomous System.',
        isCorrect: false,
      },
      {
        id: 'opt-1-d',
        label: 'D',
        text: 'Chuyển Area 1 thành NSSA và chuyển đổi LSA Type 7 sang Type 5.',
        isCorrect: false,
      },
    ],
    explanation:
      'Totally Stubby Area chặn cả External LSA (Type 4, 5) lẫn Inter-area Summary LSA (Type 3). ABR chỉ chèn một Default Route duy nhất (LSA Type 3 cho 0.0.0.0/0) vào Area 1.',
    tags: ['#OSPF', '#ABR', '#LSDB'],
    plo: 'PLO-03',
    discriminationIndex: 0.42,
    correctRate: 64,
    lastExamDate: '12/2023',
  },
  {
    id: 'bank-q-2',
    code: '#NET-043',
    chapter: 'Chương 4: Tầng Mạng',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Thuật toán tìm đường ngắn nhất Dijkstra (Shortest Path First - SPF) được sử dụng trong giao thức OSPF có độ phức tạp thời gian khi được cài đặt tối ưu bằng cấu trúc dữ liệu Min-Heap nhị phân (Binary Heap) là bao nhiêu? (Với V là số đỉnh Router và E là số liên kết mạng).',
    options: [
      { id: 'opt-2-a', label: 'A', text: 'O(V²)', isCorrect: false },
      { id: 'opt-2-b', label: 'B', text: 'O((V + E) log V)', isCorrect: true },
      { id: 'opt-2-c', label: 'C', text: 'O(V * E)', isCorrect: false },
      { id: 'opt-2-d', label: 'D', text: 'O(E²)', isCorrect: false },
    ],
    explanation:
      'Dijkstra dùng Binary Min-Heap có độ phức tạp O((V + E) log V). Mỗi thao tác Extract-Min tốn O(log V) và mỗi thao tác Decrease-Key tốn O(log V) cho tối đa E cạnh.',
    tags: ['#Dijkstra', '#Routing'],
    plo: 'PLO-01',
    discriminationIndex: 0.28,
    correctRate: 78,
    lastExamDate: '10/2023',
  },
  {
    id: 'bank-q-3',
    code: '#NET-044',
    chapter: 'Chương 4: Tầng Mạng',
    type: 'CALCULATION',
    typeLabel: 'Bài toán tính toán (Calculation)',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Cho dải địa chỉ mạng IPv4 172.16.0.0/20. Người quản trị cần chia nhỏ thành các mạng con (Subnets) sao cho mỗi mạng con có khả năng chứa tối thiểu 120 hosts hoạt động. Xác định số lượng subnet tối đa có thể tạo được và Subnet Mask tương ứng theo định dạng thập phân có dấu chấm (Dotted-Decimal).',
    solutionNote: 'Đáp án chuẩn: 32 subnets với Subnet Mask: 255.255.255.128 (/25)',
    explanation:
      'Cần 120 hosts -> cần 7 bit host (2^7 - 2 = 126 > 120). Chiều dài prefix mới là 32 - 7 = /25 (Subnet Mask: 255.255.255.128). Số bit mượn là 25 - 20 = 5 bit -> 2^5 = 32 subnets tối đa.',
    tags: ['#IPv4', '#Subnetting', '#VLSM'],
    plo: 'PLO-02',
    discriminationIndex: 0.51,
    correctRate: 52,
    lastExamDate: '11/2023',
  },
];

interface TeacherQuestionBankViewProps {
  userFullName?: string;
  initialClassId?: string;
}

export function TeacherQuestionBankView({
  userFullName = 'TS. Lê Hoàng Nam',
  initialClassId,
}: TeacherQuestionBankViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Shell Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Class Selection Data
  const { data: classesData } = useClasses();

  const availableClasses: ClassItem[] = useMemo(() => {
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
  }, [classesData]);

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return initialClassId || searchParams.get('classId') || 'cs-202';
  });

  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<'VI' | 'EN'>('VI');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const handleToggleDarkMode = () => {
    if (typeof window === 'undefined') return;
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {}
    showToast(isDark ? 'Đã bật Chế độ tối' : 'Đã bật Chế độ sáng');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    }
    if (isCourseDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCourseDropdownOpen]);

  const activeClass = useMemo(() => {
    if (selectedClassId) {
      const found = availableClasses.find(
        (c) =>
          String(c.id).toLowerCase() === selectedClassId.toLowerCase() ||
          c.name?.toLowerCase() === selectedClassId.toLowerCase() ||
          c.code?.toLowerCase() === selectedClassId.toLowerCase()
      );
      if (found) return found;
    }
    return (
      availableClasses[0] || {
        id: 'cs-202',
        name: 'CS-202',
        title: 'Mạng máy tính & Truyền thông',
        code: 'CS-202',
      }
    );
  }, [availableClasses, selectedClassId]);

  const currentClassLabel = useMemo(() => {
    const code = activeClass.name || activeClass.classCode || activeClass.code || String(activeClass.id);
    const title = activeClass.title || '';
    if (title && title !== code) {
      return `${code}: ${title}`;
    }
    return code || 'CS-202: Mạng máy tính & Truyền thông';
  }, [activeClass]);

  const userInitials = useMemo(() => {
    if (!userFullName) return 'HT';
    const parts = userFullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [userFullName]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Đang tải lên và trích xuất câu hỏi từ: ${file.name}...`);
      setTimeout(() => {
        showToast(`Đã nhập thành công 15 câu hỏi từ ${file.name} vào ngân hàng!`);
      }, 1500);
    }
  };

  const subjectInfo = useMemo(() => {
    return getSubjectInfoForClass(activeClass);
  }, [activeClass]);

  // Questions Database State (local + persistent)
  const [questions, setQuestions] = useState<BankQuestion[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`ilms_bank_questions_${activeClass.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_QUESTIONS;
  });

  // Re-sync questions when active class changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`ilms_bank_questions_${activeClass.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
          return;
        }
      } catch {}
    }

    // Default sample questions for the selected subject
    if (subjectInfo.key === 'giaiTich2') {
      setQuestions([
        {
          id: 'bank-gt2-1',
          code: '#CALC-001',
          chapter: 'Chương 1: Chuỗi số & Chuỗi hàm',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice (1 Đáp án)',
          bloomLevel: 'BLOOM_1',
          bloomLabel: 'Nhận biết (Bloom 1)',
          bloomColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          difficultyLevel: 'EASY',
          difficultyLabel: 'Dễ (P > 0.7)',
          content: 'Điều kiện cần để chuỗi số dương ∑(n=1 đến ∞) a_n hội tụ là gì?',
          options: [
            { id: 'opt-gt2-1-a', label: 'A', text: 'lim_{n -> ∞} a_n = 0', isCorrect: true },
            { id: 'opt-gt2-1-b', label: 'B', text: 'lim_{n -> ∞} a_n = 1', isCorrect: false },
            { id: 'opt-gt2-1-c', label: 'C', text: 'lim_{n -> ∞} (a_{n+1} / a_n) > 1', isCorrect: false },
            { id: 'opt-gt2-1-d', label: 'D', text: 'a_n >= 1 với mọi n', isCorrect: false },
          ],
          explanation:
            'Theo định lý cơ bản về điều kiện cần của chuỗi số hội tụ: Nếu chuỗi ∑ a_n hội tụ thì số hạng tổng quát phải tiến về 0.',
          tags: ['#ChuoiSo', '#HoiTu', '#DinhLy'],
          plo: 'PLO-01',
          discriminationIndex: 0.35,
          correctRate: 85,
          lastExamDate: '10/2024',
        },
        {
          id: 'bank-gt2-2',
          code: '#CALC-002',
          chapter: 'Chương 3: Tích phân bội (Tích phân kép & Bội ba)',
          type: 'CALCULATION',
          typeLabel: 'Bài toán tính toán (Calculation)',
          bloomLevel: 'BLOOM_3',
          bloomLabel: 'Vận dụng (Bloom 3)',
          bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
          difficultyLevel: 'MEDIUM',
          difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
          content:
            'Tính tích phân kép I = ∬_D (2x + y) dxdy với miền D là hình chữ nhật giới hạn bởi 0 ≤ x ≤ 2 và 0 ≤ y ≤ 1.',
          solutionNote: 'Đáp án chuẩn: I = 5',
          explanation:
            'Áp dụng công thức Fubini: I = ∫_0^2 dx ∫_0^1 (2x + y) dy = ∫_0^2 [2xy + y²/2]_0^1 dx = ∫_0^2 (2x + 1/2) dx = [x² + x/2]_0^2 = 4 + 1 = 5.',
          tags: ['#TichPhanKep', '#Fubini', '#HinhChuNhat'],
          plo: 'PLO-02',
          discriminationIndex: 0.44,
          correctRate: 62,
          lastExamDate: '11/2024',
        },
      ]);
    } else {
      setQuestions(DEFAULT_QUESTIONS);
    }
  }, [activeClass.id, subjectInfo.key]);

  // Selected Chapter Filter
  const [selectedChapter, setSelectedChapter] = useState<string>('ALL');

  // Bloom Filter State
  const [bloomFilters, setBloomFilters] = useState<Record<string, boolean>>({
    BLOOM_1: true,
    BLOOM_2: true,
    BLOOM_3: true,
    BLOOM_4: true,
  });

  // PLO Filter State
  const [selectedPlos, setSelectedPlos] = useState<string[]>(['PLO-01', 'PLO-03']);

  // Search & Difficulty Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');

  // Blueprint Studio State
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(true);
  const [isShuffleModalOpen, setIsShuffleModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState<BankQuestion | null>(null);

  // Form state for Manual Add Question Modal
  const [newQContent, setNewQContent] = useState('');
  const [newQType, setNewQType] = useState<'SINGLE_CHOICE' | 'CALCULATION'>('SINGLE_CHOICE');
  const [newQBloom, setNewQBloom] = useState<'BLOOM_1' | 'BLOOM_2' | 'BLOOM_3' | 'BLOOM_4'>('BLOOM_2');
  const [newQDifficulty, setNewQDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [newQPlo, setNewQPlo] = useState('PLO-03');
  const [newQChapter, setNewQChapter] = useState(subjectInfo.defaultChapter);
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectOpt, setNewCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQTags, setNewQTags] = useState('#OSPF, #Routing');

  // Form state for AI Generator Modal
  const [aiPrompt, setAiPrompt] = useState('Sinh 5 câu hỏi tình huống chuyên sâu về định tuyến OSPF LSDB Flood');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiTargetBloom, setAiTargetBloom] = useState<'BLOOM_3' | 'BLOOM_4'>('BLOOM_4');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Filtered Questions calculation
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Chapter filter
      if (selectedChapter !== 'ALL' && !q.chapter.toLowerCase().includes(selectedChapter.toLowerCase())) {
        return false;
      }
      // Bloom filter
      if (!bloomFilters[q.bloomLevel]) {
        return false;
      }
      // PLO filter
      if (selectedPlos.length > 0 && !selectedPlos.includes(q.plo)) {
        return false;
      }
      // Difficulty filter
      if (difficultyFilter !== 'ALL' && q.difficultyLevel !== difficultyFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchContent = q.content.toLowerCase().includes(query);
        const matchCode = q.code.toLowerCase().includes(query);
        const matchTags = q.tags.some((t) => t.toLowerCase().includes(query));
        const matchChapter = q.chapter.toLowerCase().includes(query);
        if (!matchContent && !matchCode && !matchTags && !matchChapter) {
          return false;
        }
      }
      return true;
    });
  }, [questions, selectedChapter, bloomFilters, selectedPlos, difficultyFilter, searchQuery]);

  // Handle Multi-select
  const handleToggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map((q) => q.id));
    }
  };

  // Handle Save Manual Question
  const handleSaveManualQuestion = () => {
    if (!newQContent.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    const bloomConfig = {
      BLOOM_1: { label: 'Nhận biết (Bloom 1)', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
      BLOOM_2: { label: 'Thông hiểu (Bloom 2)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300' },
      BLOOM_3: { label: 'Vận dụng (Bloom 3)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' },
      BLOOM_4: { label: 'Vận dụng cao (Bloom 4)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300' },
    }[newQBloom];

    const difficultyLabel = {
      EASY: 'Dễ (P > 0.7)',
      MEDIUM: 'Trung bình (0.4 < P ≤ 0.7)',
      HARD: 'Khó (P ≤ 0.4)',
    }[newQDifficulty];

    const newQuestion: BankQuestion = {
      id: `bank-q-${Date.now()}`,
      code: `#NET-${Math.floor(100 + Math.random() * 900)}`,
      chapter: newQChapter,
      type: newQType,
      typeLabel: newQType === 'SINGLE_CHOICE' ? 'Multiple Choice (1 Đáp án)' : 'Bài toán tính toán (Calculation)',
      bloomLevel: newQBloom,
      bloomLabel: bloomConfig.label,
      bloomColor: bloomConfig.color,
      difficultyLevel: newQDifficulty,
      difficultyLabel,
      content: newQContent,
      options:
        newQType === 'SINGLE_CHOICE'
          ? [
              { id: 'opt-a', label: 'A', text: newOptA || 'Phương án A', isCorrect: newCorrectOpt === 'A' },
              { id: 'opt-b', label: 'B', text: newOptB || 'Phương án B', isCorrect: newCorrectOpt === 'B' },
              { id: 'opt-c', label: 'C', text: newOptC || 'Phương án C', isCorrect: newCorrectOpt === 'C' },
              { id: 'opt-d', label: 'D', text: newOptD || 'Phương án D', isCorrect: newCorrectOpt === 'D' },
            ]
          : undefined,
      explanation: newQExplanation || 'Giải thích chuẩn từ giảng viên phụ trách học phần.',
      tags: newQTags.split(',').map((t) => t.trim()).filter(Boolean),
      plo: newQPlo,
      discriminationIndex: 0.38,
      correctRate: 70,
      lastExamDate: 'Mới tạo',
    };

    const updated = [newQuestion, ...questions];
    setQuestions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ilms_bank_questions_${activeClass.id}`, JSON.stringify(updated));
    }

    setIsAddQuestionModalOpen(false);
    showToast('Đã thêm thành công 1 câu hỏi mới vào Ngân hàng!');
    // Reset form
    setNewQContent('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewQExplanation('');
  };

  // Handle AI Generate Questions
  const handleGenerateAiQuestions = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      setIsAiModalOpen(false);

      const generatedQuestions: BankQuestion[] = Array.from({ length: aiQuestionCount }).map((_, idx) => ({
        id: `ai-q-${Date.now()}-${idx + 1}`,
        code: `#AI-${Math.floor(500 + Math.random() * 499)}`,
        chapter: subjectInfo.defaultChapter,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Multiple Choice (AI Sinh)',
        bloomLevel: aiTargetBloom,
        bloomLabel: aiTargetBloom === 'BLOOM_4' ? 'Vận dụng cao (Bloom 4)' : 'Vận dụng (Bloom 3)',
        bloomColor:
          aiTargetBloom === 'BLOOM_4'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
        difficultyLevel: aiTargetBloom === 'BLOOM_4' ? 'HARD' : 'MEDIUM',
        difficultyLabel: aiTargetBloom === 'BLOOM_4' ? 'Khó (P ≤ 0.4)' : 'Trung bình (0.4 < P ≤ 0.7)',
        content: `[AI Co-pilot] Tình huống ${idx + 1}: ${aiPrompt}. Giả sử xảy ra biến cố mất gói và định tuyến lại qua cổng phụ, thuật toán phân xử như thế nào?`,
        options: [
          { id: `opt-ai-${idx}-a`, label: 'A', text: 'Kích hoạt ngay lập tức đường dự phòng mà không cần tính lại LSDB', isCorrect: false },
          { id: `opt-ai-${idx}-b`, label: 'B', text: 'Chạy lại thuật toán SPF cục bộ và cập nhật Forwarding Database', isCorrect: true },
          { id: `opt-ai-${idx}-c`, label: 'C', text: 'Chuyển đổi toàn bộ Area sang Stubby và loại bỏ bản ghi BGP', isCorrect: false },
          { id: `opt-ai-${idx}-d`, label: 'D', text: 'Hủy toàn bộ bảng định tuyến và đợi bản tin Hello mới sau 40s', isCorrect: false },
        ],
        explanation: 'Thuật toán SPF sẽ tự động kích hoạt tính lại đường đi ngắn nhất dựa trên cơ sở dữ liệu trạng thái liên kết LSDB hiện có.',
        tags: ['#AI_Generated', '#OSPF', '#Bloom4'],
        plo: 'PLO-03',
        discriminationIndex: 0.45,
        correctRate: 58,
        lastExamDate: 'Mới sinh AI',
      }));

      const updated = [...generatedQuestions, ...questions];
      setQuestions(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ilms_bank_questions_${activeClass.id}`, JSON.stringify(updated));
      }

      showToast(`AI GPT-4o đã bóc tách và sinh thành công ${aiQuestionCount} câu hỏi chuẩn hóa Bloom!`);
    }, 1200);
  };

  // Delete Question
  const handleDeleteQuestion = (id: string, code: string) => {
    if (confirm(`Bạn có chắc muốn xóa câu hỏi ${code} khỏi ngân hàng không?`)) {
      const updated = questions.filter((q) => q.id !== id);
      setQuestions(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ilms_bank_questions_${activeClass.id}`, JSON.stringify(updated));
      }
      showToast(`Đã xóa câu hỏi ${code}`);
    }
  };

  // Duplicate Question
  const handleDuplicateQuestion = (q: BankQuestion) => {
    const dup: BankQuestion = {
      ...q,
      id: `dup-${Date.now()}`,
      code: `${q.code}-DUP`,
      content: `[Bản sao] ${q.content}`,
      lastExamDate: 'Bản sao mới',
    };
    const updated = [dup, ...questions];
    setQuestions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ilms_bank_questions_${activeClass.id}`, JSON.stringify(updated));
    }
    showToast(`Đã nhân bản câu hỏi ${q.code}`);
  };

  // Export XML Moodle
  const handleExportMoodleXml = () => {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;
    const xmlQuestions = filteredQuestions
      .map((q) => {
        return `  <question type="multichoice">\n    <name><text>${q.code} - ${q.bloomLabel}</text></name>\n    <questiontext format="html"><text><![CDATA[${q.content}]]></text></questiontext>\n    <generalfeedback><text><![CDATA[${q.explanation}]]></text></generalfeedback>\n  </question>\n`;
      })
      .join('');
    const xmlFooter = `</quiz>`;

    const blob = new Blob([xmlHeader + xmlQuestions + xmlFooter], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodle_quiz_bank_${activeClass.name || 'CS202'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất thành công tệp XML định dạng Moodle!');
  };

  // Push Blueprint to Quiz Studio
  const handlePushBlueprintToQuiz = () => {
    router.push(
      `/assignments/create?classId=${encodeURIComponent(
        activeClass.id
      )}&classCode=${encodeURIComponent(
        activeClass.name || activeClass.code || 'CS-202'
      )}&className=${encodeURIComponent(activeClass.title || '')}&fromBlueprint=true`
    );
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Đang tải Ngân hàng Câu hỏi &amp; Ma trận Đề thi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] text-[#171C1F] dark:text-[#E3E3E3] flex">
      {/* SIDEBAR NAVIGATION */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed || isFocusMode}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* MAIN CONTAINER */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isFocusMode ? 'pl-0' : isSidebarCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        {/* ========================================================= */}
        {/* 1. TOP HEADER (Thanh điều hướng cố định trên cùng)       */}
        {/* ========================================================= */}
        <header className="h-16 border-b border-slate-200/80 dark:border-[#282A2C] bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
          {/* Bên trái: Breadcrumbs điều hướng */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#8E918F] font-medium">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center cursor-pointer"
              title="Trang chủ"
            >
              <span className="material-symbols-outlined text-[19px]">home</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-800 dark:text-white font-semibold">Ngân hàng Câu hỏi</span>
          </div>

          {/* Ở giữa: Thanh tìm kiếm hình viên thuốc (Search Pill) */}
          <div className="relative w-full max-w-md mx-6">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, khóa học, node kiến thức..."
              className="w-full pl-10 pr-16 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-[#131314] dark:hover:bg-[#1E1F20] dark:focus:bg-[#1E1F20] border border-slate-200/90 dark:border-slate-700 rounded-full text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="text-[10px] font-mono text-slate-400 bg-slate-200/70 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs font-semibold">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Bên phải: Các Action & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Nút Chế độ tập trung */}
            <button
              type="button"
              onClick={() => {
                setIsFocusMode((prev) => !prev);
                showToast(isFocusMode ? 'Đã tắt Chế độ Tập trung' : 'Đã bật Chế độ Tập trung');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
                isFocusMode
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-slate-400">
                {isFocusMode ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span>Chế độ Tập trung</span>
            </button>

            {/* Badge Vai trò Giảng viên */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">school</span>
              <span>Giảng viên</span>
            </div>

            {/* Toggle Dark Mode */}
            <button
              type="button"
              onClick={handleToggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Chuyển chế độ sáng/tối"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </button>

            {/* Switch Ngôn ngữ (VI | EN) */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131314] p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCurrentLang('VI')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  currentLang === 'VI'
                    ? 'bg-white dark:bg-[#282A2C] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setCurrentLang('EN')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  currentLang === 'EN'
                    ? 'bg-white dark:bg-[#282A2C] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                EN
              </button>
            </div>

            {/* Nút Thông báo (Có Badge đỏ) */}
            <button
              type="button"
              onClick={() => showToast('Bạn có 3 thông báo mới từ hội đồng khảo thí')}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Thông báo mới"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#1E1F20] shadow-2xs">
                3
              </span>
            </button>

            {/* Divider dọc */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Avatar & Tên User */}
            <div
              className="flex items-center gap-2.5 pl-1 cursor-pointer group"
              onClick={() => router.push('/profile')}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:ring-2 group-hover:ring-blue-500/30 transition-all">
                {userInitials}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                  {userFullName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Giảng viên</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                expand_more
              </span>
            </div>
          </div>
        </header>

        {/* Hidden File Input for Excel/Moodle import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv,.xml,.docx,.json"
          className="hidden"
        />

        {/* MAIN BODY CONTENT */}
        <main className="w-full px-6 lg:px-8 py-6 max-w-7xl mx-auto flex-1">
          {/* TOAST ALERT */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. SUB-HEADER (Tiêu đề trang & Các nút Action chính)     */}
          {/* ========================================================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-[#282A2C] mb-6">
            {/* Bên trái: Tiêu đề + Chọn khóa học + Subtitle */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Ngân hàng Câu hỏi &amp; Ma trận Đề
                </h1>
                {/* Pill Dropdown Chọn Khóa học */}
                <div className="relative inline-block" ref={courseDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCourseDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-[#131314] dark:hover:bg-[#282A2C] border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-blue-400">
                      menu_book
                    </span>
                    <span>{currentClassLabel}</span>
                    <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                      {isCourseDropdownOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isCourseDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-80 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        Chọn lớp học / Học phần
                      </div>
                      {availableClasses.map((cls) => {
                        const code = cls.name || cls.classCode || cls.code || String(cls.id);
                        const title = cls.title || '';
                        const label = title ? `${code}: ${title}` : code;
                        const isSelected = String(cls.id) === String(selectedClassId);
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => {
                              setSelectedClassId(String(cls.id));
                              setIsCourseDropdownOpen(false);
                              showToast(`Đã chuyển sang lớp: ${label}`);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-slate-700 dark:text-slate-200 font-normal'
                            }`}
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="truncate">{label}</span>
                              {cls.semester && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {cls.semester}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 shrink-0">
                                check
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kho dữ liệu câu hỏi trắc nghiệm &amp; ma trận chuẩn ABET • Học kỳ 1 (2026–2027)
              </p>
            </div>

            {/* Bên phải: 3 nút Action + Toggle Ma trận */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Nút 1: Nhập file */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-slate-400">
                  upload_file
                </span>
                <span>Nhập file (Excel/Moodle)</span>
              </button>

              {/* Nút 2: Sinh câu hỏi bằng AI (Gradient nổi bật) */}
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-semibold text-white transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                <span>Sinh câu hỏi bằng AI</span>
              </button>

              {/* Nút 3: Thêm câu hỏi mới (Nút Primary CTA) */}
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">add</span>
                <span>Thêm câu hỏi mới</span>
              </button>

              {/* Nút 4: Toggle Blueprint */}
              <button
                type="button"
                onClick={() => setIsBlueprintOpen(!isBlueprintOpen)}
                className={`p-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  isBlueprintOpen
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title={isBlueprintOpen ? 'Ẩn Ma trận Bloom' : 'Hiện Ma trận Bloom'}
              >
                <span className="material-symbols-outlined text-[18px]">view_quilt</span>
              </button>
            </div>
          </div>

          {/* METRIC STRIP BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-2xl border border-slate-200/80 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tổng số câu hỏi
                </span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {340 + (questions.length - DEFAULT_QUESTIONS.length)}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> 100% Đã chuẩn hóa PLO
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[26px]">library_books</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-2xl border border-slate-200/80 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tỷ lệ Bloom Cao (Vận dụng+)
                </span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                  25.0%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  85/340 câu (Cần bổ sung 15 câu)
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined text-[26px]">psychology</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-2xl border border-slate-200/80 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Độ phân hóa TB (Discrimination)
                </span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                  0.38
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  Chất lượng ngân hàng: Tốt
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[26px]">insights</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-2xl border border-slate-200/80 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ma trận đề khả dụng
                </span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                  6 Bản
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cập nhật 2 giờ trước
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-[26px]">dashboard_customize</span>
              </div>
            </div>
          </div>

          {/* MAIN SPLIT LAYOUT (25% Tree & Filters / 75% Bank Data & Blueprint Engine) */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: KNOWLEDGE CATEGORY TREE & TAXONOMY FILTERS (3 Cols) */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {/* CÂY TRI THỨC MÔN HỌC */}
              <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 border border-slate-200/80 dark:border-[#282A2C] shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#282A2C]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">
                      account_tree
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Cây Tri thức Môn học
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {activeClass.name || activeClass.code}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {/* Course Root */}
                  <div
                    onClick={() => setSelectedChapter('ALL')}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl font-medium text-xs cursor-pointer transition-all ${
                      selectedChapter === 'ALL'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px]">folder_open</span>
                      <span className="truncate">Tất cả chương mục</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        selectedChapter === 'ALL'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      340
                    </span>
                  </div>

                  {/* Chapters List */}
                  <div className="flex flex-col pl-2 pt-1 gap-1">
                    {subjectInfo.chapters.map((chap, idx) => {
                      const isSelected = selectedChapter === chap;
                      const count = [45, 62, 88, 95, 50][idx] || 50;

                      return (
                        <div key={chap} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => setSelectedChapter(chap)}
                            className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                              />
                              <span className="truncate">{chap}</span>
                            </div>
                            <span className="text-[10.5px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">
                              {count}
                            </span>
                          </button>

                          {/* Sub topics under selected chapter */}
                          {isSelected && (
                            <div className="flex flex-col pl-5 pt-1 pb-1 gap-1">
                              <div
                                onClick={() => showToast(`Lọc chuyên đề: Định tuyến OSPF & LSDB`)}
                                className="flex items-center justify-between text-[11px] py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
                              >
                                <span>• Định tuyến OSPF &amp; LSDB</span>
                                <span className="font-mono text-slate-400">42</span>
                              </div>
                              <div
                                onClick={() => showToast(`Lọc chuyên đề: IPv4 Subnetting & VLSM`)}
                                className="flex items-center justify-between text-[11px] py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                              >
                                <span>• IPv4 Subnetting &amp; VLSM</span>
                                <span className="font-mono text-slate-400">33</span>
                              </div>
                              <div
                                onClick={() => showToast(`Lọc chuyên đề: Giao thức BGP`)}
                                className="flex items-center justify-between text-[11px] py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
                              >
                                <span>• Giao thức BGP</span>
                                <span className="font-mono text-slate-400">20</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  onClick={() => showToast('Mở cấu hình cây danh mục tri thức')}
                  className="mt-3 pt-2 border-t border-slate-100 dark:border-[#282A2C] flex justify-between items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:underline text-xs font-semibold"
                >
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span>Thêm danh mục mới
                  </span>
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </div>
              </div>

              {/* THANG ĐO BLOOM */}
              <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 border border-slate-200/80 dark:border-[#282A2C] shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#282A2C]">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Thang đo Bloom</span>
                  <span
                    onClick={() => {
                      const allChecked = Object.values(bloomFilters).every(Boolean);
                      setBloomFilters({
                        BLOOM_1: !allChecked,
                        BLOOM_2: !allChecked,
                        BLOOM_3: !allChecked,
                        BLOOM_4: !allChecked,
                      });
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
                  >
                    {Object.values(bloomFilters).every(Boolean) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bloomFilters.BLOOM_1}
                        onChange={(e) => setBloomFilters({ ...bloomFilters, BLOOM_1: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                          Nhận biết (Bloom 1)
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      120
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bloomFilters.BLOOM_2}
                        onChange={(e) => setBloomFilters({ ...bloomFilters, BLOOM_2: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                          Thông hiểu (Bloom 2)
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      135
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bloomFilters.BLOOM_3}
                        onChange={(e) => setBloomFilters({ ...bloomFilters, BLOOM_3: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                          Vận dụng (Bloom 3)
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      60
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/40 dark:border-purple-900/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bloomFilters.BLOOM_4}
                        onChange={(e) => setBloomFilters({ ...bloomFilters, BLOOM_4: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer accent-purple-600"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <span className="text-xs text-purple-900 dark:text-purple-300 font-bold">
                          Vận dụng cao (Bloom 4)
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                      25
                    </span>
                  </label>
                </div>
              </div>

              {/* CHUẨN ĐẦU RA (PLO) */}
              <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 border border-slate-200/80 dark:border-[#282A2C] shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#282A2C]">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Chuẩn đầu ra (PLO)</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">help</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['PLO-01', 'PLO-02', 'PLO-03', 'PLO-05'].map((plo) => {
                    const isSelected = selectedPlos.includes(plo);
                    const labelMap: Record<string, string> = {
                      'PLO-01': 'PLO-01 (Lý thuyết cơ bản)',
                      'PLO-02': 'PLO-02 (Thiết kế mạng)',
                      'PLO-03': 'PLO-03 (Phân tích giao thức)',
                      'PLO-05': 'PLO-05 (Bảo mật mạng)',
                    };

                    return (
                      <button
                        key={plo}
                        type="button"
                        onClick={() => {
                          setSelectedPlos((prev) =>
                            prev.includes(plo) ? prev.filter((p) => p !== plo) : [...prev, plo]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span>{labelMap[plo] || plo}</span>
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI QUESTION GENERATOR WIDGET TIP */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2 text-blue-300 font-semibold text-xs">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span className="font-bold">Gợi ý AI Co-pilot</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tỷ lệ câu hỏi Bloom 4 cho chương OSPF đang dưới 15%. Bạn có muốn tạo 5 câu tình huống LSDB Flood tự động?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAiTargetBloom('BLOOM_4');
                    setAiQuestionCount(5);
                    setIsAiModalOpen(true);
                  }}
                  className="mt-3 w-full py-2 bg-white text-slate-900 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
                >
                  Kích hoạt AI Generator
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: BANK MANAGEMENT TABLE & EXAM BLUEPRINT STUDIO (9 Cols) */}
            <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
              {/* EXAM BLUEPRINT PREVIEW BOX */}
              {isBlueprintOpen && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-sm p-6 border border-slate-200/80 dark:border-[#282A2C] relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">architecture</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900 dark:text-white">
                            Trình Sinh Ma trận Đề thi (Exam Blueprint Studio)
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">
                            ACTIVE BLUEPRINT #BP-2024
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Cấu hình thuật toán sinh đề ngẫu nhiên theo ma trận năng lực chuẩn ABET
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Đề thi 45 phút</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white font-bold">
                        Tổng: 20 Câu
                      </span>
                    </div>
                  </div>

                  {/* Matrix Breakdown Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-[#131314] rounded-xl mb-4 border border-slate-200/60 dark:border-[#282A2C]">
                    {/* Nhận biết 30% */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white dark:bg-[#1E1F20] shadow-2xs border border-slate-200/60 dark:border-[#282A2C]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Nhận biết</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">6 câu (30%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: '30%' }} />
                      </div>
                      <span className="text-[11px] text-slate-400">Kho có sẵn: 120 câu</span>
                    </div>

                    {/* Thông hiểu 40% */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white dark:bg-[#1E1F20] shadow-2xs border border-slate-200/60 dark:border-[#282A2C]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Thông hiểu</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">8 câu (40%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="text-[11px] text-slate-400">Kho có sẵn: 135 câu</span>
                    </div>

                    {/* Vận dụng 20% */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white dark:bg-[#1E1F20] shadow-2xs border border-slate-200/60 dark:border-[#282A2C]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Vận dụng</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">4 câu (20%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '20%' }} />
                      </div>
                      <span className="text-[11px] text-slate-400">Kho có sẵn: 60 câu</span>
                    </div>

                    {/* Vận dụng cao 10% */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white dark:bg-[#1E1F20] shadow-2xs border border-slate-200/60 dark:border-[#282A2C]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Vận dụng cao</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">2 câu (10%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: '10%' }} />
                      </div>
                      <span className="text-[11px] text-slate-400">Kho có sẵn: 25 câu</span>
                    </div>
                  </div>

                  {/* Actions & Coverage info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span>Phân bố chương 1-5 đồng đều</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span>Không trùng lặp ý tưởng (&gt;85% vector similarity filter)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsShuffleModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">shuffle</span>
                        <span>Sinh 4 mã đề ngẫu nhiên (Shuffle &amp; Generate)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePushBlueprintToQuiz}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">publish</span>
                        <span>Đẩy vào Đề thi Quiz mới</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* BANK QUERY BAR & CONTROLS */}
              <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 border border-slate-200/80 dark:border-[#282A2C] shadow-xs flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Search field */}
                  <div className="relative flex-1 min-w-[280px]">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo nội dung, ID câu hỏi, hashtag (#OSPF, #Dijkstra)..."
                      className="w-full bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>

                  {/* Difficulty & P-Value Selectors */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#131314] rounded-xl border border-slate-200/60 dark:border-[#282A2C]">
                      <span className="text-xs text-slate-500 font-medium">Độ khó:</span>
                      <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value as any)}
                        className="bg-transparent text-slate-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">Tất cả mức độ</option>
                        <option value="EASY">Dễ (P &gt; 0.7)</option>
                        <option value="MEDIUM">Trung bình (0.4 &lt; P ≤ 0.7)</option>
                        <option value="HARD">Khó (P ≤ 0.4)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#131314] rounded-xl border border-slate-200/60 dark:border-[#282A2C] text-xs">
                      <span className="text-slate-500 font-medium">P-Value:</span>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">0.2 - 0.85</span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400">tune</span>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'CARD' ? 'TABLE' : 'CARD')}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        viewMode === 'CARD'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={viewMode === 'CARD' ? 'Xem dạng bảng' : 'Xem dạng thẻ'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {viewMode === 'CARD' ? 'view_agenda' : 'table_rows'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Active Filter Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                  <span className="text-slate-400 mr-1">Bộ lọc đang áp dụng:</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1 font-medium">
                    <span>{selectedChapter === 'ALL' ? 'Tất cả chương học' : selectedChapter}</span>
                    {selectedChapter !== 'ALL' && (
                      <span
                        className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-500"
                        onClick={() => setSelectedChapter('ALL')}
                      >
                        close
                      </span>
                    )}
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1 font-medium">
                    <span>PLO: {selectedPlos.join(', ')}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1 font-medium">
                    <span>Thang Bloom: {Object.values(bloomFilters).filter(Boolean).length}/4</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChapter('ALL');
                      setSearchQuery('');
                      setDifficultyFilter('ALL');
                      setSelectedPlos(['PLO-01', 'PLO-03']);
                      setBloomFilters({ BLOOM_1: true, BLOOM_2: true, BLOOM_3: true, BLOOM_4: true });
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline ml-2 font-semibold cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>

              {/* ADVANCED QUESTION CARDS LIST */}
              <div className="flex flex-col gap-4">
                {filteredQuestions.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/80 dark:border-[#282A2C] text-center flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-slate-400">search_off</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Không tìm thấy câu hỏi phù hợp
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Thử điều chỉnh từ khóa tìm kiếm hoặc đổi tiêu chí phân loại Bloom/Chương học.
                    </p>
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`bg-white dark:bg-[#1E1F20] rounded-2xl p-5 border transition-all relative overflow-hidden group shadow-xs hover:shadow-sm ${
                          isSelected
                            ? 'border-blue-500 ring-1 ring-blue-500/20'
                            : 'border-slate-200/80 dark:border-[#282A2C] hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Top Card Info Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectQuestion(q.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                            />
                            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded">
                              {q.code}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${q.bloomColor}`}>
                              <span className="material-symbols-outlined text-[14px]">psychology</span>
                              {q.bloomLabel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                              {q.typeLabel}
                            </span>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewingQuestion(q);
                                setIsPreviewModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="Xem trước câu hỏi"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewQContent(q.content);
                                setNewQChapter(q.chapter);
                                setNewQPlo(q.plo);
                                setNewQBloom(q.bloomLevel);
                                setNewQDifficulty(q.difficultyLevel);
                                if (q.options) {
                                  setNewOptA(q.options[0]?.text || '');
                                  setNewOptB(q.options[1]?.text || '');
                                  setNewOptC(q.options[2]?.text || '');
                                  setNewOptD(q.options[3]?.text || '');
                                  const correct = q.options.find((o) => o.isCorrect)?.label || 'A';
                                  setNewCorrectOpt(correct as any);
                                }
                                setNewQExplanation(q.explanation);
                                setIsAddQuestionModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(q)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="Nhân bản"
                            >
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id, q.code)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Question Content Prompt */}
                        <div className="text-slate-900 dark:text-white text-sm mb-4 leading-relaxed font-normal">
                          {q.content}
                        </div>

                        {/* Option Preview Pills */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-xs">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-xl flex items-start gap-2 border transition-all ${
                                  opt.isCorrect
                                    ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-white font-medium'
                                    : 'bg-slate-50 dark:bg-[#131314] border-slate-200/60 dark:border-[#282A2C] text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {opt.isCorrect ? (
                                  <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                                    check_circle
                                  </span>
                                ) : (
                                  <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                    {opt.label}.
                                  </span>
                                )}
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Solution Note for Calculation Type */}
                        {q.solutionNote && (
                          <div className="p-3 bg-slate-50 dark:bg-[#131314] rounded-xl mb-4 flex items-center gap-2 text-slate-900 dark:text-white text-xs border border-slate-200/60 dark:border-[#282A2C]">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                              lightbulb
                            </span>
                            <span>{q.solutionNote}</span>
                          </div>
                        )}

                        {/* Question Metadata & Statistical Indicators */}
                        <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs border-t border-slate-100 dark:border-[#282A2C]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {q.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]"
                              >
                                {tag}
                              </span>
                            ))}
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
                              {q.plo}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                            <span className="flex items-center gap-1" title="Chỉ số phân hóa đề thi (D-Index)">
                              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
                                trending_up
                              </span>
                              Độ phân hóa: <strong className="text-slate-900 dark:text-white">{q.discriminationIndex}</strong>
                            </span>

                            <span className="flex items-center gap-1" title="Tỷ lệ sinh viên làm đúng (P-Value)">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">done_all</span>
                              Tỷ lệ đúng (P):{' '}
                              <strong className="text-slate-900 dark:text-white">{q.correctRate}%</strong>
                            </span>

                            {q.lastExamDate && (
                              <span className="text-slate-400 hidden sm:inline">
                                Lần thi gần nhất: {q.lastExamDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* PAGINATION AND BATCH CONTROLS FOOTER */}
              <div className="bg-white dark:bg-[#1E1F20] rounded-2xl p-4 border border-slate-200/80 dark:border-[#282A2C] shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedQuestionIds.length > 0 &&
                      selectedQuestionIds.length === filteredQuestions.length
                    }
                    onChange={handleSelectAllFiltered}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                    id="select-all"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer font-medium"
                  >
                    {selectedQuestionIds.length > 0
                      ? `Đã chọn ${selectedQuestionIds.length}/${filteredQuestions.length} câu hỏi`
                      : `Chọn tất cả ${filteredQuestions.length} câu hỏi trong chương`}
                  </label>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

                  <button
                    type="button"
                    onClick={handleExportMoodleXml}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    Xuất XML Moodle
                  </button>
                </div>

                {/* Pagination Number Pills */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white font-bold"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    3
                  </button>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    10
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: THÊM CÂU HỎI THỦ CÔNG */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-[#282A2C] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">add_circle</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thêm Câu hỏi mới vào Ngân hàng
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chương / Module học phần
                </label>
                <select
                  value={newQChapter}
                  onChange={(e) => setNewQChapter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                >
                  {subjectInfo.chapters.map((chap) => (
                    <option key={chap} value={chap}>
                      {chap}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thang đo Bloom
                  </label>
                  <select
                    value={newQBloom}
                    onChange={(e) => setNewQBloom(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                  >
                    <option value="BLOOM_1">Nhận biết (Bloom 1)</option>
                    <option value="BLOOM_2">Thông hiểu (Bloom 2)</option>
                    <option value="BLOOM_3">Vận dụng (Bloom 3)</option>
                    <option value="BLOOM_4">Vận dụng cao (Bloom 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Độ khó
                  </label>
                  <select
                    value={newQDifficulty}
                    onChange={(e) => setNewQDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                  >
                    <option value="EASY">Dễ (P &gt; 0.7)</option>
                    <option value="MEDIUM">Trung bình (0.4 - 0.7)</option>
                    <option value="HARD">Khó (P ≤ 0.4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chuẩn đầu ra (PLO)
                  </label>
                  <select
                    value={newQPlo}
                    onChange={(e) => setNewQPlo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                  >
                    <option value="PLO-01">PLO-01 (Lý thuyết nền tảng)</option>
                    <option value="PLO-02">PLO-02 (Kỹ năng thiết kế)</option>
                    <option value="PLO-03">PLO-03 (Phân tích &amp; Đánh giá)</option>
                    <option value="PLO-05">PLO-05 (Cấu hình &amp; Bảo mật)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newQContent}
                  onChange={(e) => setNewQContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi trắc nghiệm hoặc bài toán tính toán..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Các phương án lựa chọn (Chọn nút tròn để chỉ định đáp án đúng)
                </label>

                {[
                  { label: 'A', val: newOptA, setter: setNewOptA },
                  { label: 'B', val: newOptB, setter: setNewOptB },
                  { label: 'C', val: newOptC, setter: setNewOptC },
                  { label: 'D', val: newOptD, setter: setNewOptD },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={newCorrectOpt === item.label}
                      onChange={() => setNewCorrectOpt(item.label as any)}
                      className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className="font-bold w-4">{item.label}.</span>
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => item.setter(e.target.value)}
                      placeholder={`Nội dung phương án ${item.label}...`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lời giải chi tiết &amp; Giải thích đáp án
                </label>
                <textarea
                  rows={2}
                  value={newQExplanation}
                  onChange={(e) => setNewQExplanation(e.target.value)}
                  placeholder="Giải thích vì sao đáp án này đúng để hỗ trợ sinh viên sau khi thi..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hashtags phân loại (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={newQTags}
                  onChange={(e) => setNewQTags(e.target.value)}
                  placeholder="#OSPF, #Dijkstra, #Network"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveManualQuestion}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow"
              >
                Lưu vào Ngân hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO CÂU HỎI BẰNG AI */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-[#282A2C]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">auto_awesome</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tạo câu hỏi trắc nghiệm bằng AI (GPT-4o)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Yêu cầu / Ngữ cảnh sinh đề (Prompt)
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: Sinh các câu hỏi về cơ chế trao đổi LSA giữa ABR và ASBR..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số lượng câu muốn tạo
                  </label>
                  <select
                    value={aiQuestionCount}
                    onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                  >
                    <option value={3}>3 câu hỏi chuẩn hóa</option>
                    <option value={5}>5 câu hỏi chuẩn hóa</option>
                    <option value={10}>10 câu hỏi đa dạng Bloom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cấp độ tư duy Bloom trọng tâm
                  </label>
                  <select
                    value={aiTargetBloom}
                    onChange={(e) => setAiTargetBloom(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#131314] text-slate-900 dark:text-white border border-slate-200 dark:border-[#282A2C] outline-none"
                  >
                    <option value="BLOOM_3">Vận dụng (Bloom 3)</option>
                    <option value="BLOOM_4">Vận dụng cao (Bloom 4)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
                <span className="font-semibold block mb-0.5">Nguồn học liệu đối chiếu:</span>
                <span className="text-[11px] text-purple-700 dark:text-purple-400">
                  {subjectInfo.sourceDoc} ({subjectInfo.sourceDocStats})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isAiGenerating}
                onClick={handleGenerateAiQuestions}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow hover:brightness-105 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAiGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang bóc tách tri thức...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>Bắt đầu sinh câu hỏi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM TRƯỚC CHI TIẾT CÂU HỎI */}
      {isPreviewModalOpen && previewingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-[#282A2C]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                  {previewingQuestion.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${previewingQuestion.bloomColor}`}>
                  {previewingQuestion.bloomLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">
              {previewingQuestion.content}
            </div>

            {previewingQuestion.options && (
              <div className="space-y-2 mb-4 text-xs">
                {previewingQuestion.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border flex items-start gap-2 ${
                      opt.isCorrect
                        ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-300 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'bg-slate-50 dark:bg-[#131314] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt.label}.</span>
                    <span>{opt.text}</span>
                    {opt.isCorrect && (
                      <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-bold">
                        (Đáp án đúng)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-[#131314] rounded-xl text-xs border border-slate-200 dark:border-slate-700 mb-4">
              <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-1">
                Giải thích đáp án:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {previewingQuestion.explanation}
              </p>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SINH 4 MÃ ĐỀ NGẪU NHIÊN PREVIEW */}
      {isShuffleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-[#282A2C]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">shuffle</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Đã sinh 4 mã đề thi phái sinh ngẫu nhiên
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShuffleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Thuật toán đã đảo vị trí 20 câu hỏi và xáo trộn các phương án A-B-C-D nhằm chống gian lận thi cử.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              {['Mã đề 101', 'Mã đề 102', 'Mã đề 103', 'Mã đề 104'].map((code, idx) => (
                <div
                  key={code}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-700 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{code}</span>
                    <span className="text-[11px] font-mono text-blue-600 font-semibold">20 Câu</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Bảo mật: Hash code #{idx + 8291}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsShuffleModalOpen(false);
                  showToast('Đã tải xuống file gói 4 mã đề thi (PDF / Word)');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
              >
                Xuất file PDF 4 mã đề
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShuffleModalOpen(false);
                  handlePushBlueprintToQuiz();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow"
              >
                Tạo bài thi với 4 mã đề này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

