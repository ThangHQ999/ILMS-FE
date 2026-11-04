# NEXT.JS ENTERPRISE ARCHITECTURE

Reference document for the project structure. **Read only the section relevant to your task.**
Enforceable rules live in `.agents/rules/` (`00-global`, `10-code`, `20-i18n-theme`); this file explains *where things go and why*, and provides templates. If this file and a rule disagree, stop and ask.

## Contents
0 Purpose · 1 Stack · 2 Principles · 3 Folder tree · 4 Folder details · 5 Import rules · 6 Naming · 7 Server vs Client · 8 Data fetching · 9 Zod · 10 API layer · 11 Forms · 12 State · 13 i18n · 14 Tokens & theme · 15 Auth · 16 Env · 17 UI states · 18 SEO · 19 Testing · 20 Quality & git · 21 Security/perf/a11y · 22 Logging · 23 New feature process · 24 Open decisions

---

## 0. PURPOSE
Feature-Driven architecture on Next.js App Router. Goals: high modularity, easy scaling (only `src/features/` grows), easy debugging (a bug in "courses" lives in `src/features/courses/`), and no 500-file shared folders or 3,000-line type files.

## 1. TECH STACK (fixed; ask before adding or replacing anything)

| Purpose | Choice | Note |
|---|---|---|
| Framework | Next.js App Router | no Pages Router |
| Language | TypeScript `strict` | no `any` |
| Styling | Tailwind CSS | semantic tokens only (§14) |
| UI components | shadcn/ui | Dùng kết hợp Tailwind CSS |
| Icons | `lucide-react` | |
| Server state | TanStack Query | §8 |
| Client/global state | Zustand | §12 |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` | §11 |
| Validation | Zod | §9 |
| HTTP | Axios via `lib/axios.ts` | §10 |
| i18n | `next-intl` | §13 |
| Theme | `next-themes` | §14 |
| Auth | **custom JWT** | §15 |
| Toast | `sonner` (UI layer only) | |
| Dates | `Intl` / `date-fns` via `lib/format.ts` | |
| Tests | Vitest + RTL, Playwright | §19 |
| Lint/format | ESLint + Prettier (+ tailwind plugin) | §20 |
| Package manager | **npm** | one only |

## 2. PRINCIPLES
1. Thin routing: `app/` routes only. 2. Feature isolation: no cross-feature imports. 3. One source of truth for types: Zod. 4. Nothing hardcoded: colors, strings, routes, env, query keys, roles. 5. Server-first. 6. Services are pure (data or `ApiError`). 7. Reuse before writing. 8. Features expose a public API via `index.ts`. 9. Stay within the requested scope.

---

## 3. FOLDER TREE

```text
.
├── src/
│   ├── app/                              # Routing only
│   │   ├── [locale]/
│   │   │   ├── (auth)/login/page.tsx, layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── courses/page.tsx, loading.tsx, error.tsx, [id]/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── layout.tsx                # locale root: html, fonts, providers
│   │   │   ├── not-found.tsx
│   │   │   └── global-error.tsx
│   │   ├── api/                          # Route Handlers (BFF/webhooks)
│   │   ├── globals.css                   # design tokens
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                           # shadcn (do not edit)
│   │   ├── layout/                       # Header, Sidebar, Footer, Breadcrumbs, ThemeToggle, LocaleSwitcher
│   │   └── shared/                       # EmptyState, ErrorState, PageSkeleton, ConfirmDialog, DataTable, FormField
│   ├── features/
│   │   └── courses/
│   │       ├── components/  hooks/  services/  schemas/  store/(optional)
│   │       ├── constants.ts              # query keys, enums
│   │       ├── types.ts                  # types not derivable from schemas
│   │       └── index.ts                  # public API
│   ├── providers/                        # ThemeProvider, QueryProvider, AuthProvider, Providers
│   ├── lib/
│   │   ├── axios.ts  env.ts  format.ts  logger.ts  query-client.ts  utils.ts
│   │   ├── i18n/                         # routing.ts, request.ts, navigation.ts
│   │   └── validations/                  # shared Zod schemas
│   ├── services/                         # global services (upload, ...)
│   ├── store/                            # global Zustand stores
│   ├── hooks/                            # global hooks
│   ├── types/                            # common.ts, next-auth.d.ts
│   ├── constants/                        # routes.ts, roles.ts, permissions.ts, app.ts
│   ├── messages/                         # vi.json, en.json
│   ├── test-utils/                       # renderWithProviders, MSW handlers
│   └── middleware.ts                     # i18n routing + auth guard
├── e2e/                                  # Playwright
├── public/
├── .env.example                          # committed; .env.local is not
├── AGENTS.md  ARCHITECTURE.md  TASKS.md
├── .agents/                              # rules, workflows, skills
└── docs/                                 # PRD, api-spec, design-system, glossary, decisions
```

---

## 4. FOLDER DETAILS

### 4.1 `src/app/` — routing layer
Allowed files: `page`, `layout`, `loading`, `error`, `not-found`, `global-error`, `route.ts`, `sitemap`, `robots`, `opengraph-image`, `globals.css`. Use route groups (`(auth)`, `(dashboard)`) to split layouts without changing URLs. `page.tsx` receives params, may export `generateMetadata`, and renders a feature component, nothing more. A private `_components/` folder is allowed only for tiny UI used by exactly one route.

```tsx
// src/app/[locale]/(dashboard)/courses/page.tsx
import { getTranslations } from 'next-intl/server';
import { CourseList } from '@/features/courses';

