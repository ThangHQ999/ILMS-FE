'use client';

import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import type { ClassCourse } from '../../schemas/class-detail.schema';

interface RemoveSubjectModalProps {
  course: ClassCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (course: ClassCourse) => void;
}

export function RemoveSubjectModal({
  course,
  isOpen,
  onClose,
  onConfirm,
}: RemoveSubjectModalProps) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-2xl">warning</span>
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Gỡ môn học khỏi lớp?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Bạn có chắc chắn muốn gỡ môn{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">
              {course.name} ({course.code})
            </strong>{' '}
            khỏi lớp này?
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">info</span> Phạm vi ảnh hưởng:
          </p>
          <p className="leading-relaxed">
            Môn học sẽ không còn xuất hiện trong lớp này, nhưng dữ liệu bài giảng và cây đồ thị tri thức gốc trong kho học liệu vẫn được bảo lưu nguyên vẹn.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(course)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            Xác nhận gỡ môn
          </button>
        </div>
      </div>
    </div>
  );
}

interface ArchiveModalProps {
  classNameTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArchiveModal({
  classNameTitle,
  isOpen,
  onClose,
  onConfirm,
}: ArchiveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-2xl">inventory_2</span>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Xác nhận lưu trữ lớp học?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Lớp &quot;{classNameTitle}&quot; sẽ chuyển sang trạng thái lưu trữ (chỉ đọc). Bạn có thể mở lại lớp bất kỳ lúc nào từ tab Đã lưu trữ.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
          >
            Lưu trữ lớp
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subjectCodes: string[]) => void;
  availableCourses?: Array<{ id: string; code: string; name: string; credits: number }>;
}

export function AddSubjectModal({
  isOpen,
  onClose,
  onConfirm,
  availableCourses = [],
}: AddSubjectModalProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">library_add</span>
            Thêm môn học có sẵn vào lớp
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chọn các môn học đã có trong chương trình đào tạo để kích hoạt không gian giảng dạy và cây đồ thị tri thức cho lớp.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
{availableCourses.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-xs text-gray-500 dark:text-[#8E918F]">
              Không có môn học khả dụng nào để gán thêm vào lớp này.
            </div>
          ) : (
            availableCourses.map((sub) => {
              const valueKey = sub.id || sub.code;
              const isSelected = selectedCodes.includes(valueKey);
              return (
                <label
                  key={valueKey}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-none cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#D3E3FD]/40 dark:bg-[#A8C7FA]/20 text-gray-900 dark:text-[#E3E3E3]'
                      : 'bg-[#F0F4F8] dark:bg-[#131314] text-gray-800 dark:text-[#C4C7C5] hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCode(valueKey)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm">
                        {sub.name}
                      </div>
                      <div className="text-xs font-mono text-gray-500 dark:text-[#8E918F]">
                        {sub.code} • {sub.credits} tín chỉ
                      </div>

                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={selectedCodes.length === 0}
            onClick={() => onConfirm(selectedCodes)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50"
          >
            Thêm {selectedCodes.length} môn học
          </button>
        </div>
      </div>
    </div>
  );
}

export { InviteMemberModal } from './InviteMemberModal';
export type { InviteMemberModalProps } from './InviteMemberModal';
export { CreateAnnouncementModal } from './CreateAnnouncementModal';
export type {
  CreateAnnouncementModalProps,
  CreateAnnouncementData,
  AttachedFile,
  TargetClassOption,
} from './CreateAnnouncementModal';


interface ToastNotificationProps {
  message: string | null;
}

export function ToastNotification({ message }: ToastNotificationProps) {
  useEffect(() => {
    if (message) {
      const isError =
        message.toLowerCase().includes('lỗi') ||
        message.toLowerCase().includes('không thể') ||
        message.toLowerCase().includes('thất bại');
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    }
  }, [message]);

  return null;
}

export { UploadMaterialModal } from './UploadMaterialModal';

