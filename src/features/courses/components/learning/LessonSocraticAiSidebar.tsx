'use client';

import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp?: string;
  codeSnippet?: string;
  reference?: string;
}

interface LessonSocraticAiSidebarProps {
  onClose: () => void;
  onOpenKnowledgeGraph?: () => void;
  onToast: (msg: string) => void;
}

export function LessonSocraticAiSidebar({
  onClose,
  onOpenKnowledgeGraph,
  onToast,
}: LessonSocraticAiSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Chào Nhật Minh! Thầy AI nhận thấy em đang theo dõi sơ đồ trao đổi Sequence Number giữa Client và Server tại mốc 14:20.\n\nEm có muốn thử giải thích tại sao ở bước thứ 3, gói tin ACK của Client lại được phép bắt đầu mang kèm dữ liệu thực (Piggybacking) mà không cần đợi một thông điệp riêng khác?',
      reference: 'Được xác thực bởi Giáo trình Kurose & Ross (Computer Networking: A Top-Down Approach)',
    },
    {
      id: 'm-2',
      sender: 'user',
      text: 'Có phải vì lúc này cả hai bên đã biết số Sequence của nhau rồi nên trạng thái kết nối đã là ESTABLISHED không ạ?',
      timestamp: '14:22',
    },
    {
      id: 'm-3',
      sender: 'ai',
      text: 'Chính xác tuyệt vời! 🎯 Khi Client gửi bước thứ 3:\n\nClient: ACK = Server_ISN + 1\nState: ESTABLISHED (Client side)\n\nVì phía Client đã nhận được phản hồi SYN-ACK từ Server ở bước 2, nó đã hoàn toàn tin tưởng kênh truyền chiều từ nó sang Server đã thông suốt. Do đó nó có thể đẩy dữ liệu HTTP Request đi ngay lập tức mà không lãng phí 1 lượt RTT (Round Trip Time)!',
      reference: 'RFC 793 (TCP Protocol Specification) & RFC 9293',
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendQuestion = (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    // AI Socratic simulation reply
    setTimeout(() => {
      let aiText = '';
      if (q.includes('2 bước')) {
        aiText =
          'Câu hỏi rất sâu sắc! 💡 Nếu chỉ dùng 2 bước bắt tay: Giả sử một gói tin SYN cũ của Client bị trễ trong mạng. Khi gói tin này đến Server sau khi Client đã từ bỏ, Server sẽ lầm tưởng là kết nối mới và cấp phát bộ đệm tiếp nhận (rcv_wnd). Khi đó Server bị treo một kết nối ma (Half-open Connection) gây lãng phí tài nguyên và có thể bị lợi dụng để tấn công cạn kiệt tài nguyên!';
      } else if (q.includes('SYN Flood')) {
        aiText =
          'Trong tấn công SYN Flood 🛡️, kẻ tấn công gửi ồ ạt các gói tin SYN với địa chỉ IP giả mạo. Server cấp phát hàng loạt hàng đợi kết nối bán mở (SYN backlog queue) và chờ gói tin ACK trong vô vọng cho đến khi tràn bộ đệm. Giải pháp phòng thủ chuẩn là sử dụng SYN Cookies (không cấp phát tài nguyên cho đến khi nhận được ACK hợp lệ).';
      } else if (q.includes('Quiz') || q.includes('kiểm tra')) {
        aiText =
          '🧪 Thử thách nhanh nhé: Giả sử Client chọn ISN = 1000, Server chọn ISN = 5000. Trong gói tin thứ 2 (SYN-ACK) từ Server gửi về cho Client, giá trị Sequence Number và Acknowledgment Number lần lượt là bao nhiêu?\n\nA. Seq=1001, Ack=5000\nB. Seq=5000, Ack=1001\nC. Seq=5001, Ack=1000\nD. Seq=1000, Ack=5001\n\nEm chọn đáp án nào?';
      } else {
        aiText = `Cảm ơn em đã đặt câu hỏi: "${q}". Dựa trên đồ thị tri thức tầng Giao vận (Transport Layer), cơ chế TCP luôn ưu tiên tính toàn vẹn (Reliability) thông qua phản hồi ACK tích lũy (Cumulative ACKs) và đồng hồ đo thời gian vòng RTT thích ứng. Em có muốn đào sâu thêm phần nào không?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          reference: 'Trợ lý học thuật Socratic AI • Đối chiếu đồ thị tri thức môn học',
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <aside
      className="w-96 shrink-0 bg-white dark:bg-slate-900 border-l-[3px] border-slate-300 dark:border-slate-700 shadow-lg flex flex-col transition-all duration-300 z-30 h-[calc(100vh-8rem)] sticky top-32"
      id="right-sidebar"
    >
      {/* Socratic AI Header */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Socratic AI Tutor
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Graph RAG</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Phản biện gợi mở &amp; Đàm thoại học thuật
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Đóng bảng Socratic AI"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Graph RAG Linked Context Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700">
          <span className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">
              hub
            </span>
            <span>
              Khung tri thức: <strong className="text-blue-600 dark:text-blue-400">12 nodes</strong> liên kết
            </span>
          </span>
          <button
            type="button"
            onClick={onOpenKnowledgeGraph || (() => onToast('Mở đồ thị tri thức tầng Transport'))}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer shrink-0 ml-1 text-xs"
          >
            Xem đồ thị
          </button>
        </div>
      </div>

      {/* Chat Conversation Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 text-xs">
        {messages.map((m) => {
          if (m.sender === 'ai') {
            return (
              <div key={m.id} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-2xl rounded-tl-xs p-3 text-slate-800 dark:text-slate-200 flex flex-col gap-1.5 shadow-xs border border-slate-200 dark:border-slate-700">
                  <p className="leading-relaxed whitespace-pre-line text-justify">{m.text}</p>
                  {m.reference && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-medium">
                      <span className="truncate">{m.reference}</span>
                      <span className="material-symbols-outlined text-[13px] text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
                        verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // User message
          return (
            <div key={m.id} className="flex items-start gap-2 justify-end">
              <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3 shadow-xs">
                <p className="leading-relaxed">{m.text}</p>
                {m.timestamp && (
                  <span className="block text-right text-[10px] opacity-75 mt-1 font-mono">
                    {m.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-2.5 text-slate-500 text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Đang đối chiếu tài liệu RFC &amp; Đồ thị tri thức...</span>
            </div>
          </div>
        )}

        {/* Evaluation Prompt Chips */}
        <div className="flex flex-col gap-1.5 pt-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Gợi ý câu hỏi phản biện:
          </span>
          <button
            type="button"
            onClick={() => handleSendQuestion('Tại sao không dùng 2 bước bắt tay?')}
            className="text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-slate-700 dark:text-slate-300 transition-all text-xs font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700 cursor-pointer group"
          >
            <span className="truncate">💡 Tại sao không dùng 2 bước bắt tay?</span>
            <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSendQuestion('Phân tích rủi ro tấn công SYN Flood')}
            className="text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-slate-700 dark:text-slate-300 transition-all text-xs font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700 cursor-pointer group"
          >
            <span className="truncate">🔍 Phân tích rủi ro tấn công SYN Flood</span>
            <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSendQuestion('Cho tôi 1 câu hỏi Quick Quiz kiểm tra kiến thức')}
            className="text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-slate-700 dark:text-slate-300 transition-all text-xs font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700 cursor-pointer group"
          >
            <span className="truncate">🧪 Cho tôi 1 câu hỏi Quick Quiz kiểm tra</span>
            <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      {/* Socratic AI Input Box */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        <div className="relative w-full rounded-xl bg-slate-100 dark:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all p-2 flex flex-col border border-slate-200 dark:border-slate-700">
          <textarea
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi Socratic AI về bài học (Enter để gửi)..."
            rows={2}
            className="w-full bg-transparent resize-none outline-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToast('Kích hoạt micro thu âm câu hỏi...')}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Thu âm giọng nói"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputQuestion((prev) => `${prev}\n\`\`\`python\n# Đoạn code cần hỏi...\n\`\`\``);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Chèn đoạn mã"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSendQuestion()}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="Gửi câu hỏi"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-400">
          Nhấn Shift + Enter để xuống dòng • Powered by Gemini EduTech
        </p>
      </div>
    </aside>
  );
}

