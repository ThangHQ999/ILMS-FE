'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassSettingsTabProps {
  classInfo: ClassItem;
  onSaveClassInfo: (updates: { title: string; description: string }) => void;
  onRegenerateCode: () => void;
  onOpenArchiveModal: () => void;
}

type SectionId =
  | 'section-general'
  | 'section-enrollment'
  | 'section-roles'
  | 'section-ai-tutor'
  | 'section-integration'
  | 'section-danger-zone';

interface TAItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  title: string;
  role: string;
  bgColor: string;
}

export function ClassSettingsTab({
  classInfo,
  onSaveClassInfo,
  onRegenerateCode,
  onOpenArchiveModal,
}: ClassSettingsTabProps) {
  // Navigation & Scroll-spy State
  const [activeSection, setActiveSection] = useState<SectionId>('section-general');
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form states: Section 1 (Thông tin chung)
  const [title, setTitle] = useState(
    classInfo.title || 'Công nghệ thông tin K22 – Nhóm 01'
  );
  const systemCode = classInfo.name || 'CNTT-K22-01';
  const [semester, setSemester] = useState(
    classInfo.semester || 'Học kỳ II • 2024 - 2025'
  );
  const [maxStudents, setMaxStudents] = useState<number>(classInfo.maxStudents || 60);
  const enrolledCount = classInfo.enrolledCount || 42;
  const [description, setDescription] = useState(
    classInfo.description ||
      'Lớp thực hành chuyên sâu Lập trình hướng đối tượng, Cấu trúc dữ liệu nâng cao và Kỹ thuật công nghệ phần mềm ứng dụng theo chuẩn đầu ra CDIO.'
  );

  // Form states: Section 2 (Mã lớp & Ghi danh)
  const [enrollmentKey, setEnrollmentKey] = useState(
    classInfo.enrollmentKey || 'MATKHAU123'
  );
  const [allowSelfEnrollment, setAllowSelfEnrollment] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [schoolDomainOnly, setSchoolDomainOnly] = useState(true);

  // Form states: Section 3 (Phân quyền GV & TA)
  const [assistants, setAssistants] = useState<TAItem[]>([
    {
      id: 'ta-1',
      name: 'ThS. Hoàng Thị Lan',
      email: 'hoanglan@edu.vn',
      initials: 'HL',
      title: 'Trợ giảng chính (Head TA)',
      role: 'Chấm bài & Duyệt SV',
      bgColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      id: 'ta-2',
      name: 'Trần Tiến Dũng (SV K21)',
      email: 'dungtt_k21@edu.vn',
      initials: 'TD',
      title: 'Trợ giảng thực hành (Lab TA)',
      role: 'Chỉ hỗ trợ Lab & Quiz',
      bgColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    },
  ]);
  const [newTaEmail, setNewTaEmail] = useState('');

  // Form states: Section 4 (AI Tutor)
  const [isAiTutorActive, setIsAiTutorActive] = useState(true);
  const [pedagogicalStance, setPedagogicalStance] = useState<'socratic' | 'direct'>('socratic');
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState(
    '35 lượt hỏi / ngày (Khuyến nghị ngành CNTT)'
  );
  const [groundingSource, setGroundingSource] = useState(
    `Chỉ Giáo trình & Slide bài giảng ${systemCode}`
  );

  // Interactive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }, []);

  // 1. AUTO-SCROLL INTERSECTION OBSERVER (Scroll-spy)
  useEffect(() => {
    const sectionIds: SectionId[] = [
      'section-general',
      'section-enrollment',
      'section-roles',
      'section-ai-tutor',
      'section-integration',
      'section-danger-zone',
    ];

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (isClickScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as SectionId);
        }
      });
    }, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // 2. SMOOTH SCROLL WITH HEADER OFFSET (88px)
  const scrollToTargetSection = (targetId: SectionId) => {
    setActiveSection(targetId);
    isClickScrollingRef.current = true;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 88; // 64px header + 24px padding
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    // Release scroll lock after animation
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 750);
  };

  // Actions
  const handleCopyCode = () => {
    navigator.clipboard.writeText(enrollmentKey).catch(() => {});
    showToast(`Đã sao chép mã ghi danh bí mật: ${enrollmentKey}`);
  };

  const handleRegenerateRandomCode = () => {
    const randomCode = 'SECURE_' + Math.floor(1000 + Math.random() * 9000);
    setEnrollmentKey(randomCode);
    onRegenerateCode();
    showToast(`Đã tạo mã ghi danh mới: ${randomCode}`);
  };

  const handleCopyDirectLink = () => {
    const link = `https://ilms.edu.vn/join/${systemCode}?key=${enrollmentKey}`;
    navigator.clipboard.writeText(link).catch(() => {});
    showToast(`Đã sao chép liên kết mời trực tiếp: ${link}`);
  };

  const handleAddAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaEmail.trim()) return;

    if (!newTaEmail.endsWith('@edu.vn') && !newTaEmail.includes('@')) {
      showToast('Vui lòng nhập định dạng email trường (@edu.vn)');
      return;
    }

    const emailPrefix = newTaEmail.split('@')[0];
    const newTA: TAItem = {
      id: `ta-${Date.now()}`,
      name: emailPrefix.toUpperCase(),
      email: newTaEmail.trim(),
      initials: emailPrefix.slice(0, 2).toUpperCase(),
      title: 'Trợ giảng bộ môn (TA)',
      role: 'Chấm bài & Duyệt SV',
      bgColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    };

    setAssistants((prev) => [...prev, newTA]);
    setNewTaEmail('');
    showToast(`Đã thêm phân quyền cho trợ giảng: ${newTA.email}`);
  };

  const handleRemoveAssistant = (id: string, name: string) => {
    setAssistants((prev) => prev.filter((a) => a.id !== id));
    showToast(`Đã xóa quyền trợ giảng của ${name}`);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassInfo({ title, description });
    showToast(`Cấu hình lớp ${systemCode} đã được cập nhật thành công trên máy chủ!`);
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* SUB-NAVIGATION NHÓM CÀI ĐẶT (LEFT COLUMN: 4 COLS)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20 z-20">
          {/* Settings Nav Box */}
          <div
            id="settings-nav"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1"
          >
            <div className="px-2 py-1 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Danh mục thiết lập
              </span>
            </div>

            {/* 1. Thông tin chung */}
            <button
              type="button"
              id="nav-section-general"
              data-target="section-general"
              onClick={() => scrollToTargetSection('section-general')}
              className={`nav-setting-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                activeSection === 'section-general'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">info</span>
              <div className="flex-1 truncate">
                <span>1. Thông tin chung &amp; Nhận diện</span>
              </div>
              <span className="material-symbols-outlined text-[16px] opacity-80">
                chevron_right
              </span>
            </button>

            {/* 2. Mã lớp & Ghi danh */}
            <button
              type="button"
              id="nav-section-enrollment"
              data-target="section-enrollment"
              onClick={() => scrollToTargetSection('section-enrollment')}
              className={`nav-setting-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                activeSection === 'section-enrollment'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">vpn_key</span>
              <div className="flex-1 truncate">
                <span>2. Mã lớp &amp; Cơ chế Ghi danh</span>
              </div>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                  activeSection === 'section-enrollment'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                }`}
              >
                Active
              </span>
            </button>

            {/* 3. Phân quyền GV & TA */}
            <button
              type="button"
              id="nav-section-roles"
              data-target="section-roles"
              onClick={() => scrollToTargetSection('section-roles')}
              className={`nav-setting-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                activeSection === 'section-roles'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
              <div className="flex-1 truncate">
                <span>3. Phân quyền GV &amp; Trợ giảng (TA)</span>
              </div>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                  activeSection === 'section-roles'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {assistants.length} TA
              </span>
            </button>

            {/* 4. Cấu hình AI Tutor */}
            <button
              type="button"
              id="nav-section-ai-tutor"
              data-target="section-ai-tutor"
              onClick={() => scrollToTargetSection('section-ai-tutor')}
              className={`nav-setting-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                activeSection === 'section-ai-tutor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <div className="flex-1 truncate">
                <span>4. Cấu hình AI Tutor &amp; Tri thức</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  activeSection === 'section-ai-tutor' ? 'bg-white' : 'bg-blue-500'
                }`}
              />
            </button>

            {/* 5. Tích hợp LMS */}
            <button
              type="button"
              id="nav-section-integration"
              data-target="section-integration"
              onClick={() => scrollToTargetSection('section-integration')}
              className={`nav-setting-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                activeSection === 'section-integration'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
              <div className="flex-1 truncate">
                <span>5. Tích hợp &amp; Xuất dữ liệu LMS</span>
              </div>
              <span
                className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  activeSection === 'section-integration'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                LTI 1.3
              </span>
            </button>

            {/* 6. Vùng nguy hiểm */}
            <div className="my-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                id="nav-section-danger-zone"
                data-target="section-danger-zone"
                onClick={() => scrollToTargetSection('section-danger-zone')}
                className={`nav-setting-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                  activeSection === 'section-danger-zone'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <div className="flex-1 truncate">
                  <span>6. Vùng nguy hiểm (Lưu trữ / Xóa)</span>
                </div>
              </button>
            </div>
          </div>

          {/* WIDGET TRẠNG THÁI HỆ THỐNG VÀ ĐỒNG BỘ */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Đồng bộ Cloud ILMS
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Real-time
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-200">
                <span>Bộ nhớ lớp học:</span>
                <span className="font-semibold">3.8 GB / 10 GB</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Tất cả tài liệu giảng dạy, bài nộp, mô hình đồ thị tri thức và logs AI được sao lưu tự động mỗi ngày lúc 00:00.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KHU VỰC FORM THIẾT LẬP CHI TIẾT (RIGHT COLUMN: 8 COLS)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 flex flex-col gap-6 pb-24">
          <form onSubmit={handleSaveAll} className="flex flex-col gap-6">
            {/* ---------------------------------------------------- */}
            {/* PHẦN 1: THÔNG TIN LỚP HỌC & NHẬN DIỆN                */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-general"
              className="content-section rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
                    <span className="material-symbols-outlined text-[22px]">badge</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Phần 1: Thông tin chung &amp; Nhận diện lớp
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cập nhật thông số pháp quy của lớp học trên hệ thống đào tạo
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  Section 01
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên lớp học */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    Tên lớp học chính thức
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all shadow-inner"
                  />
                  <span className="text-[11px] text-slate-400">
                    Hiển thị trong bảng điểm sinh viên và chứng chỉ kỹ năng đồ thị.
                  </span>
                </div>

                {/* Mã định danh lớp */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    Mã định danh lớp (System Code)
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={systemCode}
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300 cursor-not-allowed border border-slate-200 dark:border-slate-700 outline-none select-all font-semibold"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-[18px] text-slate-400">
                      lock
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Mã hệ thống tự sinh từ Phòng Đào tạo, không thể sửa đổi trực tiếp.
                  </span>
                </div>

                {/* Khóa học / Niên khóa */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Niên khóa • Học kỳ
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                  >
                    <option value="Học kỳ II • 2024 - 2025">Học kỳ II • 2024 - 2025</option>
                    <option value="Học kỳ I • 2024 - 2025">Học kỳ I • 2024 - 2025</option>
                    <option value="Học kỳ Hè • 2024 - 2025">Học kỳ Hè • 2024 - 2025</option>
                  </select>
                  <span className="text-[11px] text-slate-400">
                    Thời gian tính hạn nộp đồ án và quyền truy cập phòng lab.
                  </span>
                </div>

                {/* Sĩ số tối đa */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Sĩ số tối đa (Giới hạn ghi danh)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={150}
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">sinh viên</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Hiện có <strong className="text-slate-700 dark:text-slate-200">{enrolledCount}</strong> sinh viên đã ghi danh thành công.
                  </span>
                </div>

                {/* Trạng thái lớp học */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Trạng thái vận hành
                  </label>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      Đang giảng dạy tích cực
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Cho phép sinh viên nộp bài và tương tác AI Tutor bình thường.
                  </span>
                </div>

                {/* Mô tả lớp học */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Mô tả lớp học &amp; Đề cương mục tiêu
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* PHẦN 2: CÀI ĐẶT MÃ THAM GIA & BẢO MẬT (ENROLLMENT)    */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-enrollment"
              className="content-section rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
                    <span className="material-symbols-outlined text-[22px]">lock_open</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Phần 2: Mã lớp &amp; Cơ chế ghi danh (Enrollment)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kiểm soát điều kiện và phương thức sinh viên đăng ký vào không gian lớp
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  Section 02
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Mã ghi danh hiện tại */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Mã Ghi Danh Bí Mật (Enrollment Secret Key)
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        id="enrollment-key-text"
                        className="font-mono text-xl text-blue-600 dark:text-blue-400 font-extrabold tracking-wider"
                      >
                        {enrollmentKey}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium">
                        Hoạt động
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sinh viên cần nhập mã này khi lần đầu truy cập lớp từ dashboard chính.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        <span>Sao chép mã</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateRandomCode}
                        title="Tạo mã ngẫu nhiên mới"
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">autorenew</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDirectLink}
                      className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      <span>Copy Link mời trực tiếp</span>
                    </button>
                  </div>
                </div>

                {/* Các tuỳ chọn bảo mật (Toggles) */}
                <div className="flex flex-col gap-2 pt-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Toggle 1 */}
                  <label className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Cho phép học viên tự đăng ký qua link mời
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Người dùng có tài khoản trường khi nhấp vào link kèm mã sẽ được tự động đưa vào danh sách lớp mà không cần nhập mã thủ công.
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={allowSelfEnrollment}
                        onChange={(e) => setAllowSelfEnrollment(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>

                  {/* Toggle 2 */}
                  <label className="flex items-start justify-between gap-4 p-2 pt-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Yêu cầu Giảng viên / TA phê duyệt trước khi sinh viên vào lớp
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Sinh viên nhập đúng mã sẽ chuyển vào hàng đợi phê duyệt (Waiting Queue), tránh tài khoản ngoài danh sách chính thức.
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={requireApproval}
                        onChange={(e) => setRequireApproval(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>

                  {/* Toggle 3 */}
                  <label className="flex items-start justify-between gap-4 p-2 pt-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Chỉ cho phép tài khoản Email trường Đại học (@edu.vn)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ngăn chặn việc sinh viên sử dụng tài khoản cá nhân Gmail, Outlook đăng ký lớp.
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={schoolDomainOnly}
                        onChange={(e) => setSchoolDomainOnly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* PHẦN 3: PHÂN QUYỀN GV & TRỢ GIẢNG (ROLES & PERMS)    */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-roles"
              className="content-section rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
                    <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Phần 3: Phân quyền Giảng viên &amp; Trợ giảng (TA)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Quản lý đội ngũ giảng dạy, trợ giảng hỗ trợ chấm bài và duyệt quyền hạn
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  Section 03
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Danh sách người phụ trách */}
                <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {/* GV Chủ nhiệm */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-850">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
                        AN
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            TS. Nguyễn Văn An
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold">
                            Chủ nhiệm lớp
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          nguyenvanan@edu.vn • Toàn quyền quản trị
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 self-start sm:self-auto font-semibold">
                      Owner (Mặc định)
                    </span>
                  </div>

                  {/* Trợ giảng Dynamic List */}
                  {assistants.map((ta) => (
                    <div
                      key={ta.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${ta.bgColor}`}
                        >
                          {ta.initials}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {ta.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-medium border border-blue-200/50 dark:border-blue-800/50">
                              {ta.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {ta.email} • {ta.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <select
                          value={ta.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            setAssistants((prev) =>
                              prev.map((item) =>
                                item.id === ta.id ? { ...item, role: newRole } : item
                              )
                            );
                            showToast(`Đã cập nhật quyền của ${ta.name}: ${newRole}`);
                          }}
                          className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 outline-none border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <option value="Chấm bài & Duyệt SV">Chấm bài &amp; Duyệt SV</option>
                          <option value="Chỉ xem điểm & SV">Chỉ xem điểm &amp; SV</option>
                          <option value="Chỉ hỗ trợ Lab & Quiz">Chỉ hỗ trợ Lab &amp; Quiz</option>
                          <option value="Toàn quyền TA">Toàn quyền TA</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssistant(ta.id, ta.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Xóa quyền"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thêm trợ giảng mới */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                      person_add
                    </span>
                    <input
                      type="email"
                      value={newTaEmail}
                      onChange={(e) => setNewTaEmail(e.target.value)}
                      placeholder="Nhập email giảng viên hoặc trợ giảng mới (@edu.vn)..."
                      className="w-full bg-slate-50 dark:bg-slate-800 pl-9 pr-3.5 py-2 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAssistant}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Thêm phân quyền</span>
                  </button>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* PHẦN 4: CẤU HÌNH TRỢ GIẢNG AI SOCRATIC & TRI THỨC   */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-ai-tutor"
              className="content-section rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                    <span className="material-symbols-outlined text-[22px]">neurology</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Phần 4: Cấu hình Trợ giảng AI Tutor &amp; Tri thức
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Kiểm soát trí tuệ nhân tạo giải đáp, phương pháp sư phạm gợi mở và giới hạn token
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold">
                  AI Tutor Engine v4.2
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Toggle AI Tutor Active */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-transparent dark:from-blue-950/30 dark:via-slate-850 dark:to-transparent border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[26px]">
                      smart_toy
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Kích hoạt AI Tutor 24/7 cho sinh viên
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        AI hỗ trợ sinh viên gỡ lỗi code bài tập thực hành và diễn giải thuật toán đồ thị
                      </span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isAiTutorActive}
                      onChange={(e) => setIsAiTutorActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </div>
                </div>

                {/* Chế độ sư phạm Socratic (Radio Selectors) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Phương pháp phản hồi sư phạm (Pedagogical Stance)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Socratic Card (Selected) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPedagogicalStance('socratic')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setPedagogicalStance('socratic');
                      }}
                      className={`p-4 rounded-lg flex flex-col gap-1.5 cursor-pointer transition-all ${
                        pedagogicalStance === 'socratic'
                          ? 'bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600 border border-transparent'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-600 text-[18px]">
                            psychology_alt
                          </span>
                          <span>Gợi ý tư duy Socratic (Khuyên dùng)</span>
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            pedagogicalStance === 'socratic'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {pedagogicalStance === 'socratic' && (
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        AI tuyệt đối không đưa code giải đáp trực tiếp. Thay vào đó, đặt các câu hỏi dẫn dắt từng bước để sinh viên tự tìm ra lỗ hổng tư duy và logic.
                      </p>
                    </div>

                    {/* Direct Solution Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPedagogicalStance('direct')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setPedagogicalStance('direct');
                      }}
                      className={`p-4 rounded-lg flex flex-col gap-1.5 cursor-pointer transition-all ${
                        pedagogicalStance === 'direct'
                          ? 'bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600 border border-transparent'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-slate-500 text-[18px]">
                            terminal
                          </span>
                          <span>Hỗ trợ sửa lỗi trực diện (Direct Fix)</span>
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            pedagogicalStance === 'direct'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {pedagogicalStance === 'direct' && (
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        AI chỉ rõ dòng lỗi cú pháp và gợi ý đoạn snippet giải quyết ngay. Phù hợp cho giai đoạn ôn tập cuối kỳ hoặc chuẩn bị đồ án gấp.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tinh chỉnh Giới hạn câu hỏi & Tần suất tương tác */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Giới hạn lượt hỏi AI mỗi ngày / Sinh viên
                    </label>
                    <select
                      value={dailyQuestionLimit}
                      onChange={(e) => setDailyQuestionLimit(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                    >
                      <option value="20 lượt hỏi / ngày (Tiêu chuẩn)">20 lượt hỏi / ngày (Tiêu chuẩn)</option>
                      <option value="35 lượt hỏi / ngày (Khuyến nghị ngành CNTT)">35 lượt hỏi / ngày (Khuyến nghị ngành CNTT)</option>
                      <option value="50 lượt hỏi / ngày (Mở rộng cho kỳ Đồ án)">50 lượt hỏi / ngày (Mở rộng cho kỳ Đồ án)</option>
                      <option value="Không giới hạn (Theo quota trường cấp)">Không giới hạn (Theo quota trường cấp)</option>
                    </select>
                    <span className="text-[11px] text-slate-400">
                      Giúp sinh viên tập trung tự nghiên cứu thay vì phụ thuộc quá mức vào AI.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Nguồn tri thức tham chiếu (Grounding)
                    </label>
                    <select
                      value={groundingSource}
                      onChange={(e) => setGroundingSource(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
                    >
                      <option value={`Chỉ Giáo trình & Slide bài giảng ${systemCode}`}>
                        Chỉ Giáo trình &amp; Slide bài giảng {systemCode}
                      </option>
                      <option value="Giáo trình lớp + Kho tài liệu mở IEEE / ACM">
                        Giáo trình lớp + Kho tài liệu mở IEEE / ACM
                      </option>
                      <option value="Toàn bộ kiến thức kỹ thuật trên Internet">
                        Toàn bộ kiến thức kỹ thuật trên Internet
                      </option>
                    </select>
                    <span className="text-[11px] text-slate-400">
                      Đảm bảo câu trả lời luôn bám sát chuẩn đầu ra của học phần.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* PHẦN 5: TÍCH HỢP & XUẤT DỮ LIỆU LMS                 */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-integration"
              className="content-section rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
                    <span className="material-symbols-outlined text-[22px]">sync_alt</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Phần 5: Tích hợp &amp; Xuất dữ liệu LMS
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Liên kết chuẩn LTI Advantage, đồng bộ Canvas/Moodle và xuất báo cáo chuẩn PLO
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  Section 05
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Danh sách tích hợp LMS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Moodle */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                          M
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Moodle LMS Trường ĐH
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Đồng bộ tự động danh sách &amp; điểm
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                        Đã kết nối
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Lần sync cuối: 10 phút trước</span>
                      <button
                        type="button"
                        onClick={() => showToast('Đang tiến hành đồng bộ hai chiều với Moodle LMS...')}
                        className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">sync</span>
                        <span>Đồng bộ ngay</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Canvas */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                          C
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Canvas LMS / Blackboard
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            LTI 1.3 Advantage Protocol
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px]">
                        Chưa bật
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Cần LTI Client ID &amp; Secret</span>
                      <button
                        type="button"
                        onClick={() => showToast('Mở khung thiết lập LTI 1.3 Client Credentials')}
                        className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        <span>Thiết lập LTI</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Xuất báo cáo dữ liệu */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-[20px]">
                        download
                      </span>
                      <span>Xuất trọn gói dữ liệu học tập (Full Audit Package)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Bao gồm bảng điểm chi tiết, log tương tác đồ thị tri thức, và báo cáo mức độ đạt PLO theo định dạng CSV / Excel / JSON.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => showToast(`Đang trích xuất dữ liệu lớp ${systemCode} định dạng Excel (.xlsx)...`)}
                      className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">
                        table_view
                      </span>
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Đang xuất JSON đồ thị tri thức & điểm PLO...')}
                      className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-amber-600">
                        data_object
                      </span>
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* PHẦN 6: VÙNG NGUY HIỂM (DANGER ZONE)                 */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-danger-zone"
              className="content-section rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 p-6 shadow-sm flex flex-col gap-4 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center gap-3 pb-2 border-b border-rose-200/60 dark:border-rose-900/40">
                <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-rose-700 dark:text-rose-400">
                    Phần 6: Vùng nguy hiểm (Danger Zone)
                  </h2>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                    Các hành động ảnh hưởng nghiêm trọng đến dữ liệu học tập và hồ sơ sinh viên
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Action 1: Lưu trữ lớp học */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Lưu trữ lớp học này vào kho lưu trữ (Archive)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lớp chuyển sang chế độ Chỉ đọc (Read-only). Sinh viên vẫn xem được tài liệu và điểm nhưng không thể nộp bài hoặc chat AI.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenArchiveModal}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors self-start sm:self-auto shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    Lưu trữ lớp học
                  </button>
                </div>

                {/* Action 2: Xóa vĩnh viễn */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      <span>Xóa vĩnh viễn lớp học {systemCode}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Toàn bộ đồ thị tri thức, bài nộp, điểm số và phiên tương tác AI sẽ bị xóa vĩnh viễn khỏi máy chủ. Hành động này không thể hoàn tác.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const confirmation = window.prompt(
                        `Hành động này không thể đảo ngược! Vui lòng nhập đúng cụm từ: ${systemCode} để xác nhận xóa:`
                      );
                      if (confirmation === systemCode) {
                        showToast('Đã gửi yêu cầu xóa lớp lên Hội đồng Đào tạo.');
                      } else if (confirmation !== null) {
                        showToast('Mã xác nhận không khớp.');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap transition-colors self-start sm:self-auto shrink-0 cursor-pointer shadow-sm"
                  >
                    Xóa vĩnh viễn lớp
                  </button>
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* THANH NÚT LƯU CỐ ĐỊNH (STICKY BOTTOM ACTION BAR)     */}
            {/* ---------------------------------------------------- */}
            <div className="p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-medium">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                  check_circle
                </span>
                <span className="hidden sm:inline">
                  Thay đổi chưa lưu sẽ tự động ghi nhớ dạng nháp trên máy này
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Hủy thay đổi
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>Lưu cấu hình lớp học</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
