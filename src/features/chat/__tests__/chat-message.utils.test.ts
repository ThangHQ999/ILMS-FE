import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  filterActiveMentionIds,
  filterConversations,
  formatChatFullTimestamp,
  formatChatHoverTooltip,
  formatChatTimestampDivider,
  getMessageSenderDisplayName,
  groupMessagesForDisplay,
  isAiMessage,
  isAiTriggerContent,
  isConversationLockedForUser,
  mergePollBroadcast,
  mergeReactionBroadcast,
  parseSlashCommand,
  resolveSharedResourceHref,
  upsertMessageInPages,
} from '../utils/chat-message.utils';
import type { ChatConversation, ChatMessage, ChatMessagePage } from '../schemas/chat.schema';

function makeMessage(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: 'm1',
    conversationId: 'c1',
    senderType: 'USER',
    senderDisplayName: 'Sinh viên A',
    isAnonymous: false,
    messageType: 'TEXT',
    content: 'Hello',
    mentionedUserIds: [],
    reactions: [],
    isPinned: false,
    isDeleted: false,
    createdAt: '2026-11-27T01:00:00.000Z',
    threadReplyCount: 0,
    citedSources: [],
    ...overrides,
  };
}

test('upsertMessageInPages deduplicates optimistic anonymous messages by clientTempId and preserves isMine', () => {
  const optimistic = makeMessage({
    id: 'temp-1',
    clientTempId: 'cli-123',
    isMine: true,
    isAnonymous: true,
    sender: null,
    senderDisplayName: 'Bạn (Ẩn danh)',
    optimisticStatus: 'sending',
  });
  const pages: ChatMessagePage[] = [{ items: [optimistic], hasMore: false }];

  const serverBroadcast = makeMessage({
    id: 'server-uuid-1',
    clientTempId: 'cli-123',
    isMine: undefined,
    isAnonymous: true,
    sender: null,
    senderDisplayName: 'Sinh viên ẩn danh',
  });

  const next = upsertMessageInPages(pages, serverBroadcast, 'user-1');
  assert.equal(next[0].items.length, 1);
  assert.equal(next[0].items[0].id, 'server-uuid-1');
  assert.equal(next[0].items[0].isMine, true);
  assert.equal(next[0].items[0].optimisticStatus, undefined);
});

test('mergeReactionBroadcast preserves reactedByMe for other viewers and updates only actor', () => {
  const existing = [{ emoji: '👍', count: 2, reactedByMe: true }];
  const broadcastFromPeer = {
    messageId: 'm1',
    actorUserId: 'user-other',
    emoji: '👍',
    action: 'ADDED' as const,
    reactions: [{ emoji: '👍', count: 3, reactedByMe: true }],
  };

  const mergedForMe = mergeReactionBroadcast(existing, broadcastFromPeer, 'user-me');
  assert.equal(mergedForMe[0].count, 3);
  assert.equal(mergedForMe[0].reactedByMe, true);

  const broadcastWithNewEmoji = {
    messageId: 'm1',
    actorUserId: 'user-other',
    emoji: '❤️',
    action: 'ADDED' as const,
    reactions: [
      { emoji: '👍', count: 3, reactedByMe: true },
      { emoji: '❤️', count: 1, reactedByMe: true },
    ],
  };
  const mergedNew = mergeReactionBroadcast(existing, broadcastWithNewEmoji, 'user-me');
  assert.equal(mergedNew[1].reactedByMe, false);
});

test('mergePollBroadcast preserves votedByMe for non-actor viewers', () => {
  const existingPoll = {
    id: 'poll-1',
    question: 'Học giờ nào?',
    allowMultiple: false,
    isClosed: false,
    totalVotes: 2,
    options: [
      { optionId: 'o1', text: '20h', voteCount: 2, percentage: 100, votedByMe: true },
      { optionId: 'o2', text: '21h', voteCount: 0, percentage: 0, votedByMe: false },
    ],
  };

  const broadcastFromPeer = {
    messageId: 'm-poll',
    actorUserId: 'user-other',
    actorSelectedOptionIds: ['o2'],
    poll: {
      ...existingPoll,
      totalVotes: 3,
      options: [
        { optionId: 'o1', text: '20h', voteCount: 2, percentage: 66.7, votedByMe: false },
        { optionId: 'o2', text: '21h', voteCount: 1, percentage: 33.3, votedByMe: true },
      ],
    },
  };

  const merged = mergePollBroadcast(existingPoll, broadcastFromPeer, 'user-me');
  assert.equal(merged.options[0].votedByMe, true);
  assert.equal(merged.options[1].votedByMe, false);
});

