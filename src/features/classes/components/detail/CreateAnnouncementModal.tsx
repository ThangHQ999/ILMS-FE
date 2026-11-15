'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  status: string;
  type: 'pdf' | 'pptx' | 'zip' | 'png' | 'doc';
  rawFile?: File;
}

export interface TargetClassOption {
  id: string;
  code: string;
  name: string;
  studentCount: number;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  targetClassIds: string[];
  isPinned: boolean;
  isUrgentEmail: boolean;
  isMobilePush: boolean;
  scheduledAt?: string | null;
  attachments: AttachedFile[];
}

export interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  classCode?: string;
  classNameTitle?: string;
  studentCount?: number;
  availableClasses?: TargetClassOption[];
  onPublish: (data: CreateAnnouncementData) => void;
  onSaveDraft?: (data: CreateAnnouncementData) => void;
  onToast?: (message: string) => void;
}

const DEFAULT_ATTACHMENTS: AttachedFile[] = [
  {
    id: 'att-1',
    name: 'Thong_Bao_Nghi_Le_DHQG_2026.pdf',
    size: '1.4 MB',
    status: 'Đã quét an toàn',
    type: 'pdf',
  },
  {
    id: 'att-2',
    name: 'Slide_Bo_Sung_Lab03_AVL.pptx',
    size: '5.8 MB',
    status: 'Sẵn sàng đính kèm',
    type: 'pptx',
  },
];

