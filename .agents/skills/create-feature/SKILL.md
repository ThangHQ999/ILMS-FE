---
name: create-feature
description: Create a new feature under src/features following the project's Feature-Driven architecture (Zod schema, service, query keys, hooks, i18n, components, thin route, tests). Use when asked to add a new module, page, or capability backed by an API (e.g. courses, users, orders).
---

# SKILL: create-feature

Placeholders: `<feature>` = plural kebab-case (`courses`), `<Entity>` = PascalCase singular (`Course`), `<entity>` = camelCase singular (`course`). Reference: `ARCHITECTURE.md` §4.3 and §23.

## 0. Preconditions
- Product spec (`docs/PRD.md`) and endpoints (`docs/api-spec.md`) exist. If not, **ask**; never invent fields or endpoints.
- Similar features/components were checked for reuse.
- For large work, an approved `/plan` exists.

## 1. Skeleton (create only folders you need)
```text
src/features/<feature>/
├── components/  ├── hooks/  ├── services/  ├── schemas/
├── constants.ts     # query keys, enums
├── types.ts         # only for types not derivable from schemas
└── index.ts         # public API
```
Add `store/` only if state truly must be shared inside the feature.

## 2. Schema — `schemas/<feature>.schema.ts`
```ts
export const <entity>Schema = z.object({ id: z.string(), /* per api-spec */ createdAt: z.string() });
export const create<Entity>Schema = z.object({ /* messages are i18n keys: { message: 'validation.required' } */ });
export const update<Entity>Schema = create<Entity>Schema.partial();
export type <Entity> = z.infer<typeof <entity>Schema>;
export type Create<Entity>Input = z.infer<typeof create<Entity>Schema>;
```
Reuse shared schemas from `@/lib/validations`.

## 3. Query keys — `constants.ts`
```ts
export const <entity>Keys = {
  all: ['<feature>'] as const,
  lists: () => [...<entity>Keys.all, 'list'] as const,
  list: (params: <Entity>ListParams) => [...<entity>Keys.lists(), params] as const,
  details: () => [...<entity>Keys.all, 'detail'] as const,
  detail: (id: string) => [...<entity>Keys.details(), id] as const,
};
```

## 4. Service — `services/<feature>.service.ts`
Use `api` from `@/lib/axios`; parse with the schema; return data or throw `ApiError`. Functions: `get<Entities>`, `get<Entity>`, `create<Entity>`, `update<Entity>`, `delete<Entity>`. No toast/redirect/DOM. Explicit return types.

## 5. Hooks — `hooks/` (`'use client'`)
- Queries: `use<Entities>(params)`, `use<Entity>(id)` with the key factory.
- Mutations: `useCreate/Update/Delete<Entity>`; `onSuccess` invalidates `lists()` (and `detail(id)` for update/delete) and shows an i18n toast; `onError` shows `error.message`.

## 6. i18n — add to BOTH `vi.json` and `en.json`
```json
"<feature>": {
  "title": "", "meta": { "title": "" },
  "list": { "empty": "", "emptyDescription": "" },
  "form": {}, "actions": { "create": "", "edit": "", "delete": "" },
  "messages": { "createSuccess": "", "updateSuccess": "", "deleteSuccess": "" }
}
```
Add any missing shared `validation.*` / `errors.*` keys. Follow `docs/glossary.md`.

## 7. Components — `components/`
`<Entity>List` (loading → Skeleton, error → `ErrorState` + retry, empty → `EmptyState`, success), `<Entity>Card`/`Table`, `<Entity>Form` (RHF + zodResolver + `FormField`), delete confirmation via `ConfirmDialog`. Tokens only, `cn()`, mobile-first, a11y. Gate actions with `usePermission` where roles apply. Filters/pagination/search live in `searchParams`.

## 8. Public API — `index.ts`
Export only what outside code needs: main components and public types.

## 9. Route — `src/app/[locale]/(dashboard)/<feature>/`
Thin `page.tsx` (`generateMetadata` from i18n + render feature component), `loading.tsx`, `error.tsx` (`'use client'`, retry via `reset()`), `[id]/page.tsx` with `notFound()` when missing.

## 10. Constants & navigation
Add `ROUTES.<FEATURE>` / `ROUTES.<FEATURE>_DETAIL(id)` to `constants/routes.ts`; permissions to `constants/permissions.ts` if needed; a Sidebar entry (route via `ROUTES`, label via i18n).

## 11. Tests (workflow `/test`)
Schema valid/invalid cases; service with mocked `api` (valid and malformed payloads); key hooks/components (loading, error, empty, form submit).

## 12. Final check
- [ ] No cross-feature imports; external imports via `index.ts`; `@/` alias
- [ ] Thin `page.tsx`; `'use client'` only where needed
- [ ] Types from Zod; no `any`; key factory used
- [ ] No hardcoded strings; `vi.json` and `en.json` keys match
- [ ] Tokens only; correct in light/dark; responsive; a11y
- [ ] Loading/error/empty handled
- [ ] `lint`, `typecheck`, tests pass (`build` for large changes)
- [ ] `TASKS.md` updated; report per `AGENTS.md` §7, including endpoints used and i18n keys added