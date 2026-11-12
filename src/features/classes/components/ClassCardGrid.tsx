'use client';

import React from 'react';
import { ClassCardItem } from './ClassCardItem';
import type { ClassItem, WorkspaceRoleMode } from '../types';

interface ClassCardGridProps {
  items: ClassItem[];
  workspaceMode?: WorkspaceRoleMode;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function ClassCardGrid({
  items,
  workspaceMode = 'faculty',
  onArchiveClick,
  onRestoreClick,
  copiedCode,
  onCopyCode,
}: ClassCardGridProps) {
  const containerClass =
    workspaceMode === 'student'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : 'flex flex-col gap-5 pt-1';

  return (
    <div className={containerClass} id="classes-grid-container">
      {items.map((item) => (
        <ClassCardItem
          key={item.id}
          item={item}
          workspaceMode={workspaceMode}
          onArchiveClick={onArchiveClick}
          onRestoreClick={onRestoreClick}
          isCopied={copiedCode === item.enrollmentKey}
          onCopyCode={onCopyCode}
        />
      ))}
    </div>
  );
}
