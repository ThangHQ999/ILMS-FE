# ADR-0001: Feature-Driven architecture on Next.js App Router
- **Date:** 2026-10-10 · **Status:** accepted
## Context
ILMS has many independent modules (courses, enrollments, quizzes, grades...). A flat `components/` + `types.ts` structure does not scale and makes AI-assisted changes error-prone.
## Decision
Organize by feature under `src/features/<name>/`; keep `src/app/` routing-only; share code only via `components/shared`, `lib`, `hooks`, `types`; no cross-feature imports. Details: `ARCHITECTURE.md`.
## Alternatives considered
Layer-first folders (components/services/hooks at root) — rejected: poor locality, tangled dependencies.
## Consequences
Only `src/features/` grows with the product; shared code must be promoted deliberately; ESLint boundaries enforce the rules.