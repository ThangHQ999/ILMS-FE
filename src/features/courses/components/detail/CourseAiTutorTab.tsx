'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CourseAiTutorTabProps {
  courseName: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function CourseAiTutorTab({ courseName }: CourseAiTutorTabProps) {
  const t = useTranslations('courses.detail');
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Xin chào thầy/cô! Tôi là Trợ lý ảo AI Socratic chuyên biệt cho môn học "${courseName}". Tôi đã lập chỉ mục toàn bộ slide, đề cương và mã nguồn bài tập. Tôi có thể hỗ trợ thầy/cô tạo câu hỏi gợi mở tư duy, giải thích thuật toán hoặc tạo đề kiểm tra nhanh theo chuẩn ABET. Thầy/cô cần tôi trợ giúp nội dung nào hôm nay?`,
      timestamp: 'Vừa xong',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const SUGGESTED_PROMPTS = [
    'Giải thích trực quan phép xoay kép (Double Rotation) của Cây AVL',
    'Tại sao bộ nhớ của Segment Tree cần tối đa 4N phần tử?',
    'Tạo 3 câu trắc nghiệm mức độ Vận dụng cao cho Dijkstra',
  ];

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = '';
      if (text.includes('Cây AVL') || text.includes('xoay')) {
        aiReply = `**Phân tích Socratic về Cây AVL:**\n\nPhép xoay kép (Left-Right hoặc Right-Left) xảy ra khi node con bị lệch "dạng gấp khúc" (zig-zag). Thay vì chỉ xoay 1 lần làm cây vẫn mất cân bằng, ta cần:\n1. **Bước 1**: Xoay đơn tại node con để duỗi thẳng nhánh (thành dạng thẳng hàng Left-Left hoặc Right-Right).\n2. **Bước 2**: Xoay đơn tại node cha để đưa node trung gian lên làm gốc mới.\n\n*Gợi ý gợi mở cho sinh viên:* Thầy/cô có muốn yêu cầu sinh viên vẽ cây trước và sau bước xoay 1 để tự nhận thấy vì sao độ cao cân bằng trở lại?`;
      } else if (text.includes('Segment Tree') || text.includes('4N')) {
        aiReply = `**Về độ phức tạp không gian 4N của Segment Tree:**\n\nNếu số lượng lá là N, trong trường hợp xấu nhất N không phải là lũy thừa của 2, cây phân đoạn sẽ mở rộng xuống tầng thứ $\\lceil \\log_2 N \\rceil + 1$. Tổng số node trên một cây nhị phân hoàn chỉnh có chiều cao $h$ là $2^{h+1} - 1 < 4N$.\n\nThầy/cô có thể giao bài tập cho sinh viên kiểm chứng với N = 5 (cần mảng kích thước 16).`;
      } else {
        aiReply = `Cảm ơn thầy/cô! Yêu cầu "${text}" đã được AI phân tích đối chiếu với đề cương học phần. Hệ thống đã chuẩn bị câu trả lời theo phương pháp Socratic để kích thích tư duy giải quyết vấn đề của người học. Thầy/cô có muốn tích hợp nội dung này vào bài giảng tiếp theo không?`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{t('aiTutorTitle')}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('aiTutorSubtitle')}
            </p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
          Chế độ Socratic 24/7
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                isAi ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isAi
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isAi ? (
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                ) : (
                  'Tôi'
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isAi
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>AI Socratic đang tư duy và soạn phản hồi...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Gợi ý câu hỏi:</span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={t('aiTutorPlaceholder')}
          className="flex-1 px-4 py-2.5 rounded-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 disabled:opacity-40"
        >
          <span>{t('aiSend')}</span>
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </form>
    </div>
  );
}
