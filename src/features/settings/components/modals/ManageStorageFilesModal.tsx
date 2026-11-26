'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/shared';
import { useStorageFiles, useDeleteStorageFile } from '../../hooks/useStorage';
import type { StorageFileItem } from '../../schemas/storage.schema';

interface ManageStorageFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileDeleted?: () => void;
}

export function ManageStorageFilesModal({
  isOpen,
  onClose,
  onFileDeleted,
}: ManageStorageFilesModalProps) {
  const confirm = useConfirm();
  const t = useTranslations('settings');
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: files = [], isLoading } = useStorageFiles(
    {
      search: search || undefined,
      fileType: fileType !== 'ALL' ? fileType : undefined,
    },
    { enabled: isOpen }
  );

  const deleteMutation = useDeleteStorageFile(() => {
    setDeletingId(null);
    onFileDeleted?.();
  });

  if (!isOpen) return null;

  const handleDelete = async (deleteKey: string, rowId: string, name: string) => {
    const ok = await confirm({
      title: 'Xác nhận xóa tệp lưu trữ',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tệp "${name}" để giải phóng dung lượng không? Hành động này không thể hoàn tác.`,
      variant: 'danger',
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy',
    });
    if (ok) {
      setDeletingId(rowId);
      deleteMutation.mutate(deleteKey);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return 'picture_as_pdf';
      case 'MP4':
      case 'VIDEO':
        return 'video_file';
      case 'DOCX':
      case 'DOC':
        return 'description';
      default:
        return 'draft';
    }
  };

  const getGoogleDriveUrl = (file: StorageFileItem): string | null => {
    // 1. Direct url or fileUrl
    const candidateUrl = file.url || file.fileUrl || file.directUrl;
    if (candidateUrl && candidateUrl.startsWith('http')) {
      const matchId = candidateUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (candidateUrl.includes('drive.google.com') && matchId && matchId[1]) {
        return `https://drive.google.com/file/d/${matchId[1]}/view`;
      }
      return candidateUrl;
    }
    // 2. Download URL
    if (file.downloadUrl && file.downloadUrl.startsWith('http')) {
      const matchId = file.downloadUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        return `https://drive.google.com/file/d/${matchId[1]}/view`;
      }
      const matchFileD = file.downloadUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (matchFileD && matchFileD[1]) {
        return `https://drive.google.com/file/d/${matchFileD[1]}/view`;
      }
      return file.downloadUrl;
    }
    // 3. Fallback using publicId or fileId if it looks like a Google Drive ID
    const driveId = file.publicId || file.fileId;
    if (driveId && typeof driveId === 'string' && !driveId.includes(' ') && driveId.length >= 10) {
      if (!driveId.startsWith('mat-') && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(driveId)) {
        return `https://drive.google.com/file/d/${driveId}/view`;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1F20] border-none max-w-3xl w-full p-6 sm:p-7 rounded-3xl shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                Quản lý Tệp & Giải phóng Dung lượng
              </h2>
              <span className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                Xóa bớt các tài liệu, bài giảng hoặc video không còn sử dụng
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-[#282A2C] flex items-center justify-center text-slate-500 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tệp hoặc môn học..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] text-xs text-[#1F1F1F] dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PDF', 'MP4', 'DOCX'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFileType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer border-none transition-colors ${
                  fileType === type
                    ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                    : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#444746] dark:text-[#C4C7C5] hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'Tất cả' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Files Table / List */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-[#F0F4F9]/60 dark:bg-[#282A2C]/30 border-none p-1">
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent" />
            </div>
          ) : files.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[36px]">
                folder_off
              </span>
              <p className="text-xs text-[#747775] dark:text-[#C4C7C5]">
                Không tìm thấy tệp tin nào phù hợp với bộ lọc
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60 dark:divide-[#444746]/40">
              {files.map((file) => {
                const isDeleting = deletingId === file.id;
                const driveUrl = getGoogleDriveUrl(file);

                return (
                  <div
                    key={file.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-[#1E1F20] rounded-xl transition-colors group/item"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {driveUrl ? (
                        <a
                          href={driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Mở tệp trên Google Drive"
                          className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#D3E3FD]/50 dark:hover:bg-[#282A2C] flex items-center justify-center shrink-0 transition-colors shadow-sm dark:shadow-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {getFileIcon(file.fileType)}
                          </span>
                        </a>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            {getFileIcon(file.fileType)}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col min-w-0">
                        {driveUrl ? (
                          <a
                            href={driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mở tệp trên Google Drive"
                            className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] hover:underline truncate flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <span className="truncate">{file.name}</span>
                            <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover/item:text-[#0B57D0] dark:group-hover/item:text-[#A8C7FA] shrink-0">
                              open_in_new
                            </span>
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] truncate">
                            {file.name}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-[#747775] dark:text-[#8E918F]">
                          {file.courseName && <span>{file.courseName}</span>}
                          <span>•</span>
                          <span className="font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
                            {file.sizeFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() =>
                        handleDelete(
                          file.publicId || file.fileId || file.id,
                          file.id,
                          file.name
                        )
                      }
                      className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1 border-none cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-3.5 h-3.5 animate-spin rounded-full border border-rose-600 border-t-transparent" />
                          <span>Đang xóa...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          <span>Xóa tệp</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#747775] dark:text-[#8E918F]">
            Tìm thấy {files.length} tệp tin
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-medium cursor-pointer border-none shadow-none"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
