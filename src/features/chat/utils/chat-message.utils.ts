import type { SidebarFilterTab } from '../store/useChatStore';
import type {
  ChatConversation,
  ChatMessage,
  ChatMessagePage,
  ChatPoll,
  ChatReactionSummary,
  PollBroadcastPayload,
  ReactionBroadcastPayload,
  SharedResourceMeta,
} from '../schemas/chat.schema';

const GROUP_WINDOW_MS = 2 * 60 * 1000;
export const TIMESTAMP_GAP_MS = 15 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface ChatTimestampLabels {
  weekdaysShort: Record<number, string>;
  weekdaysFull?: Record<number, string>;
  months: Record<number, string>;
  formatWeekday: (time: string, weekday: string) => string;
  formatTooltipWeekday?: (weekday: string, time: string) => string;
  formatFullDate: (params: {
    time: string;
    day: number;
    month: string;
    year: number;
  }) => string;
}

export interface ChatTimestampOptions {
  now?: Date;
  locale?: string;
  labels?: ChatTimestampLabels;
  gapMs?: number;
}

export interface DisplayGroupedMessage {
  message: ChatMessage;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showDateDivider: boolean;
  dateDividerLabel: string;
}

export function resolveIsMine(
  message: Pick<ChatMessage, 'isMine' | 'sender'>,
  currentUserId?: string | null
): boolean {
  if (message.isMine === true) return true;
  if (currentUserId && message.sender?.id) {
    return message.sender.id === currentUserId;
  }
  return false;
}

/**
 * Inserts or updates an incoming message inside TanStack Query infinite pages.
 * Handles deduplication across both `id` and `clientTempId` and preserves `isMine`
 * for anonymous optimistic messages when broadcast back via Soketi.
 */
export function upsertMessageInPages(
  pages: ChatMessagePage[],
  incoming: ChatMessage,
  currentUserId?: string | null
): ChatMessagePage[] {
  const computedMine = resolveIsMine(incoming, currentUserId);
  const normalizedIncoming: ChatMessage = {
    ...incoming,
    isMine: computedMine,
    optimisticStatus: undefined,
  };

  let replaced = false;
  const nextPages = pages.map((page) => {
    const idx = page.items.findIndex(
      (item) =>
        item.id === normalizedIncoming.id ||
        (Boolean(normalizedIncoming.clientTempId) &&
          item.clientTempId === normalizedIncoming.clientTempId)
    );
    if (idx === -1) return page;
    replaced = true;
    const prevItem = page.items[idx];
    const merged: ChatMessage = {
      ...normalizedIncoming,
      isMine: prevItem.isMine || computedMine,
    };
    const nextItems = [...page.items];
    nextItems[idx] = merged;
    return { ...page, items: nextItems };
  });

  if (replaced) return nextPages;

  if (nextPages.length === 0) {
    return [
      {
        items: [normalizedIncoming],
        hasMore: false,
      },
    ];
  }

  // Page 0 holds the latest window of messages in chronological order
  const firstPage = nextPages[0];
  const nextItems = [...firstPage.items, normalizedIncoming].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
  return [{ ...firstPage, items: nextItems }, ...nextPages.slice(1)];
}

/**
 * Safely merges a shared Soketi `REACTION_UPDATED` broadcast without letting
 * the actor's `reactedByMe` overwrite another viewer's `reactedByMe` flag.
 */
export function mergeReactionBroadcast(
  existing: ChatReactionSummary[],
  payload: ReactionBroadcastPayload,
  currentUserId?: string | null
): ChatReactionSummary[] {
  const isActorSelf = Boolean(currentUserId && payload.actorUserId === currentUserId);
  const prevByEmoji = new Map(existing.map((r) => [r.emoji, r.reactedByMe]));

  return payload.reactions.map((item) => {
    if (isActorSelf && payload.emoji === item.emoji && payload.action) {
      return {
        ...item,
        reactedByMe: payload.action === 'ADDED',
      };
    }
    return {
      ...item,
      reactedByMe: prevByEmoji.get(item.emoji) ?? (isActorSelf ? item.reactedByMe : false),
    };
  });
}

/**
 * Safely merges a shared Soketi `POLL_UPDATED` broadcast without letting
 * the actor's `votedByMe` overwrite another viewer's `votedByMe` flag.
 */
