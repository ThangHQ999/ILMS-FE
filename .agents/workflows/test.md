---
description: Write and run tests (Vitest + React Testing Library; Playwright for E2E)
---

# /test

## 1. What to test
| Target | Type | Tool |
|---|---|---|
| Utils, `format`, Zod schemas with logic | Unit | Vitest |
| Services (`*.service.ts`) | Unit, mock `api` | Vitest |
| Business hooks | Hook | `renderHook` + RTL |
| Components with conditions/interaction | Component | Vitest + RTL |
| Core flows (login, main CRUD) | E2E | Playwright (`e2e/`) |

Prioritize by risk: business logic, permissions, money flows, error handling over purely presentational components.

## 2. Rules
1. Place tests next to the source: `CourseCard.test.tsx`, `courses.service.test.ts`.
2. Test user-visible behavior, not internals.
3. Query by `getByRole`, `getByLabelText`, `getByText`; avoid class/id/test-id unless necessary.
4. Use `userEvent`, not `fireEvent`, unless required.
5. Mock the network (MSW or mock `@/lib/axios`). Never hit a real API.
6. Components needing i18n/Query/Theme: use one shared `renderWithProviders` (create it once in `src/test-utils` if missing).
7. Tests are independent of order; reset mocks between tests.
8. Names describe behavior: `it('shows error state when request fails')`.
9. Every test has a meaningful assertion; no tests written only for coverage.

## 3. Examples
```ts
describe('getCourses', () => {
  it('parses the response and returns items', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true, data: { items: [validCourse], page: 1, pageSize: 10, total: 1, totalPages: 1 } } });
    expect((await getCourses({ page: 1 })).items).toHaveLength(1);
  });
  it('throws when the payload does not match the schema', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true, data: { items: [{ bad: true }], page: 1, pageSize: 10, total: 1, totalPages: 1 } } });
    await expect(getCourses({ page: 1 })).rejects.toThrow();
  });
});
```

## 4. Run & handle failures
1. Run targeted tests first (`[pm] test <path>`), then the full suite. Run once, not in watch mode.
2. Red test → decide whether the **code or the test** is wrong and fix the root cause. Never delete assertions, `skip`, or `only` to get green.
3. Flaky test → find the cause (async, timers, order); do not just raise timeouts.
4. Max 3 fix iterations on the same failure, then report (see `00-global.md` §8).

## 5. Report
```text
Added: <test files, case count>
Result: pass X / fail Y / skip Z
Covers: <behaviors verified>
Not covered: <gaps and why>
```