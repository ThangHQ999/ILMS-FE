'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface StudentCompetencyMapViewProps {
  userFullName?: string;
  onToast?: (msg: string) => void;
  onSwitchToFocus?: () => void;
  onOpenRadarView?: () => void;
  onOpenHeatmap?: () => void;
}

export interface MapSkillNode {
  id: string;
  code: string;
  title: string;
  alias?: string;
  stageNumber: number;
  stageTitle: string;
  status: 'mastered' | 'learning' | 'locked' | 'unlocked';
  isV25New?: boolean;
  priorityLevel?: number;
  masteryPercent: number;
  scoreDisplay?: string;
  complexity: string;
  shortDesc: string;
  prerequisites: { name: string; percent: number; isMet: boolean }[];
  learningObjectives: string[];
}

export function StudentCompetencyMapView({
  userFullName = 'Trần Nhật Minh',
  onToast = () => {},
  onSwitchToFocus,
  onOpenRadarView,
  onOpenHeatmap,
}: StudentCompetencyMapViewProps) {
  const router = useRouter();

  // Filter & Toolbar States
  const [filterType, setFilterType] = useState<
    'all' | 'new_v25' | 'mastered' | 'reinforcing' | 'prereq'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Modal States
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isAiTutorModalOpen, setIsAiTutorModalOpen] = useState(false);
  const [diagnosticAnswer, setDiagnosticAnswer] = useState<number | null>(null);
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState(false);

  // Local Toast
  const [localToast, setLocalToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setLocalToast(msg);
    onToast(msg);
    setTimeout(() => setLocalToast(null), 3200);
  };

  // Skill Tree Data (12 Nodes across 4 Stages)
  const allNodes: MapSkillNode[] = useMemo(
    () => [
      // Stage 1
      {
        id: 'node-1',
        code: 'ENT-CS202-011',
        title: 'Mảng & Con trỏ C++',
        stageNumber: 1,
        stageTitle: 'Nền tảng Cấu trúc Tuyến tính & Đệ quy',
        status: 'mastered',
        masteryPercent: 100,
        scoreDisplay: '10/10',
        complexity: 'O(1) / O(N)',
        shortDesc: 'Quản lý bộ nhớ Heap, biến con trỏ cấp 1/2 và cấp phát mảng động.',
        prerequisites: [{ name: 'Lập trình C++ Cơ sở', percent: 100, isMet: true }],
        learningObjectives: [
          'Thao tác thuần thục số học con trỏ (Pointer Arithmetic).',
          'Tránh triệt để rò rỉ bộ nhớ (Memory Leak) bằng toán tử delete/delete[].',
        ],
      },
      {
        id: 'node-2',
        code: 'ENT-CS202-012',
        title: 'Danh sách liên kết',
        stageNumber: 1,
        stageTitle: 'Nền tảng Cấu trúc Tuyến tính & Đệ quy',
        status: 'mastered',
        masteryPercent: 100,
        scoreDisplay: '10/10',
        complexity: 'O(1) chèn đầu',
        shortDesc: 'Singly Linked List, Doubly Linked List và Circular Linked List.',
        prerequisites: [{ name: 'Mảng & Con trỏ C++', percent: 100, isMet: true }],
        learningObjectives: [
          'Cài đặt nút (Node) và liên kết con trỏ next/prev.',
          'Thuật toán đảo ngược danh sách liên kết trong O(1) bộ nhớ phụ.',
        ],
      },
      {
        id: 'node-3',
        code: 'ENT-CS202-022',
        title: 'Đệ quy & Quay lui',
        stageNumber: 1,
        stageTitle: 'Nền tảng Cấu trúc Tuyến tính & Đệ quy',
        status: 'mastered',
        masteryPercent: 95,
        scoreDisplay: '9.5/10',
        complexity: 'O(2^N)',
        shortDesc: 'Cơ chế Call Stack, điều kiện dừng Base Case và nhánh cận Backtracking.',
        prerequisites: [{ name: 'Đệ quy cơ bản', percent: 95, isMet: true }],
        learningObjectives: [
          'Phân tích cây đệ quy và phát hiện tràn ngăn xếp (Stack Overflow).',
          'Áp dụng quay lui giải bài toán 8 quân hậu và Sudoku Solver.',
        ],
      },

      // Stage 2 (V2.5 Focus)
      {
        id: 'node-4',
        code: 'ENT-CS202-041',
        title: 'Cây nhị phân tìm kiếm (BST)',
        stageNumber: 2,
        stageTitle: 'Cây Cân Bằng & Cấu Trúc Thứ Bậc',
        status: 'mastered',
        masteryPercent: 92,
        scoreDisplay: '9.2/10',
        complexity: 'O(log N) -> O(N)',
        shortDesc: 'Duyệt inorder, preorder, postorder & nguy cơ suy biến O(N).',
        prerequisites: [
          { name: 'Đệ quy & Quay lui (ENT-CS202-022)', percent: 95, isMet: true },
          { name: 'Danh sách liên kết', percent: 100, isMet: true },
        ],
        learningObjectives: [
          'Cài đặt hàm chèn, tìm kiếm và xóa đỉnh có 2 con.',
          'Chứng minh tính chất suy biến thành danh sách liên kết khi chèn tăng dần.',
        ],
      },
      {
        id: 'node-5',
        code: 'ENT-CS202-089',
        title: 'Cây Cân Bằng AVL',
        alias: 'Adelson-Velsky and Landis Tree',
        stageNumber: 2,
        stageTitle: 'Cây Cân Bằng & Cấu Trúc Thứ Bậc',
        status: 'learning',
        isV25New: true,
        priorityLevel: 1,
        masteryPercent: 0,
        complexity: 'O(log N)',
        shortDesc: 'Bảo toàn chiều cao h ≤ 1.44 log₂(N). Thắt chặt nghiêm ngặt.',
        prerequisites: [
          { name: 'Cây BST cơ bản (ENT-CS202-041)', percent: 92, isMet: true },
          { name: 'Kỹ thuật Đệ quy cây (ENT-CS202-022)', percent: 95, isMet: true },
        ],
        learningObjectives: [
          'Tính toán chính xác hệ số cân bằng BF = h(L) - h(R) ∈ {-1, 0, 1}.',
          'Cài đặt 4 phép xoay cơ bản (Left Rotate, Right Rotate, Double Left/Right).',
          'Tối ưu thao tác chèn & xóa đỉnh bảo toàn tính chất AVL trong O(log N).',
        ],
      },
      {
        id: 'node-6',
        code: 'ENT-CS202-090',
        title: 'Cây Đỏ - Đen (Red-Black)',
        stageNumber: 2,
        stageTitle: 'Cây Cân Bằng & Cấu Trúc Thứ Bậc',
        status: 'unlocked',
        isV25New: true,
        masteryPercent: 15,
        complexity: 'O(log N)',
        shortDesc: '5 Quy tắc tô màu, Black-height & ứng dụng trong C++ std::map.',
        prerequisites: [{ name: 'Cây Cân Bằng AVL (ENT-CS202-089)', percent: 0, isMet: false }],
        learningObjectives: [
          'Nắm vững 5 bất biến (Invariants) của Cây Đỏ - Đen.',
          'Hiểu sự khác biệt về số lần xoay giữa AVL Tree và Red-Black Tree.',
        ],
      },
      {
        id: 'node-7',
        code: 'ENT-CS202-091',
        title: '4 Phép xoay & Balance Factor',
        stageNumber: 2,
        stageTitle: 'Cây Cân Bằng & Cấu Trúc Thứ Bậc',
        status: 'learning',
        isV25New: true,
        masteryPercent: 40,
        complexity: 'O(1)',
        shortDesc: 'LL, RR (Single rotation) và LR, RL (Double rotations).',
        prerequisites: [{ name: 'Cây BST cơ bản', percent: 92, isMet: true }],
        learningObjectives: [
          'Nhận diện các trường hợp mất cân bằng Left-Left, Right-Right, Left-Right, Right-Left.',
          'Cập nhật lại chiều cao của node gốc và các node con sau khi xoay.',
        ],
      },

      // Stage 3
      {
        id: 'node-8',
        code: 'ENT-CS202-061',
        title: 'Segment Tree cơ bản',
        stageNumber: 3,
        stageTitle: 'Truy Vấn Khoảng Thời Gian Thực (Range Query Engine)',
        status: 'mastered',
        masteryPercent: 88,
        scoreDisplay: '8.8/10',
        complexity: 'O(log N)',
        shortDesc: 'Range Minimum Query (RMQ) và cập nhật điểm Point Update.',
        prerequisites: [{ name: 'Cây nhị phân tìm kiếm', percent: 92, isMet: true }],
        learningObjectives: [
          'Xây dựng cây phân đoạn mảng 4N đỉnh trong O(N).',
          'Truy vấn tổng và giá trị nhỏ nhất trên đoạn [L, R] trong O(log N).',
        ],
      },
      {
        id: 'node-9',
        code: 'ENT-CS202-062',
        title: 'Lazy Propagation',
        stageNumber: 3,
        stageTitle: 'Truy Vấn Khoảng Thời Gian Thực (Range Query Engine)',
        status: 'learning',
        masteryPercent: 68,
        scoreDisplay: '6.8/10',
        complexity: 'O(log N) Range',
        shortDesc: 'Cập nhật lười trên đoạn không cần cập nhật toàn bộ lá.',
        prerequisites: [{ name: 'Segment Tree cơ bản', percent: 88, isMet: true }],
        learningObjectives: [
          'Cơ chế truyền giá trị lười (Push Down) từ cha xuống 2 con.',
          'Giải quyết bài toán Range Add, Range Sum trong O(log N).',
        ],
      },
      {
        id: 'node-10',
        code: 'ENT-CS202-063',
        title: 'Fenwick Tree (BIT nâng cao)',
        stageNumber: 3,
        stageTitle: 'Truy Vấn Khoảng Thời Gian Thực (Range Query Engine)',
        status: 'unlocked',
        isV25New: true,
        masteryPercent: 30,
        complexity: 'O(log N)',
        shortDesc: 'Binary Indexed Tree dùng phép toán bit (i & -i) tiết kiệm bộ nhớ.',
        prerequisites: [{ name: 'Mảng & Phép toán Bitwise', percent: 95, isMet: true }],
        learningObjectives: [
          'Thao tác bit Two’s Complement và hàm `lowbit(x)`.',
          'Cài đặt BIT trong 15 dòng code cho bài toán Prefix Sum.',
        ],
      },

      // Stage 4
      {
        id: 'node-11',
        code: 'ENT-CS202-098',
        title: 'Persistent Segment Tree',
        stageNumber: 4,
        stageTitle: 'Cấu trúc Dữ liệu Bền vững & Phân Rã Nâng cao',
        status: 'locked',
        isV25New: true,
        masteryPercent: 0,
        complexity: 'O(log N) Time / O(N log N) Space',
        shortDesc: 'Lưu vết lịch sử các phiên bản cây không sao chép toàn bộ node.',
        prerequisites: [
          { name: 'Cây Cân Bằng AVL (ENT-CS202-089)', percent: 0, isMet: false },
          { name: 'Segment Tree cơ bản (ENT-CS202-061)', percent: 88, isMet: true },
        ],
        learningObjectives: [
          'Tái sử dụng các nhánh không bị thay đổi giữa phiên bản `t` và `t+1`.',
          'Giải bài toán tìm phần tử nhỏ thứ k trên đoạn [L, R] bất kỳ.',
        ],
      },
      {
        id: 'node-12',
        code: 'ENT-CS202-099',
        title: 'Heavy-Light Decomposition (HLD)',
        stageNumber: 4,
        stageTitle: 'Cấu trúc Dữ liệu Bền vững & Phân Rã Nâng cao',
        status: 'locked',
        isV25New: true,
        masteryPercent: 0,
        complexity: 'O(log^2 N)',
        shortDesc: 'Phân rã chuỗi nặng/nhẹ trên đồ thị vô hướng thành các mảng tuyến tính.',
        prerequisites: [
          { name: 'Cây Cân Bằng AVL', percent: 0, isMet: false },
          { name: 'Segment Tree + Lazy Propagation', percent: 68, isMet: false },
        ],
        learningObjectives: [
          'Phân biệt Heavy Edge và Light Edge dựa trên kích thước cây con.',
          'Kết hợp HLD với Segment Tree để xử lý truy vấn trên đường đi (Path Query).',
        ],
      },
    ],
    []
  );

  // Selected Node (Default is AVL Tree ENT-CS202-089)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-5');

  const selectedNode = useMemo(() => {
    return allNodes.find((n) => n.id === selectedNodeId) || allNodes[4];
  }, [allNodes, selectedNodeId]);

  // Filtered nodes by toolbar filter
  const filteredNodes = useMemo(() => {
    let list = allNodes;

    if (filterType === 'new_v25') {
      list = list.filter((n) => n.isV25New);
    } else if (filterType === 'mastered') {
      list = list.filter((n) => n.status === 'mastered');
    } else if (filterType === 'reinforcing') {
      list = list.filter((n) => n.status === 'learning');
    } else if (filterType === 'prereq') {
      list = list.filter((n) => n.prerequisites.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.code.toLowerCase().includes(q) ||
          n.shortDesc.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allNodes, filterType, searchQuery]);

  // Group filtered nodes by Stage
  const stages = useMemo(() => {
    return [1, 2, 3, 4].map((stageNum) => {
      const stageNodes = filteredNodes.filter((n) => n.stageNumber === stageNum);
      const stageSample = allNodes.find((n) => n.stageNumber === stageNum);
      return {
        stageNumber: stageNum,
        title: stageSample?.stageTitle || `Giai đoạn 0${stageNum}`,
        nodes: stageNodes,
        allCount: allNodes.filter((n) => n.stageNumber === stageNum).length,
      };
    });
  }, [filteredNodes, allNodes]);

  const handleStartDiagnosticQuiz = () => {
    setIsDiagnosticModalOpen(true);
    setDiagnosticAnswer(null);
    setDiagnosticSubmitted(false);
  };

  const handleSubmitDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    setDiagnosticSubmitted(true);
    triggerToast(
      'Chúc mừng! Bạn đã hoàn thành câu hỏi kiểm tra Balance Factor. Điểm PLO đã được cập nhật: +15 XP!'
    );
    setTimeout(() => {
      setIsDiagnosticModalOpen(false);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 font-sans antialiased w-full max-w-[1720px] mx-auto">
      {/* Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 border border-slate-700">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{localToast}</span>
        </div>
      )}

      {/* 1. Milestone Release Banner v2.5 with 3px border */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border-[3px] border-slate-700/80">
        <div className="absolute -right-8 -top-12 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold uppercase tracking-wider border border-blue-400/30">
                  Phiên bản v2.5 Active
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono text-[11px]">
                  Git Merge #892: CS-202 Syllabus
                </span>
                <span className="text-emerald-400 text-xs flex items-center gap-0.5 font-semibold">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  Giảng viên đã duyệt
                </span>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white">
                Cập nhật Đồ thị tri thức &amp; Bản đồ năng lực v2.5:{' '}
                <span className="text-blue-400">+34 Node kỹ năng mới</span> đã mở khóa!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Học phần <strong className="text-white font-semibold">CS-202: Cấu trúc dữ liệu &amp; Giải thuật nâng cao</strong>{' '}
                vừa tích hợp cây cân bằng, cấu trúc bền vững và phân rã cây. Lộ trình học của bạn đã được cập nhật tương ứng.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setFilterType('new_v25');
                triggerToast('Đang lọc hiển thị 34 node kỹ năng mới mở khóa thuộc phiên bản v2.5!');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs font-semibold flex items-center gap-2 border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-400">
                format_list_bulleted_add
              </span>
              <span>Xem 34 kỹ năng mới</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerToast('Đang tạo lộ trình học tập cá nhân hóa dựa trên mô hình trí tuệ nhân tạo Socratic...');
                setTimeout(() => {
                  triggerToast('Lộ trình thích ứng AI đã được tạo thành công: Ưu tiên luyện tập Cây AVL!');
                }, 1200);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">neurology</span>
              <span>Tạo lộ trình thích ứng AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento KPI Cards (4 Cards) with 3px border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total tracked skills */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng kỹ năng theo dõi
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </span>
          </div>
          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">79</span>
            <span className="text-xs text-slate-500 font-medium">node</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-mono font-bold">
              +34 v2.5
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>38 Đã chủ động</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                7 Đang học • 34 Mới
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-blue-600 h-full" style={{ width: '48.1%' }} title="48.1% Đã thành thạo" />
              <div className="bg-amber-500 h-full" style={{ width: '8.8%' }} title="8.8% Đang học" />
              <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: '43.1%' }} title="43.1% Mới mở" />
            </div>
          </div>
        </div>

        {/* Card 2: PLO Coverage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chuẩn đầu ra (PLO)
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">donut_large</span>
            </span>
          </div>
          <div className="my-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                68.5%
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                PLO-CS04
              </span>
            </div>
            {/* SVG Progress Donut */}
            <svg className="w-11 h-11 transform -rotate-90 shrink-0" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-blue-600 dark:text-blue-400"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="68.5, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified_user</span>
            <span>Đạt 5/7 chỉ số năng lực cốt lõi</span>
          </div>
        </div>

        {/* Card 3: Priority Gaps */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lỗ hổng trọng tâm
            </span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">priority_high</span>
            </span>
          </div>
          <div className="my-1.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
              <span className="truncate">Cây cân bằng AVL (v2.5)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate">Lazy Propagation (Củng cố)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
              <span className="truncate">Đồ thị Tarjan SCC</span>
            </div>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">tips_and_updates</span>
            <span>Khuyến nghị xử lý trong 72h tới</span>
          </div>
        </div>

        {/* Card 4: Top Ranking */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Xếp hạng năng lực
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </span>
          </div>
          <div className="my-2 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                Top 5%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Khoa Công nghệ Thông tin</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">842</div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">XP Mastery</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">trending_up</span>
            <span>Tăng 12 bậc sau bài test Segment Tree</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Split: Skill Tree Stages (8 cols) + Inspector & AI Coach (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Skill Tree Stages (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Toolbar & Filter Pills */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">all_inclusive</span>
                <span>Tất cả (79)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('new_v25')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'new_v25'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Mới mở khóa v2.5 (+34)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('mastered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'mastered'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                <span>Đã thành thạo (38)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('reinforcing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'reinforcing'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-amber-500">timelapse</span>
                <span>Đang củng cố (7)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('prereq')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'prereq'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Tiên quyết (Prerequisites)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto text-xs font-mono text-slate-500">
              <span>Tỷ lệ xem: {zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => (prev === 100 ? 120 : prev === 120 ? 80 : 100))}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                title="Thay đổi tỷ lệ thu phóng cây kỹ năng"
              >
                <span className="material-symbols-outlined text-[18px]">fit_screen</span>
              </button>
            </div>
          </div>

          {/* STAGES CONTAINER */}
          <div className="space-y-5" style={{ zoom: `${zoomLevel}%` }}>
            {/* STAGE 01: NỀN TẢNG TUYẾN TÍNH & ĐỆ QUY (Completed) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-extrabold flex items-center justify-center text-slate-700 dark:text-slate-200">
                    01
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        Nền tảng Cấu trúc Tuyến tính &amp; Đệ quy
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Hoàn thành 100%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Con trỏ, Mảng động, Danh sách liên kết đơn/kép, Kỹ thuật chia để trị cơ bản.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">
                  Stage Completed
                </span>
              </div>

              {/* Stage 1 Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allNodes
                  .filter((n) => n.stageNumber === 1)
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="material-symbols-outlined text-[20px] text-emerald-500 shrink-0">
                            task_alt
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {node.title}
                            </p>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {node.masteryPercent}% Mastery
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {node.scoreDisplay}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* STAGE 02: CÂY CÂN BẰNG & CẤU TRÚC THỨ BẬC (ACTIVE FOCUS v2.5) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-[3px] border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono text-xs font-extrabold flex items-center justify-center shadow-xs">
                    02
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        Cây Cân Bằng &amp; Cấu Trúc Thứ Bậc
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Vừa mở khóa v2.5 (+14 Node)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Tối ưu hóa độ phức tạp tìm kiếm từ O(N) suy biến về O(log N) bằng các phép tự xoay cân bằng.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-blue-900">
                  Đang học: 23%
                </span>
              </div>

              {/* Stage 2 Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {allNodes
                  .filter((n) => n.stageNumber === 2)
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-50/90 dark:bg-blue-950/70 border-2 border-blue-600 ring-2 ring-blue-500/30 shadow-md transform -translate-y-0.5'
                            : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">check</span>
                            Đang chọn
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                              {node.code}
                            </span>
                            {node.isV25New && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                                MỚI v2.5
                              </span>
                            )}
                            {node.status === 'mastered' && (
                              <span className="material-symbols-outlined text-[17px] text-emerald-500">
                                check_circle
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {node.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {node.shortDesc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                          {node.masteryPercent > 0 ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {node.masteryPercent}% Thành thạo
                            </span>
                          ) : (
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              Chưa chẩn đoán
                            </span>
                          )}
                          <span className="material-symbols-outlined text-[16px] text-slate-400">
                            {node.status === 'locked' ? 'lock' : 'arrow_forward'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* STAGE 03: TRUY VẤN KHOẢNG THỜI GIAN THỰC (RANGE QUERY) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-extrabold flex items-center justify-center text-slate-700 dark:text-slate-200">
                    03
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        Truy Vấn Khoảng Thời Gian Thực (Range Query Engine)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                        Đang tiến hành
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Segment Tree, Fenwick Tree và kỹ thuật cập nhật khoảng Lazy Propagation.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
                  Tiến độ: 52%
                </span>
              </div>

              {/* Stage 3 Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allNodes
                  .filter((n) => n.stageNumber === 3)
                  .map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`material-symbols-outlined text-[20px] shrink-0 ${
                              node.status === 'mastered'
                                ? 'text-emerald-500'
                                : node.status === 'learning'
                                ? 'text-amber-500'
                                : 'text-blue-500'
                            }`}
                          >
                            {node.status === 'mastered'
                              ? 'check_circle'
                              : node.status === 'learning'
                              ? 'hourglass_top'
                              : 'auto_awesome'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {node.title}
                            </p>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {node.scoreDisplay
                                ? `${node.scoreDisplay} Mastery`
                                : node.isV25New
                                ? 'MỚI v2.5 ✨'
                                : 'Đang học'}
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[17px] text-slate-400 shrink-0">
                          {node.status === 'mastered' ? 'check' : 'lock_open'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* STAGE 04: CẤU TRÚC DỮ LIỆU BỀN VỮNG (Future) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-extrabold flex items-center justify-center text-slate-400">
                    04
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
                        Cấu trúc Dữ liệu Bền vững &amp; Phân Rã Nâng cao
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        Khóa tiên quyết: Stage 02 &amp; 03
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Lưu vết lịch sử truy vấn phiên bản cũ, giải quyết đường đi trên cây phức tạp.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline">
                  Mục tiêu Q2
                </span>
              </div>

              {/* Stage 4 Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allNodes
                  .filter((n) => n.stageNumber === 4)
                  .map((node) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {node.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                            MỚI v2.5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {node.shortDesc}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[20px] text-slate-400">
                        lock
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Node Detailed Inspector & AI Socratic Engine (xl:col-span-4, sticky top-20) */}
        <div className="xl:col-span-4 flex flex-col gap-5 sticky top-20">
          {/* Node Detailed Inspector Card with 3px border */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                    {selectedNode.isV25New ? 'v2.5 NEW NODE' : 'ACTIVE SKILL'}
                  </span>
                  <span className="font-mono text-xs text-slate-400">Mã: {selectedNode.code}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedNode.title}
                </h2>
                {selectedNode.alias && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {selectedNode.alias}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => triggerToast(`Đã lưu kỹ năng "${selectedNode.title}" vào danh sách đánh dấu!`)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Đánh dấu kỹ năng này"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Mức độ thành thạo
                </span>
                <span
                  className={`text-xl font-extrabold ${
                    selectedNode.masteryPercent > 80
                      ? 'text-emerald-600'
                      : selectedNode.masteryPercent > 0
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {selectedNode.masteryPercent}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedNode.masteryPercent > 0 ? 'Đã kiểm tra' : 'Chưa kiểm định'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Độ phức tạp mục tiêu
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedNode.complexity}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Tối ưu chuẩn PLO
                </span>
              </div>
            </div>

            {/* Prerequisites Validation Check */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Điều kiện tiên quyết (Prerequisites)
              </span>
              <div className="space-y-1.5">
                {selectedNode.prerequisites.map((prereq, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[17px] ${
                          prereq.isMet ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                      >
                        {prereq.isMet ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {prereq.name}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        prereq.isMet ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {prereq.percent}% {prereq.isMet ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
              {selectedNode.prerequisites.every((p) => p.isMet) && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                  <span>Đạt 100% điều kiện tiên quyết. Sẵn sàng học ngay!</span>
                </div>
              )}
            </div>

            {/* Learning Objectives (PLO Breakdown) */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mục tiêu năng lực cần đạt (PLO)
              </span>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                {selectedNode.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0 mt-0.5">
                      arrow_right
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleStartDiagnosticQuiz}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                <span>Làm bài Test chẩn đoán 5 phút (Ghi nhận PLO)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAiTutorModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400">
                  smart_toy
                </span>
                <span>Hỏi Gia sư AI Socratic về {selectedNode.title}</span>
              </button>
            </div>
          </div>

          {/* AI Socratic Next Best Action Recommendation Card with 3px border */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border-[3px] border-slate-300 dark:border-slate-700 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <span>Gợi ý hành động thông minh (Next Best Action)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Khuyến nghị lộ trình tối ưu
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  98% Match
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &ldquo;Chào {userFullName}! Vì bạn đã đạt điểm 9.2 ở phần BST, hãy hoàn thành{' '}
                <strong className="text-slate-900 dark:text-slate-100 font-semibold not-italic">
                  Bài thực hành mô phỏng 4 phép xoay AVL
                </strong>{' '}
                trước. Điều này sẽ giúp bạn mở khóa toàn bộ Stage 03 BIT &amp; Range Tree dễ dàng hơn 40%.&rdquo;
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">
                  Thời gian ước tính: <strong>18 phút</strong>
                </span>
                <button
                  type="button"
                  onClick={handleStartDiagnosticQuiz}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Bắt đầu học ngay</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic 5-minute Quiz Modal */}
      {isDiagnosticModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitDiagnostic}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-[3px] border-slate-300 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">quiz</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Bài Test Chẩn đoán: {selectedNode.title}
                  </h3>
                  <p className="text-xs text-slate-500">Mã PLO: PLO-CS04 • Thời lượng: 5 phút</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Câu 1: Cho một cây AVL có node gốc với chiều cao cây con trái h(L) = 3 và chiều cao cây con phải h(R) = 1. Hệ số cân bằng Balance Factor (BF = h(L) - h(R)) là bao nhiêu và cây có thỏa mãn tính chất AVL không?
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 1, label: 'A. BF = +2, Cây KHÔNG thỏa mãn AVL (cần xoay cân bằng)' },
                  { id: 2, label: 'B. BF = -2, Cây thỏa mãn AVL' },
                  { id: 3, label: 'C. BF = +1, Cây thỏa mãn AVL' },
                  { id: 4, label: 'D. BF = 0, Cây cân bằng hoàn hảo' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setDiagnosticAnswer(opt.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      diagnosticAnswer === opt.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="diagnosticChoice"
                      checked={diagnosticAnswer === opt.id}
                      onChange={() => setDiagnosticAnswer(opt.id)}
                      className="text-blue-600"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDiagnosticModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={diagnosticAnswer === null || diagnosticSubmitted}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {diagnosticSubmitted ? 'Đang chấm điểm...' : 'Nộp bài chẩn đoán'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Socratic AI Tutor Modal */}
      {isAiTutorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-[3px] border-slate-300 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Trợ giảng AI Socratic
                  </h3>
                  <p className="text-xs text-slate-500">
                    Giải đáp trực tiếp về: {selectedNode.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiTutorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-slate-800 dark:text-slate-200 border border-blue-200 dark:border-blue-900 leading-relaxed">
                <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Trợ giảng Socratic AI:
                </p>
                Chào {userFullName}! Cây AVL là cây nhị phân tìm kiếm tự cân bằng đầu tiên trong lịch sử khoa học máy tính. Điểm mấu chốt là hệ số cân bằng Balance Factor tại mọi node luôn nằm trong khoảng {"[-1, 0, 1]"}. Khi một phép chèn làm lệch BF thành +2 hoặc -2, chúng ta chỉ cần tối đa 2 phép xoay cục bộ O(1) để khôi phục lại tính chất! Bạn có muốn tôi giải thích chi tiết về phép xoay Left-Right (LR) không?
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAiTutorModalOpen(false);
                  router.push('/ai-tutor');
                }}
                className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Mở không gian AI Tutor toàn màn hình</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAiTutorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