const DEFAULT_CONTENT = `Chào toàn thể sinh viên lớp CS-202 (Cấu trúc dữ liệu & Giải thuật),

Theo lịch của Nhà trường, tuần tới toàn bộ sinh viên sẽ nghỉ lễ Giải phóng miền Nam và Quốc tế Lao động. Vì vậy, tiến độ bài tập và buổi thực hành sẽ được điều chỉnh cụ thể như sau:

• Hạn nộp Lab 03 (Binary Trees & AVL Balance): Dời từ 23:59 Chủ Nhật (28/04) sang 23:59 Thứ Ba (07/05).
• Buổi Review trực tuyến qua Google Meet vẫn được tổ chức vào tối Thứ Sáu tuần này cho nhóm sinh viên cần hỗ trợ thuật toán quay cây.

git commit -m "feat: complete AVL rotation benchmarks" && git push origin main

Đề nghị các nhóm trưởng kiểm tra lại tiến độ của các thành viên trong mục Quản lý Nhóm.`;

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  classId = 'CS-202',
  classCode = 'CS-202',
  classNameTitle = 'Cấu trúc dữ liệu & Giải thuật',
  studentCount = 45,
  availableClasses = [],
  onPublish,
  onSaveDraft,
  onToast,
}: CreateAnnouncementModalProps) {
  // Target classes selection
  const defaultClassOption: TargetClassOption = {
    id: classId,
    code: classCode,
    name: classNameTitle,
    studentCount,
  };

  const otherClassesPool: TargetClassOption[] =
    availableClasses.length > 0
      ? availableClasses
      : [
          {
            id: `${classId}-L`,
            code: `${classCode}L`,
            name: `${classNameTitle} (Thực hành Lab 02)`,
            studentCount: 28,
          },
          {
            id: 'CS-203',
            code: 'CS-203',
            name: 'Thuật toán nâng cao & Đồ thị',
            studentCount: 36,
          },
          {
            id: 'CNTT-K22B',
            code: 'CNTT-K22B',
            name: 'Cấu trúc dữ liệu (Ca chiều Thứ 4)',
            studentCount: 42,
          },
        ];

  const [selectedClasses, setSelectedClasses] = useState<TargetClassOption[]>([
    defaultClassOption,
  ]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState(
    'Lịch nghỉ lễ và dời hạn nộp đề cương thực hành Lab 03'
  );
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isPinned, setIsPinned] = useState(true);
  const [isUrgentEmail, setIsUrgentEmail] = useState(true);
  const [isMobilePush, setIsMobilePush] = useState(true);
  const [attachments, setAttachments] =
    useState<AttachedFile[]>(DEFAULT_ATTACHMENTS);

  // Scheduling states
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // AI polishing state
  const [isAiPolishing, setIsAiPolishing] = useState(false);
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState('Vừa xong');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notify = (msg: string) => {
    if (onToast) onToast(msg);
  };

  // Keyboard accessibility: ESC closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close class dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsClassDropdownOpen(false);
      }
    };
    if (isClassDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClassDropdownOpen]);

  // Auto-save draft timer simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      setLastAutoSavedTime(timeStr);
      try {
        localStorage.setItem(
          `ilms_draft_ann_${classId}`,
          JSON.stringify({ title, content, isPinned, isUrgentEmail, isMobilePush })
        );
      } catch {
        // ignore
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen, classId, title, content, isPinned, isUrgentEmail, isMobilePush]);

  if (!isOpen) return null;

  // Total students calculated across selected classes
  const totalAudienceCount = selectedClasses.reduce(
    (acc, c) => acc + c.studentCount,
    0
  );

  // Add / remove classes
  const handleToggleClass = (cls: TargetClassOption) => {
    if (selectedClasses.some((c) => c.id === cls.id)) {
      if (selectedClasses.length === 1) {
        notify('Cần ít nhất một lớp học nhận thông báo!');
        return;
      }
      setSelectedClasses(selectedClasses.filter((c) => c.id !== cls.id));
    } else {
      setSelectedClasses([...selectedClasses, cls]);
    }
  };

  // Formatting helpers for rich textarea
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + (selected || 'nội dung') + suffix;
    const nextContent =
      text.substring(0, start) + replacement + text.substring(end);
    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 8)
      );
    }, 50);
  };

  // AI polishing action
  const handleAiPolish = () => {
    setIsAiPolishing(true);
    notify('ILMS AI Engine v3 đang phân tích và chuẩn hóa văn phong thông báo...');

    setTimeout(() => {
      setIsAiPolishing(false);
      setTitle((prev) =>
        prev.includes('[THÔNG BÁO HỌC VỤ]')
          ? prev
          : `[THÔNG BÁO HỌC VỤ] ${prev}`
      );
      setContent((prev) => {
        if (prev.includes('Trân trọng thông báo')) return prev;
        return `${prev}\n\n---\n📌 Ghi chú học vụ: Sinh viên vui lòng hoàn thành trước thời hạn đã ấn định. Mọi thắc mắc kỹ thuật phản hồi qua diễn đàn môn học.`;
      });
      notify('ILMS AI đã tối ưu hóa văn phong học thuật và làm nổi bật các mốc thời hạn!');
    }, 600);
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const newItems: AttachedFile[] = files.map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: AttachedFile['type'] = 'pdf';
      if (ext === 'pptx' || ext === 'ppt') type = 'pptx';
      else if (ext === 'zip' || ext === 'rar') type = 'zip';
      else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') type = 'png';
      else if (ext === 'doc' || ext === 'docx') type = 'doc';

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: `${sizeMb} MB`,
        status: 'Sẵn sàng đính kèm',
        type,
        rawFile: file,
      };
    });

    setAttachments((prev) => [...prev, ...newItems]);
    notify(`Đã thêm ${newItems.length} tệp đính kèm mới vào danh sách!`);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Submit announcement
  const handlePublish = () => {
    if (!title.trim()) {
      notify('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!content.trim()) {
      notify('Vui lòng nhập nội dung chi tiết thông báo.');
      return;
    }

    const payload: CreateAnnouncementData = {
      title: title.trim(),
      content: content.trim(),
      targetClassIds: selectedClasses.map((c) => c.id),
      isPinned,
      isUrgentEmail,
      isMobilePush,
      scheduledAt: isScheduling && scheduledDateTime ? scheduledDateTime : null,
      attachments,
    };

    onPublish(payload);
    notify(
      isScheduling && scheduledDateTime
        ? `Đã lên lịch phát thông báo vào ${scheduledDateTime} tới ${totalAudienceCount} sinh viên!`
        : `Đã đăng thông báo mới tới toàn thể ${totalAudienceCount} sinh viên thành công!`
    );
    onClose();
  };

  // Save draft
  const handleSaveDraft = () => {
    const payload: CreateAnnouncementData = {
      title: title.trim(),
      content: content.trim(),
      targetClassIds: selectedClasses.map((c) => c.id),
      isPinned,
      isUrgentEmail,
      isMobilePush,
      scheduledAt: isScheduling && scheduledDateTime ? scheduledDateTime : null,
      attachments,
    };
    if (onSaveDraft) {
      onSaveDraft(payload);
    }
    try {
      localStorage.setItem(`ilms_draft_ann_${classId}`, JSON.stringify(payload));
    } catch {
      // ignore
    }
    notify('Đã lưu bản nháp thông báo vào hệ thống!');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      id="announcement-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Card Dialog (Flat MD3 level-3 elevation shadow) */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1E1F20] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300 scale-100 border-none animate-in zoom-in-95">
        {/* Top Decorative Accent Strip */}
        <div className="h-1.5 w-full bg-[#D3E3FD] dark:bg-[#A8C7FA]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 py-4 sm:py-5 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">campaign</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="announcement-modal-title"
                  className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#E3E3E3] tracking-tight"
                >
                  Soạn thông báo lớp học mới
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] font-semibold text-xs uppercase tracking-wide">
                  Toàn thể lớp
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#8E918F] mt-0.5">
                Nội dung sẽ lập tức hiển thị trên Bảng tin sinh viên và lưu trữ vào sổ học vụ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            title="Đóng cửa sổ (Esc)"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#E3E3E3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-6 space-y-6 custom-scrollbar">
          {/* 1. Destination Audiences / Classes Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                  groups
                </span>
                <span>Lớp học nhận thông báo</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Đã chọn {selectedClasses.length} lớp ({totalAudienceCount} sinh viên)
              </span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <div className="w-full min-h-[48px] px-3.5 py-2 bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl flex flex-wrap items-center gap-2 border-none">
                {/* Selected Badges */}
                {selectedClasses.map((cls) => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1F20] text-gray-800 dark:text-[#E3E3E3] text-xs font-medium shadow-xs border-none"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#007BFF] dark:bg-[#A8C7FA]" />
                    <span className="font-mono font-bold text-blue-600 dark:text-[#A8C7FA]">
                      {cls.code}:
                    </span>
                    <span>
                      {cls.name} ({cls.studentCount} học viên)
                    </span>
                    {selectedClasses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleToggleClass(cls)}
                        aria-label={`Xóa lớp ${cls.code}`}
                        className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 ml-1 transition-colors flex items-center cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                      </button>
                    )}
                  </span>
                ))}

                {/* Add More Classes Selector Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-blue-600 dark:text-[#A8C7FA] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Thêm lớp cùng học phần (CS-202L, CS-203)...</span>
                </button>
              </div>

              {/* Class Selection Dropdown Popover */}
              {isClassDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-full sm:w-96 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border-none p-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Chọn thêm lớp nhận thông báo:
                  </p>
                  <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                    {otherClassesPool.map((item) => {
                      const isSelected = selectedClasses.some((c) => c.id === item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleClass(item)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{item.code}</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              - {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400">
                              {item.studentCount} SV
                            </span>
                            <span className="material-symbols-outlined text-[16px]">
                              {isSelected ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Announcement Title */}
          <div className="space-y-2">
            <label
              htmlFor="announcement-title"
              className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                  title
                </span>
                <span>
                  Tiêu đề thông báo <span className="text-rose-500 font-bold">*</span>
                </span>
              </span>
              <span
                className={`text-xs ${
                  title.length > 110
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {title.length}/120 ký tự
              </span>
            </label>
            <div className="relative">
              <input
                id="announcement-title"
                type="text"
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề cô đọng, rõ ràng..."
                className="w-full px-4 py-3 bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl text-sm sm:text-base font-semibold text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] outline-none border-none transition-all"
              />
            </div>
          </div>

          {/* 3. Rich-Text Editor Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="announcement-content"
                className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#E3E3E3] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">
                  edit_note
                </span>
                <span>
                  Nội dung thông báo chi tiết{' '}
                  <span className="text-rose-500 font-bold">*</span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                  Tự động sao lưu bản nháp ({lastAutoSavedTime})
                </span>
              </div>
            </div>

            {/* Rich Editor Card Container */}
            <div className="rounded-2xl overflow-hidden border-none bg-white dark:bg-[#1E1F20] shadow-xs">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#F0F4F8] dark:bg-[#131314] border-b border-black/5 dark:border-white/5 gap-1.5">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] font-bold transition-colors cursor-pointer border-none bg-transparent"
                    title="In đậm (Ctrl+B)"
                  >
                    <span className="material-symbols-outlined text-[19px]">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="In nghiêng (Ctrl+I)"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_italic
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<u>', '</u>')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Gạch chân (Ctrl+U)"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_underlined
                    </span>
                  </button>

                  <div className="h-4 w-px bg-gray-300 dark:bg-[#282A2C] mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('• ')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Danh sách không thứ tự"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_list_bulleted
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Danh sách đánh số"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_list_numbered
                    </span>
                  </button>

                  <div className="h-4 w-px bg-gray-300 dark:bg-[#282A2C] mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('[Liên kết](', ')') }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Chèn liên kết"
                  >
                    <span className="material-symbols-outlined text-[19px]">link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('![Ảnh](', ')') }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Chèn ảnh minh họa"
                  >
                    <span className="material-symbols-outlined text-[19px]">image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```bash\n', '\n```')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Khung mã nguồn / Code snippet"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      code_blocks
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertFormatting(
                        '\n| Mục | Hạn chót | Ghi chú |\n|---|---|---|\n| Lab 03 | 07/05/2026 | Nhóm 4 SV |\n'
                      )
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 dark:text-[#C4C7C5] hover:bg-white dark:hover:bg-[#282A2C] transition-colors cursor-pointer border-none bg-transparent"
                    title="Bảng biểu"
                  >
                    <span className="material-symbols-outlined text-[19px]">table_chart</span>
                  </button>
                </div>

                {/* AI Assistant Shortcut */}
                <button
                  type="button"
                  disabled={isAiPolishing}
                  onClick={handleAiPolish}
                  className="px-3 py-1 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold flex items-center gap-1.5 transition-all border-none cursor-pointer disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      isAiPolishing ? 'animate-spin' : ''
                    }`}
                  >
                    {isAiPolishing ? 'sync' : 'smart_toy'}
                  </span>
                  <span>{isAiPolishing ? 'Đang phân tích...' : 'AI trau chuốt giọng văn'}</span>
                </button>
              </div>

              {/* Editable Text Area */}
              <div className="p-4 bg-white dark:bg-[#1E1F20]">
                <textarea
                  id="announcement-content"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Nhập nội dung thông báo đầy đủ gửi tới sinh viên..."
                  className="w-full bg-transparent font-normal text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed outline-none resize-y min-h-[160px] custom-scrollbar placeholder:text-slate-400"
                />

                {/* Preview snippet container for terminal commands */}
                <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                  <span className="truncate select-all">
                    git commit -m &quot;feat: complete AVL rotation benchmarks&quot; &amp;&amp; git push origin main
                  </span>
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[16px] shrink-0 ml-2">
                    terminal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Drag & Drop File Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                  attachment
                </span>
                <span>Đính kèm tệp tài liệu &amp; công văn</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                PDF, DOCX, ZIP hoặc PNG (Tối đa 25MB/tệp)
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.doc,.pptx,.ppt,.zip,.rar,.png,.jpg,.jpeg"
            />

            {/* Upload Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer border-2 border-dashed ${
                isDragging
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 transition-transform hover:scale-110">
                <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                Kéo thả tệp tin vào đây, hoặc{' '}
                <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                  Duyệt tệp từ máy tính
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hỗ trợ tải lên cùng lúc nhiều tài liệu giáo trình và thông tri
              </p>
            </div>

            {/* Staged Uploaded Files List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shadow-2xs border border-slate-200/80 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {file.type === 'pdf' ? (
                        <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold font-mono text-[11px] border border-rose-200 dark:border-rose-900">
                          PDF
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                          <span className="material-symbols-outlined text-[20px]">
                            {file.type === 'pptx' ? 'slideshow' : 'folder_zip'}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {file.size} • {file.status}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                      title="Gỡ bỏ tệp"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Advanced Notification Options */}
          <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] space-y-3 border-none">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-[#8E918F] font-bold block">
              Tùy chọn phân phối nâng cao
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Pin to Top */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E1F20] cursor-pointer hover:opacity-90 transition-all border-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">
                      push_pin
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Ghim đầu trang
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 leading-snug">
                    Giữ thông báo luôn nằm vị trí đầu tiên của bảng tin lớp.
                  </p>
                </div>
              </label>

              {/* Option 2: Send Urgent Email */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E1F20] cursor-pointer hover:opacity-90 transition-all border-none">
                <input
                  type="checkbox"
                  checked={isUrgentEmail}
                  onChange={(e) => setIsUrgentEmail(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">
                      mail
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Gửi email khẩn
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 leading-snug">
                    Gửi bản sao trực tiếp đến {totalAudienceCount} hộp thư sinh viên @hcmut.edu.vn.
                  </p>
                </div>
              </label>

              {/* Option 3: Mobile Push Notification */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E1F20] cursor-pointer hover:opacity-90 transition-all border-none">
                <input
                  type="checkbox"
                  checked={isMobilePush}
                  onChange={(e) => setIsMobilePush(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 dark:text-[#A8C7FA] text-[18px]">
                      notifications_active
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#E3E3E3]">
                      Push di động
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8E918F] mt-0.5 leading-snug">
                    Phát thông báo tức thời qua app EduTech ILMS trên iOS / Android.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-7 py-4 bg-white dark:bg-[#1E1F20] border-t border-black/5 dark:border-white/5 shrink-0">
          {/* Left: Schedule Trigger */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-[#8E918F] text-xs">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>Có thể lên lịch đăng tự động</span>
            {!isScheduling ? (
              <button
                type="button"
                onClick={() => setIsScheduling(true)}
                className="text-blue-600 dark:text-[#A8C7FA] font-semibold hover:underline ml-1 cursor-pointer border-none bg-transparent"
              >
                Đặt giờ
              </button>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="px-3 py-1 bg-[#F0F4F8] dark:bg-[#131314] rounded-lg text-[11px] text-gray-800 dark:text-[#E3E3E3] outline-none border-none"
                />
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  title="Hủy đặt giờ"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-[#E3E3E3] border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer border-none bg-transparent transition-colors"
            >
              Lưu bản nháp
            </button>

            {/* Publish Button */}
            <button
              type="button"
              onClick={handlePublish}
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer border-none transition-all"
            >
              <span>{isScheduling && scheduledDateTime ? 'Lên lịch đăng' : 'Đăng thông báo ngay'}</span>
              <span className="material-symbols-outlined text-[19px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

