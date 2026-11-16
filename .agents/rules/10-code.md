---
trigger: always_on
---

# 10-CODE — CODING RULES

Always on. Applies to any code under `src/`. Full detail and examples: `ARCHITECTURE.md`.

## 1. Where code lives
| Code | Location |
|---|---|
| Route, layout, loading, error | `src/app/[locale]/...` (thin) |
| Shared UI, no domain logic | `src/components/shared` · `layout` |
| shadcn/ui | `src/components/ui` (do not edit) |
| One feature's domain logic | `src/features/<name>/...` |
| Library config, axios, env, format | `src/lib` |
| Shared Zod schemas | `src/lib/validations` |
| App-wide state | `src/store` |
| Shared hooks | `src/hooks` |
| Constants, routes, roles | `src/constants` |

Before creating anything, search `components/shared`, `hooks`, `lib`, `constants`, `lib/validations` for an existing equivalent. Reuse it.

## 2. Imports
- Always `@/...`. Never `../../..` (only `./` within the same folder).
- Outside a feature, import only via `@/features/<name>` (its `index.ts`).
- A feature never imports another feature. Shared need → move it up to `components/shared`, `lib`, `hooks`, or `types`.
- `components/` never imports `features/`. `lib/`, `types/`, `constants/` never import upward. No circular dependencies.

## 3. TypeScript
- Strict. No `any`, no `@ts-ignore`, no `as` casts to silence the compiler (use `unknown` + type guard or Zod).
- Types come from Zod: `type X = z.infer<typeof xSchema>`. Never hand-write a parallel interface.
- Explicit return types on services and public functions.
- `as const` for constant objects; `satisfies` to check a shape while keeping literals.

## 4. React / Next.js
- Server Component by default. Add `'use client'` only for state, effects, events, browser APIs, or hooks from Query/Zustand/RHF/next-themes, and push it down to the leaf component.
- Function components, named exports (default export only where Next.js requires it).
- `page.tsx` only renders a feature component and optionally `generateMetadata`. No business logic, no `useState`/`useEffect`, no direct `axios`.
- Components ≤ ~150 lines; split beyond that. Props as `interface XxxProps` above the component.
- Do not fetch initial data in `useEffect`. Do not mirror derivable state with `useEffect`; compute during render.
- Stable `key` (id) in lists. `useMemo`/`useCallback`/`memo` only with a measured reason.

## 5. Data layer
- **Service** (`xxx.service.ts`): uses `api` from `@/lib/axios`, parses the response with Zod, returns data or throws `ApiError`. No toast, redirect, or DOM access.
- **Hook** (`useXxx.ts`, `'use client'`): wraps the service in `useQuery`/`useMutation`. Toasts live in `onSuccess`/`onError`.
- **Query keys** always from the key factory (`courseKeys.list(params)`); mutations invalidate the right key group.
- Server data never goes into Zustand. Filter/page/sort/search belong in the URL (`searchParams`).
- All HTTP goes through `lib/axios.ts`; never create another client or hardcode base URLs.

```ts
export async function getCourse(id: string): Promise<Course> {
  const { data } = await api.get<ApiResponse<unknown>>(`/courses/${id}`);
  return courseSchema.parse(data.data);
}
export function useCourse(id: string) {
  return useQuery({ queryKey: courseKeys.detail(id), queryFn: () => getCourse(id) });
}
```

## 6. Forms
`react-hook-form` + `zodResolver(schema)`; form type = `z.infer`; full `defaultValues`; submit button `disabled` while pending; reset after successful create; server errors via `form.setError('field', { message: 'errors.xxx' })`; render with the shared `FormField`.

## 7. Async UI states & Component Lifecycle
Every component fetching API or displaying async data MUST strictly handle the **7-State Matrix**:
1. **Normal / Success**: Real data list/grid/table (`data.length > 0`) with pagination and interactive actions.
2. **Skeleton Loading (`isLoading`)**: Shimmer skeleton layout mirroring the actual UI shape (Card skeleton, Table row skeleton, Header skeleton) — NEVER a solitary full-screen spinner for content areas.
3. **Empty Zero-Data (`!isLoading && data.length === 0 && !hasFilters`)**: First-time user / zero state. Contextual illustration/icon + clear explanation + Primary CTA ("Tạo mới", "Tham gia", "Tải lên").
4. **Empty Filter / Not Found (`!isLoading && data.length === 0 && hasFilters`)**: Search/filter mismatch. MUST be distinct from Zero-Data: do not tell user to create new; display query mismatch message + "Đặt lại bộ lọc" / "Xóa tìm kiếm" CTA.
5. **Specialized / Archived Tab**: Tab-specific states (e.g. Đã lưu trữ / Hết hạn / Bản nháp) with status badges, contextual actions ("Khôi phục") or dedicated tab empty state.
6. **Error State (`isError`)**: Friendly user message via i18n (NEVER raw stack traces/HTTP codes) + warning icon + "Thử lại" button invoking `refetch()`.
7. **Background Fetching (`isFetching && !isLoading`)**: Subtle progress indicator or gentle opacity (`opacity-70 transition-opacity`) without unmounting existing data to eliminate layout shift.
- *Dev State Previews*: Major views should expose a `StatePreviewToolbar` during development (`NODE_ENV === 'development'`) to allow instant QA across all states without manually altering backend data.
- *Route level*: New routes must include `loading.tsx` and `error.tsx`; call `notFound()` when a target record ID does not exist.

## 8. Naming
Folders `kebab-case` · components `PascalCase.tsx` · hooks `useXxx.ts` · services `xxx.service.ts` · schemas `xxx.schema.ts` · stores `useXxxStore.ts` · constants `UPPER_SNAKE_CASE` · booleans `is/has/can/should` · handlers `handleXxx`, props `onXxx`. Routes, roles, permissions come from `constants/`, never string literals. Env vars only via `env` from `lib/env.ts`, never `process.env.X`.

## 9. Cleanliness
No `console.log` (use `lib/logger.ts`), commented-out code, unused imports, or vague TODOs. Comments explain *why*, not *what*.