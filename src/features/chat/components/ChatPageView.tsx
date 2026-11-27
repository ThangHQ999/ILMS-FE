'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ConfirmDialog, ErrorState } from '@/components/shared';
import { useCurrentUser } from '@/features/auth';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { useUserRole } from '@/hooks/useUserRole';
import {
  useChatMessages,
  useCreatePoll,
  useDeleteMessage,
  useEditMessage,
  useMarkConversationRead,
  useSendMessage,
  useTogglePinMessage,
  useToggleReaction,
  useVotePoll,
} from '../hooks/useChatMessages';
import {
  useClassChannel,
  useConversationDetail,
  useConversationMembers,
  useConversations,
  useCreateDirectConversation,
} from '../hooks/useConversations';
import {
  useExamLock,
  useInstructorAiDraft,
  useStudySessions,
  useStudyTimer,
  useSummarizeChat,
  useToggleBookmark,
} from '../hooks/useChatPhase2';
import { useChatRealtime } from '../hooks/useChatRealtime';
import { resolveChatTheme } from '../constants/chat-themes';
import type { ChatMessage, ShareableResourceItem } from '../schemas/chat.schema';
import type { ChatSummary } from '../schemas/chat-phase2.schema';
import { chatRealtimeService } from '../services/chat-realtime.service';
import { chatStore, useChatStore } from '../store/useChatStore';
import { isConversationLockedForUser } from '../utils/chat-message.utils';
import {
  ConversationInfoDrawer,
  type InfoAccordionKey,
} from './drawer/ConversationInfoDrawer';
import { ThreadDrawer } from './drawer/ThreadDrawer';
import { ChatSummaryModal } from './modals/ChatSummaryModal';
import { CodeSnippetModal } from './modals/CodeSnippetModal';
import { CreatePollModal } from './modals/CreatePollModal';
import { PromoteFaqModal } from './modals/PromoteFaqModal';
import { ReportMessageModal } from './modals/ReportMessageModal';
import { ScheduleMessageModal } from './modals/ScheduleMessageModal';
import { ShareResourcePickerModal } from './modals/ShareResourcePickerModal';
import { StudyMatchingModal } from './modals/StudyMatchingModal';
import { ConversationSidebar } from './sidebar/ConversationSidebar';
import { NewConversationModal } from './sidebar/NewConversationModal';
import { ChatComposer } from './thread/ChatComposer';
import { ChatEmptySelectionState } from './thread/ChatEmptySelectionState';
import { ChatMessageList } from './thread/ChatMessageList';
import { ChatThreadHeader } from './thread/ChatThreadHeader';
import { ExamLockBanner } from './thread/ExamLockBanner';
import { SyncPomodoroBar } from './thread/SyncPomodoroBar';

function hasDraggedFiles(dataTransfer: DataTransfer | null): boolean {
  return Boolean(dataTransfer && Array.from(dataTransfer.types).includes('Files'));
}

