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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">delete_forever</span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('deleteModalTitle')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('deleteModalDesc')}{' '}
            <strong className="text-rose-600 dark:text-rose-400 font-mono">
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
          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all placeholder:text-slate-400"
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            type="button"
          >
            {t('btnCancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className={`px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold transition-all shadow-md ${
              isConfirmed && !deleteMutation.isPending
                ? 'hover:bg-rose-700 hover:scale-[1.02] cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            type="button"
          >
            {deleteMutation.isPending ? t('btnDeleting') : t('btnDeletePermanent')}
          </button>
        </div>
      </div>
    </div>
  );
}
