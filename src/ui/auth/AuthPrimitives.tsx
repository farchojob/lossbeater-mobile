import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { GoogleIcon } from '../icons/GoogleIcon';
import { AppleIcon } from '../icons/AppleIcon';

export function TextField({
  label,
  error,
  rightSlot,
  ...rest
}: TextInputProps & { label: string; error?: string | null; rightSlot?: React.ReactNode }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
        {rightSlot}
      </View>
      <TextInput
        {...rest}
        onFocus={e => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={colors.textMuted}
        style={[
          {
            color: colors.textPrimary,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            fontSize: 14,
          },
          rest.style,
        ]}
      />
      {error ? (
        <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '500' }}>{error}</Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryText} />
      ) : (
        <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SocialButton({
  provider,
  onPress,
  disabled,
  loading,
}: {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useTheme();
  const label = provider === 'google' ? 'Continue with Google' : 'Continue with Apple';
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.surfaceMuted,
        opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textPrimary} />
      ) : provider === 'google' ? (
        <GoogleIcon size={16} />
      ) : (
        <AppleIcon size={16} color={colors.textPrimary} />
      )}
      <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Divider({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1 }}>
        {label.toUpperCase()}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}

export function AuthErrorBanner({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.danger,
        backgroundColor: `${colors.danger}18`,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '500' }}>{message}</Text>
    </View>
  );
}
