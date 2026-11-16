import { api } from '@/lib/axios';
import { ChatMessage } from '../types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-initial',
    sender: 'ai',
    senderName: 'Trợ lý Socratic',
    content:
      'Chào bạn! Tôi là **Trợ lý AI Socratic** của hệ thống ILMS. Bạn đang gặp vướng mắc ở bài học, bài tập hay khái niệm nào? Hãy chia sẻ để chúng ta cùng phân tích và tìm ra lời giải nhé!',
    timestamp: 'Trợ lý Socratic',
    attachment: {
      title: 'Học tập Socratic tương tác',
      subtitle: 'Gợi mở tư duy • Không giải hộ • Đồng hành 24/7',
      icon: 'psychology',
      actionText: 'Bắt đầu',
    },
  },
];

export interface SocraticStreamCallbacks {
  onToken: (delta: string) => void;
  onDone?: (fullContent: string, assistantMessageId?: string) => void;
  onError?: (error: Error | string) => void;
  onSessionInit?: (sessionId: string) => void;
}

export interface SocraticStreamPayload {
  message: string;
  sessionId?: string;
  subject?: string;
  teacherId?: string;
}

/**
 * Gửi đánh giá phản hồi (Feedback: Thumbs Up / Thumbs Down) cho tin nhắn AI
 * Endpoint chuẩn: PATCH /api/v1/student/chat/messages/{messageId}/feedback
 */
export async function submitChatMessageFeedback(
  messageId: string,
  rating: 'LIKE' | 'DISLIKE'
): Promise<void> {
  await api.patch(`/student/chat/messages/${messageId}/feedback`, { rating });
}

/**
 * Mở kết nối SSE Stream tới Backend API thật: POST /api/v1/student/chat/stream
 * Chuẩn SSE Stream Protocol 2 theo docs/api-spec.md.
 * KHÔNG sử dụng bất kỳ câu trả lời AI giả lập hay mock text nào.
 */
export async function streamSocraticChatMessage(
  payload: SocraticStreamPayload,
  callbacks: SocraticStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const streamUrl = `${baseUrl}/student/chat/stream`;

  try {
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
      },
      credentials: 'include',
      body: JSON.stringify({
        message: payload.message,
        session_id: payload.sessionId,
        subject: payload.subject,
        teacher_id: payload.teacherId,
      }),
      signal,
    });

    if (!response.ok) {
      let serverError = `Lỗi kết nối máy chủ AI (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson?.message) serverError = errorJson.message;
      } catch {
        // ignore parse error
      }
      throw new Error(serverError);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Trình duyệt không hỗ trợ luồng dữ liệu ReadableStream.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';

      for (const block of blocks) {
        if (!block.trim()) continue;
        let eventType = 'message';
        const dataLines: string[] = [];

        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).replace(/^ /, ''));
          }
        }

        if (dataLines.length === 0) continue;
        const rawData = dataLines.join('\n');

        try {
          const parsed = JSON.parse(rawData);
          if (eventType === 'session_init' && parsed.session_id) {
            callbacks.onSessionInit?.(parsed.session_id);
          } else if (eventType === 'token' && typeof parsed.delta === 'string') {
            accumulatedContent += parsed.delta;
            callbacks.onToken(parsed.delta);
          } else if (eventType === 'content_replace' && typeof parsed.full_content === 'string') {
            accumulatedContent = parsed.full_content;
            callbacks.onToken('');
          } else if (eventType === 'done') {
            const finalContent = parsed.full_content || accumulatedContent;
            callbacks.onDone?.(finalContent, parsed.assistant_message_id);
            return;
          } else if (eventType === 'error') {
            throw new Error(parsed.message || 'Lỗi xử lý từ máy chủ AI Socratic.');
          }
        } catch (jsonErr: unknown) {
          if (jsonErr instanceof Error && jsonErr.message.includes('Lỗi xử lý từ máy chủ AI Socratic')) {
            throw jsonErr;
          }
        }
      }
    }

    callbacks.onDone?.(accumulatedContent);
  } catch (err: unknown) {
    if (signal?.aborted) return;
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Không thể kết nối đến máy chủ AI Socratic. Vui lòng kiểm tra lại đường truyền hoặc dịch vụ backend.';
    callbacks.onError?.(new Error(errorMessage));
  }
}

export async function sendChatMessage(prompt: string, sessionId?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let result = '';
    streamSocraticChatMessage(
      { message: prompt, sessionId },
      {
        onToken: (delta) => {
          result += delta;
        },
        onDone: (full) => {
          resolve(full || result);
        },
        onError: (err) => {
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      }
    );
  });
}
