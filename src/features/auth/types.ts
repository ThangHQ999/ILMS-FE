export type {
  LoginInput,
  RegisterInput,
  UserProfile,
  ForgotPasswordInput,
} from './schemas/auth.schema';


export interface LoginFormState {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormState {
  lastName: string;
  middleName: string;
  firstName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface RegisterFormErrors {
  lastName?: string;
  middleName?: string;
  firstName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
  general?: string;
}

export type OAuthProvider = 'github' | 'google';

export type ThemeMode = 'light' | 'dark';
