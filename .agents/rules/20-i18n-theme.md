# 20-I18N-THEME — TEXT, COLOR, UI

Always on. Applies to any UI or user-visible string.

## 1. i18n (next-intl)
1. **No hardcoded user-visible text**: JSX content, `placeholder`, `title`, `aria-label`, `alt`, toasts, Zod messages, metadata.
2. Server: `getTranslations('ns')`. Client: `useTranslations('ns')`.
3. Keys are `feature.section.key` in camelCase. Shared namespaces: `common`, `validation`, `errors`.
4. **Always add keys to both `vi.json` and `en.json` in the same change**, same structure. If a translation is uncertain, still add it and flag it in the report; never leave a key missing.
5. No string concatenation; use ICU placeholders and `plural`.
6. Dates, currency, numbers via `lib/format.ts` (`Intl` + current locale).
7. Locale-aware navigation: `Link`, `useRouter`, `redirect`, `usePathname` from `@/lib/i18n/navigation`.
8. Use `docs/glossary.md` for domain terms. UI tone: short and polite.

```tsx
const t = useTranslations('courses');
<Button>{t('actions.create')}</Button>
```

## 2. Color & design tokens
1. Use semantic Tailwind tokens only (mapped from CSS variables in `globals.css`): `bg-background` `text-foreground` `bg-card` `bg-primary` `text-primary-foreground` `bg-secondary` `bg-muted` `text-muted-foreground` `bg-accent` `border-border` `ring-ring` `bg-destructive` `bg-success` `bg-warning` `bg-info`.
2. **Forbidden**: `bg-[#xxxxxx]`, inline `style={{ color }}`, raw palette classes (`bg-white`, `text-black`, `text-gray-500`, `bg-blue-600`).
3. Need a new color → add a token to `globals.css` (both `:root` and `.dark`) and map it in the Tailwind theme. If the color value is unknown, ask.
4. Use matching pairs `x` / `x-foreground` for contrast. Charts use `chart-1…5`.
5. Radii via `rounded-md/lg/xl`; no arbitrary px. Merge classes with `cn()`.

## 3. Light / dark theme
- Theme is managed by `next-themes` (`attribute="class"`). Never store theme in Zustand.
- Do not scatter `dark:` in regular components; tokens switch automatically. Use `dark:` only when unavoidable (e.g. different logo image) and comment why.
- Components using `useTheme()` must handle the `mounted` state to avoid hydration mismatch.
- Check every new UI in **both** light and dark.

## 4. Responsive
Mobile-first: base styles for mobile, extend with `sm: md: lg:`. No fixed px widths for main layout. Wide tables scroll horizontally inside their own container.

## 5. Accessibility
- Every input has a `<label>` or `aria-label`; icon-only buttons need `aria-label` (via i18n).
- Semantic elements (`button`, `nav`, `main`, ordered `h1…h6`); never `div onClick` instead of `button`.
- Keep visible focus rings; everything works by keyboard.
- Images: meaningful `alt` (decorative `alt=""`), use `next/image`.
- Dialogs/menus use shadcn (Radix) components for focus and ARIA handling.