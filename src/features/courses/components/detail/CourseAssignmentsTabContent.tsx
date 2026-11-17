'use client';

import React, { useState } from 'react';

interface CourseAssignmentsTabContentProps {
  role: 'student' | 'teacher';
  courseCode?: string;
  showToast?: (msg: string) => void;
}

interface StudentSubmission {
  id: string;
  name: string;
  email: string;
  avatar: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'late';
  score?: number;
}

export function CourseAssignmentsTabContent({
  role,
  courseCode = 'CS-202',
  showToast = () => {},
}: CourseAssignmentsTabContentProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'submitted' | 'graded'>('all');
  const [scores, setScores] = useState<Record<string, number>>({
    'sub-1': 8.5,
  });

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([
    {
      id: 'sub-1',
      name: 'Trần Anh Tuấn',
      email: '21120042@student.edu.vn',
      avatar: 'TA',
      submittedAt: 'Hôm nay 08:15',
      status: 'pending',
    },
    {
      id: 'sub-2',
      name: 'Hoàng Minh Châu',
      email: '21120015@student.edu.vn',
      avatar: 'HM',
      submittedAt: 'Hôm qua 21:00',
      status: 'graded',
      score: 9.0,
    },
    {
      id: 'sub-3',
      name: 'Nguyễn Lê Phong',
      email: '21120088@student.edu.vn',
      avatar: 'NL',
      submittedAt: 'Chưa nộp',
      status: 'late',
      score: 0,
    },
  ]);

  const handleGrade = (id: string) => {
    const scoreVal = scores[id] ?? 9.0;
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: 'graded', score: scoreVal } : sub))
    );
    showToast(`Đã lưu điểm ${scoreVal}/10 cho sinh viên!`);
  };

  const handleSendReminder = (name: string) => {
    showToast(`Đã gửi email nhắc nhở nộp bài đến sinh viên ${name}`);
  };

  const handleExportCsv = () => {
    showToast('Đang chuẩn bị file CSV bảng điểm môn học...');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm dark:bg-card">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-title-md text-lg font-bold text-foreground">
            Danh sách Bài tập &amp; Lab
          </h2>
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tất cả (4)
            </button>
            <button
              type="button"
              onClick={() => setFilter('open')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                filter === 'open'
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đang mở (1)
            </button>
            <button
              type="button"
              onClick={() => setFilter('submitted')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                filter === 'submitted'
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đã nộp (1)
            </button>
            <button
              type="button"
              onClick={() => setFilter('graded')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                filter === 'graded'
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đã chấm điểm (2)
            </button>
          </div>
        </div>

        {/* Teacher Action Buttons */}
        {role === 'teacher' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span> Xuất bảng
              điểm CSV
            </button>
            <button
              type="button"
              onClick={() => showToast('Mở modal tạo bài tập và thiết lập rubric')}
              className="flex items-center gap-1 rounded-lg bg-[#0059bb] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#004bb0]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span> + Tạo bài tập mới
            </button>
          </div>
        )}
      </div>

      {/* STUDENT VIEW */}
      {role === 'student' ? (
        <div className="flex flex-col gap-4">
          {/* Active Assignment */}
          {(filter === 'all' || filter === 'open') && (
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-red-200/60 bg-card p-5 shadow-sm dark:border-red-900/30 md:flex-row md:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  <span className="material-symbols-outlined text-[28px]">assignment_late</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                      Còn 2 ngày
                    </span>
                    <span className="text-xs text-muted-foreground">Trọng số: 15% tổng điểm</span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    Lab 01: Thiết kế sơ đồ địa chỉ IP VLSM và Cấu hình OSPF đơn vùng
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Yêu cầu chia subnet cho doanh nghiệp có 4 chi nhánh, cấu hình loopback và kiểm
                    tra hội tụ bảng định tuyến.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <span className="text-xs text-muted-foreground">
                  Hạn chót: <strong>23:59 • Chủ nhật 27/10</strong>
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Đã nộp bài tập Lab 01 thành công!')}
                  className="rounded-lg bg-[#0059bb] px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#004bb0]"
                >
                  Nộp bài tập
                </button>
              </div>
            </div>
          )}

          {/* Graded Assignment with Feedback Rubric */}
          {(filter === 'all' || filter === 'submitted' || filter === 'graded') && (
            <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[28px]">task_alt</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Đã hoàn thành
                      </span>
                      <span className="text-xs text-muted-foreground">Nộp ngày 12/10/2024</span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-foreground">
                      Lab 00: Bắt và phân tích gói tin HTTP/DNS bằng Wireshark
                    </h3>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    9.5
                  </span>
                  <span className="text-sm text-muted-foreground">/ 10.0</span>
                </div>
              </div>

              {/* Teacher Rubric Feedback Container */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/30 p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0059bb] dark:text-blue-400">
                  <span className="material-symbols-outlined text-[18px]">rate_review</span>
                  <span>Nhận xét chi tiết từ TS. Lê Hoàng Nam:</span>
                </div>
                <p className="text-xs italic text-foreground/90">
                  &ldquo;Phân tích cờ TCP SYN/ACK và cơ chế giải mã DNS Query rất xuất sắc, chụp ảnh
                  Wireshark rõ ràng có highlight bộ lọc. Điểm trừ nhỏ ở phần giải thích TTL gói tin
                  UDP chưa nêu rõ đơn vị.&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TEACHER VIEW - Grading Center Table */
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 p-4">
              <h3 className="text-sm font-bold text-foreground">
                Trung tâm chấm bài: Lab 01 - Phân vùng VLSM (48 Học viên - {courseCode})
              </h3>
              <span className="text-xs text-muted-foreground">
                Đã nộp: <strong>43/48</strong> • Chờ chấm:{' '}
                <strong className="text-amber-600 dark:text-amber-400">
                  {submissions.filter((s) => s.status === 'pending').length}
                </strong>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/60 text-[11px] font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Sinh viên</th>
                    <th className="px-4 py-3">Thời gian nộp</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Điểm số</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0059bb] dark:bg-blue-950/60 dark:text-blue-300">
                            {sub.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{sub.name}</div>
                            <div className="text-[11px] text-muted-foreground">{sub.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{sub.submittedAt}</td>
                      <td className="px-4 py-3">
                        {sub.status === 'pending' && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Chờ chấm điểm
                          </span>
                        )}
                        {sub.status === 'graded' && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Đã chấm
                          </span>
                        )}
                        {sub.status === 'late' && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 dark:bg-red-950/60 dark:text-red-300">
                            Trễ hạn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sub.status === 'pending' ? (
                          <input
                            type="number"
                            step="0.5"
                            placeholder="--"
                            value={scores[sub.id] ?? ''}
                            onChange={(e) =>
                              setScores((prev) => ({
                                ...prev,
                                [sub.id]: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-16 rounded border border-border bg-muted/40 p-1 text-center font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        ) : (
                          <span
                            className={`font-bold ${
                              sub.status === 'graded'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {sub.score !== undefined ? `${sub.score} / 10` : '--'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sub.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleGrade(sub.id)}
                            className="rounded bg-[#0059bb] px-3 py-1 font-semibold text-white shadow-xs hover:bg-[#004bb0]"
                          >
                            Chấm bài
                          </button>
                        ) : sub.status === 'late' ? (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(sub.name)}
                            className="rounded border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                          >
                            Gửi mail nhắc
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => showToast(`Xem lại bài nộp của ${sub.name}`)}
                            className="rounded border border-border bg-muted/40 px-3 py-1 text-foreground hover:bg-muted"
                          >
                            Xem lại
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
