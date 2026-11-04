// Public API for features/auth per ARCHITECTURE.md §4.3 & create-feature skill

export { LoginPageView } from './components/LoginPageView';
export { LoginForm } from './components/LoginForm';
export { AuthHeader } from './components/AuthHeader';
export { AuthFooter } from './components/AuthFooter';
export { LoginShowcase } from './components/LoginShowcase';

export { RegisterPageView } from './components/RegisterPageView';
export { RegisterForm } from './components/RegisterForm';
export { RegisterHeader } from './components/RegisterHeader';
export { RegisterShowcase } from './components/RegisterShowcase';
export { RegisterFooter } from './components/RegisterFooter';

export { ForgotPasswordPageView } from './components/ForgotPasswordPageView';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { ForgotPasswordSuccess } from './components/ForgotPasswordSuccess';

export { useLogin } from './hooks/useLogin';
export { useLoginForm } from './hooks/useLoginForm';
export { useRegister } from './hooks/useRegister';
export { useRegisterForm } from './hooks/useRegisterForm';
export { useCurrentUser } from './hooks/useCurrentUser';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useForgotPasswordForm } from './hooks/useForgotPasswordForm';
export { useOAuthLogin } from './hooks/useOAuthLogin';
export {
  login,
  register,
  getMe,
  logout,
  forgotPassword,
  getOAuthUrl,
  getOAuthUrlPublic,
  exchangeOAuthCode,
} from './services/auth.service';
export { authKeys, AUTH_ENDPOINTS } from './constants';

export {
  loginInputSchema,
  registerInputSchema,
  userProfileSchema,
  forgotPasswordInputSchema,
  oauthUrlResponseSchema,
  oauthExchangeInputSchema,
} from './schemas/auth.schema';
export type {
  LoginInput,
  RegisterInput,
  UserProfile,
  ForgotPasswordInput,
  OAuthUrlResponse,
  OAuthExchangeInput,
} from './schemas/auth.schema';
export type {
  OAuthProvider,
  ThemeMode,
  LoginFormState,
  LoginFormErrors,
  RegisterFormState,
  RegisterFormErrors,
} from './types';


