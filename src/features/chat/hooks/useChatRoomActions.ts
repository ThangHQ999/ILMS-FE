'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/sonner';
import { getUserFriendlyErrorMessage } from '@/lib/error-utils';
import { chatKeys } from '../constants/chat-query-keys';
import {
  addGroupMembers,
  leaveConversation,
  muteConversation,
  removeGroupMember,
  updateConversationAppearance,
  updateConversationSettings,
  updateMemberNickname,
} from '../services/chat.service';
import { chatStore } from '../store/useChatStore';

export function useChatRoomActions(conversationId: string | null) {
  const queryClient = useQueryClient();
  const tToast = useTranslations('chat.toasts');

  const invalidateRoom = () => {
    if (!conversationId) return;
    void queryClient.invalidateQueries({ queryKey: chatKeys.conversation(conversationId) });
    void queryClient.invalidateQueries({ queryKey: chatKeys.members(conversationId) });
    void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'conversations'] });
  };

  const appearanceMutation = useMutation({
    mutationFn: (payload: { themeKey?: string; defaultEmoji?: string }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return updateConversationAppearance(conversationId, payload);
    },
    onSuccess: (updated) => {
      if (conversationId) {
        queryClient.setQueryData(chatKeys.conversation(conversationId), updated);
      }
      invalidateRoom();
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotUpdateAppearance')));
    },
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: { name?: string; avatarUrl?: string; isReadOnly?: boolean }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return updateConversationSettings(conversationId, payload);
    },
    onSuccess: (updated) => {
      if (conversationId) {
        queryClient.setQueryData(chatKeys.conversation(conversationId), updated);
      }
      invalidateRoom();
      toast.success(tToast('settingsUpdated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotUpdateSettings')));
    },
  });

  const muteMutation = useMutation({
    mutationFn: (mutedUntil: string | null) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return muteConversation(conversationId, mutedUntil);
    },
    onSuccess: (_res, mutedUntil) => {
      invalidateRoom();
      toast.success(mutedUntil ? tToast('mutedSuccess') : tToast('unmutedSuccess'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotUpdateMute')));
    },
  });

  const nicknameMutation = useMutation({
    mutationFn: (params: { targetUserId: string; nickname: string | null }) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return updateMemberNickname(conversationId, params.targetUserId, params.nickname);
    },
    onSuccess: () => {
      invalidateRoom();
      toast.success(tToast('nicknameUpdated'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotUpdateNickname')));
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: (userIds: string[]) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return addGroupMembers(conversationId, userIds);
    },
    onSuccess: () => {
      invalidateRoom();
      toast.success(tToast('membersAdded'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotAddMembers')));
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return removeGroupMember(conversationId, userId);
    },
    onSuccess: () => {
      invalidateRoom();
      toast.success(tToast('memberRemoved'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotRemoveMember')));
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!conversationId) throw new Error(tToast('noConversationSelected'));
      return leaveConversation(conversationId);
    },
    onSuccess: () => {
      chatStore.setActiveConversation(null);
      chatStore.closeRightPanel();
      void queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'conversations'] });
      toast.success(tToast('leftGroupSuccess'));
    },
    onError: (err) => {
      toast.error(getUserFriendlyErrorMessage(err, tToast('cannotLeaveGroup')));
    },
  });

  return {
    appearanceMutation,
    settingsMutation,
    muteMutation,
    nicknameMutation,
    addMembersMutation,
    removeMemberMutation,
    leaveMutation,
  };
}