export function ChatPageView() {
  const tChat = useTranslations('chat');
  const tPage = useTranslations('chat.page');
  const tCommon = useTranslations('chat.common');
  const tComposer = useTranslations('chat.composer');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: currentUser } = useCurrentUser();
  const { isTeacher } = useUserRole();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapsed();

  // Always start real-time Soketi connection
  useChatRealtime();

  const paramConvId = searchParams.get('conversationId');
  const paramClassId = searchParams.get('classId');
  const paramCourseId = searchParams.get('courseId');
  const paramMsgId = searchParams.get('messageId');
  const paramUserId = searchParams.get('userId');
  const paramOpenMatching = searchParams.get('openMatching') === 'true';

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const rightPanelMode = useChatStore((s) => s.rightPanelMode);
  const activeThreadRootId = useChatStore((s) => s.activeThreadRootId);
  const realtimeStatus = useChatStore((s) => s.realtimeStatus);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const activePomodoroMap = useChatStore((s) => s.activePomodoroByConversation);

  // Modal UI state
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(paramOpenMatching);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pollPrefill, setPollPrefill] = useState<{
    question: string;
    options: string[];
  } | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [codeLang, setCodeLang] = useState('java');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [summaryModalData, setSummaryModalData] = useState<ChatSummary | null>(null);
  const [faqTarget, setFaqTarget] = useState<{
    rootMessage: ChatMessage;
    answerText: string;
  } | null>(null);
  const [infoInitialSection, setInfoInitialSection] =
    useState<InfoAccordionKey>('appearance');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [droppedFileRequest, setDroppedFileRequest] = useState<{
    id: number;
    file: File;
  } | null>(null);
  const dragDepthRef = React.useRef(0);
  const dropSeqRef = React.useRef(0);

  useEffect(() => {
    dragDepthRef.current = 0;
    setIsDraggingFile(false);
    setDroppedFileRequest(null);
  }, [activeConversationId]);

  const handleConsumedDroppedFile = React.useCallback(() => {
    setDroppedFileRequest(null);
  }, []);

  // Data queries
  const { data: allConversations = [] } = useConversations();
  const classChannelQuery = useClassChannel(paramClassId);
  const detailQuery = useConversationDetail(activeConversationId);
  const membersQuery = useConversationMembers(activeConversationId);
  const messagesQuery = useChatMessages(activeConversationId);
  const sessionsQuery = useStudySessions(
    activeConversationId,
    Boolean(activeConversationId && detailQuery.data?.type !== 'DIRECT')
  );

  // Sync URL query params -> activeConversationId
  useEffect(() => {
    const currentActiveId = chatStore.getState().activeConversationId;
    if (paramConvId) {
      if (paramConvId !== currentActiveId) {
        chatStore.setActiveConversation(paramConvId);
      }
      if (paramMsgId) {
        chatStore.setState({ highlightedMessageId: paramMsgId });
      }
      return;
    }
    if (paramClassId) {
      if (
        classChannelQuery.data?.id &&
        classChannelQuery.data.id !== currentActiveId
      ) {
        chatStore.setActiveConversation(classChannelQuery.data.id);
      }
      return;
    }
    if (paramUserId) {
      return;
    }
    if (currentActiveId !== null) {
      chatStore.setActiveConversation(null);
    }
  }, [paramConvId, paramClassId, paramMsgId, paramUserId, classChannelQuery.data?.id]);

  // Deep-link ?userId=<id> -> create or open 1-on-1 direct conversation (StrictMode-safe)
  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const createDirect = useCreateDirectConversation();
  const { mutateAsync: createDirectAsync } = createDirect;
  const handledDirectUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!paramUserId) {
      handledDirectUserIdRef.current = null;
      return;
    }
    if (currentUser?.id && paramUserId === currentUser.id) {
      router.replace('/chat', { scroll: false });
      return;
    }
    if (handledDirectUserIdRef.current === paramUserId) {
      return;
    }
    handledDirectUserIdRef.current = paramUserId;

    void createDirectAsync({ targetUserId: paramUserId })
      .then((conv) => {
        if (!isMountedRef.current || handledDirectUserIdRef.current !== paramUserId) {
          return;
        }
        chatStore.setActiveConversation(conv.id);
        router.replace(`/chat?conversationId=${encodeURIComponent(conv.id)}`, {
          scroll: false,
        });
      })
      .catch(() => {
        if (isMountedRef.current && handledDirectUserIdRef.current === paramUserId) {
          router.replace('/chat', { scroll: false });
        }
      });
  }, [paramUserId, currentUser?.id, createDirectAsync, router]);

  const activeConversation =
    detailQuery.data ??
    allConversations.find((c) => c.id === activeConversationId) ??
    null;

  const flatMessages = useMemo(
    () =>
      (messagesQuery.data?.pages ?? [])
        .slice()
        .reverse()
        .flatMap((page) => page.items),
    [messagesQuery.data?.pages]
  );

  const markReadMutation = useMarkConversationRead();
  const lastMarkedRef = React.useRef<string>('');
  const listConversation = useMemo(
    () => allConversations.find((c) => c.id === activeConversationId),
    [allConversations, activeConversationId]
  );
  useEffect(() => {
    if (!activeConversationId || flatMessages.length === 0) return;
    const latestMsg = flatMessages[flatMessages.length - 1];
    const latestId = latestMsg?.id;
    const unread = Math.max(
      detailQuery.data?.unreadCount ?? 0,
      listConversation?.unreadCount ?? 0
    );
    const key = `${activeConversationId}:${latestId}:${unread}`;
    if (
      unread > 0 &&
      latestId &&
      !latestMsg?.optimisticStatus &&
      !markReadMutation.isPending &&
      lastMarkedRef.current !== key
    ) {
      lastMarkedRef.current = key;
      markReadMutation.mutate({
        conversationId: activeConversationId,
        lastReadMessageId: latestId,
      });
    }
  }, [
    activeConversationId,
    detailQuery.data?.unreadCount,
    listConversation?.unreadCount,
    flatMessages,
    markReadMutation,
  ]);

  // Mutations
  const sendMsg = useSendMessage(activeConversationId);
  const editMsg = useEditMessage(activeConversationId);
  const deleteMsg = useDeleteMessage(activeConversationId);
  const reactionMutation = useToggleReaction(activeConversationId);
  const pinMutation = useTogglePinMessage(activeConversationId);
  const createPoll = useCreatePoll(activeConversationId);
  const votePoll = useVotePoll(activeConversationId);
  const summarizeMutation = useSummarizeChat();
  const aiDraftMutation = useInstructorAiDraft();
  const { saveMutation: bookmarkMutation } = useToggleBookmark();
  const examLockMutation = useExamLock(activeConversationId);
  const timerMutation = useStudyTimer(activeConversationId);

  const handleSelectConversation = (id: string) => {
    chatStore.setActiveConversation(id);
    router.replace(`/chat?conversationId=${encodeURIComponent(id)}`, { scroll: false });
  };

  const handleShareResource = async (item: ShareableResourceItem) => {
    await sendMsg.mutateAsync({
      messageType: 'RESOURCE_SHARE',
      sharedResource: {
        resourceType: item.resourceType,
        resourceId: item.resourceId,
      },
    });
  };

  const handleSlashPomodoro = (minutes: number) => {
    const activeSession = sessionsQuery.data?.[0];
    if (activeSession) {
      timerMutation.mutate({
        sessionId: activeSession.id,
        action: 'START_FOCUS',
        durationSeconds: minutes * 60,
      });
      return;
    }
    setInfoInitialSection('sessions');
    chatStore.setState({ rightPanelMode: 'info' });
  };

  const lockState = isConversationLockedForUser(activeConversation);
  const canDropFile = Boolean(activeConversation) && !lockState.locked;
  const isPeerOnline = Boolean(
    activeConversation?.type === 'DIRECT' &&
      activeConversation.peerUser?.id &&
      (onlineUsers[activeConversation.peerUser.id] || activeConversation.peerUser.isOnline)
  );

  const activePomodoro =
    (activeConversationId ? activePomodoroMap[activeConversationId] : null) ??
    sessionsQuery.data?.find((s) => s.timerState && s.timerState.phase !== 'IDLE')
      ?.timerState ??
    null;

  const activeTheme = resolveChatTheme(activeConversation?.themeKey);

  const userFullName =
    currentUser?.firstName || currentUser?.lastName
      ? `${currentUser.lastName || ''} ${currentUser.firstName || ''}`.trim()
      : '';

  return (
    <div className="h-dvh max-h-dvh overflow-hidden bg-[#F0F4F9] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3] flex flex-col">
      <DashboardSidebar
        isFocus={false}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((p) => !p)}
      />
      <DashboardHeader
        isFocus={false}
        showFocusMode={false}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMode={() => {}}
        userFullName={userFullName}
        title={tChat('title')}
      />

      <main
        className={`flex-1 min-h-0 pt-20 pb-4 px-3 sm:px-6 transition-all duration-300 flex gap-4 overflow-hidden ${
          isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
        }`}
      >
        {/* Column 1: Conversation Sidebar */}
        <div
          className={`${
            activeConversationId || paramConvId || paramClassId || paramUserId
              ? 'hidden md:flex'
              : 'flex'
          } w-full md:w-80 shrink-0 h-full min-h-0`}
        >
          <ConversationSidebar
            onSelectConversation={handleSelectConversation}
            onOpenNewModal={() => setShowNewModal(true)}
            onOpenMatchingModal={() => setShowMatchingModal(true)}
          />
        </div>

        {/* Column 2: Main Chat Thread */}
        <section
          onDragEnter={(e) => {
            if (!canDropFile || !hasDraggedFiles(e.dataTransfer)) return;
            e.preventDefault();
            dragDepthRef.current += 1;
            setIsDraggingFile(true);
          }}
          onDragOver={(e) => {
            if (!canDropFile || !hasDraggedFiles(e.dataTransfer)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDragLeave={(e) => {
            if (!canDropFile || !hasDraggedFiles(e.dataTransfer)) return;
            e.preventDefault();
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            if (dragDepthRef.current === 0) {
              setIsDraggingFile(false);
            }
          }}
          onDrop={(e) => {
            if (!canDropFile || !hasDraggedFiles(e.dataTransfer)) return;
            e.preventDefault();
            e.stopPropagation();
            dragDepthRef.current = 0;
            setIsDraggingFile(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              dropSeqRef.current += 1;
              setDroppedFileRequest({ id: dropSeqRef.current, file });
            }
          }}
          className={`relative ${
            activeConversationId || paramConvId || paramClassId || paramUserId
              ? 'flex'
              : 'hidden md:flex'
          } flex-1 min-w-0 min-h-0 ${
            activeConversation ? activeTheme.surfaceBgClass : 'bg-white dark:bg-[#1E1F20]'
          } rounded-3xl flex-col overflow-hidden shadow-xs dark:shadow-none h-full`}
        >
          {canDropFile && isDraggingFile && (
            <div className="pointer-events-none absolute inset-3 z-30 rounded-3xl border-2 border-dashed border-[#0B57D0] dark:border-[#A8C7FA] bg-white/85 dark:bg-[#1E1F20]/88 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-[#D3E3FD] dark:bg-[#162B4D] text-[#0B57D0] dark:text-[#A8C7FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">
                  cloud_upload
                </span>
              </div>
              <p className="text-base font-bold text-[#1F1F1F] dark:text-[#E3E3E3]">
                {tComposer('dropFileTitle')}
              </p>
              <p className="text-xs text-[#444746] dark:text-[#C4C7C5] max-w-xs">
                {tComposer('dropFileSubtitle')}
              </p>
            </div>
          )}
          {activeConversation && activeTheme.wallpaperUrl && (
            <div className="pointer-events-none absolute inset-0 z-0">
              <img
                src={activeTheme.wallpaperUrl}
                alt={activeTheme.label}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 ${activeTheme.wallpaperOverlayClass}`} />
            </div>
          )}

          <div className="relative z-10 flex-1 min-h-0 flex flex-col">
          {realtimeStatus === 'disconnected' && (
            <div className="px-4 py-1.5 bg-[#FCEBA4] dark:bg-[#3C2A1E] text-[#725200] dark:text-[#FFB784] text-[11px] font-medium text-center">
              {tChat('reconnecting')}
            </div>
          )}

          {paramClassId && classChannelQuery.isError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <ErrorState
                title={tPage('classChannelError')}
                onRetry={() => void classChannelQuery.refetch()}
              />
            </div>
          ) : paramConvId && detailQuery.isError && !activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
              <ErrorState
                title={tPage('conversationLoadError')}
                onRetry={() => void detailQuery.refetch()}
              />
              <button
                type="button"
                onClick={() => {
                  chatStore.setActiveConversation(null);
                  router.replace('/chat', { scroll: false });
                }}
                className="px-4 py-2 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C] text-xs font-semibold text-[#1F1F1F] dark:text-[#E3E3E3] cursor-pointer"
              >
                {tPage('backToChatHome')}
              </button>
            </div>
          ) : !activeConversation &&
            ((paramConvId && detailQuery.isLoading) ||
              (paramClassId && classChannelQuery.isLoading) ||
              paramUserId) ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-gray-500 dark:text-[#9AA0A6]">
              <div className="w-7 h-7 rounded-full border-2 border-[#0B57D0] border-t-transparent animate-spin" />
              <span className="text-sm font-medium">{tCommon('loading')}</span>
            </div>
          ) : !activeConversation ? (
            <ChatEmptySelectionState
              onOpenNewChat={() => setShowNewModal(true)}
              onOpenStudyMatching={() => setShowMatchingModal(true)}
            />
          ) : (
            <>
              <ChatThreadHeader
                key={`header-${activeConversation.id}`}
                conversation={activeConversation}
                isPeerOnline={isPeerOnline}
                onMobileBack={() => {
                  chatStore.setActiveConversation(null);
                  router.replace('/chat', { scroll: false });
                }}
                onSummarize={() => {
                  summarizeMutation.mutate(
                    {
                      kind: 'conversation',
                      targetId: activeConversation.id,
                    },
                    { onSuccess: setSummaryModalData }
                  );
                }}
                isSummarizing={summarizeMutation.isPending}
                onOpenSessions={() => {
                  setInfoInitialSection('sessions');
                  chatStore.setState({ rightPanelMode: 'info' });
                }}
              />

              <ExamLockBanner
                conversation={activeConversation}
                isUnlocking={examLockMutation.isPending}
                onUnlock={() =>
                  examLockMutation.mutate({ locked: false, lockedUntil: null })
                }
              />

              {activePomodoro && (
                <SyncPomodoroBar
                  timer={activePomodoro}
                  isControlling={timerMutation.isPending}
                  onControl={(sessionId, action, durationSeconds) =>
                    timerMutation.mutate({ sessionId, action, durationSeconds })
                  }
                />
              )}

              <ChatMessageList
                conversation={activeConversation}
                messages={flatMessages}
                currentUserId={currentUser?.id}
                isInstructor={isTeacher}
                isLockedForMe={lockState.locked}
                isLoading={messagesQuery.isLoading}
                isError={messagesQuery.isError}
                isFetchingNextPage={messagesQuery.isFetchingNextPage}
                hasNextPage={Boolean(messagesQuery.hasNextPage)}
                onFetchNextPage={() => messagesQuery.fetchNextPage()}
                onRetry={() => void messagesQuery.refetch()}
                onReaction={(messageId, emoji) =>
                  reactionMutation.mutate({ messageId, emoji })
                }
                onReply={(msg) => chatStore.setState({ replyToMessage: msg })}
                onOpenThread={(rootId) => chatStore.openThreadDrawer(rootId)}
                onAskAiAbout={(msg) => {
                  chatStore.setState({ replyToMessage: null });
                  sendMsg.mutate({
                    messageType: 'TEXT',
                    content: tPage('askAiPrompt', {
                      preview: msg.content?.slice(0, 120) || tPage('askAiFallbackSubject'),
                    }),
                    replyToMessageId: msg.id,
                  });
                }}
                onGenerateAiDraft={(messageId) => aiDraftMutation.mutate(messageId)}
                onBookmark={(messageId) => bookmarkMutation.mutate({ messageId })}
                onPin={(messageId) => pinMutation.mutate(messageId)}
                onEdit={async (messageId, content) => {
                  try {
                    await editMsg.mutateAsync({ messageId, content });
                  } catch {
                    // Handled by useEditMessage.onError
                  }
                }}
                onDelete={(messageId) => setDeleteTargetId(messageId)}
                onReport={(msg) => setReportTarget(msg)}
                onVotePoll={(pollId, optionIds) =>
                  votePoll.mutate({ pollId, optionIds })
                }
              />

              <ChatComposer
                key={`composer-${activeConversation.id}`}
                conversation={activeConversation}
                members={membersQuery.data ?? []}
                currentUserId={currentUser?.id}
                isLockedForMe={lockState.locked}
                lockReason={lockState.reason}
                isSending={sendMsg.isPending}
                droppedFileRequest={droppedFileRequest}
                onDroppedFileConsumed={handleConsumedDroppedFile}
                onSend={async (payload) => {
                  try {
                    await sendMsg.mutateAsync(payload);
                  } catch {
                    // Handled by useSendMessage.onError (toast + optimistic failed state)
                  }
                }}
                onTyping={(isTyping) => {
                  if (currentUser?.id && activeConversationId) {
                    chatRealtimeService.triggerClientTyping(activeConversationId, {
                      userId: currentUser.id,
                      fullName: userFullName || tCommon('member'),
                      isTyping,
                    });
                  }
                }}
                onOpenSharePicker={() => setShowShareModal(true)}
                onOpenPollModal={(prefill) => {
                  setPollPrefill(prefill ?? null);
                  setShowPollModal(true);
                }}
                onOpenCodeModal={(lang) => {
                  setCodeLang(lang || 'java');
                  setShowCodeModal(true);
                }}
                onOpenScheduleModal={() => setShowScheduleModal(true)}
                onSlashPomodoro={handleSlashPomodoro}
              />
            </>
          )}
          </div>
        </section>

        {/* Column 3: Info Drawer OR Thread Drawer */}
        {activeConversation && rightPanelMode !== 'none' && (
          <div className="fixed inset-0 z-40 xl:static xl:z-auto xl:h-full xl:min-h-0 flex justify-end bg-black/40 xl:bg-transparent">
            <div className="w-full max-w-sm xl:max-w-none h-full min-h-0 p-3 xl:p-0">
              {rightPanelMode === 'thread' && activeThreadRootId ? (
                <ThreadDrawer
                  rootMessageId={activeThreadRootId}
                  conversation={activeConversation}
                  isLockedForMe={lockState.locked}
                  isSummarizing={summarizeMutation.isPending}
                  onSummarizeThread={(rootId) => {
                    summarizeMutation.mutate(
                      { kind: 'thread', targetId: rootId },
                      { onSuccess: setSummaryModalData }
                    );
                  }}
                  onOpenPromoteFaq={(rootMessage, answerText) =>
                    setFaqTarget({ rootMessage, answerText })
                  }
                  onClose={() => chatStore.closeRightPanel()}
                />
              ) : (
                <ConversationInfoDrawer
                  key={`drawer-${activeConversation.id}`}
                  conversation={activeConversation}
                  members={membersQuery.data ?? []}
                  currentUserId={currentUser?.id}
                  initialOpenSection={infoInitialSection}
                  onClose={() => chatStore.closeRightPanel()}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <NewConversationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleSelectConversation}
      />
      <StudyMatchingModal
        isOpen={showMatchingModal}
        defaultClassId={paramClassId || activeConversation?.classId}
        defaultCourseId={paramCourseId || activeConversation?.courseId}
        onClose={() => setShowMatchingModal(false)}
        onOpenedConversation={handleSelectConversation}
      />
      <ShareResourcePickerModal
        isOpen={showShareModal}
        classId={activeConversation?.classId}
        courseId={activeConversation?.courseId}
        onClose={() => setShowShareModal(false)}
        onSelect={handleShareResource}
      />
      <CreatePollModal
        isOpen={showPollModal}
        prefill={pollPrefill}
        isSubmitting={createPoll.isPending}
        onClose={() => {
          setShowPollModal(false);
          setPollPrefill(null);
        }}
        onSubmit={async (payload) => {
          await createPoll.mutateAsync(payload);
        }}
      />
      <CodeSnippetModal
        isOpen={showCodeModal}
        initialLanguage={codeLang}
        isSubmitting={sendMsg.isPending}
        onClose={() => setShowCodeModal(false)}
        onSubmit={async (payload) => {
          await sendMsg.mutateAsync({
            messageType: 'CODE',
            content: payload.content,
            codeLanguage: payload.codeLanguage,
          });
        }}
      />
      <ScheduleMessageModal
        isOpen={showScheduleModal}
        conversationId={activeConversationId}
        onClose={() => setShowScheduleModal(false)}
      />
      <ReportMessageModal
        message={reportTarget}
        onClose={() => setReportTarget(null)}
      />
      <ChatSummaryModal
        summary={summaryModalData}
        onClose={() => setSummaryModalData(null)}
      />
      <PromoteFaqModal
        conversationId={activeConversationId}
        target={faqTarget}
        onClose={() => setFaqTarget(null)}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title={tPage('deleteConfirmTitle')}
        message={tPage('deleteConfirmMessage')}
        confirmText={tPage('deleteConfirmBtn')}
        variant="danger"
        isLoading={deleteMsg.isPending}
        onConfirm={() => {
          if (!deleteTargetId) return;
          deleteMsg.mutate(deleteTargetId, {
            onSuccess: () => setDeleteTargetId(null),
          });
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
