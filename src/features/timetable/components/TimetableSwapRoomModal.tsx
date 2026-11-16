'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TimetableSession } from '../types';

interface TimetableSwapRoomModalProps {
  isOpen: boolean;
  sessions: TimetableSession[];
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
}

export function TimetableSwapRoomModal({
  isOpen,
  sessions,
  onClose,
  onSubmitSuccess,
}: TimetableSwapRoomModalProps) {
  const t = useTranslations('timetable.swapModal');

  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions[0]?.lessonSessionId || ''
  );
  const [requestType, setRequestType] = useState<'MAKEUP' | 'SWAP_ROOM'>('SWAP_ROOM');
  const [proposedDate, setProposedDate] = useState('2024-10-28');
  const [proposedTime, setProposedTime] = useState('07:30 - 09:50');
  const [proposedRoom, setProposedRoom] = useState('Lab H6-304');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSuccess(t('successToast'));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-3xl p-6 shadow-2xl border-none ring-0 outline-none transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0B57D0] dark:text-[#A8C7FA]">
              event_repeat
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#E3E3E3] font-sans">
              {t('title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] flex items-center justify-center text-gray-600 dark:text-[#C4C7C5] transition-colors border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-sans">
          {/* 1. Chọn ca học */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
              {t('sessionLabel')}
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 transition-all font-sans cursor-pointer text-xs sm:text-sm"
            >
              {sessions.map((s) => (
                <option key={s.lessonSessionId} value={s.lessonSessionId}>
                  {s.className} ({s.classId}) - {s.startTime.substring(0, 5)} {s.sessionDate}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Loại yêu cầu */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
              {t('requestType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestType('SWAP_ROOM')}
                className={`py-2 px-3 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${
                  requestType === 'SWAP_ROOM'
                    ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                    : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5]'
                }`}
              >
                {t('swap')}
              </button>
              <button
                type="button"
                onClick={() => setRequestType('MAKEUP')}
                className={`py-2 px-3 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${
                  requestType === 'MAKEUP'
                    ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F]'
                    : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-600 dark:text-[#C4C7C5]'
                }`}
              >
                {t('makeup')}
              </button>
            </div>
          </div>

          {/* 3. Ngày & Giờ đề xuất */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                {t('proposedDate')}
              </label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 transition-all font-sans text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
                {t('proposedTime')}
              </label>
              <input
                type="text"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 transition-all font-sans text-xs"
              />
            </div>
          </div>

          {/* 4. Phòng đề xuất */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
              {t('proposedRoom')}
            </label>
            <input
              type="text"
              value={proposedRoom}
              onChange={(e) => setProposedRoom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 transition-all font-sans text-xs"
            />
          </div>

          {/* 5. Lý do */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#C4C7C5] mb-1.5">
              {t('reason')}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] text-gray-900 dark:text-[#E3E3E3] placeholder:text-gray-400 dark:placeholder:text-[#8E918F] border-none outline-none focus:ring-2 focus:ring-[#0B57D0]/40 transition-all font-sans text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-gray-200 dark:hover:bg-[#333538] text-xs font-semibold text-gray-800 dark:text-[#E3E3E3] transition-colors border-none cursor-pointer font-sans"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-[#062E6F] hover:bg-[#0842a0] dark:hover:bg-[#8ab4f8] text-xs font-semibold flex items-center gap-1.5 shadow-sm dark:shadow-none transition-colors border-none cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{t('submit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

