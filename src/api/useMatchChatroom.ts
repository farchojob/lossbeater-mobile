import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useApi } from './hooks';

export interface ChatMessage {
  id: string;
  matchId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  message: string;
  createdAt: string;
}

interface MessagesResponse {
  success?: boolean;
  messages?: ChatMessage[];
}

interface SendResponse {
  success?: boolean;
  message?: ChatMessage;
}

const POLL_MS = 5_000;

export function useMatchChatroom(matchId: string | null | undefined) {
  const { request, isSignedIn } = useApi();
  const key = matchId && isSignedIn ? `/chatroom/matches/${matchId}/messages?limit=50&offset=0` : null;

  const { data, error, isLoading, mutate } = useSWR<MessagesResponse>(key, {
    refreshInterval: POLL_MS,
    revalidateOnFocus: true,
    dedupingInterval: 2_000,
  });

  const messages = useMemo<ChatMessage[]>(() => data?.messages ?? [], [data]);

  const send = useCallback(
    async (text: string): Promise<ChatMessage | null> => {
      if (!matchId) return null;
      const trimmed = text.trim();
      if (!trimmed) return null;
      const res = await request<SendResponse>(`/chatroom/matches/${matchId}/messages`, {
        method: 'POST',
        body: { message: trimmed },
      });
      const created = res?.message ?? null;
      if (created) {
        mutate(
          (curr) => ({
            ...(curr ?? {}),
            success: true,
            messages: [...(curr?.messages ?? []), created],
          }),
          { revalidate: false },
        );
      } else {
        mutate();
      }
      return created;
    },
    [matchId, request, mutate],
  );

  const remove = useCallback(
    async (messageId: string): Promise<void> => {
      if (!matchId) return;
      await request(`/chatroom/messages/${messageId}`, { method: 'DELETE' });
      mutate(
        (curr) => ({
          ...(curr ?? {}),
          success: true,
          messages: (curr?.messages ?? []).filter((m) => m.id !== messageId),
        }),
        { revalidate: false },
      );
    },
    [matchId, request, mutate],
  );

  return {
    messages,
    loading: isLoading && messages.length === 0,
    error: error as Error | null,
    send,
    remove,
    refetch: mutate,
  };
}
