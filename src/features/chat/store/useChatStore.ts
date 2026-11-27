'use client';

import { useSyncExternalStore } from 'react';
import type { ChatMessage } from '../schemas/chat.schema';
import type {
  AiReplyDraft,
  ReadReceiptEvent,
  StudyTimerEvent,
} from '../schemas/chat-phase2.schema';
import type { ChatRealtimeConnectionStatus } from '../services/chat-realtime.service';

export type SidebarFilterTab =
  | 'ALL'
  | 'UNREAD'
  | 'STUDY_GROUP'
  | 'CLASS_CHANNEL'
  | 'BOOKMARKS';

export type RightPanelMode = 'none' | 'info' | 'thread';

export interface OnlinePresenceUser {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface TypingUserEntry {
  userId: string;
  fullName: string;
  expiresAt: number;
}

export interface ChatUiState {
  activeConversationId: string | null;
  rightPanelMode: RightPanelMode;
  activeThreadRootId: string | null;
  sidebarTab: SidebarFilterTab;
  realtimeStatus: ChatRealtimeConnectionStatus;
  onlineUsers: Record<string, OnlinePresenceUser>;
  typingByConversation: Record<string, TypingUserEntry[]>;
  replyToMessage: ChatMessage | null;
  aiDraft: AiReplyDraft | null;
  highlightedMessageId: string | null;
  readReceiptsByConversation: Record<string, ReadReceiptEvent[]>;
  activePomodoroByConversation: Record<string, StudyTimerEvent | null>;
  aiThinkingByConversation: Record<string, number>;
}

const initialState: ChatUiState = {
  activeConversationId: null,
  rightPanelMode: 'none',
  activeThreadRootId: null,
  sidebarTab: 'ALL',
  realtimeStatus: 'disconnected',
  onlineUsers: {},
  typingByConversation: {},
  replyToMessage: null,
  aiDraft: null,
  highlightedMessageId: null,
  readReceiptsByConversation: {},
  activePomodoroByConversation: {},
  aiThinkingByConversation: {},
};

let state: ChatUiState = initialState;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const chatStore = {
  getState: (): ChatUiState => state,
  setState: (
    updater:
      | Partial<ChatUiState>
      | ((prev: ChatUiState) => Partial<ChatUiState> | ChatUiState)
  ): void => {
    const partial = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...partial };
    emitChange();
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setActiveConversation: (conversationId: string | null): void => {
    chatStore.setState((prev) => ({
      activeConversationId: conversationId,
      replyToMessage: null,
      aiDraft: null,
      activeThreadRootId:
        conversationId !== null && prev.activeConversationId === conversationId
          ? prev.activeThreadRootId
          : null,
      rightPanelMode:
        conversationId === null ||
        (prev.rightPanelMode === 'thread' && prev.activeConversationId !== conversationId)
          ? 'none'
          : prev.rightPanelMode,
    }));
  },
  openThreadDrawer: (rootMessageId: string): void => {
    chatStore.setState({
      rightPanelMode: 'thread',
      activeThreadRootId: rootMessageId,
    });
  },
  toggleInfoDrawer: (): void => {
    chatStore.setState((prev) => ({
      rightPanelMode: prev.rightPanelMode === 'info' ? 'none' : 'info',
    }));
  },
  closeRightPanel: (): void => {
    chatStore.setState({ rightPanelMode: 'none', activeThreadRootId: null });
  },
  startAiThinking: (conversationId: string): void => {
    chatStore.setState((prev) => ({
      aiThinkingByConversation: {
        ...prev.aiThinkingByConversation,
        [conversationId]: Date.now(),
      },
    }));
  },
  clearAiThinking: (conversationId: string): void => {
    chatStore.setState((prev) => {
      if (!(conversationId in prev.aiThinkingByConversation)) {
        return prev;
      }
      const next = { ...prev.aiThinkingByConversation };
      delete next[conversationId];
      return { aiThinkingByConversation: next };
    });
  },
};

export function useChatStore<T>(selector: (s: ChatUiState) => T): T {
  return useSyncExternalStore(
    chatStore.subscribe,
    () => selector(chatStore.getState()),
    () => selector(initialState)
  );
}
