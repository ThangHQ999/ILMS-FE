export interface BankQuestion {
  id: string;
  code: string;
  chapter: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'CALCULATION' | 'ESSAY';
  typeLabel: string;
  bloomLevel: 'BLOOM_1' | 'BLOOM_2' | 'BLOOM_3' | 'BLOOM_4';
  bloomLabel: string;
  bloomColor: string;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  difficultyLabel: string;
  content: string;
  options?: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  solutionNote?: string;
  explanation: string;
  tags: string[];
  plo: string;
  discriminationIndex: number;
  correctRate: number; // Percentage
  lastExamDate?: string;
  subjectKey?: string;
}

export const GIAI_TICH_2_BANK: BankQuestion[] = [
  {
    id: 'bank-gt2-01',
    code: '#CALC-001',
    chapter: 'Chương 1: Chuỗi số & Chuỗi hàm',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (1 Đáp án)',
    bloomLevel: 'BLOOM_1',
    bloomLabel: 'Nhận biết (Bloom 1)',
    bloomColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    difficultyLevel: 'EASY',
    difficultyLabel: 'Dễ (P > 0.7)',
    content: 'Điều kiện cần để chuỗi số dương $\\sum_{n=1}^{\\infty} a_n$ hội tụ là gì?',
    options: [
      { id: 'opt-gt2-1-a', label: 'A', text: '\\lim_{n \\to \\infty} a_n = 0', isCorrect: true },
      { id: 'opt-gt2-1-b', label: 'B', text: '\\lim_{n \\to \\infty} a_n = 1', isCorrect: false },
      { id: 'opt-gt2-1-c', label: 'C', text: '\\lim_{n \\to \\infty} \\frac{a_{n+1}}{a_n} > 1', isCorrect: false },
      { id: 'opt-gt2-1-d', label: 'D', text: 'a_n \\ge 1 \\text{ với mọi } n', isCorrect: false },
    ],
    explanation:
      'Theo định lý cơ bản về điều kiện cần của chuỗi số: Nếu chuỗi số hội tụ thì số hạng tổng quát a_n phải tiến dần về 0 khi n tiến ra vô cùng.',
    tags: ['#ChuoiSo', '#HoiTu', '#DinhLyCoBan'],
    plo: 'PLO-01',
    discriminationIndex: 0.35,
    correctRate: 85,
    lastExamDate: '10/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-02',
    code: '#CALC-002',
    chapter: 'Chương 1: Chuỗi số & Chuỗi hàm',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content: 'Bán kính hội tụ $R$ của chuỗi lũy thừa $\\sum_{n=1}^{\\infty} \\frac{x^n}{n \\cdot 3^n}$ bằng bao nhiêu?',
    options: [
      { id: 'opt-gt2-2-a', label: 'A', text: 'R = 3', isCorrect: true },
      { id: 'opt-gt2-2-b', label: 'B', text: 'R = 1/3', isCorrect: false },
      { id: 'opt-gt2-2-c', label: 'C', text: 'R = 1', isCorrect: false },
      { id: 'opt-gt2-2-d', label: 'D', text: 'R = +\\infty', isCorrect: false },
    ],
    explanation:
      'Áp dụng công thức D’Alembert hoặc Cauchy-Hadamard: R = 1 / \\lim_{n\\to\\infty} \\sqrt[n]{1/(n \\cdot 3^n)} = 3.',
    tags: ['#ChuoiLuyThua', '#BanKinhHoiTu'],
    plo: 'PLO-01',
    discriminationIndex: 0.42,
    correctRate: 72,
    lastExamDate: '11/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-03',
    code: '#CALC-003',
    chapter: 'Chương 2: Phép tính vi phân hàm nhiều biến',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content: 'Cho hàm số hai biến $z = f(x, y) = x^3 - 3xy + y^3$. Các điểm dừng của hàm số là:',
    options: [
      { id: 'opt-gt2-3-a', label: 'A', text: '(0, 0) và (1, 1)', isCorrect: true },
      { id: 'opt-gt2-3-b', label: 'B', text: '(0, 0) và (-1, -1)', isCorrect: false },
      { id: 'opt-gt2-3-c', label: 'C', text: '(1, 1) và (-1, 1)', isCorrect: false },
      { id: 'opt-gt2-3-d', label: 'D', text: 'Chỉ có duy nhất điểm (0, 0)', isCorrect: false },
    ],
    explanation:
      'Giải hệ đạo hàm riêng: z\'_x = 3x^2 - 3y = 0 và z\'_y = -3x + 3y^2 = 0 <=> y = x^2 và x^4 - x = 0. Nghiệm thực là (0, 0) và (1, 1).',
    tags: ['#DaoHamRieng', '#DiemDung', '#CucTri'],
    plo: 'PLO-02',
    discriminationIndex: 0.38,
    correctRate: 68,
    lastExamDate: '10/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-04',
    code: '#CALC-004',
    chapter: 'Chương 2: Phép tính vi phân hàm nhiều biến',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Cực trị có điều kiện)',
    bloomLevel: 'BLOOM_4',
    bloomLabel: 'Vận dụng cao (Bloom 4)',
    bloomColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content: 'Tìm giá trị lớn nhất của hàm số $z = x^2 + 2y^2$ trên đường tròn ràng buộc $x^2 + y^2 = 1$.',
    options: [
      { id: 'opt-gt2-4-a', label: 'A', text: 'Max = 2 tại điểm (0, ±1)', isCorrect: true },
      { id: 'opt-gt2-4-b', label: 'B', text: 'Max = 1 tại điểm (±1, 0)', isCorrect: false },
      { id: 'opt-gt2-4-c', label: 'C', text: 'Max = 3 tại điểm (1, 1)', isCorrect: false },
      { id: 'opt-gt2-4-d', label: 'D', text: 'Max = \\sqrt{2}', isCorrect: false },
    ],
    explanation:
      'Thay x^2 = 1 - y^2 vào hàm số: z = (1 - y^2) + 2y^2 = 1 + y^2 với 0 <= y^2 <= 1. Khi y^2 = 1 (tại y = ±1, x = 0), z_max = 1 + 1 = 2.',
    tags: ['#Lagrange', '#GiaTriLonNhat', '#CucTriRangBuoc'],
    plo: 'PLO-02',
    discriminationIndex: 0.48,
    correctRate: 38,
    lastExamDate: '11/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-05',
    code: '#CALC-005',
    chapter: 'Chương 3: Tích phân bội (Tích phân kép & Bội ba)',
    type: 'CALCULATION',
    typeLabel: 'Bài toán tính toán (Calculation)',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content: 'Tính tích phân kép $I = \\iint_D (2x + y) \\, dxdy$ với miền $D$ là hình chữ nhật $0 \\le x \\le 2$ và $0 \\le y \\le 1$.',
    options: [
      { id: 'opt-gt2-5-a', label: 'A', text: 'I = 5', isCorrect: true },
      { id: 'opt-gt2-5-b', label: 'B', text: 'I = 3', isCorrect: false },
      { id: 'opt-gt2-5-c', label: 'C', text: 'I = 4', isCorrect: false },
      { id: 'opt-gt2-5-d', label: 'D', text: 'I = 6', isCorrect: false },
    ],
    solutionNote: 'Đáp án chuẩn: I = 5',
    explanation:
      'Áp dụng công thức Fubini: I = \\int_0^2 dx \\int_0^1 (2x + y) dy = \\int_0^2 [2xy + y^2/2]_0^1 dx = \\int_0^2 (2x + 1/2) dx = [x^2 + x/2]_0^2 = 4 + 1 = 5.',
    tags: ['#TichPhanKep', '#Fubini', '#HinhChuNhat'],
    plo: 'PLO-02',
    discriminationIndex: 0.44,
    correctRate: 62,
    lastExamDate: '11/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-06',
    code: '#CALC-006',
    chapter: 'Chương 3: Tích phân bội (Tích phân kép & Bội ba)',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content: 'Chuyển tích phân kép $I = \\iint_D f(x, y) \\, dxdy$ sang tọa độ cực với miền $D$ là hình tròn $x^2 + y^2 \\le 4$ nằm trong góc phần tư thứ nhất ($x \\ge 0, y \\ge 0$).',
    options: [
      { id: 'opt-gt2-6-a', label: 'A', text: 'I = \\int_0^{\\pi/2} d\\varphi \\int_0^2 f(r\\cos\\varphi, r\\sin\\varphi) \\, r \\, dr', isCorrect: true },
      { id: 'opt-gt2-6-b', label: 'B', text: 'I = \\int_0^{\\pi} d\\varphi \\int_0^4 f(r\\cos\\varphi, r\\sin\\varphi) \\, dr', isCorrect: false },
      { id: 'opt-gt2-6-c', label: 'C', text: 'I = \\int_0^{2\\pi} d\\varphi \\int_0^2 f(r, \\varphi) \\, r^2 \\, dr', isCorrect: false },
      { id: 'opt-gt2-6-d', label: 'D', text: 'I = \\int_0^{\\pi/2} d\\varphi \\int_0^2 f(r\\cos\\varphi, r\\sin\\varphi) \\, dr', isCorrect: false },
    ],
    explanation:
      'Góc phần tư I tương ứng 0 <= \\varphi <= \\pi/2, bán kính 0 <= r <= 2. Định thức Jacobi của phép đổi biến tọa độ cực là J = r nên vi phân diện tích dxdy = r dr d\\varphi.',
    tags: ['#ToaDoCuc', '#Jacobi', '#TichPhanBoi'],
    plo: 'PLO-01',
    discriminationIndex: 0.46,
    correctRate: 45,
    lastExamDate: '10/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-07',
    code: '#CALC-007',
    chapter: 'Chương 4: Tích phân đường & Tích phân mặt',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Công thức Green)',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content: 'Tính tích phân đường loại 2 $I = \\oint_C (x \\, dy - y \\, dx)$ trong đó $C$ là đường tròn $x^2 + y^2 = R^2$ định hướng ngược chiều kim đồng hồ.',
    options: [
      { id: 'opt-gt2-7-a', label: 'A', text: 'I = 2\\pi R^2', isCorrect: true },
      { id: 'opt-gt2-7-b', label: 'B', text: 'I = \\pi R^2', isCorrect: false },
      { id: 'opt-gt2-7-c', label: 'C', text: 'I = 0', isCorrect: false },
      { id: 'opt-gt2-7-d', label: 'D', text: 'I = 4\\pi R^2', isCorrect: false },
    ],
    explanation:
      'Áp dụng công thức Green: I = \\iint_D (Q\'_x - P\'_y) dxdy = \\iint_D (1 - (-1)) dxdy = 2 \\iint_D dxdy = 2 * (\\pi R^2) = 2\\pi R^2.',
    tags: ['#TichPhanDuong', '#CongThucGreen', '#KhepKin'],
    plo: 'PLO-01',
    discriminationIndex: 0.41,
    correctRate: 60,
    lastExamDate: '11/2024',
    subjectKey: 'giaiTich2',
  },
  {
    id: 'bank-gt2-08',
    code: '#CALC-008',
    chapter: 'Chương 5: Phương trình vi phân cấp 1 & cấp 2',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (PTVP cấp 2)',
    bloomLevel: 'BLOOM_4',
    bloomLabel: 'Vận dụng cao (Bloom 4)',
    bloomColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content: 'Nghiệm tổng quát của phương trình vi phân tuyến tính cấp 2 thuần nhất hệ số hằng $y\'\' - 4y\' + 4y = 0$ là gì?',
    options: [
      { id: 'opt-gt2-8-a', label: 'A', text: 'y = (C_1 + C_2 x) e^{2x}', isCorrect: true },
      { id: 'opt-gt2-8-b', label: 'B', text: 'y = C_1 e^{2x} + C_2 e^{-2x}', isCorrect: false },
      { id: 'opt-gt2-8-c', label: 'C', text: 'y = C_1 \\cos(2x) + C_2 \\sin(2x)', isCorrect: false },
      { id: 'opt-gt2-8-d', label: 'D', text: 'y = C_1 e^{4x} + C_2', isCorrect: false },
    ],
    explanation:
      'Phương trình đặc trưng k^2 - 4k + 4 = 0 có nghiệm kép k_1 = k_2 = 2. Nghiệm tổng quát của phương trình vi phân có dạng y = (C_1 + C_2 x) e^{2x}.',
    tags: ['#PhuongTrinhViPhan', '#NghiemKep', '#Cap2HeSoHang'],
    plo: 'PLO-02',
    discriminationIndex: 0.52,
    correctRate: 35,
    lastExamDate: '12/2024',
    subjectKey: 'giaiTich2',
  },
];

