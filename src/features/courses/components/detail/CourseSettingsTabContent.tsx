'use client';

import React, { useState } from 'react';

interface CourseSettingsTabContentProps {
  courseCode?: string;
  courseTitle?: string;
  showToast?: (msg: string) => void;
}

export function CourseSettingsTabContent({
  courseCode = 'CS-202',
  courseTitle = 'Mạng máy tính & Truyền thông dữ liệu',
  showToast = () => {},
}: CourseSettingsTabContentProps) {
  const [enrollmentCode, setEnrollmentCode] = useState('CS202-NET-AUTUMN24');
  const [allowStudentPost, setAllowStudentPost] = useState(true);
  const [enableAiTutor, setEnableAiTutor] = useState(true);
  const [showClassStats, setShowClassStats] = useState(false);

  const handleGenerateNewCode = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `CS202-NET-${randomSuffix}`;
    setEnrollmentCode(newCode);
    showToast(`Đã tạo mã ghi danh mới: ${newCode}`);
  };

  const handleSaveChanges = () => {
    showToast('Đã lưu cấu hình học phần và cập nhật quyền hạn thành công!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div>
          <h2 className="font-title-md text-lg font-bold text-foreground">
            Cài đặt học phần &amp; Bảng tổng kết dữ liệu học tập
          </h2>
          <p className="text-xs text-muted-foreground">
            Dành riêng cho Ban giảng huấn môn {courseTitle} ({courseCode}).
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveChanges}
          className="rounded-lg bg-[#0059bb] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#004bb0]"
        >
          Lưu thay đổi
        </button>
      </div>

      {/* Analytic Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tỷ lệ hoàn thành môn
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0059bb] dark:text-blue-400">84.2%</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-[16px]">trending_up</span> +5.4% so với
            kỳ trước
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Điểm TB Lớp học
          </div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            8.12
            <span className="text-xs font-normal text-muted-foreground"> / 10</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Chuẩn đầu ra loại Giỏi/Khá</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Lượt hỏi AI Tutor
          </div>
          <div className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-400">1,420</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Chủ đề: Subnetting &amp; OSPF</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sinh viên cần hỗ trợ
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">3 SV</div>
          <div className="mt-1 text-[11px] text-red-600 dark:text-red-400">
            Chưa nộp bài &lt;50% tiến độ
          </div>
        </div>
      </div>

      {/* Grade Distribution Gaussian SVG & Course Configuration Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Grade Distribution Chart */}
        <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Phổ điểm phân phối môn học (Gaussian)
              </h3>
              <p className="text-xs text-muted-foreground">Phân bố điểm quá trình &amp; thi giữa kỳ</p>
            </div>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-[#0059bb] dark:bg-blue-950/60 dark:text-blue-300">
              N=48 SV
            </span>
          </div>

          {/* Inline Gaussian Distribution SVG Chart */}
          <div className="relative h-44 w-full py-2">
            <svg
              className="h-full w-full text-[#0059bb] dark:text-blue-400"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 400 160"
            >
              {/* Grid lines */}
              <line stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" x1="0" x2="400" y1="140" y2="140" />
              <line
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeDasharray="4 4"
                x1="0"
                x2="400"
                y1="90"
                y2="90"
              />
              <line
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeDasharray="4 4"
                x1="0"
                x2="400"
                y1="40"
                y2="40"
              />
              {/* Gaussian Bell Curve Area */}
              <path
                d="M 10 140 C 90 140, 110 135, 150 95 C 190 55, 210 20, 240 20 C 270 20, 290 55, 330 95 C 370 135, 380 140, 395 140 Z"
                fill="currentColor"
                fillOpacity="0.15"
              />
              {/* Gaussian Bell Curve Stroke */}
              <path
                d="M 10 140 C 90 140, 110 135, 150 95 C 190 55, 210 20, 240 20 C 270 20, 290 55, 330 95 C 370 135, 380 140, 395 140"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {/* Peak Indicator */}
              <circle cx="240" cy="20" fill="#0059bb" r="5" />
            </svg>
            <div className="absolute left-[58%] top-2 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[11px] font-bold text-[#0059bb] shadow-xs dark:text-blue-400">
              Đỉnh: 8.5 Điểm
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 text-center text-xs sm:grid-cols-4">
            <div className="rounded border border-border/60 bg-muted/40 p-1.5">
              <span className="font-bold text-foreground">Điểm F (&lt;5):</span>{' '}
              <span className="text-muted-foreground">2 SV (4%)</span>
            </div>
            <div className="rounded border border-border/60 bg-muted/40 p-1.5">
              <span className="font-bold text-foreground">Điểm C (5-6.9):</span>{' '}
              <span className="text-muted-foreground">7 SV (15%)</span>
            </div>
            <div className="rounded border border-border/60 bg-muted/40 p-1.5">
              <span className="font-bold text-foreground">Điểm B (7-8.4):</span>{' '}
              <span className="text-muted-foreground">25 SV (52%)</span>
            </div>
            <div className="rounded border border-border/60 bg-muted/40 p-1.5">
              <span className="font-bold text-foreground">Điểm A (&gt;8.5):</span>{' '}
              <span className="text-muted-foreground">14 SV (29%)</span>
            </div>
          </div>
        </div>

        {/* Class Settings Configuration */}
        <div className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground">
              Cấu hình &amp; Phân quyền sinh viên
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Mã tự ghi danh (Enrollment Code)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={enrollmentCode}
                    className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-xs font-bold text-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateNewCode}
                    className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-[#0059bb] hover:bg-muted dark:text-blue-400"
                  >
                    Tạo mã mới
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allowStudentPost}
                    onChange={(e) => setAllowStudentPost(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0059bb] focus:ring-0"
                  />
                  <span className="text-xs text-foreground">
                    Cho phép sinh viên đăng bài và thảo luận tự do trên Bảng tin
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enableAiTutor}
                    onChange={(e) => setEnableAiTutor(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0059bb] focus:ring-0"
                  />
                  <span className="text-xs text-foreground">
                    Kích hoạt trợ lý Socratic AI Tutor tự động giải thích thuật toán
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={showClassStats}
                    onChange={(e) => setShowClassStats(e.target.checked)}
                    className="h-4 w-4 rounded text-[#0059bb] focus:ring-0"
                  />
                  <span className="text-xs text-foreground">
                    Cho phép sinh viên xem điểm trung bình và biểu đồ phổ điểm lớp
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border/50 bg-muted/20 p-3 text-[11px] text-muted-foreground">
            Lưu ý: Mọi thay đổi về phân quyền và mã ghi danh sẽ có hiệu lực ngay lập tức với toàn bộ
            thành viên trong lớp.
          </div>
        </div>
      </div>
    </div>
  );
}
