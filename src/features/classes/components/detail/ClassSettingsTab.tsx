'use client';

import React, { useState, useCallback } from 'react';
import type { ClassItem } from '../../schemas/class.schema';

interface ClassSettingsTabProps {
  classInfo: ClassItem;
  onSaveClassInfo: (updates: { title: string; description: string }) => void;
  onRegenerateCode: () => void;
  onOpenArchiveModal: () => void;
}

type SettingsSection = 'general' | 'enrollment' | 'roles' | 'ai' | 'lms' | 'danger';

export function ClassSettingsTab({
  classInfo,
  onSaveClassInfo,
  onRegenerateCode,
  onOpenArchiveModal,
}: ClassSettingsTabProps) {
  // Navigation section
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  // Form states: Section 1 (Thông tin chung)
  const [title, setTitle] = useState(classInfo.title || 'Cơ sở dữ liệu — Nhóm 01');
  const [semester, setSemester] = useState(classInfo.semester || 'Học kỳ 1 • 2024-2025');
  const [maxStudents, setMaxStudents] = useState<number>(classInfo.maxStudents || 60);
  const [operationStatus, setOperationStatus] = useState<'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ACTIVE');
  const [description, setDescription] = useState(
    classInfo.description ||
      'Môn học cung cấp nền tảng lý thuyết và thực hành thiết kế cơ sở dữ liệu quan hệ, ngôn ngữ truy vấn SQL nâng cao và tối ưu hóa câu truy vấn cho ứng dụng doanh nghiệp.'
  );

  // Form states: Section 2 (Mã lớp & Ghi danh)
  const [enrollmentKey, setEnrollmentKey] = useState(classInfo.enrollmentKey || 'MATKHAU123');
  const [allowSelfEnrollment, setAllowSelfEnrollment] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [schoolDomainOnly, setSchoolDomainOnly] = useState(true);

  // Form states: Section 3 (AI Tutor)
  const [isAiTutorActive, setIsAiTutorActive] = useState(true);
  const [pedagogicalStance, setPedagogicalStance] = useState<'socratic' | 'direct'>('socratic');
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState(35);
  const [groundingSource, setGroundingSource] = useState('all-materials');

  // Interactive feedback
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [localToast, setLocalToast] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 3000);
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(enrollmentKey).catch(() => {});
    setIsCopiedKey(true);
    showNotification(`Đã sao chép mã bảo mật: ${enrollmentKey}`);
    setTimeout(() => setIsCopiedKey(false), 2200);
  };

  const handleCopyLink = () => {
    const inviteUrl = `https://ilms.edu.vn/join/${classInfo.name || 'CNTT-K22-01'}?key=${enrollmentKey}`;
    navigator.clipboard.writeText(inviteUrl).catch(() => {});
    setIsCopiedLink(true);
    showNotification('Đã sao chép liên kết mời trực tiếp vào bộ nhớ tạm!');
    setTimeout(() => setIsCopiedLink(false), 2200);
  };

  const handleRegenerateKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newKey = '';
    for (let i = 0; i < 8; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEnrollmentKey(newKey);
    onRegenerateCode();
    showNotification(`Đã cấp mã bảo vệ mới: ${newKey}`);
  };

  const handleResetForm = () => {
    setTitle(classInfo.title || 'Cơ sở dữ liệu — Nhóm 01');
    setDescription(classInfo.description || '');
    setMaxStudents(classInfo.maxStudents || 60);
    showNotification('Đã khôi phục cài đặt gốc của lớp!');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassInfo({ title, description });
    showNotification(`Đã lưu toàn bộ cấu hình lớp ${classInfo.name || 'CNTT-K22-01'} thành công!`);
  };

  const scrollToSection = (sectionId: SettingsSection) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Toast popup */}
      {localToast && (
        <div className="fixed bottom-24 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400 dark:text-emerald-600">
            check_circle
          </span>
          <span>{localToast}</span>
        </div>
      )}

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Sub-navigation & System Status (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                {classInfo.name || 'CNTT-K22-01'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hoạt động</span>
              </span>
            </div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white pt-1">
              Cài đặt &amp; Quản trị lớp
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tùy chỉnh thông tin định danh, cơ chế ghi danh sinh viên, trợ giảng AI và quản trị dữ liệu.
            </p>
          </div>

          {/* Sub-nav Menu */}
          <nav
            aria-label="Cài đặt lớp học"
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs p-2 space-y-1"
          >
            {[
              { id: 'general', label: '1. Thông tin chung & Nhận diện', icon: 'badge' },
              { id: 'enrollment', label: '2. Mã lớp & Cơ chế Ghi danh', icon: 'vpn_key' },
              { id: 'roles', label: '3. Phân quyền GV & Trợ giảng (TA)', icon: 'manage_accounts' },
              { id: 'ai', label: '4. Cấu hình AI Tutor & Tri thức', icon: 'smart_toy' },
              { id: 'lms', label: '5. Tích hợp & Xuất dữ liệu LMS', icon: 'sync_alt' },
              { id: 'danger', label: '6. Vùng nguy hiểm (Lưu trữ / Xóa)', icon: 'warning', danger: true },
            ].map((nav) => {
              const isSelected = activeSection === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => scrollToSection(nav.id as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected
                      ? nav.danger
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-2xs'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                      : nav.danger
                      ? 'text-rose-600/90 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 ${
                      isSelected
                        ? nav.danger
                          ? 'text-rose-600'
                          : 'text-blue-600'
                        : nav.danger
                        ? 'text-rose-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {nav.icon}
                  </span>
                  <span className="truncate">{nav.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System & Cloud Sync Status Widget */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">cloud_sync</span>
                <span>Hệ thống &amp; Đồng bộ Cloud</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                24ms
              </span>
            </div>

            {/* Storage Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Dung lượng học liệu đã dùng</span>
                <strong className="text-slate-800 dark:text-slate-200 font-bold">3.8 GB / 10 GB</strong>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Đồng bộ máy chủ:</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Vừa xong (10:45)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Form Sections (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSaveAll} className="space-y-8">
            {/* SECTION 1: THÔNG TIN CHUNG & NHẬN DIỆN */}
            <section
              id="section-general"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">badge</span>
                    <span>1. Thông tin chung &amp; Nhận diện lớp</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tên hiển thị, định danh hệ thống, niên khóa và sức chứa học viên.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  ID: {classInfo.id || 'csdl-k22-01'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Tên lớp học chính thức */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tên lớp học chính thức <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-xs"
                    placeholder="Nhập tên lớp học chính thức..."
                  />
                </div>

                {/* Mã định danh hệ thống (Read-only lock) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Mã lớp hệ thống (System Code)
                    </label>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      Khóa bởi phòng Đào tạo
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={classInfo.name || 'CNTT-K22-01'}
                      readOnly
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-mono font-bold cursor-not-allowed text-xs"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                      lock
                    </span>
                  </div>
                </div>

                {/* Niên khóa & Học kỳ */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Niên khóa • Học kỳ
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer text-xs"
                  >
                    <option value="Học kỳ 1 • 2024-2025">Học kỳ 1 • 2024-2025</option>
                    <option value="Học kỳ 2 • 2023-2024">Học kỳ 2 • 2023-2024</option>
                    <option value="Học kỳ Hè • 2024">Học kỳ Hè • 2024</option>
                  </select>
                </div>

                {/* Sĩ số tối đa */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Sĩ số tối đa (Max Students)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value))}
                      className="w-full pl-3.5 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-medium pointer-events-none">
                      học viên
                    </span>
                  </div>
                </div>

                {/* Trạng thái vận hành */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái vận hành
                  </label>
                  <select
                    value={operationStatus}
                    onChange={(e) => setOperationStatus(e.target.value as 'ACTIVE' | 'PAUSED' | 'COMPLETED')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer text-xs"
                  >
                    <option value="ACTIVE">Đang diễn ra (Hoạt động bình thường)</option>
                    <option value="PAUSED">Tạm ngưng nhận sinh viên mới</option>
                    <option value="COMPLETED">Đã kết thúc môn học</option>
                  </select>
                </div>

                {/* Mô tả & Đề cương tóm tắt */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Mô tả lớp học &amp; Đề cương tóm tắt
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-xs leading-relaxed resize-none"
                    placeholder="Mô tả tóm tắt mục tiêu, chuẩn đầu ra và nội dung lớp học..."
                  />
                </div>
              </div>
            </section>

            {/* SECTION 2: MÃ LỚP & CƠ CHẾ GHI DANH */}
            <section
              id="section-enrollment"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">vpn_key</span>
                    <span>2. Mã lớp &amp; Cơ chế Ghi danh</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Quản lý mật khẩu ghi danh, đường link mời và các chính sách kiểm duyệt đầu vào.
                  </p>
                </div>
              </div>

              {/* Secret Key Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50/70 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mã bảo mật ghi danh (Enrollment Secret Key)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Chia sẻ mã này cho sinh viên để vào lớp
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 shadow-2xs">
                    <span className="font-mono text-base font-extrabold tracking-widest text-blue-700 dark:text-blue-300 select-all">
                      {enrollmentKey}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      {isCopiedKey ? 'check' : 'content_copy'}
                    </span>
                    <span>{isCopiedKey ? 'Đã sao chép' : 'Sao chép mã'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-600">refresh</span>
                    <span>Tạo mã mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer ml-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">link</span>
                    <span>{isCopiedLink ? 'Đã sao chép link' : 'Sao chép link mời trực tiếp'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Toggle Policies */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
                {/* Policy 1 */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-slate-900 dark:text-white text-xs">
                      Tự đăng ký qua link mời (Self-enrollment via invite link)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sinh viên có link mời hoặc mã lớp có thể trực tiếp ghi danh vào không gian học tập.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={allowSelfEnrollment}
                      onChange={(e) => setAllowSelfEnrollment(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Policy 2 */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-slate-900 dark:text-white text-xs">
                      Yêu cầu Giảng viên phê duyệt trước khi vào lớp
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sau khi nhập mã, sinh viên sẽ vào danh sách &quot;Chờ duyệt&quot;. Bạn có thể duyệt từng sinh viên hoặc duyệt hàng loạt.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Policy 3 */}
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-slate-900 dark:text-white text-xs">
                      Chỉ cho phép tài khoản Email trường đại học (@edu.vn)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tự động từ chối tài khoản cá nhân như gmail.com, yahoo.com để bảo mật tài liệu giảng dạy.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={schoolDomainOnly}
                      onChange={(e) => setSchoolDomainOnly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              </div>
            </section>

            {/* SECTION 3: PHÂN QUYỀN GV & TRỢ GIẢNG (TA) */}
            <section
              id="section-roles"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">manage_accounts</span>
                    <span>3. Phân quyền GV &amp; Trợ giảng (TA)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Danh sách cán bộ giảng dạy có quyền quản trị, tải học liệu và chấm bài tập.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showNotification('Mở hộp thoại mời thêm Cán bộ / Trợ giảng TA')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Thêm cán bộ / TA</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'TS. Lê Hoàng Nam',
                    email: 'nam.lh@university.edu.vn',
                    role: 'Chủ nhiệm môn (Owner)',
                    badge: 'Toàn quyền',
                    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
                    isCurrent: true,
                  },
                  {
                    name: 'ThS. Trần Phương Thảo',
                    email: 'thao.tp@university.edu.vn',
                    role: 'Trợ giảng bộ môn (TA)',
                    badge: 'Chấm bài & Hỗ trợ',
                    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
                    isCurrent: false,
                  },
                ].map((inst) => (
                  <div
                    key={inst.email}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {inst.name.split(' ').pop()?.slice(0, 2).toUpperCase() || 'GV'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-white font-bold">{inst.name}</strong>
                          {inst.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">{inst.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${inst.badgeClass}`}>
                        {inst.role}
                      </span>
                      {!inst.isCurrent && (
                        <button
                          type="button"
                          onClick={() => showNotification(`Đã thu hồi quyền trợ giảng của ${inst.name}`)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Gỡ quyền"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4: CẤU HÌNH AI TUTOR & TRI THỨC */}
            <section
              id="section-ai"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 text-[20px]">smart_toy</span>
                    <span>4. Cấu hình Trợ giảng AI Socratic cho lớp</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hành vi sư phạm, định mức hỏi đáp và nguồn tri thức tham chiếu (Grounding) của AI Tutor v4.2.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                  AI Engine v4.2
                </span>
              </div>

              {/* Master AI Toggle */}
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/60 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h5 className="font-semibold text-purple-900 dark:text-purple-200 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span>Kích hoạt AI Tutor 24/7 cho toàn bộ sinh viên lớp này</span>
                  </h5>
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80">
                    Cho phép sinh viên đặt câu hỏi, nhận gợi ý gỡ rối thuật toán và tạo bộ câu hỏi trắc nghiệm ôn tập.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isAiTutorActive}
                    onChange={(e) => setIsAiTutorActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>

              {/* Pedagogical Stance (2 Radio Cards) */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                  Phương pháp sư phạm định hướng (Pedagogical Stance)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Socratic */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPedagogicalStance('socratic')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setPedagogicalStance('socratic');
                    }}
                    className={`p-4 rounded-xl border transition-all text-xs cursor-pointer ${
                      pedagogicalStance === 'socratic'
                        ? 'border-2 border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 ring-1 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-purple-600 text-[18px]">school</span>
                        <span>Phương pháp Socratic (Khuyến nghị)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        Chuẩn ĐH
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      AI không giải bài hộ hay xuất mã nguồn trực tiếp; thay vào đó sẽ đặt câu hỏi gợi mở, gợi ý khái niệm để sinh viên tự suy luận.
                    </p>
                  </div>

                  {/* Option 2: Direct Fix */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPedagogicalStance('direct')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setPedagogicalStance('direct');
                    }}
                    className={`p-4 rounded-xl border transition-all text-xs cursor-pointer ${
                      pedagogicalStance === 'direct'
                        ? 'border-2 border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 ring-1 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-purple-600 text-[18px]">build</span>
                        <span>Chỉ dẫn &amp; Sửa lỗi trực tiếp (Direct Fix)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        Lab Thực hành
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      AI hỗ trợ phân tích traceback lỗi, chỉ ra chính xác vị trí bug trong code và cung cấp đoạn snippet mẫu đã được tối ưu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Limit & Knowledge Grounding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Giới hạn lượt hỏi mỗi ngày (Daily Quota)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={dailyQuestionLimit}
                      onChange={(e) => setDailyQuestionLimit(Number(e.target.value))}
                      className="w-full pl-3.5 pr-28 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] pointer-events-none">
                      lượt / SV / ngày
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nguồn tri thức tham chiếu (Grounding Data)
                  </label>
                  <select
                    value={groundingSource}
                    onChange={(e) => setGroundingSource(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 cursor-pointer text-xs"
                  >
                    <option value="all-materials">Toàn bộ Giáo trình &amp; Slide bài giảng của lớp (Khuyến nghị)</option>
                    <option value="published-only">Chỉ các bài giảng và tài liệu đã duyệt công khai</option>
                    <option value="extended-cs">Bổ sung thêm thư viện Khoa học Máy tính chuẩn quốc tế</option>
                  </select>
                </div>
              </div>
            </section>

            {/* SECTION 5: TÍCH HỢP & XUẤT DỮ LIỆU LMS */}
            <section
              id="section-lms"
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">sync_alt</span>
                    <span>5. Tích hợp LMS &amp; Xuất dữ liệu</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Đồng bộ điểm danh, bảng điểm và học liệu với các nền tảng LMS trường học.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => showNotification('Đang chuẩn bị gói xuất bảng điểm Excel...')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 text-left space-y-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-[22px]">table_chart</span>
                  <h6 className="font-bold text-slate-900 dark:text-white">Xuất Bảng điểm &amp; PLO</h6>
                  <p className="text-[11px] text-slate-500">Tải tệp .xlsx chuẩn định dạng phòng Đào tạo.</p>
                </button>

                <button
                  type="button"
                  onClick={() => showNotification('Đang kết nối cổng Moodle LMS trường...')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 text-left space-y-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">sync</span>
                  <h6 className="font-bold text-slate-900 dark:text-white">Đồng bộ Moodle LMS</h6>
                  <p className="text-[11px] text-slate-500">Đẩy danh sách điểm và bài nộp sang Moodle.</p>
                </button>

                <button
                  type="button"
                  onClick={() => showNotification('Đang đóng gói dữ liệu lớp học định dạng SCORM/Zip...')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 text-left space-y-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-amber-600 text-[22px]">folder_zip</span>
                  <h6 className="font-bold text-slate-900 dark:text-white">Sao lưu toàn bộ kho lớp</h6>
                  <p className="text-[11px] text-slate-500">Tải gói bài giảng, đề thi và đồ thị tri thức.</p>
                </button>
              </div>
            </section>

            {/* SECTION 6: VÙNG NGUY HIỂM (DANGER ZONE) */}
            <section
              id="section-danger"
              className="p-6 rounded-2xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/60 dark:border-rose-900/60">
                <div>
                  <h3 className="font-display font-bold text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span>6. Vùng nguy hiểm (Danger Zone)</span>
                  </h3>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                    Các tác vụ này ảnh hưởng vĩnh viễn đến quyền truy cập của toàn bộ sinh viên trong lớp.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Danger 1: Archive */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                      Lưu trữ lớp học vào kho lưu trữ (Archive Class)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl">
                      Lớp học sẽ chuyển sang trạng thái <strong>Chỉ đọc (Read-only)</strong>. Sinh viên vẫn xem được học liệu nhưng không thể nộp bài mới hoặc gửi thảo luận.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenArchiveModal}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Lưu trữ lớp học
                  </button>
                </div>

                {/* Danger 2: Delete */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                      Xóa vĩnh viễn không gian lớp học này
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl">
                      Toàn bộ dữ liệu điểm số, lịch sử hỏi đáp AI và bài nộp sinh viên sẽ bị hủy bỏ hoàn toàn khỏi máy chủ ILMS. Hành động này không thể hoàn tác.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn lớp học ${classInfo.name || ''}? Hành động này KHÔNG thể hoàn tác!`)) {
                        showNotification('Yêu cầu xóa lớp đã được gửi đến ban quản trị hệ thống!');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Xóa vĩnh viễn
                  </button>
                </div>
              </div>
            </section>

            {/* STICKY BOTTOM ACTION BAR (Matches User Template) */}
            <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                  check_circle
                </span>
                <span>Thay đổi chưa lưu sẽ tự động ghi nhớ dạng nháp trên máy này</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy thay đổi
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
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
