export type LayoutMode = 'focus' | 'analytics';

export type AiPersona = 'socratic' | 'cheerleader' | 'academic';

export type ThemeMode = 'light' | 'dark';

export type FontFamilyName =
  | 'Plus Jakarta Sans'
  | 'Inter'
  | 'Montserrat'
  | 'Be Vietnam Pro';

export interface ColorOption {
  name: string;
  hex: string;
  rgb: string;
}

export interface OnboardingPreferences {
  layout: LayoutMode;
  persona: AiPersona;
  theme: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  neutralColor: string;
  fontFamily: FontFamilyName;
}
