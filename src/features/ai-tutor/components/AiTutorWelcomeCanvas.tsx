'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SUGGESTION_TOPICS } from '../constants';
import { SuggestionTopic } from '../types';

interface AiTutorWelcomeCanvasProps {
  userFullName?: string;
  onSelectPrompt: (prompt: string) => void;
  onSendMessage: (text: string) => void;
}

export function AiTutorWelcomeCanvas({
  userFullName = 'Trần Nhật Minh',
  onSelectPrompt,
  onSendMessage,
}: AiTutorWelcomeCanvasProps) {
  const t = useTranslations('aiTutor');
  const [welcomeInput, setWelcomeInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const firstName = userFullName.split(' ').slice(-1)[0] || 'Nhật Minh';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && welcomeInput.trim()) {
      e.preventDefault();
      onSendMessage(welcomeInput.trim());
      setWelcomeInput('');
    }
  };

  const handleCardClick = (topic: SuggestionTopic) => {
    onSendMessage(topic.prompt);
  };

  const handleChipClick = (prefix: string) => {
    setWelcomeInput((prev) => (prev ? `${prefix}: ${prev}` : `${prefix}: `));
  };

  return (
    <div className="flex flex-col w-full h-full relative overflow-hidden bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] bg-gradient-to-tr from-blue-500/10 via-cyan-500/15 to-purple-500/10 rounded-full blur-3xl opacity-60 dark:opacity-30" />
        <div className="absolute -top-32 right-12 w-96 h-96 bg-blue-500/5 dark:bg-cyan-500/10 rounded-full blur-2xl" />
      </div>

      {/* Central Welcome Experience Canvas */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col justify-between items-center max-w-5xl mx-auto w-full scrollbar-thin">
        <div className="hidden lg:block shrink-0 h-4" />

        <div className="w-full flex flex-col items-center text-center my-auto max-w-3xl">
          {/* Socratic Persona Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 shadow-xs mb-6 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[13px]">psychology</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {t('subtitle')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">
              {t('semester')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2.5">
            {t('welcomeHeadline', { name: firstName })}
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            {t('welcomeSubtitle')}
          </p>

          {/* Prominent Floating Capsule Input Box */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-black/40 border border-slate-200/90 dark:border-slate-800 p-2.5 transition-all mb-8 relative focus-within:shadow-2xl focus-within:border-blue-500/80 dark:focus-within:border-cyan-500/80">
            <div className="flex items-center gap-2 px-2 pt-1 pb-2">
              {/* Attachment Button */}
              <button
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all shrink-0 cursor-pointer"
                title={t('attachTooltip')}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>

              {/* Input field */}
              <div className="flex-1 relative flex items-center min-w-0">
                <input
                  value={welcomeInput}
                  onChange={(e) => setWelcomeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-900 dark:text-slate-100 text-[15px] placeholder:text-slate-400 focus:outline-none"
                  placeholder={isRecording ? t('voiceListening') : t('inputPlaceholder')}
                  type="text"
                />
              </div>

              {/* Model Selector Capsule */}
              <div className="relative shrink-0">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 text-xs font-semibold"
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" />
                  <span>{t('modeSocraticPro')}</span>
                  <span className="material-symbols-outlined text-[15px] text-slate-400">expand_more</span>
                </button>
              </div>

              {/* Special Tools: Formula & Voice */}
              <button
                onClick={() => setWelcomeInput((prev) => prev + ' $O(N \\log N)$ ')}
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
                title={t('formulaTooltip')}
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">functions</span>
              </button>

              <button
                onClick={() => setIsRecording((prev) => !prev)}
                className={`flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ${
                  isRecording ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-950/40' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={t('voiceTooltip')}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>

              {/* Send Button */}
              <button
                onClick={() => {
                  if (welcomeInput.trim()) {
                    onSendMessage(welcomeInput.trim());
                    setWelcomeInput('');
                  }
                }}
                disabled={!welcomeInput.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                title={t('sendTooltip')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </div>

            {/* Inner quick tags bar inside capsule */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1 border-t-0 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 overflow-x-auto text-left py-0.5 scrollbar-none">
                <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  {t('hintMode')}
                </span>
                <button
                  onClick={() => handleChipClick('Hãy hướng dẫn tôi bằng phương pháp Socratic từng bước')}
                  className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                  type="button"
                >
                  {t('hintCriticalThinking')}
                </button>
                <button
                  onClick={() => handleChipClick('Tìm lỗi sai và phân tích logic đoạn mã này')}
                  className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                  type="button"
                >
                  {t('hintDebugCode')}
                </button>
                <button
                  onClick={() => handleChipClick('Cho tôi câu hỏi trắc nghiệm kiểm tra độ hiểu')}
                  className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                  type="button"
                >
                  {t('hintQuiz')}
                </button>
              </div>
              <span className="hidden sm:inline font-mono text-slate-400 text-[11px] whitespace-nowrap pl-2">
                {t('pressEnter')}
              </span>
            </div>
          </div>

          {/* Quick Starter Suggestion Cards Grid (4 Curated CS Topics) */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {t('suggestedTopics')}
              </span>
              <span className="text-xs text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5 font-medium">
                {t('viewMoreTopics')}
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
              {SUGGESTION_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleCardClick(topic)}
                  className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${topic.colorClass}`}
                    >
                      <span className="material-symbols-outlined text-[19px]">{topic.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {topic.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all text-[18px] shrink-0 mt-1">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Educational Ethics Disclaimer */}
        <footer className="shrink-0 pt-6 pb-2 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">
            <span className="material-symbols-outlined text-[15px] text-blue-600 dark:text-cyan-400">
              verified_user
            </span>
            <span>{t('pedagogyPromise')}</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {t('pedagogyDesc')}
          </p>
        </footer>
      </div>
    </div>
  );
}
