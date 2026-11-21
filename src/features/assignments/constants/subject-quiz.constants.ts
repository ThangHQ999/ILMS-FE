import { StudioQuestionItem } from '../components/teacher/TeacherCreateQuizStudioView';

export interface SubjectConfig {
  key: string;
  subjectName: string;
  defaultQuizCode: string;
  defaultQuizTitle: string;
  chapters: string[];
  defaultChapter: string;
  ploTags: string[];
  instructions: string;
  sourceDoc: string;
  sourceDocStats: string;
  sampleQuestions: StudioQuestionItem[];
  aiQuestions: StudioQuestionItem[];
}

export const SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  giaiTich2: {
    key: 'giaiTich2',
    subjectName: 'Giải tích 2',
    defaultQuizCode: 'INT2022-QZ-01',
    defaultQuizTitle: 'Quiz 01: Chuỗi số & Phép tính Vi phân hàm nhiều biến',
    chapters: [
      'Chương 1: Chuỗi số & Chuỗi hàm',
      'Chương 2: Phép tính vi phân hàm nhiều biến',
      'Chương 3: Tích phân bội (Tích phân kép & Bội ba)',
      'Chương 4: Tích phân đường & Tích phân mặt',
      'Chương 5: Phương trình vi phân cấp 1 & cấp 2',
    ],
    defaultChapter: 'Chương 3: Tích phân bội (Tích phân kép & Bội ba)',
    ploTags: [
      'PLO-01: Tư duy toán học và tính toán vi tích phân',
      'PLO-02: Ứng dụng giải tích trong mô hình hóa kỹ thuật',
    ],
    instructions:
      'Bài trắc nghiệm đánh giá kiến thức về Phép tính vi tích phân và Tích phân bội. Sinh viên được sử dụng máy tính bỏ túi và bảng công thức tích phân cơ bản. Chú ý tính toán cẩn thận và chọn đáp án chính xác nhất.',
    sourceDoc: 'Giao_trinh_Giai_tich_2_Toan_Cao_Cap.pdf',
    sourceDocStats: '24 thực thể • 5 chương',
    sampleQuestions: [
      {
        id: 'q-gt2-1',
        orderIndex: 1,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm một đáp án',
        bloomLevel: 'Nhận biết • Bloom 1',
        difficultyLevel: 'EASY',
        points: 1.0,
        content:
          'Điều kiện cần để chuỗi số dương $\\sum_{n=1}^{\\infty} a_n$ hội tụ là gì?',
        options: [
          { id: 'opt-gt2-1-a', label: 'A', text: '\\lim_{n \\to \\infty} a_n = 0', isCorrect: true },
          { id: 'opt-gt2-1-b', label: 'B', text: '\\lim_{n \\to \\infty} a_n = 1', isCorrect: false },
          { id: 'opt-gt2-1-c', label: 'C', text: '\\lim_{n \\to \\infty} \\frac{a_{n+1}}{a_n} > 1', isCorrect: false },
          { id: 'opt-gt2-1-d', label: 'D', text: 'a_n \\ge 1 \\text{ với mọi } n', isCorrect: false },
        ],
        explanation:
          'Theo định lý về điều kiện cần của chuỗi số hội tụ: Nếu chuỗi số \\sum a_n hội tụ thì số hạng tổng quát phải dần về 0 khi n tiến ra vô cùng (\\lim_{n \\to \\infty} a_n = 0).',
        isCollapsed: false,
      },
      {
        id: 'q-gt2-2',
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm tính toán giải tích',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Tính giá trị tích phân kép $I = \\iint_D (2x + y) \\, dxdy$ với miền $D$ là hình chữ nhật giới hạn bởi $0 \\le x \\le 2$ và $0 \\le y \\le 1$.',
        options: [
          { id: 'opt-gt2-2-a', label: 'A', text: 'I = 2', isCorrect: false },
          { id: 'opt-gt2-2-b', label: 'B', text: 'I = 3', isCorrect: false },
          { id: 'opt-gt2-2-c', label: 'C', text: 'I = 5', isCorrect: true },
          { id: 'opt-gt2-2-d', label: 'D', text: 'I = 6', isCorrect: false },
        ],
        explanation:
          'Tính theo công thức Fubini: I = \\int_0^2 dx \\int_0^1 (2x + y) dy = \\int_0^2 [2xy + y^2/2]_0^1 dx = \\int_0^2 (2x + 1/2) dx = [x^2 + x/2]_0^2 = 4 + 1 = 5.',
        isCollapsed: false,
      },
    ],
    aiQuestions: [
      {
        id: 'q-ai-gt2-1',
        orderIndex: 3,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Cho hàm số hai biến $f(x, y) = x^2 y + y^3 - 3y$. Đạo hàm riêng cấp một theo biến $x$ tại điểm $(1, 2)$ bằng bao nhiêu?',
        options: [
          { id: 'opt-ai-gt2-1-a', label: 'A', text: "f'_x(1, 2) = 4", isCorrect: true },
          { id: 'opt-ai-gt2-1-b', label: 'B', text: "f'_x(1, 2) = 2", isCorrect: false },
          { id: 'opt-ai-gt2-1-c', label: 'C', text: "f'_x(1, 2) = 8", isCorrect: false },
          { id: 'opt-ai-gt2-1-d', label: 'D', text: "f'_x(1, 2) = 0", isCorrect: false },
        ],
        explanation:
          "Lấy đạo hàm riêng theo biến x coi y là hằng số: f'_x(x, y) = 2xy. Thay điểm (1, 2) ta được f'_x(1, 2) = 2 * 1 * 2 = 4.",
        isCollapsed: false,
      },
      {
        id: 'q-ai-gt2-2',
        orderIndex: 4,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'HARD',
        points: 1.0,
        content:
          'Tính tích phân đường loại một $I = \\int_L (x + y) \\, ds$ với $L$ là đoạn thẳng nối từ $(0, 0)$ đến $(1, 1)$.',
        options: [
          { id: 'opt-ai-gt2-2-a', label: 'A', text: 'I = \\sqrt{2}', isCorrect: true },
          { id: 'opt-ai-gt2-2-b', label: 'B', text: 'I = 2\\sqrt{2}', isCorrect: false },
          { id: 'opt-ai-gt2-2-c', label: 'C', text: 'I = 1', isCorrect: false },
          { id: 'opt-ai-gt2-2-d', label: 'D', text: 'I = 2', isCorrect: false },
        ],
        explanation:
          'Phương trình tham số của đoạn thẳng: x = t, y = t (0 <= t <= 1). Vi phân cung ds = \\sqrt{x\'(t)^2 + y\'(t)^2} dt = \\sqrt{2} dt. Tích phân I = \\int_0^1 (t + t) \\sqrt{2} dt = 2\\sqrt{2} [t^2/2]_0^1 = \\sqrt{2}.',
        isCollapsed: false,
      },
    ],
  },

  mangMayTinh: {
    key: 'mangMayTinh',
    subjectName: 'Mạng máy tính & Truyền thông',
    defaultQuizCode: 'CS202-QZ-04',
    defaultQuizTitle: 'Quiz 04: Tầng Mạng & Thuật toán Định tuyến OSPF / BGP',
    chapters: [
      'Chương 1: Tổng quan mạng & Mô hình OSI / TCP-IP',
      'Chương 2: Tầng Ứng dụng & Dịch vụ Mạng (DNS, HTTP, SSH)',
      'Chương 3: Tầng Giao vận & Cơ chế bắt tay TCP/UDP',
      'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến',
      'Chương 5: Tầng Liên kết dữ liệu & Mạng LAN',
    ],
    defaultChapter: 'Chương 4: Tầng Mạng & Giao thức IP, Định tuyến',
    ploTags: ['PLO-03: Phân tích định tuyến', 'PLO-05: Cấu hình Router/Switch'],
    instructions:
      'Bài trắc nghiệm đánh giá kiến thức tuần 7 về Giao thức Link-State (OSPF) và Path-Vector (BGP). Sinh viên được sử dụng sơ đồ mạng đã cho, không tham khảo tài liệu trái phép. Chú ý tính toán bảng định tuyến Dijkstra cẩn thận.',
    sourceDoc: 'Giao_trinh_Mang_may_tinh_v2.pdf',
    sourceDocStats: '18 thực thể • 4 chương',
    sampleQuestions: [
      {
        id: 'q-init-1',
        orderIndex: 1,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm một đáp án',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Trong giao thức OSPF, loại gói tin nào được các Router gửi định kỳ để thiết lập và duy trì mối quan hệ láng giềng (Neighbor Adjacency)?',
        options: [
          { id: 'opt-1-a', label: 'A', text: 'Link State Request (LSR)', isCorrect: false },
          { id: 'opt-1-b', label: 'B', text: 'Hello Packet', isCorrect: true },
          { id: 'opt-1-c', label: 'C', text: 'Database Description (DBD)', isCorrect: false },
          { id: 'opt-1-d', label: 'D', text: 'Link State Acknowledgment (LSAck)', isCorrect: false },
        ],
        explanation:
          'Gói tin Hello Packet (OSPF Type 1) được gửi định kỳ (mặc định 10s trên mạng Broadcast/Point-to-Point) đến địa chỉ Multicast 224.0.0.5 (AllSPFRouters) nhằm phát hiện láng giềng, thỏa thuận các thông số chung (Hello/Dead interval, Area ID, Subnet mask, v.v.).',
        isCollapsed: false,
      },
      {
        id: 'q-init-2',
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm phân tích sơ đồ',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'HARD',
        points: 1.0,
        content:
          'Quan sát sơ đồ mạng bên dưới: Giả sử thuật toán Dijkstra chạy trên Router R1. Đường đi có tổng chi phí (Total Cost) thấp nhất từ R1 đến mạng con 192.168.10.0/24 là bao nhiêu?',
        diagramData: 'dijkstra_topology',
        options: [
          { id: 'opt-2-a', label: 'A', text: 'Cost = 35 (Qua đường R1-R2-R4)', isCorrect: false },
          { id: 'opt-2-b', label: 'B', text: 'Cost = 15 (Qua đường R1-R3-R4)', isCorrect: true },
          { id: 'opt-2-c', label: 'C', text: 'Cost = 25', isCorrect: false },
          { id: 'opt-2-d', label: 'D', text: 'Cost = 10', isCorrect: false },
        ],
        explanation:
          'Đường đi tối ưu Dijkstra: R1 -> R3 (Cost = 5) -> R4 (Cost = 10). Tổng Cost = 5 + 10 = 15. Tuyến qua R2 có Cost = 15 + 20 = 35.',
        isCollapsed: false,
      },
    ],
    aiQuestions: [
      {
        id: 'q-ai-net-1',
        orderIndex: 3,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Trong cấu hình định tuyến BGP, thuộc tính nào sau đây được coi là Well-known Mandatory và xác định danh sách các AS mà bản tin quảng bá đã đi qua?',
        options: [
          { id: 'opt-ai-1-a', label: 'A', text: 'AS-Path', isCorrect: true },
          { id: 'opt-ai-1-b', label: 'B', text: 'Next-Hop', isCorrect: false },
          { id: 'opt-ai-1-c', label: 'C', text: 'Local Preference', isCorrect: false },
          { id: 'opt-ai-1-d', label: 'D', text: 'MED (Multi-Exit Discriminator)', isCorrect: false },
        ],
        explanation:
          'AS-Path là thuộc tính Well-known Mandatory trong BGP, vừa dùng để chọn đường đi ngắn nhất vừa giúp chống Loop định tuyến giữa các AS.',
        isCollapsed: false,
      },
      {
        id: 'q-ai-net-2',
        orderIndex: 4,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'HARD',
        points: 1.0,
        content:
          'Mạng con 172.16.0.0/16 được chia thành các subnet có độ dài tiền tố /20. Số lượng subnet tối đa có thể tạo được và số host khả dụng trên mỗi subnet là bao nhiêu?',
        options: [
          { id: 'opt-ai-2-a', label: 'A', text: '16 subnets và 4094 hosts/subnet', isCorrect: true },
          { id: 'opt-ai-2-b', label: 'B', text: '32 subnets và 2046 hosts/subnet', isCorrect: false },
          { id: 'opt-ai-2-c', label: 'C', text: '8 subnets và 8190 hosts/subnet', isCorrect: false },
          { id: 'opt-ai-2-d', label: 'D', text: '16 subnets và 4096 hosts/subnet', isCorrect: false },
        ],
        explanation:
          'Mượn 4 bit (20 - 16 = 4) -> 2^4 = 16 subnets. Còn lại 12 bit host -> 2^12 - 2 = 4094 hosts khả dụng.',
        isCollapsed: false,
      },
    ],
  },

  cauTrucDuLieu: {
    key: 'cauTrucDuLieu',
    subjectName: 'Cấu trúc dữ liệu & Giải thuật',
    defaultQuizCode: 'INT1340-QZ-01',
    defaultQuizTitle: 'Quiz 01: Cây nhị phân tìm kiếm & Độ phức tạp giải thuật',
    chapters: [
      'Chương 1: Độ phức tạp thuật toán (Big-O) & Đệ quy',
      'Chương 2: Ngăn xếp (Stack) & Hàng đợi (Queue)',
      'Chương 3: Cây nhị phân & Cây tìm kiếm nhị phân (BST)',
      'Chương 4: Đồ thị & Giải thuật duyệt BFS/DFS',
      'Chương 5: Thuật toán sắp xếp & Tìm kiếm',
    ],
    defaultChapter: 'Chương 3: Cây nhị phân & Cây tìm kiếm nhị phân (BST)',
    ploTags: [
      'PLO-02: Phân tích và thiết kế cấu trúc dữ liệu',
      'PLO-03: Cài đặt và tối ưu hóa giải thuật',
    ],
    instructions:
      'Bài trắc nghiệm đánh giá cấu trúc dữ liệu Cây và Đồ thị. Sinh viên chú ý phân tích độ phức tạp thời gian và không gian thuật toán trước khi chọn đáp án.',
    sourceDoc: 'Giao_trinh_Cau_truc_du_lieu_Giai_thuat.pdf',
    sourceDocStats: '22 thực thể • 5 chương',
    sampleQuestions: [
      {
        id: 'q-dsa-1',
        orderIndex: 1,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm một đáp án',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Trong cây nhị phân tìm kiếm (BST), độ phức tạp thời gian trung bình của thao tác tìm kiếm một phần tử là bao nhiêu?',
        options: [
          { id: 'opt-dsa-1-a', label: 'A', text: 'O(log n)', isCorrect: true },
          { id: 'opt-dsa-1-b', label: 'B', text: 'O(n)', isCorrect: false },
          { id: 'opt-dsa-1-c', label: 'C', text: 'O(1)', isCorrect: false },
          { id: 'opt-dsa-1-d', label: 'D', text: 'O(n log n)', isCorrect: false },
        ],
        explanation:
          'Trong trường hợp cây cân bằng tốt hoặc trung bình, chiều cao của cây xấp xỉ log n nên thời gian tìm kiếm là O(log n). Trường hợp xấu nhất suy biến thành danh sách liên kết là O(n).',
        isCollapsed: false,
      },
      {
        id: 'q-dsa-2',
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm vận dụng',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'HARD',
        points: 1.0,
        content:
          'Thuật toán sắp xếp nào sau đây có độ phức tạp thời gian trong trường hợp xấu nhất (Worst-case) là O(n log n) và không cần thêm bộ nhớ phụ O(n)?',
        options: [
          { id: 'opt-dsa-2-a', label: 'A', text: 'Heap Sort', isCorrect: true },
          { id: 'opt-dsa-2-b', label: 'B', text: 'Quick Sort', isCorrect: false },
          { id: 'opt-dsa-2-c', label: 'C', text: 'Merge Sort', isCorrect: false },
          { id: 'opt-dsa-2-d', label: 'D', text: 'Bubble Sort', isCorrect: false },
        ],
        explanation:
          'Heap Sort luôn đảm bảo độ phức tạp O(n log n) trong mọi trường hợp và sắp xếp tại chỗ (In-place, O(1) auxiliary space). Merge Sort cần O(n) bộ nhớ phụ, Quick Sort worst-case là O(n^2).',
        isCollapsed: false,
      },
    ],
    aiQuestions: [
      {
        id: 'q-ai-dsa-1',
        orderIndex: 3,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Cấu trúc dữ liệu nào tuân theo nguyên lý LIFO (Last In First Out)?',
        options: [
          { id: 'opt-ai-dsa-1-a', label: 'A', text: 'Ngăn xếp (Stack)', isCorrect: true },
          { id: 'opt-ai-dsa-1-b', label: 'B', text: 'Hàng đợi (Queue)', isCorrect: false },
          { id: 'opt-ai-dsa-1-c', label: 'C', text: 'Danh sách liên kết đôi (Doubly Linked List)', isCorrect: false },
          { id: 'opt-ai-dsa-1-d', label: 'D', text: 'Cây đỏ đen (Red-Black Tree)', isCorrect: false },
        ],
        explanation: 'Stack hoạt động theo cơ chế Vào sau Ra trước (LIFO). Queue hoạt động theo FIFO.',
        isCollapsed: false,
      },
    ],
  },

  coSoDuLieu: {
    key: 'coSoDuLieu',
    subjectName: 'Hệ quản trị Cơ sở dữ liệu',
    defaultQuizCode: 'CS301-QZ-01',
    defaultQuizTitle: 'Quiz 01: Chuẩn hóa CSDL & Ngôn ngữ truy vấn SQL',
    chapters: [
      'Chương 1: Mô hình thực thể kết hợp (ERD)',
      'Chương 2: Mô hình quan hệ & Đại số quan hệ',
      'Chương 3: Ngôn ngữ SQL & Tối ưu hóa truy vấn',
      'Chương 4: Lý thuyết dạng chuẩn (1NF, 2NF, 3NF, BCNF)',
      'Chương 5: Giao dịch & Kiểm soát tương thời (ACID)',
    ],
    defaultChapter: 'Chương 4: Lý thuyết dạng chuẩn (1NF, 2NF, 3NF, BCNF)',
    ploTags: [
      'PLO-02: Thiết kế và chuẩn hóa lược đồ CSDL',
      'PLO-04: Tối ưu hóa câu truy vấn SQL',
    ],
    instructions:
      'Bài trắc nghiệm đánh giá kỹ năng chuẩn hóa lược đồ quan hệ và viết câu lệnh truy vấn SQL. Chú ý xác định khóa chính và các phụ thuộc hàm.',
    sourceDoc: 'Giao_trinh_He_quan_tri_CSDL.pdf',
    sourceDocStats: '19 thực thể • 5 chương',
    sampleQuestions: [
      {
        id: 'q-db-1',
        orderIndex: 1,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm lý thuyết CSDL',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Một lược đồ quan hệ đạt Dạng chuẩn 3 (3NF) khi và chỉ khi nó đạt 2NF và thỏa mãn điều kiện nào sau đây?',
        options: [
          { id: 'opt-db-1-a', label: 'A', text: 'Không tồn tại phụ thuộc bắc cầu giữa các thuộc tính không khóa vào khóa chính', isCorrect: true },
          { id: 'opt-db-1-b', label: 'B', text: 'Mọi thuộc tính đều là thuộc tính đơn trị nguyên tử', isCorrect: false },
          { id: 'opt-db-1-c', label: 'C', text: 'Không có phụ thuộc hàm bộ phận vào khóa chính', isCorrect: false },
          { id: 'opt-db-1-d', label: 'D', text: 'Mọi định thức đều phải là siêu khóa (Superkey)', isCorrect: false },
        ],
        explanation:
          '3NF yêu cầu quan hệ đã ở 2NF và không có thuộc tính không khóa nào phụ thuộc bắc cầu vào khóa chính. Điều kiện mọi định thức là siêu khóa là định nghĩa của BCNF.',
        isCollapsed: false,
      },
    ],
    aiQuestions: [
      {
        id: 'q-ai-db-1',
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Mệnh đề nào trong SQL được sử dụng để lọc kết quả sau khi đã thực hiện gom nhóm (GROUP BY)?',
        options: [
          { id: 'opt-ai-db-1-a', label: 'A', text: 'HAVING', isCorrect: true },
          { id: 'opt-ai-db-1-b', label: 'B', text: 'WHERE', isCorrect: false },
          { id: 'opt-ai-db-1-c', label: 'C', text: 'ORDER BY', isCorrect: false },
          { id: 'opt-ai-db-1-d', label: 'D', text: 'GROUP FILTER', isCorrect: false },
        ],
        explanation: 'WHERE lọc các dòng trước khi gom nhóm; HAVING dùng để lọc các nhóm sau GROUP BY.',
        isCollapsed: false,
      },
    ],
  },

  congNghePhanMem: {
    key: 'congNghePhanMem',
    subjectName: 'Nhập môn Công nghệ Phần mềm',
    defaultQuizCode: 'SE214-QZ-01',
    defaultQuizTitle: 'Quiz 01: Quy trình phát triển phần mềm & Thiết kế UML',
    chapters: [
      'Chương 1: Quy trình phần mềm (Waterfall, Agile, Scrum)',
      'Chương 2: Đặc tả và quản lý yêu cầu (SRS, User Story)',
      'Chương 3: Mô hình hóa hệ thống với sơ đồ UML',
      'Chương 4: Kiến trúc phần mềm & Mẫu thiết kế (Design Patterns)',
      'Chương 5: Kiểm thử và đảm bảo chất lượng phần mềm (QA/QC)',
    ],
    defaultChapter: 'Chương 3: Mô hình hóa hệ thống với sơ đồ UML',
    ploTags: [
      'PLO-03: Phân tích yêu cầu và thiết kế mô hình UML',
      'PLO-05: Áp dụng quy trình Agile/Scrum',
    ],
    instructions:
      'Bài trắc nghiệm đánh giá kiến thức về quy trình Agile/Scrum và mô hình hóa ca sử dụng UML. Sinh viên phân tích kỹ các mối quan hệ giữa các Actor và Use Case.',
    sourceDoc: 'Giao_trinh_Nhap_mon_Cong_nghe_Phan_mem.pdf',
    sourceDocStats: '16 thực thể • 5 chương',
    sampleQuestions: [
      {
        id: 'q-se-1',
        orderIndex: 1,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm lý thuyết CNPM',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content:
          'Trong sơ đồ Use Case của UML, mối quan hệ <<include>> giữa Use Case A và Use Case B có ý nghĩa gì?',
        options: [
          { id: 'opt-se-1-a', label: 'A', text: 'Hành vi của B luôn luôn được thực thi như một phần bắt buộc khi thực hiện A', isCorrect: true },
          { id: 'opt-se-1-b', label: 'B', text: 'Hành vi của B chỉ được thực thi tùy chọn khi có điều kiện mở rộng từ A', isCorrect: false },
          { id: 'opt-se-1-c', label: 'C', text: 'B là lớp con kế thừa hành vi từ lớp cha A', isCorrect: false },
          { id: 'opt-se-1-d', label: 'D', text: 'A và B hoàn toàn độc lập và không có liên hệ chức năng', isCorrect: false },
        ],
        explanation:
          'Quan hệ <<include>> thể hiện sự bao hàm bắt buộc (A luôn gọi B). Còn <<extend>> mới là mở rộng có điều kiện tùy chọn.',
        isCollapsed: false,
      },
    ],
    aiQuestions: [
      {
        id: 'q-ai-se-1',
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Nhận biết • Bloom 1',
        difficultyLevel: 'EASY',
        points: 1.0,
        content:
          'Trong phương pháp Scrum, thời lượng lý tưởng của một Sprint thường kéo dài trong khoảng bao lâu?',
        options: [
          { id: 'opt-ai-se-1-a', label: 'A', text: 'Từ 1 đến 4 tuần (thông thường là 2 tuần)', isCorrect: true },
          { id: 'opt-ai-se-1-b', label: 'B', text: 'Từ 3 đến 6 tháng', isCorrect: false },
          { id: 'opt-ai-se-1-c', label: 'C', text: 'Đúng 1 ngày làm việc', isCorrect: false },
          { id: 'opt-ai-se-1-d', label: 'D', text: 'Tùy ý không giới hạn thời gian', isCorrect: false },
        ],
        explanation: 'Theo Scrum Guide, một Sprint có độ dài cố định từ 1 đến 4 tuần nhằm tạo nhịp độ ổn định.',
        isCollapsed: false,
      },
    ],
  },
};

