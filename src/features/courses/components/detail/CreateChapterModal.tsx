'use client';

import React from 'react';
import type { CreateChapterInput } from '../../schemas/course.schema';
import { CurriculumAuthoringModal } from './CurriculumAuthoringModal';

export interface CreateChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateChapterInput) => void;
  isLoading?: boolean;
  courseCode?: string;
  courseTitle?: string;
  chapters?: Array<{ id: string; title: string }>;
  onToast?: (message: string) => void;
}

export function CreateChapterModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  courseCode = 'CS-202',
  courseTitle,
  chapters = [],
  onToast,
}: CreateChapterModalProps) {
  return (
    <CurriculumAuthoringModal
      isOpen={isOpen}
      initialTab="chapter"
      courseCode={courseCode}
      courseTitle={courseTitle}
      chapters={chapters}
      onClose={onClose}
      onSubmitChapter={onSubmit}
      isLoading={isLoading}
      onToast={onToast}
    />
  );
}
