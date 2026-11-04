---
description: Produce an implementation plan before coding (large tasks or multi-layer changes)
---

# /plan

**Planning only. Do NOT create or edit code files in this workflow.**

## 1. Gather context
1. Read `TASKS.md` and the request.
2. Read what is relevant: `docs/PRD.md`, `docs/api-spec.md`, the matching section of `ARCHITECTURE.md`.
3. Scan existing code: similar features, reusable components/hooks/utils, existing i18n keys, tokens.

## 2. Clarify
If critical information is missing, ask at most 3 questions in one message, each with a proposed default. If a reasonable assumption lets you proceed, state it instead of asking.

## 3. Output the plan

```text
## Goal
<1–2 sentences>

## Scope
- In: ...
- Out: ...

## Assumptions
- ...

## Design
- Layers/folders affected:
- Data flow: UI → hook → service → endpoint
- New Zod schemas / types:
- State: server (Query) / URL / Zustand / local, and why
- i18n: namespace + new keys
- UI: shadcn components, tokens, loading/error/empty states, permissions

## Files
| Action | Path | Purpose |
|---|---|---|

## Steps (each leaves the repo working)
1. ...

## Verification
- Tests to write:
- Manual checks: light/dark, vi/en, mobile/desktop, roles

## Risks / decisions needed
- ...
```

## 4. Wait for approval
End with: "Confirm (or adjust) this plan and I will start." **Do not code before approval.**

## Principles
- Prefer the simplest design that fits the architecture. No new dependency unless essential (then ask permission).
- Too big → split into phases that can each be reviewed independently.
- After approval, record a short version under "In progress" in `TASKS.md`.