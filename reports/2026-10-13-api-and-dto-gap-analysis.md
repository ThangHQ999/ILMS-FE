# BÁO CÁO TỔNG HỢP TOÀN DIỆN CÁC API & DTO CÒN THIẾU TRONG HỆ THỐNG ILMS

- **Dự án:** ILMS - Hệ thống quản lý học tập thông minh tích hợp AI
- **Ngày lập:** 13/10/2026
- **Mục đích:** Rà soát toàn bộ mã nguồn Frontend hiện tại (các trang Dashboard, Bản đồ năng lực, Đồ thị tri thức, Gia sư AI, Cài đặt, Onboarding, Trang 404/403, Khóa học), đối chiếu với `docs/PRD.md` và `docs/api-spec.md` để lập danh mục chi tiết các API Backend cần bổ sung kèm chuẩn hóa DTO (Data Transfer Object).

---

## 1. TỔNG QUAN HIỆN TRẠNG DATA LAYER

### A. Các API đã có và đang hoạt động thực tế
Hiện tại, hệ thống mới chỉ có các API thuộc phân hệ Auth cơ bản:
1. `POST /auth/login` (Đăng nhập)
2. `POST /auth/register` (Đăng ký tài khoản)
3. `GET /auth/me` (Lấy thông tin người dùng hiện tại qua Session Cookie)
4. `POST /auth/logout` (Đăng xuất)
5. `POST /auth/forgot-password` (Gửi email khôi phục mật khẩu)

### B. Các phân hệ còn lại trên Frontend
Tất cả các tính năng nâng cao khác hiện đang chạy bằng **Mock Data**, **localStorage**, hoặc **Fallback In-Memory**. Cần triển khai các API và DTO dưới đây để đưa ứng dụng vào hoạt động thực tế với Backend.

---

## 2. DANH MỤC API & DTO CẦN BỔ SUNG THEO PHÂN HỆ

---

### PHÂN HỆ 1: XÁC THỰC MỞ RỘNG & ĐA TÀI KHOẢN (AUTH & MULTI-ACCOUNT)

#### 1.1. Đặt lại mật khẩu (Reset Password)
- **Method & Endpoint:** `POST /auth/reset-password`
- **Mục đích:** Người dùng đổi mật khẩu từ liên kết có token gửi qua email.
- **Request DTO (`ResetPasswordRequest`):**
  ```ts
  interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }
  ```
- **Response DTO:** `ApiResponse<{ success: boolean; message: string }>`
- **Ưu tiên:** **P0** (Cốt lõi)

#### 1.2. Làm mới Token (Refresh Token)
- **Method & Endpoint:** `POST /auth/refresh-token`
- **Mục đích:** Tự động cấp lại token khi access token hết hạn mà không bắt người dùng đăng nhập lại.
- **Request:** Trống (đọc từ HttpOnly Cookie `refreshToken`).
- **Response DTO:** `ApiResponse<{ refreshed: boolean }>` (Set-Cookie mới).
- **Ưu tiên:** **P0** (Cốt lõi)

#### 1.3. Danh sách tài khoản phụ & Chuyển phiên (Multi-Account Switcher)
- **Method & Endpoint:** `GET /user/sub-accounts`
- **Mục đích:** Hiển thị danh sách tài khoản trong `UserMenuDropdown` (380px) và Modal chọn tài khoản ở trang 403.
- **Response DTO (`SubAccountItemDto[]`):**
  ```ts
  interface SubAccountItemDto {
    id: string;
    email: string;
    fullName: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    avatarUrl?: string;
    isCurrent: boolean;
    isSessionExpired: boolean;
  }
  ```
- **Method & Endpoint:** `POST /user/sub-accounts/switch`
- **Request DTO:** `{ targetUserId: string }`
- **Response DTO:** `ApiResponse<UserProfile>` (đổi cookie phiên làm việc).
- **Ưu tiên:** **P1**

---

### PHÂN HỆ 2: BẢNG ĐIỀU KHIỂN & CHỈ SỐ HỌC TẬP (DASHBOARD & METRICS)

