'use client';

import React, { useState, useEffect, useRef, useMemo, useId } from 'react';
import { useTranslations } from 'next-intl';

export interface DueDatePickerProps {
  value: string | null;
  onChange: (newValue: string | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  clearLabel?: string;
  placeholderDate?: string;
  defaultTime?: string;
  hideClearButton?: boolean;
  helperText?: string;
  showDefaultHint?: boolean;
}

const VI_WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function padZero(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateDisplay(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${padZero(d.getDate())}/${padZero(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseInitialValue(value: string | null): { date: Date | null; time: string } {
  if (!value || !value.trim()) {
    return { date: null, time: '' };
  }
  const trimmed = value.trim();
  // Support format YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const hours = match[4];
    const minutes = match[5];
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return { date: d, time: `${hours}:${minutes}` };
    }
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return {
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      time: `${padZero(d.getHours())}:${padZero(d.getMinutes())}`,
    };
  }
  return { date: null, time: '' };
}

export function DueDatePicker({
  value,
  onChange,
  error,
  label,
  required,
  clearLabel,
  placeholderDate,
  defaultTime = '23:59',
  hideClearButton,
  helperText,
  showDefaultHint,
}: DueDatePickerProps) {
  const t = useTranslations('assignments.teacher.create');
  const dateInputId = useId();

  const [fallbackHour, fallbackMinute] = useMemo(() => {
    const parts = (defaultTime || '23:59').split(':');
    return [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0];
  }, [defaultTime]);

  const dateContainerRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);

  const initial = useMemo(() => parseInitialValue(value), [value]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initial.date);
  const [timeStr, setTimeStr] = useState<string>(initial.time);

  // Popover open states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  // Calendar view year / month
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState<number>(
    initial.date ? initial.date.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(
    initial.date ? initial.date.getMonth() : today.getMonth()
  );

  // Time picker temp states (00-23, 00-59)
  const [tempHour, setTempHour] = useState<number>(fallbackHour);
  const [tempMinute, setTempMinute] = useState<number>(fallbackMinute);

  // Sync internal state if external value changes (e.g. form reset)
  useEffect(() => {
    const parsed = parseInitialValue(value);
    setSelectedDate(parsed.date);
    setTimeStr(parsed.time);
    if (parsed.date) {
      setViewYear(parsed.date.getFullYear());
      setViewMonth(parsed.date.getMonth());
    }
    if (parsed.time) {
      const parts = parsed.time.split(':');
      if (parts.length === 2) {
        setTempHour(parseInt(parts[0], 10) || 0);
        setTempMinute(parseInt(parts[1], 10) || 0);
      }
    }
  }, [value]);

  // Click outside listener for Calendar
  useEffect(() => {
    function handleClickOutsideDate(e: MouseEvent) {
      if (dateContainerRef.current && !dateContainerRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutsideDate);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDate);
    };
  }, [isCalendarOpen]);

  // Click outside listener for Time Picker
  useEffect(() => {
    function handleClickOutsideTime(e: MouseEvent) {
      if (timeContainerRef.current && !timeContainerRef.current.contains(e.target as Node)) {
        setIsTimeOpen(false);
      }
    }
    if (isTimeOpen) {
      document.addEventListener('mousedown', handleClickOutsideTime);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideTime);
    };
  }, [isTimeOpen]);

  // Scroll into view when time popover opens
  useEffect(() => {
    if (isTimeOpen) {
      const timer = setTimeout(() => {
        selectedHourRef.current?.scrollIntoView({ block: 'nearest' });
        selectedMinuteRef.current?.scrollIntoView({ block: 'nearest' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTimeOpen]);

  // Helper to emit combined value (YYYY-MM-DDTHH:mm:ss or null)
  const emitChange = (date: Date | null, time: string) => {
    if (!date) {
      onChange(null);
      return;
    }
    const validTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time) ? time : '23:59';
    const yyyy = date.getFullYear();
    const mm = padZero(date.getMonth() + 1);
    const dd = padZero(date.getDate());
    const isoString = `${yyyy}-${mm}-${dd}T${validTime}:00`;
    onChange(isoString);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Select day in calendar
  const handleSelectDay = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    setIsCalendarOpen(false);

    // Default time when first selected
    const finalTime = timeStr || defaultTime || '23:59';
    setTimeStr(finalTime);
    setTempHour(fallbackHour);
    setTempMinute(fallbackMinute);
    emitChange(newDate, finalTime);
  };

  // Open Time Popover
  const handleToggleTime = () => {
    if (!isTimeOpen) {
      // Sync temp values from timeStr
      if (timeStr) {
        const parts = timeStr.split(':');
        if (parts.length === 2) {
          setTempHour(parseInt(parts[0], 10) || 0);
          setTempMinute(parseInt(parts[1], 10) || 0);
        }
      } else {
        setTempHour(fallbackHour);
        setTempMinute(fallbackMinute);
      }
      setIsCalendarOpen(false);
    }
    setIsTimeOpen((prev) => !prev);
  };

  // Apply selected time from Popover (Bấm Xong)
  const handleApplyTime = () => {
    const formatted = `${padZero(tempHour)}:${padZero(tempMinute)}`;
    setTimeStr(formatted);
    setIsTimeOpen(false);

    // If date is not selected yet, default to today
    const activeDate = selectedDate || new Date();
    if (!selectedDate) {
      setSelectedDate(activeDate);
    }
    emitChange(activeDate, formatted);
  };

  // Clear due date (Bỏ hạn nộp)
  const handleClear = () => {
    setSelectedDate(null);
    setTimeStr('');
    setTempHour(23);
    setTempMinute(59);
    setIsCalendarOpen(false);
    setIsTimeOpen(false);
    onChange(null);
  };

  // Calculate calendar days
  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const blankDaysCount = (firstDay + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const blanks = Array.from({ length: blankDaysCount }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return { blanks, days };
  }, [viewYear, viewMonth]);

  const hasDueDate = Boolean(selectedDate);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label and Clear action */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={dateInputId}
          className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1"
        >
          <span>{label || t('fields.dueDate')}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {!hideClearButton && hasDueDate && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
            <span>{clearLabel || t('fields.clearDueDate')}</span>
          </button>
        )}
      </div>

      {/* Date & Time Row: auto-wraps on mobile screens */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Ô Ngày */}
        <div className="flex-1 min-w-0 relative" ref={dateContainerRef}>
          <div
            onClick={() => {
              setIsTimeOpen(false);
              setIsCalendarOpen((prev) => !prev);
            }}
            className="relative flex items-center cursor-pointer group"
          >
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <input
              id={dateInputId}
              type="text"
              readOnly
              value={formatDateDisplay(selectedDate)}
              placeholder={placeholderDate || t('fields.datePlaceholder')}
              className={`w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border-2 shadow-xs cursor-pointer placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all ${
                error
                  ? 'border-rose-300 dark:border-rose-800'
                  : isCalendarOpen
                  ? 'border-blue-500 bg-white dark:bg-slate-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            />
          </div>

          {/* Calendar Popover */}
          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Header: Month Year + Prev/Next buttons */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tháng {viewMonth + 1}, {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title="Tháng trước"
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title="Tháng sau"
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Day-of-week header: Monday first */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {VI_WEEKDAYS.map((wd) => (
                  <span
                    key={wd}
                    className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarCells.blanks.map((b) => (
                  <div key={`blank-${b}`} className="w-8 h-8" />
                ))}
                {calendarCells.days.map((day) => {
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === viewYear &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getDate() === day;

                  const isToday =
                    today.getFullYear() === viewYear &&
                    today.getMonth() === viewMonth &&
                    today.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isToday
                          ? 'border border-blue-500/80 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Ô Giờ (Nút mở Popover 2 cột Giờ - Phút) */}
        <div className="w-full sm:w-[130px] shrink-0 relative" ref={timeContainerRef}>
          <button
            type="button"
            onClick={handleToggleTime}
            className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono border-2 shadow-xs transition-all flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              error
                ? 'border-rose-300 dark:border-rose-800'
                : isTimeOpen
                ? 'border-blue-500 bg-white dark:bg-slate-900 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">
                schedule
              </span>
              <span className={timeStr ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                {timeStr || defaultTime || '23:59'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">
              expand_more
            </span>
          </button>

          {/* Time Picker Popover (2 Cột Giờ 00-23 & Phút 00-59 + Nút Xong) */}
          {isTimeOpen && (
            <div className="absolute top-full right-0 sm:left-0 mt-2 z-50 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-3 animate-in fade-in zoom-in-95 duration-150">
              {/* Header 2 cột */}
              <div className="grid grid-cols-2 gap-2 text-center pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('fields.hour')}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('fields.minute')}
                </span>
              </div>

              {/* 2 danh sách cuộn */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Cột Giờ (00–23) */}
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                  {HOURS.map((h) => {
                    const isSelected = tempHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        ref={isSelected ? selectedHourRef : undefined}
                        onClick={() => setTempHour(h)}
                        className={`w-full py-1.5 text-xs font-mono font-semibold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {padZero(h)}
                      </button>
                    );
                  })}
                </div>

                {/* Cột Phút (00–59) */}
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                  {MINUTES.map((m) => {
                    const isSelected = tempMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        ref={isSelected ? selectedMinuteRef : undefined}
                        onClick={() => setTempMinute(m)}
                        className={`w-full py-1.5 text-xs font-mono font-semibold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {padZero(m)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút Xong */}
              <button
                type="button"
                onClick={handleApplyTime}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                {t('fields.done')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Helper text or validation error */}
      {error ? (
        <p className="text-xs text-rose-500 font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-[15px] text-slate-400">
            info
          </span>
          <span>{helperText}</span>
        </p>
      ) : showDefaultHint !== false ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-[15px] text-slate-400">
            event_available
          </span>
          <span>{t('fields.dueDateHint')}</span>
        </p>
      ) : null}
    </div>
  );
}
