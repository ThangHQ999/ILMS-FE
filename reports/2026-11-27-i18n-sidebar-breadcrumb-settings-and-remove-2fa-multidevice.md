# Sidebar, Breadcrumb & Settings Search i18n + Remove 2FA / Multi-Device Project-Wide

Date: 2026-11-27  
Plan summary: Migrate `DashboardSidebar`, `DashboardHeader` breadcrumb/route titles, and `SettingsHeader`/`ProfileTab` search & labels to symmetric `vi`/`en` i18n keys, and remove all 2FA and active multi-device session references across the codebase.

```text
STATUS: COMPLETE
SUMMARY: Migrated DashboardSidebar, DashboardHeader route breadcrumbs/actions, SettingsHeader quick search (12 indexed items), SettingsPageView, and ProfileTab labels to symmetric vi/en translations; removed all 2FA and multi-device active session UI, types, services, hooks, and badges across the project.
FILES:
- Created: reports/2026-11-27-i18n-sidebar-breadcrumb-settings-and-remove-2fa-multidevice.md
- Modified: src/messages/vi.json, src/messages/en.json, src/features/dashboard/components/DashboardSidebar.tsx, src/features/dashboard/components/DashboardHeader.tsx, src/features/settings/components/SettingsHeader.tsx, src/features/settings/components/SettingsPageView.tsx, src/features/settings/components/SettingsNavigationTabs.tsx, src/features/settings/hooks/useSettingsSearch.ts, src/features/settings/components/tabs/ProfileTab.tsx, src/features/settings/components/tabs/SecurityTab.tsx, src/features/settings/types.ts, src/features/settings/services/settings.service.ts, src/features/settings/hooks/useSettings.ts, src/features/auth/components/ForgotPasswordPageView.tsx, src/features/auth/components/ResetPasswordPageView.tsx, src/features/classes/components/detail/PermanentDeleteClassModal.tsx, TASKS.md
CHECKS: lint not configured · typecheck ✔ (`npx tsc --noEmit`) · tests ✔ (`npx tsx --test src/features/chat/__tests__/chat-message.utils.test.ts src/features/chat/__tests__/chat-themes.test.ts src/features/chat/__tests__/chat-i18n.test.ts` — 14/14 pass) · build ✔ (`npm run build`) · custom checks ✔ (0 hits for 2FA/multi-device scan across src/; JSON valid & 100% key-symmetric for sidebar, dashboard, settings, auth, chat)
ASSUMPTIONS: Multi-account switcher in UserMenuDropdown.tsx ("Đăng xuất khỏi tất cả tài khoản") is unrelated to device-level active session management or 2FA and was preserved; Settings quick search retains bilingual Vietnamese+English keywords in both locales so users can search in either language.
RISKS / LIMITATIONS: [NOT VERIFIED] Runtime visual inspection in browser across both `vi` and `en` locales was not executed; `NotificationsTab` retains backend DTO `sms` channel type while UI uses `t('smsNotifDesc')` updated without 2FA wording (`NotificationsTab` only toggles `push` and `email`).
DOCS: updated TASKS.md · report saved at reports/2026-11-27-i18n-sidebar-breadcrumb-settings-and-remove-2fa-multidevice.md
DEPLOYMENT: not deployed
NEXT: Switch language between Vietnamese and English in Settings and spot-check Sidebar, Header breadcrumb, Settings search dropdown, and Security tab.
```