#### 2.1. Thống kê tổng quan học tập (Overview Stats)
- **Method & Endpoint:** `GET /dashboard/analytics`
- **Mục đích:** Cung cấp số liệu cho 4 Stat Cards trên Dashboard (Streak, Giờ học, Node đã mở, Hạn nộp bài).
- **Response DTO (`DashboardAnalyticsDto`):**
  ```ts
  interface DashboardAnalyticsDto {
    streakDays: number;
    streakChangeText: string;
    streakRecordDays: number;
    studyHoursThisWeek: number;
    studyHoursGoal: number;
    studyHoursGoalPercent: number;
    knowledgeNodesUnlocked: number;
    knowledgeNodesTotal: number;
    knowledgeGraphPercent: number;
    knowledgeGraphTopic: string;
    approachingDeadlinesCount: number;
    nearestDeadlineDescription: string;
  }
  ```
- **Ưu tiên:** **P0**

#### 2.2. Ma trận Heatmap & Trụ cột năng lực Dashboard
- **Method & Endpoint:** `GET /dashboard/competency`
- **Mục đích:** Cung cấp ma trận đóng góp 12 tuần và 4 trụ cột kỹ năng (Core CS, AI & Data, Software Eng, Problem Solving).
- **Response DTO (`DashboardCompetencyDto`):**
  ```ts
  interface HeatmapCellDto {
    week: number; // 1..12
    day: number;  // 0..6
    level: 'empty' | 'weak' | 'medium' | 'good' | 'master';
    hours?: number;
  }

  interface CompetencyPillarDto {
    id: string;
    name: string;
    percentage: number;
    changeText: string;
    color: string;
  }

  interface DashboardCompetencyDto {
    heatmap: HeatmapCellDto[];
    pillars: CompetencyPillarDto[];
  }
  ```
- **Ưu tiên:** **P1**

#### 2.3. Lời khuyên & Đánh giá năng lực hàng ngày từ AI (AI Daily Insight)
- **Method & Endpoint:** `GET /dashboard/ai-insight`
- **Mục đích:** Hộp thông minh AI Insight phân tích lỗ hổng kiến thức và đề xuất bài học tiếp theo.
- **Response DTO (`AIInsightDto`):**
  ```ts
  interface AIInsightDto {
    title: string;
    diagnosisText: string;
    readinessScore: number;
    actionTopic: string;
    actionDuration: string;
    actionUrl: string;
    actionBadge: string;
    status: 'OPTIMAL' | 'ATTENTION' | 'CRITICAL';
  }
  ```
- **Ưu tiên:** **P1**

#### 2.4. Danh sách khóa học đang theo học (Enrolled Courses with Progress)
- **Method & Endpoint:** `GET /me/courses`
- **Query Params:** `?filter=in_progress|completed|all&page=1&pageSize=10`
- **Response DTO (`PaginatedResponse<EnrolledCourseDto>`):**
  ```ts
  interface EnrolledCourseDto {
    id: string;
    code: string;
    title: string;
    instructorName: string;
    instructorAvatar?: string;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    nextLessonTitle: string;
    nextLessonId: string;
    estimatedTimeToFinish: string;
    gradeTarget: string;
    currentGradeEstimate: number;
    coverImageUrl?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  }
  ```
- **Ưu tiên:** **P0**

#### 2.5. Hệ thống Thông báo (Notifications Center)
- **Method & Endpoint:** `GET /notifications`
- **Query Params:** `?tab=all|unread|system|academic&page=1&pageSize=20`
- **Response DTO (`PaginatedResponse<NotificationItemDto>`):**
  ```ts
  interface NotificationItemDto {
    id: string;
    title: string;
    content: string;
    category: 'system' | 'academic' | 'ai_tutor' | 'deadline';
    isRead: boolean;
    createdAt: string; // ISO-8601
    actionUrl?: string;
    severity?: 'info' | 'warning' | 'alert' | 'success';
  }
  ```
- **Method & Endpoint:** `PATCH /notifications/:id/read`
- **Method & Endpoint:** `POST /notifications/read-all`
- **Ưu tiên:** **P1**

---

### PHÂN HỆ 3: BẢN ĐỒ NĂNG LỰC & ĐÁNH GIÁ VI MÔ (COMPETENCY & MICRO-ASSESSMENT)

