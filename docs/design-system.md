# DESIGN SYSTEM — ILMS (GEMINI MD3 AESTHETIC)

> Brand values are placeholders. Set the real palette **only** in `src/app/globals.css`, then record it here. Agents use semantic tokens, never raw colors (`20-i18n-theme.md`).

## 1. Brand Palette (Flat & Tonal Contrast)
> AI sẽ đọc các mã màu dưới đây và map vào các biến CSS. Tuyệt đối tuân thủ nguyên tắc **Zero Borders** của Gemini: phân tách các khối bằng độ chênh lệch màu nền (Surface vs. Background), không dùng viền (`border-none`).

**Light Mode (Gemini Light - Minimal & Crisp):**
- Background: `#F0F4F9` (Soft Gray/Blue canvas)
- Foreground: `#1F1F1F` (Primary text) / `#444746` (Secondary text)
- Card (Surface): `#FFFFFF` (Surface Pure - nổi bật trên nền F0F4F9)
- Card Hover (Surface Variant): `#E1E5EA`
- Primary (Button/Action): `#D3E3FD` (Pastel Blue)
- Primary-foreground: `#041E49` (Dark Navy text for contrast)
- Secondary (Neutral Action): `#F0F4F9` (Light gray pill)
- Border: `transparent` (DO NOT USE borders. Rely on contrast or subtle shadow).

**Dark Mode (Gemini Dark - Deep & Breathable):**
- Background: `#131314` (Deep warm charcoal canvas, zero navy tint)
- Foreground: `#E3E3E3` (Primary text) / `#C4C7C5` (Secondary text)
- Card (Surface): `#1E1F20` (Elevated Surface 1)
- Card Hover (Surface Variant): `#282A2C` (Elevated Surface 2)
- Primary (Button/Action): `#A8C7FA` (Pastel Blue)
- Primary-foreground: `#062E6F` (Dark Blue text)
- Secondary (Neutral Action): `#282A2C` (Dark gray pill)
- Border: `transparent` (NO glowing or colored borders).

**Typography (Tải qua `next/font/google`):**
- **Main UI & Text:** `Plus Jakarta Sans` hoặc `Outfit` (Hình học, bo tròn, thoáng chữ, mô phỏng hoàn hảo Google Sans).
- **Code/Tech Data:** `Roboto Mono` (Dành cho code block, CLI, thông số hệ thống).

## 2. Status → Token Mapping (MD3 Pastel Badges)
> Không dùng các màu gốc rực rỡ (chói mắt). Phải dùng các cặp màu Tonal (Nền đục pastel + Chữ đậm/sáng) không viền.

| Meaning | Token | Light Mode (Nền / Chữ) | Dark Mode (Nền / Chữ) | Examples |
|---|---|---|---|---|
| Completed / Success | `success` | `#C4EED0` / `#0D652D` | `#142E20` / `#81C995` | Pass test, quiz completion |
| Pending / Warning | `warning` | `#FCEBA4` / `#725200` | `#3C2A1E` / `#FFB784` | Deadline, resource warning |
| Error / Destructive | `destructive` | `#F9DEDC` / `#410E0B` | `#3C1919` / `#F28B82` | Compile fail, invalid code |
| In progress / Info | `info` | `#D3E3FD` / `#041E49` | `#162B4D` / `#A8C7FA` | Active lesson, info callout |
| Archived / Neutral | `muted` | `#E1E5EA` / `#444746` | `#282A2C` / `#8E918F` | Disabled, archived |

## 3. Shapes, Layout & Elevation (Gemini Architecture)
- **Radius (Pill & Soft Corners):** Mặc định `--radius: 9999px` (`rounded-full`) cho mọi Button, Tab, Input, và Badge. `--radius-lg: 1.5rem` (`rounded-3xl` / 24px) cho toàn bộ Card, Modal, Table Wrapper, Hero. KHÔNG DÙNG góc vuông cứng.
- **Glassmorphism:** HỦY BỎ. Gemini sử dụng thiết kế phẳng (Flat Design) với các lớp màu đục (solid tonal layers). Không dùng `backdrop-filter: blur`.
- **Elevation (Zero Borders):**
  - *Light Mode:* Thêm bóng đổ siêu nhẹ (`shadow-sm` hoặc Level-1 shadow của MD3) dưới các thẻ `#FFFFFF` để phân tách với nền `#F0F4F9`.
  - *Dark Mode:* Không dùng shadow. Chênh lệch màu sắc giữa `#131314` và `#1E1F20` là đủ để tách khối.
- **Grid & Spacing:** Không gian rộng rãi (breathing room). Dùng `gap-6` (24px) hoặc `gap-8` giữa các khối. Hạn chế thiết kế nhồi nhét.

## 4. Layout
- Authenticated shell: collapsible **Sidebar** (state in `useAppStore`) + **Header** (breadcrumbs, search `[ASSUMED]`, language switcher, theme toggle, user menu).
- Sidebar items differ by role (TEACHER vs LEARNER) and are filtered by permission via RBAC.
- Sidebar Active State: Dùng dạng Pill `rounded-full` với màu Tonal (như `info` token), KHÔNG dùng vệt màu (border) dọc.
- Mobile: sidebar becomes a sheet; tables become stacked cards or scroll horizontally in their container.
- Auth pages: centered card (`rounded-3xl`) on `bg-background`.

## 5. Component Conventions
| Need | Use |
|---|---|
| Buttons | shadcn `Button` với `rounded-full`. `default` (MD3 Primary), `secondary` (Tonal Neutral), `ghost` (Text only). Bỏ border ở mọi states. |
| Lists/tables | shared `DataTable` bọc trong thẻ `bg-surface rounded-3xl p-6`. Ẩn các grid lines cứng, dùng `hover:bg-surface-hover` cho dòng. |
| Forms | shared `FormField` + shadcn inputs (`rounded-full`, nền xám/tối); inline errors; submit disabled while pending. |
| Confirmations | `ConfirmDialog` (`rounded-3xl`) for every destructive action. |
| Feedback | `sonner` toasts for results; inline `ErrorState` for failed loads. |
| Status labels | `Badge` (`rounded-full`, border-none) using the mapping in §2. |
| Progress | shadcn `Progress` (track xám/nền, fill bằng MD3 colors). |
| Empty views | `EmptyState` with a clear next action. |

## 6. LMS-Specific Patterns
- **Course card:** Cover, title (2-line clamp, `leading-relaxed`), instructor, status badge (MD3 Pastel), progress bar (students), primary action (Tonal Button).
- **Learning player:** Content area + collapsible lesson outline; sticky prev/next; "Mark complete" button (`rounded-full`); progress at top.
- **Dashboards:** KPI cards (Pure White or `#1E1F20` with generous padding `p-6`) + 1–2 charts. Remove unnecessary nested boxes.
- **Knowledge Graph / Insights:** Use flat text properties separated by middle dots (`•`) instead of boxed badges for simple specs (e.g., `5 phút • Khó • 4 câu`).

## 7. Dark Mode & Accessibility
- Every component verified in light and dark; no scattered `dark:` classes.
- Contrast WCAG AA using standard token pairs; focus rings visible (`ring-2 ring-primary/50`).
- Text readability: Prevent text wrapping in badges/buttons (`whitespace-nowrap`).
- Video content needs captions where available; icon-only buttons need `aria-label`.