export function mergePollBroadcast(
  existing: ChatPoll | null | undefined,
  payload: PollBroadcastPayload,
  currentUserId?: string | null
): ChatPoll {
  const isActorSelf = Boolean(currentUserId && payload.actorUserId === currentUserId);
  const prevVotedByOption = new Map(
    (existing?.options ?? []).map((opt) => [opt.optionId, opt.votedByMe])
  );
  const actorPicked = new Set(payload.actorSelectedOptionIds ?? []);

  return {
    ...payload.poll,
    options: payload.poll.options.map((opt) => {
      if (isActorSelf) {
        return {
          ...opt,
          votedByMe:
            payload.actorSelectedOptionIds != null
              ? actorPicked.has(opt.optionId)
              : opt.votedByMe,
        };
      }
      return {
        ...opt,
        votedByMe: prevVotedByOption.get(opt.optionId) ?? false,
      };
    }),
  };
}

function getDefaultTimestampLabels(locale?: string): ChatTimestampLabels {
  const isEn = locale?.toLowerCase().startsWith('en') ?? false;
  if (isEn) {
    return {
      weekdaysShort: {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat',
      },
      weekdaysFull: {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
      },
      months: {
        1: 'Jan',
        2: 'Feb',
        3: 'Mar',
        4: 'Apr',
        5: 'May',
        6: 'Jun',
        7: 'Jul',
        8: 'Aug',
        9: 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec',
      },
      formatWeekday: (time, weekday) => `${time} ${weekday}`,
      formatTooltipWeekday: (weekday, time) => `${weekday} ${time}`,
      formatFullDate: ({ time, day, month, year }) =>
        `${time} ${month} ${day}, ${year}`,
    };
  }

  return {
    weekdaysShort: {
      0: 'CN',
      1: 'T2',
      2: 'T3',
      3: 'T4',
      4: 'T5',
      5: 'T6',
      6: 'T7',
    },
    weekdaysFull: {
      0: 'Chủ Nhật',
      1: 'Thứ Hai',
      2: 'Thứ Ba',
      3: 'Thứ Tư',
      4: 'Thứ Năm',
      5: 'Thứ Sáu',
      6: 'Thứ Bảy',
    },
    months: {
      1: 'Tháng 1',
      2: 'Tháng 2',
      3: 'Tháng 3',
      4: 'Tháng 4',
      5: 'Tháng 5',
      6: 'Tháng 6',
      7: 'Tháng 7',
      8: 'Tháng 8',
      9: 'Tháng 9',
      10: 'Tháng 10',
      11: 'Tháng 11',
      12: 'Tháng 12',
    },
    formatWeekday: (time, weekday) => `${time} ${weekday}`,
    formatTooltipWeekday: (weekday, time) => `${weekday} ${time}`,
    formatFullDate: ({ time, day, month, year }) =>
      `${time} ${day} ${month}, ${year}`,
  };
}

function isSameLocalCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHourMinute(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats full date-time string for message hover tooltip across all locales.
 */
export function formatChatFullTimestamp(
  iso: string,
  options?: ChatTimestampOptions
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const labels = options?.labels ?? getDefaultTimestampLabels(options?.locale);
  const time = formatHourMinute(date);
  const month = labels.months[date.getMonth() + 1] ?? String(date.getMonth() + 1);
  return labels.formatFullDate({
    time,
    day: date.getDate(),
    month,
    year: date.getFullYear(),
  });
}

/**
 * Formats Messenger-style 3-tier timestamp divider:
 * - Today: HH:mm (e.g. "14:38")
 * - Within 7 days: HH:mm + short weekday (e.g. "15:58 T3" / "15:58 Tue")
 * - Older (>= 7 days): full date & time (e.g. "19:15 16 Tháng 11, 2026" / "19:15 Nov 16, 2026")
 */
export function formatChatTimestampDivider(
  iso: string,
  options?: ChatTimestampOptions
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = options?.now ?? new Date();
  const labels = options?.labels ?? getDefaultTimestampLabels(options?.locale);
  const time = formatHourMinute(date);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfMsgDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  const dayDiff = Math.round((startOfToday - startOfMsgDay) / ONE_DAY_MS);

  if (dayDiff === 0) {
    return time;
  }

  if (dayDiff >= 1 && dayDiff < 7) {
    const weekday = labels.weekdaysShort[date.getDay()] ?? '';
    return labels.formatWeekday(time, weekday).trim();
  }

  const month = labels.months[date.getMonth() + 1] ?? String(date.getMonth() + 1);
  return labels.formatFullDate({
    time,
    day: date.getDate(),
    month,
    year: date.getFullYear(),
  });
}

/**
 * Formats Messenger-style floating hover tooltip timestamp:
 * - Today: HH:mm (e.g. "14:12")
 * - Within 7 days: full weekday + HH:mm (e.g. "Thứ Năm 22:59" / "Thursday 22:59")
 * - Older (>= 7 days): full date & time (e.g. "19:15 16 Tháng 11, 2026" / "19:15 Nov 16, 2026")
 */
export function formatChatHoverTooltip(
  iso: string,
  options?: ChatTimestampOptions
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = options?.now ?? new Date();
  const defaults = getDefaultTimestampLabels(options?.locale);
  const labels = options?.labels ?? defaults;
  const time = formatHourMinute(date);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfMsgDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  const dayDiff = Math.round((startOfToday - startOfMsgDay) / ONE_DAY_MS);

  if (dayDiff === 0) {
    return time;
  }

  if (dayDiff >= 1 && dayDiff < 7) {
    const dayIdx = date.getDay();
    const weekday =
      labels.weekdaysFull?.[dayIdx] ??
      defaults.weekdaysFull?.[dayIdx] ??
      labels.weekdaysShort[dayIdx] ??
      '';
    const formatter = labels.formatTooltipWeekday ?? defaults.formatTooltipWeekday;
    return (formatter ? formatter(weekday, time) : `${weekday} ${time}`).trim();
  }

  const month = labels.months[date.getMonth() + 1] ?? String(date.getMonth() + 1);
  return labels.formatFullDate({
    time,
    day: date.getDate(),
    month,
    year: date.getFullYear(),
  });
}

/**
 * Groups consecutive messages from the same sender within 2 minutes and inserts
 * Messenger-style timestamp dividers on day changes or >= 15 minute inactivity gaps.
 */
export function groupMessagesForDisplay(
  messages: ChatMessage[],
  options?: ChatTimestampOptions
): DisplayGroupedMessage[] {
  const gapMs = options?.gapMs ?? TIMESTAMP_GAP_MS;
  const ordered = [...messages].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );

  return ordered.map((msg, idx) => {
    const prev = idx > 0 ? ordered[idx - 1] : null;
    const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;

    const currDate = new Date(msg.createdAt);
    const prevDate = prev ? new Date(prev.createdAt) : null;
    const nextDate = next ? new Date(next.createdAt) : null;

    const sameDayAsPrev =
      Boolean(prevDate) &&
      !Number.isNaN(currDate.getTime()) &&
      !Number.isNaN(prevDate!.getTime()) &&
      isSameLocalCalendarDay(prevDate!, currDate);

    const gapFromPrev =
      prevDate &&
      !Number.isNaN(currDate.getTime()) &&
      !Number.isNaN(prevDate.getTime())
        ? currDate.getTime() - prevDate.getTime() >= gapMs
        : false;

    const showDateDivider = !prev || !sameDayAsPrev || gapFromPrev;

    const canGroupWith = (other: ChatMessage | null): boolean => {
      if (!other) return false;
      if (msg.senderType === 'SYSTEM' || other.senderType === 'SYSTEM') return false;
      if (msg.senderType !== other.senderType) return false;
      if (msg.isAnonymous !== other.isAnonymous) return false;
      if (msg.isAnonymous && other.isAnonymous) {
        return Boolean(msg.isMine) === Boolean(other.isMine) &&
          Math.abs(Date.parse(msg.createdAt) - Date.parse(other.createdAt)) <= GROUP_WINDOW_MS;
      }
      const sameSender =
        msg.senderType === 'AI'
          ? other.senderType === 'AI'
          : Boolean(msg.sender?.id && msg.sender.id === other.sender?.id);
      if (!sameSender) return false;
      return (
        Math.abs(Date.parse(msg.createdAt) - Date.parse(other.createdAt)) <=
        GROUP_WINDOW_MS
      );
    };

    const groupedPrev = !showDateDivider && canGroupWith(prev);

    const sameDayAsNext =
      Boolean(nextDate) &&
      !Number.isNaN(currDate.getTime()) &&
      !Number.isNaN(nextDate!.getTime()) &&
      isSameLocalCalendarDay(currDate, nextDate!);

    const gapToNext =
      nextDate &&
      !Number.isNaN(currDate.getTime()) &&
      !Number.isNaN(nextDate.getTime())
        ? nextDate.getTime() - currDate.getTime() >= gapMs
        : false;

    const groupedNext = Boolean(next) && sameDayAsNext && !gapToNext && canGroupWith(next);

    return {
      message: msg,
      isFirstInGroup: !groupedPrev,
      isLastInGroup: !groupedNext,
      showDateDivider,
      dateDividerLabel: showDateDivider
        ? formatChatTimestampDivider(msg.createdAt, options)
        : '',
    };
  });
}

export type ParsedSlashCommand =
  | { kind: 'poll'; question: string; options: string[] }
  | { kind: 'code'; language: string }
  | { kind: 'ai'; prompt: string }
  | { kind: 'pomodoro'; minutes: number }
  | { kind: 'share' }
  | null;

