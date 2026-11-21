import {
  isPreviewModeEnabled,
  setPreviewMode,
  getDemoUser,
  PREVIEW_STORAGE_KEY,
} from '@/lib/preview';
import { globalRoleStore } from '@/lib/role-store';
import {
  isDemoAssignment,
  isMockClass,
  INITIAL_DEMO_SUBMISSIONS,
  MOCK_TEACHER_SUBMISSIONS,
  DEMO_STUDENT_PROFILES,
} from '../services/assignment.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

// In-memory mock for localStorage in Node/tsx environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  },
  get length() {
    return Object.keys(mockStorage).length;
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
};

// Mock window and CustomEvent for Node/tsx environment
if (typeof (globalThis as any).window === 'undefined') {
  const eventListeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    location: { search: '', pathname: '/classes/csdl-k22-01/assignments' },
    addEventListener: (type: string, fn: Function) => {
      eventListeners[type] = eventListeners[type] || [];
      eventListeners[type].push(fn);
    },
    removeEventListener: (type: string, fn: Function) => {
      if (!eventListeners[type]) return;
      eventListeners[type] = eventListeners[type].filter((f) => f !== fn);
    },
    dispatchEvent: (e: any) => {
      const fns = eventListeners[e.type] || [];
      fns.forEach((fn) => fn(e));
      return true;
    },
  };
  (globalThis as any).localStorage = mockLocalStorage;
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

export async function runPreviewTests() {
  console.log('=== VERIFYING PREVIEW MODE & ROLE SWITCHER ===\n');

  const originalEnv = process.env.NODE_ENV;

  try {
    // -------------------------------------------------------------
    // Test 1: Production Safeguard
    // -------------------------------------------------------------
    console.log('Test 1: Production environment NEVER enables preview mode');
    (process.env as any).NODE_ENV = 'production';
    mockLocalStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
    assert(isPreviewModeEnabled() === false, 'Production must return false even if storage flag is set');

    setPreviewMode(true);
    assert(isPreviewModeEnabled() === false, 'setPreviewMode in production must be a no-op');
    console.log('  -> PASS: Production is strictly protected from preview mode\n');

    // Reset to development
    (process.env as any).NODE_ENV = 'development';
    mockLocalStorage.clear();
    globalRoleStore.reset();

    // -------------------------------------------------------------
    // Test 2: Preview Mode Activation & Persistence
    // -------------------------------------------------------------
    console.log('Test 2: Activation & Persistence in Development');
    assert(isPreviewModeEnabled() === false, 'Initially disabled');

    setPreviewMode(true);
    assert(isPreviewModeEnabled() === true, 'setPreviewMode(true) enabled preview');
    assert(mockLocalStorage.getItem(PREVIEW_STORAGE_KEY) === 'true', 'Stored in localStorage');

    // Simulate page refresh (F5): preview flag remains in storage
    assert(isPreviewModeEnabled() === true, 'F5 preserves preview mode across navigation');

    // Disable preview
    setPreviewMode(false);
    assert(isPreviewModeEnabled() === false, 'setPreviewMode(false) disabled preview');
    assert(mockLocalStorage.getItem(PREVIEW_STORAGE_KEY) === null, 'Storage flag removed');
    console.log('  -> PASS: Preview mode activation, F5 persistence, and clean exit verified\n');

    // -------------------------------------------------------------
    // Test 3: Virtual Demo Identities & Role Switching
    // -------------------------------------------------------------
    console.log('Test 3: Virtual Demo Identities for Teacher & Student');
    const teacherUser = getDemoUser('TEACHER');
    assert(teacherUser.roleName === 'TEACHER', 'Teacher roleName is TEACHER');
    assert(teacherUser.firstName === 'Nam' && teacherUser.lastName === 'TS. Lê Hoàng', 'Teacher is TS. Lê Hoàng Nam');
    assert(teacherUser.email === 'namlh@ptit.edu.vn', 'Teacher email is namlh@ptit.edu.vn');
    assert(`${teacherUser.lastName} ${teacherUser.firstName}` === 'TS. Lê Hoàng Nam', 'Full name is TS. Lê Hoàng Nam');

    const studentUser = getDemoUser('STUDENT');
    assert(studentUser.roleName === 'STUDENT', 'Student roleName is STUDENT');
    assert(studentUser.firstName === 'Minh' && studentUser.lastName === 'Trần Nhật', 'Student is Trần Nhật Minh');
    assert(studentUser.email === 'minhtn@stu.ptit.edu.vn', 'Student email is minhtn@stu.ptit.edu.vn');
    assert(studentUser.username === '22028192', 'Student studentCode is 22028192');
    assert(`${studentUser.lastName} ${studentUser.firstName}` === 'Trần Nhật Minh', 'Full name is Trần Nhật Minh');

    // Role switcher synchronous toggle
    globalRoleStore.set('TEACHER');
    const activeTeacher = getDemoUser();
    assert(activeTeacher.roleName === 'TEACHER', 'globalRoleStore.set("TEACHER") switches demo user to teacher');

    globalRoleStore.set('STUDENT');
    const activeStudent = getDemoUser();
    assert(activeStudent.roleName === 'STUDENT', 'globalRoleStore.set("STUDENT") switches demo user to student');
    console.log('  -> PASS: Teacher and Student virtual identities toggle synchronously\n');

    // -------------------------------------------------------------
    // Test 4: Preservation of Demo Data & Mock Classes
    // -------------------------------------------------------------
    console.log('Test 4: Preservation of Demo Data & Benchmark Records');
    assert(isMockClass('csdl-k22-01') === true, 'csdl-k22-01 is correctly identified as mock class');
    assert(isDemoAssignment('assign-db-01', 'csdl-k22-01') === true, 'assign-db-01 is mock assignment');
    assert(isDemoAssignment('assign-db-02', 'csdl-k22-01') === true, 'assign-db-02 is mock assignment');

    assert(INITIAL_DEMO_SUBMISSIONS['assign-db-02']?.status === 'SUBMITTED', 'assign-db-02 initial submission preserved');
    assert(INITIAL_DEMO_SUBMISSIONS['assign-db-05']?.status === 'GRADED', 'assign-db-05 initial submission preserved');
    assert(INITIAL_DEMO_SUBMISSIONS['assign-db-05']?.score === 9.0, 'assign-db-05 initial score 9.0 preserved');

    const db01Subs = MOCK_TEACHER_SUBMISSIONS['assign-db-01'];
    assert(Array.isArray(db01Subs) && db01Subs.length >= 5, 'assign-db-01 has at least 5 benchmark submissions');
    assert(db01Subs.some((s) => s.studentName === 'Trần Nhật Minh'), 'Trần Nhật Minh exists in submissions');
    assert(db01Subs.some((s) => s.studentName === 'Vũ Đức Long'), 'Vũ Đức Long exists in submissions');

    assert(DEMO_STUDENT_PROFILES['student-tran-nhat-minh']?.name === 'Trần Nhật Minh', 'Student profile mapped correctly');
    console.log('  -> PASS: Demo data, benchmark submissions, and mock class integrity preserved\n');

    console.log('ALL 4 PREVIEW & ROLE SWITCHER TEST SUITES PASSED! (100% OK)');
  } finally {
    (process.env as any).NODE_ENV = originalEnv;
  }
}

if (require.main === module || !process.env.TEST_RUNNER) {
  runPreviewTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
