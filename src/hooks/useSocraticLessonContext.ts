'use client';

import { useSyncExternalStore } from 'react';

export interface SocraticBlockContext {
  id: string;
  type: string;
  title?: string;
  contentText: string;
}

export interface SocraticLessonContext {
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  chapterTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  materialIds?: string[];
  activeBlock?: SocraticBlockContext | null;
}

export const OPEN_SOCRATIC_COACH_EVENT = 'ilms_open_socratic_coach';

let currentContext: SocraticLessonContext | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentContext;
}

function getServerSnapshot() {
  return null;
}

export function setSocraticLessonContext(ctx: SocraticLessonContext | null) {
  currentContext = ctx;
  listeners.forEach((listener) => listener());
}

export function setSocraticActiveBlock(block: SocraticBlockContext | null) {
  currentContext = {
    ...(currentContext ?? {}),
    activeBlock: block,
  };
  listeners.forEach((listener) => listener());
}

export function askOwlAboutBlock(block: SocraticBlockContext) {
  setSocraticActiveBlock(block);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_SOCRATIC_COACH_EVENT));
  }
}

export interface SocraticConceptContext {
  id: string;
  label: string;
  definition?: string;
  materialTitle?: string;
  topic?: string;
  courseId?: string;
  courseName?: string;
  suggestedPrompt?: string;
  processes?: Array<{ name: string; steps?: Array<{ action: string }> | string[] }>;
  exercises?: Array<{ title?: string; question?: string }>;
  examples?: Array<{ title?: string; content?: string }>;
}

export function askOwlAboutConcept(concept: SocraticConceptContext) {
  let fullContext = `Khái niệm tri thức: "${concept.label}"`;
  if (concept.topic) {
    fullContext += `\n- Thuộc chủ đề: ${concept.topic}`;
  }
  if (concept.materialTitle) {
    fullContext += `\n- Nguồn học liệu: ${concept.materialTitle}`;
  }
  if (concept.definition && concept.definition.trim()) {
    fullContext += `\n- Định nghĩa / Nội dung cốt lõi:\n${concept.definition.trim()}`;
  }
  if (concept.processes && concept.processes.length > 0) {
    fullContext += `\n- Quy trình / Thuật toán liên quan (${concept.processes.length}): ${concept.processes.map((p, idx) => `${idx + 1}. ${p.name}`).join('; ')}`;
  }
  if (concept.exercises && concept.exercises.length > 0) {
    fullContext += `\n- Bài tập rèn luyện (${concept.exercises.length}): ${concept.exercises.map((e, idx) => `${idx + 1}. ${e.title || e.question || 'Bài tập'}`).join('; ')}`;
  }
  if (concept.examples && concept.examples.length > 0) {
    fullContext += `\n- Ví dụ minh họa (${concept.examples.length}): ${concept.examples.map((ex, idx) => `${idx + 1}. ${ex.title || 'Ví dụ'}`).join('; ')}`;
  }

  currentContext = {
    ...(currentContext ?? {}),
    courseId: concept.courseId || currentContext?.courseId,
    courseName: concept.courseName || currentContext?.courseName,
    activeBlock: {
      id: concept.id,
      type: 'KHÁI NIỆM TRI THỨC',
      title: concept.label,
      contentText: fullContext,
    },
  };
  listeners.forEach((listener) => listener());

  if (typeof window !== 'undefined') {
    const prompt =
      concept.suggestedPrompt || `Hãy hướng dẫn tôi tìm hiểu khái niệm "${concept.label}" một cách chi tiết theo phương pháp Socratic.`;
    window.dispatchEvent(
      new CustomEvent(OPEN_SOCRATIC_COACH_EVENT, {
        detail: { prompt, conceptId: concept.id, title: concept.label },
      })
    );
  }
}

export function useSocraticLessonContext(): SocraticLessonContext | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