export function parseSlashCommand(rawInput: string): ParsedSlashCommand {
  const input = rawInput.trim();
  if (!input.startsWith('/')) return null;

  if (input === '/share' || input.startsWith('/share ')) {
    return { kind: 'share' };
  }

  if (input.startsWith('/ai')) {
    const prompt = input.slice(3).trim();
    return { kind: 'ai', prompt };
  }

  if (input.startsWith('/code')) {
    const language = input.slice(5).trim().toLowerCase() || 'java';
    return { kind: 'code', language };
  }

  if (input.startsWith('/pomodoro')) {
    const rawNum = Number(input.slice(9).trim());
    const minutes =
      Number.isFinite(rawNum) && rawNum >= 5 && rawNum <= 120 ? Math.round(rawNum) : 25;
    return { kind: 'pomodoro', minutes };
  }

  if (input.startsWith('/poll')) {
    const quoted = Array.from(input.matchAll(/"([^"]+)"/g)).map((m) => m[1].trim());
    if (quoted.length >= 3) {
      return {
        kind: 'poll',
        question: quoted[0],
        options: quoted.slice(1, 11),
      };
    }
    return {
      kind: 'poll',
      question: input.slice(5).trim(),
      options: [],
    };
  }

  return null;
}

/**
 * Maps a shared ILMS resource metadata object to its real Next.js App Router path.
 */
export function resolveSharedResourceHref(
  meta: Pick<
    SharedResourceMeta,
    'resourceType' | 'resourceId' | 'url' | 'courseId' | 'classId' | 'conceptCode'
  >
): string {
  switch (meta.resourceType) {
    case 'COURSE':
      return `/courses/${encodeURIComponent(meta.resourceId)}`;
    case 'LESSON':
      return meta.courseId
        ? `/courses/${encodeURIComponent(meta.courseId)}/lessons/${encodeURIComponent(meta.resourceId)}`
        : '/courses';
    case 'QUIZ':
      return meta.classId
        ? `/classes/${encodeURIComponent(meta.classId)}/assessments/${encodeURIComponent(meta.resourceId)}/play?type=quiz${
            meta.courseId ? `&courseId=${encodeURIComponent(meta.courseId)}` : ''
          }`
        : `/assignments/${encodeURIComponent(meta.resourceId)}`;
    case 'EXAM':
      return meta.classId
        ? `/classes/${encodeURIComponent(meta.classId)}/assessments/${encodeURIComponent(meta.resourceId)}/play?type=exam${
            meta.courseId ? `&courseId=${encodeURIComponent(meta.courseId)}` : ''
          }`
        : `/assignments/${encodeURIComponent(meta.resourceId)}`;
    case 'ASSIGNMENT':
      return meta.classId
        ? `/classes/${encodeURIComponent(meta.classId)}/assignments/${encodeURIComponent(meta.resourceId)}`
        : `/assignments/${encodeURIComponent(meta.resourceId)}`;
    case 'CONCEPT': {
      const params = new URLSearchParams();
      if (meta.courseId) params.set('courseId', meta.courseId);
      params.set('concept', meta.conceptCode || meta.resourceId);
      return `/knowledge-graph?${params.toString()}`;
    }
    case 'MATERIAL':
    case 'FILE':
    default:
      if (meta.url) return meta.url;
      if (meta.classId) {
        return `/classes/${encodeURIComponent(meta.classId)}?tab=materials`;
      }
      return `/materials?highlight=${encodeURIComponent(meta.resourceId)}`;
  }
}

export interface RelativeChatTimeOptions {
  locale?: string;
  labels?: {
    justNow: string;
    minutesAgo: (n: number) => string;
    hoursAgo: (n: number) => string;
    daysAgo: (n: number) => string;
  };
}

