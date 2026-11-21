'use client';

import React, { useState, useEffect, useRef } from 'react';
import { uploadFile } from '@/lib/upload';

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  status: string;
  type: 'pdf' | 'pptx' | 'zip' | 'png' | 'doc';
  url?: string;
  rawFile?: File;
  abortController?: AbortController;
  uploadState?: 'uploading' | 'uploaded' | 'error';
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

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  classId = '',
  classCode = '',
  classNameTitle = '',
  studentCount = 0,
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

  const otherClassesPool: TargetClassOption[] = availableClasses;

  const [selectedClasses, setSelectedClasses] = useState<TargetClassOption[]>([
    defaultClassOption,
  ]);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedClasses([
      {
        id: classId,
        code: classCode,
        name: classNameTitle,
        studentCount,
      },
    ]);
  }, [classId, classCode, classNameTitle, studentCount]);

  // Form states (empty by default, no mock/sample data)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [isUrgentEmail, setIsUrgentEmail] = useState(true);
  const [isMobilePush, setIsMobilePush] = useState(true);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

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

  const processFiles = async (files: File[]) => {
    const placeholders: AttachedFile[] = files.map((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: AttachedFile['type'] = 'pdf';
      if (ext === 'pptx' || ext === 'ppt') type = 'pptx';
      else if (ext === 'zip' || ext === 'rar') type = 'zip';
      else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') type = 'png';
      else if (ext === 'doc' || ext === 'docx') type = 'doc';

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const controller = new AbortController();
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: `${sizeMb} MB`,
        status: 'Đang tải lên...',
        type,
        rawFile: file,
        abortController: controller,
        uploadState: 'uploading' as const,
      };
    });

    setAttachments((prev) => [...prev, ...placeholders]);

    placeholders.forEach((item) => {
      if (!item.rawFile || !item.abortController) return;
      const controller = item.abortController;
      uploadFile(item.rawFile, 'ilms/announcements', controller.signal)
        .then((res) => {
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === item.id
                ? {
                    ...att,
                    url: res.url,
                    status: 'Đã tải lên',
                    uploadState: 'uploaded',
                    abortController: undefined,
                  }
                : att
            )
          );
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          const msg = err instanceof Error ? err.message : 'Lỗi tải lên';
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === item.id
                ? {
                    ...att,
                    status: `Lỗi: ${msg}`,
                    uploadState: 'error',
                    abortController: undefined,
                  }
                : att
            )
          );
        });
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.abortController) {
        target.abortController.abort();
      }
      return prev.filter((item) => item.id !== id);
    });
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
    const hasUploading = attachments.some((att) => att.uploadState === 'uploading');
    const hasFailed = attachments.some((att) => att.uploadState === 'error');
    if (hasUploading) {
      notify('Vui lòng chờ tất cả tệp tải lên hoàn tất hoặc hủy tệp đang tải.');
      return;
    }
    if (hasFailed) {
      notify('Có tệp tải lên thất bại. Vui lòng gỡ tệp lỗi trước khi đăng.');
      return;
    }
    if (!title.trim()) {
      notify('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!content.trim()) {
      notify('Vui lòng nhập nội dung chi tiết thông báo.');
      return;
    }

    const uploadedAttachments = attachments.filter((att) => Boolean(att.url));
    const attachmentMarkdown =
      uploadedAttachments.length > 0
        ? `\n\n**Tệp đính kèm:**\n${uploadedAttachments
            .map((att) => `- [${att.name}](${att.url})`)
            .join('\n')}`
        : '';

    const payload: CreateAnnouncementData = {
      title: title.trim(),
      content: `${content.trim()}${attachmentMarkdown}`,
      targetClassIds: selectedClasses.map((c) => c.id),
      isPinned,
      isUrgentEmail,
      isMobilePush,
      scheduledAt: isScheduling && scheduledDateTime ? scheduledDateTime : null,
      attachments,
    };

    onPublish(payload);
    setTitle('');
    setContent('');
    setAttachments([]);
    notify(
      isScheduling && scheduledDateTime
        ? `Đã lên lịch phát thông báo vào ${scheduledDateTime} tới ${totalAudienceCount} sinh viên!`
        : `Đã đăng thông báo mới tới toàn thể ${totalAudienceCount} sinh viên thành công!`
    );
    onClose();
  };

  // Save draft
  const handleSaveDraft = () => {
    const uploadedAttachments = attachments.filter((att) => Boolean(att.url));
    const attachmentMarkdown =
      uploadedAttachments.length > 0
        ? `\n\n**Tệp đính kèm:**\n${uploadedAttachments
            .map((att) => `- [${att.name}](${att.url})`)
            .join('\n')}`
        : '';

    const payload: CreateAnnouncementData = {
      title: title.trim(),
      content: `${content.trim()}${attachmentMarkdown}`,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md transition-opacity duration-300"
      id="announcement-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Card Dialog (3px visual border, level-3 elevation shadow) */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300 scale-100 border-[3px] border-slate-300 dark:border-slate-700 animate-in zoom-in-95">
        {/* Top Decorative Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-sky-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900 flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[26px]">campaign</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="announcement-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                >
                  Soạn thông báo lớp học mới
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wide border border-blue-200/60 dark:border-blue-900">
                  Toàn thể lớp
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nội dung sẽ lập tức hiển thị trên Bảng tin sinh viên và lưu trữ vào sổ học vụ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            title="Đóng cửa sổ (Esc)"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
              <div className="w-full min-h-[48px] px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex flex-wrap items-center gap-2 border border-slate-200/80 dark:border-slate-800 shadow-inner">
                {/* Selected Badges */}
                {selectedClasses.map((cls) => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium shadow-xs border border-slate-200/70 dark:border-slate-800"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
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
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-1 transition-colors flex items-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                      </button>
                    )}
                  </span>
                ))}

