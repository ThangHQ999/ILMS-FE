import React, { Suspense } from 'react';
import { ChatPageView } from '@/features/chat';
import ChatLoading from './loading';

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatPageView />
    </Suspense>
  );
}
