import type { AssignmentItem, MySubmission } from '../types';
import type { ClassDetailData } from '@/features/classes/schemas/class-detail.schema';
import type { UserProfile } from '@/features/auth/schemas/auth.schema';

export interface CanSubmitEvaluation {
  canSubmit: boolean;
  hasExistingSubmission: boolean;
  canEditSubmission: boolean;
  reason?:
    | 'ASSIGNMENT_NOT_LOADED'
    | 'ALREADY_SUBMITTED'
    | 'NOT_ACTIVE_STUDENT'
    | 'CLASS_READ_ONLY'
    | 'DEADLINE_PASSED'
    | 'OK';
  message?: string;
}

/**
 * Đánh giá điều kiện cho phép nộp bài tập lần đầu và chỉnh sửa bài nộp.
 * Dùng chung một điều kiện cho nút “Nộp bài ngay”, route /submit và handler gửi:
 * 1. Học viên có vai trò STUDENT trạng thái ACTIVE trong lớp
 * 2. Lớp và liên kết môn còn cho phép ghi (!isArchived và có active course link)
 * 3. Chưa có bài nộp ở bất kỳ trạng thái nào (!hasExistingSubmission)
 * 4. Còn hạn nộp hoặc được phép nộp muộn (dueDate = null nghĩa là không có hạn)
 * 5. Khi đã có bài nộp ở bất kỳ trạng thái nào: ẩn “Chỉnh sửa bài nộp” nếu đã hết lượt hoặc chưa có dữ liệu xác nhận còn lượt.
 */
