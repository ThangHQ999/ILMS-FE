'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/axios';
import { MarkdownContent } from '@/components/shared';
import type { ApiResponse } from '@/types/common';

interface CourseAiTutorTabProps {
  courseName: string;
  subjectCode: string;
  materialIds?: string[];
  initialPrompt?: string | null;
  onConsumeInitialPrompt?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function CourseAiTutorTab({
  courseName,
  subjectCode,
  materialIds = [],
  initialPrompt,
  onConsumeInitialPrompt,
}: CourseAiTutorTabProps) {
  const t = useTranslations('courses.detail');
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputVal(initialPrompt);
      onConsumeInitialPrompt?.();
    }
  }, [initialPrompt, onConsumeInitialPrompt]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là **Trợ lý AI Socratic** cho môn **${courseName}** (\`${subjectCode}\`). Bạn đang cần giải thích khái niệm, ôn tập hay gợi mở bài tập nào?`,
      timestamp: 'Sẵn sàng',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_PROMPTS = [
    `Tóm tắt các khái niệm trọng tâm của môn ${courseName}`,
    'Đặt câu hỏi gợi mở giúp tôi tự kiểm tra kiến thức chương hiện tại',
    'Giải thích từng bước một bài tập tiêu biểu trong tài liệu môn học',
  ];

  // Load latest chat session for this subjectCode: GET /api/v1/student/chat/sessions?subject={subjectCode}
  useEffect(() => {
    if (!subjectCode) return;
    let isCancelled = false;

    async function loadSessionHistory() {
      try {
        const { data } = await api.get<ApiResponse<unknown>>('/student/chat/sessions', {
          params: { subject: subjectCode },
        });
        const raw = data?.data ?? data;
        const sessions = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { content?: unknown[] }).content)
            ? (raw as { content: unknown[] }).content
            : raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown[] }).items)
              ? (raw as { items: unknown[] }).items
              : [];

        if (isCancelled || sessions.length === 0) return;

        const latest = sessions[0] as Record<string, unknown>;
        const latestId = latest.id || latest.sessionId || latest.session_id;
        if (!latestId) return;

        const resolvedSessionId = String(latestId);
        setSessionId(resolvedSessionId);

        // Load messages of latest session
        const { data: detailRes } = await api.get<ApiResponse<unknown>>(
          `/student/chat/sessions/${resolvedSessionId}`
        );
        if (isCancelled) return;
        const detailRaw = detailRes?.data ?? detailRes;
        const rawMessages = Array.isArray(detailRaw)
          ? detailRaw
          : detailRaw && typeof detailRaw === 'object'
            ? ((detailRaw as { messages?: unknown[] }).messages ?? [])
            : [];

        if (rawMessages.length > 0) {
          const mapped: ChatMessage[] = rawMessages.map((item, idx) => {
            const rec = item as Record<string, unknown>;
            const role = String(rec.role ?? rec.sender ?? 'assistant').toLowerCase();
            return {
              id: String(rec.id ?? `hist-${idx}`),
              sender: role === 'user' || role === 'student' ? 'user' : 'ai',
              text: String(rec.content ?? rec.message ?? rec.text ?? ''),
              timestamp: rec.createdAt ? String(rec.createdAt) : '',
            };
          });
          setMessages(mapped);
        }
      } catch {
        // Keep welcome message when no prior session exists
      }
    }

    loadSessionHistory();
    return () => {
      isCancelled = true;
    };
  }, [subjectCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Vừa xong',
    };
    const aiMsgId = `msg-ai-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: aiMsgId, sender: 'ai', text: '', timestamp: 'Đang trả lời...' },
    ]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const response = await fetch(`${baseUrl}/student/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: text,
          ...(sessionId ? { session_id: sessionId } : {}),
          subject: subjectCode,
          ...(materialIds.length > 0 ? { material_ids: materialIds } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errText = `Không thể kết nối Trợ lý AI (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson?.message) errText = String(errJson.message);
        } catch {}
        throw new Error(errText);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Trình duyệt không hỗ trợ luồng SSE ReadableStream.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulated = '';
      let currentEvent = 'message';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            currentEvent = 'message';
            continue;
          }
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }
          if (!trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          let parsedObj: Record<string, unknown> | null = null;
          try {
            const candidate = JSON.parse(dataStr);
            if (candidate && typeof candidate === 'object') {
              parsedObj = candidate as Record<string, unknown>;
            }
          } catch {
            // Plain text delta
          }

          if (parsedObj) {
            const newSid = parsedObj.session_id ?? parsedObj.sessionId;
            if (newSid && !sessionId) {
              setSessionId(String(newSid));
            }
            if (currentEvent === 'session_init') continue;

            const delta =
              parsedObj.delta ??
              parsedObj.token ??
              parsedObj.content ??
              parsedObj.chunk ??
              parsedObj.text ??
              '';
            if (typeof delta === 'string' && delta.length > 0) {
              accumulated += delta;
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulated } : m))
              );
            }
          } else if (dataStr) {
            accumulated += dataStr;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulated } : m))
            );
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text:
                  accumulated ||
                  'AI đã hoàn tất phản hồi nhưng không có nội dung văn bản.',
                timestamp: 'Vừa xong',
              }
            : m
        )
      );
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const errMsg =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi kết nối Trợ lý AI.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, text: `⚠️ ${errMsg}`, timestamp: 'Lỗi' } : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-slate-300 dark:border-slate-700 shadow-xs flex flex-col h-[650px] overflow-hidden">
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
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isAi
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60'
                    : 'bg-blue-600 text-white whitespace-pre-wrap'
                }`}
              >
                {isAi ? (
                  <MarkdownContent content={m.text || (isTyping ? '...' : '')} />
                ) : (
                  m.text
                )}
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
        <div ref={messagesEndRef} />
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

