import { TeacherQuizAnalyticsView } from '@/features/assignments/components/teacher/TeacherQuizAnalyticsView';

export default async function QuizAnalyticsPage({ searchParams }: {
  searchParams: Promise<{ quizId?: string | string[]; classId?: string | string[] }>;
}) {
  const { quizId, classId } = await searchParams;
  return <TeacherQuizAnalyticsView
    initialQuizId={typeof quizId === 'string' ? quizId : undefined}
    initialClassId={typeof classId === 'string' ? classId : undefined}
  />;
}
