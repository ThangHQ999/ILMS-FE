/**
 * Shared Verification Test Runner and Mock Environment
 * Blocks real network requests, sets up isolated DOM/storage mocks,
 * and executes suites with isolated state.
 */

import { api } from '@/lib/axios';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface SuiteResult {
  suiteName: string;
  results: TestResult[];
  passedCount: number;
  failedCount: number;
  totalCount: number;
}

export interface HttpMockDefinition {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | '*';
  urlPattern: string | RegExp;
  validate?: (config: Record<string, any>) => void;
  handler: (config: Record<string, any>) => Promise<any> | any;
}

const customHttpMocks: HttpMockDefinition[] = [];

export function registerHttpMock(mock: HttpMockDefinition): () => void {
  customHttpMocks.unshift(mock);
  return () => {
    const idx = customHttpMocks.indexOf(mock);
    if (idx !== -1) customHttpMocks.splice(idx, 1);
  };
}

export function clearCustomHttpMocks(): void {
  customHttpMocks.length = 0;
}

function createMock401(config: Record<string, any>, message: string) {
  const error: any = new Error(`[MOCK_HTTP_401] ${message}: ${config.method?.toUpperCase()} ${config.url}`);
  error.isAxiosError = true;
  error.status = 401;
  error.response = {
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
    data: { message: 'Unauthorized' },
  };
  return Promise.reject(error);
}

function createMock404(config: Record<string, any>, message: string) {
  const error: any = new Error(`[MOCK_HTTP_404] ${message}: ${config.method?.toUpperCase()} ${config.url}`);
  error.isAxiosError = true;
  error.status = 404;
  error.response = {
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
    data: { message: 'Not Found' },
  };
  return Promise.reject(error);
}

