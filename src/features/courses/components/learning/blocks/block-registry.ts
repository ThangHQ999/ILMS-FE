import type {
  LessonBlock,
  LessonBlockType,
} from '../../../schemas/lesson-block.schema';

export interface BlockTypeMeta {
  type: LessonBlockType;
  label: string;
  description: string;
  icon: string;
  category: 'BASIC' | 'MEDIA' | 'INTERACTIVE';
  keywords: string[];
}

export const BLOCK_TYPE_DEFINITIONS: BlockTypeMeta[] = [
  {
    type: 'TEXT',
    label: 'Văn bản (Markdown & LaTeX)',
    description: 'Đoạn văn bản có định dạng Markdown và công thức toán KaTeX',
    icon: 'notes',
    category: 'BASIC',
    keywords: ['text', 'paragraph', 'markdown', 'latex', 'van ban'],
  },
  {
    type: 'HEADING',
    label: 'Tiêu đề mục (H1 / H2 / H3)',
    description: 'Tiêu đề phân cấp tự động tạo mục lục bài học',
    icon: 'title',
    category: 'BASIC',
    keywords: ['heading', 'h1', 'h2', 'h3', 'tieu de'],
  },
  {
    type: 'CALLOUT',
    label: 'Khối nhấn mạnh (Callout)',
    description: 'Ghi chú, mẹo, cảnh báo hoặc định lý toán học',
    icon: 'lightbulb',
    category: 'BASIC',
    keywords: ['callout', 'note', 'tip', 'theorem', 'warning', 'ghi chu'],
  },
  {
    type: 'VIDEO',
    label: 'Video bài giảng',
    description: 'Nhúng YouTube, Google Drive hoặc MP4 kèm mốc thời gian',
    icon: 'play_circle',
    category: 'MEDIA',
    keywords: ['video', 'youtube', 'mp4', 'bai giang'],
  },
  {
    type: 'SLIDE',
    label: 'Slide / Tài liệu PDF',
    description: 'Nhúng trực tiếp PDF hoặc Google Slides để xem trong bài',
    icon: 'co_present',
    category: 'MEDIA',
    keywords: ['slide', 'pdf', 'presentation', 'tai lieu'],
  },
  {
    type: 'IMAGE',
    label: 'Hình ảnh minh họa',
    description: 'Chèn ảnh từ URL kèm chú thích',
    icon: 'image',
    category: 'MEDIA',
    keywords: ['image', 'photo', 'anh', 'hinh'],
  },
  {
    type: 'CODE_SANDBOX',
    label: 'Code Sandbox tương tác',
    description: 'Trình soạn thảo mã nguồn nhiều ngôn ngữ (chạy thử JS trực tiếp)',
    icon: 'code',
    category: 'INTERACTIVE',
    keywords: ['code', 'sandbox', 'js', 'python', 'java', 'cpp'],
  },
  {
    type: 'QUIZ',
    label: 'Trắc nghiệm nhanh (Inline Quiz)',
    description: 'Câu hỏi kiểm tra hiểu bài ngay tại chỗ kèm giải thích',
    icon: 'quiz',
    category: 'INTERACTIVE',
    keywords: ['quiz', 'trac nghiem', 'question', 'test'],
  },
  {
    type: 'DIAGRAM',
    label: 'Sơ đồ tư duy & 3D (Mermaid / Vis3D)',
    description: 'Vẽ Flowchart, Sequence, ER Diagram hoặc cảnh 3D tương tác',
    icon: 'account_tree',
    category: 'INTERACTIVE',
    keywords: ['diagram', 'mermaid', 'flowchart', 'vis3d', 'so do'],
  },
  {
    type: 'DIVIDER',
    label: 'Đường phân cách',
    description: 'Tạo khoảng ngăn cách sạch giữa các phần kiến thức',
    icon: 'horizontal_rule',
    category: 'BASIC',
    keywords: ['divider', 'hr', 'line', 'phan cach'],
  },
];

