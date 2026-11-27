'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { useCurrentUser } from '@/features/auth';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { ApiError } from '@/types/common';
import { chatKeys } from '../constants/chat-query-keys';
import type {
  ChatReportReason,
  CreateSmartGroupInput,
  PreferredStudyMode,
  SendThreadReplyInput,
  StudySessionRsvpStatus,
  StudyTimerAction,
} from '../schemas/chat-phase2.schema';
import {
  cancelScheduledMessage,
  controlStudyTimer,
  createScheduledMessage,
  createSmartStudyGroup,
  createStudySession,
  generateInstructorAiDraft,
  getBookmarks,
  getChannelFaqs,
  getConversationReports,
  getScheduledMessages,
  getStudyPreferences,
  getStudyRecommendations,
  getStudySessions,
  getThreadMessages,
  promoteThreadToFaq,
  removeMessageBookmark,
  reportMessage,
  restrictMember,
  reviewReport,
  rsvpStudySession,
  saveMessageBookmark,
  sendThreadReply,
  setExamLock,
  summarizeConversation,
  summarizeThread,
  updateStudyPreferences,
} from '../services/chat-phase2.service';
import { chatStore } from '../store/useChatStore';

// 2.1 Thread hooks
export function useChatThread(rootMessageId?: string | null) {
  return useQuery({
    queryKey: chatKeys.thread(rootMessageId ?? ''),
    queryFn: () => getThreadMessages(rootMessageId!),
    enabled: Boolean(rootMessageId),
    staleTime: 10_000,
  });
}

export function useSendThreadReply(
  rootMessageId: string | null,
  conversationId: string | null
) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: (payload: SendThreadReplyInput) => {
      if (!rootMessageId) throw new Error(tToast('missingRootMessage'));
      return sendThreadReply(rootMessageId, payload);
    },
    onSuccess: (reply) => {
      if (!rootMessageId) return;
      queryClient.setQueryData(chatKeys.thread(rootMessageId), (old: Awaited<ReturnType<typeof getThreadMessages>> | undefined) => {
        if (!old) return old;
        const exists = old.replies.some((r) => r.id === reply.id);
        if (exists) return old;
        return {
          ...old,
          rootMessage: {
            ...old.rootMessage,
            threadReplyCount: old.rootMessage.threadReplyCount + 1,
          },
          replies: [...old.replies, { ...reply, isMine: reply.isMine ?? reply.sender?.id === user?.id }],
        };
      });
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      }
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotSendThreadReply')));
    },
  });
}

// 2.2 Smart Study Matching hooks
export function useStudyPreferences(enabled = true) {
  return useQuery({
    queryKey: chatKeys.preferences(),
    queryFn: getStudyPreferences,
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateStudyPreferences() {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (payload: {
      allowPeerMatching: boolean;
      willingToMentor: boolean;
      preferredStudyMode: PreferredStudyMode;
      availabilityNote?: string;
    }) => updateStudyPreferences(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(chatKeys.preferences(), updated);
      toast.success(tToast('preferencesUpdated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotUpdatePreferences')));
    },
  });
}

export function useStudyRecommendations(
  classId: string | null,
  courseId?: string,
  mode: 'MENTOR' | 'PEER_CIRCLE' = 'MENTOR',
  enabled = true
) {
  return useQuery({
    queryKey: chatKeys.recommendations(classId ?? '', courseId, mode),
    queryFn: () => getStudyRecommendations(classId!, { courseId, mode }),
    enabled: Boolean(classId && enabled),
    staleTime: 30_000,
  });
}

export function useCreateSmartGroup() {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (payload: CreateSmartGroupInput) => createSmartStudyGroup(payload),
    onSuccess: (conv) => {
      queryClient.setQueryData(chatKeys.conversation(conv.id), conv);
      void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'conversations'] });
      toast.success(tToast('smartGroupCreated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCreateSmartGroup')));
    },
  });
}

// 2.3 AI Summarizer, Instructor Draft & FAQ
export function useSummarizeChat() {
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: { kind: 'conversation' | 'thread'; targetId: string }) =>
      params.kind === 'conversation'
        ? summarizeConversation(params.targetId)
        : summarizeThread(params.targetId),
    onError: (err) => {
      if (err instanceof ApiError && err.httpStatus === 429) {
        toast.warning(tToast('rateLimitSummarize'));
        return;
      }
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotSummarize')));
    },
  });
}

export function useInstructorAiDraft() {
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (messageId: string) => generateInstructorAiDraft(messageId),
    onSuccess: (draft) => {
      chatStore.setState({ aiDraft: draft });
      toast.success(tToast('aiDraftCreated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCreateAiDraft')));
    },
  });
}

export function useChannelFaqs(conversationId?: string | null, enabled = true) {
  return useQuery({
    queryKey: chatKeys.faqs(conversationId ?? ''),
    queryFn: () => getChannelFaqs(conversationId!),
    enabled: Boolean(conversationId && enabled),
    staleTime: 30_000,
  });
}

export function usePromoteFaq(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: {
      rootId: string;
      questionText: string;
      answerText: string;
      conceptCode?: string;
    }) =>
      promoteThreadToFaq(params.rootId, {
        questionText: params.questionText,
        answerText: params.answerText,
        conceptCode: params.conceptCode,
      }),
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.faqs(conversationId) });
      }
      toast.success(tToast('faqSaved'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotSaveFaq')));
    },
  });
}

