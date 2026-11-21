import { ChatSession } from '../types';
import { INITIAL_MOCK_SESSIONS } from '../constants';

const SESSIONS_STORAGE_KEY = 'ilms_ai_tutor_sessions';

export async function getChatSessions(): Promise<ChatSession[]> {
  if (typeof window === 'undefined') return INITIAL_MOCK_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SESSIONS));
      return INITIAL_MOCK_SESSIONS;
    }
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return INITIAL_MOCK_SESSIONS;
  }
}

export async function saveChatSessions(sessions: ChatSession[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore storage write error
  }
}