export function formatRelativeChatTime(
  iso?: string | null,
  options?: RelativeChatTimeOptions
): string {
  if (!iso) return '';
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';
  const isEn = options?.locale?.toLowerCase().startsWith('en') ?? false;
  const labels = options?.labels ?? {
    justNow: isEn ? 'Just now' : 'Vừa xong',
    minutesAgo: (n: number) => (isEn ? `${n}m` : `${n} phút`),
    hoursAgo: (n: number) => (isEn ? `${n}h` : `${n} giờ`),
    daysAgo: (n: number) => (isEn ? `${n}d` : `${n} ngày`),
  };

  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return labels.justNow;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return labels.minutesAgo(diffMin);
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return labels.hoursAgo(diffHours);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return labels.daysAgo(diffDays);
  return new Date(ts).toLocaleDateString(isEn ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function getConversationDisplayName(
  conv: ChatConversation,
  fallbacks?: { directFallback?: string; groupFallback?: string }
): string {
  if (conv.type === 'DIRECT') {
    return (
      conv.peerUser?.fullName ||
      conv.name ||
      fallbacks?.directFallback ||
      'Cuộc trò chuyện'
    );
  }
  return conv.name || conv.className || fallbacks?.groupFallback || 'Nhóm học tập';
}

export function getConversationDisplayAvatar(conv: ChatConversation): string | null {
  if (conv.type === 'DIRECT') {
    return conv.peerUser?.avatarUrl || conv.avatarUrl || null;
  }
  return conv.avatarUrl || null;
}

export function isConversationLockedForUser(conv?: ChatConversation | null): {
  locked: boolean;
  reason: 'RESTRICTED' | 'EXAM_LOCK' | 'READ_ONLY' | null;
} {
  if (!conv) return { locked: false, reason: null };
  const now = Date.now();
  if (conv.myRestrictedUntil && Date.parse(conv.myRestrictedUntil) > now) {
    return { locked: true, reason: 'RESTRICTED' };
  }
  if (conv.myRole === 'ADMIN') {
    return { locked: false, reason: null };
  }
  if (conv.lockedUntil && Date.parse(conv.lockedUntil) > now) {
    return { locked: true, reason: 'EXAM_LOCK' };
  }
  if (conv.isReadOnly) {
    return { locked: true, reason: 'READ_ONLY' };
  }
  return { locked: false, reason: null };
}

/**
 * Normalizes text for case- and Vietnamese-diacritic-insensitive matching.
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0111\u0110]/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Filters conversations client-side by active sidebar tab and search query.
 * Keeps filtering responsive and resilient alongside server-side query params.
 */
export function filterConversations(
  conversations: ReadonlyArray<ChatConversation>,
  options: { tab: SidebarFilterTab; query?: string }
): ChatConversation[] {
  const normalizedQuery = options.query ? normalizeSearchText(options.query) : '';

  return conversations.filter((conv) => {
    if (options.tab === 'UNREAD' && conv.unreadCount <= 0) {
      return false;
    }
    if (options.tab === 'STUDY_GROUP' && conv.type !== 'STUDY_GROUP') {
      return false;
    }
    if (options.tab === 'CLASS_CHANNEL' && conv.type !== 'CLASS_CHANNEL') {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      conv.name,
      conv.peerUser?.fullName,
      conv.peerUser?.email,
      conv.className,
      conv.courseTitle,
      conv.lastMessage?.content,
      conv.lastMessage?.senderDisplayName,
    ]
      .filter((v): v is string => Boolean(v))
      .map(normalizeSearchText);

    return haystack.some((field) => field.includes(normalizedQuery));
  });
}

/**
 * Filters tracked mention entries so removed `@Name` mentions are not sent in payloads.
 */
export function filterActiveMentionIds(
  content: string,
  entries: ReadonlyArray<{ userId: string; label: string }>
): string[] {
  if (!content || entries.length === 0) return [];
  const lower = content.toLowerCase();
  const seen = new Set<string>();
  const activeIds: string[] = [];

  for (const entry of entries) {
    if (!entry.userId || !entry.label) continue;
    if (lower.includes(`@${entry.label.toLowerCase()}`) && !seen.has(entry.userId)) {
      seen.add(entry.userId);
      activeIds.push(entry.userId);
    }
  }

  return activeIds;
}

/**
 * Returns true if the outgoing message text invokes `@AI` (or mentions `@AI` as a word).
 */
export function isAiTriggerContent(content?: string | null): boolean {
  if (!content) return false;
  return /(^|\s)@ai\b/i.test(content.trim());
}

/**
 * Returns true when the message or preview originates from Socratic AI.
 */
export function isAiMessage(
  msg?: { senderType?: string | null; messageType?: string | null } | null
): boolean {
  return Boolean(msg && (msg.senderType === 'AI' || msg.messageType === 'AI_REPLY'));
}

/**
 * Resolves a localized sender display name, overriding hardcoded backend AI names.
 */
export function getMessageSenderDisplayName(
  msg:
    | {
        senderType?: string | null;
        messageType?: string | null;
        senderDisplayName?: string | null;
      }
    | null
    | undefined,
  labels: { aiSenderName: string; fallbackUser: string }
): string {
  if (isAiMessage(msg)) {
    return labels.aiSenderName;
  }
  return msg?.senderDisplayName?.trim() || labels.fallbackUser;
}
