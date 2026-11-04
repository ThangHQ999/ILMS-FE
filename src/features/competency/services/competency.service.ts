import {
  CompetencyRadarData,
  MasteryTopic,
  MasteryTrendPoint,
  SocraticRecommendation,
  QuickMetric,
  SkillTreeStage,
  ClassHeatmapData,
  FocusGoal,
  TheoryCardData,
  DiagnosticQuizData,
} from '../types';

export const mockCompetencyRadar: CompetencyRadarData = {
  courseId: 'CS-301',
  courseName: 'Cấu trúc dữ liệu & Giải thuật nâng cao (CS-301)',
  dimensions: [
    {
      id: 'algo',
      name: 'Tư duy Thuật toán',
      shortName: 'Thuật toán',
      userScore: 88,
      classAvg: 72,
      ploTarget: 80,
      personalTarget: 90,
    },
    {
      id: 'data-struct',
      name: 'CTDL Nâng cao',
      shortName: 'CTDL',
      userScore: 85,
      classAvg: 70,
      ploTarget: 80,
      personalTarget: 90,
    },
    {
      id: 'complexity',
      name: 'Tối ưu Độ phức tạp',
      shortName: 'Độ phức tạp',
      userScore: 92,
      classAvg: 75,
      ploTarget: 80,
      personalTarget: 95,
    },
    {
      id: 'cpp',
      name: 'Lập trình C++',
      shortName: 'C++ Code',
      userScore: 78,
      classAvg: 76,
      ploTarget: 80,
      personalTarget: 85,
    },
    {
      id: 'dp',
      name: 'Quy hoạch động',
      shortName: 'DP',
      userScore: 58,
      classAvg: 62,
      ploTarget: 80,
      personalTarget: 85,
      isWarning: true,
    },
    {
      id: 'graph',
      name: 'Đồ thị & Toán rời rạc',
      shortName: 'Đồ thị',
      userScore: 74,
      classAvg: 74,
      ploTarget: 80,
      personalTarget: 85,
    },
  ],
  overallUserScore: 82.5,
  overallClassAvg: 71.5,
  overallPloTarget: 80.0,
};

export const mockMasteryTopics: MasteryTopic[] = [
  {
    id: 'seg-tree',
    name: 'Cây phân đoạn (Segment Tree)',
    tier: 'excellent',
    tierLabel: 'Xuất sắc',
    progress: 92,
  },
  {
    id: 'fenwick',
    name: 'Cây Fenwick (BIT)',
    tier: 'master',
    tierLabel: 'Thành thạo',
    progress: 86,
  },
  {
    id: 'dijkstra',
    name: 'Thuật toán Dijkstra & DSU',
    tier: 'progressing',
    tierLabel: 'Đang tiến bộ',
    progress: 76,
  },
  {
    id: 'dp-bitmask',
    name: 'Quy hoạch động Bitmask / Knapsack',
    tier: 'needs_reinforcement',
    tierLabel: 'Cần củng cố',
    progress: 54,
    subtitle: 'Khoảng cách tới chuẩn PLO: +26% • Ưu tiên luyện tập tuần này',
    isBottleneck: true,
  },
];

export const mockTrendPoints: MasteryTrendPoint[] = [
  { week: 'Tuần 1', score: 55, label: '55%' },
  { week: 'Tuần 4', score: 68, label: '68%' },
  { week: 'Tuần 8', score: 74, label: '74%' },
  { week: 'Tuần 12', score: 82.5, label: '82.5%' },
];

