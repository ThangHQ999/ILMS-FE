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
      lessonId={lessonId}
    />
  );
}

