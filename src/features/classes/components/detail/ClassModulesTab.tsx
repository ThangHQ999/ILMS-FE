'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { StudioCommandBar } from './modules/StudioCommandBar';
import { ActiveWeekBanner } from './modules/ActiveWeekBanner';
import { ModuleAccordionItem, type ModuleData } from './modules/ModuleAccordionItem';
import { AdaptiveLearningFlowCard } from './modules/AdaptiveLearningFlowCard';
import { AiSyllabusCopilotCard } from './modules/AiSyllabusCopilotCard';
import { SyllabusAuditChecklistCard } from './modules/SyllabusAuditChecklistCard';
import { StudentModulesView } from './modules/StudentModulesView';
import {
  AddChapterModal,
  AddLessonModal,
  BatchUploadModal,
} from './modules/ClassModuleModals';

interface ClassModulesTabProps {
  currentRole: 'student' | 'teacher' | 'owner';
  onToast: (msg: string) => void;
  onViewSubjects?: () => void;
  subjectsCount?: number;
}

const INITIAL_MODULES: ModuleData[] = [
  {
    id: 'mod-1',
    order: 1,
    title: 'Tổng quan Mạng máy tính & Mô hình Phân tầng (OSI & TCP/IP)',
    weeks: 'Tuần 1 - 3',
    statusBadge: 'Đã xuất bản (4/4 bài)',
    statusType: 'published',
    lessons: [
      {
        id: 'les-1-1',
        code: '1.1',
        title: 'Khái niệm Mạng máy tính, Topo mạng và Băng thông',
        type: 'video',
        meta: 'Video • 42 phút',
        stats: '48/48 SV hoàn thành (100%)',
        status: 'published',
      },
      {
        id: 'les-1-2',
        code: '1.2',
        title: 'Phân tích 7 tầng mô hình OSI và 4 tầng TCP/IP',
        type: 'slide',
        meta: 'Slide PDF • 38 trang',
        stats: '47/48 SV xem',
        status: 'published',
      },
      {
        id: 'les-1-3',
        code: '1.3',
        title: 'Thực hành Lệnh chẩn đoán mạng (ping, traceroute, nslookup, netstat)',
        type: 'lab',
        meta: 'Interactive Lab Terminal • 45 phút',
        stats: '46/48 SV nộp log',
        status: 'published',
      },
      {
        id: 'quiz-1',
        code: 'Quiz 01',
        title: 'Kiểm tra nhanh Kiến trúc & Nguyên lý Mạng',
        type: 'quiz',
        meta: 'Trắc nghiệm 15 câu • Điểm TB: 8.4/10',
        stats: '48/48 đã hoàn thành',
        status: 'closed',
      },
    ],
  },
  {
    id: 'mod-2',
    order: 2,
    title: 'Tầng Ứng dụng (Application Layer: HTTP, DNS, SMTP, P2P)',
    weeks: 'Tuần 4 - 6',
    statusBadge: 'Đã xuất bản (4 bài • 1 Lab Socket C++)',
    statusType: 'published',
    lessons: [
      {
        id: 'les-2-1',
        code: '2.1',
        title: 'Giao thức HTTP 1.1 / HTTP/2 và Hệ thống phân giải tên miền DNS',
        type: 'video',
        meta: 'Video bài giảng • 45 phút',
        stats: '48 SV đã xem',
        status: 'published',
      },
      {
        id: 'les-2-2',
        code: 'Lab 02',
        title: 'Lập trình Socket TCP / UDP Client-Server bằng C++',
        type: 'lab',
        meta: 'Thực hành Code Runner • 90 phút',
        stats: '44/48 bài nộp',
        status: 'published',
        submissionsCount: 44,
      },
    ],
  },
  {
    id: 'mod-3',
    order: 3,
    title: 'Tầng Giao vận (Transport Layer - TCP & UDP Protocol Suite)',
    weeks: 'Tuần 7 - 9 (Tuần này)',
    statusBadge: 'Active Focus',
    statusType: 'active_focus',
    isActiveFocus: true,
    lessons: [
      {
        id: 'les-3-1',
        code: '3.1',
        title: 'Dịch vụ Tầng Giao vận, Ghép kênh & Phân kênh (Multiplexing / Demultiplexing)',
        type: 'video',
        meta: 'Video • 32 phút',
        stats: '45/48 SV đã xem (93.7%)',
        status: 'published',
      },
      {
        id: 'les-3-2',
        code: '3.2',
        title: 'Cơ chế Truyền tin cậy RDT & Quá trình Bắt tay 3 bước TCP (3-way Handshake)',
        type: 'simulation',
        meta: 'Mô phỏng tương tác',
        stats: '42/48 SV đã học',
        status: 'published',
        alert: '6 SV cần hỗ trợ',
      },
      {
        id: 'les-3-3',
        code: '3.3',
        title: 'Cơ chế Điều khiển Luồng (Flow Control) & Tránh Tắc nghẽn (TCP Reno, Cubic)',
        type: 'slide',
        meta: 'Cập nhật 2 giờ trước bởi TS. Nam',
        stats: 'Học sinh chưa thể nhìn thấy',
        status: 'draft',
        isDraft: true,
      },
      {
        id: 'les-3-4',
        code: '3.4',
        title: 'Wireshark Lab: Bắt và Phân tích gói tin TCP 3-Way Handshake, Window Size',
        type: 'lab',
        meta: 'Hạn nộp: Chủ Nhật, 20/10 • 23:59',
        stats: '31/48 SV đã nộp file pcapng',
        status: 'published',
        submissionsCount: 31,
      },
      {
        id: 'quiz-3',
        code: 'Quiz 03',
        title: 'Đánh giá Năng lực Tầng Giao vận (20 câu trắc nghiệm khách quan)',
        type: 'quiz',
        meta: 'Thời gian: 25 phút',
        stats: 'Khóa có điều kiện',
        status: 'conditional_lock',
        prerequisite: 'Phải nộp Lab 3.4 & Điểm >= 5.0',
      },
    ],
  },
  {
    id: 'mod-4',
    order: 4,
    title: 'Tầng Mạng & Giao thức Định tuyến (Network Layer: IPv4/IPv6, OSPF, BGP)',
    weeks: 'Dự kiến Tuần 10 - 12',
    statusBadge: 'Lên lịch: 28/10/2024 (4 bài nháp)',
    statusType: 'scheduled',
    lessons: [
      {
        id: 'les-4-1',
        code: '4.1',
        title: 'Cấu trúc gói tin IPv4/IPv6 và Kỹ thuật chia mạng con CIDR / VLSM',
        type: 'slide',
        meta: 'Slide PDF • 45 trang',
        stats: 'Chưa xuất bản',
        status: 'draft',
        isDraft: true,
      },
    ],
  },
  {
    id: 'mod-5',
    order: 5,
    title: 'Tầng Liên kết Dữ liệu & Mạng cục bộ (Data Link Layer & LANs, CSMA/CD, ARP)',
    weeks: 'Dự kiến Tuần 13 - 15',
    statusBadge: 'Khóa',
    statusType: 'locked',
    isLocked: true,
    lessons: [],
  },
];

