# Kế hoạch Thiết kế & Triển khai Chi tiết Trang chủ Landing Page Mới (ILMS)

> **Dự án:** ILMS - Hệ thống Quản lý Học tập Thông minh tích hợp AI  
> **Ngày lập:** 15/11/2026  
> **Phong cách tham chiếu:** `englishcoach.io.vn` (Cinematic Scroll, 3D Parallax, Tactile Interactions)  
> **Linh vật chủ đạo:** Con Cú Socrate (Socratic Owl Mascot)  
> **Chủ đề chính:** Lớp học thông minh (Smart Classroom), Trợ lý giảng bài gợi mở Socrate (Socratic AI Tutor), Đồ thị tri thức (Knowledge Graph) & Tháp năng lực Bloom  

---

## 1. Tầm nhìn & Triết lý Thiết kế (Design Philosophy)

Trang chủ hiện tại sẽ được tái cấu trúc toàn diện thành một **Hành trình Kể chuyện Tương tác (Interactive Storytelling Journey)**. Thay vì các khối văn bản tĩnh thông thường, người học và giảng viên khi cuộn trang sẽ được dẫn dắt qua từng trạm không gian học tập sống động.

* **Nhịp điệu trải nghiệm (Rhythm):** Cuộn chuột đến đâu, không gian chuyển đổi mượt mà đến đó. Linh vật con cú đóng vai trò là "Người bạn đồng hành thông thái" (Wise Companion), bay lượn và tương tác trực tiếp với con trỏ chuột và ngón tay chạm của người dùng.
* **Phong cách thị giác (Visual Tone & Mood):** *Cyber-Academic* — Sự hòa quyện giữa không gian học thuật cao cấp và công nghệ AI hiện đại. 
  - Màu chủ đạo: Xanh hoàng gia (Royal Blue `#1D4ED8`), Xanh điện tử (Electric Cyan `#00F0FF`), Tím trí tuệ (Deep Indigo `#4F46E5`), Nền than vũ trụ (Space Slate `#0B0F19` ở Dark Mode) và Nền tuyết băng (Pure Ice `#F8FAFC` ở Light Mode).
  - Tương thích 100% Dark Theme & Light Theme thông qua bộ CSS Token hiện có.
* **Hiệu năng cao (60 FPS Guarantee):** Tối ưu hóa WebGL và CSS GPU Acceleration (`transform: translate3d`, `will-change`), chia nhỏ tải (code splitting) để trang tải cực nhanh ngay cả trên mạng 4G di động.

---

## 2. Kiến trúc Công nghệ & Kỹ thuật Hiệu ứng

