'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export interface PlayerOption {
  id: string;
  content: string;
}

export interface PlayerQuestion {
  id: string;
  content: string;
  options: PlayerOption[];
}

export interface PlayerAnswer {
  questionId: string;
  selectedOptionId?: string | null;
}

interface AzotaInProgressPlayerProps {
  title: string;
  userFullName: string;
  questions: PlayerQuestion[];
  selected: PlayerAnswer[];
  hasDeadline: boolean;
  elapsed: number;
  syncState: 'idle' | 'saving' | 'saved' | 'error';
  isSubmitting: boolean;
  isLeaving?: boolean;
  locked: boolean;
  onChoose: (questionId: string, optionId: string) => void;
  onSubmit: () => void;
  onLeave: () => void | Promise<void>;
  onRetrySave: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AzotaInProgressPlayer({
  title,
  userFullName,
  questions,
  selected,
  hasDeadline,
  elapsed,
  syncState,
  isSubmitting,
  isLeaving = false,
  locked,
  onChoose,
  onSubmit,
  onLeave,
  onRetrySave,
}: AzotaInProgressPlayerProps) {
  const t = useTranslations('assessmentPlayer');
  const [fontScale, setFontScale] = useState<'sm' | 'base' | 'lg'>('base');
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [showNavDrawer, setShowNavDrawer] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const minutesStr = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secondsStr = String(elapsed % 60).padStart(2, '0');
  const isLowTime = hasDeadline && elapsed <= 60;
  const answeredCount = selected.filter((a) => Boolean(a.selectedOptionId)).length;

  const textSizeClass =
    fontScale === 'sm' ? 'text-xs' : fontScale === 'lg' ? 'text-base' : 'text-sm';

  const toggleFlag = (questionId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const scrollToQuestion = (questionId: string) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] flex flex-col">
      {/* Azota-style Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#1E1F20] shadow-xs dark:shadow-none border-b border-black/5 dark:border-white/5">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: Back button */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] hover:bg-[#E1E5EA] dark:hover:bg-[#333537] px-3 py-1.5 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3] transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Quay lại</span>
            </button>
            <span className="hidden xl:inline-block text-xs text-[#444746] dark:text-[#C4C7C5] truncate max-w-[260px]">
              {title}
            </span>
          </div>

          {/* Center: Student name (Azota signature) */}
          <div className="hidden md:flex items-center gap-1.5 text-sm">
            <span className="text-[#444746] dark:text-[#C4C7C5]">Thí sinh:</span>
            <strong className="font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]">
              {userFullName || 'Học viên'}
            </strong>
          </div>

          {/* Right: Timer, Zoom, Nav toggle, Submit */}
          <div className="flex items-center gap-2">
            {syncState === 'saving' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                {t('saving')}
              </span>
            )}
            {syncState === 'saved' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#146C2E] dark:text-[#6DD58C]">
                <span className="material-symbols-outlined text-[14px]">cloud_done</span>
                Đã lưu
              </span>
            )}