export async function generateMetadata() {
  const t = await getTranslations('courses');
  return { title: t('meta.title') };
}
export default function CoursesPage() {
  return <CourseList />;
}
```

### 4.2 `src/components/` — shared UI (no domain logic)
- `ui/`: shadcn only; add with `npx shadcn@latest add <name>`.
- `layout/`: Header, Sidebar, Footer, Breadcrumbs, ThemeToggle, LocaleSwitcher.
- `shared/`: team-built, reusable by ≥ 2 features (`EmptyState`, `ErrorState`, `ConfirmDialog`, `DataTable`, `FormField`, `PageSkeleton`).
Components here take data via props, never call APIs, never import `features/`.

### 4.3 `src/features/` — features layer 🌟
Each feature is a mini-project:
```text
src/features/<name>/
├── components/   # feature UI
├── hooks/        # useXxx wrapping service + Query
├── services/     # <name>.service.ts
├── schemas/      # <name>.schema.ts (Zod + z.infer types)
├── store/        # only if state is shared inside the feature
├── constants.ts  # query keys, enums
├── types.ts      # extra types
└── index.ts      # public API: main components, needed hooks, public types
```
Create only the subfolders you need. Feature names: kebab-case, plural for entities (`courses`), singular for concepts (`auth`, `dashboard`). A feature never imports another feature.

### 4.4 `src/providers/`
Gather all providers here (`ThemeProvider`, `QueryProvider`, `AuthProvider`) and compose them in `Providers.tsx` with a fixed order; the layout wraps once. `NextIntlClientProvider` sits in `[locale]/layout.tsx`.

### 4.5 `src/lib/`
Third-party setup and tiny pure helpers; no domain logic. `utils.ts` (`cn`), `axios.ts`, `env.ts`, `format.ts` (`formatDate/Currency/Number` via `Intl`), `logger.ts`, `query-client.ts`, `i18n/`, `validations/`.

### 4.6 `src/services/` · 4.7 `src/store/` · 4.8 `src/hooks/` · 4.9 `src/types/`
- `services/`: cross-cutting services only (e.g. `upload.service.ts`). Feature services stay in their feature.
- `store/`: state affecting the whole app (`useAuthStore`, `useAppStore` for sidebar etc.). **Theme is not stored here.**
- `hooks/`: domain-free hooks (`useDebounce`, `useMediaQuery`, `usePermission`).
- `types/`: `common.ts` (`ApiResponse`, `PaginatedResponse`, `PaginationParams`, `BaseEntity`, `ApiError`), `next-auth.d.ts`.

### 4.10 `src/constants/`
`routes.ts`, `roles.ts`, `permissions.ts`, `app.ts` (page sizes, upload limits). Feature-specific constants/query keys stay in the feature.
```ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
} as const;
```

### 4.11 `src/messages/` · 4.12 `src/middleware.ts`
`vi.json` / `en.json`, structured by feature (§13). `middleware.ts` only does i18n routing and the auth redirect guard (if your Next.js version renames this convention, follow that version's docs).

---

## 5. IMPORT RULES

| From ↓ / To → | app | features | components | providers | lib | services | store | hooks | types | constants |
|---|---|---|---|---|---|---|---|---|---|---|
| **app** | – | ✅ via index | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **features/A** | ❌ | own only | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **components** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **providers** | ❌ | ✅ via index | ✅ | – | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **lib** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **services / store / hooks** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | own | own | ✅ | ✅ |

Rules: alias `@/` only; external code imports a feature only through `@/features/<name>`; inside a feature import files directly (avoids cycles); shared need → promote to `components/shared`, `lib`, `hooks`, or `types`; no circular dependencies (`import/no-cycle`).

Enforce with ESLint:
```js
// eslint.config.mjs (abridged)
{ rules: {
  'no-restricted-imports': ['error', { patterns: [
    { group: ['../*', '../../*'], message: 'Use the @/ alias.' },
    { group: ['@/features/*/*'], message: 'Import features via @/features/<name> only.' },
  ]}],
  'import/no-cycle': 'error',
}},
{ files: ['src/components/**/*'], rules: {
  'no-restricted-imports': ['error', { patterns: ['@/features/*'] }],
}},
```

---

## 6. NAMING

| Item | Convention | Example |
|---|---|---|
| Folder | kebab-case | `course-detail/` |
| Component | PascalCase.tsx | `CourseCard.tsx` |
| Hook | useXxx.ts | `useCourses.ts` |
| Service / Schema / Store | `x.service.ts` / `x.schema.ts` / `useXStore.ts` | `courses.service.ts` |
| Test | next to source, `.test.ts(x)` | `CourseCard.test.tsx` |
| Constant | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Zod schema / type | `courseSchema` / `Course`, `CreateCourseInput` | |

Booleans `is/has/can/should`; handlers `handleXxx`; props `onXxx`. Function components with named exports (Next.js special files excepted); components ≤ ~150 lines.

---

## 7. SERVER vs CLIENT COMPONENTS
Default to Server Components. Use `'use client'` only for state/effects/events/browser APIs or hooks from Query, Zustand, RHF, next-themes — and put it on the smallest leaf. Server → Client data flows through serializable props. Put `import 'server-only'` in files touching secrets. Server: `getTranslations`; client: `useTranslations`. Never fetch initial data in `useEffect`.

---

## 8. DATA FETCHING (TanStack Query)

| Situation | Approach |
|---|---|
| Initial page data / SEO | Fetch in a Server Component (call the service directly) or prefetch + `HydrationBoundary` |
| Client interaction (filter, pagination, polling, infinite scroll) | `useQuery` / `useInfiniteQuery` |
| Create/update/delete | `useMutation` + invalidate related queries |

Query key factory (required):
```ts
// features/courses/constants.ts
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: CourseListParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};
```
Hooks:
```ts
// hooks/useCourses.ts
'use client';
export function useCourses(params: CourseListParams) {
  return useQuery({ queryKey: courseKeys.list(params), queryFn: () => getCourses(params) });
}

