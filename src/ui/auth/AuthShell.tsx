import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { LogoMark, LogoWordmark } from '../icons/LogoMark';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  const { colors, mode, setMode, systemScheme } = useTheme();
  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}>
            {/* Brand header */}
            <View style={{ alignItems: 'center', marginBottom: 22, gap: 10 }}>
              <LogoMark size={44} />
              <LogoWordmark color={colors.textPrimary} size={17} />
            </View>

            {/* Title block */}
            <View style={{ alignItems: 'center', marginBottom: 16, gap: 4 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 20,
                  fontWeight: '700',
                  letterSpacing: -0.3,
                  textAlign: 'center',
                }}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {/* Card */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 18,
                gap: 12,
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.35 : 0.08,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              {children}
            </View>

            {footer ? <View style={{ marginTop: 14 }}>{footer}</View> : null}

            {/* Theme switcher */}
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                gap: 4,
                marginTop: 22,
                padding: 3,
                borderRadius: 999,
                backgroundColor: colors.surfaceMuted,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {(['light', 'dark', 'system'] as const).map(m => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: active ? colors.surface : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: active ? colors.textPrimary : colors.textMuted,
                        fontWeight: active ? '700' : '500',
                        fontSize: 11,
                        textTransform: 'capitalize',
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
