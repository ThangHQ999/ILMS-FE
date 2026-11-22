'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CustomSelect } from '@/components/shared';
import { uploadImage } from '@/lib/upload';
import { toast } from '@/components/ui/sonner';
import type { ClassItem } from '../../schemas/class.schema';
import type { ClassMember } from '../../schemas/class-detail.schema';
import { PermanentDeleteClassModal } from './PermanentDeleteClassModal';

interface ClassSettingsTabProps {
  classInfo: ClassItem;
  members?: ClassMember[];
  onSaveClassInfo: (updates: {
    title: string;
    description: string;
    maxCapacity?: number;
    backgroundUrl?: string;
    thumbnailUrl?: string;
  }) => void;
  onRegenerateCode: () => void;
  onOpenArchiveModal: () => void;
  onDeleteSuccess?: () => void;
  onInviteTeacher?: (email: string) => void;
  onUpdateMemberRole?: (userId: string, role: 'TEACHER' | 'STUDENT') => void;
  onRemoveMember?: (userId: string, name: string) => void;
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
  members = [],
  onSaveClassInfo,
  onRegenerateCode,
  onOpenArchiveModal,
  onDeleteSuccess,
  onInviteTeacher,
  onUpdateMemberRole,
  onRemoveMember,
}: ClassSettingsTabProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
  const enrolledCount = classInfo.enrolledCount ?? 0;
  const [description, setDescription] = useState(
    classInfo.description || ''
  );
  const [backgroundUrl, setBackgroundUrl] = useState(classInfo.backgroundUrl || '');
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [backgroundUploadError, setBackgroundUploadError] = useState<string | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(classInfo.title || classInfo.name || '');
    setMaxStudents(classInfo.maxStudents || 60);
    setDescription(classInfo.description || '');
    setBackgroundUrl(classInfo.backgroundUrl || '');
  }, [classInfo.id, classInfo.title, classInfo.name, classInfo.maxStudents, classInfo.description, classInfo.backgroundUrl]);

  // Form states: Section 2 (Mã lớp & Ghi danh)
  const [enrollmentKey, setEnrollmentKey] = useState(
    classInfo.enrollmentKey || 'MATKHAU123'
  );
  const [allowSelfEnrollment, setAllowSelfEnrollment] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [schoolDomainOnly, setSchoolDomainOnly] = useState(true);

  // Form states: Section 3 (Phân quyền GV từ API members)
  const ownerMember = members.find((m) => m.role === 'OWNER');
  const ownerName =
    ownerMember?.name || classInfo.instructor?.fullName || 'Chủ nhiệm lớp';
  const ownerEmail =
    ownerMember?.email || classInfo.instructor?.email || '';
  const ownerInitials =
    ownerName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'GV';
  const teacherMembers = members.filter((m) => m.role === 'TEACHER');
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
  const showToast = useCallback((msg: string) => {
    const isError =
      msg.toLowerCase().includes('lỗi') ||
      msg.toLowerCase().includes('không thể') ||
      msg.toLowerCase().includes('vui lòng') ||
      msg.toLowerCase().includes('thất bại');
    if (isError) {
      toast.error(msg);
    } else {
      toast.success(msg);
    }
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

  // 2. SMOOTH SCROLL HANDLER
  const scrollToTargetSection = (targetId: SectionId) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    isClickScrollingRef.current = true;
    setActiveSection(targetId);

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);
  };

  // 3. COPY ENROLLMENT CODE
  const handleCopyCode = () => {
    navigator.clipboard.writeText(enrollmentKey).catch(() => {});
    showToast(`Đã sao chép mã ghi danh "${enrollmentKey}" vào bộ nhớ tạm!`);
  };

  // 4. COPY DIRECT ENROLLMENT LINK
  const handleCopyDirectLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ilms.edu.vn';
    const link = `${origin}/classes/join?code=${encodeURIComponent(enrollmentKey)}`;
    navigator.clipboard.writeText(link).catch(() => {});
    showToast('Đã sao chép liên kết ghi danh trực tiếp!');
  };

  // 5. REGENERATE SECRET KEY
  const handleRegenerateRandomCode = () => {
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newCode = '';
    for (let i = 0; i < 8; i++) {
      newCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    setEnrollmentKey(newCode);
    onRegenerateCode();
    showToast(`Đã tạo mã lớp ngẫu nhiên mới: ${newCode}`);
  };

  // 6. INVITE CO-TEACHER BY EMAIL
  const handleAddAssistant = () => {
    const email = newTaEmail.trim();
    if (!email) {
      showToast('Vui lòng nhập địa chỉ email giảng viên!');
      return;
    }

    if (!email.includes('@')) {
      showToast('Email không đúng định dạng!');
      return;
    }

    if (onInviteTeacher) {
      onInviteTeacher(email);
    } else {
      showToast(`Đã gửi lời mời giảng viên đến ${email}!`);
    }
    setNewTaEmail('');
  };

  // 7. REMOVE TEACHER FROM CLASS
  const handleRemoveAssistant = (id: string, name: string) => {
    if (onRemoveMember) {
      onRemoveMember(id, name);
    } else {
      showToast(`Đã gỡ quyền giảng viên của ${name}!`);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBackgroundUploadError(null);
    setIsUploadingBackground(true);
    try {
      const uploaded = await uploadImage(file, 'ilms/classes');
      setBackgroundUrl(uploaded.url);
      showToast('Đã tải ảnh nền mới! Bấm "Lưu thay đổi" để áp dụng.');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Không thể tải ảnh nền lên lúc này.';
      setBackgroundUploadError(msg);
    } finally {
      setIsUploadingBackground(false);
    }
  };

  // 8. SAVE ALL SETTINGS
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingBackground) {
      showToast('Vui lòng chờ ảnh nền tải lên hoàn tất.');
      return;
    }
    onSaveClassInfo({
      title,
      description,
      maxCapacity: maxStudents,
      backgroundUrl: backgroundUrl || undefined,
      thumbnailUrl: backgroundUrl || undefined,
    });
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* SUB-NAVIGATION NHÓM CÀI ĐẶT (LEFT COLUMN: 4 COLS)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20 z-20">
          {/* Settings Nav Box */}
          <div
            id="settings-nav"
            className="p-5 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-1.5"
          >
            <div className="px-2 py-1 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8E918F]">
                Danh mục thiết lập
              </span>
            </div>

            {/* 1. Thông tin chung */}
            <button
              type="button"
              id="nav-section-general"
              data-target="section-general"
              onClick={() => scrollToTargetSection('section-general')}
              className={`nav-setting-item w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border-none ${
                activeSection === 'section-general'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'bg-transparent text-gray-600 dark:text-[#8E918F] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-[#E3E3E3]'
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
              className={`nav-setting-item w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border-none ${
                activeSection === 'section-enrollment'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'bg-transparent text-gray-600 dark:text-[#8E918F] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">vpn_key</span>
              <div className="flex-1 truncate">
                <span>2. Mã lớp &amp; Cơ chế Ghi danh</span>
              </div>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  activeSection === 'section-enrollment'
                    ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-[#E3E3E3]'
                    : 'bg-blue-100 dark:bg-[#162B4D] text-blue-700 dark:text-[#A8C7FA]'
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
              className={`nav-setting-item w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border-none ${
                activeSection === 'section-roles'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'bg-transparent text-gray-600 dark:text-[#8E918F] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
              <div className="flex-1 truncate">
                <span>3. Phân quyền GV &amp; Trợ giảng (TA)</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  activeSection === 'section-roles'
                    ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-[#E3E3E3]'
                    : 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-700 dark:text-[#C4C7C5]'
                }`}
              >
                {teacherMembers.length} GV
              </span>
            </button>

            {/* 4. Cấu hình AI Tutor */}
            <button
              type="button"
              id="nav-section-ai-tutor"
              data-target="section-ai-tutor"
              onClick={() => scrollToTargetSection('section-ai-tutor')}
              className={`nav-setting-item w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border-none ${
                activeSection === 'section-ai-tutor'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'bg-transparent text-gray-600 dark:text-[#8E918F] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <div className="flex-1 truncate">
                <span>4. Cấu hình AI Tutor &amp; Tri thức</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  activeSection === 'section-ai-tutor' ? 'bg-[#007BFF] dark:bg-[#A8C7FA]' : 'bg-gray-400'
                }`}
              />
            </button>

            {/* 5. Tích hợp LMS */}
            <button
              type="button"
              id="nav-section-integration"
              data-target="section-integration"
              onClick={() => scrollToTargetSection('section-integration')}
              className={`nav-setting-item w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border-none ${
                activeSection === 'section-integration'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                  : 'bg-transparent text-gray-600 dark:text-[#8E918F] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
              <div className="flex-1 truncate">
                <span>5. Tích hợp &amp; Xuất dữ liệu LMS</span>
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  activeSection === 'section-integration'
                    ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-[#E3E3E3]'
                    : 'bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995]'
                }`}
              >
                LTI 1.3
              </span>
            </button>

            {/* 6. Vùng nguy hiểm */}
            <div className="my-1 pt-1 border-none">
              <button
                type="button"
                id="nav-section-danger-zone"
                data-target="section-danger-zone"
                onClick={() => scrollToTargetSection('section-danger-zone')}
                className={`nav-setting-item w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border-none ${
                  activeSection === 'section-danger-zone'
                    ? 'bg-red-100 dark:bg-[#F2B8B5] text-red-900 dark:text-[#601410] shadow-xs'
                    : 'text-red-700 dark:text-[#F28B82] hover:bg-red-50 dark:hover:bg-[#3C1919]/40'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <div className="flex-1 truncate">
                  <span>6. Vùng nguy hiểm (Lưu trữ / Xóa)</span>
                </div>
              </button>
            </div>
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
              className="content-section rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none p-6 sm:p-7 border-none flex flex-col gap-5 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] flex items-center justify-center text-blue-700 dark:text-[#A8C7FA]">
                    <span className="material-symbols-outlined text-[22px]">badge</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                      Phần 1: Thông tin chung &amp; Nhận diện lớp
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                      Cập nhật thông số pháp quy của lớp học trên hệ thống đào tạo
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] font-medium">
                  Section 01
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên lớp học */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5] flex items-center gap-1">
                    Tên lớp học chính thức
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#F0F4F8] dark:bg-[#131314] px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-[#E3E3E3] border-none outline-none transition-all"
                  />
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    Hiển thị trong bảng điểm sinh viên và chứng chỉ kỹ năng đồ thị.
                  </span>
                </div>

                {/* Mã định danh lớp */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5] flex items-center gap-1">
                    Mã định danh lớp (System Code)
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={systemCode}
                      readOnly
                      className="w-full bg-[#E1E5EA] dark:bg-[#282A2C] px-4 py-3 rounded-2xl font-mono text-xs text-gray-700 dark:text-[#C4C7C5] cursor-not-allowed border-none outline-none select-all font-semibold"
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-3 text-[18px] text-gray-400">
                      lock
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    Mã hệ thống tự sinh từ Phòng Đào tạo, không thể sửa đổi trực tiếp.
                  </span>
                </div>

                {/* Khóa học / Niên khóa */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                    Niên khóa • Học kỳ
                  </label>
                  <CustomSelect<string>
                    value={semester}
                    onChange={setSemester}
                    options={[
                      { value: 'Học kỳ II • 2024 - 2025', label: 'Học kỳ II • 2024 - 2025' },
                      { value: 'Học kỳ I • 2024 - 2025', label: 'Học kỳ I • 2024 - 2025' },
                      { value: 'Học kỳ Hè • 2024 - 2025', label: 'Học kỳ Hè • 2024 - 2025' },
                    ]}
                    triggerClassName="bg-[#F0F4F8] dark:bg-[#131314] border-none rounded-2xl h-11"
                  />
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    Thời gian tính hạn nộp đồ án và quyền truy cập phòng lab.
                  </span>
                </div>

                {/* Sĩ số tối đa */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                    Sĩ số tối đa (Giới hạn ghi danh)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={150}
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value))}
                      className="w-full bg-[#F0F4F8] dark:bg-[#131314] px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none transition-all"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">sinh viên</span>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    Hiện có <strong className="text-gray-900 dark:text-[#E3E3E3]">{enrolledCount}</strong> sinh viên đã ghi danh.
                  </span>
                </div>

                {/* Trạng thái lớp học */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                    Trạng thái vận hành
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-gray-800 dark:text-[#C4C7C5]">
                      Đang giảng dạy tích cực
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                    Sinh viên nộp bài và tương tác AI Tutor bình thường.
                  </span>
                </div>

                {/* Mô tả lớp học */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                    Mô tả lớp học &amp; Đề cương mục tiêu
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#F0F4F8] dark:bg-[#131314] px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 dark:text-[#E3E3E3] border-none outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Ảnh nền lớp học */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                      Ảnh nền lớp học (Background)
                    </label>
                    {backgroundUrl && (
                      <button
                        type="button"
                        onClick={() => setBackgroundUrl('')}
                        className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Xóa ảnh nền
                      </button>
                    )}
                  </div>

                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />

                  {backgroundUrl ? (
                    <div className="relative rounded-2xl overflow-hidden bg-[#F0F4F8] dark:bg-[#131314] h-40">
                      <img
                        src={backgroundUrl}
                        alt="Class background"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-4">
                        <span className="text-xs text-white/90 font-medium truncate pr-4">
                          Ảnh bìa hiện tại của lớp học
                        </span>
                        <button
                          type="button"
                          disabled={isUploadingBackground}
                          onClick={() => bgFileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold cursor-pointer border-none transition-colors shrink-0 disabled:opacity-60"
                        >
                          {isUploadingBackground ? 'Đang tải...' : 'Đổi ảnh nền'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploadingBackground}
                      onClick={() => bgFileInputRef.current?.click()}
                      className="w-full h-32 rounded-2xl border border-dashed border-slate-300 dark:border-[#3c4043] bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isUploadingBackground ? (
                        <>
                          <span className="w-5 h-5 border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-600 dark:text-[#C4C7C5]">
                            Đang tải ảnh nền lên...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[24px] text-[#0B57D0] dark:text-[#A8C7FA]">
                            add_photo_alternate
                          </span>
                          <span className="text-xs font-semibold text-gray-800 dark:text-[#E3E3E3]">
                            Tải lên ảnh nền lớp học (PNG, JPG, WEBP)
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {backgroundUploadError && (
                    <span className="text-xs text-rose-600 dark:text-rose-400">
                      {backgroundUploadError}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* PHẦN 2: CÀI ĐẶT MÃ THAM GIA & BẢO MẬT (ENROLLMENT)    */}
            {/* ---------------------------------------------------- */}
            <section
              id="section-enrollment"
              className="content-section rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none p-6 sm:p-7 border-none flex flex-col gap-5 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] flex items-center justify-center text-blue-700 dark:text-[#A8C7FA]">
                    <span className="material-symbols-outlined text-[22px]">lock_open</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                      Phần 2: Mã lớp &amp; Cơ chế ghi danh (Enrollment)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                      Kiểm soát điều kiện và phương thức sinh viên đăng ký vào không gian lớp
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] font-medium">
                  Section 02
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Mã ghi danh hiện tại */}
                <div className="p-5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-[#8E918F] font-semibold">
                      Mã Ghi Danh Bí Mật (Enrollment Secret Key)
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        id="enrollment-key-text"
                        className="font-mono text-2xl text-blue-600 dark:text-[#A8C7FA] font-bold tracking-wider"
                      >
                        {enrollmentKey}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] font-medium border-none">
                        Hoạt động
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                      Sinh viên cần nhập mã này khi lần đầu truy cập lớp từ dashboard chính.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold border-none transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        <span>Sao chép mã</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateRandomCode}
                        title="Tạo mã ngẫu nhiên mới"
                        className="p-2.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:opacity-85 text-gray-600 dark:text-[#C4C7C5] border-none transition-colors shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">autorenew</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDirectLink}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-xs transition-all cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      <span>Copy Link mời trực tiếp</span>
                    </button>
                  </div>
                </div>

                {/* Các tuỳ chọn bảo mật (Toggles) */}
                <div className="flex flex-col gap-3 pt-1 border-none">
                  {/* Toggle 1 */}
                  <label className="flex items-start justify-between gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Cho phép học viên tự đăng ký qua link mời
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                        Người dùng có tài khoản trường khi nhấp vào link kèm mã sẽ được tự động đưa vào danh sách lớp.
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={allowSelfEnrollment}
                        onChange={(e) => setAllowSelfEnrollment(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E1E5EA] dark:bg-[#282A2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BFF] dark:peer-checked:bg-[#A8C7FA]" />
                    </div>
                  </label>

                  {/* Toggle 2 */}
                  <label className="flex items-start justify-between gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Yêu cầu Giảng viên / TA phê duyệt trước khi sinh viên vào lớp
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                        Sinh viên nhập đúng mã sẽ chuyển vào hàng đợi phê duyệt, tránh tài khoản ngoài danh sách chính thức.
                      </span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={requireApproval}
                        onChange={(e) => setRequireApproval(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E1E5EA] dark:bg-[#282A2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BFF] dark:peer-checked:bg-[#A8C7FA]" />
                    </div>
                  </label>

                  {/* Toggle 3 */}
                  <label className="flex items-start justify-between gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                        Chỉ cho phép tài khoản Email trường Đại học (@edu.vn)
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
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
                      <div className="w-11 h-6 bg-[#E1E5EA] dark:bg-[#282A2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BFF] dark:peer-checked:bg-[#A8C7FA]" />
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
              className="content-section rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none p-6 sm:p-7 border-none flex flex-col gap-5 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] flex items-center justify-center text-blue-700 dark:text-[#A8C7FA]">
                    <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                      Phần 3: Phân quyền Giảng viên &amp; Trợ giảng (TA)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                      Quản lý đội ngũ giảng dạy, trợ giảng hỗ trợ chấm bài và duyệt quyền hạn
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] font-medium">
                  Section 03
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Danh sách người phụ trách */}
                <div className="flex flex-col rounded-2xl overflow-hidden border-none bg-[#F0F4F8] dark:bg-[#131314]">
                  {/* GV Chủ nhiệm */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-bold text-xs shrink-0">
                        {ownerInitials}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                            {ownerName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-semibold">
                            Chủ nhiệm lớp
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                          {ownerEmail ? `${ownerEmail} • ` : ''}Toàn quyền quản trị
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-gray-600 dark:text-[#C4C7C5] px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] self-start sm:self-auto font-semibold border-none">
                      Owner (Mặc định)
                    </span>
                  </div>

                  {/* Giảng viên đồng giảng (TEACHER) từ API */}
                  {teacherMembers.length === 0 ? (
                    <div className="px-4 py-3 text-[11px] text-gray-500 dark:text-[#8E918F]">
                      Chưa có giảng viên đồng giảng nào được thêm vào lớp.
                    </div>
                  ) : (
                    teacherMembers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center font-bold text-xs shrink-0">
                            {teacher.avatar || 'GV'}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                                {teacher.name}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-[#162B4D] text-blue-700 dark:text-[#A8C7FA] text-[10px] font-medium border-none">
                                Giảng viên
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                              {teacher.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <CustomSelect<'TEACHER' | 'STUDENT'>
                            variant="pill"
                            value="TEACHER"
                            onChange={(newRole) => {
                              if (newRole !== 'TEACHER' && onUpdateMemberRole) {
                                onUpdateMemberRole(teacher.id, newRole);
                              }
                            }}
                            options={[
                              { value: 'TEACHER', label: 'Giảng viên (TEACHER)' },
                              { value: 'STUDENT', label: 'Chuyển thành Học viên' },
                            ]}
                            className="min-w-[180px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAssistant(teacher.id, teacher.name)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
                            title="Xóa khỏi lớp"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Thêm trợ giảng mới */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-gray-400 text-[18px]">
                      person_add
                    </span>
                    <input
                      type="email"
                      value={newTaEmail}
                      onChange={(e) => setNewTaEmail(e.target.value)}
                      placeholder="Nhập email giảng viên hoặc trợ giảng mới (@edu.vn)..."
                      className="w-full bg-[#F0F4F8] dark:bg-[#131314] pl-10 pr-4 py-2.5 rounded-full text-xs font-medium text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAssistant}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border-none shadow-xs"
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
              className="content-section rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none p-6 sm:p-7 border-none flex flex-col gap-5 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
                    <span className="material-symbols-outlined text-[22px]">neurology</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                      Phần 4: Cấu hình Trợ giảng AI Tutor &amp; Tri thức
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                      Kiểm soát trí tuệ nhân tạo giải đáp, phương pháp sư phạm gợi mở và giới hạn token
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold border-none">
                  AI Tutor Engine v4.2
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Toggle AI Tutor Active */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                      <img src="/socratic_mascot.png" alt="Socratic AI" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                        Kích hoạt AI Tutor 24/7 cho sinh viên
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
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
                    <div className="w-11 h-6 bg-[#E1E5EA] dark:bg-[#282A2C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007BFF] dark:peer-checked:bg-[#A8C7FA]" />
                  </div>
                </div>

                {/* Chế độ sư phạm Socratic (Radio Selectors) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
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
                      className={`p-5 rounded-2xl flex flex-col gap-1.5 cursor-pointer transition-all border-none ${
                        pedagogicalStance === 'socratic'
                          ? 'bg-[#D3E3FD]/40 dark:bg-[#A8C7FA]/15'
                          : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">
                            psychology_alt
                          </span>
                          <span>Gợi ý tư duy Socratic (Khuyên dùng)</span>
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            pedagogicalStance === 'socratic'
                              ? 'bg-[#007BFF] dark:bg-[#A8C7FA] text-white dark:text-[#041E49]'
                              : 'bg-black/10 dark:bg-white/10'
                          }`}
                        >
                          {pedagogicalStance === 'socratic' && (
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-[#8E918F] leading-relaxed">
                        AI không đưa code giải đáp trực tiếp. Thay vào đó, đặt các câu hỏi dẫn dắt để sinh viên tự tìm ra lỗ hổng tư duy.
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
                      className={`p-5 rounded-2xl flex flex-col gap-1.5 cursor-pointer transition-all border-none ${
                        pedagogicalStance === 'direct'
                          ? 'bg-[#D3E3FD]/40 dark:bg-[#A8C7FA]/15'
                          : 'bg-[#F0F4F8] dark:bg-[#131314] hover:opacity-85'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-gray-500 text-[18px]">
                            terminal
                          </span>
                          <span>Hỗ trợ sửa lỗi trực diện (Direct Fix)</span>
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            pedagogicalStance === 'direct'
                              ? 'bg-[#007BFF] dark:bg-[#A8C7FA] text-white dark:text-[#041E49]'
                              : 'bg-black/10 dark:bg-white/10'
                          }`}
                        >
                          {pedagogicalStance === 'direct' && (
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-[#8E918F] leading-relaxed">
                        AI chỉ rõ dòng lỗi cú pháp và gợi ý đoạn snippet giải quyết ngay. Phù hợp cho giai đoạn ôn tập cuối kỳ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tinh chỉnh Giới hạn câu hỏi & Tần suất tương tác */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                      Giới hạn lượt hỏi AI mỗi ngày / Sinh viên
                    </label>
                    <CustomSelect<string>
                      value={dailyQuestionLimit}
                      onChange={setDailyQuestionLimit}
                      options={[
                        { value: '20 lượt hỏi / ngày (Tiêu chuẩn)', label: '20 lượt hỏi / ngày (Tiêu chuẩn)' },
                        { value: '35 lượt hỏi / ngày (Khuyến nghị ngành CNTT)', label: '35 lượt hỏi / ngày (Khuyến nghị ngành CNTT)' },
                        { value: '50 lượt hỏi / ngày (Mở rộng cho kỳ Đồ án)', label: '50 lượt hỏi / ngày (Mở rộng cho kỳ Đồ án)' },
                        { value: 'Không giới hạn (Theo quota trường cấp)', label: 'Không giới hạn (Theo quota trường cấp)' },
                      ]}
                      triggerClassName="bg-[#F0F4F8] dark:bg-[#131314] border-none rounded-2xl h-11"
                    />
                    <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
                      Giúp sinh viên tập trung tự nghiên cứu thay vì phụ thuộc quá mức vào AI.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-800 dark:text-[#C4C7C5]">
                      Nguồn tri thức tham chiếu (Grounding)
                    </label>
                    <CustomSelect<string>
                      value={groundingSource}
                      onChange={setGroundingSource}
                      options={[
                        {
                          value: `Chỉ Giáo trình & Slide bài giảng ${systemCode}`,
                          label: `Chỉ Giáo trình & Slide bài giảng ${systemCode}`,
                        },
                        {
                          value: 'Giáo trình lớp + Kho tài liệu mở IEEE / ACM',
                          label: 'Giáo trình lớp + Kho tài liệu mở IEEE / ACM',
                        },
                        {
                          value: 'Toàn bộ kiến thức kỹ thuật trên Internet',
                          label: 'Toàn bộ kiến thức kỹ thuật trên Internet',
                        },
                      ]}
                      triggerClassName="bg-[#F0F4F8] dark:bg-[#131314] border-none rounded-2xl h-11"
                    />
                    <span className="text-[11px] text-gray-400 dark:text-[#8E918F]">
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
              className="content-section rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none p-6 sm:p-7 border-none flex flex-col gap-5 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center justify-between pb-2 border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-[#162B4D] flex items-center justify-center text-blue-700 dark:text-[#A8C7FA]">
                    <span className="material-symbols-outlined text-[22px]">sync_alt</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-[#E3E3E3]">
                      Phần 5: Tích hợp &amp; Xuất dữ liệu LMS
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8E918F]">
                      Liên kết chuẩn LTI Advantage, đồng bộ Canvas/Moodle và xuất báo cáo chuẩn PLO
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] font-medium">
                  Section 05
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Danh sách tích hợp LMS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Moodle */}
                  <div className="p-5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] flex flex-col justify-between gap-3 border-none">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                          M
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                            Moodle LMS Trường ĐH
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                            Đồng bộ tự động danh sách &amp; điểm
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-[11px] font-medium border-none">
                        Đã kết nối
                      </span>
                    </div>
                    <div className="pt-2 border-none flex items-center justify-between text-xs text-gray-500 dark:text-[#8E918F]">
                      <span>Lần sync cuối: 10 phút trước</span>
                      <button
                        type="button"
                        onClick={() => showToast('Đang tiến hành đồng bộ hai chiều với Moodle LMS...')}
                        className="text-blue-600 dark:text-[#A8C7FA] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-[16px]">sync</span>
                        <span>Đồng bộ ngay</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Canvas */}
                  <div className="p-5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] flex flex-col justify-between gap-3 border-none">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                          C
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                            Canvas LMS / Blackboard
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                            LTI 1.3 Advantage Protocol
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5] text-[11px] border-none">
                        Chưa bật
                      </span>
                    </div>
                    <div className="pt-2 border-none flex items-center justify-between text-xs text-gray-500 dark:text-[#8E918F]">
                      <span>Cần LTI Client ID &amp; Secret</span>
                      <button
                        type="button"
                        onClick={() => showToast('Mở khung thiết lập LTI 1.3 Client Credentials')}
                        className="text-blue-600 dark:text-[#A8C7FA] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        <span>Thiết lập LTI</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Xuất báo cáo dữ liệu */}
                <div className="p-5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[20px]">
                        download
                      </span>
                      <span>Xuất trọn gói dữ liệu học tập (Full Audit Package)</span>
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                      Bao gồm bảng điểm chi tiết, log đồ thị tri thức, và báo cáo PLO theo định dạng CSV / Excel / JSON.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => showToast(`Đang trích xuất dữ liệu lớp ${systemCode} định dạng Excel (.xlsx)...`)}
                      className="px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold border-none transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">
                        table_view
                      </span>
                      <span>Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Đang xuất JSON đồ thị tri thức & điểm PLO...')}
                      className="px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold border-none transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent"
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
              className="content-section rounded-3xl bg-red-50/40 dark:bg-[#3C1919]/20 p-6 sm:p-7 border-none flex flex-col gap-5 scroll-mt-24 transition-all duration-300"
            >
              <div className="flex items-center gap-3 pb-2 border-none">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-[#3C1919] flex items-center justify-center text-red-700 dark:text-[#F28B82] shrink-0">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-red-700 dark:text-[#F28B82]">
                    Phần 6: Vùng nguy hiểm (Danger Zone)
                  </h2>
                  <p className="text-xs text-red-700/80 dark:text-[#F28B82]/80">
                    Các hành động ảnh hưởng nghiêm trọng đến dữ liệu học tập và hồ sơ sinh viên
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Action 1: Lưu trữ lớp học */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-[#E3E3E3]">
                      Lưu trữ lớp học này vào kho lưu trữ (Archive)
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                      Lớp chuyển sang chế độ Chỉ đọc (Read-only). Sinh viên vẫn xem được tài liệu và điểm nhưng không thể nộp bài hoặc chat AI.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenArchiveModal}
                    className="px-5 py-2.5 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold whitespace-nowrap transition-colors self-start sm:self-auto shrink-0 border-none cursor-pointer bg-transparent"
                  >
                    Lưu trữ lớp học
                  </button>
                </div>

                {/* Action 2: Xóa vĩnh viễn */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-red-700 dark:text-[#F28B82] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      <span>Xóa vĩnh viễn lớp học {systemCode}</span>
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-[#8E918F]">
                      Toàn bộ đồ thị tri thức, bài nộp, điểm số và phiên tương tác AI sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-red-100 dark:bg-[#F2B8B5] text-red-900 dark:text-[#601410] hover:brightness-95 text-xs font-semibold whitespace-nowrap transition-colors self-start sm:self-auto shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5 border-none"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    <span>Xóa vĩnh viễn lớp</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Modal xác nhận xóa vĩnh viễn kết nối API DELETE /api/v1/classes/{id} */}
            <PermanentDeleteClassModal
              isOpen={isDeleteModalOpen}
              classId={classInfo.id}
              classNameTitle={classInfo.title || classInfo.name}
              systemCode={systemCode}
              onClose={() => setIsDeleteModalOpen(false)}
              onSuccess={() => {
                setIsDeleteModalOpen(false);
                showToast('Lớp học đã được xóa vĩnh viễn thành công!');
                if (onDeleteSuccess) {
                  onDeleteSuccess();
                } else {
                  router.push('/classes');
                }
              }}
            />

            {/* ---------------------------------------------------- */}
            {/* THANH NÚT LƯU CỐ ĐỊNH (STICKY BOTTOM ACTION BAR)     */}
            {/* ---------------------------------------------------- */}
            <div className="p-4 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md shadow-lg border-none flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
              <div className="flex items-center gap-2 text-gray-600 dark:text-[#8E918F] text-xs font-medium">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[20px]">
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
                  className="px-5 py-2.5 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
                >
                  Hủy thay đổi
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs shadow-sm transition-all cursor-pointer border-none"
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
