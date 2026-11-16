'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CourseSocraticAiPopoverProps {
  courseCode?: string;
  currentLessonTitle?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function CourseSocraticAiPopover({
  courseCode = 'CS-202',
  currentLessonTitle = 'Bài 3.2 TCP Handshake',
}: CourseSocraticAiPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ giảng Socratic AI được đồng bộ với đề cương bài giảng ${courseCode} của TS. Lê Hoàng Nam. Bạn đang vướng mắc ở phần nào trong Lab 01 hoặc kiến thức TCP/IP hôm nay?`,
      timestamp: 'Vừa xong',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulated Socratic RAG AI response
    setTimeout(() => {
      let replyText = '';
      if (text.toLowerCase().includes('tcp') || text.toLowerCase().includes('handshake')) {
        replyText =
          'Giải đáp Socratic: TCP cần 3 bước (SYN, SYN-ACK, ACK) để cả hai bên Máy khách và Máy chủ cùng xác nhận được khả năng Gửi và Nhận của nhau, đồng thời đồng bộ hóa số thứ tự Sequence Number ngẫu nhiên ban đầu (ISN), ngăn chặn các gói tin trùng lặp cũ từ phiên trước gây nhầm lẫn.';
      } else if (text.toLowerCase().includes('dijkstra') || text.toLowerCase().includes('ospf')) {
        replyText =
          'Giải đáp Socratic: Thuật toán Dijkstra tìm cây đường đi ngắn nhất (SPF Tree) từ một router gốc đến toàn bộ mạng. Mỗi router chạy Dijkstra độc lập dựa trên cơ sở dữ liệu trạng thái liên kết (LSDB) nhận được từ các gói LSA trong vùng OSPF.';
      } else {
        replyText = `Giải đáp Socratic: Trong bối cảnh học phần ${courseCode}, câu hỏi "${text}" liên quan trực tiếp đến cơ chế kiểm soát luồng và truyền tin tin cậy. Bạn muốn làm rõ hơn về góc độ mô phỏng gói tin Wireshark hay tính toán lý thuyết?`;
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 rounded-full border border-blue-400/30 bg-[#0d1c32] py-2.5 pl-4 pr-5 text-white shadow-[0_12px_24px_-4px_rgba(10,25,47,0.35)] transition-all hover:scale-[1.02] hover:border-blue-400 dark:bg-card dark:border-blue-500/40"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0059bb]"></span>
          </span>
          <span className="material-symbols-outlined text-[22px] text-blue-300">psychology</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-white">
              Hỏi AI về {currentLessonTitle}
            </span>
            <span className="text-[10px] text-blue-200/80 leading-none">Socratic RAG Copilot</span>
          </div>
        </button>
      </div>

      {/* Popover Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_32px_-8px_rgba(10,25,47,0.25)] dark:bg-card">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#0d1c32] p-4 text-white dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <div className="text-sm font-bold leading-tight text-white">Socratic AI Tutor</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Graph RAG: {courseCode} Syllabus
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto bg-muted/30 p-4 text-xs">
            {/* Quick Prompts */}
            <div className="rounded-xl border border-border/60 bg-card p-3 shadow-xs">
              <p className="mb-2 font-semibold text-[#0059bb] dark:text-blue-400">
                Gợi ý câu hỏi nhanh:
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSend('Giải thích tại sao TCP cần 3 bước bắt tay thay vì 2 bước?')
                  }
                  className="rounded border border-border/50 bg-muted/40 p-1.5 text-left text-[11px] text-foreground transition-colors hover:bg-muted"
                >
                  • Tại sao TCP cần 3-Way Handshake thay vì 2?
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSend('Thuật toán Dijkstra tính đường đi ngắn nhất hoạt động ra sao trong OSPF?')
                  }
                  className="rounded border border-border/50 bg-muted/40 p-1.5 text-left text-[11px] text-foreground transition-colors hover:bg-muted"
                >
                  • Giải thích thuật toán Dijkstra trong định tuyến OSPF?
                </button>
              </div>
            </div>

            {/* Message List */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl p-3 shadow-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'self-end bg-[#0059bb] text-white max-w-[85%]'
                    : 'self-start bg-card border border-border/70 text-foreground max-w-[95%]'
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Field */}
          <div className="flex items-center gap-2 border-t border-border bg-card p-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI về giao thức mạng, RFC..."
              className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0059bb] text-white transition-colors hover:bg-[#004bb0]"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

