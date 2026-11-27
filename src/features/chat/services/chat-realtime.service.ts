import Pusher, { type Channel } from 'pusher-js';
import {
  CHAT_WS_EVENTS,
  SOKETI_CONFIG,
  conversationChannel,
} from '../constants/chat-realtime';
import { authorizePusherChannel } from './chat.service';

export type ChatRealtimeConnectionStatus =
  | 'disabled'
  | 'connecting'
  | 'connected'
  | 'disconnected';

function mapPusherState(state: string): ChatRealtimeConnectionStatus {
  if (state === 'connected') return 'connected';
  if (state === 'connecting' || state === 'initialized') return 'connecting';
  return 'disconnected';
}

class ChatRealtimeService {
  private client: Pusher | null = null;
  private channels = new Map<string, Channel>();
  private lastTypingSentAt = 0;

  isConfigured(): boolean {
    return Boolean(SOKETI_CONFIG.key);
  }

  connect(
    onStateChange?: (status: ChatRealtimeConnectionStatus) => void
  ): Pusher | null {
    if (typeof window === 'undefined' || !this.isConfigured()) {
      onStateChange?.('disabled');
      return null;
    }

    if (this.client) {
      onStateChange?.(mapPusherState(this.client.connection.state));
      return this.client;
    }

    onStateChange?.('connecting');

    this.client = new Pusher(SOKETI_CONFIG.key, {
      wsHost: SOKETI_CONFIG.host,
      wsPort: SOKETI_CONFIG.port,
      wssPort: SOKETI_CONFIG.port,
      forceTLS: SOKETI_CONFIG.forceTLS,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      cluster: 'mt1',
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          authorizePusherChannel(socketId, channel.name)
            .then((authRes) => {
              callback(null, {
                auth: authRes.auth,
                channel_data: authRes.channel_data ?? undefined,
              });
            })
            .catch((err) => {
              callback(
                err instanceof Error ? err : new Error('Channel auth failed'),
                null
              );
            });
        },
      }),
    });

    this.client.connection.bind('state_change', (states: { current: string }) => {
      onStateChange?.(mapPusherState(states.current));
    });

    return this.client;
  }

  subscribe(channelName: string): Channel | null {
    if (!this.client) return null;
    const existing = this.channels.get(channelName);
    if (existing) return existing;
    const ch = this.client.subscribe(channelName);
    this.channels.set(channelName, ch);
    return ch;
  }

  unsubscribe(channelName: string): void {
    const existing = this.channels.get(channelName);
    if (existing && this.client) {
      existing.unbind_all();
      this.client.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  triggerClientTyping(
    conversationId: string,
    payload: { userId: string; fullName: string; isTyping: boolean }
  ): void {
    const now = Date.now();
    if (payload.isTyping && now - this.lastTypingSentAt < 2500) {
      return;
    }
    this.lastTypingSentAt = payload.isTyping ? now : 0;

    const ch = this.channels.get(conversationChannel(conversationId));
    if (!ch) return;
    try {
      ch.trigger(CHAT_WS_EVENTS.CLIENT_TYPING, payload);
    } catch {
      // Ignore whisper failures if client events are disabled on the Soketi app
    }
  }

  disconnect(): void {
    if (!this.client) return;
    for (const [name, ch] of this.channels.entries()) {
      ch.unbind_all();
      this.client.unsubscribe(name);
    }
    this.channels.clear();
    this.client.disconnect();
    this.client = null;
  }
}

export const chatRealtimeService = new ChatRealtimeService();
