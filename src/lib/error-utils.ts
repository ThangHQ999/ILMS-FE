import { ZodError } from 'zod';
import { ApiError } from '@/types/common';

const TECHNICAL_PATTERNS = [
  /^\s*\[[\s\S]*"code"\s*:/,
  /^\s*\{[\s\S]*"code"\s*:/,
  /invalid input:\s*expected/i,
  /request failed with status code/i,
  /network error/i,
  /econnrefused|etimedout|enotfound/i,
  /unexpected token/i,
  /cannot read propert/i,
];

function isTechnicalMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function getHttpFallback(status: number, fallback: string): string {
  switch (status) {
    case 400:
      return 'Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.';
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 404:
      return 'Không tìm thấy dữ liệu yêu cầu.';
    case 409:
      return 'Dữ liệu bị trùng hoặc xung đột với bản ghi hiện có.';
    default:
      return status >= 500
        ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
        : fallback;
  }
}

/**
 * Convert any thrown error (ZodError, ApiError, Axios/Network Error, unknown)
 * into a clean, human-readable Vietnamese message safe for UI banners and toasts.
 */
export function getUserFriendlyErrorMessage(
  err: unknown,
  fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'
): string {
  if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ZodError intercepted]', err);
    }
    return 'Dữ liệu phản hồi từ hệ thống chưa đúng định dạng. Vui lòng thử lại.';
  }

  if (err instanceof ApiError) {
    if (err.message && !isTechnicalMessage(err.message)) {
      return err.message;
    }
    return getHttpFallback(err.httpStatus, fallback);
  }

  if (err instanceof Error) {
    if (!isTechnicalMessage(err.message)) {
      return err.message;
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Technical error intercepted]', err.message);
    }
    return fallback;
  }

  return fallback;
}
