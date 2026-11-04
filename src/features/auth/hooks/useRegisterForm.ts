'use client';

import { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRegister } from './useRegister';
import { registerInputSchema } from '../schemas/auth.schema';
import { RegisterFormState, RegisterFormErrors } from '../types';

const INITIAL_FORM_STATE: RegisterFormState = {
  lastName: 'Nguyễn',
  middleName: 'Văn',
  firstName: 'An',
  email: 'name@example.com',
  password: 'EduTech#2025!',
  confirmPassword: 'EduTech#2025!',
  termsAccepted: true,
};

export interface PasswordStrength {
  score: number;
  label: string;
  isMax: boolean;
}

export function useRegisterForm() {
  const router = useRouter();
  const tRegister = useTranslations('auth.register');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');

  const [formData, setFormData] = useState<RegisterFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const registerMutation = useRegister();

  const passwordStrength: PasswordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: tRegister('strengthEmpty'), isMax: false };

    let passedCriteria = 0;
    if (pwd.length >= 8) passedCriteria += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) passedCriteria += 1;
    if (/\d/.test(pwd)) passedCriteria += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) passedCriteria += 1;

    let label = tRegister('strengthWeak');
    if (passedCriteria === 2) label = tRegister('strengthMedium');
    else if (passedCriteria === 3) label = tRegister('strengthStrong');
    else if (passedCriteria === 4) label = tRegister('strengthVeryStrong');

    return {
      score: passedCriteria,
      label,
      isMax: passedCriteria === 4,
    };
  }, [formData.password, tRegister]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = (): void => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const validationResult = registerInputSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: RegisterFormErrors = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as keyof RegisterFormErrors;
        if (!fieldErrors[fieldName]) {
          const rawMessage = issue.message;
          if (rawMessage.startsWith('validation.')) {
            const key = rawMessage.replace('validation.', '') as Parameters<typeof tValidation>[0];
            fieldErrors[fieldName] = tValidation(key);
          } else {
            fieldErrors[fieldName] = rawMessage;
          }
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await registerMutation.mutateAsync(validationResult.data);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch {
      setErrors({
        general: tErrors('registerFailed'),
      });
    }
  };

  return {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    passwordStrength,
    isLoading: registerMutation.isPending,
    isSuccess,
    handleChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleRegister,
  };
}
