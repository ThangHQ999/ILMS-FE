'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';

interface TeacherCreateQuizStudioViewProps {
  onBack: () => void;
  userFullName?: string;
  onPublishSuccess?: () => void;
}

export function TeacherCreateQuizStudioView({
  onBack,
  userFullName = 'TS. Lê Hoàng Nam',
  onPublishSuccess,
}: TeacherCreateQuizStudioViewProps) {
  // App Shell State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [quizTitle, setQuizTitle] = useState(
    'Quiz 04: Tầng Mạng & Thuật toán Định tuyến OSPF / BGP'
  );
  const [selectedModule, setSelectedModule] = useState(
    'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến'
  );
  const [ploTags, setPloTags] = useState<string[]>([
    'PLO-03: Phân tích định tuyến',
    'PLO-05: Cấu hình Router/Switch',
  ]);
  const [instructions, setInstructions] = useState(
    'Bài trắc nghiệm đánh giá kiến thức tuần 7 về Giao thức Link-State (OSPF) và Path-Vector (BGP). Sinh viên được sử dụng sơ đồ mạng đã cho, không tham khảo tài liệu trái phép. Chú ý tính toán bảng định tuyến Dijkstra cẩn thận.'
  );

  // Question 1 State
  const [q1CorrectOption, setQ1CorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [q1Points, setQ1Points] = useState('1.0');
  const [isQ1Collapsed, setIsQ1Collapsed] = useState(false);

  // Question 2 State
  const [q2CorrectOption, setQ2CorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [q2Points, setQ2Points] = useState('1.0');
  const [isQ2Collapsed, setIsQ2Collapsed] = useState(false);

  // Right Panel Settings State
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [attempts, setAttempts] = useState('2 lần thử');
  const [scoringStrategy, setScoringStrategy] = useState('Lấy điểm cao nhất');

  // Security Toggles
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [fullscreenLock, setFullscreenLock] = useState(true);
  const [lockAnswersUntilDeadline, setLockAnswersUntilDeadline] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRemovePloTag = (tagToRemove: string) => {
    setPloTags(ploTags.filter((tag) => tag !== tagToRemove));
    showToast(`Đã gỡ ${tagToRemove}`);
  };

  const handleAddPloTag = () => {
    const newTag = `PLO-0${ploTags.length + 2}: Kỹ năng nâng cao`;
    setPloTags([...ploTags, newTag]);
    showToast(`Đã thêm chuẩn ${newTag}`);
  };

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] text-[#171c1f] dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 1. App Shell Sidebar (Identical to teacher sidebar) */}
      <DashboardSidebar
        isFocus={isFocusMode}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        workspaceMode="faculty"
      />

      {/* 2. Top Header Navigation (Identical to teacher topbar) */}
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
                  onClick={onBack}
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
                    <span>Đã tự lưu nháp lúc 14:20</span>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => showToast('Đã lưu bản nháp thành công vào hệ thống!')}
                  className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#1E1F20] text-[#171c1f] dark:text-white hover:bg-slate-100 dark:hover:bg-[#282A2C] border border-slate-200 dark:border-[#282A2C] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">save</span>
                  <span>Lưu nháp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast('Xuất bản Quiz CS202-QZ-04 thành công cho cả lớp!');
                    if (onPublishSuccess) {
                      setTimeout(onPublishSuccess, 1200);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>Xuất bản Quiz ngay</span>
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
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                      ID: CS202-QZ-04
                    </span>
                  </div>

                  {/* Quiz Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#171c1f] dark:text-white flex items-center justify-between">
                      <span>
                        Tên tiêu đề bài Quiz <span className="text-red-500">*</span>
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        {quizTitle.length} / 120 ký tự
                      </span>
                    </label>
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Nhập tên bài thi trắc nghiệm..."
                      className="h-10 px-3.5 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-sm font-semibold border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#1E1F20] focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Course Module & Output standard Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#171c1f] dark:text-white">
                        Chương / Module liên kết
                      </label>
                      <div className="relative">
                        <select
                          value={selectedModule}
                          onChange={(e) => setSelectedModule(e.target.value)}
                          className="w-full h-10 px-3.5 pr-9 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-[#1E1F20] focus:ring-1 focus:ring-blue-500 appearance-none outline-none cursor-pointer"
                        >
                          <option>Chương 4: Tầng Mạng &amp; Giao thức IP, Định tuyến</option>
                          <option>Chương 3: Tầng Giao vận (TCP &amp; UDP)</option>
                          <option>Chương 5: Tầng Liên kết dữ liệu &amp; Mạng LAN</option>
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
                      {/* Simulated WYSIWYG Toolbar */}
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
                      onClick={() => showToast('Thêm 1 câu hỏi trắc nghiệm mới vào danh sách')}
                      className="h-9 px-3.5 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Thêm câu hỏi thủ công</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast('AI đang phân tích học liệu để tự sinh câu hỏi...')}
                      className="h-9 px-3.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">
                        auto_awesome
                      </span>
                      <span>Sinh câu hỏi bằng AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast('Mở hộp thoại nhập file đề thi Word / Excel (.docx, .xlsx)')}
                      className="h-9 px-3.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        upload_file
                      </span>
                      <span>Nhập Word / Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast('Mở Ngân hàng câu hỏi khoa (450 câu đã thẩm định)')}
                      className="h-9 px-3.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        folder_special
                      </span>
                      <span>Ngân hàng khoa (450 câu)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs px-2">
                    <span>
                      Tổng: <strong className="text-[#171c1f] dark:text-white">2 câu</strong> (2.0 điểm)
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      Đạt chuẩn 100% Ma trận
                    </span>
                  </div>
                </div>

                {/* QUESTION ITEM 1: MULTIPLE CHOICE EXPANDED EDITOR */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col gap-4 relative border border-slate-200/80 dark:border-[#282A2C] overflow-hidden transition-all">
                  {/* Accent indicator bar on top of card */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-xl" />

                  {/* Question 1 Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 cursor-grab hover:text-slate-600 dark:hover:text-slate-200 text-[20px]">
                        drag_indicator
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <span className="text-sm font-bold text-[#171c1f] dark:text-white">
                          Trắc nghiệm một đáp án
                        </span>
                      </div>
                      {/* Bloom & Difficulty Badge */}
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Thông hiểu • Bloom 2</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Points Input */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-none">
                        <span className="text-xs text-slate-500 font-medium">Điểm:</span>
                        <input
                          type="number"
                          step="0.5"
                          value={q1Points}
                          onChange={(e) => setQ1Points(e.target.value)}
                          className="w-10 text-center bg-transparent text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none rounded-none"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        <button
                          type="button"
                          onClick={() => showToast('Đã nhân bản câu hỏi 1')}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-[#171c1f] dark:hover:text-white transition-all cursor-pointer"
                          title="Nhân bản câu hỏi"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Đã xóa câu hỏi 1')}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-all cursor-pointer"
                          title="Xóa câu hỏi"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsQ1Collapsed(!isQ1Collapsed)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-[#171c1f] dark:hover:text-white transition-all cursor-pointer"
                          title={isQ1Collapsed ? 'Mở rộng' : 'Thu gọn'}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isQ1Collapsed ? 'expand_more' : 'expand_less'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {!isQ1Collapsed && (
                    <>
                      {/* Question Prompt Area */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Nội dung câu hỏi
                        </label>
                        <textarea
                          rows={2}
                          defaultValue="Trong giao thức OSPF, loại gói tin nào được các Router gửi định kỳ để thiết lập và duy trì mối quan hệ láng giềng (Neighbor Adjacency)?"
                          className="w-full p-3.5 rounded-none bg-white dark:bg-[#131314] text-[#171c1f] dark:text-white text-xs font-medium leading-relaxed focus:outline-none focus:border-blue-500 border border-slate-300 dark:border-slate-700 transition-all"
                        />
                      </div>

                      {/* Options A, B, C, D List */}
                      <div className="flex flex-col gap-2 pt-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Danh sách phương án (Click radio để chỉ định đáp án ĐÚNG)</span>
                          <button
                            type="button"
                            onClick={() => showToast('Đã thêm phương án E')}
                            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline text-xs font-normal"
                          >
                            + Thêm phương án E
                          </button>
                        </label>

                        {/* Option A */}
                        <div
                          onClick={() => setQ1CorrectOption('A')}
                          className={`flex items-center gap-3 p-2.5 rounded-none transition-all group cursor-pointer border ${
                            q1CorrectOption === 'A'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              q1CorrectOption === 'A'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400 group-hover:border-blue-500'
                            }`}
                          >
                            {q1CorrectOption === 'A' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </button>
                          <span className="w-5 font-bold text-xs text-slate-700 dark:text-slate-300">
                            A.
                          </span>
                          <input
                            type="text"
                            defaultValue="Link State Request (LSR)"
                            className="flex-1 bg-transparent text-[#171c1f] dark:text-white text-xs focus:outline-none rounded-none"
                          />
                          {q1CorrectOption === 'A' && (
                            <span className="px-2 py-0.5 rounded-none border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-[#1E1F20]">
                              ĐÁP ÁN CHÍNH XÁC
                            </span>
                          )}
                        </div>

                        {/* Option B (Default Correct) */}
                        <div
                          onClick={() => setQ1CorrectOption('B')}
                          className={`flex items-center gap-3 p-2.5 rounded-none transition-all group cursor-pointer border ${
                            q1CorrectOption === 'B'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              q1CorrectOption === 'B'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400 group-hover:border-blue-500'
                            }`}
                          >
                            {q1CorrectOption === 'B' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </button>
                          <span className="w-5 font-bold text-xs text-blue-600 dark:text-blue-400">
                            B.
                          </span>
                          <input
                            type="text"
                            defaultValue="Hello Packet"
                            className="flex-1 bg-transparent text-[#171c1f] dark:text-white text-xs font-semibold focus:outline-none rounded-none"
                          />
                          {q1CorrectOption === 'B' && (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-none border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-[#1E1F20]">
                                ĐÁP ÁN CHÍNH XÁC
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Option C */}
                        <div
                          onClick={() => setQ1CorrectOption('C')}
                          className={`flex items-center gap-3 p-2.5 rounded-none transition-all group cursor-pointer border ${
                            q1CorrectOption === 'C'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              q1CorrectOption === 'C'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400 group-hover:border-blue-500'
                            }`}
                          >
                            {q1CorrectOption === 'C' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </button>
                          <span className="w-5 font-bold text-xs text-slate-700 dark:text-slate-300">
                            C.
                          </span>
                          <input
                            type="text"
                            defaultValue="Database Description (DBD)"
                            className="flex-1 bg-transparent text-[#171c1f] dark:text-white text-xs focus:outline-none rounded-none"
                          />
                          {q1CorrectOption === 'C' && (
                            <span className="px-2 py-0.5 rounded-none border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-[#1E1F20]">
                              ĐÁP ÁN CHÍNH XÁC
                            </span>
                          )}
                        </div>

                        {/* Option D */}
                        <div
                          onClick={() => setQ1CorrectOption('D')}
                          className={`flex items-center gap-3 p-2.5 rounded-none transition-all group cursor-pointer border ${
                            q1CorrectOption === 'D'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              q1CorrectOption === 'D'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400 group-hover:border-blue-500'
                            }`}
                          >
                            {q1CorrectOption === 'D' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </button>
                          <span className="w-5 font-bold text-xs text-slate-700 dark:text-slate-300">
                            D.
                          </span>
                          <input
                            type="text"
                            defaultValue="Link State Acknowledgment (LSAck)"
                            className="flex-1 bg-transparent text-[#171c1f] dark:text-white text-xs focus:outline-none rounded-none"
                          />
                          {q1CorrectOption === 'D' && (
                            <span className="px-2 py-0.5 rounded-none border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-[10px] bg-white dark:bg-[#1E1F20]">
                              ĐÁP ÁN CHÍNH XÁC
                            </span>
                          )}
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
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Gói tin <strong>Hello Packet (OSPF Type 1)</strong> được gửi định kỳ (mặc định 10s trên mạng Broadcast/Point-to-Point) đến địa chỉ Multicast 224.0.0.5 (AllSPFRouters) nhằm phát hiện láng giềng, thỏa thuận các thông số chung (Hello/Dead interval, Area ID, Subnet mask, v.v.).
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* QUESTION ITEM 2: DIAGRAM TOPOLOGY QUIZ CARD */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col gap-4 relative border border-slate-200/80 dark:border-[#282A2C] transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 cursor-grab hover:text-slate-600 dark:hover:text-slate-200 text-[20px]">
                        drag_indicator
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#171c1f] dark:text-white flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <span className="text-sm font-bold text-[#171c1f] dark:text-white">
                          Trắc nghiệm phân tích sơ đồ
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>Vận dụng • Bloom 3</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 px-3 py-1 rounded-none">
                        <span className="text-xs text-slate-500 font-medium">Điểm:</span>
                        <input
                          type="number"
                          step="0.5"
                          value={q2Points}
                          onChange={(e) => setQ2Points(e.target.value)}
                          className="w-10 text-center bg-transparent text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none rounded-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <button
                          type="button"
                          onClick={() => showToast('Đã nhân bản câu hỏi 2')}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-[#171c1f] dark:hover:text-white transition-all cursor-pointer"
                          title="Nhân bản"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Đã xóa câu hỏi 2')}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsQ2Collapsed(!isQ2Collapsed)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#282A2C] hover:text-[#171c1f] dark:hover:text-white transition-all cursor-pointer"
                          title={isQ2Collapsed ? 'Mở rộng' : 'Thu gọn'}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isQ2Collapsed ? 'expand_more' : 'expand_less'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {!isQ2Collapsed && (
                    <>
                      {/* Question Prompt */}
                      <p className="text-xs sm:text-sm font-semibold text-[#171c1f] dark:text-white leading-relaxed">
                        Quan sát sơ đồ mạng bên dưới: Giả sử thuật toán Dijkstra chạy trên Router R1. Đường đi có tổng chi phí (Total Cost) thấp nhất từ R1 đến mạng con 192.168.10.0/24 là bao nhiêu?
                      </p>

                      {/* Network Topology Visual Component (Inline SVG Schema) */}
                      <div className="w-full bg-[#f0f4f8] dark:bg-[#131314] rounded-xl p-4 border border-slate-200/80 dark:border-[#282A2C] flex flex-col items-center justify-center overflow-x-auto">
                        <svg
                          className="w-full max-w-2xl h-auto"
                          viewBox="0 0 680 180"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Topology links / lines */}
                          <line
                            x1="120"
                            y1="90"
                            x2="340"
                            y2="40"
                            stroke="#75777e"
                            strokeWidth="2"
                            strokeDasharray="4"
                          />
                          <line
                            x1="120"
                            y1="90"
                            x2="340"
                            y2="140"
                            stroke="#0059bb"
                            strokeWidth="2.5"
                          />
                          <line
                            x1="340"
                            y1="40"
                            x2="560"
                            y2="90"
                            stroke="#75777e"
                            strokeWidth="2"
                            strokeDasharray="4"
                          />
                          <line
                            x1="340"
                            y1="140"
                            x2="560"
                            y2="90"
                            stroke="#0059bb"
                            strokeWidth="2.5"
                          />

                          {/* Edge weights */}
                          <rect x="210" y="45" width="45" height="22" rx="4" fill="#eaeef2" />
                          <text
                            x="232"
                            y="60"
                            fill="#44474d"
                            fontSize="11"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            C=15
                          </text>

                          <rect x="210" y="125" width="45" height="22" rx="4" fill="#d8e2ff" />
                          <text
                            x="232"
                            y="140"
                            fill="#001a41"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            C=5
                          </text>

                          <rect x="430" y="45" width="45" height="22" rx="4" fill="#eaeef2" />
                          <text
                            x="452"
                            y="60"
                            fill="#44474d"
                            fontSize="11"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            C=20
                          </text>

                          <rect x="430" y="125" width="45" height="22" rx="4" fill="#d8e2ff" />
                          <text
                            x="452"
                            y="140"
                            fill="#001a41"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            C=10
                          </text>

                          {/* Node 1: Router R1 (Source) */}
                          <circle cx="120" cy="90" r="30" fill="#0d1c32" />
                          <text
                            x="120"
                            y="95"
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="Plus Jakarta Sans"
                            textAnchor="middle"
                          >
                            R1 (Nguồn)
                          </text>

                          {/* Node 2: Router R2 */}
                          <circle cx="340" cy="40" r="26" fill="#dfe3e7" />
                          <text
                            x="340"
                            y="45"
                            fill="#171c1f"
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="Plus Jakarta Sans"
                            textAnchor="middle"
                          >
                            R2
                          </text>

                          {/* Node 3: Router R3 */}
                          <circle cx="340" cy="140" r="26" fill="#d8e2ff" />
                          <text
                            x="340"
                            y="145"
                            fill="#001a41"
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="Plus Jakarta Sans"
                            textAnchor="middle"
                          >
                            R3
                          </text>

                          {/* Node 4: Router R4 (Destination) */}
                          <circle cx="560" cy="90" r="30" fill="#0059bb" />
                          <text
                            x="560"
                            y="93"
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="Plus Jakarta Sans"
                            textAnchor="middle"
                          >
                            R4
                          </text>
                          <text
                            x="560"
                            y="135"
                            fill="#44474d"
                            fontSize="11"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            192.168.10.0/24
                          </text>
                        </svg>
                        <span className="text-[11px] text-slate-500 mt-2 italic">
                          Hình 4.2: Sơ đồ topo kết nối 4 router và tham số chi phí Metric (Cost)
                        </span>
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          onClick={() => setQ2CorrectOption('A')}
                          className={`flex items-center gap-2.5 p-3 rounded-none transition-all cursor-pointer border ${
                            q2CorrectOption === 'A'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              q2CorrectOption === 'A'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400'
                            }`}
                          >
                            {q2CorrectOption === 'A' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </span>
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                            A.
                          </span>
                          <span className="text-xs text-[#171c1f] dark:text-white">
                            Cost = 35 (Qua đường R1-R2-R4)
                          </span>
                        </div>

                        <div
                          onClick={() => setQ2CorrectOption('B')}
                          className={`flex items-center gap-2.5 p-3 rounded-none transition-all cursor-pointer border ${
                            q2CorrectOption === 'B'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              q2CorrectOption === 'B'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400'
                            }`}
                          >
                            {q2CorrectOption === 'B' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </span>
                          <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                            B.
                          </span>
                          <span className="text-xs font-semibold text-[#171c1f] dark:text-white">
                            Cost = 15 (Qua đường R1-R3-R4)
                          </span>
                        </div>

                        <div
                          onClick={() => setQ2CorrectOption('C')}
                          className={`flex items-center gap-2.5 p-3 rounded-none transition-all cursor-pointer border ${
                            q2CorrectOption === 'C'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              q2CorrectOption === 'C'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400'
                            }`}
                          >
                            {q2CorrectOption === 'C' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </span>
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                            C.
                          </span>
                          <span className="text-xs text-[#171c1f] dark:text-white">Cost = 25</span>
                        </div>

                        <div
                          onClick={() => setQ2CorrectOption('D')}
                          className={`flex items-center gap-2.5 p-3 rounded-none transition-all cursor-pointer border ${
                            q2CorrectOption === 'D'
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-white dark:bg-[#131314] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              q2CorrectOption === 'D'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-400'
                            }`}
                          >
                            {q2CorrectOption === 'D' && (
                              <span className="material-symbols-outlined text-[13px]">done</span>
                            )}
                          </span>
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                            D.
                          </span>
                          <span className="text-xs text-[#171c1f] dark:text-white">Cost = 10</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* BIG ADD QUESTION ACTION TILE */}
                <button
                  type="button"
                  onClick={() => showToast('Mở trình tạo câu hỏi mới')}
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
                      onClick={() => showToast('Đổi nguồn học liệu tri thức')}
                      className="p-2.5 rounded-none bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#282A2C] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-red-500 text-[20px]">
                          picture_as_pdf
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[#171c1f] dark:text-white truncate">
                            Giao_trinh_Mang_may_tinh_v2.pdf
                          </span>
                          <span className="text-[11px] text-slate-400">18 thực thể • 4 chương</span>
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
                    onClick={() => showToast('AI đang sinh nhanh 10 câu hỏi chuẩn hóa...')}
                    className="w-full py-2.5 px-4 rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Sinh nhanh 10 câu hỏi bằng AI</span>
                    <span className="px-1.5 py-0.5 rounded-none bg-white/20 font-mono text-[10px]">
                      ~3s
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

                  {/* Window of Availability (Start & End) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500">Thời gian mở đề</label>
                      <div className="h-9 px-2.5 rounded-none bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 flex items-center justify-between text-[#171c1f] dark:text-white text-xs">
                        <span className="truncate">08:00 - 24/11</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          calendar_today
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-500">Hạn chót nộp bài</label>
                      <div className="h-9 px-2.5 rounded-none bg-white dark:bg-[#131314] border border-slate-300 dark:border-slate-700 flex items-center justify-between text-[#171c1f] dark:text-white text-xs">
                        <span className="truncate">23:59 - 28/11</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400">
                          event_busy
                        </span>
                      </div>
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