export function evaluateCanSubmitAssignment({
  assignment,
  submission,
  classDetail,
  currentUser,
}: {
  assignment?: AssignmentItem | null;
  submission?: MySubmission | null;
  classDetail?: ClassDetailData | null;
  currentUser?: UserProfile | null;
}): CanSubmitEvaluation {
  // 1. Kiểm tra trạng thái bài nộp hiện tại
  const hasExistingSubmission = Boolean(
    submission && submission.status && submission.status !== 'NOT_SUBMITTED'
  );

  // Kiểm tra lượt nộp còn lại để quyết định có cho phép "Chỉnh sửa bài nộp" hay không:
  // "Ẩn Chỉnh sửa bài nộp nếu đã hết lượt hoặc chưa có dữ liệu xác nhận còn lượt"
  const attempt = submission?.submissionAttempt ?? 1;
  const maxAttempts = submission?.maxAttempts;
  const hasConfirmedRemainingAttempts =
    typeof maxAttempts === 'number' && maxAttempts > attempt;

  const canEditSubmission =
    hasExistingSubmission &&
    hasConfirmedRemainingAttempts &&
    submission?.status !== 'GRADED';

  if (!assignment) {
    return {
      canSubmit: false,
      hasExistingSubmission,
      canEditSubmission,
      reason: 'ASSIGNMENT_NOT_LOADED',
      message: 'Thông tin bài tập chưa được tải đầy đủ.',
    };
  }

  // Nếu đã có bài nộp ở bất kỳ trạng thái nào -> không cho nộp lần đầu
  if (hasExistingSubmission) {
    return {
      canSubmit: false,
      hasExistingSubmission,
      canEditSubmission,
      reason: 'ALREADY_SUBMITTED',
      message: 'Học viên đã có bài nộp cho bài tập này.',
    };
  }

  // 2. Học viên có vai trò STUDENT trạng thái ACTIVE trong lớp
  const isMockAssignment =
    assignment.id.startsWith('assign-db') || assignment.classId === 'csdl-k22-01';

  let isStudentActive = isMockAssignment;

  if (!isMockAssignment && classDetail?.callerRole) {
    const memberStatus = classDetail.classInfo.memberStatus;
    isStudentActive = classDetail.callerRole === 'STUDENT'
      && (!memberStatus || memberStatus === 'ACTIVE' || memberStatus === 'APPROVED');
  } else if (!isMockAssignment) {
    if (currentUser) {
      const normalizedRole = (currentUser.roleName || '').toUpperCase();
      const email = (currentUser.email || '').toLowerCase().trim();
      const isExplicitNonStudentRole =
        normalizedRole.includes('ADMIN') || normalizedRole.includes('TEACHER');
      const isFallbackStudentRole =
        !isExplicitNonStudentRole &&
        (normalizedRole === 'STUDENT' ||
          normalizedRole === 'ROLE_STUDENT' ||
          normalizedRole === 'ROLE_USER' ||
          normalizedRole === 'USER' ||
          email.includes('@stu.'));

      if (classDetail?.members && classDetail.members.length > 0) {
        const member = classDetail.members.find(
          (m) =>
            m.id === currentUser.id ||
            m.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (member) {
          isStudentActive =
            member.role === 'STUDENT' &&
            (member.status === 'APPROVED' || (member.status as string) === 'ACTIVE');
        } else if (classDetail.isMembersLive) {
          isStudentActive = false;
        } else {
          isStudentActive = isFallbackStudentRole;
        }
      } else {
        isStudentActive = isFallbackStudentRole;
      }
    } else {
      isStudentActive = true; // Backend Auth Guard remains final authority
    }
  }

  if (!isStudentActive) {
    return {
      canSubmit: false,
      hasExistingSubmission,
      canEditSubmission,
      reason: 'NOT_ACTIVE_STUDENT',
      message: 'Chỉ học viên có trạng thái hoạt động trong lớp mới có thể nộp bài.',
    };
  }

  // 3. Lớp và liên kết môn còn cho phép ghi
  const isClassWritable = classDetail?.classInfo?.status !== 'ARCHIVED';
  const isCourseWritable =
    !classDetail?.courses ||
    classDetail.courses.length === 0 ||
    classDetail.courses.some((c) => c.status === 'ACTIVE' && (!assignment.courseId || c.id === assignment.courseId));

  if (!isClassWritable || !isCourseWritable) {
    return {
      canSubmit: false,
      hasExistingSubmission,
      canEditSubmission,
      reason: 'CLASS_READ_ONLY',
      message: 'Lớp học hoặc môn học hiện đang ở chế độ chỉ đọc.',
    };
  }

  // 4. Còn hạn hoặc được nộp muộn (dueDate = null nghĩa là không có hạn; null allowLateSubmission !== true)
  if (assignment.dueDate) {
    const isPastDue = new Date(assignment.dueDate).getTime() < Date.now();
    if (isPastDue && assignment.allowLateSubmission !== true) {
      return {
        canSubmit: false,
        hasExistingSubmission,
        canEditSubmission,
        reason: 'DEADLINE_PASSED',
        message: 'Đã quá hạn nộp bài và bài tập không cho phép nộp muộn.',
      };
    }
  }

  return {
    canSubmit: true,
    hasExistingSubmission,
    canEditSubmission,
    reason: 'OK',
  };
}

export interface CanCancelEvaluation {
  canCancel: boolean;
  reason?:
    | 'NO_SUBMISSION'
    | 'ALREADY_GRADED'
    | 'NOT_OWNER'
    | 'CLASS_READ_ONLY'
    | 'INVALID_STATUS'
    | 'OK';
  message?: string;
}

/**
 * Đánh giá điều kiện cho phép hủy bài nộp (DELETE /api/v1/submissions/{id}):
 * - Chỉ cho phép hủy khi bài nộp tồn tại và ở trạng thái chờ chấm: SUBMITTED, RESUBMITTED, hoặc LATE.
 * - Khóa tuyệt đối quyền hủy khi bài đã chấm điểm (GRADED hoặc đã có điểm số).
 * - Không cho phép hủy khi chưa có bài nộp hoặc trạng thái là NOT_SUBMITTED.
 * - Đúng Student là chủ bài nộp khi có currentUser.
 * - Lớp và liên kết môn còn cho phép ghi (!isArchived).
 * - Không tự khóa Hủy chỉ vì quá hạn hoặc hết lượt sửa (backend xác nhận điều kiện cuối cùng).
 */
export function evaluateCanCancelSubmission({
  submission,
  currentUser,
  classDetail,
}: {
  submission?: MySubmission | null;
  currentUser?: UserProfile | null;
  classDetail?: { classInfo?: { status?: string } } | ClassDetailData | null;
}): CanCancelEvaluation {
  if (!submission || !submission.status || submission.status === 'NOT_SUBMITTED') {
    return {
      canCancel: false,
      reason: 'NO_SUBMISSION',
      message: 'Chưa có bài nộp để hủy.',
    };
  }

  // Khóa hủy khi bài đã chấm điểm
  if (
    submission.status === 'GRADED' ||
    (typeof submission.score === 'number' && submission.score !== null)
  ) {
    return {
      canCancel: false,
      reason: 'ALREADY_GRADED',
      message: 'Bài tập đã được chấm điểm, không thể hủy bài nộp.',
    };
  }

  // Kiểm tra chủ bài nộp nếu có thông tin người dùng
  if (currentUser?.id && submission.studentId && !submission.studentId.startsWith('student-demo')) {
    if (String(currentUser.id) !== String(submission.studentId)) {
      return {
        canCancel: false,
        reason: 'NOT_OWNER',
        message: 'Bạn không phải là người nộp bài tập này.',
      };
    }
  }

  // Kiểm tra quyền ghi của lớp
  if (classDetail?.classInfo?.status === 'ARCHIVED') {
    return {
      canCancel: false,
      reason: 'CLASS_READ_ONLY',
      message: 'Lớp học đã lưu trữ, không thể thực hiện thao tác hủy.',
    };
  }

  // Cho phép hủy đối với các trạng thái nộp bài chờ chấm (kể cả khi quá hạn nộp)
  if (
    submission.status === 'SUBMITTED' ||
    submission.status === 'RESUBMITTED' ||
    submission.status === 'LATE'
  ) {
    return {
      canCancel: true,
      reason: 'OK',
    };
  }

  return {
    canCancel: false,
    reason: 'INVALID_STATUS',
    message: 'Trạng thái bài nộp không hỗ trợ hủy.',
  };
}

export interface CanEditSubmissionEvaluation {
  canEdit: boolean;
  reason?:
    | 'NO_SUBMISSION'
    | 'ALREADY_GRADED'
    | 'NOT_OWNER'
    | 'CLASS_READ_ONLY'
    | 'DEADLINE_PASSED'
    | 'MAX_ATTEMPTS_REACHED'
    | 'OK';
  message?: string;
}

/**
 * Đánh giá điều kiện cho phép chỉnh sửa bài nộp (PATCH /api/v1/assignments/{id}/submissions):
 * - Phải có bài nộp ở trạng thái chờ chấm (SUBMITTED, RESUBMITTED, LATE).
 * - Chưa có chấm điểm (status !== 'GRADED' và score === null).
 * - Đúng Student là chủ bài nộp.
 * - Lớp học không ở chế độ chỉ đọc (!isArchived).
 * - Chưa quá hạn nộp bài (dueDate == null nghĩa là không có hạn; allowLateSubmission=true KHÔNG cho phép PATCH sau hạn).
 */
export function evaluateCanEditSubmission({
  assignment,
  submission,
  currentUser,
  classDetail,
}: {
  assignment?: AssignmentItem | null;
  submission?: MySubmission | null;
  currentUser?: UserProfile | null;
  classDetail?: { classInfo?: { status?: string } } | ClassDetailData | null;
}): CanEditSubmissionEvaluation {
  if (!submission || !submission.status || submission.status === 'NOT_SUBMITTED') {
    return {
      canEdit: false,
      reason: 'NO_SUBMISSION',
      message: 'Chưa có bản nộp nào để chỉnh sửa.',
    };
  }

  // Khóa khi bài đã chấm
  if (
    submission.status === 'GRADED' ||
    (typeof submission.score === 'number' && submission.score !== null)
  ) {
    return {
      canEdit: false,
      reason: 'ALREADY_GRADED',
      message: 'Bài tập đã được chấm điểm, không thể chỉnh sửa bài nộp.',
    };
  }

  // Kiểm tra chủ bài và tư cách học viên hợp lệ trong lớp
  if (currentUser?.id && submission.studentId && !submission.studentId.startsWith('student-demo')) {
    if (String(currentUser.id) !== String(submission.studentId)) {
      return {
        canEdit: false,
        reason: 'NOT_OWNER',
        message: 'Bạn không phải là chủ sở hữu bản nộp này.',
      };
    }
  }

  const fullClassDetail = classDetail as ClassDetailData | null | undefined;
  const isMockEditAssignment =
    assignment?.id?.startsWith('assign-db') || assignment?.classId === 'csdl-k22-01';
  if (
    !isMockEditAssignment &&
    currentUser &&
    fullClassDetail?.isMembersLive &&
    Array.isArray(fullClassDetail.members) &&
    fullClassDetail.members.length > 0
  ) {
    const member = fullClassDetail.members.find(
      (m) =>
        m.id === currentUser.id ||
        m.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );
    const isActiveMemberStudent = Boolean(
      member &&
        member.role === 'STUDENT' &&
        (member.status === 'APPROVED' || (member.status as string) === 'ACTIVE')
    );
    if (!isActiveMemberStudent) {
      return {
        canEdit: false,
        reason: 'NOT_OWNER',
        message: 'Chỉ học viên đang hoạt động trong lớp mới có thể chỉnh sửa bài nộp.',
      };
    }
  }

  // Kiểm tra lớp ghi
  if (classDetail?.classInfo?.status === 'ARCHIVED') {
    return {
      canEdit: false,
      reason: 'CLASS_READ_ONLY',
      message: 'Lớp học ở chế độ chỉ đọc, không thể chỉnh sửa.',
    };
  }

  // Kiểm tra hạn nộp: allowLateSubmission=true không cho phép PATCH sau hạn
  if (assignment?.dueDate) {
    const isPastDue = new Date(assignment.dueDate).getTime() < Date.now();
    if (isPastDue) {
      return {
        canEdit: false,
        reason: 'DEADLINE_PASSED',
        message: 'Không thể chỉnh sửa vì đã quá hạn nộp.',
      };
    }
  }

  // Chỉ kết luận hết lượt khi response thật sự xác nhận rõ cả maxAttempts và submissionAttempt
  if (
    typeof submission.maxAttempts === 'number' &&
    submission.maxAttempts > 0 &&
    typeof submission.submissionAttempt === 'number' &&
    submission.submissionAttempt >= submission.maxAttempts
  ) {
    return {
      canEdit: false,
      reason: 'MAX_ATTEMPTS_REACHED',
      message: 'Bạn đã hết lượt chỉnh sửa.',
    };
  }

  return {
    canEdit: true,
    reason: 'OK',
  };
}