export const MANG_MAY_TINH_BANK: BankQuestion[] = [
  {
    id: 'bank-net-01',
    code: '#NET-042',
    chapter: 'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (1 Đáp án)',
    bloomLevel: 'BLOOM_4',
    bloomLabel: 'Vận dụng cao (Bloom 4)',
    bloomColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content:
      'Trong cấu trúc định tuyến phân cấp OSPF, giả sử Router ABR kết nối giữa Backbone Area 0 và Totally Stubby Area 1. Khi một mạng con thuộc Area 2 bị mất kết nối (down link), router ABR nói trên sẽ xử lý các LSA như thế nào để cập nhật trạng thái liên kết vào Area 1?',
    options: [
      { id: 'opt-net-1-a', label: 'A', text: 'Truyền LSA Type 3 chi tiết mô tả mạng đích bị mất tới tất cả router trong Area 1.', isCorrect: false },
      { id: 'opt-net-1-b', label: 'B', text: 'Không truyền bất kỳ LSA Type 3 cụ thể nào, chỉ duy trì Default Route (0.0.0.0/0) duy nhất.', isCorrect: true },
      { id: 'opt-net-1-c', label: 'C', text: 'Khởi tạo LSA Type 5 External quảng bá ngập lụt (flood) trong toàn bộ Autonomous System.', isCorrect: false },
      { id: 'opt-net-1-d', label: 'D', text: 'Chuyển Area 1 thành NSSA và chuyển đổi LSA Type 7 sang Type 5.', isCorrect: false },
    ],
    explanation:
      'Totally Stubby Area chặn cả External LSA (Type 4, 5) lẫn Inter-area Summary LSA (Type 3). ABR chỉ chèn một Default Route duy nhất (LSA Type 3 cho 0.0.0.0/0) vào Area 1.',
    tags: ['#OSPF', '#ABR', '#LSDB', '#TotallyStubby'],
    plo: 'PLO-03',
    discriminationIndex: 0.42,
    correctRate: 64,
    lastExamDate: '12/2023',
    subjectKey: 'mangMayTinh',
  },
  {
    id: 'bank-net-02',
    code: '#NET-043',
    chapter: 'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Thuật toán tìm đường ngắn nhất Dijkstra (Shortest Path First - SPF) được sử dụng trong giao thức OSPF có độ phức tạp thời gian khi được cài đặt tối ưu bằng cấu trúc dữ liệu Binary Min-Heap là bao nhiêu? (Với V là số đỉnh Router và E là số liên kết mạng).',
    options: [
      { id: 'opt-net-2-a', label: 'A', text: 'O(V²)', isCorrect: false },
      { id: 'opt-net-2-b', label: 'B', text: 'O((V + E) log V)', isCorrect: true },
      { id: 'opt-net-2-c', label: 'C', text: 'O(V * E)', isCorrect: false },
      { id: 'opt-net-2-d', label: 'D', text: 'O(E²)', isCorrect: false },
    ],
    explanation:
      'Dijkstra dùng Binary Min-Heap có độ phức tạp O((V + E) log V). Mỗi thao tác Extract-Min tốn O(log V) và mỗi thao tác Decrease-Key tốn O(log V) cho tối đa E cạnh.',
    tags: ['#Dijkstra', '#Routing', '#SPF'],
    plo: 'PLO-01',
    discriminationIndex: 0.28,
    correctRate: 78,
    lastExamDate: '10/2023',
    subjectKey: 'mangMayTinh',
  },
  {
    id: 'bank-net-03',
    code: '#NET-044',
    chapter: 'Chương 3: Tầng Giao vận & Cơ chế bắt tay TCP/UDP',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Bắt tay 3 bước)',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Trong quá trình thiết lập kết nối TCP (3-way Handshake), bên Client gửi gói tin SYN với Sequence Number = 1000. Phía Server phản hồi gói tin SYN-ACK với Sequence Number = 5000. Giá trị của trường Acknowledgment Number trong gói tin SYN-ACK từ Server là bao nhiêu?',
    options: [
      { id: 'opt-net-3-a', label: 'A', text: 'Ack = 1001', isCorrect: true },
      { id: 'opt-net-3-b', label: 'B', text: 'Ack = 1000', isCorrect: false },
      { id: 'opt-net-3-c', label: 'C', text: 'Ack = 5001', isCorrect: false },
      { id: 'opt-net-3-d', label: 'D', text: 'Ack = 0', isCorrect: false },
    ],
    explanation:
      'Gói tin SYN tiêu thụ 1 số thứ tự tuần tự (phantom byte). Do đó, Server phản hồi Acknowledgment Number = Sequence Number nhận được + 1 = 1000 + 1 = 1001.',
    tags: ['#TCP', '#Handshake', '#SeqAck'],
    plo: 'PLO-03',
    discriminationIndex: 0.36,
    correctRate: 74,
    lastExamDate: '11/2023',
    subjectKey: 'mangMayTinh',
  },
  {
    id: 'bank-net-04',
    code: '#NET-045',
    chapter: 'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến',
    type: 'CALCULATION',
    typeLabel: 'Tính toán phân chia Subnet',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Một mạng doanh nghiệp được cấp dải IP 192.168.10.0/24. Cần chia mạng này thành 4 mạng con (subnets) đều nhau. Subnet mask mới ở dạng thập phân chấm là gì và mỗi subnet có bao nhiêu địa chỉ IP khả dụng gán cho host?',
    options: [
      { id: 'opt-net-4-a', label: 'A', text: '255.255.255.192 (/26) và 62 hosts khả dụng', isCorrect: true },
      { id: 'opt-net-4-b', label: 'B', text: '255.255.255.224 (/27) và 30 hosts khả dụng', isCorrect: false },
      { id: 'opt-net-4-c', label: 'C', text: '255.255.255.128 (/25) và 126 hosts khả dụng', isCorrect: false },
      { id: 'opt-net-4-d', label: 'D', text: '255.255.255.240 (/28) và 14 hosts khả dụng', isCorrect: false },
    ],
    explanation:
      'Để tạo 4 subnets cần mượn 2 bits (2^2 = 4). Prefix mới là 24 + 2 = 26 bits -> Subnet mask là 255.255.255.192. Còn lại 6 bits cho host: 2^6 - 2 = 62 địa chỉ khả dụng.',
    tags: ['#Subnetting', '#CIDR', '#IPv4'],
    plo: 'PLO-05',
    discriminationIndex: 0.45,
    correctRate: 66,
    lastExamDate: '11/2023',
    subjectKey: 'mangMayTinh',
  },
];

