'use client';

import React from 'react';
import type { CreateLessonInput } from '../../schemas/course.schema';
import { CurriculumAuthoringModal } from './CurriculumAuthoringModal';

export interface CreateLessonModalProps {
  isOpen: boolean;
  chapterId: string | null;
  chapterTitle?: string;
  onClose: () => void;
  onSubmit: (input: CreateLessonInput) => void;
  isLoading?: boolean;
  courseCode?: string;
  courseTitle?: string;
  chapters?: Array<{ id: string; title: string }>;
  onToast?: (message: string) => void;
}

export function CreateLessonModal({
  isOpen,
  chapterId,
  chapterTitle,
  onClose,
  onSubmit,
  isLoading = false,
  courseCode = 'CS-202',
  courseTitle,
  chapters = [],
  onToast,
}: CreateLessonModalProps) {
  return (
    <CurriculumAuthoringModal
      isOpen={isOpen}
      initialTab="lesson"
      courseCode={courseCode}
      courseTitle={courseTitle}
      chapterId={chapterId}
      chapterTitle={chapterTitle}
      chapters={chapters}
      onClose={onClose}
      onSubmitLesson={(input) => onSubmit(input)}
      isLoading={isLoading}
      onToast={onToast}
    />
  );
}
