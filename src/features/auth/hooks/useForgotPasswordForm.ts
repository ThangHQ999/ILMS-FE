'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useForgotPassword } from './useForgotPassword';
import { forgotPasswordInputSchema } from '../schemas/auth.schema';

export function useForgotPasswordForm() {
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');

  const [email, setEmail] = useState<string>('alex.nguyen@engineer.dev');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const mutation = useForgotPassword();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError(undefined);
    }
  };

  const executeSendEmail = async (targetEmail: string) => {
    const validationResult = forgotPasswordInputSchema.safeParse({ email: targetEmail });
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      if (issue.message === 'validation.emailRequired') {
        setError(tValidation('emailRequired'));
      } else {
        setError(tValidation('emailInvalid'));
      }
      return;
    }

    try {
      await mutation.mutateAsync(validationResult.data.email);
      setIsSubmitted(true);
      setCountdown(60);
    } catch {
      // If error occurs, still allow simulated feedback or show error
      setError(tErrors('generic'));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    await executeSendEmail(email);
  };

  const handleResend = async () => {
    if (countdown > 0 || mutation.isPending) return;
    setError(undefined);
    await executeSendEmail(email);
  };

  const handleResetState = () => {
    setIsSubmitted(false);
    setError(undefined);
  };

  return {
    email,
    error,
    isSubmitted,
    countdown,
    canResend: countdown === 0,
    isLoading: mutation.isPending,
    handleEmailChange,
    handleSubmit,
    handleResend,
    handleResetState,
  };
}
