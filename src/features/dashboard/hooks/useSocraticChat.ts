'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  INITIAL_CHAT_MESSAGES,
  streamSocraticChatMessage,
  submitChatMessageFeedback,
} from '../services/ai-chat.service';

const CHAT_STORAGE_KEY = 'ilms_socratic_coach_messages';
const SESSION_ID_KEY = 'ilms_socratic_coach_session_id';

interface UseSocraticChatOptions {
  userName?: string;
  isAuthenticated?: boolean;
}

export function useSocraticChat(
  userNameOrOptions: string | UseSocraticChatOptions = 'Học viên'
) {
  const userName =
    typeof userNameOrOptions === 'string'
      ? userNameOrOptions
      : userNameOrOptions.userName || 'Học viên';

  const isAuthenticated =
    typeof userNameOrOptions === 'object' && userNameOrOptions.isAuthenticated !== undefined
      ? userNameOrOptions.isAuthenticated
      : true;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CHAT_MESSAGES;
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((m) => {
            if (!m) return false;
            const lowerContent = typeof m.content === 'string' ? m.content.toLowerCase() : '';
            if (
              lowerContent.includes('tree balancing theorem summary') ||
              lowerContent.includes('tóm tắt định lý cân bằng cây')
            ) {
              return false;
            }
            return m.sender === 'user' || (m.content && m.content.trim()) || m.attachment;
          });
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem(SESSION_ID_KEY) || undefined;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const streamEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Sync sessionId to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  }, [sessionId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text !== undefined ? text : inputText).trim();
      if (!content || isTyping) return;

      if (!isAuthenticated) {
        // Chặn gửi khi chưa đăng nhập
        return;
      }

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        senderName: userName,
        content,
        timestamp: 'Vừa xong',
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);
      scrollToBottom();

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const aiMsgId = `ai-${Date.now()}`;
      let accumulated = '';
      let hasAddedAiMsg = false;

      await streamSocraticChatMessage(
        {
          message: content,
          sessionId,
        },
        {
          onSessionInit: (newSessionId) => {
            setSessionId(newSessionId);
          },
          onToken: (delta) => {
            accumulated += delta;
            if (!accumulated.trim()) return;
            setIsTyping(false);

            if (!hasAddedAiMsg) {
              hasAddedAiMsg = true;
              setMessages((prev) => [
                ...prev,
                {
                  id: aiMsgId,
                  sender: 'ai',
                  senderName: 'Trợ lý Socratic',
                  content: accumulated,
                  timestamp: 'Vừa xong',
                },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
              );
            }
            scrollToBottom();
          },
          onDone: (full, assistantMessageId) => {
            setIsTyping(false);
            const finalText = full || accumulated;
            if (!finalText.trim()) return;
            const targetId = assistantMessageId || aiMsgId;
            if (!hasAddedAiMsg) {
              setMessages((prev) => [
                ...prev,
                {
                  id: targetId,
                  sender: 'ai',
                  senderName: 'Trợ lý Socratic',
                  content: finalText,
                  timestamp: 'Vừa xong',
                },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, id: targetId, content: finalText } : m
                )
              );
            }
            scrollToBottom();
          },
          onError: (err) => {
            setIsTyping(false);
            const errMsg = err instanceof Error ? err.message : String(err);
            const displayError = `⚠️ **Kết nối tới máy chủ AI Socratic bị gián đoạn.**\n\n*Chi tiết:* ${errMsg}\n\nVui lòng kiểm tra lại đường truyền hoặc dịch vụ backend và thử lại.`;

            if (!hasAddedAiMsg) {
              setMessages((prev) => [
                ...prev,
                {
                  id: aiMsgId,
                  sender: 'ai',
                  senderName: 'Trợ lý Socratic',
                  content: displayError,
                  timestamp: 'Vừa xong',
                },
              ]);
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, content: `${m.content}\n\n${displayError}` }
                    : m
                )
              );
            }
            scrollToBottom();
          },
        },
        controller.signal
      );
    },
    [inputText, isTyping, userName, sessionId, isAuthenticated, scrollToBottom]
  );

  const rateMessage = useCallback(
    async (messageId: string, rating: 'LIKE' | 'DISLIKE') => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, feedback_rating: m.feedback_rating === rating ? null : rating }
            : m
        )
      );

      try {
        await submitChatMessageFeedback(messageId, rating);
      } catch {
        // silently ignore error on local or offline
      }
    },
    []
  );

  const clearHistory = useCallback(() => {
    setMessages(INITIAL_CHAT_MESSAGES);
    setSessionId(undefined);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
    }
  }, []);

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    rateMessage,
    clearHistory,
    streamEndRef,
    sessionId,
  };
}