export const mockSocraticRecommendation: SocraticRecommendation = {
  topicTitle: 'Củng cố Quy hoạch động (DP)',
  subtitle: 'Next Best Actions',
  explanation:
    'AI phát hiện tỷ lệ nộp bài sai tại các bài toán Trạng thái Bitmask là 42%. Đề xuất 3 nhiệm vụ ngắn để bứt phá:',
  estimatedDays: 2,
  expectedBoost: 18,
  tasks: [
    {
      id: 'task-1',
      title: '3 Câu Quiz Bitmask Check',
      duration: '15p',
      type: 'quiz',
      description: 'Luyện nhận diện trạng thái màng nhị phân',
      actionText: 'Bắt đầu →',
    },
    {
      id: 'task-2',
      title: 'Video Bài toán Cái túi',
      duration: '10p',
      type: 'video',
      description: 'Minh họa tương tác bảng quy hoạch O(N*W)',
      actionText: 'Xem →',
    },
    {
      id: 'task-3',
      title: 'Gia sư AI Trợ giúp',
      duration: '24/7',
      type: 'chat',
      description: 'Phân tích công thức chuyển trạng thái và biến đổi bitwise (mask & ~(1 << i)).',
      actionText: 'Hỏi ngay →',
    },
  ],
};

export const mockQuickMetrics: QuickMetric[] = [
  {
    id: 'metric-skills',
    value: '38 / 45',
    label: 'Kỹ năng đã làm chủ',
    icon: 'military_tech',
    colorClass: 'text-secondary bg-secondary/10',
  },
  {
    id: 'metric-icpc',
    value: '142',
    label: 'Bài tập ICPC Accepted',
    icon: 'code',
    colorClass: 'text-secondary-container bg-secondary-container/10',
  },
  {
    id: 'metric-gaps',
    value: '3 Lỗ hổng',
    label: 'Cần củng cố trước Kỳ thi',
    icon: 'priority_high',
    colorClass: 'text-amber-600 bg-amber-500/10',
  },
  {
    id: 'metric-ranking',
    value: 'Top 8%',
    label: 'Xếp hạng Khoa CNTT',
    icon: 'verified',
    colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
  },
];

