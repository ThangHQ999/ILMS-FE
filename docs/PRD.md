# PRD — ILMS (Integrated Learning Management System)

> **Status: DRAFT.** Everything marked `[ASSUMED]` was inferred and must be confirmed by the product owner. Agents: do not build `[ASSUMED]` items that are not in the current task; ask first. Replace this banner once confirmed.

## 1. Overview
- **Product:** web application for managing online/blended learning: courses, learners, instructors, assessment, progress, and reporting. `[ASSUMED: "ILMS" = Integrated Learning Management System]`
- **Frontend scope:** this repo is the Next.js frontend; the backend exposes a REST API (`docs/api-spec.md`).
- **Languages:** Vietnamese (default) and English.
- **Primary goals:** `[FILL: e.g. reduce admin effort, track learner progress, deliver content and assessments online]`

## 2. Roles
| Role | Key | Description |
|---|---|---|
| Administrator | `admin` | Manages users, roles, system settings, all courses, reports |
| Manager | `manager` | Oversees departments/classes, assigns courses, views reports `[ASSUMED]` |
| Instructor | `instructor` | Creates and teaches courses, grades work, tracks their learners |
| Student / Learner | `student` | Enrolls, studies, submits work, takes quizzes, views grades/certificates |

> `constants/roles.ts` must match this table. The earlier template roles (`admin`, `manager`, `user`) are replaced by these.

## 3. Modules → feature folders
| Module | Folder | Phase | Summary |
|---|---|---|---|
| Authentication | `features/auth` | MVP | Login, logout, forgot/reset password, session |
| Users & roles | `features/users` | MVP | CRUD users, assign roles, activate/deactivate |
| Courses | `features/courses` | MVP | CRUD course, status (draft/published/archived), category, cover image |
| Course content | `features/lessons` | MVP | Sections/lessons, content types (video, document, text), ordering |
| Enrollment | `features/enrollments` | MVP | Enroll/unenroll, bulk assign, enrollment status |
| Learning player | `features/learning` | MVP | Student view: lesson navigation, mark complete, progress |
| Assignments | `features/assignments` | Phase 2 | Create, submit, grade, feedback |
| Quizzes | `features/quizzes` | Phase 2 | Question bank, attempts, auto-grading |
| Grades | `features/grades` | Phase 2 | Gradebook per course/learner |
| Classes / cohorts | `features/classes` | Phase 2 `[ASSUMED]` | Group learners, schedule, attendance |
| Announcements & notifications | `features/notifications` | Phase 2 | In-app notices, read state |
| Certificates | `features/certificates` | Phase 3 `[ASSUMED]` | Issue/download on completion |
| Reports & dashboards | `features/reports` | Phase 2 | Role-based dashboards, export |
| Settings & profile | `features/settings` | MVP | Profile, language, theme, password |

Each module = one feature folder; modules never import each other (promote shared code per `ARCHITECTURE.md` §5).

## 4. Permission matrix (proposed → `constants/permissions.ts`)
| Permission | admin | manager | instructor | student |
|---|---|---|---|---|
| `user:read` / `user:manage` | ✅/✅ | ✅/❌ | ❌/❌ | ❌/❌ |
| `course:read` | ✅ | ✅ | ✅ (own + published) | ✅ (enrolled/published) |
| `course:create` / `course:update` | ✅ | ✅ | ✅ (own) | ❌ |
| `course:delete` / `course:publish` | ✅ | ✅ | own `[ASSUMED]` | ❌ |
| `enrollment:manage` | ✅ | ✅ | own courses | ❌ |
| `learning:access` | ✅ | ❌ | ✅ (preview) | ✅ |
| `grade:read` / `grade:manage` | ✅/✅ | ✅/❌ | own courses | own/❌ |
| `report:read` | ✅ | ✅ | own courses | own progress |
| `settings:manage` | ✅ | ❌ | ❌ | ❌ |
Server enforces everything; the UI only hides/disables (`ARCHITECTURE.md` §15).

## 5. Key user stories (MVP)
**Student**
- As a student, I can sign in, see my enrolled courses with progress, and continue where I left off.
- I can open a lesson, consume its content, and mark it complete; my course progress updates.
- I can browse the published catalog and enroll `[ASSUMED: self-enroll allowed]`.

**Instructor**
- I can create a course (title, description, category, cover), organize sections/lessons, and publish/unpublish it.
- I can see who is enrolled and their progress.

**Admin / Manager**
- I can create, edit, deactivate users and assign roles.
- I can enroll users in courses individually or in bulk.
- I can view dashboards: active users, enrollments, completion rate.

**All**
- I can switch language (vi/en) and theme (light/dark/system), and edit my profile/password.

## 6. Business rules `[ASSUMED]`
- A course has status `draft → published → archived`; only `published` courses are visible to students.
- Enrollment status: `active | completed | dropped | pending`.
- Course progress = completed lessons ÷ total required lessons (server-calculated; the UI displays it).
- Deactivated users cannot sign in; their history is retained.
- Deleting a course with enrollments is not allowed: archive instead.

## 7. Non-functional
- Responsive (mobile-first); learners commonly use phones.
- Accessible (WCAG AA), keyboard navigable.
- Performance: list pages paginated server-side; media lazy-loaded; target LCP `[FILL]`.
- Security: see `ARCHITECTURE.md` §21; learner data isolation enforced server-side.
- Browser support: `[FILL]`.

## 8. Out of scope (for now)
Payments/e-commerce, live video classes, mobile native apps, SCORM/xAPI import `[ASSUMED — confirm]`.

## 9. Open questions
1. What does "ILMS" stand for in your organization, and who are the real roles?
2. Is there an existing backend/API? Provide the OpenAPI spec if so.
3. Who creates courses: instructors only, or admins as well?
4. Self-enrollment vs. assignment only?
5. Content types required at MVP (video hosting? file upload? SCORM?).
6. Single organization or multi-tenant?
7. SSO (Google/Microsoft/LDAP) required?