#### 3.1. Dữ liệu Radar năng lực 6 chiều (Radar Chart Data)
- **Method & Endpoint:** `GET /competency/radar`
- **Query Params:** `?courseId=CS-301`
- **Response DTO (`CompetencyRadarDto`):**
  ```ts
  interface RadarDimensionDto {
    id: string;
    name: string;
    shortName: string;
    userScore: number;      // 0..100
    classAvg: number;       // Điểm trung bình lớp
    ploTarget: number;      // Chuẩn đầu ra chương trình
    personalTarget: number; // Mục tiêu cá nhân
  }

  interface CompetencyRadarDto {
    courseId: string;
    courseName: string;
    dimensions: RadarDimensionDto[];
    overallMastery: number;
    competencyTier: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
  }
  ```
- **Ưu tiên:** **P0**

#### 3.2. Cây kỹ năng định hướng DAG (Skill Tree Stages)
- **Method & Endpoint:** `GET /competency/skill-tree`
- **Query Params:** `?courseId=CS-301`
- **Response DTO (`SkillTreeStageDto[]`):**
  ```ts
  interface SkillNodeDto {
    id: string;
    label: string;
    status: 'completed' | 'in_progress' | 'locked';
    masteryScore: number;
    prerequisiteIds: string[];
    actionType: 'video' | 'quiz' | 'lab';
    durationText: string;
  }

  interface SkillTreeStageDto {
    id: string;
    order: number;
    title: string;
    subtitle: string;
    isUnlocked: boolean;
    masteryPercentage: number;
    nodes: SkillNodeDto[];
  }
  ```
- **Ưu tiên:** **P1**

#### 3.3. Bản đồ nhiệt lớp học (Class Competency Heatmap - Chế độ Giảng viên/So sánh)
- **Method & Endpoint:** `GET /competency/class-heatmap`
- **Query Params:** `?classId=IT001-K19`
- **Response DTO (`ClassHeatmapDto`):**
  ```ts
  interface TopicHeatDto {
    topicId: string;
    topicName: string;
    masteryLevel: 'low' | 'medium' | 'high';
    score: number;
  }

  interface StudentHeatDto {
    studentId: string;
    studentName: string;
    avatarUrl?: string;
    isCurrentUser?: boolean;
    scores: TopicHeatDto[];
  }

  interface ClassHeatmapDto {
    topics: { id: string; name: string }[];
    students: StudentHeatDto[];
  }
  ```
- **Ưu tiên:** **P2**

#### 3.4. Thẻ kiến thức Flashcard cốt lõi & Quiz vi mô Socratic
- **Method & Endpoint:** `GET /competency/topics/:topicId/flashcard`
- **Response DTO (`FlashcardDto`):**
  ```ts
  interface FlashcardDto {
    id: string;
    title: string;
    subTitle: string;
    stateDefinition: {
      term: string;
      desc: string;
    };
    recurrenceFormula: {
      code: string;
      explanationPoints: string[];
    };
  }
  ```
- **Method & Endpoint:** `GET /competency/quizzes/:quizId`
- **Method & Endpoint:** `POST /competency/quizzes/:quizId/submit`
- **Request DTO:** `{ selectedOptionKey: 'A' | 'B' | 'C' | 'D' }`
- **Response DTO (`QuizEvaluationResultDto`):**
  ```ts
  interface QuizEvaluationResultDto {
    isCorrect: boolean;
    scoreEarned: number;
    explanation: string;
    socraticAiHint: string;
    updatedCompetencyScore: number;
  }
  ```
- **Ưu tiên:** **P1**

---

### PHÂN HỆ 4: ĐỒ THỊ TRI THỨC (KNOWLEDGE GRAPH STUDIO)

#### 4.1. Lấy toàn bộ Nodes & Edges của Đồ thị
- **Method & Endpoint:** `GET /knowledge-graph`
- **Query Params:** `?courseId=...&domain=algo|data-struct|all`
- **Response DTO (`KnowledgeGraphFullDto`):**
  ```ts
  interface KnowledgeNodeDto {
    id: string;
    label: string;
    type: 'core' | 'advanced' | 'foundation';
    domain: string;
    masteryScore: number;
    status: 'locked' | 'learning' | 'mastered';
    prerequisitesCount: number;
    importance: 'high' | 'medium' | 'low';
    estimatedHours: number;
    difficultyTier: 'Dễ' | 'Trung bình' | 'Khó' | 'Chuyên gia';
  }

  interface KnowledgeEdgeDto {
    id: string;
    source: string;
    target: string;
    label: string;
    relationshipType: 'prerequisite' | 'optimizes' | 'extends' | 'solves';
    weight: number;
  }

  interface KnowledgeGraphFullDto {
    nodes: KnowledgeNodeDto[];
    edges: KnowledgeEdgeDto[];
    stats: {
      totalEntities: number;
      masteredCount: number;
      inProgressCount: number;
      relationshipsCount: number;
    };
  }
  ```