export const mockSkillTreeStages: SkillTreeStage[] = [
  {
    stageNumber: 1,
    stageCode: 'STAGE 01',
    title: 'Nền tảng Cấu trúc Tuyến tính & Đệ quy',
    nodes: [
      {
        id: 'node-array',
        key: 'arrayPtr',
        title: 'Mảng & Con trỏ C++',
        name: 'Mảng & Con trỏ C++',
        stage: 1,
        stageLabel: 'Stage 01',
        status: 'mastered',
        masteryPercentage: 100,
        scoreRatio: '20/20 câu đúng',
        complexityOrMetric: 'O(1)',
        desc: 'Quản lý bộ nhớ động con trỏ, thao tác mảng tĩnh và tối ưu cache locality trong C++.',
        labsRatio: '8/8 bài lab',
        prerequisites: [],
        nextUnlocks: [
          { name: 'Đệ quy & Quay lui', statusLabel: 'Đã mở khóa', isLocked: false },
          { name: 'Prefix Sum & Hash Map', statusLabel: 'Đã mở khóa', isLocked: false },
        ],
      },
      {
        id: 'node-recursion',
        key: 'recursion',
        title: 'Đệ quy & Quay lui',
        name: 'Đệ quy & Quay lui',
        stage: 1,
        stageLabel: 'Stage 01',
        status: 'mastered',
        masteryPercentage: 95,
        scoreRatio: '19/20 câu đúng',
        complexityOrMetric: 'O(2^N)',
        desc: 'Tư duy chia để trị, cây đệ quy và nhánh cận trong các bài toán tổ hợp, hoán vị.',
        labsRatio: '7/7 bài lab',
        prerequisites: [{ name: 'Mảng & Con trỏ C++', score: 100, isMet: true }],
        nextUnlocks: [
          { name: 'Cây nhị phân tìm kiếm (BST)', statusLabel: 'Đã mở khóa', isLocked: false },
        ],
      },
      {
        id: 'node-prefix',
        key: 'prefixSum',
        title: 'Prefix Sum & Hash Map',
        name: 'Prefix Sum & Hash Map',
        stage: 1,
        stageLabel: 'Stage 01',
        status: 'mastered',
        masteryPercentage: 98,
        scoreRatio: '25/25 câu đúng',
        complexityOrMetric: 'O(1) amortized',
        desc: 'Mảng cộng dồn 1D/2D, bảng băm unordered_map và kỹ thuật sliding window.',
        labsRatio: '6/6 bài lab',
        prerequisites: [{ name: 'Mảng & Con trỏ C++', score: 100, isMet: true }],
        nextUnlocks: [
          { name: 'Segment Tree', statusLabel: 'Đã mở khóa', isLocked: false },
        ],
      },
    ],
  },
  {
    stageNumber: 2,
    stageCode: 'STAGE 02',
    title: 'Cây Cân Bằng & Đồ Thị Cơ Bản',
    nodes: [
      {
        id: 'node-bst',
        key: 'bst',
        title: 'Cây nhị phân tìm kiếm (BST)',
        name: 'BST',
        stage: 2,
        stageLabel: 'Stage 02',
        status: 'mastered',
        masteryPercentage: 92,
        scoreRatio: '18/20 câu đúng',
        complexityOrMetric: 'O(log N)',
        desc: 'Cấu trúc cây nhị phân có thứ tự, các thao tác chèn, xóa, tìm kiếm giá trị cận trên/dưới.',
        labsRatio: '6/6 bài lab',
        prerequisites: [{ name: 'Đệ quy & Quay lui', score: 95, isMet: true }],
        nextUnlocks: [
          { name: 'Segment Tree', statusLabel: 'Đã mở khóa', isLocked: false },
        ],
      },
      {
        id: 'node-avl',
        key: 'avl',
        title: 'Cây cân bằng AVL & Treap',
        name: 'AVL & Treap',
        stage: 2,
        stageLabel: 'Stage 02',
        status: 'mastered',
        masteryPercentage: 88,
        scoreRatio: '15/17 câu đúng',
        complexityOrMetric: 'O(log N) strict',
        desc: 'Phép quay đơn/kép giữ cân bằng hệ số chiều cao cây AVL và Treap ngẫu nhiên.',
        labsRatio: '5/5 bài lab',
        prerequisites: [{ name: 'Cây nhị phân tìm kiếm (BST)', score: 92, isMet: true }],
        nextUnlocks: [
          { name: 'Segment Tree 2D', statusLabel: 'Khóa', isLocked: true },
        ],
      },
    ],
  },
  {
    stageNumber: 3,
    stageCode: 'STAGE 03',
    title: 'Truy vấn Khoảng Thời gian Thực (Range Query Engine)',
    isFocused: true,
    nodes: [
      {
        id: 'node-seg-tree',
        key: 'segTree',
        title: 'Cây Phân Đoạn (Segment Tree)',
        name: 'Segment Tree',
        stage: 3,
        stageLabel: 'Stage 03',
        status: 'mastered',
        masteryPercentage: 88,
        scoreRatio: '14/16 câu đúng (87.5%)',
        complexityOrMetric: 'O(log N)',
        desc: 'Cấu trúc dữ liệu dạng cây nhị phân cân bằng hỗ trợ truy vấn khoảng (Range Query như Sum, Min, Max, GCD) và cập nhật điểm/khoảng trong thời gian O(log N).',
        labsRatio: '5/6 bài lab ICPC',
        prerequisites: [
          { name: 'Cây nhị phân tìm kiếm (BST)', score: 95, isMet: true },
          { name: 'Mảng cộng dồn (Prefix Sum)', score: 100, isMet: true },
        ],
        nextUnlocks: [
          { name: 'Lazy Propagation', statusLabel: 'Đang học 68%', isLocked: false },
          { name: 'Persistent Segment Tree', statusLabel: 'Khóa (40%)', isLocked: true },
        ],
      },
      {
        id: 'node-lazy-prop',
        key: 'lazyProp',
        title: 'Kỹ thuật Lazy Propagation',
        name: 'Lazy Propagation',
        stage: 3,
        stageLabel: 'Stage 03',
        status: 'learning',
        masteryPercentage: 68,
        scoreRatio: '8/12 câu đúng (66.7%)',
        complexityOrMetric: 'Cần củng cố',
        desc: 'Phương pháp cập nhật trễ (lười) trên Segment Tree để tối ưu việc gán hoặc cộng thêm giá trị trên toàn bộ một đoạn [L, R] từ O(N) xuống O(log N).',
        labsRatio: '2/4 bài lab ICPC',
        prerequisites: [{ name: 'Cây Phân Đoạn (Segment Tree)', score: 88, isMet: true }],
        nextUnlocks: [
          { name: 'Persistent Segment Tree', statusLabel: 'Khóa (40%)', isLocked: true },
        ],
      },
      {
        id: 'node-fenwick',
        key: 'fenwick',
        title: 'Cây Chỉ Số Nhị Phân (Fenwick Tree / BIT)',
        name: 'Fenwick Tree',
        stage: 3,
        stageLabel: 'Stage 03',
        status: 'mastered',
        masteryPercentage: 86,
        scoreRatio: '12/14 câu đúng (85.7%)',
        complexityOrMetric: 'Tiêu chuẩn ICPC',
        desc: 'Cấu trúc dữ liệu cực kỳ gọn nhẹ bằng mảng một chiều dựa trên phép toán bit (x & -x) giúp tính tổng tiền tố và cập nhật đơn phần tử trong O(log N).',
        labsRatio: '4/4 bài lab ICPC',
        prerequisites: [{ name: 'Mảng cộng dồn (Prefix Sum)', score: 100, isMet: true }],
        nextUnlocks: [
          { name: 'Fenwick 2D', statusLabel: 'Đã mở khóa', isLocked: false },
        ],
      },
    ],
  },
  {
    stageNumber: 4,
    stageCode: 'STAGE 04',
    title: 'Cấu Trúc Dữ Liệu Bền Vững & Đa Chiều',
    nodes: [
      {
        id: 'node-persistent',
        key: 'persistentSegTree',
        title: 'Persistent Segment Tree',
        name: 'Persistent Segment Tree',
        stage: 4,
        stageLabel: 'Stage 04',
        status: 'locked',
        masteryPercentage: 40,
        scoreRatio: '2/6 câu đúng',
        complexityOrMetric: 'Khóa • Tiên quyết: Lazy Prop ≥ 80%',
        desc: 'Cây phân đoạn bất biến lưu giữ toàn bộ lịch sử các phiên bản chỉnh sửa qua từng phép cập nhật.',
        labsRatio: '0/2 bài lab',
        prerequisites: [{ name: 'Lazy Propagation', score: 68, isMet: false }],
        nextUnlocks: [],
      },
      {
        id: 'node-segtree-2d',
        key: 'segTree2D',
        title: 'Segment Tree 2D & Treap K-D',
        name: 'Segment Tree 2D',
        stage: 4,
        stageLabel: 'Stage 04',
        status: 'locked',
        masteryPercentage: 0,
        scoreRatio: '0/8 câu đúng',
        complexityOrMetric: 'Khóa • Tiên quyết: Segment Tree & BST',
        desc: 'Truy vấn hình chữ nhật 2 chiều và cấu trúc cây phân đoạn lồng nhau.',
        labsRatio: '0/4 bài lab',
        prerequisites: [
          { name: 'Segment Tree', score: 88, isMet: true },
          { name: 'Cây cân bằng AVL & Treap', score: 88, isMet: true },
        ],
        nextUnlocks: [],
      },
    ],
  },
];

