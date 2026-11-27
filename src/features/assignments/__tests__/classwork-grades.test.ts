import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ClassworkItem, CourseClassGradebook } from '../schemas/classwork.schema';
import {
  buildStudentGradeMap,
  resolveStudentClassworkGrade,
} from '../utils/classworkGrades';

function makeItem(overrides: Partial<ClassworkItem> = {}): ClassworkItem {
  return {
    id: 'item-1',
    type: 'ASSIGNMENT',
    title: 'Bài tập 1',
    description: null,
    publicationStatus: 'PUBLISHED',
    countsTowardGrade: true,
    scoreMax: 10,
    dueDate: null,
    assessmentId: null,
    opensAt: null,
    closesAt: null,
    durationMinutes: null,
    lessonId: null,
    allowLateSubmission: null,
    maxAttempts: null,
    fileAttachmentUrl: null,
    ...overrides,
  };
}

describe('classworkGrades utilities', () => {
  it('returns empty map for undefined or empty gradebook', () => {
    assert.equal(buildStudentGradeMap(undefined).size, 0);
    assert.equal(
      buildStudentGradeMap({
        classId: 'c1',
        courseId: 'co1',
        assessments: [],
        students: { items: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0, isLast: true },
      }).size,
      0,
    );
  });

  it('resolves scores by deliveryId for ASSIGNMENT and assessmentId for QUIZ/EXAM', () => {
    const gradebook: CourseClassGradebook = {
      classId: 'c1',
      courseId: 'co1',
      assessments: [
        {
          id: 'assm-assign-1',
          deliveryId: 'deliv-assign-1',
          title: 'Bài tập văn bản 1',
          type: 'ASSIGNMENT',
          scoreMax: 10,
        },
        {
          id: 'assm-quiz-1',
          deliveryId: 'deliv-quiz-1',
          title: 'Quiz 1',
          type: 'QUIZ',
          scoreMax: 20,
        },
        {
          id: 'assm-exam-1',
          deliveryId: 'deliv-exam-1',
          title: 'Exam 1',
          type: 'EXAM',
          scoreMax: 100,
        },
      ],
      students: {
        items: [
          {
            studentId: 'stu-1',
            studentName: 'Nguyen Van A',
            cells: [
              {
                assessmentId: 'assm-assign-1',
                submissionId: 'sub-1',
                status: 'GRADED',
                score: 8.5,
                scoreMax: 10,
              },
              {
                assessmentId: 'assm-quiz-1',
                submissionId: null,
                status: 'GRADED',
                score: 18,
                scoreMax: null,
              },
              {
                assessmentId: 'assm-exam-1',
                submissionId: null,
                status: 'PENDING_RELEASE',
                score: null,
                scoreMax: 100,
              },
            ],
          },
        ],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 1,
        totalPages: 1,
        isLast: true,
      },
    };

    const gradeMap = buildStudentGradeMap(gradebook);

    assert.deepEqual(
      resolveStudentClassworkGrade(
        makeItem({ id: 'deliv-assign-1', type: 'ASSIGNMENT', assessmentId: null }),
        gradeMap,
        true,
      ),
      { score: 8.5, scoreMax: 10, status: 'GRADED' },
    );

    assert.deepEqual(
      resolveStudentClassworkGrade(
        makeItem({
          id: 'quiz-row-id',
          type: 'QUIZ',
          assessmentId: 'assm-quiz-1',
          scoreMax: 20,
        }),
        gradeMap,
        true,
      ),
      { score: 18, scoreMax: 20, status: 'GRADED' },
    );

    assert.deepEqual(
      resolveStudentClassworkGrade(
        makeItem({
          id: 'exam-row-id',
          type: 'EXAM',
          assessmentId: 'assm-exam-1',
          scoreMax: 100,
        }),
        gradeMap,
        true,
      ),
      { score: null, scoreMax: 100, status: 'PENDING_RELEASE' },
    );
  });

  it('always returns null for NOTE and handles ungraded/unlisted items properly', () => {
    const gradeMap = new Map();

    assert.equal(
      resolveStudentClassworkGrade(makeItem({ id: 'n1', type: 'NOTE' }), gradeMap, true),
      null,
    );

    assert.deepEqual(
      resolveStudentClassworkGrade(
        makeItem({ id: 'a1', type: 'ASSIGNMENT', countsTowardGrade: true, scoreMax: 10 }),
        gradeMap,
        true,
      ),
      { score: null, scoreMax: 10, status: 'NOT_SUBMITTED' },
    );

    assert.equal(
      resolveStudentClassworkGrade(
        makeItem({ id: 'a2', type: 'ASSIGNMENT', countsTowardGrade: false }),
        gradeMap,
        true,
      ),
      null,
    );

    assert.equal(
      resolveStudentClassworkGrade(
        makeItem({ id: 'a3', type: 'ASSIGNMENT', countsTowardGrade: true }),
        gradeMap,
        false,
      ),
      null,
    );
  });
});
