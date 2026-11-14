'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface ClassCourseMatrixViewProps {
  onSwitchView?: (view: 'cards' | 'matrix') => void;
  activeView?: 'cards' | 'matrix';
  onToast?: (msg: string) => void;
}

interface MatrixCourse {
  code: string;
  name: string;
  instructor: string;
  credits: number;
  quizzesCount: number;
  passRate?: number;
  urgentCount?: number;
  tag?: string;
  tagType?: 'urgent' | 'plo' | 'advanced' | 'completed';
  note?: string;
}

interface MatrixClass {
  id: string;
  code: string;
  name: string;
  tag: string;
  studentsCount: number;
  statLabel: string;
  statValue: string;
}

interface MatrixAssessmentItem {
  id: string;
  title: string;
  type: 'quiz' | 'lab' | 'flashcard' | 'exam';
  status: 'urgent' | 'open' | 'completed' | 'locked' | 'exempt';
  timeRemaining?: string;
  dueDateLabel?: string;
  score?: string;
  description?: string;
  isShared?: boolean;
  sharedWith?: string;
  canRetake?: boolean;
  retakeMultiplier?: string;
}

interface MatrixCell {
  classCode: string;
  courseCode: string;
  statusType: 'active' | 'shared' | 'completed' | 'locked' | 'exempt';
  headerTitle: string;
  badge?: string;
  items: MatrixAssessmentItem[];
  emptyMessage?: string;
  emptySub?: string;
}