            <div
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold tabular-nums ${
                isLowTime
                  ? 'bg-[#F9DEDC] text-[#410E0B] dark:bg-[#8C1D18] dark:text-[#F9DEDC] animate-pulse'
                  : 'bg-[#F0F4F9] dark:bg-[#282A2C] text-[#1F1F1F] dark:text-[#E3E3E3]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span>{hasDeadline ? `${minutesStr}:${secondsStr}` : 'Không giới hạn'}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setFontScale((prev) => (prev === 'lg' ? 'base' : 'sm'))
                }
                disabled={fontScale === 'sm'}
                title="Thu nhỏ cỡ chữ"
                className="h-8 w-8 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">zoom_out</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFontScale((prev) => (prev === 'sm' ? 'base' : 'lg'))
                }
                disabled={fontScale === 'lg'}
                title="Phóng to cỡ chữ"
                className="h-8 w-8 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] flex items-center justify-center text-[#444746] dark:text-[#C4C7C5] disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">zoom_in</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowNavDrawer((prev) => !prev)}
              title="Ẩn/hiện danh sách câu hỏi"
              className="hidden lg:inline-flex h-8 w-8 rounded-xl bg-[#F0F4F9] dark:bg-[#282A2C] items-center justify-center text-[#444746] dark:text-[#C4C7C5] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>

            <button
              type="button"
              disabled={locked}
              onClick={onSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B57D0] dark:bg-[#A8C7FA] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white dark:text-[#062E6F] hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
              <span>{isSubmitting ? 'Đang nộp...' : t('submit')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-5">
        {syncState === 'error' && (
          <div
            role="alert"
            className="mb-4 rounded-2xl bg-[#F9DEDC] dark:bg-[#8C1D18] text-[#410E0B] dark:text-[#F9DEDC] px-4 py-3 flex items-center justify-between gap-3 text-xs font-medium"
          >
            <span>{t('saveError')}</span>
            <button
              type="button"
              onClick={onRetrySave}
              className="rounded-full bg-white/80 dark:bg-black/30 px-3 py-1 font-semibold cursor-pointer"
            >
              {t('retry')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Question Cards (Azota clean style) */}
          <div
            className={`space-y-4 ${
              showNavDrawer ? 'lg:col-span-9' : 'lg:col-span-12 max-w-4xl mx-auto w-full'
            }`}
          >
            {questions.map((question, index) => {
              const chosenId = selected.find(
                (a) => a.questionId === question.id
              )?.selectedOptionId;
              const isFlagged = flaggedIds.includes(question.id);

              return (
                <fieldset
                  id={`question-${question.id}`}
                  key={question.id}
                  disabled={locked}
                  className="rounded-2xl bg-white dark:bg-[#1E1F20] p-5 sm:p-6 shadow-xs dark:shadow-none border border-black/5 dark:border-white/5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                        Câu {index + 1}
                      </div>
                      <legend
                        className={`${textSizeClass} leading-relaxed text-[#1F1F1F] dark:text-[#E3E3E3] font-normal`}
                      >
                        {question.content}
                      </legend>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlag(question.id)}
                      title={isFlagged ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'}
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                        isFlagged
                          ? 'bg-[#FEEFC3] text-[#4D3800] dark:bg-[#5C4300] dark:text-[#FEEFC3]'
                          : 'bg-[#F0F4F9] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5] hover:bg-[#E1E5EA] dark:hover:bg-[#333537]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isFlagged ? 'bookmark' : 'bookmark_border'}
                      </span>
                      <span className="hidden sm:inline">Đánh dấu</span>
                    </button>
                  </div>

                  {/* Azota centered divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                    <span className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                      Chọn một đáp án đúng
                    </span>
                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  </div>

                  {/* Azota circular letter + bordered option pill */}
                  <div className="space-y-2.5">
                    {question.options.map((option, optIdx) => {
                      const isChecked = chosenId === option.id;
                      const letter = OPTION_LETTERS[optIdx] ?? String(optIdx + 1);

                      return (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name={question.id}
                            checked={isChecked}
                            onChange={() => onChoose(question.id, option.id)}
                          />
                          <span
                            className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                              isChecked
                                ? 'bg-[#0B57D0] border-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:border-[#A8C7FA] dark:text-[#062E6F]'
                                : 'bg-white dark:bg-[#1E1F20] border-slate-300 dark:border-slate-600 text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:border-[#0B57D0] dark:group-hover:border-[#A8C7FA]'
                            }`}
                          >
                            {letter}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-xl px-4 py-2.5 border transition-colors ${textSizeClass} leading-relaxed ${
                              isChecked
                                ? 'bg-[#D3E3FD]/55 border-[#0B57D0] text-[#041E49] dark:bg-[#004A77]/50 dark:border-[#A8C7FA] dark:text-[#C2E7FF] font-medium'
                                : 'bg-white dark:bg-[#282A2C]/60 border-slate-200 dark:border-slate-700 text-[#1F1F1F] dark:text-[#E3E3E3] group-hover:border-slate-400 dark:group-hover:border-slate-500'
                            }`}
                          >
                            {option.content}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          {/* Right: Sticky Azota 5-Column Question Number Grid */}
          {showNavDrawer && (
            <aside className="lg:col-span-3 lg:sticky lg:top-[76px] rounded-2xl bg-white dark:bg-[#1E1F20] p-4 shadow-xs dark:shadow-none border border-black/5 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                  Danh sách câu hỏi
                </h2>
                <span className="text-xs font-medium text-[#444746] dark:text-[#C4C7C5]">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-0.5">
                {questions.map((question, index) => {
                  const isAnswered = selected.some(
                    (a) => a.questionId === question.id && Boolean(a.selectedOptionId)
                  );
                  const isFlagged = flaggedIds.includes(question.id);
                  const label = String(index + 1).padStart(2, '0');

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => scrollToQuestion(question.id)}
                      className={`relative h-9 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isAnswered
                          ? 'bg-[#0B57D0] border-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:border-[#A8C7FA] dark:text-[#062E6F]'
                          : 'bg-white dark:bg-[#282A2C] border-slate-200 dark:border-slate-700 text-[#1F1F1F] dark:text-[#E3E3E3] hover:border-[#0B57D0] dark:hover:border-[#A8C7FA]'
                      }`}
                    >
                      {label}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#1E1F20]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-[#444746] dark:text-[#C4C7C5]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-[#0B57D0] dark:bg-[#A8C7FA]" />
                  Đã làm
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded border border-slate-300 dark:border-slate-600" />
                  Chưa làm
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Đánh dấu
                </span>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Leave Warning Modal */}
      {showLeaveModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-quiz-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] p-6 shadow-xl border border-black/10 dark:border-white/10 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-[#FEEFC3] dark:bg-[#5C4300] text-[#7A5900] dark:text-[#FEEFC3] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="min-w-0 space-y-1">
                <h2
                  id="leave-quiz-modal-title"
                  className="text-base font-semibold text-[#1F1F1F] dark:text-[#E3E3E3]"
                >
                  Bạn muốn rời khỏi trang làm bài?
                </h2>
                <p className="text-xs leading-relaxed text-[#444746] dark:text-[#C4C7C5]">
                  Bài làm của bạn đang được tính giờ. Đồng hồ đếm ngược vẫn sẽ tiếp tục chạy ngay cả khi bạn rời khỏi trang. Các đáp án bạn đã chọn sẽ được lưu tự động.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C] px-4 py-3 text-xs font-medium text-[#1F1F1F] dark:text-[#E3E3E3]">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                  check_circle
                </span>
                Đã trả lời {answeredCount}/{questions.length} câu
              </span>
              {hasDeadline && (
                <>
                  <span className="text-[#444746] dark:text-[#8E918F]">•</span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA]">
                      timer
                    </span>
                    Còn lại {minutesStr}:{secondsStr}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isLeaving}
                onClick={() => void onLeave()}
                className="rounded-full border border-[#B3261E]/30 dark:border-[#F2B8B5]/30 px-4 py-2 text-xs font-semibold text-[#B3261E] dark:text-[#F2B8B5] hover:bg-[#F9DEDC]/50 dark:hover:bg-[#8C1D18]/40 disabled:opacity-50 cursor-pointer"
              >
                {isLeaving ? 'Đang lưu & thoát...' : 'Vẫn rời khỏi'}
              </button>
              <button
                type="button"
                disabled={isLeaving}
                onClick={() => setShowLeaveModal(false)}
                className="rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] px-5 py-2 text-xs font-semibold text-white dark:text-[#062E6F] hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
