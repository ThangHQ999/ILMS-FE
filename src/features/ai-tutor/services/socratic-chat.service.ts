import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/common';
import { SOCRATIC_ENDPOINTS } from '../constants';
import {
  SocraticStreamPayload,
  PaginatedSessions,
  SocraticSessionDetail,
  SocraticSessionSidebarItem,
  SessionUpdateRequest,
  MessageFeedbackRequest,
  SessionDeleteResult,
  SocraticChatMessageItem,
  SSESessionInitData,
  SSEStepUpdateData,
  SSEContextRefData,
  SSEDoneData,
  SSEErrorData,
  SSEStatusData,
  SSEContentReplaceData,
} from '../types';
import {
  paginatedSessionsSchema,
  socraticSessionDetailSchema,
  socraticSessionSidebarItemSchema,
  sessionDeleteResultSchema,
  socraticChatMessageItemSchema,
  sseSessionInitDataSchema,
  sseStepUpdateDataSchema,
  sseContextRefDataSchema,
  sseTokenDataSchema,
  sseDoneDataSchema,
  sseErrorDataSchema,
  sseStatusDataSchema,
  sseContentReplaceDataSchema,
} from '../schemas/socratic-chat.schema';

export interface SocraticStreamCallbacks {
  onSessionInit?: (data: SSESessionInitData) => void;
  onStepUpdate?: (data: SSEStepUpdateData) => void;
  onContextRef?: (data: SSEContextRefData) => void;
  onStatus?: (data: SSEStatusData) => void;
  onContentReplace?: (data: SSEContentReplaceData) => void;
  onToken: (delta: string) => void;
  onDone?: (data: SSEDoneData) => void;
  onError?: (error: SSEErrorData) => void;
}

export interface StreamChatOptions {
  provider?: 'gemini' | 'openai';
  jwtToken?: string;
  signal?: AbortSignal;
}

/**
 * 1. Khởi chạy luồng SSE Chat Stream thời gian thực
 */
export async function streamChat(
  payload: SocraticStreamPayload,
  callbacks: SocraticStreamCallbacks,
  options?: StreamChatOptions
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ilms.page/api/v1';
  const url = new URL(`${baseUrl}${SOCRATIC_ENDPOINTS.STREAM}`);
  if (options?.provider) {
    url.searchParams.append('provider', options.provider);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
  };

  if (options?.jwtToken) {
    headers['Authorization'] = `Bearer ${options.jwtToken}`;
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.message) errorMsg = errJson.message;
    } catch {
      // Ignore json parse error
    }
    const errorData: SSEErrorData = {
      code: `HTTP_${response.status}`,
      message: errorMsg,
      recoverable: response.status >= 500,
    };
    callbacks.onError?.(errorData);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream not supported by browser environment');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let terminal = false;

  const fail = (code: string): void => {
    if (terminal) return;
    terminal = true;
    callbacks.onError?.({ code, message: '', recoverable: true, content_status: 'INCOMPLETE' });
  };

  const processBlock = (block: string): void => {
    if (terminal) return;
    let eventType = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) eventType = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    if (!dataLines.length) return; // Heartbeat comments have no data.
    let parsed: unknown;
    try {
      parsed = JSON.parse(dataLines.join('\n'));
    } catch {
      fail('INVALID_SSE_EVENT');
      return;
    }
    try {
      switch (eventType) {
        case 'session_init': callbacks.onSessionInit?.(sseSessionInitDataSchema.parse(parsed)); break;
        case 'step_update': callbacks.onStepUpdate?.(sseStepUpdateDataSchema.parse(parsed)); break;
        case 'context_ref': callbacks.onContextRef?.(sseContextRefDataSchema.parse(parsed)); break;
        case 'status': callbacks.onStatus?.(sseStatusDataSchema.parse(parsed)); break;
        case 'content_replace': callbacks.onContentReplace?.(sseContentReplaceDataSchema.parse(parsed)); break;
        case 'token': callbacks.onToken(sseTokenDataSchema.parse(parsed).delta); break;
        case 'done': {
          const data = sseDoneDataSchema.parse(parsed);
          terminal = true;
          callbacks.onDone?.(data);
          break;
        }
        case 'error': {
          const data = sseErrorDataSchema.parse(parsed);
          terminal = true;
          callbacks.onError?.(data);
          break;
        }
        default: break; // Unknown event types must never become chat text.
      }
    } catch {
      fail('INVALID_SSE_EVENT');
    }
  };

  const consume = (): void => {
    buffer = buffer.replace(/\r\n/g, '\n');
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0 && !terminal) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      processBlock(block);
      boundary = buffer.indexOf('\n\n');
    }
  };

  try {
    while (!terminal) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        consume();
        if (buffer.trim()) processBlock(buffer);
        if (!terminal) fail('STREAM_INTERRUPTED');
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      consume();
    }
  } catch (error: unknown) {
    if (options?.signal?.aborted) throw error;
    fail('STREAM_INTERRUPTED');
  } finally {
    try { await reader.cancel(); } catch { /* The connection may already be closed. */ }
    reader.releaseLock();
  }
}

/**
 * 2. Lấy danh sách lịch sử phiên chat (Sidebar)
 */
export async function getSessions(params?: {
  pageNumber?: number;
  pageSize?: number;
  subject?: string;
}): Promise<PaginatedSessions> {
  const { data } = await api.get<ApiResponse<unknown>>(SOCRATIC_ENDPOINTS.SESSIONS, {
    params: {
      pageNumber: params?.pageNumber ?? 0,
      pageSize: params?.pageSize ?? 10,
      ...(params?.subject ? { subject: params.subject } : {}),
    },
  });
  return paginatedSessionsSchema.parse(data.data);
}

/**
 * 3. Lấy chi tiết phiên chat kèm lịch sử tin nhắn
 */
export async function getSessionDetail(sessionId: string): Promise<SocraticSessionDetail> {
  const { data } = await api.get<ApiResponse<unknown>>(
    SOCRATIC_ENDPOINTS.SESSION_DETAIL(sessionId)
  );
  return socraticSessionDetailSchema.parse(data.data);
}

/**
 * 4. Cập nhật tiêu đề phiên chat hoặc trạng thái hoàn thành
 */
export async function updateSession(
  sessionId: string,
  payload: SessionUpdateRequest
): Promise<SocraticSessionSidebarItem> {
  const { data } = await api.patch<ApiResponse<unknown>>(
    SOCRATIC_ENDPOINTS.UPDATE_SESSION(sessionId),
    payload
  );
  return socraticSessionSidebarItemSchema.parse(data.data);
}

/**
 * 5. Xóa vĩnh viễn 1 phiên chat
 */
export async function deleteSession(sessionId: string): Promise<SessionDeleteResult> {
  const { data } = await api.delete<ApiResponse<unknown>>(
    SOCRATIC_ENDPOINTS.DELETE_SESSION(sessionId)
  );
  return sessionDeleteResultSchema.parse(data.data);
}

/**
 * 6. Gửi đánh giá phản hồi (Feedback) cho tin nhắn của AI
 */
export async function submitFeedback(
  messageId: string,
  payload: MessageFeedbackRequest
): Promise<SocraticChatMessageItem> {
  const { data } = await api.patch<ApiResponse<unknown>>(
    SOCRATIC_ENDPOINTS.FEEDBACK(messageId),
    payload
  );
  return socraticChatMessageItemSchema.parse(data.data);
}