export function ClassCourseMatrixView({
  onSwitchView,
  activeView = 'matrix',
  onToast = () => {},
}: ClassCourseMatrixViewProps) {
  const router = useRouter();

  // Filter States
  const [selectedSemester, setSelectedSemester] = useState('2024.2');
  const [selectedType, setSelectedType] = useState<'all' | 'quiz' | 'lab' | 'flashcard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUrgentOnly, setIsUrgentOnly] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);

  // Modal & Selection States
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);
  const [isCrossAssignOpen, setIsCrossAssignOpen] = useState(false);
  const [crossAssignForm, setCrossAssignForm] = useState({
    sourceClass: 'CS-202 Nhóm 01',
    sourceCourse: 'CS-202',
    targetClass: 'CNTT-K22-01',
    assessmentName: 'Quiz 03: Tầng Giao vận TCP/UDP',
  });

  // Toast feedback
  const [localToast, setLocalToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setLocalToast(msg);
    onToast(msg);
    setTimeout(() => setLocalToast(null), 3000);
  };

  // 1. Matrix Columns (Courses)
  const courses: MatrixCourse[] = [
    {
      code: 'CS-202',
      name: 'Mạng máy tính & TT Dữ liệu',
      instructor: 'TS. Lê Hoàng Nam',
      credits: 3,
      quizzesCount: 12,
      passRate: 91,
      urgentCount: 2,
      tag: '2 bài gấp',
      tagType: 'urgent',
    },
    {
      code: 'CS-102',
      name: 'Cấu trúc Dữ liệu & Giải thuật',
      instructor: 'PGS.TS Trần Văn Thành',
      credits: 4,
      quizzesCount: 18,
      tag: 'Chuẩn PLO-01',
      tagType: 'plo',
      note: 'Retake: Đang bật',
    },
    {
      code: 'CS-301',
      name: 'Thiết kế Thuật toán & Đồ thị',
      instructor: 'TS. Đặng Hoàng Giang',
      credits: 3,
      quizzesCount: 8,
      tag: 'Nâng cao',
      tagType: 'advanced',
      note: 'Đang khóa 1 phần',
    },
    {
      code: 'IT-105',
      name: 'Lập trình C++ Nâng cao',
      instructor: 'ThS. Vũ Minh Trí',
      credits: 3,
      quizzesCount: 10,
      tag: '98% Hoàn thành',
      tagType: 'completed',
      note: 'Đã đóng sổ điểm',
    },
  ];

  // 2. Matrix Rows (Classes)
  const classes: MatrixClass[] = [
    {
      id: 'cls-1',
      code: 'CS-202 Nhóm 01',
      name: 'Lớp chuyên ngành K22',
      tag: 'K22',
      studentsCount: 48,
      statLabel: '88% nộp đủ',
      statValue: '88%',
    },
    {
      id: 'cls-2',
      code: 'CNTT-K22-01',
      name: 'Lớp sinh hoạt Khóa 22 (Đại trà)',
      tag: 'K22',
      studentsCount: 52,
      statLabel: 'Tiến độ: 74%',
      statValue: '74%',
    },
    {
      id: 'cls-3',
      code: 'Tuyển ICPC-2024A',
      name: 'Đội tuyển thuật toán thi đấu',
      tag: 'CHUYÊN BIỆT',
      studentsCount: 24,
      statLabel: 'Top 1 Hệ thống',
      statValue: 'Top 1',
    },
    {
      id: 'cls-4',
      code: 'KTPM-K21-02',
      name: 'Lớp Kỹ thuật phần mềm Khóa 21',
      tag: 'K21',
      studentsCount: 45,
      statLabel: 'Đồ án kỳ 6',
      statValue: 'Kỳ 6',
    },
  ];

  // 3. Matrix 16 Cross-Cells Database
  const matrixCells: Record<string, MatrixCell> = {
    // Row 1: CS-202 Nhóm 01
    'CS-202 Nhóm 01__CS-202': {
      classCode: 'CS-202 Nhóm 01',
      courseCode: 'CS-202',
      statusType: 'active',
      headerTitle: '3 Bài tập liên kết',
      badge: '67% xong',
      items: [
        {
          id: 'q-3',
          title: 'Quiz 03: Tầng Giao vận TCP/UDP',
          type: 'quiz',
          status: 'urgent',
          timeRemaining: 'Còn 18h để nộp',
          description: 'Kiểm tra cơ chế bắt tay 3 bước SYN/ACK và thuật toán trượt cửa sổ TCP',
        },
        {
          id: 'lab-4',
          title: 'Lab 04: Bắt gói tin Wireshark',
          type: 'lab',
          status: 'open',
          dueDateLabel: 'Hạn: 3 ngày',
          description: 'Bắt tay 3 bước TCP SYN-ACK trên máy ảo thực nghiệm',
        },
        {
          id: 'q-1',
          title: 'Quiz 01: Mô hình OSI 7 tầng',
          type: 'quiz',
          status: 'completed',
          score: '9.5/10',
          description: 'Phân tích chức năng và giao thức từng tầng mạng',
        },
      ],
    },
    'CS-202 Nhóm 01__CS-102': {
      classCode: 'CS-202 Nhóm 01',
      courseCode: 'CS-102',
      statusType: 'completed',
      headerTitle: 'Bộ Flashcard & Thực hành',
      badge: '100%',
      items: [
        {
          id: 'q-4',
          title: 'Quiz 04: Cây nhị phân tìm kiếm BST',
          type: 'quiz',
          status: 'completed',
          score: '8.8/10',
          description: 'Thao tác chèn, xóa và duyệt cây BST',
        },
        {
          id: 'fc-1',
          title: 'Flashcard Cây AVL (24 thẻ)',
          type: 'flashcard',
          status: 'completed',
          score: '24/24 đã thuộc',
          description: 'Quy tắc cân bằng quay đơn và quay kép',
        },
      ],
    },
    'CS-202 Nhóm 01__CS-301': {
      classCode: 'CS-202 Nhóm 01',
      courseCode: 'CS-301',
      statusType: 'locked',
      headerTitle: 'Chưa có bài tập phân bổ',
      emptyMessage: 'Chưa có bài tập phân bổ',
      emptySub: 'Lộ trình học kỳ sau',
      items: [],
    },
    'CS-202 Nhóm 01__IT-105': {
      classCode: 'CS-202 Nhóm 01',
      courseCode: 'IT-105',
      statusType: 'completed',
      headerTitle: 'Đã nghiệm thu',
      badge: 'Điểm TB: 9.1',
      items: [
        {
          id: 'final-cpp',
          title: 'Đề thi cuối kỳ C++ OOP',
          type: 'exam',
          status: 'completed',
          score: '9.2/10',
          description: 'Kế thừa đa hình, Virtual Table và Smart Pointers',
        },
      ],
    },

    // Row 2: CNTT-K22-01
    'CNTT-K22-01__CS-202': {
      classCode: 'CNTT-K22-01',
      courseCode: 'CS-202',
      statusType: 'shared',
      headerTitle: 'Dùng chung đề: CS-202 Nhóm 01',
      badge: 'Còn 18h',
      items: [
        {
          id: 'q-3-shared',
          title: 'Quiz 03: Tầng Giao vận TCP/UDP',
          type: 'quiz',
          status: 'urgent',
          timeRemaining: 'Hạn nộp hôm nay 23:59',
          isShared: true,
          sharedWith: 'CS-202 Nhóm 01',
          description: 'Bộ câu hỏi trắc nghiệm đồng bộ chuẩn ngân hàng câu hỏi dùng chung',
        },
        {
          id: 'q-1-shared',
          title: 'Quiz 01: OSI 7 tầng',
          type: 'quiz',
          status: 'completed',
          score: '9.0/10',
        },
      ],
    },
    'CNTT-K22-01__CS-102': {
      classCode: 'CNTT-K22-01',
      courseCode: 'CS-102',
      statusType: 'shared',
      headerTitle: 'Học phần Bắt buộc',
      badge: 'SHARED',
      items: [
        {
          id: 'fc-shared',
          title: 'Flashcard Cây & Đồ thị',
          type: 'flashcard',
          status: 'open',
          description: 'Dùng chung ngân hàng câu hỏi',
          isShared: true,
        },
        {
          id: 'q-4-shared',
          title: 'Quiz 04: Heap & BST',
          type: 'quiz',
          status: 'completed',
          score: '9.2/10',
        },
      ],
    },
    'CNTT-K22-01__CS-301': {
      classCode: 'CNTT-K22-01',
      courseCode: 'CS-301',
      statusType: 'locked',
      headerTitle: 'Mở định kỳ',
      items: [
        {
          id: 'q-dijkstra',
          title: 'Quiz 02: Dijkstra & Bellman-Ford',
          type: 'quiz',
          status: 'locked',
          dueDateLabel: 'Mở làm bài sau 2 ngày',
          description: '18 câu trắc nghiệm thuật toán đường đi ngắn nhất',
        },
      ],
    },
    'CNTT-K22-01__IT-105': {
      classCode: 'CNTT-K22-01',
      courseCode: 'IT-105',
      statusType: 'exempt',
      headerTitle: 'Đã miễn thi chuyển điểm',
      emptyMessage: '—',
      emptySub: 'Đã miễn thi chuyển điểm',
      items: [],
    },

    // Row 3: Tuyển ICPC-2024A
    'Tuyển ICPC-2024A__CS-202': {
      classCode: 'Tuyển ICPC-2024A',
      courseCode: 'CS-202',
      statusType: 'exempt',
      headerTitle: 'Miễn kiểm tra lý thuyết mạng',
      emptyMessage: 'Miễn kiểm tra lý thuyết mạng',
      emptySub: 'Đặc cách điểm A',
      items: [],
    },
    'Tuyển ICPC-2024A__CS-102': {
      classCode: 'Tuyển ICPC-2024A',
      courseCode: 'CS-102',
      statusType: 'active',
      headerTitle: 'ĐỘC QUYỀN NÂNG CAO',
      badge: 'PLO-01 Đạt',
      items: [
        {
          id: 'q-seg',
          title: 'Quiz 05: Segment Tree & Fenwick',
          type: 'quiz',
          status: 'urgent',
          timeRemaining: 'Còn 18h',
          description: 'Cây phân đoạn động và cây chỉ số nhị phân Fenwick Tree',
          canRetake: true,
          retakeMultiplier: '+0.5x',
          score: 'Lần 1: 6.8/10',
        },
        {
          id: 'fc-icpc',
          title: '30 Kỹ thuật Cây & Đồ thị',
          type: 'flashcard',
          status: 'open',
          score: '57%',
          description: '17/30 thẻ thấu suốt hoàn toàn',
        },
        {
          id: 'mock-midterm',
          title: 'Đề mô phỏng Giữa kỳ',
          type: 'exam',
          status: 'completed',
          score: '8.8 (Top 5%)',
        },
      ],
    },
    'Tuyển ICPC-2024A__CS-301': {
      classCode: 'Tuyển ICPC-2024A',
      courseCode: 'CS-301',
      statusType: 'active',
      headerTitle: 'Bài tập Chuyên đề',
      badge: 'Thực hành',
      items: [
        {
          id: 'lab-maxflow',
          title: 'Lab 02: Max Flow & Dinic Algorithm',
          type: 'lab',
          status: 'open',
          dueDateLabel: 'Hạn nộp: 25/10',
          description: 'Triển khai luồng cực đại trên đồ thị phẳng (C++17 / Clang)',
        },
      ],
    },
    'Tuyển ICPC-2024A__IT-105': {
      classCode: 'Tuyển ICPC-2024A',
      courseCode: 'IT-105',
      statusType: 'completed',
      headerTitle: 'TEMPLATE METAPROGRAMMING',
      badge: '10/10',
      items: [
        {
          id: 'golf-cpp',
          title: 'Modern C++ Code Golf',
          type: 'exam',
          status: 'completed',
          score: 'Passed',
        },
      ],
    },

    // Row 4: KTPM-K21-02
    'KTPM-K21-02__CS-202': {
      classCode: 'KTPM-K21-02',
      courseCode: 'CS-202',
      statusType: 'active',
      headerTitle: 'HỌC LẠI / CẢI THIỆN',
      badge: '1 bài nợ',
      items: [
        {
          id: 'q-ip',
          title: 'Quiz 02: Định tuyến IP',
          type: 'quiz',
          status: 'urgent',
          timeRemaining: 'Hạn chót bù điểm: 24h',
          description: 'Subnetting CIDR, VLSM và giao thức RIP/OSPF',
        },
      ],
    },
    'KTPM-K21-02__CS-102': {
      classCode: 'KTPM-K21-02',
      courseCode: 'CS-102',
      statusType: 'completed',
      headerTitle: 'Đã hoàn thành học phần',
      emptyMessage: 'Đã hoàn thành học phần',
      emptySub: 'Kỳ 2023.1',
      items: [],
    },
    'KTPM-K21-02__CS-301': {
      classCode: 'KTPM-K21-02',
      courseCode: 'CS-301',
      statusType: 'locked',
      headerTitle: 'Thực hành Đồ thị',
      badge: 'Tuần 8',
      items: [
        {
          id: 'lab-neo4j',
          title: 'Lab: Graph Database & Neo4j',
          type: 'lab',
          status: 'locked',
          dueDateLabel: 'SẮP MỞ',
          description: 'Mô hình hóa dữ liệu dạng đồ thị với Cypher Query',
        },
      ],
    },
    'KTPM-K21-02__IT-105': {
      classCode: 'KTPM-K21-02',
      courseCode: 'IT-105',
      statusType: 'exempt',
      headerTitle: 'Không thuộc khung CTĐT',
      emptyMessage: '—',
      emptySub: 'Không thuộc khung CTĐT',
      items: [],
    },
  };

  // Filtered Matrix Logic
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classes;
    const q = searchQuery.toLowerCase().trim();
    return classes.filter(
      (cls) =>
        cls.code.toLowerCase().includes(q) ||
        cls.name.toLowerCase().includes(q) ||
        cls.tag.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const handleCellClick = (clsCode: string, courseCode: string) => {
    const key = `${clsCode}__${courseCode}`;
    const cell = matrixCells[key];
    if (cell) {
      setSelectedCell(cell);
    }
  };

  const handleExportMatrix = () => {
    triggerToast('Đang xuất ma trận phân bổ đề thi (Matrix-Class-Course.xlsx)...');
    setTimeout(() => {
      triggerToast('Đã tải xuống tệp ma trận thành công!');
    }, 1200);
  };

  const handleDownloadMissingStudents = () => {
    triggerToast('Đang tạo báo cáo danh sách sinh viên chưa hoàn thành bài tập (CSV)...');
    setTimeout(() => {
      triggerToast('Đã tải xuống danh-sach-sinh-vien-thieu-bai.csv!');
    }, 1200);
  };

  const handleCrossAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCrossAssignOpen(false);
    triggerToast(
      `Đã đề xuất gán chéo thành công bài "${crossAssignForm.assessmentName}" từ lớp ${crossAssignForm.sourceClass} sang lớp ${crossAssignForm.targetClass}!`
    );
  };

  return (
    <div className="flex flex-col w-full text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{localToast}</span>
        </div>
      )}

      {/* Top Navigation & View Switcher Bar */}
      <div className="w-full bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Không gian khảo thí & Đánh giá năng lực
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Học kỳ 2024.2 (Chính quy)
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => onSwitchView?.('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'cards'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Dạng thẻ bài tập</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchView?.('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'matrix'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              table_chart
            </span>
            <span>Ma trận Lớp - Môn (N : N)</span>
            <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] rounded-full font-bold">
              ACTIVE
            </span>
          </button>
        </div>
      </div>

      {/* Main Hero / Technical Banner with 3px border */}
      <div className="pt-6 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border-[3px] border-slate-700/80">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 uppercase tracking-wide border border-blue-400/30">
                <span className="material-symbols-outlined text-[15px]">device_hub</span>
                Cấu trúc đa quan hệ N : N (Classes ↔ Courses)
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white">
                Ma trận Phân bổ Đề thi & Bài tập
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Mô hình trực quan hoá 2 chiều N : N liên kết giữa{' '}
                <strong className="text-white font-semibold">Lớp sinh hoạt chuyên đề</strong> và{' '}
                <strong className="text-white font-semibold">Học phần chuyên môn</strong>. Hỗ trợ
                theo dõi bài kiểm tra dùng chung (shared pool), mức độ bao phủ chuẩn đầu ra (PLO) và
                kiểm soát hạn nộp cấp thiết trong 48h.
              </p>
            </div>

            {/* Stats Card */}
            <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-[22px]">join_inner</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-blue-200">Tỷ lệ hội tụ N:N</p>
                  <p className="text-base sm:text-lg font-bold text-white">16 / 16 Giao điểm</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-blue-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Đồng bộ thời gian thực theo LMS Core</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Controls & Filter Bar with 3px border */}
      <div className="pb-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Left Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Semester Select */}
            <div className="min-w-[160px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Kỳ khảo thí
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="2024.2">Học kỳ 2024.2</option>
                <option value="2024.1">Học kỳ 2024.1</option>
                <option value="2023.2">Học kỳ 2023.2</option>
              </select>
            </div>

            {/* Assessment Type Select */}
            <div className="min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Hình thức đánh giá
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="all">Tất cả hình thức (Quiz, Lab, Card)</option>
                <option value="quiz">Chỉ bài kiểm tra Trắc nghiệm (Quiz)</option>
                <option value="lab">Chỉ bài thực hành & Lab Terminal</option>
                <option value="flashcard">Chỉ bộ thẻ ghi nhớ (Flashcard)</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Tìm nhanh
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm đề thi, mã môn CS-..., tên lớp..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>

          {/* Right Toggles & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 xl:pt-0">
            {/* Urgent Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsUrgentOnly(!isUrgentOnly);
                triggerToast(
                  !isUrgentOnly
                    ? 'Đang lọc hiển thị chỉ các bài tập cần làm gấp (< 24h)!'
                    : 'Đã hiển thị lại toàn bộ ma trận bài tập.'
                );
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isUrgentOnly
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">notification_important</span>
              <span>Chỉ bài cần làm gấp</span>
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                4
              </span>
            </button>

            {/* Metrics Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowMetrics(!showMetrics);
                triggerToast(
                  !showMetrics
                    ? 'Đã bật hiển thị điểm số & phần trăm tiến độ.'
                    : 'Đã ẩn phần trăm tiến độ để tinh gọn giao diện.'
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showMetrics
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">percent</span>
              <span>{showMetrics ? 'Đang hiện tiến độ' : 'Hiện tiến độ & Điểm số'}</span>
            </button>

            {/* Export Action */}
            <button
              type="button"
              onClick={handleExportMatrix}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer shadow-xs ml-auto"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              <span>Xuất ma trận</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="pb-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600">palette</span>
            Quy ước ma trận:
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Cần làm gấp (&lt; 24h)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Đang mở làm bài / Luyện tập</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Đã hoàn thành chuẩn PLO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Chưa mở / Đặt lịch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">link</span>
            <span>Bài tập dùng chung (Shared Pool)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-slate-400 text-[11px]">
            <span className="material-symbols-outlined text-[15px]">touch_app</span>
            <span>Nhấp vào ô để xem danh sách câu hỏi & nộp bài</span>
          </div>
        </div>
      </div>

      {/* 2D Interactive Cross-Matrix Table with 3px border */}
      <div className="pb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-[3px] border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left border-collapse min-w-[1240px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  {/* Top-Left Axis Junction Header (Sticky both X and Y) */}
                  <th
                    scope="col"
                    className="sticky left-0 top-0 z-30 bg-slate-200/90 dark:bg-slate-800/90 backdrop-blur-md p-4 w-72 min-w-[280px] shadow-[2px_0_8px_rgba(0,0,0,0.04)] border-r border-slate-300 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        TRỤC MA TRẬN
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold shadow-xs">
                        {filteredClasses.length} × {filteredCourses.length} NODES
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[12px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                          <span className="material-symbols-outlined text-[15px] text-blue-600">
                            view_column
                          </span>
                          Cột: Môn học liên kết
                        </span>
                        <span className="text-[11px] text-slate-400">Học phần</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                          <span className="material-symbols-outlined text-[15px] text-blue-600">
                            table_rows
                          </span>
                          Hàng: Lớp sinh hoạt
                        </span>
                        <span className="text-[11px] text-slate-400">Đối tượng</span>
                      </div>
                    </div>
                  </th>

                  {/* Course Columns (X-Axis) */}
                  {filteredCourses.map((course) => (
                    <th
                      key={course.code}
                      scope="col"
                      className="p-4 w-80 min-w-[310px] align-top bg-slate-100 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-800 last:border-r-0"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-900">
                            {course.code}
                          </span>
                          {course.tag && (
                            <span
                              className={`text-[11px] font-semibold flex items-center gap-1 ${
                                course.tagType === 'urgent'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : course.tagType === 'completed'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {course.tagType === 'urgent' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              )}
                              {course.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                          {course.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">
                            account_circle
                          </span>
                          <span className="truncate">{course.instructor}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/70 dark:border-slate-800">
                          <span>
                            {course.credits} Tín chỉ • {course.quizzesCount} Quiz
                          </span>
                          {showMetrics && (
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {course.passRate ? `Tỷ lệ qua: ${course.passRate}%` : course.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
                {filteredClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Row Header (Y-Axis) */}
                    <th
                      scope="row"
                      className="sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 p-4 align-top shadow-[2px_0_8px_rgba(0,0,0,0.04)] border-r border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {cls.code}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                            {cls.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {cls.name}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">group</span>
                            {cls.studentsCount} sinh viên
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="material-symbols-outlined text-[15px]">check_circle</span>
                            {cls.statLabel}
                          </span>
                        </div>
                      </div>
                    </th>

                    {/* Matrix Cells */}
                    {filteredCourses.map((course) => {
                      const key = `${cls.code}__${course.code}`;
                      const cell = matrixCells[key];

                      if (!cell) {
                        return (
                          <td
                            key={key}
                            className="p-3 align-top border-r border-slate-200 dark:border-slate-800 last:border-r-0"
                          >
                            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                              Chưa có liên kết
                            </div>
                          </td>
                        );
                      }

                      // Check urgent filter
                      const hasUrgent = cell.items.some((i) => i.status === 'urgent');
                      if (isUrgentOnly && !hasUrgent) {
                        return (
                          <td
                            key={key}
                            className="p-3 align-top border-r border-slate-200 dark:border-slate-800 last:border-r-0 opacity-30"
                          >
                            <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800/30 text-center text-xs text-slate-400">
                              Không có bài gấp
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={key}
                          onClick={() => handleCellClick(cls.code, course.code)}
                          className="p-2.5 align-top border-r border-slate-200 dark:border-slate-800 last:border-r-0 cursor-pointer"
                        >
                          {cell.statusType === 'locked' || cell.statusType === 'exempt' ? (
                            <div className="rounded-xl p-3.5 bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 h-full flex flex-col items-center justify-center text-center min-h-[140px] hover:border-slate-300 transition-colors">
                              <span className="material-symbols-outlined text-[24px] text-slate-300 dark:text-slate-600 mb-1">
                                {cell.statusType === 'locked' ? 'lock_clock' : 'verified_user'}
                              </span>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {cell.emptyMessage}
                              </p>
                              <span className="text-[11px] text-slate-400 mt-0.5">
                                {cell.emptySub}
                              </span>
                            </div>
                          ) : (
                            <div className="rounded-xl p-3 bg-white dark:bg-slate-800/80 shadow-xs hover:shadow-md border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col gap-2">
                              {/* Cell Header */}
                              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate max-w-[180px]">
                                  {cell.headerTitle}
                                </span>
                                {showMetrics && cell.badge && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                      cell.badge.includes('18h') || cell.badge.includes('nợ')
                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    }`}
                                  >
                                    {cell.badge}
                                  </span>
                                )}
                              </div>

                              {/* Items list */}
                              {cell.items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`p-2.5 rounded-lg flex flex-col gap-1 transition-all ${
                                    item.status === 'urgent'
                                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60'
                                      : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span
                                        className={`material-symbols-outlined text-[16px] shrink-0 ${
                                          item.status === 'urgent'
                                            ? 'text-rose-600'
                                            : item.status === 'completed'
                                            ? 'text-emerald-600'
                                            : 'text-blue-600'
                                        }`}
                                      >
                                        {item.status === 'urgent'
                                          ? 'timer'
                                          : item.status === 'completed'
                                          ? 'task_alt'
                                          : 'assignment'}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                        {item.title}
                                      </span>
                                    </div>

                                    {item.status === 'urgent' && (
                                      <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                                        Gấp
                                      </span>
                                    )}
                                  </div>

                                  {/* Sub-info / Action Row */}
                                  <div className="flex items-center justify-between text-[11px] pt-1">
                                    {item.timeRemaining ? (
                                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[13px]">
                                          schedule
                                        </span>
                                        {item.timeRemaining}
                                      </span>
                                    ) : item.dueDateLabel ? (
                                      <span className="text-slate-500 dark:text-slate-400">
                                        {item.dueDateLabel}
                                      </span>
                                    ) : item.score ? (
                                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px]">
                                        {item.score}
                                      </span>
                                    ) : null}

                                    {/* Quick Actions */}
                                    {item.status === 'urgent' ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerToast(`Đang mở bài làm: ${item.title}`);
                                          router.push('/assignments');
                                        }}
                                        className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 cursor-pointer"
                                      >
                                        Làm bài
                                      </button>
                                    ) : item.canRetake ? (
                                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                                        Retake {item.retakeMultiplier}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Action Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[18px] text-blue-600">info</span>
              <span>
                Bạn đang ở chế độ xem ma trận phân bổ 2 chiều. Dữ liệu nộp bài đồng bộ thời gian thực
                theo LMS Core.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadMissingStudents}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold cursor-pointer shadow-xs"
              >
                Tải danh sách SV thiếu bài (CSV)
              </button>
              <button
                type="button"
                onClick={() => setIsCrossAssignOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>+ Đề xuất gán chéo đề thi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Performance Summary Rail / Bottom Analytics Drawer with 3px border */}
      <div className="pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-sm border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-5">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">analytics</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Tổng hợp Hiệu suất Đa quan hệ N : N
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Báo cáo tóm tắt phân bổ 48 bài tập trên toàn bộ 8 nút giao thực thi
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống Khảo thí Vận hành Bình thường
            </span>
          </div>

          {/* 4-Column Bento Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tổng số bài tập phân bổ
                </span>
                <span className="material-symbols-outlined text-[20px] text-blue-600">
                  assignment
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  48 <span className="text-xs text-slate-500 font-normal">đề thi & quiz</span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                  Phân bổ tại 8 nút giao N:N
                </p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Lớp dẫn đầu tiến độ
                </span>
                <span className="material-symbols-outlined text-[20px] text-emerald-600">
                  military_tech
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  88% <span className="text-xs text-slate-500 font-normal">hoàn tất</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 truncate">
                  Tuyển ICPC-2024A (24 SV)
                </p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-rose-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Học phần có bài nộp gấp
                </span>
                <span className="material-symbols-outlined text-[20px]">alarm</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  CS-202{' '}
                  <span className="text-xs text-rose-700/80 dark:text-rose-300/80 font-normal">
                    Mạng máy tính
                  </span>
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                  2 bài cần nộp trong vòng 24h
                </p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Tỷ lệ Đề dùng chung
                </span>
                <span className="material-symbols-outlined text-[20px] text-blue-600">hub</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  42.5% <span className="text-xs text-slate-500 font-normal">ngân hàng chung</span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                  Tiết kiệm 38 giờ biên soạn đề
                </p>
              </div>
            </div>
          </div>

          {/* Action Banner inside Drawer */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[30px] text-rose-400 shrink-0">
                warning
              </span>
              <div>
                <p className="text-sm font-bold text-white">
                  Bạn có 1 bài trắc nghiệm quan trọng còn dưới 18 giờ
                </p>
                <p className="text-xs text-slate-300">
                  Quiz 03: Tầng Giao vận TCP/UDP thuộc môn CS-202 Mạng máy tính.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => triggerToast('Đang tải phân tích ma trận PLO chi tiết...')}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Xem phân tích PLO
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast('Đang mở không gian làm bài Quiz 03...');
                  router.push('/assignments');
                }}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Làm bài tập gấp ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border-[3px] border-slate-300 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
                  {selectedCell.courseCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedCell.classCode}
                </h3>
                <p className="text-xs text-slate-500">{selectedCell.headerTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {selectedCell.items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-1">
                <span className="material-symbols-outlined text-3xl text-slate-400">
                  inbox
                </span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedCell.emptyMessage || 'Không có bài tập nào'}
                </p>
                <p className="text-[11px] text-slate-400">{selectedCell.emptySub}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {selectedCell.items.map((it) => (
                  <div
                    key={it.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            it.status === 'urgent'
                              ? 'text-rose-600'
                              : it.status === 'completed'
                              ? 'text-emerald-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {it.type === 'lab'
                            ? 'terminal'
                            : it.type === 'flashcard'
                            ? 'style'
                            : 'assignment'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {it.title}
                        </h4>
                      </div>
                      {it.status === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                          Gấp
                        </span>
                      )}
                    </div>

                    {it.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {it.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2">
                        {it.timeRemaining && (
                          <span className="text-rose-600 font-semibold">{it.timeRemaining}</span>
                        )}
                        {it.score && (
                          <span className="font-bold text-emerald-600 font-mono">{it.score}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCell(null);
                          triggerToast(`Đang mở: ${it.title}`);
                          router.push('/assignments');
                        }}
                        className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {it.status === 'completed'
                          ? 'Xem lại kết quả'
                          : it.type === 'lab'
                          ? 'Mở Terminal Lab'
                          : 'Bắt đầu làm bài'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Assign Proposal Modal */}
      {isCrossAssignOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCrossAssignSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-[3px] border-slate-300 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Đề xuất gán chéo đề thi (N : N)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chia sẻ bài tập dùng chung giữa các lớp và môn học liên kết
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCrossAssignOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Đề thi / Bài tập nguồn
                </label>
                <input
                  type="text"
                  value={crossAssignForm.assessmentName}
                  onChange={(e) =>
                    setCrossAssignForm((prev) => ({ ...prev, assessmentName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lớp nguồn
                  </label>
                  <select
                    value={crossAssignForm.sourceClass}
                    onChange={(e) =>
                      setCrossAssignForm((prev) => ({ ...prev, sourceClass: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {classes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Học phần áp dụng
                  </label>
                  <select
                    value={crossAssignForm.sourceCourse}
                    onChange={(e) =>
                      setCrossAssignForm((prev) => ({ ...prev, sourceCourse: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Đích gán chéo (Target Class)
                </label>
                <select
                  value={crossAssignForm.targetClass}
                  onChange={(e) =>
                    setCrossAssignForm((prev) => ({ ...prev, targetClass: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {classes
                    .filter((c) => c.code !== crossAssignForm.sourceClass)
                    .map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.name})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">
                  info
                </span>
                <p className="text-[11px] leading-relaxed">
                  Khi gán chéo, ngân hàng câu hỏi sẽ được liên kết ở trạng thái Shared Pool. Mọi cập
                  nhật đề gốc sẽ tự động đồng bộ sang lớp đích.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCrossAssignOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Xác nhận gán chéo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
