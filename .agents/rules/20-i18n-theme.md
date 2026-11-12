# 20-I18N-THEME-MD3 — TEXT, COLOR, UI (GEMINI AESTHETIC)

Always on. Applies to any UI or user-visible string. We strictly follow Google's Material Design 3 (MD3) and the minimal, borderless aesthetic of Google Gemini.

## 1. i18n (next-intl)
1. *No hardcoded user-visible text*: JSX content, placeholder, title, aria-label, alt, toasts, Zod messages, metadata.
2. Server: getTranslations('ns'). Client: useTranslations('ns').
3. Keys are feature.section.key in camelCase. Shared namespaces: common, validation, errors.
4. **Always add keys to both vi.json and en.json in the same change**, same structure.
5. No string concatenation; use ICU placeholders and plural.
6. Dates, currency, numbers via lib/format.ts (Intl + current locale).
7. Locale-aware navigation: Link, useRouter, redirect, usePathname from @/lib/i18n/navigation.
8. UI tone: short, polite, and objective (system-like, not chatty).

## 2. Color & Design Tokens (MD3 / Borderless Logic)
1. Use semantic Tailwind tokens mapped to globals.css (bg-background, bg-surface, bg-surface-hover, text-primary, bg-primary-container, text-on-primary-container).
2. *ZERO BORDERS BY DEFAULT*: Do NOT use border, border-gray-*, ring-*, or shadow-glow. Visual hierarchy MUST rely completely on flat tonal contrast between surfaces (e.g., Background vs. Card Surface).
3. *Forbidden*: Neon colors (bg-blue-600), raw hex classes (bg-[#xxxxxx]), bordered badges, and gradient borders.
4. *Semantic Status*: Use flat, pastel tonal chips without borders. 
   - Success: bg-success-container text-on-success-container
   - Warning: bg-warning-container text-on-warning-container

## 3. Shapes & Typography (Gemini Style)
1. *Pill Shapes*: All interactive elements (Buttons, Tabs, Nav items, Badges, Search bars) MUST use rounded-full.
2. *Cards & Modals*: Main surface containers MUST use rounded-3xl (24px) with generous padding (at least p-6 or p-8). Never use sharp corners.
3. *Breathing Room*: Do not cramp UI elements. Use gap-6 for grids and leading-relaxed (1.625) for multi-line text.
4. *Anti-Wrapping*: Apply whitespace-nowrap to all buttons, badges, tabs, and dates to prevent awkward line breaks.
5. *Fonts*: Use Next.js next/font/google configuration. Main UI uses geometric sans-serif (e.g., Plus Jakarta Sans or Outfit via font-sans). Code uses Roboto Mono (font-mono).

## 4. Light / Dark Theme Constraints
- Theme is managed by next-themes (attribute="class"). Never store theme in Zustand.
- Do not scatter dark: in regular components; CSS tokens switch automatically.
- *Dark Mode Aesthetic*: Background MUST be deep warm charcoal (e.g., #131314). Surfaces MUST be slightly lighter (e.g., #1E1F20). NO dark navy/slate blue tints.
- *Light Mode Aesthetic*: Background MUST be soft gray (#E1E5EA or #F0F4F9). Surfaces MUST be pure white (#FFFFFF) to pop against the background. Add subtle MD3 Level-1 shadow (shadow-sm) only to white cards in light mode to replace borders.

## 5. Standardized Component Patterns (MD3)
- *Primary Buttons*: Tonal filled container (e.g., Pastel Blue bg + Dark Blue text). NOT pure solid neon blue.
- *Secondary Buttons*: Neutral surface variant (e.g., Light Gray bg + Black text).
- *Data Tables*: Wrap in rounded-3xl bg-surface p-6. Header uses muted uppercase text. Remove harsh grid lines; rely on hover:bg-surface-hover for row separation.

## 6. Accessibility
- Every input has a <label> or aria-label; icon-only buttons need aria-label (via i18n).
- Semantic elements (button, nav, main, ordered h1…h6); never div onClick instead of button.
- Keep visible focus rings (using MD3 tonal colors); everything works by keyboard.
- Dialogs/menus use shadcn (Radix) components for focus and ARIA handling.