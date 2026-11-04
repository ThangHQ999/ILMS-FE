import { ChatSession, CourseSubject, SuggestionTopic } from './types';

export const AI_TUTOR_STORAGE_KEYS = {
  ACTIVE_SESSION_ID: 'ilms_ai_tutor_active_session',
  SIDEBAR_COLLAPSED: 'ilms_ai_tutor_sidebar_collapsed',
} as const;

export const SOCRATIC_ENDPOINTS = {
  STREAM: '/student/chat/stream',
  SESSIONS: '/student/chat/sessions',
  SESSION_DETAIL: (sessionId: string) => `/student/chat/sessions/${sessionId}`,
  UPDATE_SESSION: (sessionId: string) => `/student/chat/sessions/${sessionId}`,
  DELETE_SESSION: (sessionId: string) => `/student/chat/sessions/${sessionId}`,
  FEEDBACK: (messageId: string) => `/student/chat/messages/${messageId}/feedback`,
} as const;

export const socraticKeys = {
  all: ['socratic'] as const,
  sessions: (params?: { pageNumber?: number; pageSize?: number; subject?: string }) =>
    [...socraticKeys.all, 'sessions', params] as const,
  detail: (sessionId: string) => [...socraticKeys.all, 'session', sessionId] as const,
};

export const DEFAULT_SUBJECTS: CourseSubject[] = [
  {
    id: 'dsa',
    name: 'Cấu trúc dữ liệu & Thuật toán',
    code: 'CS-201',
    plo: 'PLO 04: Giải thuật tối ưu',
  },
  {
    id: 'icpc',
    name: 'Luyện thi Thuật toán ICPC',
    code: 'CS-305',
    plo: 'PLO 05: Thuật toán nâng cao',
  },
  {
    id: 'oop',
    name: 'Lập trình hướng đối tượng C++',
    code: 'CS-102',
    plo: 'PLO 02: Kỹ thuật lập trình',
  },
];