- **Ưu tiên:** **P0**

#### 4.2. Tìm đường đi ngắn nhất giữa 2 Concept (Dijkstra Shortest Learning Path)
- **Method & Endpoint:** `POST /knowledge-graph/pathfind`
- **Request DTO (`PathfindRequest`):**
  ```ts
  interface PathfindRequest {
    sourceNodeId: string;
    targetNodeId: string;
    preferOptimizedOnly?: boolean;
  }
  ```
- **Response DTO (`PathfindResultDto`):**
  ```ts
  interface PathfindResultDto {
    pathIds: string[];
    nodeLabels: string[];
    stepsCount: number;
    totalTimeEstimate: string;
    recommendedExercisesCount: number;
  }
  ```
- **Ưu tiên:** **P1**

---

### PHÂN HỆ 5: GIA SƯ AI SOCRATIC (AI TUTOR STUDIO & CHATBOT)

#### 5.1. Quản lý Phiên trò chuyện (Chat Sessions)
- **Method & Endpoint:** `GET /ai-tutor/sessions`
- **Response DTO (`ChatSessionItemDto[]`):**
  ```ts
  interface ChatSessionItemDto {
    id: string;
    title: string;
    lastMessagePreview: string;
    updatedAt: string; // ISO-8601
    messageCount: number;
    topicTag?: string;
  }
  ```
- **Method & Endpoint:** `POST /ai-tutor/sessions`
- **Request DTO:** `{ title?: string; initialTopic?: string }`
- **Response DTO:** `ApiResponse<{ sessionId: string }>`
- **Method & Endpoint:** `DELETE /ai-tutor/sessions/:id`
- **Ưu tiên:** **P0**

#### 5.2. Lịch sử Tin nhắn & Gửi truy vấn trò chuyện (Socratic Exchange)
- **Method & Endpoint:** `GET /ai-tutor/sessions/:id/messages`
- **Response DTO (`ChatMessageDto[]`):**
  ```ts
  interface ChatMessageDto {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    createdAt: string;
    codeSnippet?: {
      filename: string;
      language: string;
      code: string;
    };
    complexityTable?: {
      operation: string;
      time: string;
      space: string;
    }[];
    socraticQuestions?: string[];
  }
  ```
- **Method & Endpoint:** `POST /ai-tutor/sessions/:id/chat` (Hỗ trợ SSE Streaming hoặc JSON)
- **Request DTO (`SendChatPromptRequest`):**
  ```ts
  interface SendChatPromptRequest {
    prompt: string;
    contextNodeId?: string; // Node tri thức đang học
    codeContext?: string;   // Mã nguồn học viên đang viết dở
  }
  ```
- **Response DTO:** Trả về đối tượng `ChatMessageDto` đầy đủ hoặc luồng Server-Sent Events (SSE).
- **Ưu tiên:** **P0**

---

### PHÂN HỆ 6: CÀI ĐẶT CÁ NHÂN & TÙY CHỌN HỆ THỐNG (SETTINGS & PROFILE)

#### 6.1. Quản lý Hồ sơ cá nhân (Profile)
- **Method & Endpoint:** `GET /user/profile`
- **Response DTO (`UserProfileDto`):**
  ```ts
  interface UserProfileDto {
    id: string;
    displayName: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    phone: string;
    isPhoneVerified: boolean;
    birthDate: string;
    role: string;
    bio: string;
    avatarUrl?: string;
    socialAccounts: {
      google?: { email: string; isLinked: boolean };
      github?: { username: string; isLinked: boolean };
      apple?: { isLinked: boolean };
    };
  }
  ```
- **Method & Endpoint:** `PUT /user/profile`
- **Request DTO (`UpdateProfileInput`):**
  ```ts
  interface UpdateProfileInput {
    displayName?: string;
    phone?: string;
    birthDate?: string;
    bio?: string;
  }
  ```
- **Method & Endpoint:** `POST /user/avatar` (Upload FormData multipart $\rightarrow$ `{ avatarUrl: string }`)
- **Ưu tiên:** **P0**

#### 6.2. Đổi mật khẩu trong Settings (Change Password)
- **Method & Endpoint:** `PUT /user/password`
- **Request DTO (`ChangePasswordInput`):**
  ```ts
  interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  ```
