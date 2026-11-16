'use client';

import React, { use } from 'react';
import { LessonLearningWorkspace, useCourse } from '@/features/courses';

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function LessonDetailPage({ params }: LessonPageProps) {
  const { id: courseId, lessonId } = use(params);
  const { course, chapters } = useCourse(courseId);

  // Find dynamic chapter and lesson
  let foundChapter: (typeof chapters)[number] | undefined;
  let foundLesson: (typeof chapters)[number]['lessons'][number] | undefined;
  let chapterIndex = 1;
  let lessonIndex = 1;

  for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
    const ch = chapters[cIdx];
    const lIdx = ch?.lessons ? ch.lessons.findIndex((l: { id: string }) => l.id === lessonId) : -1;
    if (lIdx >= 0 && ch.lessons[lIdx]) {
      foundChapter = ch;
      foundLesson = ch.lessons[lIdx];
      chapterIndex = cIdx + 1;
      lessonIndex = lIdx + 1;
      break;
    }
  }

  const courseCode = course?.courseCode || 'CS-202';
  const courseName = course?.name || 'Cấu trúc dữ liệu & Giải thuật nâng cao';
  const classGroup = course?.className || `${courseCode} • Nhóm 01`;
  const chapterNumber = String(foundChapter?.orderIndex ?? chapterIndex).padStart(2, '0');
  const lessonNumber = String(foundLesson?.orderIndex ?? lessonIndex).padStart(2, '0');
  const lessonTitle = foundLesson?.title || 'Cơ chế truyền tin cậy (RDT) & Bắt tay 3 bước TCP';

  return (
    <LessonLearningWorkspace
      courseId={courseId}
      courseCode={courseCode}
      courseName={courseName}
      classGroup={classGroup}
      lessonId={lessonId}
      chapterNumber={chapterNumber}
      lessonNumber={lessonNumber}
      lessonTitle={lessonTitle}
    />
  );
}

