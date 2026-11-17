'use client';

import React, { useState } from 'react';
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
}

export function AddSubjectModal({ isOpen, onClose, onConfirm }: AddSubjectModalProps) {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['CS-205']);
  const availableSubjects = [
    { code: 'CS-205', name: 'Mạng máy tính & An toàn thông tin', credits: 3 },
    { code: 'CS-206', name: 'Hệ điều hành hiện đại', credits: 4 },
    { code: 'CS-207', name: 'Kỹ thuật phần mềm ứng dụng', credits: 3 },
  ];

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
          {availableSubjects.map((sub) => {
            const isSelected = selectedCodes.includes(sub.code);
            return (
              <label
                key={sub.code}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCode(sub.code)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {sub.name}
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      {sub.code} • {sub.credits} tín chỉ
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
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
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-medium border border-slate-700">
        <span className="material-symbols-outlined text-emerald-400 text-[18px]">
          check_circle
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}

export { UploadMaterialModal } from './UploadMaterialModal';

