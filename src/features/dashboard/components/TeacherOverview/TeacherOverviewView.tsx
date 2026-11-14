'use client';

import React, { useState, useEffect } from 'react';
import { TeacherHeroHeader } from './TeacherHeroHeader';
import { TeacherOverviewTopMetrics } from './TeacherOverviewTopMetrics';
import { TeacherTodaySessionsCard } from './TeacherTodaySessionsCard';
import { TeacherAiInsightsCard } from './TeacherAiInsightsCard';
import { TeacherActiveCoursesSection } from './TeacherActiveCoursesSection';
import {
  TeacherAttendanceModal,
  TodaySessionItem,
} from './TeacherAttendanceModal';
import { useTeacherTodaySessions } from '@/features/lesson-sessions';
import { TeacherWeeklyTimetableView } from '@/features/timetable';

interface TeacherOverviewViewProps {
  classNameTitle?: string;
  classCode?: string;
  instructorName?: string;
}

const INITIAL_TEACHER_SESSIONS: TodaySessionItem[] = [
  {
    id: 'SES-2024-B1-08',
    timeSlot: '07:30 - 09:30',
    subjectTitle: 'Cấu trúc Dữ liệu & Giải thuật',
    subjectCode: 'CS-202',
    roomName: 'Phòng B1-204',
    studentsCount: 45,
    classId: 'CNTT-K21A',
    status: 'IN_PROGRESS',
    attendedCount: 42,
  },
  {
    id: 'SES-2024-B1-09',
    timeSlot: '09:45 - 11:45',
    subjectTitle: 'Thiết kế & Đánh giá Giải thuật',
    subjectCode: 'CS-301',
    roomName: 'Phòng A2-301',
    studentsCount: 45,
    classId: 'CNTT-K21B',
    status: 'IN_PROGRESS',
    attendedCount: 30,
  },
  {
    id: 'SES-2024-B1-07',
    timeSlot: '13:30 - 15:30',
    subjectTitle: 'Lập trình Web nâng cao',
    subjectCode: 'IT-101',
    roomName: 'Lab AI 4.0',
    studentsCount: 45,
    classId: 'CNTT-K21A',
    status: 'COMPLETED',
    attendedCount: 45,
  },
];

export function TeacherOverviewView({
  instructorName = 'TS. Nguyễn Văn An',
}: TeacherOverviewViewProps) {
  const { data: serverSessions } = useTeacherTodaySessions();
  const [sessions, setSessions] = useState<TodaySessionItem[]>(INITIAL_TEACHER_SESSIONS);
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] =
    useState<TodaySessionItem | null>(null);
  const [isViewingWeeklyTimetable, setIsViewingWeeklyTimetable] = useState(false);

  // Sync sessions when server data is loaded or changes
  useEffect(() => {
    if (serverSessions && serverSessions.length > 0) {
      setSessions(serverSessions);
    }
  }, [serverSessions]);

  // Sync sessions status from localStorage on mount (for offline/demo persistence)
  useEffect(() => {
    setSessions((prev) =>
      prev.map((sess) => {
        try {
          const raw = localStorage.getItem(`ilms_edupulse_attendance_v6_${sess.id}`);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const checked = list.filter((a) => a.status !== null && a.status !== undefined).length;
              const total = list.length || sess.studentsCount;
              const determinedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' =
                checked >= total && total > 0
                  ? 'COMPLETED'
                  : checked > 0
                  ? 'IN_PROGRESS'
                  : 'SCHEDULED';
              return {
                ...sess,
                attendedCount: checked,
                studentsCount: total,
                status: determinedStatus,
              };
            }
          }
        } catch {
          // ignore
        }
        return sess;
      })
    );
  }, []);

  const handleAttendanceUpdated = (
    sessionId: string,
    checkedCount: number,
    totalCount: number,
    status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED'
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              attendedCount: checkedCount,
              studentsCount: totalCount,
              status,
            }
          : s
      )
    );
    if (selectedSessionForAttendance?.id === sessionId) {
      setSelectedSessionForAttendance((prev) =>
        prev
          ? {
              ...prev,
              attendedCount: checkedCount,
              studentsCount: totalCount,
              status,
            }
          : null
      );
    }
  };

  if (isViewingWeeklyTimetable) {
    return (
      <div className="w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
        <TeacherWeeklyTimetableView
          userFullName={instructorName}
          onBack={() => setIsViewingWeeklyTimetable(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* 1. Page Header with Title, Term Pills & Quick Actions */}
      <TeacherHeroHeader
        instructorName={instructorName}
        onOpenTimetable={() => setIsViewingWeeklyTimetable(true)}
        onCreateAnnouncement={() => {
          // opens announcement creator
        }}
      />

      {/* 2. Top Metrics Grid (4 Cards: Assigned Classes, Total Students, Pending Grading, Attendance Rate) */}
      <TeacherOverviewTopMetrics />

      {/* 3. Middle Split Section (12 columns: Span 8 Left, Span 4 Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (Span 8) - Thời khóa biểu hôm nay với tích hợp nút Điểm danh */}
        <div className="lg:col-span-8 flex flex-col">
          <TeacherTodaySessionsCard
            sessions={sessions}
            onTakeAttendance={(session) =>
              setSelectedSessionForAttendance(session)
            }
            onViewWeeklyTimetable={() => setIsViewingWeeklyTimetable(true)}
          />
        </div>

        {/* Right (Span 4) - AI Insights & Cảnh báo thích ứng */}
        <div className="lg:col-span-4 flex flex-col">
          <TeacherAiInsightsCard />
        </div>
      </div>

      {/* 4. Bottom Section - Lớp học đang phụ trách (3 Cards Grid) */}
      <TeacherActiveCoursesSection />

      {/* 5. Tích hợp tính năng Điểm danh trực tiếp qua Modal Interactive */}
      <TeacherAttendanceModal
        isOpen={Boolean(selectedSessionForAttendance)}
        session={selectedSessionForAttendance}
        onClose={() => setSelectedSessionForAttendance(null)}
        onAttendanceUpdated={handleAttendanceUpdated}
      />
    </div>
  );
}
