'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socraticKeys } from '../constants';
import { submitFeedback } from '../services/socratic-chat.service';
import {
  SocraticChatMessageItem,
  MessageFeedbackRequest,
  SocraticSessionDetail,
} from '../types';

export function useSocraticFeedback(sessionId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    SocraticChatMessageItem,
    Error,
    { messageId: string; payload: MessageFeedbackRequest }
  >({
    mutationFn: ({ messageId, payload }) =>
      submitFeedback(messageId, payload),
    onSuccess: (updatedMessage) => {
      if (!sessionId) return;
      queryClient.setQueryData(
        socraticKeys.detail(sessionId),
        (prev: SocraticSessionDetail | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
            ),
          };
        }
      );
    },
  });
}
