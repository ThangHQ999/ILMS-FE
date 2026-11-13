'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface AtRiskStudent {
  id: string;
  name: string;
  code: string;
  avatarUrl?: string;
  initials: string;
  reason: string;
  reasonIcon: string;
  stat: string;
  primaryAction: 'socratic' | 'advisor' | 'email';
}

const defaultStudents: AtRiskStudent[] = [
  {
    id: '1',
    name: 'Lê Minh Tuấn',
    code: 'SV2201089',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnPcWFX8UO4_cY0o87qWPL3cVkdpYaJ8DpePUjwUy0mBWvN8Zj_oEI0r-AFNxtNGnG8ihCMiHGw69sfhS95b58HDBV1OmiQtbdZUvewvAepMwbR2drik89cNlM_Gs7RndNIIttBjfs3ptmb7hKpnSUobbcmXCAPT9bgqP4I3p7MoKp2SSySt1eWweWptbh1GqEHnt9CvXchO7NRW4AlyENYvMYpWQwZzCLj069OU36',
    initials: 'LMT',
    reason: 'Chưa nộp Lab 03 & 04 (CS-202)',
    reasonIcon: 'flag',
    stat: 'Chuyên cần: 78%',
    primaryAction: 'socratic',
  },
  {
    id: '2',
    name: 'Hoàng Diệu Linh',
    code: 'SV2201045',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB13DZiyrYpJttGxKOmkoOi41xQ7lpssHBPcEW457dGtvR8gMB81eKMWk99RWTJ4oj-jqcJXXSAiDlitge7K-XgWHjZEqukDO9JndKBsptL5jEn_DXZ-gWzB09sfwLSsBVZ1aNiTAsN_Q1X2J0T329Y-cDfm6zirIsdhPaccRUIWBagIPWMkgl02ePAs3IDqt9yLQWRNdfwtGGcUDQ2nmUacyy10ZMne9oGxDOhjJXL',
    initials: 'HDL',
    reason: 'Điểm Quiz 04 thấp (4.0/10 - Thuật toán đệ quy)',
    reasonIcon: 'priority_high',
    stat: 'Chuyên cần: 92%',
    primaryAction: 'advisor',
  },
  {
    id: '3',
    name: 'Vũ Quốc Bảo',
    code: 'SV2201102',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDyPCm4JY41PcFx38svl-GUQojVi65iJyWi6vvKlys1yUPQvAMHB3nt1K5q25_kdidJGBzyLKC-yNnlWTe55kaI-7AvxtjaKTHkAIwEnyB2Zf0EXTQN8lyJ6hCjamMxegM-3d5R819pXrWdTGjlammHkXMYOZZOA-bWfLD_o7tLTfjxBqobY5nyVpt3QeSjkQJfrhVifj2Md9SNyNbTpLBE2FwL2XxLe4uRGr3q1bIq',
    initials: 'VQB',
    reason: 'Không đăng nhập hệ thống 6 ngày qua',
    reasonIcon: 'schedule',
    stat: 'Vắng 2 buổi Lab',
    primaryAction: 'email',
  },
];

export function TeacherAtRiskStudentsCard() {
  const t = useTranslations('dashboard.teacher');
  const [sentActionId, setSentActionId] = useState<string | null>(null);

  const handleActionClick = (id: string, actionName: string) => {
    setSentActionId(`${id}-${actionName}`);
    setTimeout(() => {
      setSentActionId(null);
    }, 2500);
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-surface shadow-md3-1 dark:shadow-none border-none flex flex-col gap-6">
      {/* Header with warning icon and action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#FFDAD6] text-[#BA1A1A] dark:bg-[#93000A]/30 dark:text-[#FFB4AB] flex items-center justify-center shrink-0 border-none">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-[#1F1F1F] dark:text-[#E3E3E3] tracking-tight">
              {t('atRiskTitle')}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('atRiskSubtitle', { count: 3 })}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-full bg-surface-variant hover:bg-surface-variant/80 text-foreground text-sm font-medium transition-colors border-none whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          {t('viewAllAtRisk', { count: 8 })}
        </button>
      </div>

      {/* List of at-risk students with borders and enlarged text */}
      <div className="flex flex-col gap-3.5">
        {defaultStudents.map((student) => {
          const isPendingSocratic = sentActionId === `${student.id}-socratic`;
          const isPendingAdvisor = sentActionId === `${student.id}-advisor`;
          const isPendingEmail = sentActionId === `${student.id}-email`;

          return (
            <div
              key={student.id}
              className="p-5 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/70 border border-[#E1E5EA] dark:border-[#282A2C] hover:border-[#C5C6CD] dark:hover:border-[#3C4043] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Avatar + Details */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-variant flex items-center justify-center text-sm font-bold text-foreground">
                  {student.avatarUrl ? (
                    // Using standard img to avoid unconfigured host issues with Next/Image
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span>{student.initials}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-foreground truncate">
                      {student.name}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {student.code}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-[#B3261E] dark:text-[#F2B8B5] font-medium">
                      <span className="material-symbols-outlined text-[16px]">
                        {student.reasonIcon}
                      </span>
                      {student.reason}
                    </span>
                    <span>•</span>
                    <span>{student.stat}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                {student.primaryAction === 'socratic' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleActionClick(student.id, 'socratic')}
                      disabled={isPendingSocratic}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#004A77] dark:hover:bg-[#005C94] dark:text-[#C2E7FF] font-medium text-sm whitespace-nowrap transition-colors border-none cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isPendingSocratic ? 'check' : 'smart_toy'}
                      </span>
                      <span>
                        {isPendingSocratic ? 'Đã gửi nhắc nhở' : t('sendSocraticPrompt')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick(student.id, 'advisor')}
                      className="w-9 h-9 rounded-full bg-surface-variant hover:bg-surface-variant/80 text-foreground flex items-center justify-center transition-colors border-none shrink-0 cursor-pointer"
                      title={t('inviteOfficeHour')}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        calendar_add_on
                      </span>
                    </button>
                  </>
                )}

                {student.primaryAction === 'advisor' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleActionClick(student.id, 'advisor')}
                      disabled={isPendingAdvisor}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8DEF8] hover:bg-[#DBCDE8] text-[#1D192B] dark:bg-[#4A4458] dark:hover:bg-[#5C556C] dark:text-[#E8DEF8] font-medium text-sm whitespace-nowrap transition-colors border-none cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isPendingAdvisor ? 'check' : 'support_agent'}
                      </span>
                      <span>
                        {isPendingAdvisor ? 'Đã tạo lịch hẹn' : t('inviteOfficeHour')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick(student.id, 'socratic')}
                      className="w-9 h-9 rounded-full bg-surface-variant hover:bg-surface-variant/80 text-foreground flex items-center justify-center transition-colors border-none shrink-0 cursor-pointer"
                      title={t('sendSocraticPrompt')}
                    >
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </button>
                  </>
                )}

                {student.primaryAction === 'email' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleActionClick(student.id, 'email')}
                      disabled={isPendingEmail}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#004A77] dark:hover:bg-[#005C94] dark:text-[#C2E7FF] font-medium text-sm whitespace-nowrap transition-colors border-none cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isPendingEmail ? 'check' : 'mail'}
                      </span>
                      <span>
                        {isPendingEmail ? 'Đã gửi email' : t('sendEmailReminder')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick(student.id, 'note')}
                      className="w-9 h-9 rounded-full bg-surface-variant hover:bg-surface-variant/80 text-foreground flex items-center justify-center transition-colors border-none shrink-0 cursor-pointer"
                      title={t('personalNote')}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

