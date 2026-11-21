'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  // MD3 Primary / Info Container
  primary: 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]',
  info: 'bg-[#D3E3FD] text-[#041E49] dark:bg-[#162B4D] dark:text-[#A8C7FA]',
  // MD3 Success Container (Example: bg-[#C4EED0] text-[#0D652D])
  success: 'bg-[#C4EED0] text-[#0D652D] dark:bg-[#142E20] dark:text-[#81C995]',
  // MD3 Warning Container (Example: bg-[#FCEBA4] text-[#725200])
  warning: 'bg-[#FCEBA4] text-[#725200] dark:bg-[#3C2A1E] dark:text-[#FFB784]',
  // MD3 Error / Danger Container (Example: bg-[#FAD2CF] text-[#B3261E])
  error: 'bg-[#FAD2CF] text-[#B3261E] dark:bg-[#3C1919] dark:text-[#F28B82]',
  // MD3 Neutral / Surface Container
  neutral: 'bg-[#F0F4F9] text-[#444746] dark:bg-[#282A2C] dark:text-[#C4C7C5]',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-[#041E49] dark:bg-[#A8C7FA]',
  info: 'bg-[#041E49] dark:bg-[#A8C7FA]',
  success: 'bg-[#0D652D] dark:bg-[#81C995]',
  warning: 'bg-[#725200] dark:bg-[#FFB784]',
  error: 'bg-[#B3261E] dark:bg-[#F28B82]',
  neutral: 'bg-[#444746] dark:text-[#8E918F]',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-none whitespace-nowrap select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children}
    </span>
  );
};
