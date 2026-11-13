import { materials } from '../materials-api';
import type {
  MaterialBackgroundTask,
  PipelineSettings,
  ClusterMetrics,
} from '../schemas/materials-tasks.schema';

const STORAGE_KEY_TASKS = 'ilms_material_background_tasks';
const STORAGE_KEY_SETTINGS = 'ilms_material_pipeline_settings';

export const DEFAULT_PIPELINE_SETTINGS: PipelineSettings = {
  knowledgeGraphExtraction: true,
  bloomAutoQuiz: true,
  socraticVectorEmbedding: true,
  gpuMode: 'speed',
};

export const DEFAULT_CLUSTER_METRICS: ClusterMetrics = {
  gpuLoadPercent: 68,
  activeWorkers: 4,
  memoryUsedGb: 38.4,
  memoryTotalGb: 64.0,
  latencyMs: 24,
  nodeId: 'cluster-ap-southeast-1',
};

export const INITIAL_MOCK_TASKS: MaterialBackgroundTask[] = [
  {
    id: 'task-01',
    jobId: 'job-ocr-2024-01',
    filename: 'Giao_trinh_Cau_truc_du_lieu_Nang_cao_2024.pdf',
    size: '14.2 MB',
    fileType: 'pdf',
    status: 'PROCESSING',
    courseCode: 'CS-202',
    courseName: 'Cấu trúc dữ liệu & Giải thuật',
    uploadedBy: 'TS. Nguyễn Văn An',
    uploadedAt: '10:14',
    currentStep: 'Bước 3/4: Bóc tách thực thể tri thức (Entity Recognition)',
    stepNumber: 3,
    totalSteps: 4,
    progressPercent: 78,
    conceptsFound: 34,
    conceptsSample: 'AVL Tree, Red-Black Tree, B-Tree',
    tokensProcessed: 12480,
    tokensTotal: 16000,
    validationText: 'Đã nhận dạng 34 khái niệm cốt lõi',
    etaSeconds: 35,
    tags: [
      'OCR & Bóc tách thực thể',
      'Sinh Đồ thị tri thức (Knowledge Graph)',
      'Tự động tạo Quiz Bloom',
      'Tóm tắt Socratic Tutor',
    ],
    logs: [
      { timestamp: '10:14:02', level: 'info', text: 'Nhận tệp tin Giao_trinh_Cau_truc_du_lieu_Nang_cao_2024.pdf (14.2 MB)' },
      { timestamp: '10:14:05', level: 'info', text: 'Pipeline OCR phân giải cao khởi tạo với Tesseract v5 + LayoutLM' },
      { timestamp: '10:14:18', level: 'success', text: 'Bóc tách thành công 184 trang văn bản, độ tin cậy 99.4%' },
      { timestamp: '10:14:26', level: 'info', text: 'Phân tích thực thể Named Entity Recognition (NER) theo chuẩn ACM Computing Classification' },
      { timestamp: '10:14:41', level: 'info', text: 'Phát hiện 34 concepts: AVL Tree, Red-Black Tree, Treap, Segment Tree' },
      { timestamp: '10:14:55', level: 'info', text: 'Đang ánh xạ liên kết cha - con trong Đồ thị tri thức (Graph Embedding)...' },
    ],
  },
  {
    id: 'task-02',
    jobId: 'job-ocr-2024-02',
    filename: 'Slide_Chuong06_Cay_Fenwick_BIT.pptx',
    size: '8.4 MB',
    fileType: 'pptx',
    status: 'PROCESSING',
    courseCode: 'CS-202',
    courseName: 'Cấu trúc dữ liệu & Giải thuật',
    uploadedBy: 'Khoa Công nghệ thông tin',
    uploadedAt: '10:20',
    currentStep: 'Bước 4/4: Hoàn thiện câu hỏi trắc nghiệm & Rubric',
    stepNumber: 4,
    totalSteps: 4,
    progressPercent: 92,
    quizQuestionsGenerated: 14,
    quizQuestionsTotal: 15,
    tokensProcessed: 9800,
    tokensTotal: 10500,
    validationText: 'Validation: Syntax check passed (100%)',
    etaSeconds: 12,
    tags: [
      'OCR Slide & Code Snippets',
      'Sinh 15 câu hỏi Auto-Quiz đa tầng Bloom',
    ],
    logs: [
      { timestamp: '10:20:00', level: 'info', text: 'Tải lên bài giảng Slide_Chuong06_Cay_Fenwick_BIT.pptx' },
      { timestamp: '10:20:04', level: 'info', text: 'Bóc tách 42 slide thuyết trình và 8 đoạn mã nguồn C++' },
      { timestamp: '10:20:12', level: 'success', text: 'Trích xuất công thức Fenwick Tree: update(i, v) và query(i)' },
      { timestamp: '10:20:18', level: 'info', text: 'Khởi tạo Bloom-Quiz Engine: sinh 15 câu hỏi phân tầng' },
      { timestamp: '10:20:30', level: 'success', text: 'Đã hoàn tất 14/15 câu trắc nghiệm (Bloom 3-4 Vận dụng cao)' },
    ],
  },
  {
    id: 'task-03',
    jobId: 'job-ocr-2024-03',
    filename: 'De_thi_giua_ky_Thuat_toan_ICPC_2024.docx',
    size: '3.1 MB',
    fileType: 'docx',
    status: 'QUEUED',
    courseCode: 'ICPC-VNU',
    courseName: 'Kỳ thi Olympic Tin học SV',
    uploadedBy: 'TS. Đặng Minh Quân',
    uploadedAt: '10:22',
    queuePosition: 1,
    queueCondition: 'Sẽ bắt đầu ngay khi tác vụ Slide Fenwick hoàn thành',
    queueEtaText: 'Ước tính: ~1p 15s',
    progressPercent: 0,
    tags: [
      'Nhận diện mã nguồn & Test cases',
      'Chấm chéo chống đạo văn AI',
    ],
    logs: [
      { timestamp: '10:22:10', level: 'info', text: 'Đã thêm vào hàng đợi điều phối FIFO #1' },
      { timestamp: '10:22:11', level: 'info', text: 'Chờ slot GPU rảnh từ cụm cluster-ap-southeast-1' },
    ],
  },
  {
    id: 'task-04',
    jobId: 'job-ocr-2024-04',
    filename: 'Video_Bai_giang_05_Segment_Tree.mp4',
    size: '124.0 MB',
    fileType: 'mp4',
    status: 'QUEUED',
    courseCode: 'CS-202',
    courseName: 'Cấu trúc dữ liệu & Giải thuật',
    uploadedBy: 'Ban Giảng huấn CNTT',
    uploadedAt: '10:23',
    queuePosition: 2,
    queueCondition: 'Chờ pipeline âm thanh giải nén',
    queueEtaText: 'Ước tính: ~3p 45s',
    progressPercent: 0,
    tags: [
      'AI Whisper bóc tách phụ đề & Timestamp',
      'Tạo mục lục & Keyframe video',
    ],
    logs: [
      { timestamp: '10:23:45', level: 'info', text: 'Nhận tệp tin video 124.0 MB, thời lượng 45:10' },
      { timestamp: '10:23:46', level: 'info', text: 'Đã đưa vào hàng đợi giải mã âm thanh FFmpeg' },
    ],
  },
  {
    id: 'task-05',
    jobId: 'job-ocr-2024-05',
    filename: 'De_cuong_chi_tiet_CS202.pdf',
    size: '1.8 MB',
    fileType: 'pdf',
    status: 'SUCCESS',
    courseCode: 'CS-202',
    courseName: 'Cấu trúc dữ liệu & Giải thuật',
    uploadedBy: 'TS. Nguyễn Văn An',
    uploadedAt: '10:05',
    completedAt: '10:25 AM',
    completedSummary: 'Bóc tách 48 nút kiến thức • Tự động liên kết chương trình đào tạo',
    progressPercent: 100,
    tags: [
      'Đã duyệt chuẩn ABET',
      'Đã liên kết Đồ thị tri thức',
    ],
    logs: [
      { timestamp: '10:05:01', level: 'info', text: 'Khởi tạo bóc tách Đề cương chi tiết CS202' },
      { timestamp: '10:15:30', level: 'success', text: 'Bóc tách thành công 48 khái niệm chuẩn ABET 2024' },
      { timestamp: '10:25:00', level: 'success', text: 'Xuất bản thành công vào Đồ thị tri thức Neo4j' },
    ],
  },
  {
    id: 'task-06',
    jobId: 'SCAN-91',
    filename: 'Bai_tap_on_tap_Giai_tich_scan_mo.pdf',
    size: '9.5 MB',
    fileType: 'pdf',
    status: 'FAILED',
    courseCode: 'MATH-101',
    courseName: 'Toán cao cấp A1',
    uploadedBy: 'ThS. Trần Thị Mai',
    uploadedAt: '09:45',
    errorMessage: 'Tài liệu chất lượng scan thấp (<150 DPI), chữ viết tay mờ gây lỗi nhận dạng ký tự OCR',
    progressPercent: 32,
    tags: [
      'Lỗi bóc tách OCR',
      'Cần AI khử nhiễu nâng cao',
    ],
    logs: [
      { timestamp: '09:45:00', level: 'info', text: 'Bắt đầu xử lý tệp scan Bai_tap_on_tap_Giai_tich_scan_mo.pdf' },
      { timestamp: '09:47:12', level: 'error', text: 'Độ tương phản thấp tại trang 4-12, OCR Confidence < 45%' },
      { timestamp: '09:47:15', level: 'error', text: 'Dừng tiến trình do lỗi scan mờ (#SCAN-91)' },
    ],
  },
];

