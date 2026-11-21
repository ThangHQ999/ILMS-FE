/**
 * Danh mục mã lỗi và cấu hình thông báo khi người dùng chạm trần hạn mức (Quota Limits)
 */

export const QUOTA_EXCEEDED_EVENT = 'ilms_quota_exceeded';

export interface QuotaConfig {
  code: string;
  status: number;
  title: string;
  message: string;
  actionText: string;
  link: string;
  secondaryActionText?: string;
  secondaryLink?: string;
  icon: string;
  badge: string;
  benefitHighlight: string;
}

export const QUOTA_ERRORS = {
  STORAGE_QUOTA_EXCEEDED: {
    code: 'STORAGE_QUOTA_EXCEEDED',
    status: 400,
    title: 'Hết dung lượng lưu trữ đám mây',
    message: 'Dung lượng lưu trữ đám mây của bạn đã hết. Vui lòng nâng cấp gói cước hoặc xóa bớt tệp',
    actionText: 'Nâng cấp dung lượng ngay',
    link: '/pricing',
    secondaryActionText: 'Quản lý tệp lưu trữ',
    secondaryLink: '/settings?tab=billing',
    icon: 'cloud_off',
    badge: 'Bộ nhớ đám mây',
    benefitHighlight: 'Mở rộng lên đến 50 GB Cloud Storage cho giáo trình, slide & video bài giảng.',
  },
  FILE_SIZE_EXCEEDED_PLAN_LIMIT: {
    code: 'FILE_SIZE_EXCEEDED_PLAN_LIMIT',
    status: 400,
    title: 'Tệp tải lên vượt kích thước gói',
    message: 'Kích thước tệp vượt quá giới hạn tối đa của gói tài khoản hiện tại',
    actionText: 'Nâng cấp gói cước ngay',
    link: '/pricing',
    icon: 'upload_file',
    badge: 'Kích thước tệp tin',
    benefitHighlight: 'Cho phép tải lên tệp tin dung lượng lớn đến 2 GB mỗi tệp với băng thông siêu tốc.',
  },
  COURSE_CREATION_LIMIT_REACHED: {
    code: 'COURSE_CREATION_LIMIT_REACHED',
    status: 403,
    title: 'Đạt giới hạn số lượng môn học',
    message: 'Bạn đã đạt số lượng môn học tối đa của gói hiện tại. Vui lòng nâng cấp gói để tạo thêm môn học',
    actionText: 'Nâng cấp tạo thêm môn học',
    link: '/pricing',
    icon: 'menu_book',
    badge: 'Môn học & Giáo trình',
    benefitHighlight: 'Tạo không giới hạn môn học và đề cương chi tiết chuẩn kiểm định.',
  },
  CLASS_CREATION_LIMIT_REACHED: {
    code: 'CLASS_CREATION_LIMIT_REACHED',
    status: 403,
    title: 'Đạt giới hạn số lượng lớp học',
    message: 'Bạn đã đạt số lượng lớp học tối đa của gói hiện tại. Vui lòng nâng cấp gói để tạo thêm lớp học',
    actionText: 'Nâng cấp tạo thêm lớp học',
    link: '/pricing',
    icon: 'school',
    badge: 'Lớp học trực tuyến',
    benefitHighlight: 'Mở rộng không giới hạn sĩ số và số lượng lớp học trong cùng học kỳ.',
  },
  AI_DAILY_LIMIT_EXCEEDED: {
    code: 'AI_DAILY_LIMIT_EXCEEDED',
    status: 429,
    title: 'Hết lượt hỏi Trợ lý AI hôm nay',
    message: 'Bạn đã dùng hết lượt hỏi Trợ lý AI hôm nay. Vui lòng quay lại vào ngày mai hoặc nâng cấp gói cước',
    actionText: 'Mở khóa AI không giới hạn',
    link: '/pricing',
    icon: 'smart_toy',
    badge: 'Trợ lý AI Socratic',
    benefitHighlight: 'Hỏi đáp Socratic và phân tích bài toán không giới hạn lượt truy vấn mỗi ngày.',
  },
  KNOWLEDGE_GRAPH_QUOTA_EXCEEDED: {
    code: 'KNOWLEDGE_GRAPH_QUOTA_EXCEEDED',
    status: 403,
    title: 'Hết hạn mức Đồ thị tri thức tháng này',
    message: 'Bạn đã đạt giới hạn bóc tách Đồ thị tri thức của tháng này. Vui lòng nâng cấp gói cước để tiếp tục',
    actionText: 'Nâng cấp gói bóc tách ngay',
    link: '/pricing',
    icon: 'hub',
    badge: 'Đồ thị tri thức Neo4j',
    benefitHighlight: 'Bóc tách hàng trăm giáo trình, xây dựng ontology kiến thức tự động không giới hạn.',
  },
} as const;

