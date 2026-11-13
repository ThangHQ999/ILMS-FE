'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLogin } from './useLogin';
import { loginInputSchema } from '../schemas/auth.schema';
import { LoginFormState, LoginFormErrors } from '../types';

const INITIAL_FORM_STATE: LoginFormState = {
  identifier: 'tunganh9876544@gmail.com',
  password: 'Password123@',
  rememberMe: true,
};

export function useLoginForm() {
  const router = useRouter();
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const [formData, setFormData] = useState<LoginFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const loginMutation = useLogin();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const validationResult = loginInputSchema.safeParse({
      email: formData.identifier,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (!validationResult.success) {
      const fieldErrors: LoginFormErrors = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName === 'email') {
          fieldErrors.identifier = tValidation('identifierInvalid');
        } else if (fieldName === 'password') {
          fieldErrors.password = tValidation('passwordMinLength');
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await loginMutation.mutateAsync(validationResult.data);
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = tErrors('loginFailed');
      if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setErrors({
        general: errorMessage,
      });
    }
  };

  return {
    formData,
    errors,
    showPassword,
    isLoading: loginMutation.isPending,
    handleChange,
    togglePasswordVisibility,
    handleLogin,
  };
}