export function buildGenericSubjectConfig(cleanCode: string, cleanTitle: string): SubjectConfig {
  return {
    key: `generic-${cleanCode.toLowerCase()}`,
    subjectName: cleanTitle,
    defaultQuizCode: `${cleanCode}-QZ-01`,
    defaultQuizTitle: `Quiz 01: Đánh giá kiến thức - ${cleanTitle}`,
    chapters: [
      'Chương 1: Kiến thức nền tảng & Tổng quan',
      'Chương 2: Nguyên lý cốt lõi & Phương pháp luận',
      'Chương 3: Kỹ năng ứng dụng & Thực hành chuyên sâu',
      'Chương 4: Phân tích, Đánh giá & Tối ưu hóa',
      'Chương 5: Tổng kết học phần & Ôn tập cuối kỳ',
    ],
    defaultChapter: 'Chương 1: Kiến thức nền tảng & Tổng quan',
    ploTags: [
      'PLO-01: Vận dụng kiến thức nền tảng học phần',
      'PLO-02: Phân tích và giải quyết vấn đề chuyên môn',
    ],
    instructions: `Bài trắc nghiệm đánh giá kiến thức môn ${cleanTitle}. Sinh viên làm bài nghiêm túc, không sử dụng tài liệu trái phép và hoàn thành trước thời hạn quy định.`,
    sourceDoc: `Giao_trinh_${cleanCode.replace(/[^A-Za-z0-9_]/g, '_')}.pdf`,
    sourceDocStats: '20 thực thể • 5 chương',
    sampleQuestions: [
      {
        id: `q-${cleanCode.toLowerCase()}-1`,
        orderIndex: 1,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm kiến thức',
        bloomLevel: 'Thông hiểu • Bloom 2',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content: `Khái niệm nào sau đây phản ánh chính xác mục tiêu trọng tâm của học phần ${cleanTitle}?`,
        options: [
          { id: 'opt-gen-1-a', label: 'A', text: 'Nắm vững nguyên lý cốt lõi và vận dụng giải quyết bài toán thực tế', isCorrect: true },
          { id: 'opt-gen-1-b', label: 'B', text: 'Chỉ ghi nhớ máy móc các định nghĩa lý thuyết', isCorrect: false },
          { id: 'opt-gen-1-c', label: 'C', text: 'Bỏ qua các bước phân tích và đánh giá chất lượng', isCorrect: false },
          { id: 'opt-gen-1-d', label: 'D', text: 'Không cần tuân thủ các chuẩn mực và quy trình', isCorrect: false },
        ],
        explanation: 'Mục tiêu học phần luôn hướng tới việc nắm vững nguyên lý và vận dụng thực tiễn.',
        isCollapsed: false,
      },
    ],
    aiQuestions: [
      {
        id: `q-ai-${cleanCode.toLowerCase()}-1`,
        orderIndex: 2,
        type: 'SINGLE_CHOICE',
        typeLabel: 'Trắc nghiệm AI sinh',
        bloomLevel: 'Vận dụng • Bloom 3',
        difficultyLevel: 'MEDIUM',
        points: 1.0,
        content: `Phương pháp nào sau đây tối ưu nhất khi giải quyết vấn đề chuyên môn trong ${cleanTitle}?`,
        options: [
          { id: 'opt-ai-gen-1-a', label: 'A', text: 'Phân tích đa chiều kết hợp thẩm định thực nghiệm', isCorrect: true },
          { id: 'opt-ai-gen-1-b', label: 'B', text: 'Chọn phương án trực giác ngẫu nhiên', isCorrect: false },
          { id: 'opt-ai-gen-1-c', label: 'C', text: 'Bỏ qua kiểm thử biên', isCorrect: false },
          { id: 'opt-ai-gen-1-d', label: 'D', text: 'Không kiểm tra tính đúng đắn của dữ liệu', isCorrect: false },
        ],
        explanation: 'Phương pháp khoa học yêu cầu phân tích đa chiều và thẩm định kết quả.',
        isCollapsed: false,
      },
    ],
  };
}