// Built-in mock endpoints for contract testing (docs/api-spec.md)
const DEFAULT_CONTRACT_MOCKS: HttpMockDefinition[] = [
  // 1. GET /classes/{uuid}/exams (Teacher/Student table contract check)
  {
    id: 'get-class-exams-paged',
    method: 'GET',
    urlPattern: /\/classes\/00000000-0000-4000-8000-[0-9a-fA-F]{12}\/exams/,
    validate: (cfg) => {
      const params = cfg.params || {};
      if (params.page === undefined || params.size === undefined) {
        throw new Error('[MOCK_VALIDATION_ERROR] GET /classes/{id}/exams requires page and size params');
      }
    },
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to class exams endpoint'),
  },
  // 2. POST /classes/{uuid}/exams (Teacher create exam contract check)
  {
    id: 'post-create-exam',
    method: 'POST',
    urlPattern: /\/classes\/00000000-0000-4000-8000-[0-9a-fA-F]{12}\/exams/,
    validate: (cfg) => {
      let payload = cfg.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }
      if (!payload?.title || !payload?.examType || !payload?.courseId) {
        throw new Error('[MOCK_VALIDATION_ERROR] POST /classes/{id}/exams missing mandatory fields');
      }
    },
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to create exam endpoint'),
  },
  // 3. PATCH /exams/{id} (Teacher update exam contract check / demo fallback)
  {
    id: 'patch-update-exam',
    method: 'PATCH',
    urlPattern: /\/exams\/[^/]+$/,
    validate: (cfg) => {
      let payload = cfg.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }
      if (!payload || typeof payload !== 'object') {
        throw new Error('[MOCK_VALIDATION_ERROR] PATCH /exams/{id} requires payload');
      }
    },
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to update exam endpoint'),
  },
  // 3b. PATCH /exams/{id}/publish (Teacher publish exam contract check / demo fallback)
  {
    id: 'patch-publish-exam',
    method: 'PATCH',
    urlPattern: /\/exams\/[^/]+\/publish$/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to publish exam endpoint'),
  },
  // 3c. PATCH /exams/{id}/unpublish (Teacher unpublish exam contract check / demo fallback)
  {
    id: 'patch-unpublish-exam',
    method: 'PATCH',
    urlPattern: /\/exams\/[^/]+\/unpublish$/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to unpublish exam endpoint'),
  },
  // 3d. GET /questions (Bank questions endpoint / demo fallback)
  {
    id: 'get-bank-questions',
    method: 'GET',
    urlPattern: /\/questions(?:\?.*)?$/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to bank questions endpoint'),
  },
  // 4. GET /exams/{uuid}/questions (Student & Teacher exam questions endpoint)
  {
    id: 'get-exam-questions',
    method: 'GET',
    urlPattern: /\/exams\/(?:3fa85f64-5717-4562-b3fc-2c963f66afa6|11111111-2222-3333-4444-555555555555)\/questions/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to exam questions endpoint'),
  },
  // 5. GET /exams/{uuid} (Student exam detail real UUID endpoint)
  {
    id: 'get-exam-detail-real-uuid',
    method: 'GET',
    urlPattern: /\/exams\/11111111-2222-3333-4444-555555555555$/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to exam detail endpoint'),
  },
  // 6. GET /classes/{classId}/grade-reports (Grade reports list & detail endpoint / demo offline fallback)
  {
    id: 'get-class-grade-reports',
    method: 'GET',
    urlPattern: /\/classes\/[^/]+\/grade-reports(?:\/.*)?/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to grade reports endpoint'),
  },
  // 6b. POST /classes/{classId}/grade-reports (Create grade report / demo offline fallback)
  {
    id: 'post-create-grade-report',
    method: 'POST',
    urlPattern: /\/classes\/[^/]+\/grade-reports/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to create grade report endpoint'),
  },
  // 6c. PATCH /classes/{classId}/grade-reports/{studentId} (Update student grade / demo offline fallback)
  {
    id: 'patch-update-student-grade',
    method: 'PATCH',
    urlPattern: /\/classes\/[^/]+\/grade-reports\/[^/]+/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to update student grade endpoint'),
  },
  // 6d. GET /classes/{classId}/members (Class members endpoint / demo offline fallback)
  {
    id: 'get-class-members',
    method: 'GET',
    urlPattern: /\/classes\/[^/]+\/members/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to class members endpoint'),
  },
  // 7. GET /assignments/{uuid} (Student real assignment UUID isolation)
  {
    id: 'get-assignment-real-uuid',
    method: 'GET',
    urlPattern: /\/assignments\/a1b2c3d4-e5f6-7890-abcd-ef1234567890$/,
    handler: (cfg) => createMock404(cfg, 'Real assignment UUID not found in backend (isolation check)'),
  },
  // 8. GET /classes/{classId}/assignments (Class assignments endpoint / demo offline fallback)
  {
    id: 'get-class-assignments',
    method: 'GET',
    urlPattern: /\/classes\/[^/]+\/assignments/,
    handler: (cfg) => createMock404(cfg, 'Class assignments not found in backend (offline / demo fallback)'),
  },
  // 9. POST /classes/{classId}/assignments (Assignment creation contract / demo offline fallback)
  {
    id: 'post-create-assignment',
    method: 'POST',
    urlPattern: /\/classes\/[^/]+\/assignments/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to create assignment endpoint'),
  },
  // 10. GET /classes/{classId}/courses (Active courses endpoint / demo offline fallback)
  {
    id: 'get-class-courses',
    method: 'GET',
    urlPattern: /\/classes\/[^/]+\/courses/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to class courses endpoint'),
  },
  // 11. GET /courses/{courseId}/chapters (Course chapters endpoint / demo offline fallback)
  {
    id: 'get-course-chapters',
    method: 'GET',
    urlPattern: /\/courses\/[^/]+\/chapters/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to course chapters endpoint'),
  },
  // 12. GET /chapters/{chapterId}/lessons (Chapter lessons endpoint / demo offline fallback)
  {
    id: 'get-chapter-lessons',
    method: 'GET',
    urlPattern: /\/chapters\/[^/]+\/lessons/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to chapter lessons endpoint'),
  },
  // 13. PATCH /assignments/{id} (Teacher update assignment contract / demo fallback)
  {
    id: 'patch-update-assignment',
    method: 'PATCH',
    urlPattern: /\/assignments\/[^/]+$/,
    handler: (cfg) => createMock401(cfg, 'Unauthenticated access to update assignment endpoint'),
  },
];

// Per-case tracking for unregistered HTTP request violations
let currentCaseUnregisteredRequests: string[] = [];

export function getUnregisteredRequestsForCurrentCase(): string[] {
  return [...currentCaseUnregisteredRequests];
}

export function clearUnregisteredRequests(): void {
  currentCaseUnregisteredRequests.length = 0;
}

// In-memory mock storage
export function createMockLocalStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

