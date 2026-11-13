import { z } from 'zod';

export const userProfileSchema = z.object({
  id: z.string(),
  roleName: z.string().optional().default('ROLE_USER'),
  email: z.string().email(),
  firstName: z.string().optional().default(''),
  middleName: z.string().nullable().optional(),
  lastName: z.string().optional().default(''),
  avatarUrl: z.string().nullable().optional(),
});

export const loginInputSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.required' })
    .email({ message: 'validation.email' }),
  password: z
    .string()
    .min(6, { message: 'validation.passwordMin' }),
  rememberMe: z.boolean().default(false),
});

export const registerInputSchema = z
  .object({
    lastName: z.string().min(1, { message: 'validation.lastNameRequired' }),
    middleName: z.string().optional().default(''),
    firstName: z.string().min(1, { message: 'validation.firstNameRequired' }),
    email: z
      .string()
      .min(1, { message: 'validation.emailRequired' })
      .email({ message: 'validation.emailInvalid' }),
    password: z
      .string()
      .min(8, { message: 'validation.passwordMin8' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'validation.confirmPasswordRequired' }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'validation.termsRequired',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordMismatch',
    path: ['confirmPassword'],
  });

export type UserProfile = z.infer<typeof userProfileSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const forgotPasswordInputSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.emailRequired' })
    .email({ message: 'validation.emailInvalid' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const oauthUrlResponseSchema = z.object({
  provider: z.string(),
  url: z.string(),
});

export type OAuthUrlResponse = z.infer<typeof oauthUrlResponseSchema>;

export const oauthExchangeInputSchema = z.object({
  code: z.string().min(1),
});

export type OAuthExchangeInput = z.infer<typeof oauthExchangeInputSchema>;