export const SUGGESTION_TOPICS: SuggestionTopic[] = [
  {
    id: 'dijkstra',
    title: 'Giải thích thuật toán Dijkstra',
    description: 'Từng bước với ví dụ đồ thị thực tế, tại sao cần hàng đợi ưu tiên (Priority Queue)?',
    prompt: 'Giải thích thuật toán Dijkstra từng bước với ví dụ đồ thị thực tế kèm minh họa cấu trúc dữ liệu Priority Queue',
    icon: 'lightbulb',
    colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    id: 'segment-tree',
    title: 'Kích thước mảng Segment Tree 4*N',
    description: 'Chứng minh hình học & đại số vì sao cây phân đoạn nhị phân cần 4*N node để tránh tràn bộ nhớ.',
    prompt: 'Phân tích chi tiết vì sao mảng biểu diễn Segment Tree trên mảng 1D cần kích thước 4*N phần tử?',
    icon: 'account_tree',
    colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    id: 'avl-vs-rb',
    title: 'So sánh Cây AVL vs Cây Đỏ Đen',
    description: 'Phân tích tần suất thao tác Tra cứu (Lookup) và Chèn/Xóa (Insert/Delete) giữa hai cây cân bằng.',
    prompt: 'So sánh ưu và nhược điểm giữa Cây AVL và Cây Đỏ Đen (Red-Black Tree), khi nào nên ưu tiên cấu trúc nào?',
    icon: 'balance',
    colorClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    id: 'dp-quiz',
    title: 'Luyện trắc nghiệm Quy hoạch động',
    description: 'Tạo 5 bài toán con gối nhau (Overlapping Subproblems) và hệ thức truy hồi để tự kiểm tra kiến thức.',
    prompt: 'Hãy tạo 5 câu hỏi trắc nghiệm kiểm tra độ hiểu thuật toán Quy hoạch động (Dynamic Programming), có phân tích tư duy lời giải.',
    icon: 'quiz',
    colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
];

export const INITIAL_MOCK_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Phân tích độ phức tạp Quick Sort',
    updatedAt: '10:42 AM',
    group: 'today',
    subjectId: 'dsa',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        content: 'Phân tích độ phức tạp của thuật toán Quick Sort giúp em với. Trường hợp xấu nhất xảy ra khi nào và cách tối ưu ạ?',
        timestamp: '10:42 AM',
      },
      {
        id: 'msg-2',
        sender: 'ai',
        content: `Chào **Nhật Minh**! Thầy rất mừng vì em đang đào sâu vào \`Quick Sort\`. Đây là thuật toán phân chia để trị (Divide and Conquer) nền tảng trong khoa học máy tính.\n\nTrước khi đi vào bảng chi tiết, em hãy nhớ nguyên lý cốt lõi: *tốc độ phân hoạch phụ thuộc hoàn toàn vào cách chúng ta lựa chọn* **Pivot (Phần tử chốt)**.`,
        timestamp: '10:43 AM',
        complexityTable: {
          headers: ['Trường hợp', 'Thời gian', 'Bộ nhớ Call Stack', 'Điều kiện xảy ra'],
          rows: [
            {
              caseName: 'Tốt nhất (Best Case)',
              time: 'O(N log N)',
              space: 'O(log N)',
              condition: 'Pivot luôn chia đôi mảng thành 2 nửa cân bằng tuyệt đối',
            },
            {
              caseName: 'Trung bình (Average)',
              time: 'O(N log N)',
              space: 'O(log N)',
              condition: 'Phân hoạch ngẫu nhiên với tỷ lệ chia mảng xấp xỉ',
            },
            {
              caseName: 'Xấu nhất (Worst Case)',
              time: 'O(N²)',
              space: 'O(N)',
              condition: 'Mảng đã có thứ tự sẵn và luôn chọn Pivot ở phần tử đầu/cuối',
              isWorst: true,
            },
          ],
        },
        codeSnippet: {
          filename: 'QuickSort_ICPC.cpp',
          language: 'cpp',
          code: `// Phân hoạch chọn Pivot ngẫu nhiên tránh rơi vào bẫy O(N^2)
int randomizedPartition(vector<int>& arr, int low, int high) {
    int randomIdx = low + rand() % (high - low + 1);
    swap(arr[randomIdx], arr[high]); // Đưa pivot về cuối biên
    
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}`,
        },
        socraticQuestion: 'Nếu mảng đầu vào có **rất nhiều phần tử trùng lặp** (ví dụ: mảng 1.000.000 phần tử toàn số 5), thuật toán 2-way Quick Sort trên có bị suy biến thành `O(N²)` không? Em đã nghe qua giải pháp *3-Way Partition (Cờ Hà Lan của Dijkstra)* để giải quyết vấn đề này chưa?',
      },
    ],
  },
  {
    id: 'session-2',
    title: 'Cài đặt Cây Fenwick (BIT)',
    updatedAt: '09:15 AM',
    group: 'today',
    subjectId: 'dsa',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'user',
        content: 'Cây Fenwick (Binary Indexed Tree) hoạt động như thế nào và tại sao phép toán x & (-x) lại tìm được bit thấp nhất?',
        timestamp: '09:15 AM',
      },
      {
        id: 'msg-2-2',
        sender: 'ai',
        content: 'Chào em! Cây Fenwick (BIT) là cấu trúc dữ liệu cực kỳ tao nhã giúp cập nhật phần tử và tính tổng tiền tố (prefix sum) đều trong thời gian `O(log N)`. Phép toán bitwise `x & (-x)` khai thác tính chất số bù hai (two’s complement) trong hệ thống máy tính để cô lập bit 1 thấp nhất (Least Significant Bit - LSB).',
        timestamp: '09:16 AM',
      },
    ],
  },
  {
    id: 'session-3',
    title: 'Thuật toán quy hoạch động Knapsack',
    updatedAt: '2 ngày trước',
    group: 'past7days',
    subjectId: 'dsa',
    messages: [
      {
        id: 'msg-3-1',
        sender: 'user',
        content: 'Cho em hỏi bài toán Cái Balo 0/1 tối ưu không gian bộ nhớ từ bảng 2D O(N*W) xuống mảng 1D O(W) như thế nào?',
        timestamp: '2 ngày trước',
      },
    ],
  },
  {
    id: 'session-4',
    title: 'Sửa lỗi Null Pointer C++ Segment Tree',
    updatedAt: '3 ngày trước',
    group: 'past7days',
    subjectId: 'dsa',
    messages: [],
  },
  {
    id: 'session-5',
    title: 'Chứng minh định lý Master Theorem',
    updatedAt: '4 ngày trước',
    group: 'past7days',
    subjectId: 'dsa',
    messages: [],
  },
  {
    id: 'session-6',
    title: 'Luyện đề trắc nghiệm PLO 04',
    updatedAt: '5 ngày trước',
    group: 'past7days',
    subjectId: 'dsa',
    messages: [],
  },
];

