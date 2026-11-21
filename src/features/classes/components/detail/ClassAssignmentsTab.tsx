'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type {
  GradebookStudent,
  GradebookAiAnalysis,
} from '../../schemas/class-detail.schema';
import { ClassGradebookTab } from './ClassGradebookTab';

interface ClassAssignmentsTabProps {
  currentRole: 'student' | 'teacher' | 'owner';
  onToast: (msg: string) => void;
  gradebookStudents?: GradebookStudent[];
  gradebookAi?: GradebookAiAnalysis;
  onSendAiSuggestion?: () => void;
  onInterveneClick?: (student: GradebookStudent) => void;
  initialSubTab?: 'assignments' | 'gradebook';
}

export function ClassAssignmentsTab({
  currentRole,
  onToast,
  gradebookStudents = [],
  gradebookAi = {
    averageScore: 8.4,
    ploPassRate: 88,
    ploPassedCount: 42,
    totalStudents: 48,
    gradingProgress: '48/48',
    gradingPercent: 100,
    earlyInterventionCount: 3,
    distribution: {
      gradeA: { percent: 28, count: 12 },
      gradeB: { percent: 45, count: 19 },
      gradeC: { percent: 20, count: 8 },
      gradeDF: { percent: 7, count: 3 },
    },
    recommendedTopic: 'Cây phân đoạn & Dijkstra',
    recommendedDescription: 'Phổ điểm lớp tập trung ở dải Giỏi/Khá.',
  },
  onSendAiSuggestion = () => { },
  onInterveneClick = () => { },
  initialSubTab = 'assignments',
}: ClassAssignmentsTabProps) {
  const [subView, setSubView] = useState<'assignments' | 'gradebook'>(initialSubTab);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'submitted' | 'graded'>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);

  // Teacher grading simulation state
  const [studentGrades, setStudentGrades] = useState<{ [key: string]: string }>({
    '21120042': '',
  });

  const handleGradeChange = (studentCode: string, val: string) => {
    setStudentGrades((prev) => ({ ...prev, [studentCode]: val }));
  };

  const handleSaveGrade = (studentName: string, studentCode: string) => {
    const score = studentGrades[studentCode];
    if (!score) {
      onToast(`Vui lòng nhập điểm số cho sinh viên ${studentName}!`);
      return;
    }
    onToast(`Đã lưu điểm ${score}/10 cho sinh viên ${studentName} (${studentCode})!`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. SUB-VIEW SWITCHER: BÀI TẬP & LAB vs BẢNG ĐIỂM & PLO */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] overflow-x-auto flex-nowrap max-w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
          <button
            type="button"
            onClick={() => setSubView('assignments')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border-none shrink-0 whitespace-nowrap ${subView === 'assignments'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
          >
            <span className="material-symbols-outlined text-[19px]">assignment</span>
            <span>Danh sách Bài tập &amp; Lab</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${subView === 'assignments'
                  ? 'bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5]'
                  : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-[#C4C7C5]'
                }`}
            >
              4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('gradebook')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border-none shrink-0 whitespace-nowrap ${subView === 'gradebook'
                ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900 dark:hover:text-[#E3E3E3]'
              }`}
          >
            <span className="material-symbols-outlined text-[19px]">fact_check</span>
            <span>Bảng điểm &amp; Ma trận PLO</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${subView === 'gradebook'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-black/5 dark:bg-white/10 text-gray-600 dark:text-[#C4C7C5]'
                }`}
            >
              ABET
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/assignments"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] text-xs font-semibold hover:opacity-85 transition-opacity cursor-pointer border-none"
            title="Mở toàn màn hình Ma trận Phân bổ Đề thi & Bài tập Lớp - Môn (N : N)"
          >
            <span className="material-symbols-outlined text-[17px]">table_chart</span>
            <span>Ma trận Lớp - Môn (N:N)</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
          <div className="text-xs text-gray-500 dark:text-[#8E918F] hidden lg:flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đánh giá Chuẩn đầu ra tự động</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-VIEW: GRADEBOOK & PLO MATRIX */}
      {subView === 'gradebook' ? (
        <ClassGradebookTab
          students={gradebookStudents}
          aiAnalysis={gradebookAi}
          onSendAiSuggestion={onSendAiSuggestion}
          onInterveneClick={onInterveneClick}
          onToast={onToast}
        />
      ) : (
        /* 3. SUB-VIEW: ASSIGNMENTS & LAB WORKSPACE */
        <div className="flex flex-col gap-6">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mr-2">
                Danh sách Bài tập &amp; Lab
              </h2>
              <div className="flex items-center gap-1 bg-[#E1E5EA] dark:bg-[#282A2C] p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${filterStatus === 'all'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                    }`}
                >
                  Tất cả (4)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('open')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${filterStatus === 'open'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                    }`}
                >
                  Đang mở (1)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('submitted')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${filterStatus === 'submitted'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                    }`}
                >
                  Đã nộp (1)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('graded')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border-none ${filterStatus === 'graded'
                      ? 'bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-[#E3E3E3] shadow-xs'
                      : 'text-gray-600 dark:text-[#C4C7C5] hover:text-gray-900'
                    }`}
                >
                  Đã chấm điểm (2)
                </button>
              </div>
            </div>

            {/* Right actions */}
            {currentRole !== 'student' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToast('Đang tạo và tải xuống bảng điểm CSV tổng hợp...')}
                  className="px-4 py-2 rounded-full text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Xuất bảng điểm CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateAssignmentOpen(true)}
                  className="px-5 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>+ Tạo bài tập mới</span>
                </button>
              </div>
            )}
          </div>

          {/* [STUDENT VIEW] Assignments Cards */}
          {currentRole === 'student' && (
            <div className="flex flex-col gap-5">
              {/* Active Assignment */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">assignment_late</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-[11px] uppercase font-bold">
                        Còn 2 ngày
                      </span>
                      <span className="text-xs text-gray-500 dark:text-[#8E918F] font-semibold">
                        Trọng số: 15% tổng điểm
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mt-1">
                      Lab 01: Thiết kế sơ đồ địa chỉ IP VLSM và Cấu hình OSPF đơn vùng
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-[#C4C7C5] mt-1 leading-relaxed">
                      Yêu cầu chia subnet cho doanh nghiệp có 4 chi nhánh, cấu hình loopback và kiểm tra hội tụ bảng định tuyến.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                  <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Hạn chót: <strong className="text-gray-900 dark:text-[#E3E3E3]">23:59 • Chủ nhật 27/10</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="w-full md:w-auto px-6 py-2.5 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all cursor-pointer border-none shadow-xs"
                  >
                    Nộp bài tập
                  </button>
                </div>
              </div>

              {/* Graded Assignment with Feedback Rubric */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px]">task_alt</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                          Đã hoàn thành
                        </span>
                        <span className="text-xs text-gray-400 dark:text-[#8E918F]">Nộp ngày 12/10/2024</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mt-1">
                        Lab 00: Bắt và phân tích gói tin HTTP/DNS bằng Wireshark
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      9.5
                    </span>
                    <span className="text-base font-semibold text-gray-400 dark:text-[#8E918F]">/ 10.0</span>
                  </div>
                </div>

                {/* Teacher Rubric Feedback Container */}
                <div className="p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] border-none flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-[#A8C7FA] font-bold text-xs">
                    <span className="material-symbols-outlined text-[18px]">rate_review</span>
                    <span>Nhận xét chi tiết từ :</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-[#C4C7C5] italic leading-relaxed">
                    &ldquo;Phân tích cờ TCP SYN/ACK và cơ chế giải mã DNS Query rất xuất sắc, chụp ảnh Wireshark rõ ràng có highlight bộ lọc. Điểm trừ nhỏ ở phần giải thích TTL gói tin UDP chưa nêu rõ đơn vị.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* [TEACHER VIEW] Grading Center Table */}
          {(currentRole === 'teacher' || currentRole === 'owner') && (
            <div className="flex flex-col gap-5">
              <div className="rounded-3xl bg-white dark:bg-[#1E1F20] shadow-sm dark:shadow-none border-none overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 flex-wrap gap-2">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-[#E3E3E3]">
                    Trung tâm chấm bài: Lab 01 - Phân vùng VLSM (48 Học viên)
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-[#8E918F]">
                    Đã nộp: <strong className="text-gray-900 dark:text-[#E3E3E3] font-bold">43/48</strong> • Chờ chấm:{' '}
                    <strong className="text-amber-600 font-bold">5</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-[#F0F4F8] dark:bg-[#131314] text-[11px] font-semibold text-gray-500 dark:text-[#8E918F] uppercase tracking-wider border-none select-none">
                      <tr>
                        <th className="py-4 px-6 min-w-[260px] align-middle">Sinh viên</th>
                        <th className="py-4 px-6 w-[170px] min-w-[140px] align-middle whitespace-nowrap">Thời gian nộp</th>
                        <th className="py-4 px-6 w-[160px] min-w-[130px] align-middle whitespace-nowrap">Trạng thái</th>
                        <th className="py-4 px-6 w-[130px] min-w-[100px] align-middle whitespace-nowrap">Điểm</th>
                        <th className="py-4 px-6 w-[150px] text-right align-middle whitespace-nowrap">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="font-medium border-none">
                      {/* Row 1 */}
                      <tr className="hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors border-none">
                        <td className="py-5 px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] text-gray-800 dark:text-[#C4C7C5] flex items-center justify-center font-bold text-xs shrink-0">
                              TA
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm">
                                Trần Anh Tuấn
                              </div>
                              <div className="text-xs text-gray-500 dark:text-[#8E918F] font-mono truncate">21120042@student.edu.vn</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-gray-700 dark:text-[#C4C7C5] align-middle whitespace-nowrap">Hôm nay 08:15</td>
                        <td className="py-5 px-6 align-middle whitespace-nowrap">
                          <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-[#2E1F00] text-amber-800 dark:text-[#FFB784] text-xs font-semibold">
                            Chờ chấm điểm
                          </span>
                        </td>
                        <td className="py-5 px-6 align-middle whitespace-nowrap">
                          <input
                            type="number"
                            step="0.5"
                            placeholder="--"
                            value={studentGrades['21120042'] || ''}
                            onChange={(e) => handleGradeChange('21120042', e.target.value)}
                            className="w-16 p-2 bg-[#F0F4F8] dark:bg-[#131314] rounded-xl text-center font-semibold text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                          />
                        </td>
                        <td className="py-5 px-6 text-right align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSaveGrade('Trần Anh Tuấn', '21120042')}
                            className="px-5 py-2 rounded-full bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 font-semibold text-xs transition-all cursor-pointer border-none shadow-xs whitespace-nowrap"
                          >
                            Chấm bài
                          </button>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors border-none">
                        <td className="py-5 px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] flex items-center justify-center font-bold text-xs shrink-0">
                              HM
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm">
                                Hoàng Minh Châu
                              </div>
                              <div className="text-xs text-gray-500 dark:text-[#8E918F] font-mono truncate">21120015@student.edu.vn</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-gray-700 dark:text-[#C4C7C5] align-middle whitespace-nowrap">Hôm qua 21:00</td>
                        <td className="py-5 px-6 align-middle whitespace-nowrap">
                          <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#142E20] text-emerald-800 dark:text-[#81C995] text-xs font-semibold">
                            Đã chấm
                          </span>
                        </td>
                        <td className="py-5 px-6 font-bold text-emerald-600 dark:text-[#81C995] align-middle whitespace-nowrap">9.0 / 10</td>
                        <td className="py-5 px-6 text-right align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onToast('Mở bài thi của Hoàng Minh Châu để xem lại')}
                            className="px-4 py-2 rounded-full bg-transparent text-gray-700 dark:text-[#C4C7C5] hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer border-none transition-colors whitespace-nowrap"
                          >
                            Xem lại
                          </button>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors border-none">
                        <td className="py-5 px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-[#3C1919] text-red-800 dark:text-[#F28B82] flex items-center justify-center font-bold text-xs shrink-0">
                              NL
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-[#E3E3E3] text-sm">
                                Nguyễn Lê Phong
                              </div>
                              <div className="text-xs text-gray-500 dark:text-[#8E918F] font-mono truncate">21120088@student.edu.vn</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-red-700 dark:text-[#F28B82] font-semibold align-middle whitespace-nowrap">Chưa nộp</td>
                        <td className="py-5 px-6 align-middle whitespace-nowrap">
                          <span className="whitespace-nowrap inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-[#3C1919] text-red-800 dark:text-[#F28B82] text-xs font-semibold">
                            Trễ hạn
                          </span>
                        </td>
                        <td className="py-5 px-6 font-semibold text-gray-400 dark:text-[#8E918F] align-middle whitespace-nowrap">0 / 10</td>
                        <td className="py-5 px-6 text-right align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              onToast('Đã gửi email nhắc nhở nộp bù bài tập tới Nguyễn Lê Phong')
                            }
                            className="px-4 py-2 rounded-full bg-red-100 dark:bg-[#F2B8B5] text-red-900 dark:text-[#601410] hover:brightness-95 font-semibold text-xs cursor-pointer border-none transition-all whitespace-nowrap"
                          >
                            Gửi mail nhắc
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-3xl shadow-xl p-6 space-y-4 border-none">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <h3 className="font-semibold text-base text-gray-900 dark:text-[#E3E3E3]">
                Nộp bài tập: Lab 01 - VLSM &amp; OSPF
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-[#C4C7C5]">
              <p>Đính kèm tệp Cisco Packet Tracer (.pkt) hoặc file Báo cáo PDF:</p>
              {/* Flat tonal dropzone without dashed border */}
              <div className="p-8 bg-[#F0F4F8] dark:bg-[#131314] rounded-2xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity border-none">
                <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA] text-3xl">upload_file</span>
                <span className="font-semibold text-gray-900 dark:text-[#E3E3E3]">Kéo thả tệp hoặc bấm vào đây để tải lên</span>
                <span className="text-gray-500 dark:text-[#8E918F] text-[11px]">Hỗ trợ .pkt, .pka, .pdf (Tối đa 25MB)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] px-5 py-2 rounded-full text-xs font-semibold cursor-pointer border-none bg-transparent transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  onToast('Đã nộp bài tập Lab 01 thành công!');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 cursor-pointer border-none shadow-xs transition-all"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal (Teacher) */}
      {isCreateAssignmentOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-3xl shadow-xl p-6 space-y-4 border-none">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <h3 className="font-semibold text-base text-gray-900 dark:text-[#E3E3E3]">
                Tạo bài tập / Lab thực hành mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateAssignmentOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium block mb-1 text-gray-700 dark:text-[#C4C7C5]">
                  Tiêu đề bài tập
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lab 02 - Cấu hình VLAN & VTP Trunking..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium block mb-1 text-gray-700 dark:text-[#C4C7C5]">
                    Hạn chót nộp bài
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium block mb-1 text-gray-700 dark:text-[#C4C7C5]">
                    Trọng số điểm (%)
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] border-none outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1 text-gray-700 dark:text-[#C4C7C5]">
                  Mô tả &amp; Hướng dẫn nộp bài
                </label>
                <textarea
                  rows={3}
                  placeholder="Nêu rõ yêu cầu định dạng file (.pkt, .pdf), cấu hình cần kiểm tra..."
                  className="w-full p-4 rounded-2xl bg-[#F0F4F8] dark:bg-[#131314] text-gray-900 dark:text-[#E3E3E3] border-none outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateAssignmentOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#282A2C] cursor-pointer border-none bg-transparent transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateAssignmentOpen(false);
                  onToast('Đã tạo bài tập mới thành công!');
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#D3E3FD] dark:bg-[#A8C7FA] text-[#041E49] dark:text-[#062E6F] hover:brightness-95 cursor-pointer border-none shadow-xs transition-all"
              >
                Tạo bài tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
