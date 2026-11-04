import { ChatMessage, ChatSession } from '../types';
import { INITIAL_MOCK_SESSIONS } from '../constants';

const SESSIONS_STORAGE_KEY = 'ilms_ai_tutor_sessions';

export async function getChatSessions(): Promise<ChatSession[]> {
  if (typeof window === 'undefined') return INITIAL_MOCK_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SESSIONS));
      return INITIAL_MOCK_SESSIONS;
    }
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return INITIAL_MOCK_SESSIONS;
  }
}

export async function saveChatSessions(sessions: ChatSession[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore storage write error
  }
}

export function generateSocraticAiReply(userPrompt: string): ChatMessage {
  const isDuplicateElementQuery = userPrompt.toLowerCase().includes('trùng lặp') || userPrompt.toLowerCase().includes('duplicate');
  const isDijkstra = userPrompt.toLowerCase().includes('dijkstra');
  const isSegmentTree = userPrompt.toLowerCase().includes('segment tree');
  const isAvl = userPrompt.toLowerCase().includes('avl') || userPrompt.toLowerCase().includes('red-black');
  const isDp = userPrompt.toLowerCase().includes('quy hoạch động') || userPrompt.toLowerCase().includes('dynamic programming');

  let content = '';
  let codeSnippet = undefined;
  let socraticQuestion = undefined;

  if (isDuplicateElementQuery) {
    content = `Rất chính xác! Khi mảng có nhiều giá trị trùng lặp, giải pháp **3-Way Partition (Thuật toán Cờ Hà Lan của Dijkstra)** phân mảng thành 3 đoạn:
- \`< Pivot\`
- \`== Pivot\`
- \`> Pivot\`

Các phần tử bằng Pivot không cần phải đệ quy thêm, giúp thời gian xử lý mảng trùng lặp đạt tối ưu tiệm cận **O(N)** thay vì bị suy biến thành **O(N²)**.`;
  } else if (isDijkstra) {
    content = `Chào em! Thuật toán Dijkstra tìm đường đi ngắn nhất từ một đỉnh nguồn tới tất cả các đỉnh còn lại trên đồ thị có trọng số không âm theo chiến lược Tham lam (Greedy).

**Tại sao cần hàng đợi ưu tiên (Priority Queue / Min-Heap)?**
- Nếu dùng mảng tìm đỉnh có khoảng cách nhỏ nhất: độ phức tạp là \`O(V²)\`.
- Khi dùng Min-Heap: mỗi lần trích xuất đỉnh mất \`O(log V)\`, tổng thời gian giảm xuống \`O((V + E) log V)\`, cực kỳ tối ưu cho đồ thị thưa!`;
    socraticQuestion = 'Theo em, nếu đồ thị xuất hiện cạnh có trọng số âm nhưng không tạo thành chu trình âm, thuật toán Dijkstra có còn đảm bảo tính đúng đắn không? Tại sao?';
    codeSnippet = {
      filename: 'Dijkstra_PriorityQueue.cpp',
      language: 'cpp',
      code: `// Cài đặt Dijkstra với std::priority_queue
void dijkstra(int start, int n, vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(n + 1, 1e9);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}`,
    };
  } else if (isSegmentTree) {
    content = `Một câu hỏi rất hay về kiến trúc bộ nhớ! Khi biểu diễn **Segment Tree** hoàn chỉnh trên mảng 1 chiều:
1. Số lá ở tầng cuối cùng có thể lên tới \`N\` lá.
2. Nếu \`N\` không phải lũy thừa của 2 (ví dụ: \`N = 2^k + 1\`), cây cần mở rộng thêm một tầng độ sâu \`k + 1\` để chứa các nút con.
3. Tổng số nút của một cây nhị phân đầy đủ có thể đạt tới xấp xỉ \`2^{k+2} - 1 < 4*N\`.

Vì vậy, kích thước mảng an toàn tối thiểu luôn là **4*N** để tránh hoàn toàn lỗi \`Out of Bounds\` khi truy cập chỉ số \`2*id\` và \`2*id + 1\`.`;
    socraticQuestion = 'Nếu em sử dụng kỹ thuật con trỏ động (Dynamic Segment Tree) hoặc Segment Tree nén, kích thước bộ nhớ sẽ thay đổi như thế nào so với mảng tĩnh 4*N?';
  } else if (isAvl || isDp) {
    content = `Thầy ghi nhận thắc mắc của em. Hãy cùng phân tích bản chất thuật toán theo phương pháp phản biện từng bước:

Trong khoa học máy tính, mọi cấu trúc dữ liệu và giải thuật tối ưu đều là sự đánh đổi (trade-off) giữa **Thời gian tính toán (Time Complexity)** và **Không gian lưu trữ (Space Complexity)**.

Em hãy thử xác định cấu trúc con tối ưu (Optimal Substructure) và điều kiện cơ sở (Base Case) trước nhé!`;
    socraticQuestion = 'Em hãy thử viết hệ thức truy hồi của bài toán hoặc cho biết thao tác nào đang tốn nhiều chi phí nhất trong đoạn mã của em?';
  } else {
    content = `Cảm ơn câu hỏi của em: "${userPrompt}". 

Để cùng tìm ra bản chất vấn đề, thầy muốn hỏi em: Em đã tiếp cận bài toán này từ góc độ nào rồi? Em nghĩ bước đầu tiên chúng ta cần phân tích là gì?`;
    socraticQuestion = 'Em hãy thử chia sẻ ý tưởng sơ khai hoặc đoạn mã ban đầu em đã viết để chúng ta cùng phản biện nhé!';
  }

  return {
    id: 'msg-' + Date.now(),
    sender: 'ai',
    content,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    codeSnippet,
    socraticQuestion,
  };
}