export interface FormulaItem {
  id: string;
  latex: string;
  title: string;
}

export interface FormulaCategory {
  key: string;
  name: string;
  items: FormulaItem[];
}

export const LATEX_FORMULA_CATEGORIES: FormulaCategory[] = [
  {
    key: 'complexity',
    name: 'Độ phức tạp',
    items: [
      { id: 'c1', latex: 'O(1)', title: 'Hằng số' },
      { id: 'c2', latex: 'O(\\log n)', title: 'Logarit' },
      { id: 'c3', latex: 'O(n)', title: 'Tuyến tính' },
      { id: 'c4', latex: 'O(n \\log n)', title: 'Linearithmic' },
      { id: 'c5', latex: 'O(n^2)', title: 'Bậc hai' },
      { id: 'c6', latex: 'O(2^n)', title: 'Hàm mũ' },
      { id: 'c7', latex: '\\Omega(n)', title: 'Chặn dưới' },
      { id: 'c8', latex: '\\Theta(n)', title: 'Chặn chặt' },
    ],
  },
  {
    key: 'algebra',
    name: 'Đại số & Giải tích',
    items: [
      { id: 'a1', latex: '\\frac{a}{b}', title: 'Phân số' },
      { id: 'a2', latex: '\\sqrt{x}', title: 'Căn bậc hai' },
      { id: 'a3', latex: 'x^{n}', title: 'Lũy thừa' },
      { id: 'a4', latex: 'a_{i}', title: 'Chỉ số dưới' },
      { id: 'a5', latex: '\\sum_{i=1}^{n}', title: 'Tổng Sigma' },
      { id: 'a6', latex: '\\prod_{i=1}^{n}', title: 'Tích Pi' },
      { id: 'a7', latex: '\\lim_{x \\to \\infty}', title: 'Giới hạn' },
      { id: 'a8', latex: '\\int_{a}^{b} f(x) dx', title: 'Tích phân' },
      { id: 'a9', latex: '\\log_2(n)', title: 'Logarit cơ số 2' },
    ],
  },
  {
    key: 'relations',
    name: 'Quan hệ & Tập hợp',
    items: [
      { id: 'r1', latex: '\\le', title: 'Nhỏ hơn hoặc bằng' },
      { id: 'r2', latex: '\\ge', title: 'Lớn hơn hoặc bằng' },
      { id: 'r3', latex: '\\neq', title: 'Khác' },
      { id: 'r4', latex: '\\approx', title: 'Xấp xỉ' },
      { id: 'r5', latex: '\\in', title: 'Thuộc tập hợp' },
      { id: 'r6', latex: '\\notin', title: 'Không thuộc' },
      { id: 'r7', latex: '\\subset', title: 'Tập con' },
      { id: 'r8', latex: '\\cup', title: 'Hợp' },
      { id: 'r9', latex: '\\cap', title: 'Giao' },
      { id: 'r10', latex: '\\emptyset', title: 'Tập rỗng' },
    ],
  },
  {
    key: 'symbols',
    name: 'Ký hiệu & Hy Lạp',
    items: [
      { id: 's1', latex: '\\infty', title: 'Vô cực' },
      { id: 's2', latex: '\\alpha', title: 'Alpha' },
      { id: 's3', latex: '\\beta', title: 'Beta' },
      { id: 's4', latex: '\\theta', title: 'Theta' },
      { id: 's5', latex: '\\lambda', title: 'Lambda' },
      { id: 's6', latex: '\\pi', title: 'Số Pi' },
      { id: 's7', latex: '\\forall', title: 'Với mọi' },
      { id: 's8', latex: '\\exists', title: 'Tồn tại' },
      { id: 's9', latex: '\\implies', title: 'Suy ra' },
      { id: 's10', latex: '\\iff', title: 'Tương đương' },
    ],
  },
];

