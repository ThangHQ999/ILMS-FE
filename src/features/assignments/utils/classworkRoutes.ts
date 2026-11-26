export function assessmentPlayHref(
  classId: string,
  assessmentId: string,
  kind: 'QUIZ' | 'EXAM',
  courseId?: string | null,
): string {
  const query = new URLSearchParams({ type: kind.toLowerCase() });
  if (courseId) query.set('courseId', courseId);
  return `/classes/${encodeURIComponent(classId)}/assessments/${encodeURIComponent(assessmentId)}/play?${query}`;
}

export function assignmentHref(classId: string, assignmentId: string): string {
  return `/classes/${encodeURIComponent(classId)}/assignments/${encodeURIComponent(assignmentId)}`;
}