test('groupMessagesForDisplay groups consecutive same-sender messages within 2 minutes', () => {
  const m1 = makeMessage({
    id: 'm1',
    sender: { id: 'u1', fullName: 'An', isOnline: true },
    createdAt: '2026-11-27T01:00:00.000Z',
  });
  const m2 = makeMessage({
    id: 'm2',
    sender: { id: 'u1', fullName: 'An', isOnline: true },
    createdAt: '2026-11-27T01:01:00.000Z',
  });
  const m3 = makeMessage({
    id: 'm3',
    sender: { id: 'u1', fullName: 'An', isOnline: true },
    createdAt: '2026-11-27T01:05:00.000Z',
  });

  const grouped = groupMessagesForDisplay([m1, m2, m3]);
  assert.equal(grouped[0].isFirstInGroup, true);
  assert.equal(grouped[0].isLastInGroup, false);
  assert.equal(grouped[1].isFirstInGroup, false);
  assert.equal(grouped[1].isLastInGroup, true);
  assert.equal(grouped[2].isFirstInGroup, true);
  assert.equal(grouped[2].isLastInGroup, true);
});

test('parseSlashCommand handles /poll, /code, /ai, /pomodoro, /share', () => {
  assert.deepEqual(parseSlashCommand('/poll "Chốt lịch?" "Thứ 3" "Thứ 5"'), {
    kind: 'poll',
    question: 'Chốt lịch?',
    options: ['Thứ 3', 'Thứ 5'],
  });
  assert.deepEqual(parseSlashCommand('/code python'), {
    kind: 'code',
    language: 'python',
  });
  assert.deepEqual(parseSlashCommand('/ai Giải thích BFS'), {
    kind: 'ai',
    prompt: 'Giải thích BFS',
  });
  assert.deepEqual(parseSlashCommand('/pomodoro 30'), {
    kind: 'pomodoro',
    minutes: 30,
  });
  assert.deepEqual(parseSlashCommand('/share'), { kind: 'share' });
});

test('resolveSharedResourceHref maps every resourceType to real FE routes', () => {
  assert.equal(
    resolveSharedResourceHref({ resourceType: 'COURSE', resourceId: 'c-1' }),
    '/courses/c-1'
  );
  assert.equal(
    resolveSharedResourceHref({
      resourceType: 'QUIZ',
      resourceId: 'q-1',
      classId: 'cl-1',
      courseId: 'co-1',
    }),
    '/classes/cl-1/assessments/q-1/play?type=quiz&courseId=co-1'
  );
  assert.equal(
    resolveSharedResourceHref({
      resourceType: 'CONCEPT',
      resourceId: 'node-1',
      courseId: 'co-1',
      conceptCode: 'GRAPH_BFS',
    }),
    '/knowledge-graph?courseId=co-1&concept=GRAPH_BFS'
  );
});

test('isConversationLockedForUser enforces readOnly, examLock, and restriction correctly', () => {
  const baseConv: ChatConversation = {
    id: 'c1',
    type: 'CLASS_CHANNEL',
    themeKey: 'DEFAULT',
    defaultEmoji: '👍',
    isReadOnly: true,
    myRole: 'MEMBER',
    unreadCount: 0,
    memberCount: 10,
    pinnedCount: 0,
  };
  assert.deepEqual(isConversationLockedForUser(baseConv), {
    locked: true,
    reason: 'READ_ONLY',
  });
  assert.deepEqual(isConversationLockedForUser({ ...baseConv, myRole: 'ADMIN' }), {
    locked: false,
    reason: null,
  });
  assert.deepEqual(
    isConversationLockedForUser({
      ...baseConv,
      isReadOnly: false,
      lockedUntil: new Date(Date.now() + 60_000).toISOString(),
    }),
    { locked: true, reason: 'EXAM_LOCK' }
  );
});