- **Ưu tiên:** **P0**

#### 6.3. Tùy chọn giao diện & Trải nghiệm (User Preferences)
- **Method & Endpoint:** `GET /user/preferences`
- **Method & Endpoint:** `PUT /user/preferences`
- **Request/Response DTO (`UserPreferencesDto`):**
  ```ts
  interface UserPreferencesDto {
    theme: 'light' | 'dark' | 'system';
    language: 'vi' | 'en';
    timezone: string;
    dateFormat: string;
    fontSize: string;
    highContrast: boolean;
  }
  ```
- **Ưu tiên:** **P1**

#### 6.4. Cấu hình Kênh thông báo (Notification Settings)
- **Method & Endpoint:** `GET /user/notifications/settings`
- **Method & Endpoint:** `PUT /user/notifications/settings`
- **Request/Response DTO (`NotificationSettingsDto`):**
  ```ts
  interface NotificationSettingsDto {
    channels: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
    categories: {
      tutorAndAiMessages: boolean;
      deadlineReminders: boolean;
      streaksAndRankings: boolean;
      webinarsAndPromotions: boolean;
    };
  }
  ```
- **Ưu tiên:** **P2**

#### 6.5. Quản lý Phiên thiết bị & 2FA (Security Settings)
- **Method & Endpoint:** `GET /user/security`
- **Response DTO (`SecuritySettingsDto`):**
  ```ts
  interface SessionDeviceDto {
    id: string;
    device: string;
    location: string;
    ip: string;
    isCurrent: boolean;
    lastActive: string;
  }

  interface SecuritySettingsDto {
    twoFactorEnabled: boolean;
    twoFactorMethod?: string;
    sessions: SessionDeviceDto[];
    privacy: {
      scoreVisibility: 'public' | 'classmates_only' | 'private';
      searchableByEmail: boolean;
    };
  }
  ```
- **Method & Endpoint:** `DELETE /user/sessions/:sessionId` (Đăng xuất từ xa thiết bị khác)
- **Method & Endpoint:** `POST /user/sessions/logout-others` (Đăng xuất tất cả thiết bị khác)
- **Method & Endpoint:** `PUT /user/privacy`
- **Ưu tiên:** **P1**

#### 6.6. Thông tin Gói dịch vụ & Hạn mức GPU Cloud (Billing & Quota)
- **Method & Endpoint:** `GET /user/billing`
- **Response DTO (`BillingInfoDto`):**
  ```ts
  interface BillingInfoDto {
    currentPlan: {
      name: string;
      badge: string;
      description: string;
      price: number;
      currency: string;
      billingCycle: string;
      expiresAt: string;
      autoRenew: boolean;
    };
    cloudLabQuota: {
      usedGb: number;
      totalGb: number;
      percentage: number;
    };
    aiTokensQuota: {
      usedTokens: number;
      totalTokens: number;
      percentage: number;
    };
  }
  ```
- **Ưu tiên:** **P2**

---

### PHÂN HỆ 7: BẢN QUYỀN HỌC VỤ & YÊU CẦU CẤP QUYỀN TRUY CẬP (TRANG 403)

#### 7.1. Gửi Phiếu yêu cầu nâng quyền truy cập (Resource Elevation Request)
- **Method & Endpoint:** `POST /permissions/requests`
- **Mục đích:** Hỗ trợ Modal "Yêu cầu cấp quyền" trên trang 403 Forbidden.
- **Request DTO (`PermissionElevationRequest`):**
  ```ts
  interface PermissionElevationRequest {
    targetResource: string; // VD: "/courses/adv-ai/grading-lab"
    purpose: 'ta' | 'research' | 'reference' | 'other';
    studentId?: string;
    note: string;
  }
  ```
- **Response DTO:**
  ```ts
  interface PermissionElevationResponse {
    ticketId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    estimatedReviewTime: string;
  }
  ```
- **Ưu tiên:** **P1**

---

### PHÂN HỆ 8: KHỞI TẠO CÁ NHÂN HÓA HỌC TẬP (ONBOARDING)

