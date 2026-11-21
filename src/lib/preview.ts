'use client';

import type { ActiveRole } from '@/constants/roles';
import { globalRoleStore } from './role-store';

export const PREVIEW_STORAGE_KEY = 'ilms_preview_mode';
export const PREVIEW_CHANGE_EVENT = 'ilms_preview_mode_changed';

export interface DemoUserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roleName: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Danh tính Demo dành riêng cho môi trường preview/thiết kế giao diện
 * Tuyệt đối không cấp quyền, không liên kết API hay token/cookie thực tế.
 */
export const DEMO_TEACHER_USER: DemoUserProfile = {
  id: '3e8a1f44-8c72-4d1a-b620-000000000001',
  email: 'namlh@ptit.edu.vn',
  username: 'namlh',
  firstName: 'Nam',
  lastName: 'TS. Lê Hoàng',
  roleName: 'TEACHER',
  roles: ['TEACHER'],
  status: 'ACTIVE',
};

export const DEMO_STUDENT_USER: DemoUserProfile = {
  id: '3e8a1f44-8c72-4d1a-b620-000000000001',
  email: 'minhtn@stu.ptit.edu.vn',
  username: '22028192',
  firstName: 'Minh',
  lastName: 'Trần Nhật',
  roleName: 'STUDENT',
  roles: ['STUDENT'],
  status: 'ACTIVE',
};

/**
 * Lấy tài khoản demo phù hợp theo vai trò được chọn
 */
export function getDemoUser(role?: ActiveRole | null): DemoUserProfile {
  const effectiveRole = role ?? globalRoleStore.getSnapshot();
  return effectiveRole === 'TEACHER' ? DEMO_TEACHER_USER : DEMO_STUDENT_USER;
}

/**
 * Kiểm tra xem chế độ Preview có đang được chủ động kích hoạt hay không.
 * Điều kiện tiên quyết:
 * 1. Môi trường phát triển (NODE_ENV !== 'production'). Tuyệt đối không cho phép trên production.
 * 2. Dev chủ động bật qua URL parameter (?preview=true hoặc ?demo=true) hoặc cờ trong localStorage.
 * 3. Có thể tắt chủ động qua ?preview=false hoặc ?demo=false.
 */
export function isPreviewModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const previewParam = searchParams.get('preview') || searchParams.get('demo');

    if (previewParam === 'true') {
      localStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
      return true;
    }
    if (previewParam === 'false') {
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
      return false;
    }

    return localStorage.getItem(PREVIEW_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Bật/tắt chế độ preview thủ công từ code hoặc UI
 */
export function setPreviewMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'production') return;

  try {
    if (enabled) {
      localStorage.setItem(PREVIEW_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(PREVIEW_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(PREVIEW_CHANGE_EVENT, { detail: enabled }));
  } catch {
    // ignore
  }
}