export function ClassModulesTab({
  currentRole,
  onToast,
  onViewSubjects,
  subjectsCount,
}: ClassModulesTabProps) {
  const [isTeacherPreview, setIsTeacherPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [modules, setModules] = useState<ModuleData[]>(INITIAL_MODULES);

  // Reset teacher preview when parent role changes
  useEffect(() => {
    setIsTeacherPreview(false);
  }, [currentRole]);

  // If role is student or teacher activated student preview, render StudentModulesView
  if (currentRole === 'student' || isTeacherPreview) {
    return (
      <StudentModulesView
        onToast={onToast}
        onNavigateTab={onViewSubjects}
        isPreview={currentRole !== 'student' && isTeacherPreview}
        onExitPreview={() => setIsTeacherPreview(false)}
      />
    );
  }

  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({
    'mod-1': true,
    'mod-2': false,
    'mod-3': true,
    'mod-4': false,
    'mod-5': false,
  });

  // Modal states
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>('mod-3');
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Counts
  const counts = useMemo(() => {
    let all = 0;
    let published = 0;
    let draft = 0;
    modules.forEach((m) => {
      m.lessons.forEach((l) => {
        all++;
        if (l.isDraft || l.status === 'draft') draft++;
        else published++;
      });
    });
    return { all, published, draft };
  }, [modules]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return modules
      .map((mod) => {
        let matchingLessons = mod.lessons;

        if (statusFilter === 'published') {
          matchingLessons = matchingLessons.filter((l) => !l.isDraft && l.status !== 'draft');
        } else if (statusFilter === 'draft') {
          matchingLessons = matchingLessons.filter((l) => l.isDraft || l.status === 'draft');
        }

        if (q) {
          matchingLessons = matchingLessons.filter(
            (l) =>
              l.title.toLowerCase().includes(q) ||
              l.code?.toLowerCase().includes(q) ||
              l.meta.toLowerCase().includes(q)
          );
        }

        const isModMatch = !q || mod.title.toLowerCase().includes(q) || matchingLessons.length > 0;
        if (!isModMatch && q) return null;

        return {
          ...mod,
          lessons: matchingLessons,
        };
      })
      .filter((m): m is ModuleData => m !== null);
  }, [modules, searchQuery, statusFilter]);

  // Handlers
  const handlePublishLesson = (lessonId: string) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          l.id === lessonId
            ? { ...l, isDraft: false, status: 'published', meta: 'Đã xuất bản bởi TS. Nam' }
            : l
        ),
      }))
    );
    onToast('Đã xuất bản bài học thành công cho sinh viên xem!');
  };

  const handleOpenEarly = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, statusType: 'published', statusBadge: 'Đã mở sớm theo yêu cầu GV' }
          : m
      )
    );
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
    onToast('Đã mở khóa chương sớm thành công cho sinh viên!');
  };

  const handleCreateChapter = (title: string, weeks: string) => {
    const newMod: ModuleData = {
      id: `mod-${Date.now()}`,
      order: modules.length + 1,
      title,
      weeks,
      statusBadge: 'Mới tạo',
      statusType: 'published',
      lessons: [],
    };
    setModules((prev) => [...prev, newMod]);
    setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
    onToast(`Đã thêm thành công: Chương ${newMod.order}: ${title}`);
  };

  const handleCreateLesson = (title: string, type: string, duration: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === targetModuleId) {
          const newLesson: (typeof m.lessons)[number] = {
            id: `les-${Date.now()}`,
            code: `${m.order}.${m.lessons.length + 1}`,
            title,
            type: type as any,
            meta: `${type.toUpperCase()} • ${duration}`,
            stats: 'Mới tạo • 0 lượt xem',
            status: 'published',
          };
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      })
    );
    onToast(`Đã thêm bài học "${title}" vào Chương!`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Studio Command Bar */}
      <StudioCommandBar
        isEditMode={isEditMode}
        onToggleEditMode={() => {
          setIsEditMode(!isEditMode);
          onToast(
            !isEditMode
              ? 'Đã BẬT Chế độ Chỉnh sửa Giáo trình'
              : 'Đã TẮT Chế độ Chỉnh sửa (Góc nhìn Học viên)'
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
        onStudentViewClick={() => {
          setIsTeacherPreview(true);
          onToast('Đang chuyển sang Góc nhìn Học viên xem trước...');
        }}
        onBatchUploadClick={() => setIsBatchUploadOpen(true)}
        onAddLessonClick={() => {
          setTargetModuleId('mod-3');
          setIsAddLessonOpen(true);
        }}
        onAddChapterClick={() => setIsAddChapterOpen(true)}
      />

      {/* 2. Workspace 2-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8 Columns - Syllabus Tree & Modules */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          <ActiveWeekBanner />

          {filteredModules.map((mod) => (
            <ModuleAccordionItem
              key={mod.id}
              module={mod}
              isExpanded={!!expandedModules[mod.id]}
              isEditMode={isEditMode}
              onToggle={() => toggleModule(mod.id)}
              onAddLessonClick={(mId) => {
                setTargetModuleId(mId);
                setIsAddLessonOpen(true);
              }}
              onEditModuleClick={(mId) =>
                onToast(`Mở cấu hình chỉnh sửa Chương ${mId}`)
              }
              onPublishLesson={handlePublishLesson}
              onGradeLesson={(lId) =>
                onToast(`Đang chuyển tới trang Chấm điểm cho bài ${lId}...`)
              }
              onLessonStatsClick={(lId) =>
                onToast(`Mở phân tích thống kê học viên chi tiết bài ${lId}`)
              }
              onQuickAdd={(mId, type) => {
                setTargetModuleId(mId);
                handleCreateLesson(
                  `Bài học bổ sung ${type.toUpperCase()}`,
                  type,
                  '30 phút'
                );
              }}
              onOpenEarlyClick={handleOpenEarly}
            />
          ))}
        </div>

        {/* Right Column: 4 Columns - Tools & Copilot */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          <AdaptiveLearningFlowCard
            onSendAutoReminder={() =>
              onToast(
                'Đã tự động gửi email nhắc nhở & tin nhắn chatbot AI tới 6 học viên cần hỗ trợ!'
              )
            }
          />

          <AiSyllabusCopilotCard
            onExtractPdfClick={() => setIsBatchUploadOpen(true)}
            onViewKnowledgeGraphClick={() =>
              onToast('Đang kết nối Đồ thị tri thức môn học CS-202 (34 Nodes)...')
            }
          />

          <SyllabusAuditChecklistCard
            onExportReportClick={() =>
              onToast('Đang tạo và tải xuống Báo cáo Giáo trình PDF (94/100)...')
            }
          />
        </div>
      </div>

      {/* Modals with 3px border */}
      <AddChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => setIsAddChapterOpen(false)}
        onSubmit={handleCreateChapter}
      />

      <AddLessonModal
        isOpen={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        onSubmit={handleCreateLesson}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onUpload={(cnt) => {
          setIsBatchUploadOpen(false);
          onToast(`Đã tiếp nhận ${cnt} tệp học liệu vào Hàng đợi AI Ingestion!`);
        }}
      />
    </div>
  );
}
