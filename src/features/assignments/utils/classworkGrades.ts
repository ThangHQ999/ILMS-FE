import type { ClassworkItem, CourseClassGradebook } from '../schemas/classwork.schema';

export interface StudentClassworkGrade {
  score: number | null;
  scoreMax: number | null;
  status: string;
}

/**
 * Indexes a student's `/gradebook/me` cells by both `deliveryId` (for assignments)
 * and `assessmentId` (for quizzes/exams) so classwork cards resolve in O(1).
 */
export function buildStudentGradeMap(
  gradebook?: CourseClassGradebook,
): Map<string, StudentClassworkGrade> {
  const map = new Map<string, StudentClassworkGrade>();
  const student = gradebook?.students.items[0];
  if (!gradebook || !student) return map;

  const cellByAssessmentId = new Map(
    student.cells.map((cell) => [cell.assessmentId, cell]),
  );

  for (const col of gradebook.assessments) {
    const cell = cellByAssessmentId.get(col.id);
    const entry: StudentClassworkGrade = {
      score: cell?.score ?? null,
      scoreMax: cell?.scoreMax ?? col.scoreMax ?? null,
      status: cell?.status ?? 'NOT_SUBMITTED',
    };
    map.set(col.deliveryId, entry);
    map.set(col.id, entry);
  }

  for (const cell of student.cells) {
    if (!map.has(cell.assessmentId)) {
      map.set(cell.assessmentId, {
        score: cell.score,
        scoreMax: cell.scoreMax ?? null,
        status: cell.status,
      });
    }
  }

  return map;
}

/**
 * Resolves the current student's score/status for a classwork item.
 * Notes (`NOTE`) never carry a grade.
 */
export function resolveStudentClassworkGrade(
  item: ClassworkItem,
  gradeMap: Map<string, StudentClassworkGrade>,
  hasGradebookData: boolean,
): StudentClassworkGrade | null {
  if (item.type === 'NOTE') return null;

  const found =
    gradeMap.get(item.id) ??
    (item.assessmentId ? gradeMap.get(item.assessmentId) : undefined);

  if (found) {
    return {
      score: found.score,
      scoreMax: found.scoreMax ?? item.scoreMax ?? null,
      status: found.status,
    };
  }

  if (hasGradebookData && item.countsTowardGrade) {
    return {
      score: null,
      scoreMax: item.scoreMax ?? null,
      status: 'NOT_SUBMITTED',
    };
  }

  return null;
}