test('groupMessagesForDisplay inserts timestamp divider on >= 15m inactivity gap and formats 3 tiers across vi/en', () => {
  // Reference "now": Friday, 2026-11-27 15:00 local time
  const now = new Date(2026, 10, 27, 15, 0, 0);

  // Older than 7 days: 2026-11-16 19:15 local
  const oldIso = new Date(2026, 10, 16, 19, 15, 0).toISOString();
  assert.equal(
    formatChatTimestampDivider(oldIso, { now, locale: 'vi' }),
    '19:15 16 Tháng 11, 2026'
  );
  assert.equal(
    formatChatTimestampDivider(oldIso, { now, locale: 'en' }),
    '19:15 Nov 16, 2026'
  );

  // Different day within last 7 days: Tuesday 2026-11-24 15:58 local (dayDiff = 3)
  const tueIso = new Date(2026, 10, 24, 15, 58, 0).toISOString();
  assert.equal(
    formatChatTimestampDivider(tueIso, { now, locale: 'vi' }),
    '15:58 T3'
  );
  assert.equal(
    formatChatTimestampDivider(tueIso, { now, locale: 'en' }),
    '15:58 Tue'
  );

  // Sunday within last 7 days: 2026-11-22 09:05 local (dayDiff = 5)
  const sunIso = new Date(2026, 10, 22, 9, 5, 0).toISOString();
  assert.equal(
    formatChatTimestampDivider(sunIso, { now, locale: 'vi' }),
    '09:05 CN'
  );
  assert.equal(
    formatChatTimestampDivider(sunIso, { now, locale: 'en' }),
    '09:05 Sun'
  );

  // Today: 14:10, 14:20 (< 15m gap), 14:38 (>= 15m gap)
  const today1 = new Date(2026, 10, 27, 14, 10, 0).toISOString();
  const today2 = new Date(2026, 10, 27, 14, 20, 0).toISOString();
  const today3 = new Date(2026, 10, 27, 14, 38, 0).toISOString();

  const grouped = groupMessagesForDisplay(
    [
      makeMessage({
        id: 'g1',
        sender: { id: 'u1', fullName: 'An', isOnline: true },
        createdAt: today1,
      }),
      makeMessage({
        id: 'g2',
        sender: { id: 'u1', fullName: 'An', isOnline: true },
        createdAt: today2,
      }),
      makeMessage({
        id: 'g3',
        sender: { id: 'u1', fullName: 'An', isOnline: true },
        createdAt: today3,
      }),
    ],
    { now, locale: 'vi' }
  );

  assert.equal(grouped[0].showDateDivider, true);
  assert.equal(grouped[0].dateDividerLabel, '14:10');
  assert.equal(grouped[1].showDateDivider, false);
  assert.equal(grouped[2].showDateDivider, true);
  assert.equal(grouped[2].dateDividerLabel, '14:38');
  assert.equal(grouped[2].isFirstInGroup, true);
  assert.equal(
    formatChatFullTimestamp(today3, { locale: 'vi' }),
    '14:38 27 Tháng 11, 2026'
  );

  // Hover tooltip formats across 3 tiers (today, within 7 days full weekday, older full date)
  const thuIso = new Date(2026, 10, 26, 22, 59, 0).toISOString();
  const todayHoverIso = new Date(2026, 10, 27, 14, 12, 0).toISOString();
  assert.equal(
    formatChatHoverTooltip(todayHoverIso, { now, locale: 'vi' }),
    '14:12'
  );
  assert.equal(
    formatChatHoverTooltip(thuIso, { now, locale: 'vi' }),
    'Thứ Năm 22:59'
  );
  assert.equal(
    formatChatHoverTooltip(thuIso, { now, locale: 'en' }),
    'Thursday 22:59'
  );
  assert.equal(
    formatChatHoverTooltip(oldIso, { now, locale: 'vi' }),
    '19:15 16 Tháng 11, 2026'
  );
  assert.equal(
    formatChatHoverTooltip(oldIso, { now, locale: 'en' }),
    '19:15 Nov 16, 2026'
  );
});

test('chat.timestamp, emptySelection, and emptyConversation i18n keys match symmetrically between vi.json and en.json', () => {
  const viJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/messages/vi.json'), 'utf8')
  ) as {
    chat?: {
      timestamp?: Record<string, unknown>;
      emptySelection?: Record<string, unknown>;
      emptyConversation?: Record<string, unknown>;
    };
  };
  const enJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'src/messages/en.json'), 'utf8')
  ) as {
    chat?: {
      timestamp?: Record<string, unknown>;
      emptySelection?: Record<string, unknown>;
      emptyConversation?: Record<string, unknown>;
    };
  };

  const viTs = viJson.chat?.timestamp;
  const enTs = enJson.chat?.timestamp;
  assert.ok(viTs && enTs);
  assert.deepEqual(Object.keys(viTs).sort(), Object.keys(enTs).sort());
  assert.deepEqual(
    Object.keys(viTs.weekdaysShort as Record<string, string>).sort(),
    Object.keys(enTs.weekdaysShort as Record<string, string>).sort()
  );
  assert.deepEqual(
    Object.keys(viTs.weekdaysFull as Record<string, string>).sort(),
    Object.keys(enTs.weekdaysFull as Record<string, string>).sort()
  );
  assert.deepEqual(
    Object.keys(viTs.months as Record<string, string>).sort(),
    Object.keys(enTs.months as Record<string, string>).sort()
  );

  const viSel = viJson.chat?.emptySelection;
  const enSel = enJson.chat?.emptySelection;
  assert.ok(viSel && enSel);
  assert.deepEqual(Object.keys(viSel).sort(), Object.keys(enSel).sort());

  const viConv = viJson.chat?.emptyConversation;
  const enConv = enJson.chat?.emptyConversation;
  assert.ok(viConv && enConv);
  assert.deepEqual(Object.keys(viConv).sort(), Object.keys(enConv).sort());
});