export function getSubjectInfoForClass(classItem?: {
  id?: string | number | null;
  name?: string | null;
  code?: string | null;
  classCode?: string | null;
  title?: string | null;
  description?: string | null;
  label?: string | null;
} | null): SubjectConfig {
  const combined = [
    classItem?.id,
    classItem?.name,
    classItem?.code,
    classItem?.classCode,
    classItem?.title,
    classItem?.description,
    classItem?.label,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const removeAccents = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const normalized = removeAccents(combined);

  if (
    normalized.includes('int2022') ||
    normalized.includes('giai tich') ||
    normalized.includes('calculus') ||
    normalized.includes('toan cao cap') ||
    normalized.includes('f2a0d62e-6086-4c58-ab80-7ce00c2b328a') ||
    normalized.includes('f2a0d62e')
  ) {
    return SUBJECT_CONFIGS.giaiTich2;
  }
  if (
    normalized.includes('cs-202') ||
    normalized.includes('cs202') ||
    normalized.includes('mang may tinh') ||
    normalized.includes('network')
  ) {
    return SUBJECT_CONFIGS.mangMayTinh;
  }
  if (
    normalized.includes('int-1340') ||
    normalized.includes('int1340') ||
    normalized.includes('cau truc du lieu') ||
    normalized.includes('giai thuat') ||
    normalized.includes('dsa')
  ) {
    return SUBJECT_CONFIGS.cauTrucDuLieu;
  }
  if (
    normalized.includes('cs-301') ||
    normalized.includes('cs301') ||
    normalized.includes('co so du lieu') ||
    normalized.includes('csdl') ||
    normalized.includes('database') ||
    normalized.includes('sql')
  ) {
    return SUBJECT_CONFIGS.coSoDuLieu;
  }
  if (
    normalized.includes('se-214') ||
    normalized.includes('se214') ||
    normalized.includes('cong nghe phan mem') ||
    normalized.includes('cnpm') ||
    normalized.includes('software')
  ) {
    return SUBJECT_CONFIGS.congNghePhanMem;
  }

  // Fallback with dynamic class code / title
  let rawCode = (classItem?.name || classItem?.classCode || classItem?.code || 'CLASS').toUpperCase();
  if (/^[0-9A-F-]{36}$/i.test(rawCode)) {
    rawCode = 'CLASS';
  }
  const cleanCode = rawCode.replace(/[^A-Z0-9-]/g, '') || 'CLASS';
  const cleanTitle =
    classItem?.title && !/^[0-9a-f-]{36}$/i.test(classItem.title)
      ? classItem.title
      : classItem?.name && !/^[0-9a-f-]{36}$/i.test(classItem.name)
      ? classItem.name
      : 'Học phần';

  return buildGenericSubjectConfig(cleanCode, cleanTitle);
}

export interface SubjectMockExamItem {
  id: string;
  code: string;
  type: 'quiz' | 'exam' | 'draft';
  status: 'live' | 'upcoming' | 'completed' | 'complaints' | 'draft';
  statusBadge?: string;
  statusBadgeColor?: string;
  securityBadge?: string;
  classTag?: string;
  title: string;
  examDate?: string;
  duration: string;
  questionCount: number;
  tags?: string[];
  submittedCount?: number;
  totalStudents?: number;
  timeLeft?: string;
  progressPercent?: number;
  avgScore?: number;
  ploRate?: number;
  discriminationIndex?: number;
  complaintCount?: number;
  complaintDetail?: string;
  sourceDoc?: string;
  draftMode?: string;
}

export function getMockExamsForSubject(
  classOption: { id?: string | number | null; code?: string | null; title?: string | null; label?: string | null; name?: string | null },
  formattedTimeLeft: string = 'Còn 12:45'
): SubjectMockExamItem[] {
  const subject = getSubjectInfoForClass(classOption);
  const classId = String(classOption.id || 'cs-202');
  const classCode = String(classOption.code || classOption.name || 'CLASS');
  const classTagText = `Lớp: ${classCode}`;

  if (subject.key === 'giaiTich2') {
    return [
      {
        id: `quiz-gt2-01-${classId}`,
        code: `QUIZ-INT2022-01`,
        type: 'quiz',
        status: 'live',
        statusBadge: 'Đang trực tuyến • Live',
        statusBadgeColor: 'bg-rose-500 text-white',
        classTag: classTagText,
        title: 'Quiz 01: Chuỗi số & Phép tính Vi phân hàm nhiều biến',
        duration: '30 phút làm bài',
        questionCount: 20,
        tags: ['Chuẩn PLO-01', 'Bảng công thức vi tích phân'],
        submittedCount: 48,
        totalStudents: 54,
        timeLeft: formattedTimeLeft,
        progressPercent: 88,
      },
      {
        id: `quiz-gt2-02-${classId}`,
        code: `QUIZ-INT2022-02`,
        type: 'quiz',
        status: 'upcoming',
        statusBadge: 'Sắp diễn ra • Bắt đầu sau 3 giờ',
        statusBadgeColor: 'bg-blue-600 text-white',
        securityBadge: 'Giám sát màn hình',
        classTag: classTagText,
        title: 'Quiz 02: Tích phân bội (Tích phân kép & Bội ba)',
        examDate: 'Hôm nay: 15:00 - 15:45',
        duration: '45 phút',
        questionCount: 25,
        totalStudents: 54,
        tags: ['Đổi biến tọa độ cực', 'Fubini theorem'],
      },
      {
        id: `mid-gt2-2024-${classId}`,
        code: `MID-INT2022-2024`,
        type: 'exam',
        status: 'completed',
        statusBadge: 'Đã hoàn thành • Đã công bố điểm',
        statusBadgeColor: 'bg-emerald-600 text-white',
        classTag: classTagText,
        title: 'Kiểm tra Giữa kỳ: Phép tính Vi phân & Tích phân bội',
        duration: '60 phút',
        questionCount: 30,
        tags: ['54/54 SV nộp (100%)'],
        submittedCount: 54,
        totalStudents: 54,
        avgScore: 7.8,
        ploRate: 85,
        discriminationIndex: 0.72,
      },
      {
        id: `draft-gt2-03-${classId}`,
        code: 'AI-DRAFT-GT2',
        type: 'draft',
        status: 'draft',
        statusBadge: 'Bản nháp AI Generated • 20 câu tích phân đường',
        statusBadgeColor: 'bg-purple-600 text-white',
        classTag: classTagText,
        title: 'Quiz 03: Tích phân đường & Tích phân mặt (Green / Stokes)',
        sourceDoc: 'Sinh từ tài liệu: Giao_trinh_Giai_tich_2_Toan_Cao_Cap.pdf',
        duration: '30 phút',
        questionCount: 20,
        tags: ['Phủ mức Bloom 1-3: Nhận biết, Tính toán vi phân cung'],
        draftMode: 'Đang ở chế độ nháp riêng tư',
      },
    ];
  }

  if (subject.key === 'mangMayTinh') {
    return [
      {
        id: `quiz-04-${classId}`,
        code: `QUIZ-CS202-04`,
        type: 'quiz',
        status: 'live',
        statusBadge: 'Đang trực tuyến • Live',
        statusBadgeColor: 'bg-rose-500 text-white',
        classTag: classTagText,
        title: 'Quiz 04: Tầng Mạng & Giao thức Định tuyến OSPF/BGP',
        duration: '30 phút làm bài',
        questionCount: 20,
        tags: ['4 mã đề tự động', 'Giám sát Tab & IP'],
        submittedCount: 54,
        totalStudents: 60,
        timeLeft: formattedTimeLeft,
        progressPercent: 90,
      },
      {
        id: `quiz-05-${classId}`,
        code: `QUIZ-CS202-05`,
        type: 'quiz',
        status: 'upcoming',
        statusBadge: 'Sắp diễn ra • Bắt đầu sau 2 giờ',
        statusBadgeColor: 'bg-blue-600 text-white',
        securityBadge: 'Safe Exam Browser',
        classTag: classTagText,
        title: 'Quiz 05: Giao thức BGP & Định tuyến liên miền',
        examDate: 'Hôm nay: 14:00 - 14:45',
        duration: '45 phút',
        questionCount: 25,
        totalStudents: 60,
        tags: ['Safe Exam Browser'],
      },
      {
        id: `quiz-03-${classId}`,
        code: `QUIZ-CS202-03`,
        type: 'quiz',
        status: 'completed',
        statusBadge: 'Đã hoàn thành • Đã công bố điểm',
        statusBadgeColor: 'bg-emerald-600 text-white',
        classTag: classTagText,
        title: 'Quiz 03: Tầng Giao vận & Cơ chế bắt tay TCP',
        duration: '30 phút',
        questionCount: 20,
        tags: ['58/58 SV nộp (100%)'],
        submittedCount: 58,
        totalStudents: 58,
        avgScore: 8.2,
        ploRate: 88,
        discriminationIndex: 0.74,
      },
      {
        id: `quiz-02-${classId}`,
        code: `QUIZ-CS202-02`,
        type: 'quiz',
        status: 'complaints',
        statusBadge: 'Có 2 khiếu nại cần xử lý',
        statusBadgeColor: 'bg-rose-600 text-white',
        classTag: classTagText,
        title: 'Quiz 02: Tầng Liên kết dữ liệu & Giao thức CSMA/CD',
        duration: '35 phút',
        questionCount: 25,
        tags: [],
        submittedCount: 56,
        totalStudents: 60,
        avgScore: 8.1,
        complaintCount: 2,
        complaintDetail: '2 SV khiếu nại câu hỏi #14 về tính toán Backoff time trong mạng Ethernet',
      },
      {
        id: `quiz-06-draft-${classId}`,
        code: 'AI-DRAFT-APP',
        type: 'draft',
        status: 'draft',
        statusBadge: 'Bản nháp AI Generated • 20 câu tự động bóc tách',
        statusBadgeColor: 'bg-purple-600 text-white',
        classTag: classTagText,
        title: 'Quiz 06: Tầng Ứng dụng & Dịch vụ Mạng DNS/HTTP/SSH',
        sourceDoc: 'Sinh từ tài liệu: Giao_trinh_Mang_may_tinh_v2.pdf',
        duration: '25 phút',
        questionCount: 20,
        tags: ['Phủ đều các mức Bloom: Nhớ, Hiểu, Phân tích luồng gói tin'],
        draftMode: 'Đang ở chế độ nháp riêng tư',
      },
    ];
  }

  if (subject.key === 'cauTrucDuLieu') {
    return [
      {
        id: `quiz-dsa-01-${classId}`,
        code: `QUIZ-INT1340-01`,
        type: 'quiz',
        status: 'live',
        statusBadge: 'Đang trực tuyến • Live',
        statusBadgeColor: 'bg-rose-500 text-white',
        classTag: classTagText,
        title: 'Quiz 01: Cây nhị phân tìm kiếm & Độ phức tạp giải thuật',
        duration: '30 phút làm bài',
        questionCount: 20,
        tags: ['Big-O Notation', 'BST Search & Insert'],
        submittedCount: 42,
        totalStudents: 45,
        timeLeft: formattedTimeLeft,
        progressPercent: 93,
      },
      {
        id: `quiz-dsa-02-${classId}`,
        code: `QUIZ-INT1340-02`,
        type: 'quiz',
        status: 'upcoming',
        statusBadge: 'Sắp diễn ra • Ngày mai: 08:00',
        statusBadgeColor: 'bg-blue-600 text-white',
        classTag: classTagText,
        title: 'Quiz 02: Thuật toán Đồ thị Dijkstra & Duyệt BFS/DFS',
        examDate: 'Ngày mai: 08:00 - 08:45',
        duration: '45 phút',
        questionCount: 25,
        totalStudents: 45,
        tags: ['Graph Traversal', 'Adjacency Matrix'],
      },
      {
        id: `mid-dsa-2024-${classId}`,
        code: `MID-INT1340-2024`,
        type: 'exam',
        status: 'completed',
        statusBadge: 'Đã hoàn thành • Đã công bố điểm',
        statusBadgeColor: 'bg-emerald-600 text-white',
        classTag: classTagText,
        title: 'Kiểm tra Giữa kỳ: Cấu trúc dữ liệu & Giải thuật',
        duration: '60 phút',
        questionCount: 35,
        tags: ['45/45 SV nộp (100%)'],
        submittedCount: 45,
        totalStudents: 45,
        avgScore: 7.9,
        ploRate: 84,
        discriminationIndex: 0.71,
      },
    ];
  }

  if (subject.key === 'coSoDuLieu') {
    return [
      {
        id: `quiz-db-01-${classId}`,
        code: `QUIZ-CS301-01`,
        type: 'quiz',
        status: 'live',
        statusBadge: 'Đang trực tuyến • Live',
        statusBadgeColor: 'bg-rose-500 text-white',
        classTag: classTagText,
        title: 'Quiz 01: Chuẩn hóa CSDL & Ngôn ngữ truy vấn SQL',
        duration: '30 phút làm bài',
        questionCount: 20,
        tags: ['1NF 2NF 3NF BCNF', 'SQL Subquery'],
        submittedCount: 46,
        totalStudents: 48,
        timeLeft: formattedTimeLeft,
        progressPercent: 95,
      },
      {
        id: `quiz-db-02-${classId}`,
        code: `QUIZ-CS301-02`,
        type: 'quiz',
        status: 'upcoming',
        statusBadge: 'Sắp diễn ra • Ngày mai: 10:00',
        statusBadgeColor: 'bg-blue-600 text-white',
        classTag: classTagText,
        title: 'Quiz 02: Giao dịch ACID & Khóa phân tán (Locking)',
        examDate: 'Ngày mai: 10:00 - 10:45',
        duration: '45 phút',
        questionCount: 25,
        totalStudents: 48,
        tags: ['Transaction Isolation', 'Deadlock Detection'],
      },
      {
        id: `mid-db-2024-${classId}`,
        code: `MID-CS301-2024`,
        type: 'exam',
        status: 'completed',
        statusBadge: 'Đã hoàn thành • Đã công bố điểm',
        statusBadgeColor: 'bg-emerald-600 text-white',
        classTag: classTagText,
        title: 'Kiểm tra Giữa kỳ: Thiết kế CSDL & Truy vấn SQL nâng cao',
        duration: '60 phút',
        questionCount: 35,
        tags: ['48/48 SV nộp (100%)'],
        submittedCount: 48,
        totalStudents: 48,
        avgScore: 8.3,
        ploRate: 89,
        discriminationIndex: 0.76,
      },
    ];
  }

  if (subject.key === 'congNghePhanMem') {
    return [
      {
        id: `quiz-se-01-${classId}`,
        code: `QUIZ-SE214-01`,
        type: 'quiz',
        status: 'live',
        statusBadge: 'Đang trực tuyến • Live',
        statusBadgeColor: 'bg-rose-500 text-white',
        classTag: classTagText,
        title: 'Quiz 01: Quy trình phát triển phần mềm & Thiết kế UML',
        duration: '30 phút làm bài',
        questionCount: 20,
        tags: ['Agile / Scrum', 'Use Case & Class Diagram'],
        submittedCount: 50,
        totalStudents: 52,
        timeLeft: formattedTimeLeft,
        progressPercent: 96,
      },
      {
        id: `quiz-se-02-${classId}`,
        code: `QUIZ-SE214-02`,
        type: 'quiz',
        status: 'upcoming',
        statusBadge: 'Sắp diễn ra • Ngày kia: 14:00',
        statusBadgeColor: 'bg-blue-600 text-white',
        classTag: classTagText,
        title: 'Quiz 02: Mẫu thiết kế phần mềm (GoF Design Patterns)',
        examDate: 'Ngày kia: 14:00 - 14:45',
        duration: '45 phút',
        questionCount: 25,
        totalStudents: 52,
        tags: ['Singleton, Factory, Observer'],
      },
      {
        id: `mid-se-2024-${classId}`,
        code: `MID-SE214-2024`,
        type: 'exam',
        status: 'completed',
        statusBadge: 'Đã hoàn thành • Đã công bố điểm',
        statusBadgeColor: 'bg-emerald-600 text-white',
        classTag: classTagText,
        title: 'Kiểm tra Giữa kỳ: Công nghệ Phần mềm & Agile Sprint',
        duration: '60 phút',
        questionCount: 35,
        tags: ['52/52 SV nộp (100%)'],
        submittedCount: 52,
        totalStudents: 52,
        avgScore: 8.5,
        ploRate: 91,
        discriminationIndex: 0.78,
      },
    ];
  }

  // Generic fallback
  return [
    {
      id: `quiz-gen-01-${classId}`,
      code: `QUIZ-${classCode}-01`,
      type: 'quiz',
      status: 'live',
      statusBadge: 'Đang trực tuyến • Live',
      statusBadgeColor: 'bg-rose-500 text-white',
      classTag: classTagText,
      title: subject.defaultQuizTitle,
      duration: '30 phút làm bài',
      questionCount: 20,
      tags: ['Chuẩn PLO', 'Kiểm tra trắc nghiệm'],
      submittedCount: 40,
      totalStudents: 50,
      timeLeft: formattedTimeLeft,
      progressPercent: 80,
    },
    {
      id: `mid-gen-2024-${classId}`,
      code: `MID-${classCode}-2024`,
      type: 'exam',
      status: 'upcoming',
      statusBadge: 'Sắp diễn ra • Lịch thi định kỳ',
      statusBadgeColor: 'bg-blue-600 text-white',
      classTag: classTagText,
      title: `Kiểm tra Giữa kỳ: Đánh giá Năng lực Tổng hợp (${classCode})`,
      examDate: 'Thứ 6 tuần tới: 08:00',
      duration: '60 phút',
      questionCount: 30,
      totalStudents: 50,
      tags: ['Đề thi chính thức'],
    },
  ];
}
