'use client';

import React, { useState } from 'react';

interface ClassAssignmentsTabProps {
  currentRole: 'student' | 'teacher' | 'owner';
  onToast: (msg: string) => void;
}

export function ClassAssignmentsTab({
  currentRole,
  onToast,
}: ClassAssignmentsTabProps) {
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
      {/* Top Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mr-2">
            Danh sách Bài tập & Lab
          </h2>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tất cả (4)
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('open')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'open'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Đang mở (1)
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'submitted'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Đã nộp (1)
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('graded')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'graded'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Đã chấm điểm (2)
            </button>
          </div>
        </div>

        {/* Teacher Action Controls */}
        {(currentRole === 'teacher' || currentRole === 'owner') && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToast('Đang xuất bảng điểm bài tập ra file CSV (.csv)...')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Xuất bảng điểm CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateAssignmentOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
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
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">assignment_late</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] uppercase font-bold">
                    Còn 2 ngày
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Trọng số: 15% tổng điểm
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Lab 01: Thiết kế sơ đồ địa chỉ IP VLSM và Cấu hình OSPF đơn vùng
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Yêu cầu chia subnet cho doanh nghiệp có 4 chi nhánh, cấu hình loopback và kiểm tra hội tụ bảng định tuyến.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-500">
                Hạn chót: <strong className="text-slate-900 dark:text-slate-100">23:59 • Chủ nhật 27/10</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
              >
                Nộp bài tập
              </button>
            </div>
          </div>

          {/* Graded Assignment with Feedback Rubric */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">task_alt</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                      Đã hoàn thành
                    </span>
                    <span className="text-xs text-slate-400">Nộp ngày 12/10/2024</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Lab 00: Bắt và phân tích gói tin HTTP/DNS bằng Wireshark
                  </h3>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  9.5
                </span>
                <span className="text-base font-semibold text-slate-400">/ 10.0</span>
              </div>
            </div>

            {/* Teacher Rubric Feedback Container */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                <span>Nhận xét chi tiết từ TS. Lê Hoàng Nam:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;Phân tích cờ TCP SYN/ACK và cơ chế giải mã DNS Query rất xuất sắc, chụp ảnh Wireshark rõ ràng có highlight bộ lọc. Điểm trừ nhỏ ở phần giải thích TTL gói tin UDP chưa nêu rõ đơn vị.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* [TEACHER VIEW] Grading Center Table */}
      {(currentRole === 'teacher' || currentRole === 'owner') && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border-[3px] border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                Trung tâm chấm bài: Lab 01 - Phân vùng VLSM (48 Học viên)
              </h3>
              <span className="text-xs text-slate-500">
                Đã nộp: <strong className="text-slate-900 dark:text-slate-100 font-bold">43/48</strong> • Chờ chấm:{' '}
                <strong className="text-amber-600 font-bold">5</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Sinh viên</th>
                    <th className="py-3 px-4">Thời gian nộp</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Điểm</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        TA
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          Trần Anh Tuấn
                        </div>
                        <div className="text-xs text-slate-400 font-mono">21120042@student.edu.vn</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">Hôm nay 08:15</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                        Chờ chấm điểm
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="--"
                        value={studentGrades['21120042'] || ''}
                        onChange={(e) => handleGradeChange('21120042', e.target.value)}
                        className="w-16 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-center font-bold font-mono border border-slate-200 dark:border-slate-700 outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSaveGrade('Trần Anh Tuấn', '21120042')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Chấm bài
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        HM
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          Hoàng Minh Châu
                        </div>
                        <div className="text-xs text-slate-400 font-mono">21120015@student.edu.vn</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">Hôm qua 21:00</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        Đã chấm
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">9.0 / 10</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onToast('Mở bài thi của Hoàng Minh Châu để xem lại')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Xem lại
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                        NL
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          Nguyễn Lê Phong
                        </div>
                        <div className="text-xs text-slate-400 font-mono">21120088@student.edu.vn</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-bold">Chưa nộp</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 text-xs font-bold">
                        Trễ hạn
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-400 font-mono">0 / 10</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onToast('Đã gửi email nhắc nhở nộp bù bài tập tới Nguyễn Lê Phong')
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 font-bold text-xs cursor-pointer"
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

      {/* Submit Assignment Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Nộp bài tập: Lab 01 - VLSM & OSPF
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p>Đính kèm tệp Cisco Packet Tracer (.pkt) hoặc file Báo cáo PDF:</p>
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-blue-600 text-3xl">upload_file</span>
                <span className="font-bold">Kéo thả tệp hoặc bấm vào đây để tải lên</span>
                <span className="text-slate-400 text-[11px]">Hỗ trợ .pkt, .pka, .pdf (Tối đa 25MB)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  onToast('Đã nộp bài tập Lab 01 thành công!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Tạo bài tập / Lab thực hành mới
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateAssignmentOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Tiêu đề bài tập:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lab 02: Bắt gói tin TCP 3-Way Handshake bằng Wireshark..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Mô tả và yêu cầu:</label>
                <textarea
                  rows={3}
                  placeholder="Yêu cầu sinh viên thực hiện, định dạng file nộp..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Trọng số điểm (%):</label>
                  <input
                    type="number"
                    defaultValue={15}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Hạn chót nộp bài:</label>
                  <input
                    type="date"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateAssignmentOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateAssignmentOpen(false);
                  onToast('Đã tạo thành công bài tập mới và mở cho sinh viên nộp bài!');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
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

