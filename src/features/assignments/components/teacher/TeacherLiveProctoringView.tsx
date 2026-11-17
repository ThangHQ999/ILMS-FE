'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { useClasses } from '@/features/classes/hooks/useClasses';
import { DEFAULT_FACULTY_CLASSES } from '@/features/classes/constants';

interface TeacherLiveProctoringViewProps {
  userFullName?: string;
  initialMode?: 'idle' | 'live';
}

export function TeacherLiveProctoringView({
  userFullName = 'TS. Lê Hoàng Nam',
  initialMode = 'idle',
}: TeacherLiveProctoringViewProps) {
  const router = useRouter();

  // Mode: 'idle' (Chế độ chờ • Phòng thi đang đóng) | 'live' (Đang có 3 ca thi trực tiếp)
  const [proctorState, setProctorState] = useState<'idle' | 'live'>(initialMode);

  // App Shell State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter & Layout State
  const [activeFilter, setActiveFilter] = useState<'all' | 'warning' | 'safe'>('all');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Course Selector
  const [selectedCourse, setSelectedCourse] = useState('CS-202: Mạng máy tính & Truyền thông (HK II - 2024)');

  // Pre-flight Checklist State (Interactive)
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Kiểm tra kết nối Ingest Video', desc: 'Băng thông đạt chuẩn Full HD 30fps.', checked: true, isError: false },
    { id: 2, label: 'Đồng bộ mã đề thi xáo trộn', desc: 'Tạo 4 hoán vị câu hỏi tự động.', checked: true, isError: false },
    { id: 3, label: 'Cấu hình Safe Exam Browser (SEB)', desc: 'Chặn phím tắt Alt+Tab, Split Screen.', checked: true, isError: false },
    { id: 4, label: 'Gửi thông báo & Quy chế thi qua Email', desc: 'Đã gửi tự động cho 62 sinh viên.', checked: true, isError: false },
    { id: 5, label: 'Xác nhận Thí sinh đặc cách / Cộng giờ', desc: 'Còn 1 yêu cầu gia hạn y tế chưa phê duyệt.', checked: false, isError: true },
  ]);

  const checkedCount = useMemo(() => checklist.filter((item) => item.checked).length, [checklist]);

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // AI Sensitivity Slider
  const [sensitivityVal, setSensitivityVal] = useState<number>(85);
  const sensitivityLabel = useMemo(() => {
    if (sensitivityVal < 70) return 'Dung sai cao';
    if (sensitivityVal > 90) return 'Cực nghiêm ngặt';
    return 'Chuẩn bộ môn';
  }, [sensitivityVal]);

  // Selected Room for CCTV Modal
  const [inspectingRoom, setInspectingRoom] = useState<{
    id: string;
    code: string;
    title: string;
    supervisor: string;
    cameraCount: string;
    alertsCount: number;
  } | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleBroadcast = (roomName?: string) => {
    if (roomName) {
      showToast(`Đã mở micro phát loa trực tiếp tới ${roomName}.`);
    } else {
      showToast('Đã mở micro phát loa trực tiếp tới 03 phòng thi (168 sinh viên).');
    }
  };

  const handlePingSebLock = () => {
    showToast('Đã gửi tín hiệu kiểm tra chữ ký Safe Exam Browser tới 168 máy trạm thành công!');
  };

  const handleRefreshState = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã đồng bộ mới nhất trạng thái Ingest và telemetry phòng thi.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F6FAFE] dark:bg-[#131314] text-[#171c1f] dark:text-[#E3E3E3] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors">
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
            {/* Subtle Ambient Glow */}
            <div className="absolute -top-12 right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-80 left-12 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* TOP BAR: Breadcrumb, Mode Switcher & Global Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">ILMS</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span>Giảng viên</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <Link href="/assignments" className="hover:text-blue-600 dark:hover:text-blue-400">Khảo thí &amp; Bài thi</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Giám sát phòng thi</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Phòng Giám sát Thi Trực tuyến
                  </h1>

                  {/* Mode Badge based on current state */}
                  {proctorState === 'idle' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                      <span className="tracking-wide">CHẾ ĐỘ CHỜ • PHÒNG THI ĐANG ĐÓNG</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                      </span>
                      <span>03 CA THI ĐANG DIỄN RA</span>
                    </span>
                  )}
                </div>
              </div>

              {/* State Switcher & Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* INTERACTIVE MODE TOGGLE BUTTON */}
                <div className="inline-flex p-1 bg-white dark:bg-[#1E1F20] rounded-xl border border-slate-200 dark:border-[#282A2C] shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setProctorState('idle');
                      showToast('Đã chuyển sang Chế độ Chờ (Phòng thi đóng).');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      proctorState === 'idle'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                    <span>Chế độ Chờ (Idle)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProctorState('live');
                      showToast('Đã kích hoạt Trạng thái Giám sát Trực tiếp (03 Ca Live).');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      proctorState === 'live'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>Đang thi Live (3 Ca)</span>
                  </button>
                </div>

                {/* Course Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="appearance-none bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] text-slate-800 dark:text-white text-xs font-medium pl-3 pr-8 py-2 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="CS-202: Mạng máy tính & Truyền thông (HK II - 2024)">
                      CS-202: Mạng máy tính &amp; Truyền thông (HK II - 2024)
                    </option>
                    <option value="INT2022: Giải tích 2 (HK II - 2024)">
                      INT2022: Giải tích 2 (HK II - 2024)
                    </option>
                    <option value="INT-1340: Cấu trúc dữ liệu & Giải thuật">
                      INT-1340: Cấu trúc dữ liệu &amp; Giải thuật
                    </option>
                    <option value="CS-301: Cơ sở dữ liệu">
                      CS-301: Cơ sở dữ liệu
                    </option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                    arrow_drop_down
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Hệ thống Safe Exam Browser & Node Ingest đạt chuẩn 100% Ready!')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] hover:bg-slate-50 dark:hover:bg-[#282A2C] text-slate-800 dark:text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-blue-600 dark:text-blue-400">verified_user</span>
                  <span>Kiểm tra tiền trạm</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/assignments/create')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Lập lịch ca thi mới</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TRẠNG THÁI 1: CHẾ ĐỘ CHỜ • PHÒNG THI ĐANG ĐÓNG (IDLE STATE)               */}
            {/* ========================================================================= */}
            {proctorState === 'idle' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                {/* Hero Idle State Card with Ambient Tech Accent */}
                <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] p-6 lg:p-8 shadow-sm">
                  {/* Subtle Background Glow */}
                  <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
                  <div className="absolute right-12 bottom-0 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-2xl pointer-events-none" />

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-8 flex flex-col gap-4">
                      <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">hub</span>
                        <span>Proctoring Ingest Node: VN-CENTRAL-01 • Trạng thái Idle</span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          Hiện không có ca thi trực tuyến nào đang diễn ra
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                          Tất cả các phòng thi đều đang ở trạng thái nhàn rỗi. Công nghệ giám sát{' '}
                          <strong className="text-slate-900 dark:text-white font-semibold">AI Anti-Cheat v4.2</strong>{' '}
                          và giao thức bảo mật{' '}
                          <strong className="text-slate-900 dark:text-white font-semibold">Safe Exam Browser</strong>{' '}
                          đã sẵn sàng tự động đồng bộ theo thời gian biểu thực.
                        </p>
                      </div>

                      {/* Telemetry & Health Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-100 dark:border-slate-800">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E1F20] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                            <span className="material-symbols-outlined text-[20px]">dns</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">Ingest Nodes</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">100% Hoạt động (Ready)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-100 dark:border-slate-800">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E1F20] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                            <span className="material-symbols-outlined text-[20px]">psychology</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">AI Anti-Cheat 4.2</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">0.14s Độ trễ phân tích</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-100 dark:border-slate-800">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E1F20] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                            <span className="material-symbols-outlined text-[20px]">speed</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">Băng thông WebRTC</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">10 Gbps / 500 Stream</span>
                          </div>
                        </div>
                      </div>

                      {/* Action CTAs: Click to launch Sandbox Live Demo or Manual activate */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProctorState('live');
                            showToast('Đang khởi chạy phòng thi thử nghiệm Sandbox Demo với 03 ca trực tiếp...');
                          }}
                          className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">science</span>
                          <span>Mở phòng thi thử nghiệm (Sandbox Demo)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProctorState('live');
                            showToast('Đã kích hoạt phòng thi thủ công cho Quiz 05.');
                          }}
                          className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-[#282A2C] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-500">flash_on</span>
                          <span>Kích hoạt phòng thi thủ công</span>
                        </button>
                      </div>
                    </div>

                    {/* Tech Visual / Node Visualization Column */}
                    <div className="lg:col-span-4 flex justify-center">
                      <div className="relative w-full max-w-[280px] p-5 bg-slate-50 dark:bg-[#131314] rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
                        <div className="w-24 h-24 relative flex items-center justify-center mb-3">
                          <svg className="w-full h-full text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 100 100">
                            <circle className="animate-spin" cx="50" cy="50" opacity="0.4" r="42" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.5" style={{ animationDuration: '24s' }} />
                            <circle cx="50" cy="50" opacity="0.6" r="32" stroke="currentColor" strokeWidth="2" />
                            <circle cx="50" cy="50" fill="currentColor" fillOpacity="0.12" r="22" />
                            <circle cx="50" cy="50" fill="currentColor" r="8" />
                          </svg>
                          <span className="material-symbols-outlined absolute text-[24px] text-white">videocam_off</span>
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Safe Room Engine</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          Cơ chế giám sát hành vi, nhận diện nhiều khuôn mặt &amp; ngăn chặn tab ngoài.
                        </span>
                        <div className="mt-4 w-full bg-white dark:bg-[#1E1F20] rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-left">
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Phiên bản giao thức</div>
                            <div className="font-mono text-xs font-bold text-slate-800 dark:text-white">WebRTC-TLS 1.3</div>
                          </div>
                          <span className="material-symbols-outlined text-blue-600 text-[20px]">lock</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main 2-Column: Upcoming Schedules & Quick Audit */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left Column: Upcoming Sessions (8 cols) */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    {/* Section: Ca thi sắp diễn ra */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-200 dark:border-[#282A2C] p-5 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 text-[22px]">alarm_on</span>
                          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                            Lịch các ca thi sắp diễn ra (Trong 24h tới)
                          </h2>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                          3 ca thi đã lên lịch
                        </span>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        {/* Ca 1: Sắp diễn ra trong 2h */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-sm">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex flex-col items-center justify-center shrink-0">
                                <span className="font-bold text-base leading-tight">14</span>
                                <span className="text-[10px] uppercase font-bold leading-none">00:00</span>
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    Quiz 05: Giao thức BGP &amp; Định tuyến liên miền
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold animate-pulse">
                                    Bắt đầu sau 2h 15p
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-blue-600">groups</span>
                                    62 Thí sinh đăng ký
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-blue-600">timer</span>
                                    Thời gian: 45 phút
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-blue-600">security</span>
                                    AI + Cam 360° + SEB Lock
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 lg:self-center">
                              <button
                                type="button"
                                onClick={() => showToast('Mở bảng cấu hình an ninh và Safe Exam Browser')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1F20] hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">tune</span>
                                <span>Cấu hình an ninh</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProctorState('live');
                                  showToast('Đã mở phòng chờ sớm cho Quiz 05!');
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                                <span>Mở phòng chờ sớm</span>
                              </button>
                            </div>
                          </div>

                          {/* Mini Checklist Status */}
                          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-400">Đề thi số hóa</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">check_circle</span> Đã niêm phong
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-400">Quy chế phòng thi</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">check_circle</span> Đã gửi SV
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-400">Phần mềm Safe Exam</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">check_circle</span> Bắt buộc SEB
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-400">Giám thị phụ tá</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[15px] text-slate-400">hourglass_top</span> Th.S Trần Vũ (Chờ)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ca 2: Ngày mai */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-sm">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[10px] uppercase font-bold leading-none">Ngày mai</span>
                                <span className="font-bold text-sm leading-tight mt-0.5">08:30</span>
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    Kiểm tra Giữa kỳ CS-202 (Mã đề NET-MID-01)
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                                    2 Phòng song song
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                  <span>120 Thí sinh</span>
                                  <span>•</span>
                                  <span>Thời gian: 90 phút</span>
                                  <span>•</span>
                                  <span>Giám thị kép + AI Proctor 4.2</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => showToast('Mở danh sách 120 thí sinh ca thi giữa kỳ')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1F20] hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-xs cursor-pointer lg:self-center"
                            >
                              <span className="material-symbols-outlined text-[16px]">badge</span>
                              <span>Xem danh sách thí sinh</span>
                            </button>
                          </div>
                        </div>

                        {/* Ca 3: Thứ 5 tới */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-200/80 dark:border-slate-800 transition-all hover:shadow-sm">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[10px] uppercase font-bold leading-none">Thứ 5</span>
                                <span className="font-bold text-sm leading-tight mt-0.5">10:00</span>
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  Quiz 06: Mạng không dây &amp; An toàn kết nối
                                </span>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                  <span>58 Thí sinh</span>
                                  <span>•</span>
                                  <span>Thời gian: 30 phút</span>
                                  <span>•</span>
                                  <span>Webcam Monitor AI</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => showToast('Mở lịch thi để chỉnh sửa thời gian')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E1F20] hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-xs cursor-pointer lg:self-center"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                              <span>Điều chỉnh lịch thi</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Lịch sử các ca thi gần đây */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-200 dark:border-[#282A2C] p-5 sm:p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-[22px]">history</span>
                          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                            Lịch sử các ca thi vừa hoàn thành
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Hiển thị toàn bộ nhật ký giám sát các ca thi')}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          Xem tất cả nhật ký <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-[#171c1f] text-slate-500 uppercase text-[11px] font-semibold border-y border-slate-200 dark:border-slate-800">
                              <th className="py-2.5 px-4 rounded-l-lg">Ca thi &amp; Thời gian</th>
                              <th className="py-2.5 px-4">Sĩ số / Nộp bài</th>
                              <th className="py-2.5 px-4">Báo cáo AI &amp; Vi phạm</th>
                              <th className="py-2.5 px-4 text-right rounded-r-lg">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900 dark:text-white">Quiz 04: Định tuyến OSPF &amp; RIP</span>
                                  <span className="text-[11px] text-slate-500">Hôm nay • 10:30 - 11:15 (Đã kết thúc)</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">60 / 60</span>
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">100% nộp</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span className="font-medium text-slate-800 dark:text-slate-200">3 Cảnh báo vi phạm</span>
                                  <span className="text-slate-400 text-[11px]">(Đã xử lý)</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => showToast('Mở video ghi hình và nhật ký vi phạm Quiz 04')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-blue-600 dark:text-blue-400 font-semibold text-[11px] cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[15px]">video_library</span>
                                  <span>Log &amp; Video</span>
                                </button>
                              </td>
                            </tr>

                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900 dark:text-white">Quiz 03: Tầng Giao vận &amp; Giao thức TCP/UDP</span>
                                  <span className="text-[11px] text-slate-500">3 ngày trước • 14:00 - 14:45</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">58 / 59</span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">1 Vắng có phép</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="font-medium text-slate-800 dark:text-slate-200">0 Vi phạm</span>
                                  <span className="text-slate-400 text-[11px]">(1 Khiếu nại)</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => showToast('Tải báo cáo an ninh ca thi Quiz 03')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-blue-600 dark:text-blue-400 font-semibold text-[11px] cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[15px]">verified</span>
                                  <span>Báo cáo an ninh</span>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pre-Flight Checklist & AI Monitor Config (4 cols) */}
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Section: Checklist Giảng viên trước ca thi */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-slate-200 dark:border-[#282A2C] p-5 sm:p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 text-[22px]">checklist</span>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">Checklist Tiền ca thi</h3>
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                          {checkedCount} / {checklist.length} Đạt
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Các điều kiện kỹ thuật và pháp lý bắt buộc trước khi mở phòng chờ thi trực tuyến.
                      </p>

                      <div className="flex flex-col gap-2.5">
                        {checklist.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                              item.isError && !item.checked
                                ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50'
                                : 'bg-slate-50 dark:bg-[#171c1f] border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(item.id)}
                              className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${item.isError && !item.checked ? 'text-rose-700 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>
                                {item.label}
                              </span>
                              <span className={`text-[11px] ${item.isError && !item.checked ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                {item.desc}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleChecklistItem(5);
                          showToast('Đã phê duyệt gia hạn y tế cho thí sinh đặc cách (+15 phút).');
                        }}
                        className="w-full mt-4 py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-semibold text-xs transition-all text-center cursor-pointer"
                      >
                        Duyệt danh sách đặc cách (1)
                      </button>
                    </div>

                    {/* Section: Mini Assistant Card / Trợ lý AI Giám thị */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#160066] text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-purple-300 text-[22px]">smart_toy</span>
                          <span className="font-bold text-base">Trợ lý AI Giám thị v4.2</span>
                        </div>
                        <p className="text-xs text-white/80 mb-4 leading-relaxed">
                          Trong ca thi, AI tự động gắn cờ 6 loại hành vi bất thường: đổi người ngồi thi, nhìn ra ngoài màn hình quá 5s, âm thanh đối thoại nền, và cắm màn hình phụ.
                        </p>
                        <div className="p-3 rounded-xl bg-white/10 text-white text-xs font-mono flex items-center justify-between">
                          <span>Độ nhạy AI phát hiện:</span>
                          <span className="font-bold text-purple-300">88% (Cân bằng)</span>
                        </div>
                      </div>

                      <div className="relative z-10 pt-4 mt-4 border-t border-white/20 flex items-center justify-between text-xs">
                        <span className="text-white/70">Mã máy chủ: VN-GPU-NVIDIA-A100</span>
                        <button
                          type="button"
                          onClick={() => showToast('Mở cấu hình bộ tham số thị giác máy tính AI')}
                          className="text-purple-300 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          Cài đặt <span className="material-symbols-outlined text-[14px]">tune</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TRẠNG THÁI 2: 03 CA THI ĐANG DIỄN RA (LIVE MONITORING FEEDS)              */}
            {/* ========================================================================= */}
            {proctorState === 'live' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                {/* Live Telemetry KPI Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Card 1: Tổng Thí sinh Trực tuyến */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Tổng Thí sinh Trực tuyến
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">168</span>
                        <span className="text-xs text-slate-500">/ 175 SV (96%)</span>
                      </div>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">sensors</span> 7 SV vắng mặt có phép
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined text-[24px]">groups</span>
                    </div>
                  </div>

                  {/* Card 2: Cảnh báo An ninh AI */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cảnh báo An ninh AI
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-rose-600">05</span>
                        <span className="text-xs text-rose-500 font-semibold">Vụ việc</span>
                      </div>
                      <span className="font-mono text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">warning</span> 1 Tab Switch, 1 Ghost, 3 Mạng
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600">
                      <span className="material-symbols-outlined text-[24px]">shield</span>
                    </div>
                  </div>

                  {/* Card 3: Băng thông Ingest SEB */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Băng thông Ingest SEB
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">38.4</span>
                        <span className="text-xs text-slate-500 font-semibold">MB/s</span>
                      </div>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">cloud_sync</span> 162 luồng 1080p WebRTC
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <span className="material-symbols-outlined text-[24px]">speed</span>
                    </div>
                  </div>

                  {/* Card 4: Trợ lý AI Giám thị */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Trợ lý AI Giám thị
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">Active</span>
                        <span className="text-xs text-slate-500 font-semibold">v4.2 PRO</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">tune</span> Độ nhạy: {sensitivityVal}% ({sensitivityLabel})
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/50 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Bar & View Switcher */}
                <div className="p-3 sm:px-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleBroadcast()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">campaign</span>
                      <span>Phát loa toàn bộ 03 phòng</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePingSebLock}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#282A2C] text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                      <span>Gửi lệnh Ping SEB Lock</span>
                    </button>

                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-medium">Lọc:</span>
                      <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          activeFilter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-[#282A2C] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Tất cả (3)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFilter('warning')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          activeFilter === 'warning'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-[#282A2C] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Có cảnh báo (2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFilter('safe')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          activeFilter === 'safe'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-[#282A2C] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        An toàn (1)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-[#131314] p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setViewLayout('list')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          viewLayout === 'list'
                            ? 'bg-white dark:bg-[#1E1F20] text-blue-600 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">view_list</span>
                        <span>Danh sách</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewLayout('grid')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          viewLayout === 'grid'
                            ? 'bg-white dark:bg-[#1E1F20] text-blue-600 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">grid_view</span>
                        <span>Lưới thẻ</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleRefreshState}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Làm mới trạng thái"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
                        refresh
                      </span>
                    </button>
                  </div>
                </div>

                {/* LIVE EXAM SESSIONS LIST VIEW */}
                <div className={`flex flex-col gap-4 ${viewLayout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2' : ''}`}>
                  {/* ROOM 1: HIGH PRIORITY / SECURITY ALERTS (Red Border) */}
                  {(activeFilter === 'all' || activeFilter === 'warning') && (
                    <article className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col xl:flex-row gap-6 items-stretch justify-between">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-rose-500" />

                      {/* Left Column: Meta & Supervisor */}
                      <div className="flex flex-col justify-between min-w-0 xl:w-1/4 pl-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              Phòng 01 (CLC-01)
                            </span>
                            <span className="font-mono text-xs text-slate-400 font-medium">#LIVE-CS202-05</span>
                          </div>
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                            Quiz 05: Giao thức BGP &amp; Định tuyến liên miền
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                            <span>Giám thị: <strong className="text-slate-800 dark:text-slate-200">TS. Lê Hoàng Nam</strong> &amp; Th.S Trần Văn Anh</span>
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg bg-slate-100 dark:bg-[#131314] flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined text-[20px]">videocam</span>
                          </div>
                          <div className="flex flex-col text-xs">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Camera AI Ingest</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">56/58 luồng 1080p</span>
                            <span className="font-mono text-[10px] text-rose-500 font-semibold">2 luồng camera chập chờn</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Column: Countdown, Progress & Students */}
                      <div className="flex flex-col justify-between xl:w-2/5 p-4 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-100 dark:border-slate-800 gap-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600">
                              <span className="material-symbols-outlined text-[22px]">timer</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-500">Thời gian còn lại</span>
                              <span className="text-lg font-bold text-rose-600 font-mono tracking-tight">24:15 phút</span>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-slate-400">Bắt đầu: 14:00</span>
                            <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold">Thời lượng: 45 phút</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Tiến độ làm bài</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">68% hoàn thành (TB 17/25 câu)</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500" style={{ width: '68%' }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-blue-600">how_to_reg</span>
                            <span className="font-bold text-slate-900 dark:text-white">58/60 SV có mặt (96.7%)</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500">2 SV vắng có phép</span>
                        </div>
                      </div>

                      {/* Right Column: AI Security Violations & Action CTAs */}
                      <div className="flex flex-col justify-between xl:w-1/3 gap-3">
                        <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[17px]">security_update_warning</span>
                              03 CẢNH BÁO AN NINH AI
                            </span>
                            <span className="font-mono text-[10px] text-rose-600 font-bold bg-white dark:bg-[#1E1F20] px-2 py-0.5 rounded">Cần xử lý</span>
                          </div>

                          <div className="flex flex-col gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-between bg-white dark:bg-[#1E1F20] px-2 py-1 rounded shadow-xs">
                              <span className="truncate font-medium">⚠️ SV Nguyễn Đức Huy (B21DCCN123): Rời màn hình</span>
                              <span className="font-mono text-[10px] text-rose-600 font-bold shrink-0 ml-1">14:22:04</span>
                            </div>
                            <div className="flex items-center justify-between bg-white dark:bg-[#1E1F20] px-2 py-1 rounded shadow-xs">
                              <span className="truncate font-medium">⚠️ SV Trần Mai Anh (B21DCCN045): Người thứ 2 trong khung</span>
                              <span className="font-mono text-[10px] text-rose-600 font-bold shrink-0 ml-1">14:21:40</span>
                            </div>
                            <div className="flex items-center justify-between bg-white dark:bg-[#1E1F20] px-2 py-1 rounded shadow-xs">
                              <span className="truncate font-medium">⚠️ SV Hoàng Tuấn Đạt (B21DCCN089): Âm thanh thì thầm</span>
                              <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0 ml-1">14:19:12</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setInspectingRoom({
                                id: 'p01',
                                code: 'Phòng 01 (CLC-01)',
                                title: 'Quiz 05: Giao thức BGP & Định tuyến liên miền',
                                supervisor: 'TS. Lê Hoàng Nam',
                                cameraCount: '56/58 luồng 1080p',
                                alertsCount: 3,
                              })
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <span>Vào giám sát phòng này</span>
                            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBroadcast('Phòng 01')}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Phát loa riêng phòng 01"
                          >
                            <span className="material-symbols-outlined text-[17px] text-blue-600">volume_up</span>
                            <span>Loa P01</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Mở chi tiết log sự kiện vi phạm thời gian thực Phòng 01')}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Xem nhật ký vi phạm thời gian thực"
                          >
                            <span className="material-symbols-outlined text-[18px]">history_edu</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )}

                  {/* ROOM 2: NOMINAL / SAFE OPERATION (Green Border) */}
                  {(activeFilter === 'all' || activeFilter === 'safe') && (
                    <article className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col xl:flex-row gap-6 items-stretch justify-between">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500" />

                      {/* Left Column */}
                      <div className="flex flex-col justify-between min-w-0 xl:w-1/4 pl-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Phòng 02 (Đại trà K21)
                            </span>
                            <span className="font-mono text-xs text-slate-400 font-medium">#LIVE-CS202-02</span>
                          </div>
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                            Kiểm tra 15 phút: Mô hình OSI &amp; Tầng Giao vận TCP/UDP
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                            <span>Giám thị: <strong className="text-slate-800 dark:text-slate-200">Th.S Vũ Minh Tuấn</strong></span>
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">videocam</span>
                          </div>
                          <div className="flex flex-col text-xs">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Camera AI Ingest</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">52/52 luồng 1080p @ 30fps</span>
                            <span className="font-mono text-[10px] text-emerald-600 font-semibold">Khóa SEB 100% toàn màn hình</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Column */}
                      <div className="flex flex-col justify-between xl:w-2/5 p-4 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-100 dark:border-slate-800 gap-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600">
                              <span className="material-symbols-outlined text-[22px]">timer</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-500">Thời gian còn lại</span>
                              <span className="text-lg font-bold text-blue-600 font-mono tracking-tight">08:45 phút</span>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-slate-400">Bắt đầu: 14:15</span>
                            <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold">Thời lượng: 20 phút</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Tiến độ làm bài</span>
                            <span className="font-mono font-bold text-emerald-600">82% hoàn thành (TB 12/15 câu)</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '82%' }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                            <span className="font-bold text-slate-900 dark:text-white">52/55 SV có mặt (94.5%)</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500">3 SV vắng mặt</span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col justify-between xl:w-1/3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[17px]">verified_user</span>
                              AN TOÀN TUYỆT ĐỐI (0 VI PHẠM)
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 text-[10px] font-mono font-bold">100% SEB LOCKED</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Mọi ứng dụng ngoài đều bị chặn. Luồng micro không ghi nhận âm thanh trao đổi bất thường. Điểm tin cậy phòng thi đạt 99.4/100.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setInspectingRoom({
                                id: 'p02',
                                code: 'Phòng 02 (Đại trà K21)',
                                title: 'Kiểm tra 15 phút: Mô hình OSI & Tầng Giao vận TCP/UDP',
                                supervisor: 'Th.S Vũ Minh Tuấn',
                                cameraCount: '52/52 luồng 1080p @ 30fps',
                                alertsCount: 0,
                              })
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <span>Vào giám sát phòng này</span>
                            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBroadcast('Phòng 02')}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[17px] text-blue-600">volume_up</span>
                            <span>Loa P02</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )}

                  {/* ROOM 3: NETWORK GLITCH & TECH ASSISTANCE (Amber Border) */}
                  {(activeFilter === 'all' || activeFilter === 'warning') && (
                    <article className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col xl:flex-row gap-6 items-stretch justify-between">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-500" />

                      {/* Left Column */}
                      <div className="flex flex-col justify-between min-w-0 xl:w-1/4 pl-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-600 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Phòng 03 (CLC-02)
                            </span>
                            <span className="font-mono text-xs text-slate-400 font-medium">#LIVE-CS202-06</span>
                          </div>
                          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                            Quiz 05: Giao thức BGP &amp; Định tuyến liên miền (Ca song song)
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                            <span>Giám thị: <strong className="text-slate-800 dark:text-slate-200">Th.S Nguyễn Lan Phương</strong></span>
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">wifi_off</span>
                          </div>
                          <div className="flex flex-col text-xs">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Chất lượng Đường truyền</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">54/58 luồng ổn định</span>
                            <span className="font-mono text-[10px] text-amber-600 font-semibold">4 SV rớt gói tin (Đã bật Cache)</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Column */}
                      <div className="flex flex-col justify-between xl:w-2/5 p-4 rounded-xl bg-slate-50 dark:bg-[#171c1f] border border-slate-100 dark:border-slate-800 gap-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600">
                              <span className="material-symbols-outlined text-[22px]">timer</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-slate-500">Thời gian còn lại</span>
                              <span className="text-lg font-bold text-slate-800 dark:text-white font-mono tracking-tight">24:15 phút</span>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-slate-400">Bắt đầu: 14:00</span>
                            <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold">Thời lượng: 45 phút</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">Tiến độ làm bài</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">64% hoàn thành (TB 16/25 câu)</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-amber-500 transition-all duration-500" style={{ width: '64%' }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-blue-600">how_to_reg</span>
                            <span className="font-bold text-slate-900 dark:text-white">58/60 SV có mặt (96.7%)</span>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500">2 SV vắng có phép</span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-col justify-between xl:w-1/3 gap-3">
                        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[17px]">warning</span>
                              02 CẢNH BÁO MẠNG &amp; THIẾT BỊ
                            </span>
                            <span className="font-mono text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-white dark:bg-[#1E1F20] px-2 py-0.5 rounded">Đang cứu hộ</span>
                          </div>

                          <div className="flex flex-col gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-between bg-white dark:bg-[#1E1F20] px-2 py-1 rounded shadow-xs">
                              <span className="truncate">⚠️ 4 SV đường truyền lag &gt;800ms (Lưu đệm client)</span>
                              <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0 ml-1">LocalDB OK</span>
                            </div>
                            <div className="flex items-center justify-between bg-white dark:bg-[#1E1F20] px-2 py-1 rounded shadow-xs">
                              <span className="truncate">⚠️ SV Phạm Văn Long: Mất nhận diện khuôn mặt (5s)</span>
                              <span className="font-mono text-[10px] text-amber-600 font-bold shrink-0 ml-1">14:23:10</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setInspectingRoom({
                                id: 'p03',
                                code: 'Phòng 03 (CLC-02)',
                                title: 'Quiz 05: Giao thức BGP (Ca song song)',
                                supervisor: 'Th.S Nguyễn Lan Phương',
                                cameraCount: '54/58 luồng ổn định',
                                alertsCount: 2,
                              })
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <span>Vào giám sát phòng này</span>
                            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast('Đang gửi gói tin tái kết nối dự phòng tới 4 SV lag')}
                            className="px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[17px]">build</span>
                            <span>Hỗ trợ mạng</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )}
                </div>

                {/* LOWER BENTO: UPCOMING SESSIONS & PROCTOR TOOLKIT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                  {/* Left Column: Upcoming Sessions in 24h (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 text-[20px]">calendar_clock</span>
                        <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          Lịch Các Ca Thi Sắp Diễn Ra (Trong 24 Giờ Tới)
                        </h2>
                      </div>
                      <Link href="/assignments" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium">
                        <span>Xem toàn bộ lịch thi tuần</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </Link>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex flex-col gap-2.5">
                      {/* Upcoming 1 */}
                      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-800 dark:text-white shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">HÔM NAY</span>
                            <span className="font-bold text-sm leading-none mt-0.5">15:30</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">MATH-102</span>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Quiz 02: Tích phân bội &amp; Ứng dụng hình học</h4>
                            </div>
                            <span className="text-xs text-slate-500 mt-0.5">Thời lượng: 30 phút • 80 Thí sinh đăng ký • SEB Browser bắt buộc</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium">Bắt đầu sau 1h 05m</span>
                          <button
                            type="button"
                            onClick={() => showToast('Mở màn hình chuẩn bị đề thi MATH-102')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Chuẩn bị đề thi
                          </button>
                        </div>
                      </div>

                      {/* Upcoming 2 */}
                      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-800 dark:text-white shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">HÔM NAY</span>
                            <span className="font-bold text-sm leading-none mt-0.5">17:00</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">CS-202</span>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Kiểm tra giữa kỳ: Thực hành Phân tích Gói tin Wireshark</h4>
                            </div>
                            <span className="text-xs text-slate-500 mt-0.5">Thời lượng: 60 phút • 120 Thí sinh • Chấm tự động qua Testcase AI</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium">Bắt đầu sau 2h 35m</span>
                          <button
                            type="button"
                            onClick={() => showToast('Mở môi trường Sandbox kiểm thử testcases')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Kiểm tra Sandbox
                          </button>
                        </div>
                      </div>

                      {/* Upcoming 3 */}
                      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-800 dark:text-white shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">NGÀY MAI</span>
                            <span className="font-bold text-sm leading-none mt-0.5">08:00</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">CS-202</span>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Quiz 06: Giao thức Tầng Ứng dụng HTTP/3 &amp; DNSSEC</h4>
                            </div>
                            <span className="text-xs text-slate-500 mt-0.5">Thời lượng: 40 phút • 180 Thí sinh (3 Phòng thi đồng thời)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium">Ngày mai</span>
                          <button
                            type="button"
                            onClick={() => showToast('Xem chi tiết cấu hình ca thi Quiz 06')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Chi tiết ca thi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pre-flight Checklist & AI Proctor Controls (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Checklist Card */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex flex-col gap-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-blue-600">checklist</span>
                          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Hệ Thống Tiền Ca Thi</h2>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          4/5 ĐẠT CHUẨN
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#171c1f] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">Bảo mật mã đề &amp; Đảo câu</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-600 font-bold">SHA-256</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#171c1f] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">Chữ ký cấu hình Safe Exam</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-600 font-bold">v3.5.1 Verified</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#171c1f] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">Kênh ghi nhận hình ảnh &amp; mic</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-600 font-bold">WebRTC Ready</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#171c1f] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">Tự động lưu đệm Offline</span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-600 font-bold">IndexedDB OK</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs border border-rose-200/60 dark:border-rose-900/40">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-rose-600">error</span>
                          <span className="text-rose-700 dark:text-rose-300 font-medium">Điểm danh FaceID sinh viên</span>
                        </div>
                        <span className="font-mono text-[11px] text-rose-600 font-bold">96% (7 vắng)</span>
                      </div>
                    </div>

                    {/* AI Proctor Assistant Card with Sensitivity Slider */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#282A2C] shadow-xs flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px] text-indigo-600">smart_toy</span>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Trợ lý AI Giám thị v4.2</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">ONLINE</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        AI tự động quét cử động mắt, nhận dạng giọng nói thì thầm, kiểm tra màn hình ảo và gửi cảnh báo đỏ tới giảng viên.
                      </p>

                      <div className="flex flex-col gap-2 pt-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">Độ nhạy phân tích hành vi:</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {sensitivityVal}% ({sensitivityLabel})
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="99"
                          value={sensitivityVal}
                          onChange={(e) => setSensitivityVal(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>50% (Dung sai cao)</span>
                          <span>99% (Cực nghiêm ngặt)</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => showToast('Đang kết xuất và tải xuống báo cáo tổng hợp ca thi dạng PDF...')}
                          className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-semibold text-xs text-center transition-colors cursor-pointer"
                        >
                          Xuất Báo Cáo Ca Thi (.PDF)
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Mở bảng cài đặt nâng cao cho thuật toán nhận diện')}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Cài đặt tham số nhận diện AI"
                        >
                          <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* CCTV LIVE ROOM DETAIL MODAL (Khi bấm "Vào giám sát phòng này")             */}
      {/* ========================================================================= */}
      {inspectingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{inspectingRoom.code}: {inspectingRoom.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
                      LIVE INGEST
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Giám sát: {inspectingRoom.supervisor} • {inspectingRoom.cameraCount} • {inspectingRoom.alertsCount} Cảnh báo đang hoạt động
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBroadcast(inspectingRoom.code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">campaign</span>
                  <span>Phát loa phòng này</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingRoom(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Video Streams Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Student 1: Warning Tab Switch */}
              <div className="relative rounded-2xl bg-slate-900 border-2 border-rose-500 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="material-symbols-outlined text-6xl text-slate-700">face</span>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <span>⚠️ TAB SWITCH #2</span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
                    24fps • 1080p
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-xs text-white">
                    <p className="font-bold">Nguyễn Đức Huy</p>
                    <p className="text-[10px] text-slate-400 font-mono">B21DCCN123 • Máy 14</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-rose-400 font-semibold">Chuyển sang tab ngoài 3s</span>
                  <button
                    type="button"
                    onClick={() => showToast('Đã gửi cảnh báo đỏ trực tiếp đến màn hình thí sinh Nguyễn Đức Huy!')}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Gửi cảnh cáo
                  </button>
                </div>
              </div>

              {/* Student 2: Second Person Detected */}
              <div className="relative rounded-2xl bg-slate-900 border-2 border-rose-500 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="material-symbols-outlined text-6xl text-slate-700">group</span>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <span>⚠️ PHÁT HIỆN 2 NGƯỜI</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-xs text-white">
                    <p className="font-bold">Trần Mai Anh</p>
                    <p className="text-[10px] text-slate-400 font-mono">B21DCCN045 • Máy 08</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-rose-400 font-semibold">Xuất hiện góc phải cam</span>
                  <button
                    type="button"
                    onClick={() => showToast('Đã chụp ảnh bằng chứng và niêm phong vi phạm!')}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Lập biên bản
                  </button>
                </div>
              </div>

              {/* Student 3: Whisper Audio */}
              <div className="relative rounded-2xl bg-slate-900 border-2 border-amber-500 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="material-symbols-outlined text-6xl text-slate-700">mic</span>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-600 text-white font-mono text-[10px] font-bold flex items-center gap-1">
                    <span>⚠️ TIẾNG THÌ THẦM (MIC)</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-xs text-white">
                    <p className="font-bold">Hoàng Tuấn Đạt</p>
                    <p className="text-[10px] text-slate-400 font-mono">B21DCCN089 • Máy 22</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-amber-400 font-semibold">Tần số lặp lại 14:19</span>
                  <button
                    type="button"
                    onClick={() => showToast('Đã gửi nhắc nhở âm lượng tới thí sinh Hoàng Tuấn Đạt')}
                    className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Nhắc nhở
                  </button>
                </div>
              </div>

              {/* Student 4: Safe Normal */}
              <div className="relative rounded-2xl bg-slate-900 border border-emerald-500/50 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="material-symbols-outlined text-6xl text-emerald-800">face</span>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-emerald-600/80 text-white font-mono text-[10px] font-bold">
                    ✓ AN TOÀN
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-xs text-white">
                    <p className="font-bold">Lê Văn Thành</p>
                    <p className="text-[10px] text-slate-400 font-mono">B21DCCN102 • Máy 01</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
                  <span className="text-[11px]">Đang làm câu #19/25</span>
                  <span className="font-mono text-[11px]">SEB Lock: OK</span>
                </div>
              </div>

              {/* Student 5: Safe Normal */}
              <div className="relative rounded-2xl bg-slate-900 border border-emerald-500/50 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="material-symbols-outlined text-6xl text-emerald-800">face</span>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-emerald-600/80 text-white font-mono text-[10px] font-bold">
                    ✓ AN TOÀN
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-xs text-white">
                    <p className="font-bold">Vũ Thùy Linh</p>
                    <p className="text-[10px] text-slate-400 font-mono">B21DCCN077 • Máy 05</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
                  <span className="text-[11px]">Đang làm câu #21/25</span>
                  <span className="font-mono text-[11px]">SEB Lock: OK</span>
                </div>
              </div>

              {/* Student 6: Safe Normal */}
              <div className="relative rounded-2xl bg-slate-900 border border-emerald-500/50 overflow-hidden flex flex-col">
                <div className="h-44 bg-slate-900 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="material-symbols-outlined text-6xl text-emerald-800">face</span>
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-emerald-600/80 text-white font-mono text-[10px] font-bold">
                    ✓ AN TOÀN
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 text-xs text-white">
                    <p className="font-bold">Phạm Quỳnh Trang</p>
                    <p className="text-[10px] text-slate-400 font-mono">B21DCCN140 • Máy 19</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
                  <span className="text-[11px]">Đang làm câu #18/25</span>
                  <span className="font-mono text-[11px]">SEB Lock: OK</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Command Toolbar */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                <span>Tổng hiển thị: <strong>6/58 luồng camera trực tiếp</strong></span>
                <span>•</span>
                <span className="text-emerald-400">Tỷ lệ khung hình: <strong>30 FPS WebRTC</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Đang tải danh sách 58 luồng camera đầy đủ...')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
                >
                  Xem toàn bộ 58 camera
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingRoom(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold cursor-pointer"
                >
                  Đóng màn hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md text-xs font-semibold border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-blue-400 dark:text-blue-600 text-[18px]">
            notifications_active
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
