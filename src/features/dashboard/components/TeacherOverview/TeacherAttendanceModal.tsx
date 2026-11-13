'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  useAttendances,
  useClassStudents,
  useSaveAttendances,
} from '@/features/lesson-sessions/hooks/useLessonSessions';
import { AttendanceStatus } from '@/features/lesson-sessions/types';

export interface TodaySessionItem {
  id: string;
  timeSlot: string;
  subjectTitle: string;
  subjectCode: string;
  roomName: string;
  studentsCount: number;
  classId: string;
  attendedCount?: number;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
}

interface TeacherAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TodaySessionItem | null;
  onAttendanceUpdated?: (
    sessionId: string,
    checkedCount: number,
    totalCount: number,
    status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED'
  ) => void;
}

export function TeacherAttendanceModal({
  isOpen,
  onClose,
  session,
  onAttendanceUpdated,
}: TeacherAttendanceModalProps) {
  const t = useTranslations('dashboard.teacher');
  const classId = session?.classId || 'CNTT-K21A';
  const sessionId = session?.id || 'SES-2024-B1-08';

  const { data: students = [] } = useClassStudents(classId);
  const { data: existingAttendances = [] } = useAttendances(classId, sessionId);
  const saveMutation = useSaveAttendances(classId, sessionId);

  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus | null; note: string }>
  >({});
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || students.length === 0) return;
    const initialMap: Record<string, { status: AttendanceStatus | null; note: string }> = {};

    // Check if there is stored attendance in localStorage first
    let localSaved: Array<{ studentId: string; status: AttendanceStatus | null; note?: string }> = [];
    try {
      const raw = localStorage.getItem(`ilms_edupulse_attendance_v6_${sessionId}`);
      if (raw) {
        localSaved = JSON.parse(raw);
      }
    } catch {
      // ignore
    }

    students.forEach((stu) => {
      const localRec = localSaved.find((a) => a.studentId === stu.studentId);
      const apiRec = existingAttendances.find((a) => a.studentId === stu.studentId);
      const chosen = localRec || apiRec;

      initialMap[stu.studentId] = {
        status: chosen && chosen.status ? (chosen.status as AttendanceStatus) : null,
        note: chosen?.note || '',
      };
    });
    setAttendanceMap(initialMap);
  }, [isOpen, students, existingAttendances, sessionId]);

  if (!isOpen || !session) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId]?.status === status ? null : status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendanceMap((prev) => {
      const next: typeof prev = {};
      students.forEach((s) => {
        next[s.studentId] = {
          status: 'PRESENT',
          note: prev[s.studentId]?.note || '',
        };
      });
      return next;
    });
    showToast('Đã đánh dấu tất cả sinh viên Có mặt!');
  };

  const handleSave = async (isFinal: boolean) => {
    if (!session) return;
    const list = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));

    const checkedCount = list.filter((a) => a.status !== null && a.status !== undefined).length;
    const totalCount = students.length || session.studentsCount || 45;
    const determinedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
      isFinal || (checkedCount >= totalCount && totalCount > 0)
        ? 'COMPLETED'
        : checkedCount > 0
        ? 'IN_PROGRESS'
        : 'SCHEDULED';

    await saveMutation.mutateAsync({
      attendances: list,
      status: determinedStatus,
    });

    onAttendanceUpdated?.(session.id, checkedCount, totalCount, determinedStatus);

    showToast(isFinal ? 'Đã chốt danh sách điểm danh thành công!' : 'Đã lưu nháp bảng điểm danh!');
    if (isFinal) {
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  if (!isOpen || !session) return null;

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const currentStatus = attendanceMap[stu.studentId]?.status;
    if (filterStatus === 'ALL') return true;
    return currentStatus === filterStatus;
  });

  const total = students.length || session.studentsCount;
  const presentCount = Object.values(attendanceMap).filter((a) => a.status === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter((a) => a.status === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter((a) => a.status === 'ABSENT').length;
  const excusedCount = Object.values(attendanceMap).filter((a) => a.status === 'EXCUSED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] border-none shadow-2xl dark:shadow-none ring-0 outline-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-none shadow-none ring-0 outline-none flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#282A2C]/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D3E3FD] dark:bg-[#004A77] text-[#041E49] dark:text-[#C2E7FF] flex items-center justify-center shrink-0 border-none">
              <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-[#E3E3E3]">
                  {session.subjectTitle}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-[#1E1F20] font-mono text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] border-none">
                  {session.subjectCode}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8E918F] mt-0.5">
                {session.timeSlot} • {session.roomName} • {session.studentsCount} sinh viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] flex items-center justify-center transition-colors border-none cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Realtime KPI Bar & Quick Filter */}
        <div className="p-5 border-none shadow-none ring-0 outline-none flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#1E1F20]">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#282A2C] text-gray-800 dark:text-[#E3E3E3] font-semibold border-none">
              Tổng số: {total}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#C4EED0] dark:bg-[#0F5223] text-[#072711] dark:text-[#C4EED0] font-semibold border-none">
              Có mặt: {presentCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FFE7A5] dark:bg-[#523A00] text-[#3E2D00] dark:text-[#FFE7A5] font-semibold border-none">
              Đi muộn: {lateCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FFDAD6] dark:bg-[#93000A]/40 text-[#BA1A1A] dark:text-[#FFB4AB] font-semibold border-none">
              Vắng mặt: {absentCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#3C4043] text-gray-800 dark:text-foreground font-semibold border-none">
              Có phép: {excusedCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-4 py-2 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#004A77] dark:hover:bg-[#005C94] dark:text-[#C2E7FF] font-medium text-xs sm:text-sm whitespace-nowrap transition-colors border-none cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Điểm danh tất cả Có mặt</span>
            </button>
          </div>
        </div>

        {/* Search & Filter row */}
        <div className="px-6 py-3 border-none shadow-none ring-0 outline-none flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-[#282A2C]/30">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã sinh viên..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs sm:text-sm outline-none border border-gray-200 dark:border-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full font-medium transition-colors border-none cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-foreground text-background font-bold'
                    : 'bg-surface-variant text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'ALL'
                  ? 'Tất cả'
                  : st === 'PRESENT'
                  ? 'Có mặt'
                  : st === 'LATE'
                  ? 'Đi muộn'
                  : st === 'ABSENT'
                  ? 'Vắng'
                  : 'Có phép'}
              </button>
            ))}
          </div>
        </div>

        {/* Student list */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-2.5 max-h-[50vh]">
          {filteredStudents.map((stu, index) => {
            const cur = attendanceMap[stu.studentId] || { status: null, note: '' };

            return (
              <div
                key={stu.studentId}
                className="p-3.5 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-none"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-mono text-xs font-bold text-muted-foreground shrink-0 border-none">
                    {index + 1}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground truncate">
                        {stu.studentName}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {stu.studentCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(stu.studentId, 'PRESENT')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border-none cursor-pointer ${
                      cur.status === 'PRESENT'
                        ? 'bg-[#137333] text-white shadow-sm'
                        : 'bg-surface-variant text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Có mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(stu.studentId, 'LATE')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border-none cursor-pointer ${
                      cur.status === 'LATE'
                        ? 'bg-[#B06000] text-white shadow-sm'
                        : 'bg-surface-variant text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Đi muộn
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(stu.studentId, 'ABSENT')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border-none cursor-pointer ${
                      cur.status === 'ABSENT'
                        ? 'bg-[#B3261E] text-white shadow-sm'
                        : 'bg-surface-variant text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Vắng
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(stu.studentId, 'EXCUSED')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border-none cursor-pointer ${
                      cur.status === 'EXCUSED'
                        ? 'bg-[#515F78] text-white shadow-sm'
                        : 'bg-surface-variant text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Có phép
                  </button>

                  <input
                    type="text"
                    value={cur.note}
                    onChange={(e) => handleNoteChange(stu.studentId, e.target.value)}
                    placeholder="Ghi chú..."
                    className="w-24 sm:w-32 px-2.5 py-1 rounded-full bg-white dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] text-xs outline-none border border-gray-200 dark:border-none shadow-none ring-0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-none shadow-none ring-0 outline-none flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#282A2C]/40">
          <div className="text-xs text-gray-500 dark:text-muted-foreground">
            {toastMessage && (
              <span className="text-[#137333] dark:text-[#81C995] font-semibold animate-pulse">
                ✓ {toastMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saveMutation.isPending}
              className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-surface-variant dark:hover:bg-surface-variant/80 text-gray-800 dark:text-foreground font-medium text-xs sm:text-sm transition-colors border-none cursor-pointer whitespace-nowrap"
            >
              Lưu nháp
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saveMutation.isPending}
              className="px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] font-semibold text-xs sm:text-sm transition-colors border-none cursor-pointer whitespace-nowrap shadow-none"
            >
              Chốt ca học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