// LocalStorage helpers (SSR-safe)
export function getStoredTasks(): MaterialBackgroundTask[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_MOCK_TASKS));
      return INITIAL_MOCK_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MOCK_TASKS;
  } catch {
    return INITIAL_MOCK_TASKS;
  }
}

export function saveStoredTasks(tasks: MaterialBackgroundTask[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch {
    // quota exceeded or disabled
  }
}

export function getStoredSettings(): PipelineSettings {
  if (typeof window === 'undefined') return DEFAULT_PIPELINE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_PIPELINE_SETTINGS;
    return { ...DEFAULT_PIPELINE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PIPELINE_SETTINGS;
  }
}

export function saveStoredSettings(settings: PipelineSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Fetch all background tasks.
 * Uses existing Spring Boot GET /api/v1/materials/ingestion endpoint,
 * merging with stored tasks for seamless local persistence.
 */
export async function fetchBackgroundTasks(): Promise<MaterialBackgroundTask[]> {
  const localList = getStoredTasks();

  try {
    // Calling existing Spring Boot endpoint GET /api/v1/materials/ingestion
    const backendJobs = await materials.list();
    if (backendJobs && Array.isArray(backendJobs) && backendJobs.length > 0) {
      const merged = [...localList];
      for (const job of backendJobs) {
        const found = merged.find((t) => t.jobId === job.jobId || t.id === job.jobId);
        if (found) {
          found.status =
            job.status === 'PROCESSING'
              ? 'PROCESSING'
              : job.status === 'QUEUED'
              ? 'QUEUED'
              : job.status === 'SUCCESS' || job.status === 'AWAITING_REVIEW'
              ? 'SUCCESS'
              : job.status === 'FAILED'
              ? 'FAILED'
              : found.status;
        } else {
          merged.unshift({
            id: job.jobId,
            jobId: job.jobId,
            filename: job.title || `Tai_lieu_${job.jobId.slice(0, 8)}.pdf`,
            size: '5.2 MB',
            fileType: 'pdf',
            status:
              job.status === 'PROCESSING'
                ? 'PROCESSING'
                : job.status === 'QUEUED'
                ? 'QUEUED'
                : job.status === 'SUCCESS'
                ? 'SUCCESS'
                : job.status === 'FAILED'
                ? 'FAILED'
                : 'PROCESSING',
            uploadedBy: 'TS. Nguyễn Văn An',
            uploadedAt: 'Vừa xong',
            progressPercent: job.status === 'SUCCESS' ? 100 : job.status === 'QUEUED' ? 0 : 50,
            tags: ['Bóc tách AI'],
          });
        }
      }
      saveStoredTasks(merged);
      return merged;
    }
  } catch {
    // Backend offline or endpoint returned empty, fallback to persisted local list
  }

  return localList;
}

/**
 * Retry a failed task.
 * Calls existing Spring Boot POST /api/v1/materials/ingestion/{jobId}/retry
 */
export async function retryTask(taskId: string): Promise<void> {
  const tasks = getStoredTasks();
  const target = tasks.find((t) => t.id === taskId || t.jobId === taskId);

  if (target?.jobId) {
    try {
      await materials.retry(target.jobId);
    } catch {
      // Local fallback simulation
    }
  }

  const updated = tasks.map((t) => {
    if (t.id === taskId || t.jobId === taskId) {
      return {
        ...t,
        status: 'PROCESSING' as const,
        progressPercent: 10,
        currentStep: 'Bước 1/4: Đang nạp mô hình AI khử nhiễu nâng cao...',
        errorMessage: undefined,
        etaSeconds: 45,
      };
    }
    return t;
  });

  saveStoredTasks(updated);
}

/**
 * Upload a new file into the pipeline.
 * Calls existing Spring Boot POST /api/v1/materials (multipart/form-data)
 */
export async function uploadTaskFile(form: FormData): Promise<MaterialBackgroundTask> {
  let createdJobId: string | undefined;

  try {
    const job = await materials.upload(form);
    if (job?.jobId) {
      createdJobId = job.jobId;
    }
  } catch {
    // Fallback simulation
  }

  const file = form.get('file') as File | null;
  const title = (form.get('title') as string) || file?.name || 'Tai_lieu_moi.pdf';
  const subject = (form.get('subject') as string) || 'Học liệu tổng hợp';
  const sizeMb = file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : '3.8 MB';

  const ext = title.split('.').pop()?.toLowerCase();
  const fileType =
    ext === 'pptx' || ext === 'ppt'
      ? ('pptx' as const)
      : ext === 'docx' || ext === 'doc'
      ? ('docx' as const)
      : ext === 'mp4' || ext === 'mkv' || ext === 'webm'
      ? ('mp4' as const)
      : ('pdf' as const);

  const newTask: MaterialBackgroundTask = {
    id: `task-${Date.now()}`,
    jobId: createdJobId,
    filename: title,
    size: sizeMb,
    fileType,
    status: 'QUEUED',
    courseName: subject,
    uploadedBy: 'TS. Nguyễn Văn An',
    uploadedAt: 'Vừa xong',
    queuePosition: 3,
    queueCondition: 'Đã thêm vào hàng đợi FIFO',
    queueEtaText: 'Ước tính: ~2p 10s',
    progressPercent: 0,
    tags: ['OCR & Bóc tách thực thể', 'Sinh Đồ thị tri thức (Knowledge Graph)'],
    logs: [
      {
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        level: 'info',
        text: `Đã đưa tệp tin "${title}" vào hàng đợi xử lý ngầm`,
      },
    ],
  };

  const current = getStoredTasks();
  const updated = [newTask, ...current];
  saveStoredTasks(updated);
  return newTask;
}

/**
 * Toggle task pause state (Client-side control).
 */
export function togglePauseTask(taskId: string): MaterialBackgroundTask[] {
  const current = getStoredTasks();
  const updated = current.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: (t.status === 'PAUSED' ? 'PROCESSING' : 'PAUSED') as typeof t.status,
      };
    }
    return t;
  });
  saveStoredTasks(updated);
  return updated;
}

/**
 * Boost queue priority for a task (Client-side control).
 */
export function boostTaskPriority(taskId: string): MaterialBackgroundTask[] {
  const current = getStoredTasks();
  const targetIndex = current.findIndex((t) => t.id === taskId);
  if (targetIndex === -1) return current;

  const target = { ...current[targetIndex] };
  target.status = 'PROCESSING';
  target.currentStep = 'Bước 1/4: Đã ưu tiên cấp phát GPU tức thì';
  target.progressPercent = 15;
  target.etaSeconds = 25;
  target.queuePosition = undefined;
  target.queueCondition = undefined;

  const filtered = current.filter((t) => t.id !== taskId);
  const updated = [target, ...filtered];
  saveStoredTasks(updated);
  return updated;
}

/**
 * Remove a task from queue or cancel (Client-side control).
 */
export function removeTask(taskId: string): MaterialBackgroundTask[] {
  const current = getStoredTasks();
  const updated = current.filter((t) => t.id !== taskId && t.jobId !== taskId);
  saveStoredTasks(updated);
  return updated;
}

