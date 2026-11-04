'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ErrorPageHeader } from './ErrorPageHeader';
import { ErrorPageFooter } from './ErrorPageFooter';

export function ForbiddenView() {
  const t = useTranslations('errors');
  const router = useRouter();

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [permissionSubmitted, setPermissionSubmitted] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('ta');
  const [requestNote, setRequestNote] = useState('');

  const handleSendPermissionRequest = () => {
    setPermissionSubmitted(true);
    setTimeout(() => {
      setPermissionSubmitted(false);
      setIsPermissionModalOpen(false);
      setRequestNote('');
    }, 1500);
  };

  const handleSwitchInstructor = () => {
    alert(t('switchingRoleFeedback'));
    setIsSwitchModalOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="bg-[#f6fafe] dark:bg-[#070A10] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-between font-sans transition-colors">
      {/* 1. Header with Adaptive Auth state */}
      <ErrorPageHeader currentPage="403" />

      {/* 2. Main 403 Stage */}
      <main className="w-full flex-grow pt-16 relative overflow-hidden">
        {/* Subtle Tech Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col w-full py-12 px-4 sm:px-6 lg:px-8 items-center justify-center min-h-[calc(100vh-8rem)]">
          {/* Central Master Card */}
          <div className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 relative">
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[22px]">shield_lock</span>
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('securitySystemTitle')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-tight">
                    ILMS Gateway v4.8 • Access Enforcement
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono text-xs font-semibold">
                  MÃ LỖI: SEC_ERR_403_INSUFFICIENT_ROLE
                </span>
              </div>
            </div>

            {/* 403 Hero Graphic Visual */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="relative flex items-center justify-center select-none py-2">
                <svg
                  className="w-full max-w-[380px] sm:max-w-[460px] h-auto drop-shadow-md"
                  fill="none"
                  viewBox="0 0 540 190"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Ambient Node Lines */}
                  <path
                    d="M 60 95 L 140 95 M 400 95 L 480 95"
                    opacity="0.6"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />
                  <path
                    d="M 140 95 L 200 45 M 340 45 L 400 95"
                    stroke="#60a5fa"
                    strokeDasharray="6 3"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 140 95 L 200 145 M 340 145 L 400 95"
                    stroke="#60a5fa"
                    strokeDasharray="6 3"
                    strokeWidth="1.5"
                  />

                  {/* Orbit Nodes */}
                  <circle cx="60" cy="95" fill="#0059bb" r="5" />
                  <circle cx="140" cy="95" fill="#0070ea" r="4" />
                  <circle cx="400" cy="95" fill="#0070ea" r="4" />
                  <circle cx="480" cy="95" fill="#0059bb" r="5" />

                  {/* Number 4 Left */}
                  <text
                    className="fill-slate-900 dark:fill-white font-extrabold"
                    fontSize="140"
                    letterSpacing="-0.04em"
                    x="75"
                    y="145"
                  >
                    4
                  </text>

                  {/* Stylized Isometric Central Shield "0" */}
                  <g transform="translate(205, 10)">
                    <path
                      d="M65 10 L120 42 L120 108 C120 142 65 168 65 168 C65 168 10 142 10 108 L10 42 Z"
                      fill="#f0f4f8"
                    />
                    <path
                      d="M65 18 L112 46 L112 104 C112 133 65 156 65 156 C65 156 18 133 18 104 L18 46 Z"
                      fill="#ffffff"
                    />
                    <path d="M65 42 L98 60 L65 78 L32 60 Z" fill="#d8e2ff" />
                    <path d="M32 60 L65 78 L65 116 L32 98 Z" fill="#adc7ff" />
                    <path d="M98 60 L65 78 L65 116 L98 98 Z" fill="#0059bb" />

                    {/* Glowing Security Lock Icon */}
                    <circle cx="65" cy="88" fill="#0d1c32" r="22" />
                    <rect fill="#ffffff" height="15" rx="3" width="18" x="56" y="85" />
                    <path
                      d="M60 85 V79 C60 76.2 62.2 74 65 74 C67.8 74 70 76.2 70 79 V85"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />
                    <circle cx="65" cy="92" fill="#0070ea" r="2" />
                    <circle cx="65" cy="18" fill="#ba1a1a" r="3" />
                    <circle cx="112" cy="104" fill="#0059bb" r="3" />
                    <circle cx="18" cy="104" fill="#0059bb" r="3" />
                  </g>

                  {/* Number 3 Right */}
                  <text
                    className="fill-slate-900 dark:fill-white font-extrabold"
                    fontSize="140"
                    letterSpacing="-0.04em"
                    x="345"
                    y="145"
                  >
                    3
                  </text>
                </svg>
              </div>

              {/* Notice Headlines */}
              <div className="text-center max-w-2xl mt-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2.5 tracking-tight">
                  {t('restrictedAreaTitle')}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('restrictedAreaDesc')}
                </p>
              </div>
            </div>

            {/* Role Audit Matrix */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 my-6 border border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Current Role */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {t('currentRole')}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                      Học viên (Student)
                    </span>
                  </div>
                </div>

                {/* Required Role */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {t('requiredRole')}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate block">
                      Giảng viên / Admin
                    </span>
                  </div>
                </div>

                {/* Target Resource */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">folder_special</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {t('targetResource')}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      /courses/adv-ai/grading-lab
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Center Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-6">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>{t('returnToDashboard')}</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">switch_account</span>
                <span>{t('switchAccountBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPermissionModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>{t('requestAccessBtn')}</span>
              </button>
            </div>

            {/* Smart Educational Alternative Shortcuts */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px]">
                    explore
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t('availableShortcutsTitle')}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {t('unlimitedInstantAccess')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link
                  href="/dashboard"
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex flex-col justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      Tiến trình học tập
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Xem bài giảng & bài tập cá nhân
                    </div>
                  </div>
                </Link>

                <Link
                  href="/knowledge-graph"
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex flex-col justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      <span className="material-symbols-outlined text-[18px]">hub</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      Đồ thị tri thức
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Khám phá bản đồ kỹ năng 24+ node
                    </div>
                  </div>
                </Link>

                <Link
                  href="/ai-tutor"
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex flex-col justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      Trợ lý AI Socratic
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Gợi ý lộ trình & giải đáp 24/7
                    </div>
                  </div>
                </Link>

                <Link
                  href="/settings"
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex flex-col justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    </span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      Trung tâm Hỗ trợ
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Gửi phiếu tra cứu đến Cố vấn
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Request Permission Form */}
        {isPermissionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
                    assignment_ind
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('modalPermissionTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 my-3 leading-relaxed">
                {t('modalPermissionDesc')}
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('accessPurpose')}
                  </label>
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="ta">Trợ giảng tham gia hỗ trợ chấm điểm (Teaching Assistant)</option>
                    <option value="research">Học viên tham gia nghiên cứu đề tài chuyên sâu</option>
                    <option value="reference">Cần tham khảo mẫu bài giảng cho đề án môn học</option>
                    <option value="other">Lý do học vụ khác...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('additionalNote')}
                  </label>
                  <textarea
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Nhập mã số sinh viên, tên học phần và lý do cụ thể..."
                    rows={3}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:border-blue-500 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {permissionSubmitted ? (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{t('permissionSuccessNotice')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsPermissionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {t('cancelBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendPermissionRequest}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    {t('sendRequestBtn')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Switch Account */}
        {isSwitchModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
                    switch_account
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t('modalSwitchTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsSwitchModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-2.5 my-4">
                {/* Current Student Account */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      HV
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        nguyen.van.a@edutech.vn
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        Đang hoạt động (Student)
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                    check_circle
                  </span>
                </div>

                {/* Switch to Instructor Account */}
                <div
                  onClick={handleSwitchInstructor}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      GV
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        inst.nguyen@edutech.vn
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Giảng viên Khoa CNTT (Instructor)
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">
                    login
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSwitchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('closeBtn')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <ErrorPageFooter />
    </div>
  );
}
