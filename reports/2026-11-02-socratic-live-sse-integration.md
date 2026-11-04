# Socratic live SSE integration

Date: 2026-11-02
Plan: extend existing request DTO and SSE transport, handle status/live draft/replacement/final/error in the current chat UI. Authorized by the user's request to read and fix both projects.

STATUS: PARTIAL (runtime not verified)
SUMMARY: Protocol 2 fields pass through the Spring DTO. The existing authenticated student identity is preserved. The emitter relays event names/data/comments immediately and cancels upstream on disconnect. Frontend requests protocol 2, renders task status in the assistant bubble, appends tokens, replaces drafts, treats done.full_content as authoritative and marks interrupted/aborted streams incomplete.
CHECKS: static review only; compile/lint/typecheck/tests/build not run per the user's standing instruction. No app/DB/LLM calls.
ASSUMPTIONS: Python V2 is enabled and its current SSE contract is deployed. Frontend and Spring are separate projects. No new dependency or schema/config change.
LIMITATIONS: No automatic retry/resume or artifact renderer added. Each explicit send gets a new request ID; any future network retry must reuse the original payload. UI and Gateway behavior require manual verification.
DEPLOYMENT: not deployed.
NEXT: restart services and inspect protocol_version=2, status, token before done, content_replace and incomplete-stream behavior.

## Review
Removed fake successful completion on truncated streams; unknown/malformed events never become response text. Protocol 1 DTO default remains 1 for existing callers. No changes to login, UUID encoding, database selection, migrations or environment files.
