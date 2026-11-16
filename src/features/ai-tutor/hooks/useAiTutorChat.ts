'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { streamChat } from '../services/socratic-chat.service';

interface UseAiTutorChatProps {
  activeSession: ChatSession | null;
  onUpdateSessionMessages: (sessionId: string, messages: ChatMessage[], newTitle?: string) => void;
}

export function useAiTutorChat({
  activeSession,
  onUpdateSessionMessages,
}: UseAiTutorChatProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  const scrollToBottom = useCallback(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages?.length, isTyping, scrollToBottom]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen to browser fullscreen change event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Send message handler using real Socratic AI stream
  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const textToSend = (overrideText ?? inputText).trim();
      if (!textToSend || !activeSession || isTyping) return;

      setInputText('');

      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const userMessage: ChatMessage = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        content: textToSend,
        timestamp: timeStr,
      };

      const updatedMessages = [...activeSession.messages, userMessage];
      const isFirstMessage = activeSession.messages.length === 0;
      const newTitle = isFirstMessage
        ? textToSend.slice(0, 38) + (textToSend.length > 38 ? '...' : '')
        : undefined;

      onUpdateSessionMessages(activeSession.id, updatedMessages, newTitle);
      setIsTyping(true);

      const aiMsgId = 'ai-' + Date.now();
      let accumulated = '';
      let hasAdded = false;

      await streamChat(
        {
          message: textToSend,
          session_id: activeSession.id,
        },
        {
          onToken: (delta) => {
            accumulated += delta;
            setIsTyping(false);
            if (!hasAdded) {
              hasAdded = true;
              onUpdateSessionMessages(activeSession.id, [
                ...updatedMessages,
                {
                  id: aiMsgId,
                  sender: 'ai',
                  content: accumulated,
                  timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            } else {
              onUpdateSessionMessages(
                activeSession.id,
                updatedMessages.map((m) => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
              );
            }
            scrollToBottom();
          },
          onDone: (data) => {
            setIsTyping(false);
            const finalContent = data.full_content || accumulated;
            onUpdateSessionMessages(activeSession.id, [
              ...updatedMessages,
              {
                id: data.assistant_message_id || aiMsgId,
                sender: 'ai',
                content: finalContent,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            scrollToBottom();
          },
          onError: (err) => {
            setIsTyping(false);
            onUpdateSessionMessages(activeSession.id, [
              ...updatedMessages,
              {
                id: 'ai-err-' + Date.now(),
                sender: 'ai',
                content: `⚠️ Kết nối tới máy chủ AI Socratic bị gián đoạn: ${err.message}`,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            scrollToBottom();
          },
        }
      );
    },
    [inputText, activeSession, isTyping, onUpdateSessionMessages, scrollToBottom]
  );

  // Copy code helper
  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    });
  }, []);

  return {
    inputText,
    setInputText,
    isTyping,
    isFullscreen,
    toggleFullscreen,
    copiedCodeId,
    copyCode,
    sendMessage,
    threadEndRef,
  };
}
