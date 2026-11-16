import { Suspense } from 'react';
import { ResetPasswordPageView } from '@/features/auth';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#E1E5EA] dark:bg-[#131314]" />}>
      <ResetPasswordPageView />
    </Suspense>
  );
}
