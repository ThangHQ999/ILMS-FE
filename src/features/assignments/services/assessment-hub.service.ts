import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';
import { getAllClassAssignments, getMySubmissionsBatch } from './assignment.service';
import { getQuizzes, publishQuiz } from './quiz.service';
import { fetchAllClassExams, publishExam } from './exam.service';
import { assessmentPlayHref } from '../utils/classworkRoutes';
import type {
  HubClassSummary,
  HubCourseOption,
  UnifiedAssessmentItem,
  UnifiedAssessmentStatus,
} from '../schemas/assessment-hub.schema';

function extractList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.content)) return obj.content;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.data)) return obj.data;
  return [];
}

/**
 * Fetch user's active classes for Assessment Hub (teaching + enrolled, excluding PENDING membership).
 */
export async function getHubClasses(): Promise<HubClassSummary[]> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>('/classes', {
      params: { status: 'ACTIVE', page: 0, size: 50 },
    });
    const rawList = extractList(data?.data ?? data);
    return rawList
      .map((entry): HubClassSummary | null => {
        if (!entry || typeof entry !== 'object') return null;
        const rec = entry as Record<string, unknown>;
        const id = String(rec.id ?? '').trim();
        if (!id) return null;

        const rawRole = String(rec.teachingRole ?? 'STUDENT').toUpperCase();
        const teachingRole: HubClassSummary['teachingRole'] =
          rawRole === 'OWNER'
            ? 'OWNER'
            : rawRole === 'PRIMARY_INSTRUCTOR'
              ? 'PRIMARY_INSTRUCTOR'
              : rawRole === 'TEACHER'
                ? 'TEACHER'
                : rawRole === 'TA'
                  ? 'TA'
                  : 'STUDENT';

        const rawMemberStatus =
          rec.memberStatus ?? rec.membershipStatus ?? rec.myStatus ?? rec.enrollmentStatus;
        const memberStatus = rawMemberStatus
          ? String(rawMemberStatus).toUpperCase().trim()
          : undefined;

        return {
          id,
          name: String(rec.name ?? rec.title ?? 'Lớp học'),
          title: String(rec.title ?? rec.name ?? 'Lớp học'),
          classCode: rec.classCode
            ? String(rec.classCode)
            : rec.enrollmentKey
              ? String(rec.enrollmentKey)
              : undefined,
          teachingRole,
          memberStatus,
          enrolledCount: Number(rec.enrolledCount ?? 0),
        };
      })
      .filter((c): c is HubClassSummary => Boolean(c && c.memberStatus !== 'PENDING'));
  } catch {
    return [];
  }
}

/**
 * Fetch courses assigned to a specific class for cascading Class -> Course filter.
 * Endpoint: GET /api/v1/classes/{classId}/courses
 */
export async function getHubClassCourses(classId: string): Promise<HubCourseOption[]> {
  if (!classId || classId === 'ALL') return [];
  try {
    const { data } = await api.get<ApiResponse<unknown>>(`/classes/${classId}/courses`);
    const list = extractList(data?.data ?? data);
    const seen = new Set<string>();
    const options: HubCourseOption[] = [];

    for (const entry of list) {
      if (!entry || typeof entry !== 'object') continue;
      const rec = entry as Record<string, unknown>;
      const nested =
        rec.course && typeof rec.course === 'object'
          ? (rec.course as Record<string, unknown>)
          : undefined;
      const id = String(rec.courseId ?? nested?.id ?? rec.id ?? '').trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      options.push({
        id,
        code: rec.courseCode
          ? String(rec.courseCode)
          : nested?.code
            ? String(nested.code)
            : undefined,
        name: String(rec.courseTitle ?? rec.courseName ?? nested?.title ?? nested?.name ?? 'Môn học'),
      });
    }
    return options;
  } catch {
    return [];
  }
}