// 2.4 Study Sessions & Sync Pomodoro
export function useStudySessions(conversationId?: string | null, enabled = true) {
  return useQuery({
    queryKey: chatKeys.studySessions(conversationId ?? ''),
    queryFn: () => getStudySessions(conversationId!),
    enabled: Boolean(conversationId && enabled),
    staleTime: 20_000,
  });
}

export function useCreateStudySession(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (payload: {
      title: string;
      description?: string;
      conceptCode?: string;
      scheduledStartAt: string;
      durationMinutes?: number;
      meetingUrl?: string;
    }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return createStudySession(conversationId, payload);
    },
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.studySessions(conversationId),
        });
      }
      toast.success(tToast('studySessionCreated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCreateStudySession')));
    },
  });
}

export function useRsvpStudySession(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: { sessionId: string; status: StudySessionRsvpStatus }) =>
      rsvpStudySession(params.sessionId, params.status),
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.studySessions(conversationId),
        });
      }
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotUpdateRsvp')));
    },
  });
}

export function useStudyTimer(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: {
      sessionId: string;
      action: StudyTimerAction;
      durationSeconds?: number;
    }) =>
      controlStudyTimer(params.sessionId, {
        action: params.action,
        durationSeconds: params.durationSeconds,
      }),
    onSuccess: (timerEvent) => {
      if (!conversationId) return;
      chatStore.setState((prev) => ({
        activePomodoroByConversation: {
          ...prev.activePomodoroByConversation,
          [conversationId]: timerEvent.phase === 'IDLE' ? null : timerEvent,
        },
      }));
      void queryClient.invalidateQueries({
        queryKey: chatKeys.studySessions(conversationId),
      });
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotControlTimer')));
    },
  });
}

// 2.5 Bookmarks & Scheduled Messages
export function useBookmarks(conversationId?: string, enabled = true) {
  return useQuery({
    queryKey: chatKeys.bookmarks(conversationId),
    queryFn: () => getBookmarks(conversationId),
    enabled,
    staleTime: 20_000,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  const saveMutation = useMutation({
    mutationFn: (params: { messageId: string; note?: string }) =>
      saveMessageBookmark(params.messageId, params.note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'bookmarks'] });
      toast.success(tToast('bookmarkSaved'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotSaveBookmark')));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (messageId: string) => removeMessageBookmark(messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'bookmarks'] });
      toast.success(tToast('bookmarkRemoved'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotRemoveBookmark')));
    },
  });

  return { saveMutation, removeMutation };
}

export function useScheduledMessages(conversationId?: string | null, enabled = false) {
  return useQuery({
    queryKey: chatKeys.scheduledMessages(conversationId ?? ''),
    queryFn: () => getScheduledMessages(conversationId!),
    enabled: Boolean(conversationId && enabled),
    staleTime: 20_000,
  });
}

export function useCreateScheduledMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (payload: {
      messageType: 'TEXT' | 'CODE' | 'RESOURCE_SHARE';
      content: string;
      scheduledAt: string;
    }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return createScheduledMessage(conversationId, payload);
    },
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.scheduledMessages(conversationId),
        });
      }
      toast.success(tToast('scheduledCreated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCreateScheduled')));
    },
  });
}

export function useCancelScheduledMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (msgId: string) => cancelScheduledMessage(msgId),
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.scheduledMessages(conversationId),
        });
      }
      toast.success(tToast('scheduledCancelled'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotCancelScheduled')));
    },
  });
}

// 2.6 Safety, Moderation & Exam Lock
export function useReportMessage() {
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: {
      messageId: string;
      reason: ChatReportReason;
      description?: string;
    }) =>
      reportMessage(params.messageId, {
        reason: params.reason,
        description: params.description,
      }),
    onSuccess: () => {
      toast.success(tToast('reportSubmitted'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotSubmitReport')));
    },
  });
}

export function useConversationReports(
  conversationId?: string | null,
  enabled = false
) {
  return useQuery({
    queryKey: chatKeys.reports(conversationId ?? '', 'PENDING'),
    queryFn: () => getConversationReports(conversationId!, 'PENDING'),
    enabled: Boolean(conversationId && enabled),
    staleTime: 20_000,
  });
}

export function useReviewReport(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: {
      reportId: string;
      status: 'RESOLVED' | 'DISMISSED';
      deleteMessage?: boolean;
      restrictSenderMinutes?: number;
    }) =>
      reviewReport(params.reportId, {
        status: params.status,
        deleteMessage: params.deleteMessage,
        restrictSenderMinutes: params.restrictSenderMinutes,
      }),
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.reports(conversationId) });
        void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      }
      toast.success(tToast('reportReviewed'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotReviewReport')));
    },
  });
}

export function useRestrictMember(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: {
      userId: string;
      restrictedUntil: string | null;
      reason?: string;
    }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return restrictMember(conversationId, params.userId, {
        restrictedUntil: params.restrictedUntil,
        reason: params.reason,
      });
    },
    onSuccess: (_res, vars) => {
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.members(conversationId) });
      }
      toast.success(
        vars.restrictedUntil ? tToast('memberRestricted') : tToast('memberUnrestricted')
      );
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotRestrictMember')));
    },
  });
}

export function useExamLock(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');
  return useMutation({
    mutationFn: (params: { locked: boolean; lockedUntil?: string | null; reason?: string }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return setExamLock(conversationId, params);
    },
    onSuccess: (_res, vars) => {
      if (conversationId) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
        void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'conversations'] });
      }
      toast.success(vars.locked ? tToast('examLockEnabled') : tToast('examLockDisabled'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotToggleExamLock')));
    },
  });
}
