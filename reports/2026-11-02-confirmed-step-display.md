# Backend-confirmed exercise step display

Date: 2026-11-02
STATUS: PARTIAL (runtime not verified)
SUMMARY: Only explicit step_progress metadata can enable message badges and the progress card. Concept discussion, review and exercises without real ordered steps do not display numbered steps. Removed the frontend fallback of three steps. The session_init counter is no longer stamped onto the assistant message before that turn completes.
CONTRACT: Python emits step_progress (nullable) with step_id, exercise_id, number, total, instruction and completed. Metadata is stored in existing turn_metadata.public; no DB migration. step_number_at_turn is null when no confirmed exercise step exists. Spring preserves metadata on historical messages, SSE remains pass-through. Frontend validates and uses metadata for live completion and loaded history; missing metadata hides labels, including old ambiguous history.
CHECKS: static syntax/review only; no app, tests, Java compile, typecheck or build run per the user's standing instruction.
LIMITATIONS: No backfill of ambiguous old steps. Exercises without explicit stored steps intentionally have no numbered progress. No unrelated authentication, database, streaming animation or dependencies changed.
DOCS: TASKS and docs/api-spec updated.
DEPLOYMENT: not deployed.
NEXT: restart services and check concept chat has no badge/card, real exercise uses the exact backend total, switching back to concepts clears progress, and reload retains only confirmed historical steps.

## Review
No inferred progress from current_step_number=1, Process presence or a guessed three-step total. Historical labels use per-message metadata, not the session's current exercise state. No applied migrations changed.
