import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Send, Trash2 } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import { useMatchChatroom, type ChatMessage } from '../../../api/useMatchChatroom';

interface MatchChatroomProps {
  matchId: string;
}

const MAX_LEN = 500;

export function MatchChatroom({ matchId }: MatchChatroomProps) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const { user, isSignedIn } = useUser();
  const { messages, loading, send, remove } = useMatchChatroom(matchId);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<ScrollView>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  const onSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await send(text);
      setDraft('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      Alert.alert(t('detail.chat.sendError'), msg);
    } finally {
      setSending(false);
    }
  }, [draft, sending, send, t]);

  const onDelete = useCallback(
    (id: string) => {
      Alert.alert(t('detail.chat.deleteTitle'), t('detail.chat.deleteConfirm'), [
        { text: t('detail.chat.cancel'), style: 'cancel' },
        {
          text: t('detail.chat.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(id);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Failed to delete';
              Alert.alert(t('detail.chat.sendError'), msg);
            }
          },
        },
      ]);
    },
    [remove, t],
  );

  if (!isSignedIn) {
    return (
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: 24,
          alignItems: 'center',
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600', textAlign: 'center' }}
        >
          {t('detail.chat.signInPrompt')}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: 360 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text
              allowFontScaling={false}
              style={{
                color: colors.textPrimary,
                fontSize: 13,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              {t('detail.chat.empty')}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontWeight: '500',
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              {t('detail.chat.beFirst')}
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={listRef}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 6 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {messages.map((item) => (
              <MessageRow
                key={item.id}
                message={item}
                isOwn={user?.id === item.userId}
                onDelete={onDelete}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 10,
          paddingVertical: 8,
          backgroundColor: colors.background,
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('detail.chat.placeholder')}
          placeholderTextColor={colors.textMuted}
          editable={!sending}
          multiline
          maxLength={MAX_LEN}
          allowFontScaling={false}
          style={{
            flex: 1,
            minHeight: 36,
            maxHeight: 100,
            color: colors.textPrimary,
            fontSize: 14,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        />
        <Pressable
          onPress={onSend}
          disabled={!draft.trim() || sending}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: draft.trim() && !sending ? colors.primary : colors.surfaceMuted,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={18} color={draft.trim() ? '#fff' : colors.textMuted} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageRow({
  message,
  isOwn,
  onDelete,
}: {
  message: ChatMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) {
  const { colors } = useTheme();
  const relative = formatRelative(message.createdAt);
  const initial = (message.displayName ?? '?').charAt(0).toUpperCase();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOwn ? colors.primary : colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            color: isOwn ? '#fff' : colors.textPrimary,
            fontSize: 12,
            fontWeight: '800',
          }}
        >
          {initial}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={{
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: '700',
              flexShrink: 1,
            }}
          >
            {message.displayName}
          </Text>
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600' }}
          >
            {relative}
          </Text>
          {isOwn && (
            <Pressable
              onPress={() => onDelete(message.id)}
              hitSlop={8}
              style={({ pressed }) => ({ marginLeft: 'auto', opacity: pressed ? 0.6 : 1 })}
            >
              <Trash2 size={13} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: '500',
            lineHeight: 18,
            marginTop: 1,
          }}
        >
          {message.message}
        </Text>
      </View>
    </View>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return 'now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