Dự án hiện đã cài đặt sẵn `@react-three/fiber`, `@react-three/drei`, `three`, `@xyflow/react` và `lucide-react`. Kiến trúc hiệu ứng được phân tách làm 3 tầng độc lập:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TẦNG KHÔNG GIAN 3D NỀN (Three.js WebGL Canvas)           │
│    - Bầu trời hạt tri thức (Knowledge Particles)            │
│    - Quả cầu đa diện xoay theo chuột & cuộn (3D Mesh Orb)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Parallax Depth)
┌──────────────────────────────▼──────────────────────────────┐
│ 2. TẦNG LINH VẬT 2.5D & PARALLAX ENGINE                      │
│    - Con cú 4 trạng thái (PNG nét cao từ Stitch)             │
│    - CSS 3D Perspective + Gyroscope/Mouse Raycaster         │
│    - Quỹ đạo bay cong theo tiến trình cuộn trang             │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Interactive Layer)
┌──────────────────────────────▼──────────────────────────────┐
│ 3. TẦNG THẺ GIAO DIỆN & TƯƠNG TÁC XÚC GIÁC (UI Components)  │
│    - 3D Tilt Card (Nghiêng theo góc nhìn chuột/ngón tay)     │
│    - Spotlight Radial Gradient (Vầng sáng theo con trỏ)      │
│    - Dây dẫn xung điện SVG (Pulsing Circuit Lines)          │
│    - Bong bóng thoại Socrate nở bật (Elastic Popover)        │
└─────────────────────────────────────────────────────────────┘
```

### Chi tiết kỹ thuật từng tầng:

1. **Tầng Three.js Canvas (`SceneCanvas.tsx`):**
   - Render hàng nghìn điểm sáng (points) đại diện cho các kiến thức trong vũ trụ.
   - Khi cuộn chuột: Tọa độ camera Z thay đổi tạo cảm giác người dùng đang lao về phía trước qua các vì sao.
   - Khi rê chuột / vuốt tay: Lực vật lý dạt nhẹ các hạt sáng quanh đầu ngón tay/chuột (particle repulsion).

2. **Tầng Linh vật Con cú (`FloatingSocraticMascot.tsx`):**
   - Không dùng mô hình 3D đa giác nặng nề, mà dùng kỹ thuật **2.5D Depth Layering**:
   - Sử dụng ảnh PNG tách nền chất lượng cao do Stitch vẽ.
   - Được gắn bộ lắng nghe chuột (`useMousePosition` / `DeviceOrientationEvent`): Con cú nghiêng theo hướng nhìn của người dùng (`rotateX`, `rotateY`, `scale3d`). Khi rê chuột lại gần, đôi mắt cú liếc theo con trỏ.

3. **Tầng Tương tác Thẻ & Chạm (`TiltCard.tsx`, `SpotlightWrapper.tsx`):**
   - Các card bài tập, card lớp học khi rê chuột hoặc chạm vào sẽ có lớp phủ phản chiếu ánh sáng (Spotlight gradient) chạy theo ngón tay.
   - Thẻ nghiêng theo góc chạm 3D (`perspective: 1000px`), tạo cảm giác như đang cầm trên tay một tấm thẻ kính Hologram tương lai.

---

## 3. Bản thiết kế Chi tiết 5 Phân cảnh (The 5 Interactive Scenes)

### 🌟 Phân cảnh 1: Hero Station — "Khởi đầu Hành trình Trí tuệ"
* **Mục tiêu:** Gây ấn tượng mạnh trong 3 giây đầu tiên, biến landing page thành trải nghiệm tương tác trực tiếp.
* **Hình ảnh Linh vật:** **Ảnh 1 (Cú chào mừng bay lơ lửng)**.
* **Các thành phần giao diện:**
  - **Header Kính Mờ (Glassmorphism Navbar):** Logo ILMS mới (đã phóng to sắc nét), Switcher ngôn ngữ (VI/EN), Theme Toggle (Dark/Light), Nút "Vào lớp ngay" viền gradient.
  - **Headline ấn tượng:**  
    `Học tập Không giới hạn cùng Trợ lý AI Socrate`  
    `Thấu hiểu sâu sắc từng bài toán, làm chủ mọi lớp học với phương pháp gợi mở tư duy hàng đầu.`
  - **Interactive Socratic Prompt Bar (Thanh gõ thử nghiệm ngay tại Hero):**
    - Người dùng không chỉ đọc mà có thể **gõ thử một bài tập hoặc bấm nút "Thử câu hỏi mẫu"** (ví dụ: *"Tại sao phương trình bậc 2 lại có nghiệm kép?"*, *"Cách cân bằng phản ứng oxi hóa khử?"*).
    - Ngay lập tức, con cú Socratic Mascot vỗ cánh và bung ra bong bóng thoại đối thoại Socrate: Gợi ý cho người dùng bước suy luận đầu tiên kèm công thức LaTeX hiển thị đẹp mắt!
  - **Cụm CTA Kép:**
    - Nút chính: `Bắt đầu Học thử Miễn phí` (Hiệu ứng ánh sáng quét Neon Shimmer).
    - Nút phụ: `Khám phá Không gian 3D` (Cuộn mượt xuống phân cảnh tiếp theo).

---

### 🦉 Phân cảnh 2: Socratic Dialectic Station — "Không giải hộ — Gợi mở tư duy sâu"
* **Mục tiêu:** Làm nổi bật giá trị cốt lõi độc nhất của ILMS so với các công cụ AI thông thường (không đưa đáp án sẵn để học sinh chép, mà rèn luyện tư duy phản biện).
* **Hình ảnh Linh vật:** **Ảnh 2 (Cú thông thái chống cằm suy ngẫm, chỉ tay lên bóng đèn ý tưởng)**.
* **Các thành phần giao diện:**
  - **Bảng so sánh Trực quan (Before / After Interactivity):**
    - *Bên trái (AI truyền thống):* Đưa thẳng đáp án trần trụi -> Học sinh thụ động, không hiểu bản chất, quên ngay sau thi.
    - *Bên phải (ILMS Socratic Coach):* Hệ thống phân tích từng bước, đưa ra câu hỏi gợi mở, hướng dẫn vẽ sơ đồ tư duy, giúp học sinh tự tìm ra đáp án.
  - **Mô phỏng Phòng vấn đáp Socrate thời gian thực:**
    - Khung chat mini mô phỏng một phiên giải bài tập:
      - Học sinh: *"Em không hiểu định luật bảo toàn cơ năng ở đoạn này."*
      - Cú AI: *"Hãy nhìn vào lúc vật ở độ cao cực đại, vận tốc của nó bằng bao nhiêu? Từ đó suy ra động năng là gì?"*
    - Người dùng có thể click vào các nút lựa chọn phản hồi tương tác để trải nghiệm cảm giác được dẫn dắt.

---

### 🌐 Phân cảnh 3: Virtual Smart Classroom & Knowledge Graph — "Lớp học Số & Bản đồ Tri thức"
* **Mục tiêu:** Giới thiệu tính năng quản lý lớp học hiện đại và mạng lưới liên kết bài học trực quan.
* **Hình ảnh Linh vật:** **Ảnh 3 (Cú hoa tiêu cầm la bàn số, kết nối chùm sao tri thức)**.
* **Các thành phần giao diện:**
  - **Mạng lưới Đồ thị Tri thức 3D tương tác (Interactive Knowledge Mesh):**
    - Các nút bài học (Toán, Lý, Hóa, Ngoại ngữ, Lập trình) liên kết với nhau bằng các đường phát quang neon.
    - Học sinh/Giảng viên có thể kéo rê chuột để xoay đồ thị trong không gian.
    - Mã màu phân loại năng lực:
      - 🟢 *Đã thành thạo (Mastered)*
      - 🔵 *Đang tiếp thu (In Progress)*
      - 🟠 *Lỗ hổng kiến thức cần bù đắp (Knowledge Gap)*
  - **Bảng điều khiển Lớp học Thời gian thực (Live Classroom Pulse):**
    - Thẻ KPI điểm danh tự động AI.
    - Chỉ số đo mức độ thấu hiểu bài học EduPulse (High / Medium / Low).
    - Biểu đồ tiến độ làm bài tập cả lớp.

---

### 🏆 Phân cảnh 4: Bloom Mastery Ascent — "Tháp Chinh phục Năng lực & Đánh giá Toàn diện"
* **Mục tiêu:** Thể hiện thang đo chuẩn sư phạm quốc tế (Bloom's Taxonomy) giúp học sinh tiến bộ từ ghi nhớ đến sáng tạo.
* **Hình ảnh Linh vật:** **Ảnh 4 (Cú tốt nghiệp vinh danh đội mũ cử nhân trên đỉnh tháp)**.
* **Các thành phần giao diện:**
  - **Mô hình Tháp Bloom 6 tầng 3D Isometric:**
    - Khi người dùng cuộn chuột qua: Từng tầng tháp sáng đèn rực rỡ từ dưới lên trên:
      1. *Nhớ (Remember)* -> 2. *Hiểu (Understand)* -> 3. *Vận dụng (Apply)* -> 4. *Phân tích (Analyze)* -> 5. *Đánh giá (Evaluate)* -> 6. *Sáng tạo (Create)*.
  - **Hệ thống Huy hiệu & Radar Năng lực (Competency Radar):**
    - Biểu đồ mạng nhện đa chiều đo lường tư duy logic, tính kỷ luật, khả năng tự học và giải quyết vấn đề.
    - Bộ huy hiệu học tập mở khóa dạng 3D kim loại phát sáng.

---

### 🚀 Phân cảnh 5: Action Station & Social Proof — "Gia nhập Kỷ nguyên Học tập Mới"
* **Mục tiêu:** Thúc đẩy chuyển đổi (Đăng ký tài khoản / Tham gia lớp học) và giải đáp mọi thắc mắc.
* **Các thành phần giao diện:**
  - **Bảng Thống kê Ấn tượng (Live Metric Counters):** Số lớp học đang hoạt động, số phiên hỏi đáp Socrate, tỉ lệ cải thiện điểm số trung bình.
  - **Hộp Đăng ký Kêu gọi Hành động (VIP Cyber CTA Box):** Viền sáng chuyển sắc 360 độ, ô nhập email nhận tư vấn hoặc nút "Tạo tài khoản miễn phí" 1-click Google/Email.
  - **Accordion Câu hỏi Thường gặp (Interactive FAQ):** Các thắc mắc phổ biến của học sinh, phụ huynh và giáo viên, đóng mở mượt mà kèm icon phát sáng.
  - **Footer Kính mờ Sang trọng:** Đầy đủ thông tin bản quyền, chứng nhận giáo dục, liên kết điều khoản và mạng xã hội.

---

## 4. Đặc tả Tài nguyên Hình ảnh cho Stitch (Asset Specifications)

Để hệ thống chuyển động đạt độ mượt mà cao nhất, 4 hình ảnh con cú cần được xuất ở định dạng **PNG tách nền trong suốt (Alpha Channel)**, kích thước tối thiểu **1024x1024px** hoặc **2048x2048px**, phong cách **3D Animation Pixar/Disney hiện đại**.

| STT | Tên Asset | Ý nghĩa trong trang | Prompt Tiếng Anh chuẩn cho Stitch |
|---|---|---|---|
| **01** | `mascot-hero.png` | Cú chào mừng bay lượn (Hero) | `A modern, friendly, high-tech Socratic owl mascot in a flying welcoming pose. One wing waving cheerfully to the viewer, large vibrant glowing eyes with smart round spectacles, sleek futuristic feathers with electric blue and white gradients, warm intelligent smile, clean transparent background, 3D Pixar Disney style, ultra high resolution, vibrant lighting, PNG with transparent background.` |
| **02** | `mascot-socratic.png` | Cú đối thoại gợi mở tư duy | `A cute, intelligent Socratic owl mascot in a thoughtful pondering pose. One wing tapping its chin thoughtfully, the other wing gently pointing up towards a glowing idea lightbulb or question mark, enthusiastic and encouraging expression, wearing a sleek scholar scarf, electric blue and cyan feather highlights, clean transparent background, 3D Pixar character style, transparent PNG.` |
| **03** | `mascot-graph.png` | Cú hoa tiêu bản đồ tri thức | `An adventurous owl mascot navigator holding a glowing digital compass, interacting with floating holographic knowledge nodes and constellations, sharp observant posture, high-tech academic explorer theme, vibrant blue, cyan and white color palette, 3D Pixar animated render, isolated on transparent background, PNG.` |
| **04** | `mascot-mastery.png` | Cú tốt nghiệp vinh danh đỉnh cao | `A triumphant, proud Socratic owl mascot wearing an academic graduation cap, standing victorious on a pedestal, wings outstretched with pride and accomplishment, joyful confident expression, subtle glowing aura of knowledge, premium 3D Pixar style, electric blue and gold accent, transparent background, PNG.` |

---

## 5. Kế hoạch Triển khai Code & Cấu trúc File (Implementation Plan)

Toàn bộ code landing page tuân thủ nghiêm ngặt mô hình **Feature-Driven Architecture** theo quy chuẩn `ARCHITECTURE.md` của dự án:

```
src/features/landing/
├── components/
│   ├── LandingPageView.tsx              # Component điều phối chính 5 phân cảnh
│   ├── 3d/
│   │   ├── KnowledgeParticleCanvas.tsx   # Three.js Canvas hạt ánh sáng và tinh vân
│   │   └── KnowledgeMeshOrb.tsx         # Quả cầu đồ thị 3D tương tác
│   ├── mascot/
│   │   ├── FloatingSocraticMascot.tsx   # Quản lý chuyển đổi 4 tư thế cú & Parallax
│   │   └── SocraticSpeechBubble.tsx     # Bong bóng thoại đối thoại tương tác
│   ├── sections/
│   │   ├── LandingHeroSection.tsx       # Phân cảnh 1: Hero & Demo tương tác tức thì
│   │   ├── SocraticDialecticSection.tsx # Phân cảnh 2: Phòng vấn đáp Socrate
│   │   ├── SmartClassroomSection.tsx    # Phân cảnh 3: Đồ thị tri thức & Lớp học số
│   │   ├── BloomMasterySection.tsx      # Phân cảnh 4: Tháp năng lực Bloom 3D
│   │   └── ConversionFaqSection.tsx     # Phân cảnh 5: Thống kê, FAQ & Kêu gọi CTA
│   ├── shared/
│   │   ├── TiltCard.tsx                 # Thẻ nghiêng 3D theo chuột & ngón tay
│   │   └── SpotlightWrapper.tsx         # Quầng sáng phản chiếu con trỏ chuột
│   └── layout/
│       ├── LandingHeader.tsx            # Header kính mờ hiện đại
│       └── LandingFooter.tsx            # Footer chuẩn hóa
├── hooks/
│   ├── useScrollSectionProgress.ts      # Tính toán tọa độ cuộn chuột giữa các cảnh
│   ├── useMouse3DTilt.ts                # Tính góc nghiêng chuột rotateX/Y
│   └── useInteractivePromptDemo.ts      # Quản lý trạng thái nhập thử câu hỏi ở Hero
└── types.ts                             # Kiểu dữ liệu TypeScript định nghĩa cảnh & dữ liệu
```

---

## 6. Lộ trình Thực hiện theo từng Bước

* **Giai đoạn 1 (Nền tảng Tương tác & Khung cảnh):**
  - Tạo Three.js background canvas tối ưu hiệu năng (`next/dynamic` với `ssr: false`, tự động giảm mật độ hạt trên Mobile và ngắt render khi ẩn tab).
  - Viết hooks xử lý cuộn chuột (`useScrollSectionProgress`), nghiêng thẻ 3D + phản hồi cảm ứng chạm (`useMouse3DTilt`), và tương tác thử nghiệm câu hỏi Socrate (`useInteractivePromptDemo`).
* **Giai đoạn 2 (Dựng chi tiết 5 Phân cảnh & Hiệu ứng Click/Touch/Scroll):**
  - **Scene 1 (Hero Station):** Thanh nhập câu hỏi tương tác trực tiếp, nút chuyển đổi góc nhìn `[Học viên]` ↔ `[Giảng viên]`, Cú Mascot có phản hồi click nảy đàn hồi & liếc mắt theo chuột.
  - **Scene 2 (Socratic Dialectic):** Phòng vấn đáp đối kháng AI giải hộ vs Cú Socrate gợi mở từng bước (click mở khóa Step 1 → Step 2 → Step 3 kèm công thức Toán/Lý).
  - **Scene 3 (Smart Classroom & Knowledge Graph):** Đồ thị tri thức tương tác (click chọn từng Node để xem chi tiết lỗ hổng & bài tập bù đắp) và bảng điều khiển xung nhịp lớp học EduPulse.
  - **Scene 4 (Bloom Mastery Ascent):** Tháp 6 bậc nhận thức Bloom 3D Isometric tương tác (click từng tầng để xem câu hỏi mẫu & biến thiên biểu đồ Radar 6 trục thời gian thực).
  - **Scene 5 (Conversion, Tech Stack & Interactive FAQ):** Dải công nghệ đối tác, bộ đếm số liệu động, hộp CTA Cyber-Academic và Accordion FAQ mượt mà.
* **Giai đoạn 3 (Tự động Tạo & Tách nền 4 Ảnh Mascot Đồng nhất):**
  - Tạo 4 tư thế Cú Socrate 3D Pixar đồng nhất 100% nhân vật gốc (`mascot-hero.png`, `mascot-socratic.png`, `mascot-graph.png`, `mascot-mastery.png`), khử viền trắng (color-to-alpha unpremultiply) để hiển thị trong suốt sắc nét trên cả Dark & Light Mode.
  - Cập nhật đầy đủ từ điển song ngữ đối xứng trong `vi.json` và `en.json`.
* **Giai đoạn 4 (Tối ưu hóa Thiết bị Di động & Kiểm thử):**
  - Tinh chỉnh cử chỉ vuốt chạm trên Mobile/Tablet, ẩn nút chat nổi trùng lặp trên trang chủ.
  - Chạy `lint`, `typecheck` và kiểm tra chất lượng hiển thị thực tế.

---

## 7. Báo cáo Kết quả Triển khai & Kiểm định (Implementation Report & Review)

```text
STATUS: COMPLETE
SUMMARY: Tái thiết kế toàn diện Trang chủ Landing Page (/) theo phong cách Storytelling 3D Cinematic (tham chiếu englishcoach.io.vn) với bảng màu Cyber-Academic riêng của ILMS, tạo và tách nền RGBA 4 tư thế linh vật Cú Socrate 3D Pixar đồng nhất 100%, tích hợp nền hạt 3D Three.js WebGL, hiệu ứng 2.5D Parallax, thẻ 3D Tilt + Spotlight + Click Ripple và 5 phân cảnh tương tác sâu trên cả Desktop lẫn Mobile.
FILES:
  - Created: public/images/landing/mascot-hero.png
  - Created: public/images/landing/mascot-socratic.png
  - Created: public/images/landing/mascot-graph.png
  - Created: public/images/landing/mascot-mastery.png
  - Created: src/features/landing/types.ts
  - Created: src/features/landing/hooks/useMouse3DTilt.ts
  - Created: src/features/landing/hooks/useScrollSectionProgress.ts
  - Created: src/features/landing/hooks/useInteractivePromptDemo.ts
  - Created: src/features/landing/components/3d/KnowledgeParticleField.tsx
  - Created: src/features/landing/components/3d/KnowledgeParticleCanvas.tsx
  - Created: src/features/landing/components/shared/TiltCard.tsx
  - Created: src/features/landing/components/shared/ScrollConstellationRail.tsx
  - Created: src/features/landing/components/mascot/SocraticSpeechBubble.tsx
  - Created: src/features/landing/components/mascot/FloatingSocraticMascot.tsx
  - Created: src/features/landing/components/sections/LandingHeroSection.tsx
  - Created: src/features/landing/components/sections/SocraticDialecticSection.tsx
  - Created: src/features/landing/components/sections/SmartClassroomSection.tsx
  - Created: src/features/landing/components/sections/BloomMasterySection.tsx
  - Created: src/features/landing/components/sections/ConversionFaqSection.tsx
  - Modified: src/features/landing/components/LandingPageView.tsx
  - Modified: src/features/landing/components/LandingHeader.tsx
  - Modified: src/features/landing/index.ts
  - Modified: src/constants/ai-coach-routes.ts
  - Modified: src/messages/vi.json
  - Modified: src/messages/en.json
  - Modified: TASKS.md
