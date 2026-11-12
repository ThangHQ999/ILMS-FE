import { ConflictDetails, LessonSession, Room, Student } from './types';

export const lessonSessionKeys = {
  all: ['lesson-sessions'] as const,
  lists: (classId: string) => [...lessonSessionKeys.all, 'list', classId] as const,
  attendances: (classId: string, sessionId: string) =>
    [...lessonSessionKeys.all, 'attendances', classId, sessionId] as const,
  students: (classId: string) => [...lessonSessionKeys.all, 'students', classId] as const,
};

export const EXTERNAL_CONFLICTS: ConflictDetails[] = [
  {
    roomName: 'Lab 402',
    conflictingCourse: 'Lập trình Mobile - CNTT-K20B',
    instructorName: 'TS. Trần Văn Minh',
    timeSlot: '08:00 - 10:30',
    date: '2024-11-20',
    shifts: 'Tiết 2 - 4',
  },
];

export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map((v) => parseInt(v, 10));
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

export function checkTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);
  return aStart < bEnd && aEnd > bStart;
}

export function checkRoomMatch(rA: string, rB: string): boolean {
  if (!rA || !rB) return false;
  const a = rA.toLowerCase().trim();
  const b = rB.toLowerCase().trim();
  return a === b || a.includes(b) || b.includes(a);
}

export const MOCK_ROOMS: Room[] = [
  { roomId: 'Lab 402', roomName: 'Phòng Lab 402 - Tòa nhà Công nghệ', building: 'Tòa Công nghệ', capacity: 50 },
  { roomId: 'Lab 401', roomName: 'Phòng Lab 401 - Tòa nhà Công nghệ', building: 'Tòa Công nghệ', capacity: 50 },
  { roomId: 'Hội trường B2', roomName: 'Hội trường B2 - Tòa Đa Năng', building: 'Tòa Đa Năng', capacity: 80 },
  { roomId: 'P.305-A1', roomName: 'P.305-A1 - Khu Giảng đường A', building: 'Khu A', capacity: 60 },
  { roomId: 'Lab 301', roomName: 'Phòng Lab 301 - Tòa nhà Công nghệ', building: 'Tòa Công nghệ', capacity: 45 },
];

