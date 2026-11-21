'use client';

import React, { useState, useEffect } from 'react';
import { useClasses } from '@/features/classes/hooks/useClasses';
import type { ClassItem } from '@/features/classes/types';
import { ACADEMIC_SHIFTS } from '../constants';
import { CreateLessonSessionRequest } from '../types';
import { formatDateIso } from '../services/timetable.service';

interface TimetableCreateSessionModalProps {
  isOpen: boolean;
  defaultDate?: string;
  defaultClassId?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateLessonSessionRequest) => void;
}

const PRESET_ROOMS = [
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01', name: 'Phòng B1-204 (Lý thuyết)' },
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a02', name: 'Lab 302 (Thực hành Mạng)' },
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a03', name: 'Lab 402 (Phát triển Phần mềm)' },
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a04', name: 'Lab AI 501 (Trí tuệ Nhân tạo)' },
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a05', name: 'Phòng A2-301 (Giảng đường lớn)' },
  { id: '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a06', name: 'Lab H6-302 (Hệ thống Nhúng)' },
];

export function TimetableCreateSessionModal({
  isOpen,
  defaultDate,
  defaultClassId,
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: TimetableCreateSessionModalProps) {
  const { data: classesData, isLoading: isClassesLoading } = useClasses({ page: 0, size: 50 });
  const classesList: ClassItem[] = classesData?.items ?? [];

  const [classId, setClassId] = useState(defaultClassId || '');
  const [sessionDate, setSessionDate] = useState(defaultDate || formatDateIso(new Date()));
  const [startShift, setStartShift] = useState(1);
  const [endShift, setEndShift] = useState(3);
  const [roomId, setRoomId] = useState(PRESET_ROOMS[0].id);
  const [customRoom, setCustomRoom] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultClassId) setClassId(defaultClassId);
    if (defaultDate) setSessionDate(defaultDate);
  }, [defaultClassId, defaultDate, isOpen]);

  useEffect(() => {
    if (classesList.length > 0 && !classId) {
      setClassId(classesList[0].id);
    }
  }, [classesList, classId]);

  if (!isOpen) return null;

  const startShiftInfo = ACADEMIC_SHIFTS.find((s) => s.shift === startShift);
  const endShiftInfo = ACADEMIC_SHIFTS.find((s) => s.shift === endShift);

  const startTimeStr = startShiftInfo?.timeRange.split(' - ')[0] || '07:00';
  const endTimeStr = endShiftInfo?.timeRange.split(' - ')[1] || '09:40';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!classId) {
      setLocalError('Vui lòng chọn lớp học.');
      return;
    }
    if (!sessionDate) {
      setLocalError('Vui lòng chọn ngày học.');
      return;
    }
    if (endShift < startShift) {
      setLocalError('Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu.');
      return;
    }

    const selectedClass = classesList.find((c: ClassItem) => c.id === classId);
    const effectiveRoomName =
      roomId === 'custom' ? customRoom.trim() : PRESET_ROOMS.find((r) => r.id === roomId)?.name;

    if (roomId === 'custom' && !customRoom.trim()) {
      setLocalError('Vui lòng nhập tên phòng học.');
      return;
    }

    const payload: CreateLessonSessionRequest = {
      classId,
      sessionDate,
      startShift,
      endShift,
      startTime: `${startTimeStr}:00`,
      endTime: `${endTimeStr}:00`,
      roomId: roomId === 'custom' ? customRoom.trim() : roomId,
      roomName: effectiveRoomName,
      courseId: (selectedClass as unknown as { subjectCode?: string })?.subjectCode || undefined,
      note: note.trim() || undefined,
    };

    onSubmit(payload);
  };

  const activeError = errorMessage || localError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1E1F20] rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-[#E3E3E3] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] dark:bg-[#162B4D] text-[#041E49] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#E3E3E3]">
                Thêm ca học mới
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#C4C7C5]">
                Tạo lịch buổi học hoặc ca dạy bù vào thời khóa biểu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Conflict / Error Banner */}
        {activeError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0 mt-0.5">
              warning
            </span>
            <div className="leading-relaxed font-medium">
              {activeError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Class selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-[#C4C7C5] block">
              Lớp học áp dụng <span className="text-rose-500">*</span>
            </label>
            {isClassesLoading ? (
              <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] font-medium text-xs outline-none focus:ring-2 focus:ring-[#0B57D0]"
              >
                {classesList.map((cls: ClassItem) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code || (cls as unknown as { subjectCode?: string }).subjectCode || 'Lớp'})
                  </option>
                ))}
                {classesList.length === 0 && (
                  <option value="CNTT-K21A">Lớp Công nghệ Thông tin K21A (CNTT-K21A)</option>
                )}
              </select>
            )}
          </div>

          {/* Session Date */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-[#C4C7C5] block">
              Ngày học <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] font-medium text-xs outline-none focus:ring-2 focus:ring-[#0B57D0]"
            />
          </div>

          {/* Shifts (StartShift -> EndShift) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-[#C4C7C5] block">
                Tiết bắt đầu
              </label>
              <select
                value={startShift}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setStartShift(val);
                  if (endShift < val) setEndShift(val);
                }}
                className="w-full h-10 px-3 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] font-medium text-xs outline-none"
              >
                {ACADEMIC_SHIFTS.map((s) => (
                  <option key={`start-${s.shift}`} value={s.shift}>
                    Tiết {s.shift} ({s.timeRange.split(' - ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-[#C4C7C5] block">
                Tiết kết thúc
              </label>
              <select
                value={endShift}
                onChange={(e) => setEndShift(parseInt(e.target.value, 10))}
                className="w-full h-10 px-3 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] font-medium text-xs outline-none"
              >
                {ACADEMIC_SHIFTS.filter((s) => s.shift >= startShift).map((s) => (
                  <option key={`end-${s.shift}`} value={s.shift}>
                    Tiết {s.shift} ({s.timeRange.split(' - ')[1]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time range info preview */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#D3E3FD]/50 dark:bg-[#162B4D]/60 text-[11px] text-[#041E49] dark:text-[#A8C7FA] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Khung giờ ca học:</span>
            </span>
            <span className="font-bold">
              {startTimeStr} — {endTimeStr} ({endShift - startShift + 1} tiết)
            </span>
          </div>

          {/* Room selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-[#C4C7C5] block">
              Phòng học <span className="text-rose-500">*</span>
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] font-medium text-xs outline-none"
            >
              {PRESET_ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
              <option value="custom">Nhập tên phòng khác...</option>
            </select>
            {roomId === 'custom' && (
              <input
                type="text"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                placeholder="Ví dụ: Phòng C1-102, Hội trường lớn..."
                className="w-full h-9 px-3 mt-1.5 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] text-xs outline-none"
              />
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-[#C4C7C5] block">
              Ghi chú nội dung ca học
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Dạy bù tuần trước, Kiểm tra 15 phút, Thực hành Lab..."
              className="w-full h-10 px-3 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] border-none text-slate-900 dark:text-[#E3E3E3] font-medium text-xs outline-none focus:ring-2 focus:ring-[#0B57D0]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-[#C4C7C5] hover:bg-slate-100 dark:hover:bg-[#282A2C] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0B57D0] hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Đang tạo ca học...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Tạo ca học</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
