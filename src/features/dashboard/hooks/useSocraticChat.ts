'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import { INITIAL_CHAT_MESSAGES, sendChatMessage } from '../services/ai-chat.service';

export function useSocraticChat(userName: string = 'Nhật Minh') {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const streamEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text !== undefined ? text : inputText).trim();
      if (!content || isTyping) return;

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

      try {
        const reply = await sendChatMessage(content);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          senderName: 'Trợ lý Socratic',
          content: reply,
          timestamp: 'Vừa xong',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          senderName: 'Trợ lý Socratic',
          content: 'Xin lỗi, trợ lý AI đang bận xử lý dữ liệu. Vui lòng thử lại sau ít giây.',
          timestamp: 'Vừa xong',
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
        scrollToBottom();
      }
    },
    [inputText, isTyping, userName, scrollToBottom]
  );

  const clearHistory = useCallback(() => {
    setMessages(INITIAL_CHAT_MESSAGES);
  }, []);

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    clearHistory,
    streamEndRef,
  };
}
