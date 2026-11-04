'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatSession } from '../types';
import {
  getChatSessions,
  saveChatSessions,
} from '../services/ai-tutor.service';
import { AI_TUTOR_STORAGE_KEYS } from '../constants';

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage or mock
  useEffect(() => {
    async function load() {
      const data = await getChatSessions();
      setSessions(data);

      const savedActiveId = localStorage.getItem(AI_TUTOR_STORAGE_KEYS.ACTIVE_SESSION_ID);
      const isCollapsed = localStorage.getItem(AI_TUTOR_STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
      setIsSidebarCollapsed(isCollapsed);

      if (savedActiveId && data.some((s) => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
      } else if (data.length > 0) {
        setActiveSessionId(data[0].id);
      }
      setIsLoaded(true);
    }
    load();
  }, []);

  // Update localStorage when active session changes
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    localStorage.setItem(AI_TUTOR_STORAGE_KEYS.ACTIVE_SESSION_ID, id);
  }, []);

  // Create new session (sets activeSession to a newly created empty session)
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Đoạn chat mới',
      updatedAt: 'Vừa xong',
      group: 'today',
      subjectId: 'dsa',
      messages: [],
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveChatSessions(updated);
      return updated;
    });

    setActiveSessionId(newSession.id);
    localStorage.setItem(AI_TUTOR_STORAGE_KEYS.ACTIVE_SESSION_ID, newSession.id);
    return newSession.id;
  }, []);

  // Delete session
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        saveChatSessions(filtered);
        if (activeSessionId === id) {
          const nextActive = filtered.length > 0 ? filtered[0].id : null;
          setActiveSessionId(nextActive);
          if (nextActive) {
            localStorage.setItem(AI_TUTOR_STORAGE_KEYS.ACTIVE_SESSION_ID, nextActive);
          } else {
            localStorage.removeItem(AI_TUTOR_STORAGE_KEYS.ACTIVE_SESSION_ID);
          }
        }
        return filtered;
      });
    },
    [activeSessionId]
  );

  // Rename session
  const renameSession = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s));
      saveChatSessions(updated);
      return updated;
    });
  }, []);

  // Toggle sidebar collapse
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(AI_TUTOR_STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  }, []);

  // Active session object
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return {
    sessions,
    setSessions,
    activeSessionId,
    activeSession,
    isLoaded,
    isSidebarCollapsed,
    selectSession: handleSelectSession,
    createNewSession,
    deleteSession,
    renameSession,
    toggleSidebar,
  };
}
