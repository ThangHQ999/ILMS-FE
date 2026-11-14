'use client';

import React, { use } from 'react';
import { LessonLearningWorkspace } from '@/features/courses';

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function LessonDetailPage({ params }: LessonPageProps) {
  const { id: courseId, lessonId } = use(params);

  return (
    <LessonLearningWorkspace
      courseId={courseId}
      courseCode="CS-202"
      courseName="Cấu trúc dữ liệu & Giải thuật nâng cao"
      classGroup="CS-202 • Nhóm 01"
      lessonId={lessonId}
      chapterNumber="03"
      lessonNumber="02"
      lessonTitle="Cơ chế truyền tin cậy (RDT) & Bắt tay 3 bước TCP"
    />
  );
}

