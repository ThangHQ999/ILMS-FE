'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LessonWorkspaceHeader } from './LessonWorkspaceHeader';
import { LessonSyllabusSidebar } from './LessonSyllabusSidebar';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { LessonAcademicDocument } from './LessonAcademicDocument';
import { LessonSocraticAiSidebar } from './LessonSocraticAiSidebar';
import { LessonBottomWorkspaceBar } from './LessonBottomWorkspaceBar';
import { LessonNotesDrawer } from './LessonNotesDrawer';

interface LessonLearningWorkspaceProps {
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  classGroup?: string;
  lessonId?: string;
  lessonTitle?: string;
  chapterNumber?: string | number;
  lessonNumber?: string | number;
}

export function LessonLearningWorkspace({
  courseId = 'course-cs-202',
  courseCode = 'CS-202',
  courseName = 'Cấu trúc dữ liệu & Giải thuật nâng cao',
  classGroup = 'CS-202 • Nhóm 01',
  lessonId = 'les-3-2',
  lessonTitle = 'Cơ chế truyền tin cậy (RDT) & Bắt tay 3 bước TCP',
  chapterNumber = '03',
  lessonNumber = '02',
}: LessonLearningWorkspaceProps) {
  const router = useRouter();

  // Sidebar and layout toggles
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'workspace' | 'syllabus' | 'resources' | 'discussion'>('workspace');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Toggle Focus Mode (hides/shows both sidebars)
  const handleToggleFocusMode = () => {
    if (!isFocusMode) {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
      setIsFocusMode(true);
      showToast('Đã bật Chế độ Tập trung: Ẩn cả hai thanh bên để tối ưu diện tích học');
    } else {
      setIsLeftSidebarOpen(true);
      setIsRightSidebarOpen(true);
      setIsFocusMode(false);
      showToast('Đã thoát Chế độ Tập trung');
    }
  };

  const handleToggleLeftSidebar = () => {
    setIsLeftSidebarOpen((prev) => !prev);
    if (isFocusMode) setIsFocusMode(false);
  };

  const handleToggleRightSidebar = () => {
    setIsRightSidebarOpen((prev) => !prev);
    if (isFocusMode) setIsFocusMode(false);
  };

  const handleSelectLessonItem = (targetLessonId: string, targetLessonTitle: string) => {
    showToast(`Đang chuyển sang: "${targetLessonTitle}"`);
    // If we have actual lesson switching logic, update here or route
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold flex items-center gap-2 border-[2px] border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[19px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Top Nav + Sub-Header Workstation Controls) */}
      <LessonWorkspaceHeader
        courseId={courseId}
        courseCode={courseCode}
        courseName={courseName}
        classGroup={classGroup}
        chapterNumber={chapterNumber}
        lessonNumber={lessonNumber}
        lessonTitle={lessonTitle}
        activeNavTab={activeNavTab}
        onSelectNavTab={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'syllabus') {
            setIsLeftSidebarOpen(true);
            showToast('Đã mở Cây giáo trình khóa học');
          } else if (tab === 'resources') {
            showToast('Chuyển tới phần Tài liệu đính kèm của bài học');
          } else if (tab === 'discussion') {
            showToast('Chuyển tới phần Thảo luận & Hỏi đáp');
          }
        }}
        isLeftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={handleToggleLeftSidebar}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={handleToggleRightSidebar}
        isFocusMode={isFocusMode}
        onToggleFocusMode={handleToggleFocusMode}
        onOpenNotes={() => setIsNotesDrawerOpen(true)}
        studentName="Trần Nhật Minh"
        studentCode="21120485"
        overallProgress={64}
        lessonProgress={68}
        onHelpClick={() =>
          showToast(
            'Phím tắt: Space (Phát/Dừng), J/L (Tua ±10s), M (Bật/Tắt âm thanh), F (Toàn màn hình)'
          )
        }
      />

      {/* Main 3-Column Learning Body */}
      <main className="w-full flex-1 flex relative overflow-hidden">
        {/* ======================================================= */}
        {/* 1. LEFT COLUMN: Syllabus & Outline Sidebar              */}
        {/* ======================================================= */}
        {isLeftSidebarOpen && (
          <LessonSyllabusSidebar
            courseCode={courseCode}
            semester="HK2 2024-2025"
            progressPercent={68}
            completedLessonsCount={15}
            totalLessonsCount={22}
            activeLessonId={lessonId}
            onSelectLessonItem={handleSelectLessonItem}
            onToast={showToast}
          />
        )}

        {/* ======================================================= */}
        {/* 2. CENTER COLUMN: Main Content (Video & Academic Doc)   */}
        {/* ======================================================= */}
        <div className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
          {/* Interactive Video Player */}
          <LessonVideoPlayer instructorName="TS. Lê Hoàng Nam" onToast={showToast} />

          {/* Academic Reading Document */}
          <LessonAcademicDocument onToast={showToast} />

          {/* Bottom spacer to prevent overlap with sticky bar */}
          <div className="h-10 w-full" />
        </div>

        {/* ======================================================= */}
        {/* 3. RIGHT COLUMN: Socratic AI Tutor Panel                */}
        {/* ======================================================= */}
        {isRightSidebarOpen && (
          <LessonSocraticAiSidebar
            onClose={() => setIsRightSidebarOpen(false)}
            onOpenKnowledgeGraph={() => {
              showToast('Đang mở Đồ thị tri thức liên kết 12 nodes...');
              router.push('/knowledge-graph');
            }}
            onToast={showToast}
          />
        )}
      </main>

      {/* Bottom Sticky Workspace Bar */}
      <LessonBottomWorkspaceBar
        previousLessonTitle="Bài 3.1: Phân kênh"
        nextLessonTitle="Bài 3.3: Điều khiển luồng & Tắc nghẽn"
        onGoPrevious={() =>
          showToast('Đang quay lại Bài 3.1: Dịch vụ định vị cổng (Port Multiplexing)')
        }
        onGoNext={() =>
          showToast('Đang chuyển sang Bài 3.3: Thuật toán kiểm soát tắc nghẽn TCP Reno & CUBIC')
        }
        onToast={showToast}
      />

      {/* Footer (Status Bar) */}
      <footer className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t-[3px] border-slate-300 dark:border-slate-700 py-3 px-4 sm:px-6">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Đang lưu tự động</span>
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Môi trường học: Sẵn sàng
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Bài trước: 3.1 Dịch vụ & Phân kênh')}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Bài trước</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Chuyển tiếp: Bài 3.3 Điều khiển luồng & Tắc nghẽn')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Tiếp theo</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Quick Notes Drawer / Scratchpad Modal */}
      <LessonNotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        lessonId={lessonId}
        lessonTitle={`Bài ${chapterNumber}.${lessonNumber}: ${lessonTitle}`}
        onToast={showToast}
      />
    </div>
  );
}

