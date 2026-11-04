---
description: Review changes against the project architecture as an independent reviewer
---

# /review

Act as an **independent reviewer**, not the author. **Report only; do NOT edit code** unless the user asked for "review and fix". The one allowed write is appending the review result to the task's report file (step 5).

## 1. Scope
Identify the diff or files to review. Read each changed file and its direct dependencies before judging.

## 2. Automated checks
Run `lint`, `typecheck`, and relevant tests if permitted. Record real results; say so if something could not run.

## 3. Checklist
**A. Architecture** — correct layer? `page.tsx` thin? No cross-feature imports? Imports via `index.ts` and `@/`? Duplicates something in `components/shared`, `hooks`, `lib`?
**B. Correctness** — meets the request? Edge cases (empty, null, network error, 401/403, large data)? Race conditions, stale closures, missing deps, render loops? Mutations invalidate the right keys? Key factory used?
**C. Types & data** — any `any`, `@ts-ignore`, suspicious `as`? Types from Zod? Service free of toast/redirect, parses responses, throws `ApiError`? Server state copied into Zustand?
**D. UI** — loading/error/empty present? Hard-coded colors or stray `dark:`? Correct in light and dark? Responsive? Hardcoded strings? `vi.json`/`en.json` in sync? a11y (labels, aria-label, real buttons, focus, alt)?
**E. Security** — secrets or `NEXT_PUBLIC_*` leaks? Tokens in `localStorage`? `dangerouslySetInnerHTML`? Permission checks only on the client? Unvalidated server input?
**F. Performance & maintainability** — `'use client'` too high? Heavy imports? Fetch waterfalls? Unpaginated long lists? Oversized components, unclear names, dead code, `console.log`?
**G. Tests** — new services/schemas covered? Tests assert behavior, not implementation?

## 4. Report

```text
## Verdict: ✅ Approve | 🟡 Approve with minor changes | ❌ Changes required

## Automated checks
lint … · typecheck … · tests …

## 🔴 Blockers
1. [file:line] Issue — why it matters — suggested fix

## 🟠 Should fix
## 🟡 Nits (optional)
## ✅ Good
```

## 5. Save to the report file (large tasks only)
If a report file for this task exists in `reports/` (see `AGENTS.md` §7), append the review under a `## Review` heading using the same format as step 4. Do not edit any other part of the file. If no report file exists yet and the task is large, create it first per `AGENTS.md` §7. For small tasks, do not create files: keep the review in chat.

## Principles
- Be specific: file, line, reason, fix. No vague remarks.
- Severity must be honest; a personal preference is never a blocker.
- Report only real issues. If there are none, say so.
- Group repeated occurrences of the same issue into one item.