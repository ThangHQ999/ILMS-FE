import { ChatMessage } from '../types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-initial',
    sender: 'ai',
    senderName: 'Trợ lý Socratic',
    content:
      'Chào buổi sáng! Em muốn giải quyết nốt bài tập **Cây nhị phân tìm kiếm (BST)** hôm qua chứ? Anh đã chuẩn bị sẵn sơ đồ minh họa và 3 câu hỏi gợi mở tư duy rồi đấy.',
    timestamp: '08:45 • Trợ lý Socratic',
    attachment: {
      title: 'Cây BST minh họa mẫu',
      subtitle: '3 Nút gốc • Thao tác Right Rotation',
      icon: 'account_tree',
      actionText: 'Xem',
    },
  },
];

export async function sendChatMessage(prompt: string): Promise<string> {
  // Simulate intelligent response delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const lower = prompt.toLowerCase();
  if (lower.includes('xoay') || lower.includes('rotation') || lower.includes('avl')) {
    return `### Phân tích Thao tác Xoay (AVL Tree Rotation) 🌳

Ý tưởng rất hay! Hãy cùng suy luận theo phương pháp Socratic nhé:

Khi thực hiện **Right Rotation** tại nút $P$ (với con trái là $Q$):
1. Nút con $Q$ sẽ trở thành **gốc mới** của cây con.
2. Cây con bên phải của $Q$ (gọi là $B$) sẽ trở thành **cây con bên trái của $P$**.
3. Nút $P$ chuyển thành **cây con bên phải của $Q$**.

\`\`\`cpp
// Minh họa xoay phải Right-Rotate (y)
Node* rightRotate(Node* y) {
    Node* x = y->left;
    Node* T2 = x->right;

    // Thực hiện xoay
    x->right = y;
    y->left = T2;

    // Cập nhật lại chiều cao
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;

    return x; // Gốc mới
}
\`\`\`

> 💡 **Câu hỏi suy ngẫm:** Sau khi xoay phải, thứ tự duyệt trung thứ tự (*In-order traversal*) của các nút có bị thay đổi không? Tại sao?`;
  }

  if (lower.includes('quiz') || lower.includes('câu hỏi')) {
    return `### Câu hỏi ôn tập Quick-Quiz 🎯

Hãy kiểm tra lại độ hiểu biết của bạn về **Độ phức tạp Cây nhị phân**:

- **Câu hỏi:** Trong trường hợp xấu nhất (*Worst-case*), độ phức tạp thời gian khi tìm kiếm trên Cây nhị phân tìm kiếm thông thường (không tự cân bằng) là bao nhiêu?
  - A. $O(1)$
  - B. $O(\\log N)$
  - C. $O(N)$
  - D. $O(N \\log N)$

*Gợi ý:* Hãy nghĩ đến trường hợp các phần tử được chèn vào cây theo thứ tự tăng dần liên tục!`;
  }

  return `Ý tưởng rất thú vị! Hãy thử nghĩ xem: Khi thao tác với cấu trúc dữ liệu này, điểm mấu chốt để giữ cho thời gian truy vấn đạt mức **$O(\\log N)$** là gì?

- Nếu cây bị lệch thành một danh sách liên kết thì điều gì sẽ xảy ra?
- Thao tác cân bằng lại cây sẽ tiêu tốn bao nhiêu chi phí thời gian?

Em hãy thử triển khai thử hoặc chia sẻ đoạn code em đang băn khoăn để anh cùng phân tích nhé!`;
}
