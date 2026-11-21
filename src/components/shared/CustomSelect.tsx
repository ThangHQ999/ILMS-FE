'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface CustomSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: string;
  disabled?: boolean;
}

export interface CustomSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  variant?: 'default' | 'pill';
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
}

export function CustomSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Chọn một mục...',
  label,
  disabled = false,
  variant = 'default',
  className = '',
  triggerClassName = '',
  popupClassName = '',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (option: CustomSelectOption<T>) => {
      if (option.disabled || disabled) return;
      onChange(option.value);
      setIsOpen(false);
    },
    [disabled, onChange]
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1.5 ${className}`}
    >
      {label && (
        <span className="text-xs font-semibold text-slate-700 dark:text-[#C4C7C5]">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 text-xs sm:text-sm text-slate-900 dark:text-[#E3E3E3] font-medium flex items-center justify-between gap-2 transition-all outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          variant === 'pill'
            ? 'h-9 px-4 rounded-full bg-[#E1E5EA] dark:bg-[#282A2C] hover:bg-[#D5DAE0] dark:hover:bg-[#323538] border-none focus:ring-2 focus:ring-[#0B57D0]/30 dark:focus:ring-[#A8C7FA]/30'
            : 'h-10 rounded-xl bg-slate-50 dark:bg-[#1E1F20] border border-slate-200 dark:border-[#333537] hover:bg-slate-100 dark:hover:bg-[#282A2C] focus:ring-2 focus:ring-[#0B57D0]/30 dark:focus:ring-[#A8C7FA]/30'
        } ${
          isOpen ? 'ring-2 ring-[#0B57D0] dark:ring-[#A8C7FA]' : ''
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon && (
            <span className="material-symbols-outlined text-[18px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span
          className={`material-symbols-outlined text-[18px] text-slate-400 dark:text-[#8E918F] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0B57D0] dark:text-[#A8C7FA]' : 'rotate-0'
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 top-full mt-1.5 z-50 min-w-full w-max max-w-[300px] p-1.5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-slate-200/90 dark:border-[#333537] shadow-xl dark:shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 origin-top ${popupClassName}`}
        >
          <div className="flex flex-col gap-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors border-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#D3E3FD]/60 dark:bg-[#162B4D]/70 text-[#041E49] dark:text-[#A8C7FA] font-bold'
                      : option.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : 'text-slate-800 dark:text-[#E3E3E3] hover:bg-[#F0F4F9] dark:hover:bg-[#282A2C]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className="material-symbols-outlined text-[17px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-[10px] text-slate-500 dark:text-[#8E918F] font-normal truncate">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 font-bold">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
