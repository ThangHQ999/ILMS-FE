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

export const ClassCardGrid = React.memo(function ClassCardGrid({
  items,
  workspaceMode = 'faculty',
  viewMode = 'grid',
  onArchiveClick,
  onRestoreClick,
  copiedCode,
  onCopyCode,
}: ClassCardGridProps) {
  // Container class dynamic based on student vs faculty and grid vs list
  // 2-column grid gives high visual fidelity, balanced proportions & comfortable reading room
  const containerClass =
    workspaceMode === 'student'
      ? viewMode === 'list'
        ? 'grid grid-cols-1 gap-6'
        : 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : viewMode === 'list'
      ? 'grid grid-cols-1 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6';

  return (
    <div className={containerClass} id="classes-grid-container">
      {items.map((item) => (
        <ClassCardItem
          key={item.id}
          item={item}
          workspaceMode={workspaceMode}
          viewMode={viewMode}
          onArchiveClick={onArchiveClick}
          onRestoreClick={onRestoreClick}
          isCopied={copiedCode === (item.enrollmentKey || item.name)}
          onCopyCode={onCopyCode}
        />
      ))}
    </div>
  );
});
