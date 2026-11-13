'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useJoinClass } from '../hooks/useJoinClass';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const t = useTranslations('classes');
  const { mutateAsync: joinClassMutate, isPending } = useJoinClass();

  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = classCode.trim();

    if (!trimmed) {
      setError(t('validation.nameMin'));
      return;
    }

    try {
      setApiError(null);
      setError(null);
      await joinClassMutate(trimmed);
      setClassCode('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      let msg = 'Không thể tham gia lớp học. Vui lòng kiểm tra lại mã lớp.';
      if (typeof err === 'object' && err !== null) {
        const anyErr = err as { httpStatus?: number; message?: string };
        if (anyErr.httpStatus === 401) {
          msg = 'Bạn cần đăng nhập để tham gia lớp học!';
        } else if (anyErr.httpStatus === 404) {
          msg = 'Mã lớp không tồn tại hoặc đã bị khóa!';
        } else if (anyErr.httpStatus === 409) {
          msg = 'Bạn đã tham gia lớp học này rồi!';
        } else if (typeof anyErr.message === 'string') {
          msg = anyErr.message;
        }
      }
      setApiError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-surface border border-border/80 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">vpn_key</span>
            </div>
            <div>
              <h3 id="join-modal-title" className="text-base font-bold text-foreground font-display">
                {t('modalJoinTitle')}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t('modalJoinDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3.5 rounded-xl bg-destructive/15 text-destructive text-xs flex items-start gap-2.5 border border-destructive/30">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 leading-relaxed font-medium">{apiError}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('fieldJoinCode')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => {
                setClassCode(e.target.value);
                if (error) setError(null);
                if (apiError) setApiError(null);
              }}
              placeholder={t('fieldJoinCodePlaceholder')}
              autoFocus
              className="w-full h-11 px-4 rounded-xl bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 font-mono tracking-wide uppercase transition-all"
            />
            {error && (
              <p className="mt-1 text-[11px] text-destructive font-medium">{error}</p>
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Mã tham gia được cấp bởi Giảng viên chủ nhiệm hoặc qua email mời lớp học.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={isPending || !classCode.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-50 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span>{t('btnJoining')}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>{t('btnJoinClass')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