export const mockClassHeatmap: ClassHeatmapData = {
  classCode: 'CS301.K21',
  totalStudents: 42,
  students: [
    {
      id: 'sv-1',
      studentCode: '21020491',
      name: 'Trần Nhật Minh',
      avatarText: 'NM',
      isCurrentUser: true,
      scores: {
        algo: 88,
        segTree: 92,
        fenwick: 86,
        dijkstra: 76,
        dpBitmask: 54,
        advGraph: 74,
      },
      overallPlo: 82.5,
    },
    {
      id: 'sv-2',
      studentCode: '21020412',
      name: 'Lê Hoàng Bảo',
      avatarText: 'HB',
      isCurrentUser: false,
      scores: {
        algo: 94,
        segTree: 96,
        fenwick: 90,
        dijkstra: 88,
        dpBitmask: 82,
        advGraph: 91,
      },
      overallPlo: 90.2,
    },
    {
      id: 'sv-3',
      studentCode: '21020588',
      name: 'Nguyễn Anh Tuấn',
      avatarText: 'AT',
      isCurrentUser: false,
      scores: {
        algo: 58,
        segTree: 52,
        fenwick: 48,
        dijkstra: 70,
        dpBitmask: 45,
        advGraph: 55,
      },
      overallPlo: 54.6,
    },
    {
      id: 'sv-4',
      studentCode: '21020476',
      name: 'Đỗ Khánh Linh',
      avatarText: 'KL',
      isCurrentUser: false,
      scores: {
        algo: 78,
        segTree: 84,
        fenwick: 82,
        dijkstra: 89,
        dpBitmask: 71,
        advGraph: 80,
      },
      overallPlo: 80.6,
    },
  ],
  classAverages: {
    algo: 72.0,
    segTree: 70.4,
    fenwick: 69.8,
    dijkstra: 76.2,
    dpBitmask: 58.3,
    advGraph: 74.1,
    overallPlo: 71.5,
  },
};