export const MOCK_STUDENTS: Student[] = [
  // 1-10 from HTML template
  { studentId: 'B21DCCN001', studentCode: 'B21DCCN001', studentName: 'Nguyễn Hoàng Long', avatarColor: 'bg-primary-container text-on-primary' },
  { studentId: 'B21DCCN045', studentCode: 'B21DCCN045', studentName: 'Trần Thị Mai Anh', avatarColor: 'bg-amber-500/20 text-amber-700' },
  { studentId: 'B21DCCN102', studentCode: 'B21DCCN102', studentName: 'Lê Quốc Bảo', avatarColor: 'bg-rose-500/20 text-rose-700' },
  { studentId: 'B21DCCN089', studentCode: 'B21DCCN089', studentName: 'Phạm Quỳnh Chi', avatarColor: 'bg-secondary-fixed text-on-secondary-fixed' },
  { studentId: 'B21DCCN120', studentCode: 'B21DCCN120', studentName: 'Đặng Minh Đức', avatarColor: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  { studentId: 'B21DCCN234', studentCode: 'B21DCCN234', studentName: 'Vũ Thu Hương', avatarColor: 'bg-primary-fixed-dim text-on-primary-fixed' },
  { studentId: 'B21DCCN310', studentCode: 'B21DCCN310', studentName: 'Hoàng Gia Huy', avatarColor: 'bg-amber-500/20 text-amber-700' },
  { studentId: 'B21DCCN422', studentCode: 'B21DCCN422', studentName: 'Lâm Bảo Ngọc', avatarColor: 'bg-surface-container-high text-primary' },
  { studentId: 'B21DCCN512', studentCode: 'B21DCCN512', studentName: 'Đỗ Tuấn Kiệt', avatarColor: 'bg-amber-500/20 text-amber-700' },
  { studentId: 'B21DCCN610', studentCode: 'B21DCCN610', studentName: 'Triệu Cẩm Tú', avatarColor: 'bg-tertiary/15 text-tertiary' },

  // 11-20
  { studentId: 'B21DCCN002', studentCode: 'B21DCCN002', studentName: 'Bùi Tuấn Anh', avatarColor: 'bg-blue-500/15 text-secondary' },
  { studentId: 'B21DCCN003', studentCode: 'B21DCCN003', studentName: 'Đỗ Văn Bình', avatarColor: 'bg-emerald-500/15 text-emerald-700' },
  { studentId: 'B21DCCN004', studentCode: 'B21DCCN004', studentName: 'Nguyễn Thị Cúc', avatarColor: 'bg-purple-500/15 text-purple-700' },
  { studentId: 'B21DCCN005', studentCode: 'B21DCCN005', studentName: 'Trần Đình Dũng', avatarColor: 'bg-amber-500/15 text-amber-700' },
  { studentId: 'B21DCCN006', studentCode: 'B21DCCN006', studentName: 'Lê Thùy Dung', avatarColor: 'bg-rose-500/15 text-rose-700' },
  { studentId: 'B21DCCN007', studentCode: 'B21DCCN007', studentName: 'Phạm Đức Duy', avatarColor: 'bg-blue-500/15 text-secondary' },
  { studentId: 'B21DCCN008', studentCode: 'B21DCCN008', studentName: 'Hoàng Hải Đăng', avatarColor: 'bg-cyan-500/15 text-cyan-700' },
  { studentId: 'B21DCCN009', studentCode: 'B21DCCN009', studentName: 'Vũ Thị Hà', avatarColor: 'bg-indigo-500/15 text-indigo-700' },
  { studentId: 'B21DCCN010', studentCode: 'B21DCCN010', studentName: 'Đặng Văn Hậu', avatarColor: 'bg-teal-500/15 text-teal-700' },
  { studentId: 'B21DCCN011', studentCode: 'B21DCCN011', studentName: 'Ngô Quốc Hiếu', avatarColor: 'bg-blue-500/15 text-secondary' },

  // 21-30
  { studentId: 'B21DCCN012', studentCode: 'B21DCCN012', studentName: 'Dương Thị Hoa', avatarColor: 'bg-rose-500/15 text-rose-700' },
  { studentId: 'B21DCCN013', studentCode: 'B21DCCN013', studentName: 'Lý Tuấn Hùng', avatarColor: 'bg-emerald-500/15 text-emerald-700' },
  { studentId: 'B21DCCN014', studentCode: 'B21DCCN014', studentName: 'Mai Thị Huyền', avatarColor: 'bg-purple-500/15 text-purple-700' },
  { studentId: 'B21DCCN015', studentCode: 'B21DCCN015', studentName: 'Trịnh Thế Khang', avatarColor: 'bg-amber-500/15 text-amber-700' },
  { studentId: 'B21DCCN016', studentCode: 'B21DCCN016', studentName: 'Đoàn Trung Kiên', avatarColor: 'bg-blue-500/15 text-secondary' },
  { studentId: 'B21DCCN017', studentCode: 'B21DCCN017', studentName: 'Lương Thị Lan', avatarColor: 'bg-rose-500/15 text-rose-700' },
  { studentId: 'B21DCCN018', studentCode: 'B21DCCN018', studentName: 'Phùng Thành Long', avatarColor: 'bg-cyan-500/15 text-cyan-700' },
  { studentId: 'B21DCCN019', studentCode: 'B21DCCN019', studentName: 'Tạ Thị Ly', avatarColor: 'bg-indigo-500/15 text-indigo-700' },
  { studentId: 'B21DCCN020', studentCode: 'B21DCCN020', studentName: 'Chu Quang Minh', avatarColor: 'bg-teal-500/15 text-teal-700' },
  { studentId: 'B21DCCN021', studentCode: 'B21DCCN021', studentName: 'Nghiêm Trọng Nam', avatarColor: 'bg-blue-500/15 text-secondary' },

  // 31-40
  { studentId: 'B21DCCN022', studentCode: 'B21DCCN022', studentName: 'Tô Thị Nga', avatarColor: 'bg-purple-500/15 text-purple-700' },
  { studentId: 'B21DCCN023', studentCode: 'B21DCCN023', studentName: 'Quách Đình Phong', avatarColor: 'bg-emerald-500/15 text-emerald-700' },
  { studentId: 'B21DCCN024', studentCode: 'B21DCCN024', studentName: 'Ninh Minh Quân', avatarColor: 'bg-blue-500/15 text-secondary' },
  { studentId: 'B21DCCN025', studentCode: 'B21DCCN025', studentName: 'La Thị Quỳnh', avatarColor: 'bg-rose-500/15 text-rose-700' },
  { studentId: 'B21DCCN026', studentCode: 'B21DCCN026', studentName: 'Thái Hồng Sơn', avatarColor: 'bg-amber-500/15 text-amber-700' },
  { studentId: 'B21DCCN027', studentCode: 'B21DCCN027', studentName: 'Diệp Quốc Thắng', avatarColor: 'bg-cyan-500/15 text-cyan-700' },
  { studentId: 'B21DCCN028', studentCode: 'B21DCCN028', studentName: 'Mã Thị Thảo', avatarColor: 'bg-indigo-500/15 text-indigo-700' },
  { studentId: 'B21DCCN029', studentCode: 'B21DCCN029', studentName: 'Liễu Văn Thịnh', avatarColor: 'bg-teal-500/15 text-teal-700' },
  { studentId: 'B21DCCN030', studentCode: 'B21DCCN030', studentName: 'Khổng Đức Toàn', avatarColor: 'bg-blue-500/15 text-secondary' },
  { studentId: 'B21DCCN031', studentCode: 'B21DCCN031', studentName: 'Uông Thị Trang', avatarColor: 'bg-purple-500/15 text-purple-700' },

  // 41-45
  { studentId: 'B21DCCN032', studentCode: 'B21DCCN032', studentName: 'Ân Văn Trung', avatarColor: 'bg-emerald-500/15 text-emerald-700' },
  { studentId: 'B21DCCN033', studentCode: 'B21DCCN033', studentName: 'Biện Thị Uyên', avatarColor: 'bg-rose-500/15 text-rose-700' },
  { studentId: 'B21DCCN034', studentCode: 'B21DCCN034', studentName: 'Cấn Hoàng Việt', avatarColor: 'bg-blue-500/15 text-secondary' },
  { studentId: 'B21DCCN035', studentCode: 'B21DCCN035', studentName: 'Doãn Khánh Vy', avatarColor: 'bg-amber-500/15 text-amber-700' },
  { studentId: 'B21DCCN036', studentCode: 'B21DCCN036', studentName: 'Giáp Văn Xuân', avatarColor: 'bg-cyan-500/15 text-cyan-700' },
];

export const MOCK_INITIAL_LESSON_SESSIONS: LessonSession[] = [
  {
    classId: 'CNTT-K21A',
    lessonSessionId: 'SES-2024-B1-09',
    sessionCode: 'CA-12',
    className: 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)',
    subjectCode: 'INT3306 01',
    sessionDate: '2024-11-18',
    startTime: '07:30',
    endTime: '09:50',
    startShift: 1,
    endShift: 3,
    roomId: 'Lab 402',
    roomName: 'Phòng Lab 402',
    instructorName: 'ThS. Nguyễn Văn An',
    note: 'Thực hành Server Actions & SSR trong Next.js 14. Yêu cầu SV mang theo laptop cài sẵn Node.js 20+',
    status: 'IN_PROGRESS',
    attendedCount: 30,
    totalStudents: 45,
  },
  {
    classId: 'CNTT-K21A',
    lessonSessionId: 'SES-2024-B1-08',
    sessionCode: 'CA-11',
    className: 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)',
    subjectCode: 'INT3306 01',
    sessionDate: '2024-11-15',
    startTime: '07:30',
    endTime: '09:50',
    startShift: 1,
    endShift: 3,
    roomId: 'Lab 402',
    roomName: 'Phòng Lab 402',
    instructorName: 'ThS. Nguyễn Văn An',
    note: 'Kiểm tra giữa kỳ phần 1. Hình thức: Trắc nghiệm và Code test 45 phút',
    status: 'IN_PROGRESS',
    attendedCount: 42,
    totalStudents: 45,
  },
  {
    classId: 'CNTT-K21A',
    lessonSessionId: 'SES-2024-B1-07',
    sessionCode: 'CA-10',
    className: 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)',
    subjectCode: 'INT3306 01',
    sessionDate: '2024-11-11',
    startTime: '07:30',
    endTime: '09:50',
    startShift: 1,
    endShift: 3,
    roomId: 'Hội trường B2',
    roomName: 'Hội trường B2',
    instructorName: 'ThS. Nguyễn Văn An',
    note: 'Workshop kiến trúc Micro-frontends. Diễn giả khách mời: Tech Lead FPT Software',
    status: 'COMPLETED',
    attendedCount: 45,
    totalStudents: 45,
  },
  {
    classId: 'CNTT-K21A',
    lessonSessionId: 'SES-2024-B1-10',
    sessionCode: 'CA-13',
    className: 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)',
    subjectCode: 'INT3306 01',
    sessionDate: '2024-11-22',
    startTime: '07:30',
    endTime: '09:50',
    startShift: 1,
    endShift: 3,
    roomId: 'Lab 402',
    roomName: 'Phòng Lab 402',
    instructorName: 'ThS. Nguyễn Văn An',
    note: 'Báo cáo tiến độ đồ án giai đoạn 1. Mỗi nhóm 7 phút thuyết trình sơ đồ DB & Wireframe',
    status: 'SCHEDULED',
    attendedCount: 0,
    totalStudents: 45,
  },
  {
    classId: 'CNTT-K21A',
    lessonSessionId: 'SES-2024-B1-11',
    sessionCode: 'CA-14',
    className: 'Lập trình Web nâng cao - Next.js & TypeScript (CNTT-K21A)',
    subjectCode: 'INT3306 01',
    sessionDate: '2024-11-25',
    startTime: '13:00',
    endTime: '15:20',
    startShift: 7,
    endShift: 9,
    roomId: 'Lab 301',
    roomName: 'Phòng Lab 301',
    instructorName: 'ThS. Nguyễn Văn An',
    note: 'Học bù do nghỉ lễ 02/09. Thực hành tối ưu hóa hiệu năng React Server Components',
    status: 'SCHEDULED',
    attendedCount: 0,
    totalStudents: 45,
  },
];
