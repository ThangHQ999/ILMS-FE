'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white/95 dark:group-[.toaster]:bg-[#1E1F20]/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-[#1F1F1F] dark:group-[.toaster]:text-[#E3E3E3] group-[.toaster]:border group-[.toaster]:border-slate-200/80 dark:group-[.toaster]:border-[#333537] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:font-sans group-[.toaster]:text-xs group-[.toaster]:py-3.5 group-[.toaster]:px-4 group-[.toaster]:gap-3',
          description:
            'group-[.toast]:text-[#747775] dark:group-[.toast]:text-[#C4C7C5] group-[.toast]:text-[11px]',
          actionButton:
            'group-[.toast]:bg-[#0B57D0] group-[.toast]:text-white font-medium rounded-full text-xs px-3 py-1.5',
          cancelButton:
            'group-[.toast]:bg-[#F0F4F9] dark:group-[.toast]:bg-[#282A2C] group-[.toast]:text-[#444746] dark:group-[.toast]:text-[#C4C7C5] rounded-full text-xs px-3 py-1.5',
          closeButton:
            'group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-[#282A2C] group-[.toast]:hover:bg-slate-200 dark:group-[.toast]:hover:bg-[#383A3D] group-[.toast]:text-slate-600 dark:group-[.toast]:text-slate-300 group-[.toast]:border-none',
          success:
            '!bg-emerald-50/95 dark:!bg-[#0D2818]/95 !text-emerald-950 dark:!text-emerald-100 !border-emerald-200/80 dark:!border-emerald-800/80',
          error:
            '!bg-rose-50/95 dark:!bg-[#351010]/95 !text-rose-950 dark:!text-rose-100 !border-rose-200/80 dark:!border-rose-800/80',
          info:
            '!bg-blue-50/95 dark:!bg-[#0D1F3C]/95 !text-blue-950 dark:!text-blue-100 !border-blue-200/80 dark:!border-blue-800/80',
          warning:
            '!bg-amber-50/95 dark:!bg-[#332200]/95 !text-amber-950 dark:!text-amber-100 !border-amber-200/80 dark:!border-amber-800/80',
        },
      }}
      {...props}
    />
  );
}

export { toast };
