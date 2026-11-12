import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ===== Gemini Dark Neutral Surfaces ===== */
        gemini: {
          base: '#131314',
          surface: '#1E1F20',
          'surface-hover': '#282A2C',
          'surface-active': '#333537',
          'text-primary': '#E3E3E3',
          'text-secondary': '#C4C7C5',
          'text-muted': '#8E918F',
          primary: '#A8C7FA',
          'primary-hover': '#8AB4F8',
          'on-primary': '#062E6F',
          container: '#1B3052',
          'on-container': '#D3E3FD',
          success: '#81C995',
          'success-bg': '#142E20',
          warning: '#FFB784',
          'warning-bg': '#3C2A1E',
          error: '#F28B82',
          'error-bg': '#3C1919',
          info: '#A8C7FA',
          'info-bg': '#162B4D',
        },

        /* ===== CSS Variable-based semantic tokens ===== */
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-tertiary) / <alpha-value>)',
        neutral: 'rgb(var(--color-neutral) / <alpha-value>)',
        surface: 'var(--surface)',
        'on-surface': 'var(--on-surface)',
        'surface-hover': 'var(--surface-hover)',
        'surface-variant': 'var(--surface-variant)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'primary-container': 'var(--primary-container)',
        'on-primary-container': 'var(--on-primary-container)',
        'success-container': 'var(--success-container)',
        'on-success-container': 'var(--on-success-container)',
        'warning-container': 'var(--warning-container)',
        'on-warning-container': 'var(--on-warning-container)',
        'error-container': 'var(--error-container)',
        'on-error-container': 'var(--on-error-container)',
        'info-container': 'var(--info-container)',
        'on-info-container': 'var(--on-info-container)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'var(--font-outfit)',
          'var(--font-plus-jakarta-sans)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'var(--font-roboto-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        outfit: ['var(--font-outfit)', 'sans-serif'],
        jakarta: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'md3-1': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
