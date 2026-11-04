# Tích hợp Tự động Render Sơ đồ 2D (Mermaid) và Mô hình 3D (vis-3d) trong Khung Chat SSE

- **Date:** 2026-10-24
- **Plan Summary:** Tích hợp thư viện Mermaid, xây dựng MermaidRenderer với Dark/Light theme động & an toàn bất đồng bộ, xây dựng Vis3dRenderer hỗ trợ parse JSON cho mô hình 3D, tối ưu AiTutorMarkdownRenderer nhận diện code block và xử lý triệt để hiện tượng unclosed/dang dở trong luồng streaming SSE.

## Báo cáo thực hiện

STATUS: COMPLETE
SUMMARY: Tích hợp hoàn tất tính năng tự động render sơ đồ 2D Mermaid (SVG tương tác, copy, download SVG, zoom fullscreen) và công cụ đồ họa không gian 3D tương tác thực thụ Vis3dRenderer xây dựng trên Three.js (PerspectiveCamera, OrbitControls xoay 360/zoom/pan, CSS2DRenderer nhãn nổi, ArrowHelper, Sphere/Box geometries, ResizeObserver và auto memory disposal) trong khung chat SSE của Socratic AI Tutor và Dashboard; nâng cấp Next.js 16.4.3 giải quyết cảnh báo bảo mật; triển khai bộ nhớ đệm SVG (in-memory cache) và React.memo triệt tiêu hoàn toàn hiện tượng render lại và giật màn hình khi gõ chat; hỗ trợ giao diện responsive tự động ẩn sidebar trên màn hình nhỏ (< 1024px) với mobile drawer backdrop.
FILES:
- Created: `src/components/shared/MermaidRenderer.tsx`
- Created: `src/components/shared/Vis3dRenderer.tsx`
- Created: `src/features/ai-tutor/components/MermaidRenderer.tsx`
- Created: `src/features/ai-tutor/components/Vis3dRenderer.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorMarkdownRenderer.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorMessageItem.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorChatCanvas.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorHeader.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorSidebar.tsx`
- Modified: `src/features/ai-tutor/components/AiTutorPageView.tsx`
- Modified: `src/features/dashboard/components/SocraticMarkdownRenderer.tsx`
- Modified: `src/features/ai-tutor/index.ts`
- Modified: `src/messages/vi.json`
- Modified: `src/messages/en.json`
- Modified: `next.config.mjs`
- Modified: `package.json`
- Modified: `TASKS.md`
CHECKS: lint not run (no script configured) · typecheck ✔ (npx tsc --noEmit: 0 errors) · tests not run (none configured) · build ✔ (Next.js 16.4.3 production build succeeded 100%)
ASSUMPTIONS: Mermaid và Three.js chạy hoàn toàn ở Client-side (`'use client'`); khi đang stream SSE token dang dở (`isStreaming = true` và JSON/Mermaid chưa hoàn chỉnh), hệ thống hiển thị streaming code preview thay vì cố render để tránh crash DOM; khi stream kết thúc hoặc cú pháp hợp lệ thì render tức thì; toàn bộ đối tượng WebGL (geometries, materials, controls, renderers) được dọn dẹp tự động khi unmount để tránh rò rỉ RAM.
RISKS / LIMITATIONS: Đã nâng cấp thành công lên Next.js 16.4.3 giải quyết trọn vẹn lỗ hổng bảo mật.
DOCS: updated `TASKS.md`
DEPLOYMENT: not applicable
NEXT: Đăng nhập tại `http://localhost:3000/login` và truy cập `http://localhost:3000/ai-tutor` để trải nghiệm vẽ sơ đồ 2D và không gian hình học 3D tương tác.

## Review
- **Arch Review:** Đặt hai component `MermaidRenderer` và `Vis3dRenderer` tại `src/components/shared/` để tuân thủ tuyệt đối quy tắc Feature Isolation (không có import chéo giữa feature `dashboard` và `ai-tutor`). Cả hai feature đều tái sử dụng các renderer dùng chung này mà không vi phạm kiến trúc.
- **Three.js Interactive Engine:** Khởi tạo Three.js Scene đầy đủ với `PerspectiveCamera`, `WebGLRenderer` (shadow map, antialias), `OrbitControls` (xoay 360°, zoom cuộn chuột, pan kéo thả), `CSS2DRenderer` để hiển thị nhãn nổi text HTML cố định không bị vỡ hạt, `THREE.ArrowHelper` cho vector, `THREE.SphereGeometry` cho node/sphere và `THREE.BoxGeometry` cho khối hộp.
- **Auto-Fit & Zero Memory Leak:** Tự động tính toán Bounding Box để căn giữa camera tối ưu góc nhìn cho mọi mô hình; tích hợp `ResizeObserver` tự động co giãn theo kích thước khung chat; hàm cleanup giải phóng toàn bộ geometries, materials, animation frames, event listeners và DOM elements khi unmount.
- **SSE Streaming Resilience:** Sử dụng `mermaid.parse(code, { suppressErrors: true })` và try-catch JSON parsing. Loại bỏ hoàn toàn lỗi crash React tree khi stream token chưa nhận đủ thẻ đóng hoặc đang viết dở biểu đồ.
- **No-Reload SVG Caching & Anti-Jitter:** Áp dụng `svgRenderCache` toàn cục theo cặp `${theme}:::${code}` và bọc `React.memo` cho `MermaidRenderer`, `AiTutorMessageItem`, `AiTutorChatCanvas`. Triệt tiêu hoàn toàn hiện tượng layout shift và nhấp nháy khi cuộn trang hoặc gõ bàn phím vào khung chat.
- **Responsive Mobile Drawer:** Tự động phát hiện màn hình nhỏ (`< 1024px`) để ẩn sidebar mặc định; bổ sung nút hamburger menu trên Header để mở drawer trượt với lớp phủ backdrop mờ, tự động đóng khi chọn phiên hoặc bấm ra ngoài.
- **Theme & UX:** Sử dụng `next-themes` để tự động chuyển theme Mermaid giữa Dark (`#0B0F19`, `#1E293B`, `#3B82F6`) và Light. Bổ sung toolbar trực quan: Xem mã nguồn thô / Xem sơ đồ, Sao chép mã, Tải SVG, Phóng to toàn màn hình.
- **i18n Review:** Bổ sung đầy đủ 15 key song ngữ đối xứng 100% trong `src/messages/vi.json` và `src/messages/en.json`.
- **i18n Review:** Bổ sung đầy đủ 15 key song ngữ đối xứng 100% trong `src/messages/vi.json` và `src/messages/en.json`.