CHECKS: lint N/A (no lint script in package.json) · typecheck ✔ (npx tsc --noEmit passed with 0 errors) · i18n parity ✔ (193/193 keys matched)
ASSUMPTIONS: Người dùng chưa đăng nhập truy cập `/` sẽ trải nghiệm toàn bộ 5 trạm tương tác; người dùng đã đăng nhập tự động chuyển hướng vào `/dashboard`.
RISKS / LIMITATIONS: Không có. Three.js Canvas được nạp qua `next/dynamic({ ssr: false })` đảm bảo 0 lỗi Hydration và tự động giảm số hạt trên Mobile.
DOCS: updated TASKS.md & reports/2026-11-15-landing-page-redesign-plan.md
DEPLOYMENT: not deployed
NEXT: Mở trình duyệt tại http://localhost:3000 (trạng thái chưa đăng nhập) để trải nghiệm hiệu ứng cuộn 3D, click thử câu hỏi Socrate, click các node đồ thị và 6 tầng tháp Bloom.
```

### Review độc lập (`/review`):
- **Tính đồng nhất vật thể & tách nền:** 4 file ảnh PNG (`mascot-hero.png`, `mascot-socratic.png`, `mascot-graph.png`, `mascot-mastery.png`) giữ nguyên 100% thiết kế nhân vật Cú Socrate gốc (kính visor cyan phát sáng, tai nghe kim loại xanh, ngực lông trắng, dáng 3D Pixar), đã khử viền trắng bằng thuật toán unpremultiply color-to-alpha giúp các chi tiết Hologram (mũ cử nhân, bảng tính, bóng đèn công thức, chòm sao đồ thị, cúp ngôi sao) trong suốt mượt mà trên cả nền tối (`#0D1117`) và nền sáng (`#E8EEF5`).
- **Tương tác Desktop & Mobile:** Hỗ trợ đầy đủ sự kiện chuột (`onMouseMove`, `onMouseDown`) và cảm ứng chạm (`onTouchStart`, `onTouchMove`, `onTouchEnd`) cho cả hiệu ứng nghiêng 3D, quầng sáng Spotlight và sóng lan tỏa Ripple.

