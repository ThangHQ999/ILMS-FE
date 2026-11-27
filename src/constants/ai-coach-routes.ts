/**
 * Cấu hình danh sách Whitelist & Blacklist Routes cho Trợ lý AI Socratic nhỏ (Global Floating Coach)
 */

export type RouteFilterMode = 'blacklist' | 'whitelist';

export interface AiCoachRouteConfig {
  /** Chế độ lọc: 'blacklist' (cho phép mọi trang trừ blacklist) hoặc 'whitelist' (chỉ cho phép các trang trong whitelist) */
  mode: RouteFilterMode;
  /** Danh sách tiền tố hoặc đường dẫn tuyệt đối cấm hiển thị AI Coach */
  blacklist: string[];
  /** Danh sách tiền tố hoặc đường dẫn tuyệt đối cho phép hiển thị AI Coach (khi mode = 'whitelist') */
  whitelist: string[];
}

export const AI_COACH_ROUTE_CONFIG: AiCoachRouteConfig = {
  mode: 'blacklist',
  blacklist: [
    // Trang Trợ lý AI chuyên dụng toàn màn hình (đã có canvas chat lớn)
    '/ai-tutor',
    // Trang Tin nhắn Messenger 3 cột (tránh che ô soạn tin)
    '/chat',
    // Các trang xác thực & tài khoản
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    // Trang thiết lập ban đầu
    '/onboarding',
  ],
  whitelist: [
    '/',
    '/dashboard',
    '/classes',
    '/assignments',
    '/competency',
    '/knowledge-graph',
    '/materials',
    '/tasks',
    '/lesson-sessions',
    '/settings',
    '/pricing',
    '/privacy',
    '/terms',
  ],
};

/**
 * Kiểm tra xem một đường dẫn (pathname) có được phép hiển thị con AI nhỏ hay không.
 */
export function isAiCoachRouteAllowed(
  pathname: string,
  config: AiCoachRouteConfig = AI_COACH_ROUTE_CONFIG
): boolean {
  if (!pathname) return false;

  // Chuẩn hóa đường dẫn loại bỏ trailing slash (trừ root '/')
  const normalized = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  const matchesPattern = (pattern: string) => {
    if (pattern === normalized) return true;
    // Hỗ trợ wildcard hoặc route con (e.g., /ai-tutor matches /ai-tutor/abc)
    if (normalized.startsWith(`${pattern}/`)) return true;
    return false;
  };

  if (config.mode === 'blacklist') {
    const isBlacklisted = config.blacklist.some(matchesPattern);
    return !isBlacklisted;
  }

  // Whitelist mode
  return config.whitelist.some(matchesPattern);
}
