'use client';

import React, { useState, useEffect } from 'react';
import { deleteClass } from '../../services/class.service';
import { classKeys } from '../../constants';
import { useQueryClient } from '@tanstack/react-query';

export interface PermanentDeleteClassModalProps {
  isOpen: boolean;
  classId: string;
  classNameTitle: string;
  systemCode: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PermanentDeleteClassModal({
  isOpen,
  classId,
  classNameTitle,
  systemCode,
  onClose,
  onSuccess,
}: PermanentDeleteClassModalProps) {
  const queryClient = useQueryClient();
  const [inputCode, setInputCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRiskAccepted, setIsRiskAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset states whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setPassword('');
      setShowPassword(false);
      setIsRiskAccepted(false);
      setIsLoading(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const targetCode = systemCode?.trim() || '';
  const isCodeMatch =
    inputCode.trim().length > 0 &&
    inputCode.trim().toUpperCase() === targetCode.toUpperCase();
  const isFormValid = isCodeMatch && password.trim().length > 0 && isRiskAccepted;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await deleteClass(classId);
      await queryClient.invalidateQueries({ queryKey: classKeys.all });
      onSuccess?.();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          'Không thể xóa lớp học khỏi máy chủ. Vui lòng kiểm tra quyền hạn tài khoản hoặc thử lại sau.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div
      id="delete-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center border-[3px] border-red-200 dark:border-red-900/60 shrink-0">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="delete-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight"
                >
                  Xác nhận xóa vĩnh viễn lớp học?
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/60">
                  Hành động nguy hiểm cấp cao
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ID: {classId}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Đóng modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDelete} className="p-5 sm:p-6 space-y-5">
          {/* Destructive Warning Banner */}
          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border-[3px] border-red-500/40 text-xs text-red-800 dark:text-red-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>Hành động này mang tính hủy diệt và KHÔNG THỂ HOÀN TÁC.</span>
            </div>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              Toàn bộ đồ thị tri thức, kho học liệu, bảng điểm sinh viên, bài nộp và dữ liệu đồng bộ AI Socratic Tutor thuộc lớp{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{classNameTitle}</strong>{' '}
              sẽ bị xóa sạch hoàn toàn khỏi máy chủ đào tạo.
            </p>
          </div>

          {/* Error Message if API fails */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-[2px] border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">report</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Confirm Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Bước 1: Nhập chính xác mã lớp học để xác thực
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Vui lòng nhập{' '}
              <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">
                {targetCode}
              </span>{' '}
              vào ô bên dưới:
            </p>
            <div className="relative mt-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={`Nhập ${targetCode}`}
                disabled={isLoading}
                autoComplete="off"
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono tracking-wider bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-[3px] transition-all outline-none ${
                  isCodeMatch
                    ? 'border-emerald-500 focus:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 focus:border-red-500'
                }`}
              />
              {isCodeMatch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 flex items-center">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
              )}
            </div>
            {isCodeMatch && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                Mã lớp khớp chính xác
              </p>
            )}
          </div>

          {/* Step 2: Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Bước 2: Xác nhận mật khẩu quản trị hoặc tài khoản giảng viên
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu tài khoản của bạn..."
                disabled={isLoading}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-[3px] border-slate-300 dark:border-slate-700 focus:border-red-500 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Step 3: Risk Acceptance Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-[2px] border-slate-200 dark:border-slate-700/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isRiskAccepted}
              onChange={(e) => setIsRiskAccepted(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Tôi hiểu rõ rủi ro và xác nhận xóa toàn bộ dữ liệu lớp học vĩnh viễn khỏi hệ thống đào tạo.
            </span>
          </label>

          {/* Modal Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">
                verified_user
              </span>
              <span>Bảo mật kép xác thực 2 lớp</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ (Esc)
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang xóa vĩnh viễn...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                    <span>Xóa vĩnh viễn lớp học</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
