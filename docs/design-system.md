# DESIGN SYSTEM — ILMS

> Brand values are placeholders. Set the real palette **only** in `src/app/globals.css`, then record it here. Agents use tokens, never raw colors (`20-i18n-theme.md`).

## 1. Brand Palette
> AI sẽ đọc các mã màu (Hex/RGB/RGBA) dưới đây và tự động chuyển đổi, map vào các biến CSS trong `src/app/globals.css`.

**Light Mode (Clean Modern Corporate):**
- Background: `#F0F4F8` (Neutral Canvas / Crisp Ice-Blue)
- Foreground: `#0A192F` (Deep Obsidian Navy - Text chính)
- Card (Surface): `#FFFFFF` (Surface Pure)
- Primary: `#007BFF` (Tech Blue - Tương tác chính)
- Primary-foreground: `#FFFFFF`
- Secondary: `#6C5CE7` (Electric Indigo)
- Border / Muted: `#DFE3E7` (Surface Variant) hoặc `rgba(10, 25, 47, 0.12)`

**Dark Mode (DevDark Pro / Technical Minimalism):**
- Background: `#0B0F19` (Surface Canvas)
- Foreground: `#F1F5F9` (Text Primary)
- Card (Surface): `#161B26` (Surface Container)
- Primary: `#38BDF8` (Tech Cyan)
- Primary-foreground: `#0B0F19` (Chữ tối trên nền Cyan)
- Secondary: `#2563EB` (Deep Blue) hoặc `#60A5FA` (Electric Blue)
- Accent/Tertiary: `#A855F7` (Tech Purple - Dành cho AI/Logic)
- Border / Muted: `rgba(148, 163, 184, 0.12)` (Border Subtle)

**Typography (Tải qua `next/font/google`):**
- **Headings/Titles:** `Plus Jakarta Sans` (Hình học, hiện đại, dùng cho tiêu đề lớn).
- **Body Text:** `Inter` (Rõ ràng, chống mỏi mắt cho text dài, form).
- **Code/Monospace:** `JetBrains Mono` (Dành riêng cho code block, CLI, thông số kỹ thuật).

## 2. Status → token mapping
| Meaning | Token | Light Mode | Dark Mode | Examples |
|---|---|---|---|---|
| Completed / Success | `success` | `#28A745` (Emerald Green) | `#34D399` | Pass test, quiz completion |
| Pending / Warning | `warning` | `#FD7E14` (Amber) | `#FB923C` (Streak Orange) | Deadline, resource warning |
| Error / Destructive | `destructive` | `#DC3545` (Red) | `#EF4444` | Compile fail, invalid code |
| In progress / Info | `info` | `#007BFF` | `#38BDF8` | Active lesson, info callout |
| Archived / Neutral | `muted` | `#F0F4F8` | `#1E293B` | Disabled, archived |

## 3. Shapes, Layout & Elevation
- **Radius:** Mặc định `--radius: 0.5rem` (8px) cho button, input. `--radius-md: 1rem` (16px) cho Card/Module. `--radius-lg: 1.5rem` (24px) cho Modal/Hero.
- **Glassmorphism:** Các thành phần nổi (Sticky header, tooltips) dùng `backdrop-filter: blur(12px)` (Light) hoặc `blur(16px)` (Dark) kết hợp border trong suốt.
- **Grid:** Hệ thống lưới 8pt. Desktop: 12 cột (margin 32px, gutter 24px). Tablet: 8 cột. Mobile: 4 cột (margin/gutter 16px). 
- **Shadows:** Hạn chế bóng đổ đen đặc trong Dark Mode. Thay vào đó dùng viền sáng (crisp border lighting) và ánh sáng khuếch tán (neon luminous diffusion).

## 4. Layout
- Authenticated shell: collapsible **Sidebar** (state in `useAppStore`) + **Header** (breadcrumbs, search `[ASSUMED]`, language switcher, theme toggle, user menu).
- Sidebar items differ by role and are filtered by permission; labels via i18n; paths via `ROUTES`.
- Mobile: sidebar becomes a sheet; tables become stacked cards or scroll horizontally in their container.
- Auth pages: centered card on `bg-muted`.

## 5. Component conventions
| Need | Use |
|---|---|
| Buttons | shadcn `Button` (`default` primary, `outline` secondary, `destructive`, `ghost`); one primary action per view |
| Lists/tables | shared `DataTable` (server pagination, sort, empty/loading/error states) |
| Forms | shared `FormField` + shadcn inputs; inline errors; submit disabled while pending |
| Confirmations | `ConfirmDialog` for every destructive action |
| Feedback | `sonner` toasts for results; inline `ErrorState` for failed loads |
| Status labels | `Badge` using the mapping in §2 |
| Progress | shadcn `Progress` (+ numeric % text for accessibility) |
| Empty views | `EmptyState` with a clear next action |
| Loading | `Skeleton` matching final layout |

## 6. LMS-specific patterns
- **Course card:** cover, title (2-line clamp), instructor, status badge, progress bar (students), primary action ("Continue"/"Enroll"/"Manage").
- **Learning player:** content area + collapsible lesson outline; sticky prev/next; "Mark complete" button; progress at top; keyboard-friendly.
- **Dashboards:** KPI cards + 1–2 charts (`chart-1…5`); each card has loading/empty states.
- **Gradebook (Phase 2):** sticky header/first column, horizontal scroll.

## 7. Dark mode & accessibility
- Every component verified in light and dark; no scattered `dark:`.
- Contrast WCAG AA using token pairs; focus rings visible; touch targets ≥ 40px on mobile.
- Video content needs captions where available; icon-only buttons need `aria-label`.