{/* Add More Classes Selector Dropdown Trigger (only when additional classes exist) */}
                {otherClassesPool.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-blue-600 dark:text-[#A8C7FA] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Thêm lớp khác</span>
                  </button>
                )}

              </div>

              {/* Class Selection Dropdown Popover */}
              {isClassDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-full sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-in fade-in zoom-in-95 duration-150">
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
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 border border-slate-200/80 dark:border-slate-800 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* 3. Rich-Text Editor Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="announcement-content"
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                  edit_note
                </span>
                <span>
                  Nội dung thông báo chi tiết{' '}
                  <span className="text-rose-500 font-bold">*</span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tự động sao lưu bản nháp ({lastAutoSavedTime})
                </span>
              </div>
            </div>

            {/* Rich Editor Card Container */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 gap-1.5">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 font-bold transition-colors cursor-pointer"
                    title="In đậm (Ctrl+B)"
                  >
                    <span className="material-symbols-outlined text-[19px]">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="In nghiêng (Ctrl+I)"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_italic
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('<u>', '</u>')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Gạch chân (Ctrl+U)"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_underlined
                    </span>
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('• ')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Danh sách không thứ tự"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_list_bulleted
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Danh sách đánh số"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      format_list_numbered
                    </span>
                  </button>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('[Liên kết](', ')') }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Chèn liên kết"
                  >
                    <span className="material-symbols-outlined text-[19px]">link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('![Ảnh](', ')') }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Chèn ảnh minh họa"
                  >
                    <span className="material-symbols-outlined text-[19px]">image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```bash\n', '\n```')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs border border-blue-200/60 dark:border-blue-900 cursor-pointer disabled:opacity-50"
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
              <div className="p-4 bg-white dark:bg-slate-900">
                <textarea
                  id="announcement-content"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Nhập nội dung thông báo đầy đủ gửi tới sinh viên (hỗ trợ Markdown)..."
                  className="w-full bg-transparent font-normal text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed outline-none resize-y min-h-[160px] custom-scrollbar placeholder:text-slate-400"
                />
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
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-3 shadow-inner border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
              Tùy chọn phân phối nâng cao
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Pin to Top */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-2xs border border-slate-200/70 dark:border-slate-800">
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
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Ghim đầu trang
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Giữ thông báo luôn nằm vị trí đầu tiên của bảng tin lớp.
                  </p>
                </div>
              </label>

              {/* Option 2: Send Urgent Email */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-2xs border border-slate-200/70 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={isUrgentEmail}
                  onChange={(e) => setIsUrgentEmail(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                      mail
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Gửi email khẩn
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Gửi bản sao trực tiếp đến {totalAudienceCount} hộp thư sinh viên @hcmut.edu.vn.
                  </p>
                </div>
              </label>

              {/* Option 3: Mobile Push Notification */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-2xs border border-slate-200/70 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={isMobilePush}
                  onChange={(e) => setIsMobilePush(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 accent-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                      notifications_active
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Push di động
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Phát thông báo tức thời qua app EduTech ILMS trên iOS / Android.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-7 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
          {/* Left: Schedule Trigger */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span>Có thể lên lịch đăng tự động</span>
            {!isScheduling ? (
              <button
                type="button"
                onClick={() => setIsScheduling(true)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
              >
                Đặt giờ
              </button>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  title="Hủy đặt giờ"
                  className="text-slate-400 hover:text-slate-600"
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
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-all active:scale-95 shadow-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Lưu bản nháp
            </button>

            {/* Publish Button */}
            <button
              type="button"
              onClick={handlePublish}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer"
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