function isPastDue(iso?: string | null): boolean {
  if (!iso) return false;
  const ts = new Date(iso).getTime();
  return !Number.isNaN(ts) && ts < Date.now();
}

/**
 * Aggregate Assignments + Quizzes + Exams across target classes into a single Unified DTO list.
 */
export async function getUnifiedAssessments(
  classes: HubClassSummary[],
  mode: 'STUDENT' | 'TEACHER'
): Promise<UnifiedAssessmentItem[]> {
  if (classes.length === 0) return [];

  const perClassResults = await Promise.allSettled(
    classes.map(async (cls) => {
      const [assignmentsRes, quizzesRes, examsRes] = await Promise.allSettled([
        getAllClassAssignments(cls.id),
        getQuizzes({ classId: cls.id }),
        fetchAllClassExams(cls.id),
      ]);

      const assignments = assignmentsRes.status === 'fulfilled' ? assignmentsRes.value : [];
      const quizzes = quizzesRes.status === 'fulfilled' ? quizzesRes.value : [];
      const exams = examsRes.status === 'fulfilled' ? examsRes.value : [];

      const mySubmissionsMap =
        mode === 'STUDENT' && assignments.length > 0
          ? await getMySubmissionsBatch(assignments.map((a) => a.id))
          : {};

      const items: UnifiedAssessmentItem[] = [];

      // 1. Assignments
      for (const a of assignments) {
        const mySub = mySubmissionsMap[a.id];
        let status: UnifiedAssessmentStatus = 'OPEN';
        if (mode === 'STUDENT') {
          if (mySub?.status === 'GRADED') status = 'GRADED';
          else if (
            mySub?.status === 'SUBMITTED' ||
            mySub?.status === 'RESUBMITTED' ||
            mySub?.status === 'LATE'
          ) {
            status = 'SUBMITTED';
          } else if (isPastDue(a.dueDate)) {
            status = 'OVERDUE';
          } else {
            status = 'TODO';
          }
        } else {
          const pending = a.pendingGradingCount ?? 0;
          if (pending > 0) status = 'NEEDS_GRADING';
          else if (isPastDue(a.dueDate)) status = 'CLOSED';
          else status = 'OPEN';
        }

        const actionHref =
          mode === 'STUDENT'
            ? status === 'TODO' || status === 'OVERDUE'
              ? `/classes/${cls.id}/assignments/${a.id}/submit`
              : `/classes/${cls.id}/assignments/${a.id}`
            : `/classes/${cls.id}/assignments/${a.id}`;

        items.push({
          id: a.id,
          kind: 'ASSIGNMENT',
          classId: cls.id,
          className: cls.title || cls.name,
          classCode: cls.classCode,
          courseId: a.courseId ?? null,
          courseName: null,
          title: a.title,
          description: a.description ?? null,
          startTime: a.createdAt ?? null,
          dueDate: a.dueDate ?? null,
          durationMinutes: null,
          questionCount: null,
          maxScore: a.maxScore ?? 10,
          status,
          isPublished: true,
          studentSubmissionId: mySub?.id ?? null,
          studentScore: mySub?.score ?? null,
          studentSubmittedAt: mySub?.submittedAt ?? null,
          studentFeedback: mySub?.feedback ?? null,
          totalStudents: a.totalStudents ?? cls.enrolledCount ?? 0,
          submittedCount: a.submittedCount ?? 0,
          pendingGradingCount: a.pendingGradingCount ?? 0,
          averageScore: a.classAverageScore ?? null,
          actionHref,
          createdAt: a.createdAt ?? null,
        });
      }

      // 2. Quizzes
      for (const q of quizzes) {
        const rawStatus = String(q.status ?? '').toUpperCase();
        const isDraft = rawStatus === 'DRAFT';
        if (mode === 'STUDENT' && isDraft) continue;

        let status: UnifiedAssessmentStatus = 'OPEN';
        if (mode === 'STUDENT') {
          status = isPastDue(q.endTime) ? 'OVERDUE' : 'TODO';
        } else {
          if (isDraft) status = 'DRAFT';
          else if (isPastDue(q.endTime) || rawStatus === 'COMPLETED' || rawStatus === 'ARCHIVED') {
            status = 'CLOSED';
          } else {
            status = 'OPEN';
          }
        }

        items.push({
          id: q.id,
          kind: 'QUIZ',
          classId: cls.id,
          className: cls.title || cls.name,
          classCode: cls.classCode,
          courseId: q.courseId ?? null,
          courseName: null,
          title: q.title,
          description: null,
          startTime: q.startTime ?? null,
          dueDate: q.endTime ?? null,
          durationMinutes: q.durationMinutes ?? null,
          questionCount: q.questionCount ?? 0,
          maxScore: q.maxScore ?? 10,
          status,
          isPublished: !isDraft,
          studentScore: null,
          totalStudents: q.totalStudents ?? cls.enrolledCount ?? 0,
          submittedCount: q.submittedCount ?? 0,
          pendingGradingCount: 0,
          averageScore: q.avgScore ?? null,
          actionHref:
            mode === 'STUDENT'
              ? assessmentPlayHref(cls.id, q.assessmentId ?? q.id, 'QUIZ', q.courseId)
              : `/assignments/analytics?${new URLSearchParams({ quizId: q.id, classId: cls.id })}`,
          createdAt: null,
        });
      }

      // 3. Exams
      for (const ex of exams) {
        const isDraft = ex.isPublished === false;
        if (mode === 'STUDENT' && isDraft) continue;

        let status: UnifiedAssessmentStatus = 'OPEN';
        if (mode === 'STUDENT') {
          const attempt = ex.studentAttempt;
          if (attempt?.status === 'GRADED') status = 'GRADED';
          else if (attempt?.status === 'SUBMITTED') status = 'SUBMITTED';
          else if (ex.status === 'CLOSED' || isPastDue(ex.endTime)) status = 'OVERDUE';
          else status = 'TODO';
        } else {
          if (isDraft) status = 'DRAFT';
          else if (ex.status === 'CLOSED' || isPastDue(ex.endTime)) status = 'CLOSED';
          else status = 'OPEN';
        }

        items.push({
          id: ex.id,
          kind: 'EXAM',
          classId: cls.id,
          className: cls.title || cls.name,
          classCode: cls.classCode,
          courseId: ex.courseId ?? null,
          courseName: ex.courseName ?? null,
          title: ex.title,
          description: ex.description ?? null,
          startTime: ex.startTime || null,
          dueDate: ex.endTime || null,
          durationMinutes: ex.durationMinutes ?? null,
          questionCount: ex.questionCount ?? 0,
          maxScore: ex.totalScore ?? ex.maxScore ?? 10,
          status,
          isPublished: !isDraft,
          studentSubmissionId: ex.studentAttempt?.id ?? null,
          studentScore: ex.studentAttempt?.score ?? null,
          studentSubmittedAt: ex.studentAttempt?.submittedAt ?? null,
          totalStudents: cls.enrolledCount ?? 0,
          submittedCount: null,
          pendingGradingCount: 0,
          averageScore: null,
          actionHref: `/classes/${cls.id}/exams/${ex.id}`,
          createdAt: ex.createdAt ?? null,
        });
      }

      return items;
    })
  );

  const merged: UnifiedAssessmentItem[] = [];
  for (const res of perClassResults) {
    if (res.status === 'fulfilled') {
      merged.push(...res.value);
    }
  }

  // Sort: soonest deadline first, then newest createdAt
  return merged.sort((a, b) => {
    const ta = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const tb = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return cb - ca;
  });
}

export async function publishHubItem(kind: 'QUIZ' | 'EXAM', id: string): Promise<void> {
  if (kind === 'QUIZ') {
    await publishQuiz(id);
  } else {
    await publishExam(id);
  }
}
