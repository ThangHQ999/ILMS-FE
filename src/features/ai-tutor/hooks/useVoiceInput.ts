'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface ISpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognitionInstance, ev: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognitionInstance;

interface IWindowSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseVoiceInputOptions {
  currentText: string;
  onTranscript: (newText: string) => void;
  lang?: string;
  onAutoStop?: () => void;
}

export function useVoiceInput({
  currentText,
  onTranscript,
  lang = 'vi-VN',
  onAutoStop,
}: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef<string>(currentText);

  // Kiểm tra tính năng Web Speech API trên trình duyệt
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindowSpeech;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  // Tự động ẩn thông báo lỗi sau 4 giây
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Dừng nghe
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Bỏ qua lỗi nếu đã dừng
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    onAutoStop?.();
  }, [onAutoStop]);

  // Bắt đầu nghe
  const startListening = useCallback(() => {
    setErrorMessage(null);

    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindowSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng thử trên Chrome, Edge hoặc Safari.');
      return;
    }

    // Nếu đang chạy luồng cũ, dừng lại trước
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    // Lưu văn bản gốc trước khi bắt đầu nói để nối tiếp không bị lặp
    baseTextRef.current = currentText;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang; // 'vi-VN' mặc định
      recognition.continuous = true; // Tiếp tục lắng nghe
      recognition.interimResults = true; // Nhận dạng kết quả thời gian thực

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const recognizedTotal = (finalTranscript + ' ' + interimTranscript).trim();
        if (!recognizedTotal) return;

        const base = baseTextRef.current.trim();
        const combined = base ? `${base} ${recognizedTotal}` : recognizedTotal;
        onTranscript(combined);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage('Quyền truy cập micro đã bị từ chối. Vui lòng cho phép quyền micro trên trình duyệt.');
        } else if (event.error === 'no-speech') {
          // Không có âm thanh, không cần báo lỗi nghiêm trọng
        } else if (event.error === 'network') {
          setErrorMessage('Lỗi kết nối mạng trong quá trình nhận dạng giọng nói.');
        } else {
          setErrorMessage(`Lỗi giọng nói: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setIsListening(false);
      const msg = err instanceof Error ? err.message : 'Không thể khởi động micro';
      setErrorMessage(msg);
    }
  }, [currentText, lang, onTranscript]);

  // Đổi trạng thái bật/tắt (toggle)
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Hủy tiến trình khi unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setErrorMessage(null),
  };
}