// hooks/useCreateCourse.ts
'use client';
export function useCreateCourse() {
  const qc = useQueryClient();
  const t = useTranslations('courses');
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => { qc.invalidateQueries({ queryKey: courseKeys.lists() }); toast.success(t('messages.createSuccess')); },
    onError: (e) => toast.error(e.message),
  });
}
```
`QueryClient` defaults live in `lib/query-client.ts` (new instance per server request, singleton in the browser). Components never call services directly on the client.

---

## 9. ZOD VALIDATION
- Schemas are the source of truth; types come from `z.infer`. Feature schemas in `features/<name>/schemas/`, shared ones in `lib/validations/`.
- Validate at three places: forms (client), API responses (in services), and inputs to Route Handlers/Server Actions (server).
- Error messages are **i18n keys**; the UI translates them.
```ts
// lib/validations/common.ts
export const emailSchema = z.string().min(1, { message: 'validation.required' }).email({ message: 'validation.email' });
export const passwordSchema = z.string().min(8, { message: 'validation.passwordMin' });

// features/courses/schemas/courses.schema.ts
export const courseSchema = z.object({
  id: z.string(), title: z.string(), description: z.string().nullable(),
  price: z.number().nonnegative(), createdAt: z.string(),
});
export const createCourseSchema = z.object({
  title: z.string().min(1, { message: 'validation.required' }).max(200, { message: 'validation.maxLength' }),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().nonnegative({ message: 'validation.nonNegative' }),
});
export const updateCourseSchema = createCourseSchema.partial();
export type Course = z.infer<typeof courseSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
```
Derive `update` schemas with `.partial()/.pick()/.omit()`; use `z.coerce` for numeric/date form inputs; test schemas that contain logic.

---

## 10. API LAYER & ERRORS

```ts
// types/common.ts
export interface ApiResponse<T> { 
  status: number; 
  message: string; 
  data: T; 
  timestamp: string; 
}

