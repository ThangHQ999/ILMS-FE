'use client';

import React from 'react';
import { ClassCardItem } from './ClassCardItem';
import type { ClassItem, ClassViewMode, WorkspaceRoleMode } from '../types';

interface ClassCardGridProps {
  items: ClassItem[];
  workspaceMode?: WorkspaceRoleMode;
  viewMode?: ClassViewMode;
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function ClassCardGrid({
  items,
  workspaceMode = 'faculty',
  viewMode = 'list',
  onArchiveClick,
  onRestoreClick,
  copiedCode,
  onCopyCode,
}: ClassCardGridProps) {
  // Container class dynamic based on student vs faculty and grid vs list
  const containerClass =
    workspaceMode === 'student'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : viewMode === 'list'
      ? 'grid grid-cols-1 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <div className={containerClass} id="classes-grid-container">
      {items.map((item) => (
        <ClassCardItem
          key={item.id}
          item={item}
          workspaceMode={workspaceMode}
          onArchiveClick={onArchiveClick}
          onRestoreClick={onRestoreClick}
          isCopied={copiedCode === (item.enrollmentKey || item.name)}
          onCopyCode={onCopyCode}
        />
      ))}
    </div>
  );
}
