'use client';

import React, { forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'surface'
  | 'ghost'
  | 'ghost-neutral'
  | 'outline'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // MD3 Primary Tonal Container: Soft blue bg with dark blue text in light mode; Pastel blue in dark mode
  primary:
    'bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] border-none shadow-none',
  // MD3 Surface / Secondary: Light gray canvas surface in light mode; Level 2 surface in dark mode
  secondary:
    'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] border-none shadow-none',
  surface:
    'bg-[#F0F4F9] hover:bg-[#E1E5EA] text-[#1F1F1F] dark:bg-[#282A2C] dark:hover:bg-[#333537] dark:text-[#E3E3E3] border-none shadow-none',
  // MD3 Ghost / Text: Transparent bg with primary brand text
  ghost:
    'bg-transparent hover:bg-[#F0F4F9] text-[#0B57D0] dark:hover:bg-[#282A2C] dark:text-[#A8C7FA] border-none shadow-none',
  // MD3 Ghost Neutral: Transparent bg with neutral text
  'ghost-neutral':
    'bg-transparent hover:bg-[#F0F4F9] text-[#444746] dark:hover:bg-[#282A2C] dark:text-[#C4C7C5] border-none shadow-none',
  // MD3 Outlined: Strict exception for visual relief alongside primary filled buttons
  outline:
    'bg-transparent border border-[#747775] hover:bg-[#F0F4F9] text-[#1F1F1F] dark:border-[#8E918F] dark:hover:bg-[#282A2C] dark:text-[#E3E3E3] shadow-none',
  // Danger tonal button
  danger:
    'bg-[#FAD2CF] hover:bg-[#F7BCB6] text-[#B3261E] dark:bg-[#3C1919] dark:hover:bg-[#4E2222] dark:text-[#F28B82] border-none shadow-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-xs sm:text-sm',
  lg: 'px-6 py-3 text-sm',
  icon: 'w-10 h-10 p-0 flex items-center justify-center shrink-0',
  'icon-sm': 'w-8 h-8 p-0 flex items-center justify-center shrink-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconEnd,
      isLoading = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        {children}
        {!isLoading && iconEnd && <span className="shrink-0 flex items-center">{iconEnd}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