export const CAU_TRUC_DU_LIEU_BANK: BankQuestion[] = [
  {
    id: 'bank-dsa-01',
    code: '#DSA-001',
    chapter: 'Chương 1: Độ phức tạp thuật toán (Big-O) & Đệ quy',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Độ phức tạp thời gian của hàm đệ quy $T(n) = 2T(n/2) + O(n)$ theo Định lý Thợ (Master Theorem) là bao nhiêu?',
    options: [
      { id: 'opt-dsa-1-a', label: 'A', text: 'O(n \\log n)', isCorrect: true },
      { id: 'opt-dsa-1-b', label: 'B', text: 'O(n)', isCorrect: false },
      { id: 'opt-dsa-1-c', label: 'C', text: 'O(n^2)', isCorrect: false },
      { id: 'opt-dsa-1-d', label: 'D', text: 'O(\\log n)', isCorrect: false },
    ],
    explanation:
      'Áp dụng Master Theorem: a = 2, b = 2, c = 1. Vì log_b(a) = log_2(2) = 1 = c (Trường hợp 2), suy ra T(n) = O(n^c * log n) = O(n log n). Đây chính là độ phức tạp của Merge Sort.',
    tags: ['#MasterTheorem', '#BigO', '#DeQuy'],
    plo: 'PLO-02',
    discriminationIndex: 0.35,
    correctRate: 80,
    lastExamDate: '09/2024',
    subjectKey: 'cauTrucDuLieu',
  },
  {
    id: 'bank-dsa-02',
    code: '#DSA-002',
    chapter: 'Chương 3: Cây nhị phân & Cây tìm kiếm nhị phân (BST)',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Cây AVL)',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content:
      'Trong cây cân bằng AVL, khi xảy ra hiện tượng mất cân bằng dạng Left-Right (LR: nhánh trái của nút con bên trái bị lệch sang phải), ta cần thực hiện phép quay nào để tái cân bằng cây?',
    options: [
      { id: 'opt-dsa-2-a', label: 'A', text: 'Quay trái nút con trái, sau đó quay phải nút gốc mất cân bằng', isCorrect: true },
      { id: 'opt-dsa-2-b', label: 'B', text: 'Chỉ quay đơn sang phải nút gốc mất cân bằng', isCorrect: false },
      { id: 'opt-dsa-2-c', label: 'C', text: 'Quay phải nút con phải, sau đó quay trái nút gốc mất cân bằng', isCorrect: false },
      { id: 'opt-dsa-2-d', label: 'D', text: 'Chỉ quay đơn sang trái nút con', isCorrect: false },
    ],
    explanation:
      'Mất cân bằng LR đòi hỏi phép quay kép (Double Rotation): Quay trái (Left rotation) tại nút con bên trái để chuyển về dạng LL, sau đó quay phải (Right rotation) tại nút gốc mất cân bằng.',
    tags: ['#CayAVL', '#QuayKep', '#CanBangCay'],
    plo: 'PLO-02',
    discriminationIndex: 0.45,
    correctRate: 52,
    lastExamDate: '10/2024',
    subjectKey: 'cauTrucDuLieu',
  },
  {
    id: 'bank-dsa-03',
    code: '#DSA-003',
    chapter: 'Chương 5: Thuật toán sắp xếp & Tìm kiếm',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Thuật toán sắp xếp nào sau đây luôn đảm bảo thời gian chạy $O(n \\log n)$ trong mọi trường hợp (xấu nhất, trung bình, tốt nhất) và sắp xếp tại chỗ (In-place, không cần bộ nhớ phụ $O(n)$)?',
    options: [
      { id: 'opt-dsa-3-a', label: 'A', text: 'Heap Sort', isCorrect: true },
      { id: 'opt-dsa-3-b', label: 'B', text: 'Merge Sort', isCorrect: false },
      { id: 'opt-dsa-3-c', label: 'C', text: 'Quick Sort', isCorrect: false },
      { id: 'opt-dsa-3-d', label: 'D', text: 'Bubble Sort', isCorrect: false },
    ],
    explanation:
      'Heap Sort có độ phức tạp O(n log n) trong mọi trường hợp và chạy tại chỗ với O(1) auxiliary space. Merge Sort cần O(n) bộ nhớ phụ, Quick Sort worst-case là O(n^2).',
    tags: ['#HeapSort', '#SapXep', '#InPlace'],
    plo: 'PLO-03',
    discriminationIndex: 0.38,
    correctRate: 70,
    lastExamDate: '11/2024',
    subjectKey: 'cauTrucDuLieu',
  },
];