export function createDefaultBlockContent(
  type: LessonBlockType
): Record<string, unknown> {
  switch (type) {
    case 'HEADING':
      return { level: 2, text: 'Tiêu đề mục mới' };
    case 'TEXT':
      return { markdown: '' };
    case 'CALLOUT':
      return {
        variant: 'INFO',
        title: 'Ghi chú quan trọng',
        markdown: 'Nhập nội dung cần lưu ý tại đây...',
      };
    case 'VIDEO':
      return {
        url: '',
        sourceType: 'YOUTUBE',
        durationSeconds: 0,
        caption: '',
        chapters: [],
      };
    case 'SLIDE':
      return {
        url: '',
        fileName: '',
        embedType: 'PDF',
        totalPages: 0,
      };
    case 'CODE_SANDBOX':
      return {
        language: 'javascript',
        title: 'Ví dụ thực hành',
        initialCode: '// Viết mã nguồn tại đây\nconsole.log("Xin chào ILMS!");',
        expectedOutput: 'Xin chào ILMS!',
        allowRun: true,
        readOnly: false,
      };
    case 'QUIZ':
      return {
        question: 'Nhập câu hỏi trắc nghiệm nhanh...',
        options: ['Đáp án A', 'Đáp án B', 'Đáp án C'],
        correctIndex: 0,
        explanation: 'Giải thích lý do đáp án đúng...',
        allowRetry: true,
      };
    case 'DIAGRAM':
      return {
        engine: 'MERMAID',
        code: 'flowchart LR\n  A[Khái niệm] --> B[Ví dụ]\n  B --> C[Thực hành]',
        caption: '',
      };
    case 'IMAGE':
      return { url: '', caption: '' };
    case 'DIVIDER':
    default:
      return {};
  }
}

export function extractBlockSocraticContext(block: LessonBlock): {
  id: string;
  type: string;
  title?: string;
  contentText: string;
} {
  const c = block.content as Record<string, unknown>;
  switch (block.type) {
    case 'HEADING':
      return {
        id: block.id,
        type: block.type,
        title: String(c.text || 'Tiêu đề'),
        contentText: String(c.text || ''),
      };
    case 'TEXT':
      return {
        id: block.id,
        type: block.type,
        title: 'Đoạn lý thuyết',
        contentText: String(c.markdown || ''),
      };
    case 'CALLOUT':
      return {
        id: block.id,
        type: block.type,
        title: String(c.title || 'Ghi chú'),
        contentText: `${String(c.title || '')}\n${String(c.markdown || '')}`.trim(),
      };
    case 'CODE_SANDBOX':
      return {
        id: block.id,
        type: block.type,
        title: String(c.title || `Code (${c.language || 'code'})`),
        contentText: String(c.initialCode || ''),
      };
    case 'QUIZ': {
      const opts = Array.isArray(c.options)
        ? c.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${String(o)}`).join('\n')
        : '';
      return {
        id: block.id,
        type: block.type,
        title: String(c.question || 'Câu hỏi trắc nghiệm'),
        contentText: `${String(c.question || '')}\n${opts}`.trim(),
      };
    }
    case 'DIAGRAM':
      return {
        id: block.id,
        type: block.type,
        title: String(c.caption || `Sơ đồ ${c.engine || 'MERMAID'}`),
        contentText: String(c.code || ''),
      };
    case 'VIDEO':
      return {
        id: block.id,
        type: block.type,
        title: String(c.caption || 'Video bài giảng'),
        contentText: `Video: ${String(c.caption || c.url || '')}`,
      };
    case 'SLIDE':
      return {
        id: block.id,
        type: block.type,
        title: String(c.fileName || 'Slide bài giảng'),
        contentText: `Tài liệu slide: ${String(c.fileName || c.url || '')}`,
      };
    default:
      return {
        id: block.id,
        type: block.type,
        title: String(c.caption || block.type),
        contentText: JSON.stringify(c),
      };
  }
}