export type QuotaErrorCode = keyof typeof QUOTA_ERRORS;

export interface QuotaExceededDetail {
  errorCode: string;
  message?: string;
  status?: number;
  config?: QuotaConfig;
}

/**
 * Kiểm tra xem một mã lỗi hoặc chuỗi lỗi có thuộc nhóm hạn mức Quota hay không
 */
export function isQuotaErrorCode(code?: string | null): code is QuotaErrorCode {
  if (!code) return false;
  return Object.prototype.hasOwnProperty.call(QUOTA_ERRORS, code);
}

/**
 * Lấy cấu hình hiển thị tương ứng với mã lỗi Quota
 */
export function getQuotaConfig(code?: string | null): QuotaConfig | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  if (isQuotaErrorCode(upper)) {
    return QUOTA_ERRORS[upper];
  }
  // Tìm kiếm theo từ khóa nếu backend trả về message
  if (upper.includes('STORAGE_QUOTA') || upper.includes('DUNG LƯỢNG LƯU TRỮ')) {
    return QUOTA_ERRORS.STORAGE_QUOTA_EXCEEDED;
  }
  if (upper.includes('FILE_SIZE') || upper.includes('KÍCH THƯỚC TỆP')) {
    return QUOTA_ERRORS.FILE_SIZE_EXCEEDED_PLAN_LIMIT;
  }
  if (upper.includes('COURSE_CREATION') || upper.includes('SỐ LƯỢNG MÔN HỌC')) {
    return QUOTA_ERRORS.COURSE_CREATION_LIMIT_REACHED;
  }
  if (upper.includes('CLASS_CREATION') || upper.includes('SỐ LƯỢNG LỚP HỌC')) {
    return QUOTA_ERRORS.CLASS_CREATION_LIMIT_REACHED;
  }
  if (upper.includes('AI_DAILY') || upper.includes('LƯỢT HỎI TRỢ LÝ AI')) {
    return QUOTA_ERRORS.AI_DAILY_LIMIT_EXCEEDED;
  }
  if (upper.includes('KNOWLEDGE_GRAPH_QUOTA') || upper.includes('ĐỒ THỊ TRI THỨC CỦA THÁNG')) {
    return QUOTA_ERRORS.KNOWLEDGE_GRAPH_QUOTA_EXCEEDED;
  }
  return null;
}

/**
 * Kích hoạt mở Popup Nâng cấp gói toàn cục
 */
export function triggerQuotaUpgradeModal(detail: {
  errorCode: string;
  message?: string;
  status?: number;
}) {
  if (typeof window === 'undefined') return;
  const config = getQuotaConfig(detail.errorCode);
  window.dispatchEvent(
    new CustomEvent<QuotaExceededDetail>(QUOTA_EXCEEDED_EVENT, {
      detail: {
        errorCode: detail.errorCode,
        message: detail.message || config?.message,
        status: detail.status || config?.status,
        config: config || undefined,
      },
    })
  );
}
