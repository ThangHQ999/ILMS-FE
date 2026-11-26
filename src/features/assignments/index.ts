export * from './types';
export * from './constants';
export * from './services/assignment.service';
export * from './services/quiz.service';
export * from './services/exam.service';
export { publishExam, unpublishExam } from './services/exam.service';
export * from './hooks/useAssignments';
export * from './hooks/useGradeProgress';
export * from './hooks/useAiRecommendation';
export * from './hooks/useStudentPerformance';
export * from './hooks/useClassHubInfo';
export * from './hooks/useQuizzes';
// Assignment queries (excluding internal useAssignmentGradingProgress)
export {
  useAssignmentDetail,
  useAssignmentItem,
  useClassAssignmentsPaged,
  type UseClassAssignmentsPagedOptions,
  isAssignmentUnsubmitted,
  isAssignmentPending,
  isAssignmentPendingGrading,
  isAssignmentSubmitted,
  isAssignmentGraded,
  useClassAssignmentsWithSubmissions,
  type EnrichedAssignment,
  type AssignmentKpiStats,
  useClassActiveCourses,
  useCourseLessons,
} from './hooks/useAssignmentQueries';

export * from './hooks/useAssignmentMutations';
export * from './hooks/useStudentSubmissions';
export * from './hooks/useTeacherSubmissions';

// Exam queries (excluding internal useVisibleExamDetails, VisibleExamDetailEntry)
export {
  useClassExamsPaged,
  useAllClassExams,
  useExamDetail,
} from './hooks/useExamQueries';

export * from './hooks/useExamMutations';
export * from './hooks/useExamQuestions';
export * from './utils/submissionValidation';

// Module 5 Components
export { StudentAssignmentsTableView } from './components/StudentAssignmentsTableView';
export { StudentExamsTableView } from './components/StudentExamsTableView';
export { StudentExamDetailView } from './components/StudentExamDetailView';
export { TeacherAssignmentsTableView } from './components/TeacherAssignmentsTableView';
export { TeacherExamsTableView } from './components/TeacherExamsTableView';
export { TeacherCreateAssignmentFormView } from './components/TeacherCreateAssignmentFormView';
export { TeacherEditAssignmentFormView } from './components/TeacherEditAssignmentFormView';
export { TeacherCreateExamFormView } from './components/TeacherCreateExamFormView';
export { TeacherEditExamFormView } from './components/TeacherEditExamFormView';
export { TeacherExamDetailView } from './components/TeacherExamDetailView';
export { TeacherAssignmentSubmissionsPageView } from './components/TeacherAssignmentSubmissionsPageView';
export { TeacherSubmissionDetailView } from './components/TeacherSubmissionDetailView';
export { DeleteGradingConfirmModal } from './components/DeleteGradingConfirmModal';
export { DueDatePicker } from './components/DueDatePicker';
export { StudentAssignmentsPageView } from './components/StudentAssignmentsPageView';
export { StudentAssignmentDetailPageView } from './components/StudentAssignmentDetailPageView';
export { StudentAssignmentSubmissionPageView } from './components/StudentAssignmentSubmissionPageView';

// Upstream Assessment & Matrix Components
export { AssignmentsTabView } from './components/AssignmentsTabView';
export { ClassCourseMatrixView } from './components/ClassCourseMatrixView';
export { ClassHubHeader } from './components/ClassHubHeader';
export { AssignmentFilterToolbar } from './components/AssignmentFilterToolbar';
export { AssignmentActiveCluster } from './components/AssignmentActiveCluster';
export { AssignmentCompletedCluster } from './components/AssignmentCompletedCluster';
export { AssignmentUpcomingCluster } from './components/AssignmentUpcomingCluster';
export { GradeWeightsPanel } from './components/GradeWeightsPanel';
export { SocraticAiMentorPanel } from './components/SocraticAiMentorPanel';
export { PersonalPerformancePanel } from './components/PersonalPerformancePanel';

// Upstream Quiz Management Views & Modals
export { TeacherExamManagementView } from './components/teacher/TeacherExamManagementView';
export { TeacherCreateQuizStudioView } from './components/teacher/TeacherCreateQuizStudioView';
export { TeacherQuizAnalyticsView } from './components/teacher/TeacherQuizAnalyticsView';
export { TeacherQuestionBankView } from './components/teacher/TeacherQuestionBankView';
export { AiExamBlueprintStudioModal } from './components/teacher/AiExamBlueprintStudioModal';
export { TeacherLiveProctoringView } from './components/teacher/TeacherLiveProctoringView';
export { AiRagQuestionGeneratorModal } from './components/teacher/AiRagQuestionGeneratorModal';
export { ImportWordExcelModal } from './components/teacher/ImportWordExcelModal';

// Unified Assessment Hub (/assignments)
export * from './schemas/assessment-hub.schema';
export * from './hooks/useAssessmentHub';
export { AssessmentHubPageView } from './components/hub/AssessmentHubPageView';

// Question Bank (/assignments/question-bank)
export * from './hooks/useQuestionBankManager';
export { QuestionBankPageView } from './components/question-bank/QuestionBankPageView';
export { AzotaEditorSplitView } from './components/question-bank/AzotaEditorSplitView';
export { ClassworkWorkspace } from './components/classwork/ClassworkWorkspace';
export { classworkKeys, useClassworkContexts } from './hooks/useClasswork';
export { getClassworkDraft, saveClassworkDraft, publishClasswork } from './services/classwork.service';
export { assessmentPlayHref } from './utils/classworkRoutes';
export { getQuestionsPage, createBankQuestion, batchCreateQuestions } from './services/question-bank.service';
export {
  AZOTA_SAMPLE_TEXT,
  parseAzotaQuestionsText,
  parseQuickAnswerKey,
  applyAnswerAndDifficultyOverrides,
  type AzotaParsedQuestion,
} from './utils/azota-question-parser';
export { AssessmentPlayer } from './components/AssessmentPlayer';
