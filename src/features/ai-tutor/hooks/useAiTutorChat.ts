'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { generateSocraticAiReply, saveChatSessions } from '../services/ai-tutor.service';

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

  // Send message handler
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

      // Simulate Socratic AI processing and reasoning
      setTimeout(() => {
        const aiMessage = generateSocraticAiReply(textToSend);
        const finalMessages = [...updatedMessages, aiMessage];
        onUpdateSessionMessages(activeSession.id, finalMessages);
        setIsTyping(false);
      }, 750);
    },
    [inputText, activeSession, isTyping, onUpdateSessionMessages]
  );

  // Copy code helper
  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    });
  }, []);

  // Export session transcript
  const exportSessionTranscript = useCallback(() => {
    if (!activeSession) return;
    const lines = [
      `# BIÊN BẢN HỌC TẬP: ${activeSession.title}`,
      `Thời gian: ${new Date().toLocaleString('vi-VN')}`,
      `Hệ thống: ILMS Socratic AI Tutor`,
      `==========================================\n`,
    ];

    activeSession.messages.forEach((msg) => {
      const senderName = msg.sender === 'user' ? 'HỌC VIÊN' : 'SOCRATIC AI';
      lines.push(`[${msg.timestamp}] ${senderName}:\n${msg.content}\n`);
      if (msg.codeSnippet) {
        lines.push(`\`\`\`${msg.codeSnippet.language}\n${msg.codeSnippet.code}\n\`\`\`\n`);
      }
      if (msg.socraticQuestion) {
        lines.push(`> Câu hỏi tư duy: ${msg.socraticQuestion}\n`);
      }
      lines.push('------------------------------------------');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^\w\s\u00C0-\u1EF9]/g, '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeSession]);

  return {
    inputText,
    setInputText,
    isTyping,
    isFullscreen,
    copiedCodeId,
    threadEndRef,
    sendMessage,
    toggleFullscreen,
    copyCode,
    exportSessionTranscript,
  };
}