export const CO_SO_DU_LIEU_BANK: BankQuestion[] = [
  {
    id: 'bank-db-01',
    code: '#DB-001',
    chapter: 'Chương 4: Lý thuyết dạng chuẩn (1NF, 2NF, 3NF, BCNF)',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Chuẩn hóa CSDL)',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Một lược đồ quan hệ đạt Dạng chuẩn 3 (3NF) khi và chỉ khi nó đạt 2NF và thỏa mãn điều kiện nào sau đây?',
    options: [
      { id: 'opt-db-1-a', label: 'A', text: 'Không tồn tại phụ thuộc bắc cầu của thuộc tính không khóa vào khóa chính', isCorrect: true },
      { id: 'opt-db-1-b', label: 'B', text: 'Mọi định thức đều phải là siêu khóa (Superkey)', isCorrect: false },
      { id: 'opt-db-1-c', label: 'C', text: 'Mọi thuộc tính đều là đa trị', isCorrect: false },
      { id: 'opt-db-1-d', label: 'D', text: 'Không có khóa ngoại nào tham chiếu đến bảng khác', isCorrect: false },
    ],
    explanation:
      '3NF yêu cầu quan hệ đã ở 2NF và không có thuộc tính không khóa nào phụ thuộc bắc cầu vào khóa chính. Điều kiện "Mọi định thức đều là siêu khóa" là của BCNF.',
    tags: ['#3NF', '#PhuThuocBacCau', '#ChuanHoa'],
    plo: 'PLO-02',
    discriminationIndex: 0.40,
    correctRate: 75,
    lastExamDate: '10/2024',
    subjectKey: 'coSoDuLieu',
  },
  {
    id: 'bank-db-02',
    code: '#DB-002',
    chapter: 'Chương 3: Ngôn ngữ SQL & Tối ưu hóa truy vấn',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (SQL)',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Trong câu lệnh truy vấn SQL, mệnh đề nào được sử dụng để lọc các nhóm bản ghi sau khi đã thực hiện phép gom nhóm GROUP BY?',
    options: [
      { id: 'opt-db-2-a', label: 'A', text: 'HAVING', isCorrect: true },
      { id: 'opt-db-2-b', label: 'B', text: 'WHERE', isCorrect: false },
      { id: 'opt-db-2-c', label: 'C', text: 'ORDER BY', isCorrect: false },
      { id: 'opt-db-2-d', label: 'D', text: 'QUALIFY', isCorrect: false },
    ],
    explanation:
      'WHERE dùng để lọc từng dòng trước khi gom nhóm; còn HAVING dùng để lọc các nhóm bản ghi sau khi GROUP BY.',
    tags: ['#SQL', '#HAVING', '#GROUPBY'],
    plo: 'PLO-04',
    discriminationIndex: 0.32,
    correctRate: 82,
    lastExamDate: '11/2024',
    subjectKey: 'coSoDuLieu',
  },
  {
    id: 'bank-db-03',
    code: '#DB-003',
    chapter: 'Chương 5: Giao dịch & Kiểm soát tương thời (ACID)',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (ACID)',
    bloomLevel: 'BLOOM_4',
    bloomLabel: 'Vận dụng cao (Bloom 4)',
    bloomColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content:
      'Hiện tượng Dirty Read (Giao dịch T2 đọc phải dữ liệu chưa được Commit của giao dịch T1, sau đó T1 Rollback) xảy ra ở mức cô lập (Transaction Isolation Level) nào?',
    options: [
      { id: 'opt-db-3-a', label: 'A', text: 'READ UNCOMMITTED', isCorrect: true },
      { id: 'opt-db-3-b', label: 'B', text: 'READ COMMITTED', isCorrect: false },
      { id: 'opt-db-3-c', label: 'C', text: 'REPEATABLE READ', isCorrect: false },
      { id: 'opt-db-3-d', label: 'D', text: 'SERIALIZABLE', isCorrect: false },
    ],
    explanation:
      'READ UNCOMMITTED là mức cô lập thấp nhất, cho phép đọc dữ liệu bẩn chưa commit (Dirty Read). Mức READ COMMITTED trở lên sẽ chặn hiện tượng này.',
    tags: ['#ACID', '#Transaction', '#IsolationLevel'],
    plo: 'PLO-02',
    discriminationIndex: 0.48,
    correctRate: 48,
    lastExamDate: '11/2024',
    subjectKey: 'coSoDuLieu',
  },
];