export interface PaginatedResponse<T> { 
  items: T[]; 
  pageNumber: number; 
  pageSize: number; 
  totalElements: number; 
  totalPages: number; 
  isLast: boolean; 
}

export interface PaginationParams { 
  pageNumber?: number; 
  pageSize?: number; 
  [key: string]: any; // Dành cho các filter params khác
}

export interface BaseEntity { 
  id: string; 
  createdAt: string; 
  updatedAt: string; 
  deletedAt: string | null; 
}

export class ApiError extends Error {
  constructor(
    message: string, 
    public readonly httpStatus: number, 
    public readonly backendStatus?: number, 
    public readonly details?: unknown
  ) {
    super(message); 
    this.name = 'ApiError';
  }
}
// lib/axios.ts
export const api = axios.create({ baseURL: env.NEXT_PUBLIC_API_URL, timeout: 15_000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  // TODO: Lấy token từ Zustand hoặc Cookie và đính kèm vào header 'Authorization: Bearer ...'
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Xử lý trường hợp BE trả về HTTP 200 nhưng status code logic lại báo lỗi (nếu có)
    // if (response.data && response.data.status !== 0) {
    //   throw new ApiError(response.data.message, 200, response.data.status, response.data);
    // }
    return response;
  }, 
  (error: AxiosError<ApiResponse<unknown>>) => {
    const httpStatus = error.response?.status ?? 0;
    const backendStatus = error.response?.data?.status;
    const message = error.response?.data?.message ?? error.message;

    if (httpStatus === 401) { 
      /* TODO: Gọi hàm logout hoặc refresh token, redirect về ROUTES.LOGIN */ 
    }

    return Promise.reject(new ApiError(message, httpStatus, backendStatus, error.response?.data));
  }
);
// features/courses/services/courses.service.ts
export async function getCourses(params: PaginationParams): Promise<PaginatedResponse<Course>> {
  // Axios response wrapper có kiểu data là ApiResponse, payload thực tế nằm ở data.data
  const { data } = await api.get<ApiResponse<PaginatedResponse<unknown>>>('/courses', { params });
  
  // Trả về data.data và parse an toàn qua Zod schema
  return { 
    ...data.data, 
    items: data.data.items.map((i) => courseSchema.parse(i)) 
  };
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const { data } = await api.post<ApiResponse<unknown>>('/courses', input);
  return courseSchema.parse(data.data);
}
```
401/403/5xx handling is centralized in the interceptor. error.tsx catches render errors; mutation errors are handled in onError.
---

## 11. FORMS
`react-hook-form` + `zodResolver` + shadcn `Form`. Form type = `z.infer`; full `defaultValues`; disable submit while pending; reset after successful create; labels/errors via i18n; server errors via `form.setError`.
```tsx
// features/courses/components/CourseForm.tsx
'use client';
export function CourseForm() {
  const t = useTranslations('courses');
  const { mutate, isPending } = useCreateCourse();
  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: '', description: '', price: 0 },
  });
  return (
    <form onSubmit={form.handleSubmit((v) => mutate(v, { onSuccess: () => form.reset() }))} className="space-y-4">
      <FormField control={form.control} name="title" label={t('form.title')} />
      <FormField control={form.control} name="price" label={t('form.price')} type="number" />
      <Button type="submit" disabled={isPending}>{isPending ? t('common.saving') : t('common.save')}</Button>
    </form>
  );
}
```
`components/shared/FormField.tsx` wraps shadcn `Form` and renders `t(error.message)`.

---

## 12. STATE MANAGEMENT

| State | Tool |
|---|---|
| Server data | TanStack Query |
| Form values | react-hook-form |
| One component's UI state | `useState` |
| Shared inside a feature | Zustand in `features/<name>/store/` |
| App-wide | Zustand in `src/store/` |
| Shareable/refresh-safe (page, search, sort, filters) | URL `searchParams` |

Never copy server data into Zustand. One store per file (`useXxxStore`), always use selectors, be SSR-safe (no `window`/`localStorage` at module top level), use `persist` only when needed and never for sensitive tokens.
```ts
export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
// usage: useAppStore((s) => s.isSidebarOpen)
```

---

## 13. I18N (next-intl)
- Locales: `vi` (default), `en`, declared in `lib/i18n/routing.ts`. All routes under `app/[locale]/`.
- Locale-aware navigation helpers come from `lib/i18n/navigation.ts`.
- Keys are `feature.section.key`; shared namespaces `common`, `validation`, `errors`; `vi.json` and `en.json` always have identical keys. Use ICU placeholders/plurals; format dates/numbers via `lib/format.ts`; call `setRequestLocale(locale)` on statically rendered pages.
```json
{
  "common": { "save": "Lưu", "cancel": "Hủy", "loading": "Đang tải..." },
  "validation": { "required": "Trường này là bắt buộc", "email": "Email không hợp lệ", "passwordMin": "Mật khẩu tối thiểu 8 ký tự" },
  "errors": { "generic": "Đã có lỗi xảy ra", "notFound": "Không tìm thấy", "unauthorized": "Bạn chưa đăng nhập" },
  "courses": {
    "title": "Khóa học",
    "meta": { "title": "Danh sách khóa học" },
    "form": { "title": "Tên khóa học", "price": "Giá" },
    "messages": { "createSuccess": "Tạo khóa học thành công" }
  }
}
```

---

## 14. DESIGN TOKENS & THEME

### 14.1 Token set
All colors, radii, and fonts are CSS variables in `src/app/globals.css`; components use only the mapped semantic classes.

| Group | Tokens |
|---|---|
| Surface/text | `background foreground card card-foreground popover popover-foreground` |
| Brand | `primary secondary accent` (+ `*-foreground`) |
| Neutral | `muted muted-foreground border input ring` |
| Status | `destructive success warning info` (+ `*-foreground`) |
| Charts | `chart-1 … chart-5` |
| Sidebar | `sidebar sidebar-foreground sidebar-primary sidebar-accent sidebar-border` |
| Shape | `--radius` (+ derived sm/md/lg/xl) |

### 14.2 `globals.css` template (Cơ chế hoạt động)
> **QUAN TRỌNG:** Các mã màu bên dưới CHỈ LÀ VÍ DỤ VỀ CẤU TRÚC (Placeholder). 
> Khi setup dự án hoặc sửa màu, AI **BẮT BUỘC phải đọc file `docs/design-system.md`** để lấy mã màu thật (Hex/RGB/HSL) và map vào các biến CSS dưới đây. Tuyệt đối không tự bịa màu.
```css
@import 'tailwindcss';
@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);         --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);               --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);            --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.55 0.2 260);     --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);       --secondary-foreground: oklch(0.205 0 0);
  --accent: oklch(0.97 0 0);          --accent-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);           --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);         --input: oklch(0.922 0 0);   --ring: oklch(0.708 0 0);
  --destructive: oklch(0.577 0.245 27); --destructive-foreground: oklch(0.985 0 0);
  --success: oklch(0.62 0.17 150);    --success-foreground: oklch(0.985 0 0);
  --warning: oklch(0.78 0.16 80);     --warning-foreground: oklch(0.2 0 0);
  --info: oklch(0.65 0.14 235);       --info-foreground: oklch(0.985 0 0);
}
.dark {
  --background: oklch(0.145 0 0);     --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);           --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);        --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.7 0.17 260);     --primary-foreground: oklch(0.145 0 0);
  --secondary: oklch(0.269 0 0);      --secondary-foreground: oklch(0.985 0 0);
  --accent: oklch(0.269 0 0);         --accent-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);          --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);       --input: oklch(1 0 0 / 15%); --ring: oklch(0.556 0 0);
  --destructive: oklch(0.704 0.191 22);
  --success: oklch(0.72 0.16 150);    --warning: oklch(0.82 0.15 80);   --info: oklch(0.74 0.12 235);
}
@theme inline {
  --color-background: var(--background);   --color-foreground: var(--foreground);
  --color-card: var(--card);               --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);         --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);         --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);     --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);           --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);             --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);           --color-input: var(--input);     --color-ring: var(--ring);
  --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);         --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);         --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);               --color-info-foreground: var(--info-foreground);
  --radius-sm: calc(var(--radius) - 4px);  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);              --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-sans-var), ui-sans-serif, system-ui, sans-serif;
}
@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

