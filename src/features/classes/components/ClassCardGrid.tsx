'use client';

import React from 'react';
import { ClassCardItem } from './ClassCardItem';
import type { ClassItem } from '../types';

interface ClassCardGridProps {
  items: ClassItem[];
  onArchiveClick: (item: ClassItem) => void;
  onRestoreClick?: (item: ClassItem) => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export function ClassCardGrid({
  items,
  onArchiveClick,
  onRestoreClick,
  copiedCode,
  onCopyCode,
}: ClassCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
      {items.map((item) => (
        <ClassCardItem
          key={item.id}
          item={item}
          onArchiveClick={onArchiveClick}
          onRestoreClick={onRestoreClick}
          isCopied={copiedCode === item.enrollmentKey}
          onCopyCode={onCopyCode}
        />
      ))}
    </div>
  );
}