export const CONG_NGHE_PHAN_MEM_BANK: BankQuestion[] = [
  {
    id: 'bank-se-01',
    code: '#SE-001',
    chapter: 'Chương 1: Quy trình phần mềm (Waterfall, Agile, Scrum)',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Scrum)',
    bloomLevel: 'BLOOM_1',
    bloomLabel: 'Nhận biết (Bloom 1)',
    bloomColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    difficultyLevel: 'EASY',
    difficultyLabel: 'Dễ (P > 0.7)',
    content:
      'Trong phương pháp Scrum, thời lượng lý tưởng của một cuộc họp Daily Scrum (Họp đứng hàng ngày) thường kéo dài tối đa bao nhiêu phút?',
    options: [
      { id: 'opt-se-1-a', label: 'A', text: '15 phút', isCorrect: true },
      { id: 'opt-se-1-b', label: 'B', text: '30 phút', isCorrect: false },
      { id: 'opt-se-1-c', label: 'C', text: '45 phút', isCorrect: false },
      { id: 'opt-se-1-d', label: 'D', text: '60 phút', isCorrect: false },
    ],
    explanation:
      'Theo Scrum Guide, Daily Scrum là sự kiện time-box tối đa 15 phút dành cho Developers nhằm đồng bộ tiến độ và nhận diện khó khăn.',
    tags: ['#Scrum', '#DailyScrum', '#Agile'],
    plo: 'PLO-05',
    discriminationIndex: 0.25,
    correctRate: 92,
    lastExamDate: '10/2024',
    subjectKey: 'congNghePhanMem',
  },
  {
    id: 'bank-se-02',
    code: '#SE-002',
    chapter: 'Chương 3: Mô hình hóa hệ thống với sơ đồ UML',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (UML)',
    bloomLevel: 'BLOOM_2',
    bloomLabel: 'Thông hiểu (Bloom 2)',
    bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    difficultyLevel: 'MEDIUM',
    difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
    content:
      'Trong sơ đồ Use Case của UML, mối quan hệ <<include>> giữa Use Case A và Use Case B có ý nghĩa gì?',
    options: [
      { id: 'opt-se-2-a', label: 'A', text: 'Hành vi của B luôn luôn được thực thi bắt buộc khi thực hiện A', isCorrect: true },
      { id: 'opt-se-2-b', label: 'B', text: 'Hành vi của B chỉ được thực thi tùy chọn khi có điều kiện mở rộng từ A', isCorrect: false },
      { id: 'opt-se-2-c', label: 'C', text: 'B là lớp con kế thừa từ lớp cha A', isCorrect: false },
      { id: 'opt-se-2-d', label: 'D', text: 'A và B hoàn toàn độc lập và không liên quan đến nhau', isCorrect: false },
    ],
    explanation:
      'Quan hệ <<include>> thể hiện sự bao hàm bắt buộc (A luôn gọi B). Còn <<extend>> mới là mở rộng tùy chọn theo điều kiện.',
    tags: ['#UML', '#UseCase', '#IncludeExtend'],
    plo: 'PLO-03',
    discriminationIndex: 0.38,
    correctRate: 75,
    lastExamDate: '11/2024',
    subjectKey: 'congNghePhanMem',
  },
  {
    id: 'bank-se-03',
    code: '#SE-003',
    chapter: 'Chương 4: Kiến trúc phần mềm & Mẫu thiết kế (Design Patterns)',
    type: 'SINGLE_CHOICE',
    typeLabel: 'Multiple Choice (Design Patterns)',
    bloomLevel: 'BLOOM_3',
    bloomLabel: 'Vận dụng (Bloom 3)',
    bloomColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    difficultyLevel: 'HARD',
    difficultyLabel: 'Khó (P ≤ 0.4)',
    content:
      'Mẫu thiết kế (Design Pattern) nào sau đây thuộc nhóm Khởi tạo (Creational) và đảm bảo rằng một lớp chỉ có duy nhất một thể hiện (instance) toàn cục trong suốt vòng đời ứng dụng?',
    options: [
      { id: 'opt-se-3-a', label: 'A', text: 'Singleton Pattern', isCorrect: true },
      { id: 'opt-se-3-b', label: 'B', text: 'Factory Method Pattern', isCorrect: false },
      { id: 'opt-se-3-c', label: 'C', text: 'Observer Pattern', isCorrect: false },
      { id: 'opt-se-3-d', label: 'D', text: 'Adapter Pattern', isCorrect: false },
    ],
    explanation:
      'Singleton Pattern đảm bảo một class chỉ có một instance duy nhất và cung cấp một điểm truy cập toàn cục tới instance đó (ví dụ Database Connection Pool, Logger).',
    tags: ['#DesignPatterns', '#Singleton', '#Creational'],
    plo: 'PLO-03',
    discriminationIndex: 0.42,
    correctRate: 68,
    lastExamDate: '11/2024',
    subjectKey: 'congNghePhanMem',
  },
];