### 14.3 Theme provider
```tsx
// providers/ThemeProvider.tsx
'use client';
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</NextThemesProvider>;
}

// app/[locale]/layout.tsx (abridged)
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontSans.variable} antialiased`}>
        <NextIntlClientProvider><Providers>{children}</Providers></NextIntlClientProvider>
      </body>
    </html>
  );
}
```
Modes: `light | dark | system` (default `system`). `ThemeToggle` lives in `components/layout/` and handles the `mounted` state. Fonts are declared once with `next/font` in the root layout. Spacing uses the Tailwind scale; mobile-first breakpoints.

---

## 15. AUTH & PERMISSIONS

| Item | Decision |
|---|---|
| Library | **Custom JWT** (Spring Boot cấp phát) |
| Token storage | httpOnly + Secure + SameSite cookie (hoặc Zustand/LocalStorage tùy bạn chốt) |
| Refresh | `yes`, handled in `lib/axios.ts` interceptor |
| Route guard | `middleware.ts` (public routes listed in `constants/routes.ts`) |
| UI guard | `<Can permission="…">` / `usePermission` |
| Server guard | **mandatory** re-check in backend/Route Handler/Server Action |

```ts
// constants/roles.ts
export const ROLES = { ADMIN: 'ADMIN', TEACHER: 'TEACHER', STUDENT: 'STUDENT' } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// constants/permissions.ts
export const PERMISSIONS = { COURSE_READ: 'course:read', COURSE_CREATE: 'course:create', COURSE_DELETE: 'course:delete' } as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [PERMISSIONS.COURSE_READ, PERMISSIONS.COURSE_CREATE],
  [ROLES.USER]: [PERMISSIONS.COURSE_READ],
};
```
Unauthenticated users are redirected to `ROUTES.LOGIN` with a `callbackUrl`.

---

## 16. ENVIRONMENT VARIABLES
Always import `env` from `lib/env.ts`; never read `process.env.X` directly. `NEXT_PUBLIC_*` is exposed to the browser (no secrets). Commit `.env.example`, never `.env.local`. Adding a variable means updating `lib/env.ts` and `.env.example`.
```ts
// lib/env.ts
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AUTH_SECRET: z.string().min(1),
});
const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});
const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
const serverEnv = typeof window === 'undefined' ? serverSchema.parse(process.env) : ({} as z.infer<typeof serverSchema>);
export const env = { ...clientEnv, ...serverEnv };
```
(`@t3-oss/env-nextjs` is an acceptable replacement if approved.)

---

## 17. UI STATES
Every async view handles loading, error, empty, success.

| State | Mechanism |
|---|---|
| Route loading | `loading.tsx` (Skeleton) |
| Component loading | shadcn `Skeleton` / `PageSkeleton` (prefer over full-page spinners) |
| Route error | `error.tsx` (`'use client'`, retry via `reset()`) · root: `global-error.tsx` |
| Component error | `<ErrorState onRetry={refetch} />` |
| Empty | `<EmptyState title description action />` |
| Missing record | `notFound()` + `not-found.tsx` |

`EmptyState`, `ErrorState`, `PageSkeleton`, `ConfirmDialog` are mandatory shared components.

## 18. SEO & METADATA
`generateMetadata` on key pages (text from i18n); default `metadata` + `title.template` in the root layout; `sitemap.ts` and `robots.ts` with `alternates.languages` (hreflang); OG images via `opengraph-image.tsx`; private pages (`dashboard`, `auth`) use `robots: { index: false }`; `next/image` with meaningful `alt`.

## 19. TESTING

| Type | Tool | Location | Required for |
|---|---|---|---|
| Unit | Vitest | next to source | utils, schemas with logic, services |
| Component | Vitest + RTL | next to source | components with logic |
| Hook | `renderHook` | next to source | key business hooks |
| E2E | Playwright | `e2e/` | main flows |

Test behavior, mock the network (MSW or mock `api`), query by role/label. New services and schemas must have tests; bug fixes get a reproducing test. Step-by-step procedure: workflow `/test`.

## 20. CODE QUALITY & GIT
- TS: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. ESLint: `next/core-web-vitals`, `@typescript-eslint`, `import`, `boundaries`, `jsx-a11y`. Prettier + `prettier-plugin-tailwindcss`. Husky + lint-staged + commitlint.
- Scripts: `dev build start lint typecheck test test:e2e format`.
- Branches `feature/*`, `fix/*`, `chore/*`; Conventional Commits (`feat|fix|refactor|style|docs|test|chore|perf`); small PRs.
- CI: `install → lint → typecheck → test → build`; red CI blocks merge.

## 21. SECURITY, PERFORMANCE, ACCESSIBILITY
- **Security:** validate all server input with Zod; sanitize before any `dangerouslySetInnerHTML` (DOMPurify); security headers (CSP, X-Frame-Options, Referrer-Policy) in `next.config`; auth cookies `httpOnly`/`Secure`/`SameSite`; re-check permissions on the server for every write.
- **Performance:** `next/image`, `next/font`, `next/dynamic` for heavy/rare components, no whole-library imports, parallelize fetches (`Promise.all`/prefetch) to avoid waterfalls, paginate or virtualize long lists, memoize only with measured benefit.
- **Accessibility:** labels on inputs, `aria-label` on icon buttons, keyboard and visible focus, semantic elements, WCAG AA contrast via token pairs, `alt` on images.

## 22. LOGGING & MONITORING
Use `lib/logger.ts` (`debug/info/warn/error`, no `debug` in production); no `console.log`. Integrate Sentry (or equivalent) on client and server; `error.tsx` and `global-error.tsx` report errors. Never log tokens, passwords, or PII.

---

## 23. NEW FEATURE PROCESS (summary)
Detailed templates: skill `create-feature`.
1. Analyze entities, endpoints, screens, permissions; check for similar existing features.
2. Create `src/features/<name>/` skeleton (only needed folders).
3. Schema → service → query keys → hooks.
4. Add i18n namespace to both `vi.json` and `en.json`.
5. Components with all UI states, tokens only, a11y.
6. `index.ts` public API.
7. Routes: thin `page.tsx` + `loading.tsx` + `error.tsx` + `generateMetadata`.
8. Add `ROUTES`, permissions, and a Sidebar entry.
9. Tests for schema, service, and key UI.
10. Run `lint`, `typecheck`, `test` (and `build` for large changes); update `TASKS.md`.

---

## 24. DECISIONS
- [x] Package manager: npm · Next.js · Tailwind v4
- [ ] Auth approach and refresh strategy (Chưa chốt hẳn thì để trống)
- [x] Backend: REST; real response/error shape matched `ApiResponse<T>`
- [ ] Real roles and permission matrix
- [x] Brand palette and main font in `docs/design-system.md`
- [x] File upload storage: Cloudinary