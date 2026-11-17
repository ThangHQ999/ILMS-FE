'use client';

import React, { useState } from 'react';

interface CoursePeopleTabContentProps {
  role: 'student' | 'teacher';
  courseCode?: string;
  membersCount?: number;
  showToast?: (msg: string) => void;
}

interface StudentItem {
  id: string;
  name: string;
  studentId: string;
  avatar: string;
  progress: number;
  group: string;
  avatarBg: string;
}

export function CoursePeopleTabContent({
  role,
  courseCode = 'CS-202',
  membersCount = 48,
  showToast = () => {},
}: CoursePeopleTabContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const students: StudentItem[] = [
    {
      id: 'st-1',
      name: 'An Tuấn Kiệt',
      studentId: '21120101',
      avatar: 'AT',
      progress: 85,
      group: 'Nhóm 04',
      avatarBg: 'bg-muted text-foreground',
    },
    {
      id: 'st-2',
      name: 'Bùi Ngọc Ánh',
      studentId: '21120104',
      avatar: 'BN',
      progress: 92,
      group: 'Nhóm 04',
      avatarBg: 'bg-blue-100 text-[#0059bb] dark:bg-blue-950/60 dark:text-blue-300',
    },
    {
      id: 'st-3',
      name: 'Chu Hoàng Nam',
      studentId: '21120120',
      avatar: 'CH',
      progress: 70,
      group: 'Nhóm 02',
      avatarBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      id: 'st-4',
      name: 'Đặng Văn Khoa',
      studentId: '21120133',
      avatar: 'ĐV',
      progress: 98,
      group: 'Nhóm 01',
      avatarBg: 'bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300',
    },
    {
      id: 'st-5',
      name: 'Hoàng Minh Châu',
      studentId: '21120015',
      avatar: 'HM',
      progress: 90,
      group: 'Nhóm 01',
      avatarBg: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
    },
    {
      id: 'st-6',
      name: 'Trần Anh Tuấn',
      studentId: '21120042',
      avatar: 'TA',
      progress: 82,
      group: 'Nhóm 03',
      avatarBg: 'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300',
    },
    {
      id: 'st-7',
      name: 'Nguyễn Lê Phong',
      studentId: '21120088',
      avatar: 'NL',
      progress: 45,
      group: 'Nhóm 03',
      avatarBg: 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300',
    },
    {
      id: 'st-8',
      name: 'Võ Mai Phương',
      studentId: '21120199',
      avatar: 'VM',
      progress: 88,
      group: 'Nhóm 02',
      avatarBg: 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300',
    },
  ];

  const filteredStudents = students.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.studentId.includes(searchTerm);
    const matchGroup = selectedGroup === 'all' || st.group === selectedGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* People Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div>
          <h2 className="font-title-md text-lg font-bold text-foreground">
            Thành viên lớp {courseCode} ({membersCount} Sinh viên, 2 Cán bộ)
          </h2>
          <p className="text-xs text-muted-foreground">
            Tra cứu danh sách đội ngũ học thuật và bạn cùng lớp.
          </p>
        </div>

        {/* Teacher Member Management Buttons */}
        {role === 'teacher' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Đã chạy thuật toán chia 12 nhóm (4 SV/nhóm) ngẫu nhiên')}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <span className="material-symbols-outlined text-[18px]">group_work</span> Chia nhóm tự
              động (4 SV/nhóm)
            </button>
            <button
              type="button"
              onClick={() => showToast('Mở cửa sổ nhập danh sách sinh viên từ file Excel (.xlsx)')}
              className="flex items-center gap-1 rounded-lg bg-[#0059bb] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#004bb0]"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span> + Thêm sinh
              viên (Excel)
            </button>
          </div>
        )}
      </div>

      {/* Instructors Section */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Đội ngũ Giảng viên &amp; Trợ giảng
        </h3>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0d1c32] text-sm font-bold text-white dark:bg-blue-900">
              LN
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-foreground">TS. Lê Hoàng Nam</h4>
              <p className="text-xs font-semibold text-[#0059bb] dark:text-blue-400">
                Chủ nhiệm học phần
              </p>
              <p className="truncate text-xs text-muted-foreground">namlh@edutech.edu.vn</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0059bb] text-sm font-bold text-white">
              BA
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-foreground">ThS. Nguyễn Bảo Anh</h4>
              <p className="text-xs font-semibold text-muted-foreground">Trợ giảng phụ trách Lab</p>
              <p className="truncate text-xs text-muted-foreground">anhnb@edutech.edu.vn</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-purple-200/60 bg-card p-4 shadow-sm dark:border-purple-900/40">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-900 text-purple-200 dark:bg-purple-950">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-foreground">Socratic AI Copilot</h4>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Trực tuyến 24/7
              </p>
              <p className="truncate text-xs text-muted-foreground">Graph RAG Engine {courseCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Section Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sinh viên trong lớp ({membersCount})
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên, MSSV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="Nhóm 01">Nhóm 01</option>
              <option value="Nhóm 02">Nhóm 02</option>
              <option value="Nhóm 03">Nhóm 03</option>
              <option value="Nhóm 04">Nhóm 04</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              onClick={() => showToast(`Hồ sơ học tập sinh viên: ${st.name} (${st.studentId})`)}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${st.avatarBg}`}
                >
                  {st.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-bold text-foreground">{st.name}</h4>
                  <p className="truncate text-[11px] text-muted-foreground">MSSV: {st.studentId}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                <span>
                  Tiến độ: <strong className="text-foreground">{st.progress}%</strong>
                </span>
                <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                  {st.group}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