export function getBankQuestionsForSubject(
  subjectKey: string,
  activeClass?: { id?: string | number; name?: string; code?: string; title?: string }
): BankQuestion[] {
  switch (subjectKey) {
    case 'giaiTich2':
      return GIAI_TICH_2_BANK;
    case 'mangMayTinh':
      return MANG_MAY_TINH_BANK;
    case 'cauTrucDuLieu':
      return CAU_TRUC_DU_LIEU_BANK;
    case 'coSoDuLieu':
      return CO_SO_DU_LIEU_BANK;
    case 'congNghePhanMem':
      return CONG_NGHE_PHAN_MEM_BANK;
    default: {
      const courseName = activeClass?.title || activeClass?.name || 'Môn học';
      return [
        {
          id: `bank-gen-01-${activeClass?.id || 'gen'}`,
          code: `#GEN-001`,
          chapter: 'Chương 1: Tổng quan & Khái niệm cơ bản',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice',
          bloomLevel: 'BLOOM_1',
          bloomLabel: 'Nhận biết (Bloom 1)',
          bloomColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          difficultyLevel: 'EASY',
          difficultyLabel: 'Dễ (P > 0.7)',
          content: `Khái niệm nền tảng nào sau đây là quan trọng nhất trong học phần ${courseName}?`,
          options: [
            { id: 'opt-g1-a', label: 'A', text: 'Nắm vững lý thuyết cơ bản và các định lý mở đầu', isCorrect: true },
            { id: 'opt-g1-b', label: 'B', text: 'Chỉ ghi nhớ công thức mà không cần thực hành bài tập', isCorrect: false },
            { id: 'opt-g1-c', label: 'C', text: 'Bỏ qua bước phân tích yêu cầu', isCorrect: false },
            { id: 'opt-g1-d', label: 'D', text: 'Áp dụng công thức sai lệch điều kiện biên', isCorrect: false },
          ],
          explanation: `Trong học phần ${courseName}, việc nắm vững các khái niệm và nguyên lý cơ bản là điều kiện tiên quyết để giải quyết các bài toán phức tạp hơn.`,
          tags: ['#TongQuan', '#CoBan', '#PLO-01'],
          plo: 'PLO-01',
          discriminationIndex: 0.35,
          correctRate: 85,
          lastExamDate: 'Mới cập nhật',
          subjectKey,
        },
        {
          id: `bank-gen-02-${activeClass?.id || 'gen'}`,
          code: `#GEN-002`,
          chapter: 'Chương 2: Phương pháp & Kỹ thuật cốt lõi',
          type: 'SINGLE_CHOICE',
          typeLabel: 'Multiple Choice',
          bloomLevel: 'BLOOM_2',
          bloomLabel: 'Thông hiểu (Bloom 2)',
          bloomColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
          difficultyLevel: 'MEDIUM',
          difficultyLabel: 'Trung bình (0.4 < P ≤ 0.7)',
          content: `Khi giải quyết bài toán thuộc ${courseName}, bước tiếp cận nào sau đây là tối ưu?`,
          options: [
            { id: 'opt-g2-a', label: 'A', text: 'Phân tích dữ kiện, mô hình hóa bài toán và chọn phương pháp giải phù hợp', isCorrect: true },
            { id: 'opt-g2-b', label: 'B', text: 'Đoán đáp án ngẫu nhiên không qua các bước suy luận', isCorrect: false },
            { id: 'opt-g2-c', label: 'C', text: 'Áp dụng thuật toán có độ phức tạp cao nhất', isCorrect: false },
            { id: 'opt-g2-d', label: 'D', text: 'Bỏ qua kiểm tra kết quả cuối cùng', isCorrect: false },
          ],
          explanation: 'Quy trình giải quyết vấn đề chuẩn đòi hỏi phân tích, mô hình hóa và kiểm chứng kết quả.',
          tags: ['#PhuongPhap', '#MoHinhHoa'],
          plo: 'PLO-02',
          discriminationIndex: 0.40,
          correctRate: 72,
          lastExamDate: 'Mới cập nhật',
          subjectKey,
        },
      ];
    }
  }
}

