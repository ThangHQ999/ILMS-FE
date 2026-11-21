'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCurrentUser } from '@/features/auth';
import { DEFAULT_SUBJECTS, AI_TUTOR_STORAGE_KEYS } from '../constants';
import { CourseSubject, ChatMessage, SocraticSessionSidebarItem } from '../types';
import {
  useSocraticSessions,
  useSocraticSessionDetail,
  useUpdateSocraticSession,
  useDeleteSocraticSession,
} from '../hooks/useSocraticSessions';
import { useSocraticStream } from '../hooks/useSocraticStream';
import { useSocraticFeedback } from '../hooks/useSocraticFeedback';
import { AiTutorSidebar } from './AiTutorSidebar';
import { AiTutorHeader } from './AiTutorHeader';
import { AiTutorWelcomeCanvas } from './AiTutorWelcomeCanvas';
import { AiTutorChatCanvas } from './AiTutorChatCanvas';
import { AiTutorInputBar } from './AiTutorInputBar';

interface AiTutorPageViewProps {
  sessionId?: string;
}

export function AiTutorPageView({ sessionId: propSessionId }: AiTutorPageViewProps) {
  const router = useRouter();
  const params = useParams();
  const urlSessionId = typeof params?.sessionId === 'string' ? params.sessionId : undefined;
  const routeSessionId = propSessionId || urlSessionId || null;

  const { data: user } = useCurrentUser();
  const userFullName = user
    ? `${user.lastName || ''} ${user.middleName || ''} ${user.firstName || ''}`.trim()
    : 'Trần Nhật Minh';

  const [currentSubject, setCurrentSubject] = useState<CourseSubject>(DEFAULT_SUBJECTS[0]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(routeSessionId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputTextRef = useRef(inputText);
  inputTextRef.current = inputText;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Sync activeSessionId with route when routeSessionId changes
  useEffect(() => {
    setActiveSessionId(routeSessionId);
  }, [routeSessionId]);

  // 1. Load Session History from Backend (Sidebar)
  const { data: sessionsData, isLoading: isLoadingSessions } = useSocraticSessions({
    pageNumber: 0,
    pageSize: 30,
  });

  const sidebarSessions: SocraticSessionSidebarItem[] = useMemo(() => {
    return sessionsData?.items || [];
  }, [sessionsData]);

  // 2. Load Active Session Detail ONLY when an activeSessionId is present
  const { data: sessionDetail, isLoading: isLoadingDetail } =
    useSocraticSessionDetail(activeSessionId);

  const mappedInitialMessages: ChatMessage[] = useMemo(() => {
    if (!activeSessionId || sessionDetail?.id !== activeSessionId || !sessionDetail?.messages) {
      return [];
    }
    return sessionDetail.messages.map((m) => {
      let timeStr = 'Vừa xong';
      if (m.created_at) {
        const d = new Date(m.created_at);
        if (!isNaN(d.getTime())) {
          timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
      }
      return {
        id: m.id,
        session_id: m.session_id,
        sender: m.role === 'USER' ? 'user' : 'ai',
        content: m.content,
        timestamp: timeStr,
        step_number_at_turn: m.step_number_at_turn,
        step_progress: m.step_progress,
        referenced_chunk_ids: m.referenced_chunk_ids,
        referenced_node_ids: m.referenced_node_ids,
        user_feedback: m.user_feedback,
        feedback_rating: m.feedback_rating,
      };
    });
  }, [activeSessionId, sessionDetail]);

  // 3. Mutations for Session & Feedback
  const updateSessionMutation = useUpdateSocraticSession();
  const deleteSessionMutation = useDeleteSocraticSession();
  const feedbackMutation = useSocraticFeedback(activeSessionId);

  // 4. Real-time Socratic SSE Stream
  const {
    messages,
    isStreaming,
    progressState,
    sendMessage: sendStreamMessage,
  } = useSocraticStream({
    sessionId: activeSessionId,
    initialMessages: mappedInitialMessages,
    onSessionCreated: (newId) => {
      setActiveSessionId(newId);
      window.history.replaceState(null, '', `/ai-tutor/${newId}`);
    },
    subject: currentSubject.code,
  });

  // Restore sidebar collapse state & automatically collapse on small screens (< 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        const saved = localStorage.getItem(AI_TUTOR_STORAGE_KEYS.SIDEBAR_COLLAPSED);
        if (saved !== null) {
          setIsSidebarCollapsed(saved === 'true');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global shortcut ⌘K or Ctrl+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        router.push('/ai-tutor');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isStreaming, scrollToBottom]);

  // New Chat handler: navigate to clean /ai-tutor
  const handleNewChat = useCallback(() => {
    setInputText('');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
    router.push('/ai-tutor');
  }, [router]);

  // Select Session handler: navigate to /ai-tutor/{id}
  const handleSelectSession = useCallback(
    (id: string) => {
      setInputText('');
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
      router.push(`/ai-tutor/${id}`);
    },
    [router]
  );

  // Rename Session handler
  const handleRenameSession = useCallback(
    (id: string, newTitle: string) => {
      updateSessionMutation.mutate({ sessionId: id, payload: { title: newTitle } });
    },
    [updateSessionMutation]
  );

  // Delete Session handler
  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSessionMutation.mutate(id, {
        onSuccess: () => {
          if (activeSessionId === id) {
            router.push('/ai-tutor');
          }
        },
      });
    },
    [deleteSessionMutation, activeSessionId, router]
  );

  // Feedback handler
  const handleFeedback = useCallback(
    (messageId: string, rating: 'LIKE' | 'DISLIKE', comment?: string) => {
      feedbackMutation.mutate({
        messageId,
        payload: {
          feedback_rating: rating,
          user_feedback: comment,
        },
      });
    },
    [feedbackMutation]
  );

  // Send message - Sử dụng inputTextRef để hàm giữ nguyên reference khi gõ phím, tránh re-render chat canvas
  const handleSendMessage = useCallback(
    (overrideText?: unknown) => {
      const rawText = typeof overrideText === 'string' ? overrideText : inputTextRef.current;
      const text = rawText.trim();
      if (!text || isStreaming) return;
      setInputText('');
      sendStreamMessage(text);
    },
    [isStreaming, sendStreamMessage]
  );

  // Regenerate last user turn
  const handleRegenerateLast = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUser) handleSendMessage(lastUser.content);
  }, [messages, handleSendMessage]);

  // Copy code helper
  const handleCopyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    });
  }, []);

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

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(AI_TUTOR_STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  }, []);

  // Export transcript
  const handleExportTranscript = useCallback(() => {
    const title = sessionDetail?.title || 'Cuộc đối thoại Socratic AI';
    const lines = [
      `# BIÊN BẢN HỌC TẬP: ${title}`,
      `Thời gian: ${new Date().toLocaleString('vi-VN')}`,
      `Môn học: ${currentSubject.name} (${currentSubject.code})`,
      `==========================================\n`,
    ];
    messages.forEach((msg) => {
      const senderName = msg.sender === 'user' ? 'HỌC VIÊN' : 'SOCRATIC AI';
      lines.push(`[${msg.timestamp}] ${senderName}:\n${msg.content}\n`);
      lines.push('------------------------------------------');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w\s\u00C0-\u1EF9]/g, '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionDetail, currentSubject, messages]);

  const isNewChat = !activeSessionId;
  const isWaitingSessionMessages = Boolean(activeSessionId && isLoadingDetail && messages.length === 0);

  return (
    <div className="bg-slate-50 dark:bg-[#131314] text-slate-800 dark:text-[#E3E3E3] font-sans antialiased h-screen flex overflow-hidden">
      <AiTutorSidebar
        sessions={sidebarSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        userFullName={userFullName}
        isLoading={isLoadingSessions}
      />

      <main className="flex-1 flex flex-col h-full bg-white dark:bg-[#131314] relative overflow-hidden">
        <AiTutorHeader
          currentSubject={currentSubject}
          onSelectSubject={setCurrentSubject}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onExportSession={handleExportTranscript}
          onToggleSidebar={toggleSidebar}
        />

        {/* ONLY render WelcomeCanvas when user is on /ai-tutor (new chat) and has no messages */}
        {isNewChat && messages.length === 0 ? (
          <AiTutorWelcomeCanvas
            userFullName={userFullName}
            onSelectPrompt={(prompt) => setInputText(prompt)}
            onSendMessage={(text) => handleSendMessage(text)}
          />
        ) : (
          <>
            <AiTutorChatCanvas
              messages={messages}
              userFullName={userFullName}
              isTyping={isStreaming}
              onCopyCode={handleCopyCode}
              copiedCodeId={copiedCodeId}
              onRegenerateLast={handleRegenerateLast}
              threadEndRef={threadEndRef}
              progressState={progressState}
              onFeedback={handleFeedback}
              isSubmittingFeedback={feedbackMutation.isPending}
              isLoadingDetail={isWaitingSessionMessages}
            />

            <AiTutorInputBar
              inputText={inputText}
              onChangeInput={setInputText}
              onSend={() => handleSendMessage()}
              isTyping={isStreaming || isWaitingSessionMessages}
            />
          </>
        )}
      </main>
    </div>
  );
}