export const mockFocusGoals: FocusGoal[] = [
  {
    id: 'goal-dp',
    index: 0,
    title: 'Quy hoạch động (Dynamic Programming)',
    category: 'Trụ cột: Thuật toán & Cấu trúc dữ liệu',
    ploCode: 'PLO-04',
    subtag: 'Knapsack & Bitmask',
    currentScore: 45,
    targetScore: 60,
    scoreGap: 15,
    statusText: '45% • Khẩn cấp',
    urgency: 'urgent',
    bottleneckReason:
      'Bạn gặp khó khăn khi xác định Công thức truy hồi (State Transition) và khởi tạo mảng dp[i][w].',
    actionNotice: 'Hoàn thành 2 vi hành động bên dưới để nâng độ thuần thục lên 60%.',
    milestoneUnlock: 'Bài tập ICPC QHD 2 chiều (60%)',
  },
  {
    id: 'goal-bst',
    index: 1,
    title: 'Cây nhị phân (BST)',
    category: 'Trụ cột: Cấu trúc dữ liệu nâng cao',
    ploCode: 'PLO-02',
    subtag: 'Thao tác cân bằng cây',
    currentScore: 60,
    targetScore: 75,
    scoreGap: 15,
    statusText: '60% • Trung bình',
    urgency: 'medium',
    bottleneckReason: 'Cần củng cố phép xoay trái/phải và tính toán hệ số cân bằng AVL.',
    actionNotice: 'Làm 4 câu kiểm tra trắc nghiệm nhanh để nâng mức thành thạo.',
    milestoneUnlock: 'Tree Rotations & Treap lab (75%)',
  },
  {
    id: 'goal-dijkstra',
    index: 2,
    title: 'Dijkstra & Đồ thị',
    category: 'Trụ cột: Đồ thị & Đường đi ngắn nhất',
    ploCode: 'PLO-05',
    subtag: 'Hàng đợi ưu tiên Priority Queue',
    currentScore: 55,
    targetScore: 70,
    scoreGap: 15,
    statusText: '55% • Trung bình',
    urgency: 'medium',
    bottleneckReason: 'Xử lý chu trình âm và tối ưu hóa relaxation với heap.',
    actionNotice: 'Xem video tóm tắt thuật toán và phân tích O((V+E)log V).',
    milestoneUnlock: 'Đường đi ngắn nhất trên đồ thị lưới (70%)',
  },
  {
    id: 'goal-quicksort',
    index: 3,
    title: 'Quick Sort & Chèn',
    category: 'Trụ cột: Thuật toán sắp xếp cơ bản',
    ploCode: 'PLO-01',
    subtag: 'Phân đoạn Lomuto & Hoare',
    currentScore: 85,
    targetScore: 90,
    scoreGap: 5,
    statusText: '85% • Đã ôn',
    urgency: 'reviewed',
    bottleneckReason: 'Đã đạt chuẩn cao, chỉ cần duy trì phản xạ giải đề thi.',
    actionNotice: 'Ôn tập nhẹ nhàng trước giờ làm bài thi thử.',
    milestoneUnlock: 'Thành thạo ICPC Sắp xếp (85%+)',
  },
];

