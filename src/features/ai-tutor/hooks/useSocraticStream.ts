'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socraticKeys } from '../constants';
import { streamChat } from '../services/socratic-chat.service';
import {
  ChatMessage,
  SocraticProgressState,
  SocraticStepProgress,
  SocraticKnowledgeContext,
  SSEErrorData,
} from '../types';

function toProgressState(step?: SocraticStepProgress | null): SocraticProgressState | null {
  if (!step) return null;
  return {
    stepId: step.step_id,
    exerciseId: step.exercise_id,
    currentStepNumber: step.number,
    totalSteps: step.total,
    currentStepAction: step.instruction,
    isCompleted: step.completed,
  };
}

interface UseSocraticStreamOptions {
  sessionId: string | null;
  initialMessages?: ChatMessage[];
  onSessionCreated?: (newSessionId: string) => void;
  jwtToken?: string;
  provider?: 'gemini' | 'openai';
  subject?: string | null;
  teacherId?: string | null;
}

export function useSocraticStream({
  sessionId,
  initialMessages = [],
  onSessionCreated,
  jwtToken,
  provider,
  subject,
  teacherId,
}: UseSocraticStreamOptions) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId);
  const [progressState, setProgressState] = useState<SocraticProgressState | null>(null);
  const [knowledgeContext, setKnowledgeContext] = useState<SocraticKnowledgeContext | null>(null);
  const [streamError, setStreamError] = useState<SSEErrorData | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPropSessionIdRef = useRef<string | null>(sessionId);
  const hasLoadedDetailRef = useRef<boolean>(false);

  // Sync activeSessionId and messages when sessionId changes externally
  useEffect(() => {
    // If sessionId prop changed to a different session
    if (sessionId !== lastPropSessionIdRef.current) {
      const isCurrentActive = Boolean(sessionId && sessionId === activeSessionId);
      lastPropSessionIdRef.current = sessionId;

      // Only reset messages if we aren't already active in this session
      if (!isCurrentActive) {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setIsStreaming(false);
        hasLoadedDetailRef.current = false;
        setActiveSessionId(sessionId);
        setMessages(initialMessages);
        setProgressState(null);
        setKnowledgeContext(null);
        setStreamError(null);
        return;
      }
    }

    // If initialMessages just arrived from backend for this session and we have not loaded them yet
    if (sessionId && initialMessages.length > 0 && !hasLoadedDetailRef.current && !isStreaming) {
      hasLoadedDetailRef.current = true;
      setMessages(initialMessages);
    }
  }, [sessionId, initialMessages, isStreaming, activeSessionId]);

  // Clean up controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setMessages((prev) => prev.map((m) => m.isStreaming
        ? { ...m, isStreaming: false, streamStatus: null, isIncomplete: true } : m));
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userTempId = `user-temp-${Date.now()}`;
      const aiTempId = `ai-temp-${Date.now()}`;
      let assistantId = aiTempId;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const userMsg: ChatMessage = {
        id: userTempId,
        session_id: activeSessionId || undefined,
        sender: 'user',
        content: trimmed,
        timestamp: timeStr,
      };

      const aiMsg: ChatMessage = {
        id: aiTempId,
        session_id: activeSessionId || undefined,
        sender: 'ai',
        content: '',
        timestamp: timeStr,
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, aiMsg]);
      setIsStreaming(true);
      setStreamError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await streamChat(
          {
            protocol_version: 2,
            client_request_id: crypto.randomUUID(),
            session_id: activeSessionId || null,
            message: trimmed,
            subject: subject || null,
            teacher_id: teacherId || null,
          },
          {
            onSessionInit: (data) => {
              if (controller.signal.aborted) return;
              assistantId = data.assistant_message_id;
              setActiveSessionId(data.session_id);
              lastPropSessionIdRef.current = data.session_id;
              hasLoadedDetailRef.current = true;
              onSessionCreated?.(data.session_id);

              setProgressState(toProgressState(data.step_progress));

              // Update optimistic message IDs
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === userTempId) {
                    return { ...m, id: data.user_message_id, session_id: data.session_id };
                  }
                  if (m.id === aiTempId) {
                    return {
                      ...m,
                      id: data.assistant_message_id,
                      session_id: data.session_id,
                      step_number_at_turn: null,
                      step_progress: null,
                    };
                  }
                  return m;
                })
              );
            },
            onStepUpdate: (data) => {
              if (controller.signal.aborted) return;
              setProgressState(toProgressState(data.step_progress));
            },
            onContextRef: (data) => {
              if (controller.signal.aborted) return;
              setKnowledgeContext({
                referencedChunkIds: data.referenced_chunk_ids,
                referencedNodeIds: data.referenced_node_ids,
                matchedCanonicalCodes: data.matched_canonical_codes,
              });
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === assistantId && m.isStreaming) {
                    return {
                      ...m,
                      referenced_chunk_ids: data.referenced_chunk_ids,
                      referenced_node_ids: data.referenced_node_ids,
                    };
                  }
                  return m;
                })
              );
            },
            onStatus: (data) => {
              if (controller.signal.aborted) return;
              setMessages((prev) => prev.map((m) => m.id === assistantId && m.isStreaming
                ? { ...m, streamStatus: data.state === 'running' ? data : null } : m));
            },
            onContentReplace: (data) => {
              if (controller.signal.aborted) return;
              setMessages((prev) => prev.map((m) => m.id === assistantId
                ? { ...m, content: data.full_content } : m));
            },
            onToken: (delta) => {
              if (controller.signal.aborted) return;
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === assistantId && m.isStreaming) {
                    return { ...m, content: m.content + delta, streamStatus: null };
                  }
                  return m;
                })
              );
            },
            onDone: (data) => {
              if (controller.signal.aborted) return;
              setProgressState(toProgressState(data.step_progress));
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === assistantId || m.id === data.assistant_message_id) {
                    return {
                      ...m,
                      id: data.assistant_message_id,
                      session_id: data.session_id,
                      content: data.full_content,
                      step_number_at_turn: data.step_number_at_turn,
                      step_progress: data.step_progress ?? null,
                      referenced_chunk_ids: data.referenced_chunk_ids,
                      referenced_node_ids: data.referenced_node_ids,
                      isStreaming: false,
                      streamStatus: null,
                      isIncomplete: false,
                    };
                  }
                  return m;
                })
              );
              setIsStreaming(false);
              queryClient.invalidateQueries({ queryKey: socraticKeys.all });
            },
            onError: (err) => {
              if (controller.signal.aborted) return;
              setStreamError(err);
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false, streamStatus: null, isIncomplete: true } : m))
              );
              setIsStreaming(false);
            },
          },
          {
            jwtToken,
            provider,
            signal: controller.signal,
          }
        );
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const errorMsg = err instanceof Error ? err.message : 'Unknown stream error';
        setStreamError({
          code: 'CLIENT_STREAM_EXCEPTION',
          message: errorMsg,
          recoverable: true,
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false, streamStatus: null, isIncomplete: true } : m))
        );
        setIsStreaming(false);
      } finally {
        if (abortControllerRef.current === controller) abortControllerRef.current = null;
      }
    },
    [
      activeSessionId,
      isStreaming,
      jwtToken,
      provider,
      subject,
      teacherId,
      onSessionCreated,
      queryClient,
    ]
  );

  return {
    messages,
    setMessages,
    isStreaming,
    activeSessionId,
    progressState,
    knowledgeContext,
    streamError,
    sendMessage,
    stopStreaming,
  };
}