export function getSubjectAiPrompt(subjectKey: string, activeClassName: string = 'học phần'): { prompt: string; defaultChapter: string } {
  switch (subjectKey) {
    case 'giaiTich2':
      return {
        prompt: 'Sinh 5 câu hỏi tình huống tính tích phân kép và chuỗi số phân kỳ/hội tụ',
        defaultChapter: 'Chương 3: Tích phân bội (Tích phân kép & Bội ba)',
      };
    case 'mangMayTinh':
      return {
        prompt: 'Sinh 5 câu hỏi tình huống chuyên sâu về định tuyến OSPF LSDB Flood',
        defaultChapter: 'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến',
      };
    case 'cauTrucDuLieu':
      return {
        prompt: 'Sinh 5 câu hỏi tình huống về cây cân bằng AVL và giải thuật đồ thị Dijkstra',
        defaultChapter: 'Chương 3: Cây nhị phân & Cây tìm kiếm nhị phân (BST)',
      };
    case 'coSoDuLieu':
      return {
        prompt: 'Sinh 5 câu hỏi tình huống về chuẩn hóa dạng chuẩn BCNF và tối ưu hóa truy vấn SQL',
        defaultChapter: 'Chương 4: Lý thuyết dạng chuẩn (1NF, 2NF, 3NF, BCNF)',
      };
    case 'congNghePhanMem':
      return {
        prompt: 'Sinh 5 câu hỏi tình huống về quy trình Agile/Scrum và sơ đồ tương tác UML',
        defaultChapter: 'Chương 3: Mô hình hóa hệ thống với sơ đồ UML',
      };
    default:
      return {
        prompt: `Sinh 5 câu hỏi trắc nghiệm chuẩn hóa Bloom cho môn ${activeClassName}`,
        defaultChapter: 'Chương 1: Tổng quan & Khái niệm cơ bản',
      };
  }
}
