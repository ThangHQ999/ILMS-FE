'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { OPEN_SOCRATIC_COACH_EVENT } from '@/hooks/useSocraticLessonContext';
import { isAiCoachRouteAllowed } from '@/constants/ai-coach-routes';
import { SocraticAICoach } from '@/features/dashboard';

const STORAGE_KEY_MINIMIZED = 'ilms_global_ai_coach_minimized';
const STORAGE_KEY_WIDTH = 'ilms_global_ai_coach_width';
const MIN_DESKTOP_WIDTH = 450;
const MAX_DESKTOP_WIDTH = 800;

export function GlobalSocraticCoach() {
  const pathname = usePathname() || '/';
  const { user, isAuthenticated, isLoading } = useUserRole();

  // Kiểm tra route có nằm trong danh sách được phép bật hay không
  const isAllowed = isAiCoachRouteAllowed(pathname);

  // Trạng thái thu gọn (mặc định thu gọn thành FAB nổi ở góc màn hình)
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [width, setWidth] = useState<number>(MIN_DESKTOP_WIDTH);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Đọc cấu hình đã lưu từ localStorage khi client mount
  useEffect(() => {
    setHasMounted(true);
    try {
      const savedMinimized = localStorage.getItem(STORAGE_KEY_MINIMIZED);
      if (savedMinimized !== null) {
        setIsMinimized(savedMinimized === 'true');
      }
      const savedWidth = localStorage.getItem(STORAGE_KEY_WIDTH);
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        if (!isNaN(parsedWidth)) {
          const clampedWidth = Math.min(
            MAX_DESKTOP_WIDTH,
            Math.max(MIN_DESKTOP_WIDTH, parsedWidth)
          );
          setWidth(clampedWidth);
        }
      }
    } catch {
      // ignore
    }

    const handleOpenCoach = () => {
      setIsMinimized(false);
      try {
        localStorage.setItem(STORAGE_KEY_MINIMIZED, 'false');
      } catch {
        // ignore
      }
    };
    window.addEventListener(OPEN_SOCRATIC_COACH_EVENT, handleOpenCoach);
    return () => {
      window.removeEventListener(OPEN_SOCRATIC_COACH_EVENT, handleOpenCoach);
    };
  }, []);

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_MINIMIZED, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    try {
      localStorage.setItem(STORAGE_KEY_WIDTH, String(newWidth));
    } catch {
      // ignore
    }
  };

  // Tránh hydration mismatch và không render nếu route bị cấm
  if (!hasMounted || !isAllowed) {
    return null;
  }

  const userFullName = user
    ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')
    : 'Học viên';

  return (
    <SocraticAICoach
      userFullName={userFullName}
      width={width}
      onWidthChange={handleWidthChange}
      isMinimized={isMinimized}
      onToggleMinimize={handleToggleMinimize}
      floatingDock={true}
      isAuthenticated={!isLoading && isAuthenticated}
    />
  );
}
