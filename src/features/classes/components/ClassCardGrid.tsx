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
  onLeaveClick?: (item: ClassItem) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const ClassCardGrid = React.memo(function ClassCardGrid({
  items,
  workspaceMode = 'faculty',
  viewMode = 'grid',
  onArchiveClick,
  onRestoreClick,
  onLeaveClick,
  copiedCode,
  onCopyCode,
}: ClassCardGridProps) {
  // 3-column compact grid on desktop for scannable class overview
  const containerClass =
    viewMode === 'list'
      ? 'grid grid-cols-1 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';

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
          onLeaveClick={onLeaveClick}
          isCopied={copiedCode === (item.enrollmentKey || item.name)}
          onCopyCode={onCopyCode}
        />
      ))}
    </div>
  );
});
