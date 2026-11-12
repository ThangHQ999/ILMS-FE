'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDeleteAccount } from '../../hooks/useSettings';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [confirmInput, setConfirmInput] = useState('');
  const deleteMutation = useDeleteAccount();

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim() === 'XAC NHAN';

  const handleDelete = async () => {
    if (!isConfirmed || deleteMutation.isPending) return;
    try {
      await deleteMutation.mutateAsync();
      onClose();
      router.replace('/login');
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1F20] border-none max-w-md w-full p-6 rounded-3xl shadow-2xl flex flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82] flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">delete_forever</span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
            {t('deleteModalTitle')}
          </h3>
          <p className="text-xs text-[#444746] dark:text-[#C4C7C5] leading-relaxed">
            {t('deleteModalDesc')}{' '}
            <strong className="text-[#B3261E] dark:text-[#F28B82] font-mono">
              XAC NHAN
            </strong>{' '}
            {t('deleteModalDescSuffix')}
          </p>
        </div>

        <input
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder="Nhập: XAC NHAN"
          className="w-full h-11 px-4 rounded-full bg-[#F0F4F9] hover:bg-[#E1E5EA] focus:bg-[#E1E5EA] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:focus:bg-[#333537] font-mono text-xs sm:text-sm text-[#1F1F1F] dark:text-[#E3E3E3] border-none outline-none transition-all placeholder:text-[#747775] dark:placeholder:text-[#8E918F]"
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] font-medium px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer"
            type="button"
          >
            {t('btnCancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className="px-6 py-2.5 rounded-full bg-[#FAD2CF] hover:bg-[#F7BCB6] text-[#B3261E] dark:bg-[#3C1919] dark:hover:bg-[#4E2222] dark:text-[#F28B82] text-xs font-medium whitespace-nowrap transition-colors border-none shadow-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            type="button"
          >
            {deleteMutation.isPending ? t('btnDeleting') : t('btnDeletePermanent')}
          </button>
        </div>
      </div>
    </div>
  );
}