export function setupTestEnvironment(): () => void {
  const originalEnv = process.env.NODE_ENV;
  (process.env as Record<string, unknown>).NODE_ENV = 'development';

  const mockStorage = createMockLocalStorage();
  const eventListeners: Record<string, Function[]> = {};

  if (typeof (globalThis as Record<string, unknown>).window === 'undefined') {
    (globalThis as Record<string, unknown>).window = {
      location: { search: '', pathname: '/classes/csdl-k22-01/assignments' },
      addEventListener: (type: string, fn: Function) => {
        eventListeners[type] = eventListeners[type] || [];
        eventListeners[type].push(fn);
      },
      removeEventListener: (type: string, fn: Function) => {
        if (!eventListeners[type]) return;
        eventListeners[type] = eventListeners[type].filter((f) => f !== fn);
      },
      dispatchEvent: (e: { type: string }) => {
        const fns = eventListeners[e.type] || [];
        fns.forEach((fn) => fn(e));
        return true;
      },
    };
  }

  (globalThis as Record<string, unknown>).localStorage = mockStorage;
  clearUnregisteredRequests();

  if (typeof (globalThis as Record<string, unknown>).CustomEvent === 'undefined') {
    (globalThis as Record<string, unknown>).CustomEvent = class CustomEvent {
      type: string;
      detail: unknown;
      constructor(type: string, params?: { detail: unknown }) {
        this.type = type;
        this.detail = params?.detail;
      }
    };
  }

  // Intercept network calls on Axios instance with explicit Mock Registry
  const originalAdapter = api.defaults.adapter;
  api.defaults.adapter = async (config) => {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';

    // Check custom mocks first, then built-in contract mocks
    const allMocks = [...customHttpMocks, ...DEFAULT_CONTRACT_MOCKS];
    for (const mock of allMocks) {
      if (mock.method !== '*' && mock.method !== method) continue;
      const matches = typeof mock.urlPattern === 'string'
        ? url.includes(mock.urlPattern)
        : mock.urlPattern.test(url);

      if (matches) {
        if (mock.validate) {
          mock.validate(config);
        }
        return mock.handler(config);
      }
    }

    // STRICT: Any unregistered request is recorded as violation, rejected and blocked from hitting real network
    const desc = `${method} ${url}`;
    currentCaseUnregisteredRequests.push(desc);

    const error: any = new Error(
      `[UNREGISTERED_HTTP_REQUEST] Network request was blocked in test environment: ${desc}. No mock is registered for this endpoint.`
    );
    error.isAxiosError = true;
    error.code = 'ERR_UNREGISTERED_HTTP_REQUEST';
    return Promise.reject(error);
  };

  // Cleanup function
  return () => {
    (process.env as Record<string, unknown>).NODE_ENV = originalEnv;
    api.defaults.adapter = originalAdapter;
    clearCustomHttpMocks();
    clearUnregisteredRequests();
  };
}

export async function runSuite(
  suiteName: string,
  tests: Array<{ name: string; fn: () => void | Promise<void> }>
): Promise<SuiteResult> {
  console.log(`\n======================================================`);
  console.log(`SUITE: ${suiteName} (${tests.length} test cases)`);
  console.log(`======================================================\n`);

  const results: TestResult[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const t of tests) {
    const teardown = setupTestEnvironment();
    clearUnregisteredRequests();
    try {
      await t.fn();

      // STRICT: If test made and caught/swallowed any unregistered request, fail the case!
      const violations = getUnregisteredRequestsForCurrentCase();
      if (violations.length > 0) {
        throw new Error(
          `[UNREGISTERED_REQUEST_VIOLATION] Test executed ${violations.length} unregistered network request(s): ${violations.join(', ')}`
        );
      }

      passedCount++;
      results.push({ name: t.name, passed: true });
      console.log(`  ✔ PASS: ${t.name}`);
    } catch (err: unknown) {
      failedCount++;
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ name: t.name, passed: false, error: msg });
      console.log(`  ✘ FAIL: ${t.name} -> ${msg.slice(0, 120)}`);
    } finally {
      clearUnregisteredRequests();
      teardown();
    }
  }

  console.log(`\n[${suiteName} SUMMARY] Total: ${tests.length} | Passed: ${passedCount} | Failed: ${failedCount}\n`);

  return {
    suiteName,
    results,
    passedCount,
    failedCount,
    totalCount: tests.length,
  };
}
