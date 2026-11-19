import fs from 'fs';
import path from 'path';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAILED: ${msg}`);
    process.exit(1);
  }
}

console.log('=== VERIFYING BANNER RESTORATION, ROLE SWITCHER & TOGGLE SCOPE ===\n');

// 1. Kiểm tra 3 màn BẮT BUỘC CÓ cặp nút Bài tập / Bài thi
const viewsKeepingToggle = [
  {
    name: 'Danh sách bài tập – Học viên (StudentAssignmentsTableView.tsx)',
    file: 'src/features/assignments/components/StudentAssignmentsTableView.tsx',
    required: ['activeTypeTab', 'toggleAssignments', 'toggleExams'],
  },
  {
    name: 'Danh sách bài tập – Giảng viên (TeacherAssignmentsTableView.tsx)',
    file: 'src/features/assignments/components/TeacherAssignmentsTableView.tsx',
    required: ['activeTypeTab', 'toggleAssignments', 'toggleExams'],
  },
  {
    name: 'Tạo bài tập – Giảng viên (TeacherCreateAssignmentFormView.tsx)',
    file: 'src/features/assignments/components/TeacherCreateAssignmentFormView.tsx',
    required: ['activeTypeTab', 'toggleAssignments', 'toggleExams'],
  },
];

viewsKeepingToggle.forEach((item) => {
  console.log(`Checking toggle retention in ${item.name}...`);
  const fullPath = path.resolve(process.cwd(), item.file);
  assert(fs.existsSync(fullPath), `File ${item.file} must exist`);
  const content = fs.readFileSync(fullPath, 'utf8');

  item.required.forEach((keyword) => {
    assert(
      content.includes(keyword),
      `File ${item.file} MUST contain toggle keyword "${keyword}"`
    );
  });
  console.log(`  -> PASSED: Toggle [Bài tập] / [Bài thi] is preserved accurately.\n`);
});

// 2. Kiểm tra ClassDetailPageView.tsx: Hiện Banner trên 2 danh sách, ẩn khi action=create, ẩn Role Switcher khi assignments
console.log('Checking ClassDetailPageView.tsx banner restoration and role switcher hiding...');
const classDetailPagePath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailPageView.tsx'
);
assert(fs.existsSync(classDetailPagePath), 'ClassDetailPageView.tsx must exist');
const classDetailPageContent = fs.readFileSync(classDetailPagePath, 'utf8');

assert(
  classDetailPageContent.includes(
    "{!(activeTab === 'assignments' && searchParams.get('action') === 'create') && ("
  ),
  "ClassDetailPageView must render ClassDetailBanner when not creating assignment: {!(activeTab === 'assignments' && searchParams.get('action') === 'create') && ("
);

assert(
  classDetailPageContent.includes('<ClassDetailBanner'),
  'ClassDetailPageView must render <ClassDetailBanner'
);

assert(
  classDetailPageContent.includes('Role Simulator Switcher: hidden on assignments tab'),
  'ClassDetailPageView must hide Role Simulator Switcher on assignments tab'
);

assert(
  classDetailPageContent.includes("{activeTab !== 'assignments' && ("),
  "ClassDetailPageView must hide Role Switcher using {activeTab !== 'assignments' && ("
);

console.log('  -> PASSED: ClassDetailPageView correctly restores banner on assignment lists and hides role switcher.\n');

// 3. Kiểm tra ClassDetailBanner.tsx: Hỗ trợ vai trò student, canManageClass và tab assignments
console.log('Checking ClassDetailBanner.tsx capabilities...');
const bannerPath = path.resolve(
  process.cwd(),
  'src/features/classes/components/detail/ClassDetailBanner.tsx'
);
assert(fs.existsSync(bannerPath), 'ClassDetailBanner.tsx must exist');
const bannerContent = fs.readFileSync(bannerPath, 'utf8');

assert(
  bannerContent.includes("'owner' | 'teacher' | 'student'"),
  "ClassDetailBanner must accept 'student' role in currentRole"
);
assert(
  bannerContent.includes('canManageClass'),
  'ClassDetailBanner must accept canManageClass prop'
);
assert(
  bannerContent.includes('roleStudent'),
  'ClassDetailBanner must use roleStudent translation'
);
assert(
  bannerContent.includes("id: 'assignments'"),
  "ClassDetailBanner must include 'assignments' tab"
);

console.log('  -> PASSED: ClassDetailBanner properly supports student role, permission gating and assignments tab.\n');

// 4. Kiểm tra 4 màn con BẮT BUỘC KHÔNG CÓ toggle, không có banner cấp lớp và không có nút quay lại
const viewsWithoutToggleAndBanner = [
  {
    name: 'StudentAssignmentDetailPageView.tsx (3 trạng thái chi tiết Học viên)',
    file: 'src/features/assignments/components/StudentAssignmentDetailPageView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      'Top Context & Class Banner',
      'Role Simulator Switcher',
      'viewAs',
      'backToAssignmentList',
      'Quay lại danh sách bài tập',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
  {
    name: 'StudentAssignmentSubmissionPageView.tsx (Form nộp bài Học viên)',
    file: 'src/features/assignments/components/StudentAssignmentSubmissionPageView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      'Top Context & Class Banner',
      'Role Simulator Switcher',
      'viewAs',
      'Quay lại chi tiết bài tập',
      '<div className="flex w-full justify-end">',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
  {
    name: 'TeacherAssignmentSubmissionsPageView.tsx (Danh sách bài nộp Giảng viên)',
    file: 'src/features/assignments/components/TeacherAssignmentSubmissionsPageView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      'Top Context & Class Banner',
      'Role Simulator Switcher',
      'viewAs',
      'roles.student',
      'roles.teacher',
      'backToList',
      '<div className="flex w-full justify-end">',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
  {
    name: 'TeacherSubmissionDetailView.tsx (Màn chấm điểm Giảng viên)',
    file: 'src/features/assignments/components/TeacherSubmissionDetailView.tsx',
    forbidden: [
      'activeTypeTab',
      'toggleAssignments',
      'toggleExams',
      '1. Class Banner',
      '2. Class Navigation Tabs',
      'Segmented Control: Bài tập / Bài thi',
      'Role Simulator Switcher',
      'viewAs',
      'backToSubmissions',
    ],
    required: [
      'href={`/classes/${classId}?tab=assignments`}',
    ],
  },
];

viewsWithoutToggleAndBanner.forEach((item) => {
  console.log(`Checking clean sub-view in ${item.name}...`);
  const fullPath = path.resolve(process.cwd(), item.file);
  assert(fs.existsSync(fullPath), `File ${item.file} must exist`);
  const content = fs.readFileSync(fullPath, 'utf8');

  item.forbidden.forEach((str) => {
    assert(
      !content.includes(str),
      `File ${item.file} must NOT contain forbidden string: "${str}"`
    );
  });

  item.required.forEach((str) => {
    assert(
      content.includes(str),
      `File ${item.file} MUST contain required string: "${str}"`
    );
  });

  console.log(`  -> PASSED: Cleaned up correctly without residual banner code.\n`);
});

console.log('================================================================');
console.log('ALL VERIFICATIONS PASSED: BANNER RESTORED ON 2 LISTS & SCOPES ACCURATE!');
console.log('================================================================');