test('filterConversations handles ALL, UNREAD, STUDY_GROUP, CLASS_CHANNEL and accent-insensitive Vietnamese search', () => {
  const sample: ChatConversation[] = [
    {
      id: 'c-direct',
      type: 'DIRECT',
      themeKey: 'DEFAULT',
      defaultEmoji: '👍',
      isReadOnly: false,
      myRole: 'MEMBER',
      unreadCount: 0,
      memberCount: 2,
      pinnedCount: 0,
      peerUser: { id: 'u1', fullName: 'Tuệ Hoàng', email: 'tue@example.com', isOnline: false },
    },
    {
      id: 'c-group',
      type: 'STUDY_GROUP',
      name: 'Nhóm Toán Rời Rạc',
      themeKey: 'DEFAULT',
      defaultEmoji: '👍',
      isReadOnly: false,
      myRole: 'ADMIN',
      unreadCount: 3,
      memberCount: 5,
      pinnedCount: 0,
    },
    {
      id: 'c-class',
      type: 'CLASS_CHANNEL',
      name: 'Kênh lớp CT101',
      className: 'CT101',
      themeKey: 'DEFAULT',
      defaultEmoji: '👍',
      isReadOnly: false,
      myRole: 'MEMBER',
      unreadCount: 1,
      memberCount: 40,
      pinnedCount: 0,
    },
  ];

  assert.equal(filterConversations(sample, { tab: 'ALL' }).length, 3);
  assert.deepEqual(
    filterConversations(sample, { tab: 'UNREAD' }).map((c) => c.id),
    ['c-group', 'c-class']
  );
  assert.deepEqual(
    filterConversations(sample, { tab: 'STUDY_GROUP' }).map((c) => c.id),
    ['c-group']
  );
  assert.deepEqual(
    filterConversations(sample, { tab: 'CLASS_CHANNEL' }).map((c) => c.id),
    ['c-class']
  );
  assert.deepEqual(
    filterConversations(sample, { tab: 'ALL', query: 'tue hoang' }).map((c) => c.id),
    ['c-direct']
  );
  assert.deepEqual(
    filterConversations(sample, { tab: 'ALL', query: 'nhom toan roi rac' }).map((c) => c.id),
    ['c-group']
  );
});

test('filterActiveMentionIds only keeps users whose @mention remains in content', () => {
  const tracked = [
    { userId: 'u1', label: 'Nguyễn A' },
    { userId: 'u2', label: 'Trần B' },
    { userId: 'u1', label: 'Nguyễn A' },
  ];
  assert.deepEqual(
    filterActiveMentionIds('Chào @Nguyễn A nha, nhờ bạn xem giúp', tracked),
    ['u1']
  );
  assert.deepEqual(filterActiveMentionIds('Tin nhắn không còn tag ai', tracked), []);
});

test('isAiTriggerContent, isAiMessage, and getMessageSenderDisplayName localize AI names cleanly', () => {
  assert.equal(isAiTriggerContent('@AI giải thích giúp mình'), true);
  assert.equal(isAiTriggerContent('Nhờ @ai phân tích câu này'), true);
  assert.equal(isAiTriggerContent('@airdrop token'), false);
  assert.equal(isAiTriggerContent(''), false);
  assert.equal(isAiTriggerContent(null), false);

  const aiMsg = makeMessage({
    senderType: 'AI',
    messageType: 'AI_REPLY',
    senderDisplayName: 'Trợ giảng AI',
  });
  const humanMsg = makeMessage({
    senderType: 'USER',
    messageType: 'TEXT',
    senderDisplayName: 'Minh Thư',
  });

  assert.equal(isAiMessage(aiMsg), true);
  assert.equal(isAiMessage(humanMsg), false);
  assert.equal(
    getMessageSenderDisplayName(aiMsg, {
      aiSenderName: 'AI Teaching Assistant',
      fallbackUser: 'User',
    }),
    'AI Teaching Assistant'
  );
  assert.equal(
    getMessageSenderDisplayName(humanMsg, {
      aiSenderName: 'AI Teaching Assistant',
      fallbackUser: 'User',
    }),
    'Minh Thư'
  );
});