#### 8.1. Kiểm tra trạng thái & Lưu hồ sơ Onboarding
- **Method & Endpoint:** `GET /user/onboarding/status`
- **Response DTO:** `{ hasCompletedOnboarding: boolean }`
- **Method & Endpoint:** `POST /user/onboarding`
- **Request DTO (`OnboardingPreferencesDto`):**
  ```ts
  interface OnboardingPreferencesDto {
    layout: 'focus' | 'analytics';
    persona: 'socratic' | 'cheerleader' | 'academic';
    theme: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    neutralColor: string;
    fontFamily: string;
  }
  ```
- **Ưu tiên:** **P1**

---

## 3. BẢNG TỔNG HỢP MA TRẬN ĐỘ ƯU TIÊN TRIỂN KHAI

| STT | Phân hệ | Endpoint | Method | Mức độ ưu tiên | Tình trạng FE hiện tại |
|:---:|---|---|:---:|:---:|---|
| 1 | Auth | `/auth/reset-password` | POST | **P0** | Chưa có form submit API |
| 2 | Auth | `/auth/refresh-token` | POST | **P0** | Chưa cấu hình Interceptor refresh |
| 3 | Dashboard | `/dashboard/analytics` | GET | **P0** | Đang dùng `MOCK_STAT_OVERVIEW` |
| 4 | Dashboard | `/me/courses` | GET | **P0** | Đang dùng `MOCK_COURSES` |
| 5 | Competency | `/competency/radar` | GET | **P0** | Đang dùng `mockCompetencyRadar` |
| 6 | Knowledge Graph | `/knowledge-graph` | GET | **P0** | Đang dùng `mockKnowledgeNodes` |
| 7 | AI Tutor | `/ai-tutor/sessions` | GET, POST | **P0** | Đang lưu `localStorage` |
| 8 | AI Tutor | `/ai-tutor/sessions/:id/chat` | POST | **P0** | Đang phản hồi giả lập client |
| 9 | Settings | `/user/profile` | GET, PUT | **P0** | Đang dùng `mockProfile` |
| 10 | Settings | `/user/password` | PUT | **P0** | Đang dùng mock delay |
| 11 | Dashboard | `/dashboard/competency` | GET | **P1** | Đang dùng `MOCK_HEATMAP_CELLS` |
| 12 | Dashboard | `/dashboard/ai-insight` | GET | **P1** | Đang dùng `MOCK_AI_INSIGHT` |
| 13 | Dashboard | `/notifications` | GET, PATCH | **P1** | Đang dùng `MOCK_NOTIFICATIONS` |
| 14 | Competency | `/competency/skill-tree` | GET | **P1** | Đang dùng `mockSkillTreeStages` |
| 15 | Competency | `/competency/quizzes/:id/submit`| POST | **P1** | Đang dùng mock quiz client |
| 16 | Knowledge Graph | `/knowledge-graph/pathfind` | POST | **P1** | Đang tính Dijkstra client-side |
| 17 | Permissions (403)| `/permissions/requests` | POST | **P1** | Đang dùng `setTimeout` giả lập |
| 18 | Multi-Account | `/user/sub-accounts` | GET, POST | **P1** | Đang dùng mảng mock trong UI |
| 19 | Onboarding | `/user/onboarding` | POST | **P1** | Đang lưu `localStorage` |
| 20 | Settings | `/user/security` | GET, DELETE | **P1** | Đang dùng `mockSecurity` |
| 21 | Competency | `/competency/class-heatmap` | GET | **P2** | Đang dùng `mockClassHeatmap` |
| 22 | Settings | `/user/notifications/settings` | GET, PUT | **P2** | Đang dùng `mockNotificationSettings` |
| 23 | Settings | `/user/billing` | GET | **P2** | Đang dùng `mockBilling` |

---

## 4. KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO

1. **Chuẩn hóa API Contract:** Backend Team cần sử dụng tài liệu này để tạo OpenAPI / Swagger Specification, đảm bảo các trường DTO khớp chính xác 100% với các Interface Typescript đã định nghĩa trong Frontend.
2. **Ưu tiên đợt 1 (Sprint 1 - Core Backend Integration):** Triển khai 10 API mức **P0** để giải phóng dữ liệu mock ở Dashboard, Radar Năng lực, Đồ thị Tri thức và Chatbot AI.
3. **Ưu tiên đợt 2 (Sprint 2 - Academic Interactivity):** Triển khai các API mức **P1** liên quan đến Đánh giá quiz, Tìm lộ trình đồ thị, Yêu cầu cấp quyền 403 và Quản lý đa tài khoản.
