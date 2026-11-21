'use client';

import React, { useState, useEffect } from 'react';

interface LessonNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId?: string;
  lessonTitle?: string;
  onToast: (msg: string) => void;
}

export function LessonNotesDrawer({
  isOpen,
  onClose,
  lessonId = 'les-3-2',
  lessonTitle = 'Bài 3.2: Cơ chế RDT & Bắt tay 3 bước TCP',
  onToast,
}: LessonNotesDrawerProps) {
  const storageKey = `ilms_notes_${lessonId}`;

  const defaultSampleNotes = `# Ghi chú cá nhân - Bài 3.2 (TCP 3-Way Handshake)

1. Điểm cốt lõi:
- Bước 1: Client -> Server: SYN=1, Seq=x (ISN của Client)
- Bước 2: Server -> Client: SYN=1, ACK=1, Seq=y, Ack=x+1
- Bước 3: Client -> Server: ACK=1, Seq=x+1, Ack=y+1 (Được phép mang kèm data HTTP!)

2. Tại sao cần 3 bước:
- Ngăn ngừa tình trạng Half-open Connection khi gói SYN cũ bị trễ.
- Đồng bộ hóa 2 chiều Sequence Number độc lập của cả 2 máy chủ.`;

  const [notesText, setNotesText] = useState(defaultSampleNotes);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Vừa xong');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotesText(saved);
      }
    }
  }, [storageKey]);

  const handleSaveNotes = (val: string) => {
    setNotesText(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, val);
      setLastSavedTime(
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  const handleCopyNotes = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(notesText);
      onToast('Đã sao chép nội dung ghi chú vào clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-[90vh] rounded-2xl border-[3px] border-slate-300 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
              sticky_note_2
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Ghi chú học tập cá nhân
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {lessonTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyNotes}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Sao chép toàn bộ ghi chú"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Đóng ghi chú"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <textarea
            value={notesText}
            onChange={(e) => handleSaveNotes(e.target.value)}
            placeholder="Gõ ghi chú, công thức hoặc lưu ý bài giảng vào đây..."
            className="flex-1 w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 border-[2px] border-slate-300 dark:border-slate-800 outline-none resize-none focus:border-blue-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tự động lưu: {lastSavedTime}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleSaveNotes('');
                onToast('Đã xóa trắng ghi chú nháp!');
              }}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 text-xs font-semibold cursor-pointer"
            >
              Xóa hết
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              Đóng &amp; Tiếp tục học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