export const mockTheoryKnapsack: TheoryCardData = {
  title: 'Thẻ Flashcard Cốt Lõi: Knapsack 0/1',
  subTitle: '3 phút nắm gọn bản chất thuật toán',
  stateDefinition: {
    term: 'dp[i][w]',
    desc: 'Là giá trị lớn nhất có thể thu được khi chỉ xét từ đồ vật 1 đến đồ vật thứ i với sức chứa tối đa của balo là w.',
  },
  recurrenceFormula: {
    code: `if (weight[i] > w)
  dp[i][w] = dp[i-1][w]; // Không thể chọn vật i
else
  dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - weight[i]]);`,
    explanationPoints: [
      'Không chọn vật i: Lấy lại kết quả tối ưu của i - 1 đồ vật trước đó.',
      'Chọn vật i: Nhận thêm giá trị val[i] và tiêu tốn trọng lượng weight[i], tra cứu phần còn lại ở i - 1 đồ vật trước.',
    ],
  },
};

export const mockDiagnosticQuiz: DiagnosticQuizData = {
  id: 'quiz-knapsack-01',
  questionNumber: 1,
  totalQuestions: 3,
  title: 'Kiểm tra vi mô Quy hoạch động',
  questionText:
    'Trong bài toán Knapsack 0/1 (mỗi đồ vật chỉ được chọn tối đa 1 lần), tại sao khi tối ưu không gian sang mảng 1 chiều dp[w], vòng lặp khối lượng w lại bắt buộc phải duyệt từ W giảm dần về weight[i]?',
  options: [
    {
      key: 'A',
      text: 'Để thuật toán chạy nhanh hơn O(W log W).',
      isCorrect: false,
    },
    {
      key: 'B',
      text: 'Để tránh việc một đồ vật bị cộng dồn và chọn nhiều lần trong cùng 1 bước lặp.',
      isCorrect: true,
    },
    {
      key: 'C',
      text: 'Vì mảng C++ bắt buộc phải giải phóng bộ nhớ từ đuôi về đầu.',
      isCorrect: false,
    },
  ],
  correctExplanation:
    'Chính xác! 🎉 Duyệt ngược W -> weight[i] đảm bảo trạng thái dp[w - weight[i]] tại bước hiện tại chưa bị cập nhật bởi đồ vật thứ i, giữ vững tính chất mỗi vật chọn tối đa 1 lần của Knapsack 0/1.',
  wrongExplanation:
    'Chưa chính xác! 💡 Đừng lo, Gia sư AI ở góc phải đã tự động kích hoạt gợi ý chi tiết để giúp bạn hiểu rõ lý do.',
  socraticHint:
    'Gia sư AI nhận thấy bạn vừa chọn đáp án chưa tối ưu ở phần duyệt mảng DP 1 chiều. Hãy nhớ rằng: Nếu duyệt từ nhỏ đến lớn (xuôi), giá trị mới được tính sẽ đè lên giá trị cũ và vật đó sẽ bị chọn lặp lại vô hạn lần (Balo vô hạn)!',
};

// Services
export async function getCompetencyRadar(): Promise<CompetencyRadarData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 80));
  return mockCompetencyRadar;
}

export async function getSkillTreeStages(): Promise<SkillTreeStage[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return mockSkillTreeStages;
}

export async function getClassHeatmap(): Promise<ClassHeatmapData> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return mockClassHeatmap;
}

export async function getFocusGoals(): Promise<FocusGoal[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return mockFocusGoals;
}
