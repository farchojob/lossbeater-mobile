import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { router } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';

export default function SignIn() {
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startApple } = useOAuth({ strategy: 'oauth_apple' });
  const redirectUrl = makeRedirectUri({ scheme: 'lossbeater' });
  const { isLoaded, signIn, setActive } = useSignIn();
  const { colors, mode, setMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onOAuth = async (fn: () => Promise<any>) => {
    setError(null);
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await fn();
      if (createdSessionId) await setActiveOAuth?.({ session: createdSessionId });
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || 'OAuth failed');
    }
  };

  const onEmailSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signIn.create({ identifier: email.trim(), password });
      if (res?.createdSessionId) {
        await setActive?.({ session: res.createdSessionId });
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16, backgroundColor: colors.background }}>
      <View style={{ width: '100%', maxWidth: 380, alignItems: 'center', gap: 16, padding: 24, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>Sign in</Text>

        {/* Social */}
        <Pressable onPress={() => onOAuth(() => startGoogle({ redirectUrl }))} style={{ width: '100%', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: '700' }}>Continue with Google</Text>
        </Pressable>
        <Pressable onPress={() => onOAuth(() => startApple({ redirectUrl }))} style={{ width: '100%', backgroundColor: '#000', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Continue with Apple</Text>
        </Pressable>

        {/* Divider */}
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textSecondary }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Email + Password */}
        <View style={{ width: '100%', gap: 10 }}>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            style={{ width: '100%', color: colors.textPrimary, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ width: '100%', color: colors.textPrimary, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 }}
          />
          <Pressable disabled={loading} onPress={onEmailSignIn} style={{ width: '100%', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.8 : 1 }}>
            {loading ? <ActivityIndicator color={colors.primaryText} /> : <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: '700' }}>Sign in</Text>}
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/register')} style={{ alignSelf: 'center', paddingVertical: 4 }}>
            <Text style={{ color: colors.textSecondary }}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Register</Text></Text>
          </Pressable>
        </View>

        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <ThemeButton label="Light" active={mode === 'light'} onPress={() => setMode('light')} />
          <ThemeButton label="Dark" active={mode === 'dark'} onPress={() => setMode('dark')} />
          <ThemeButton label="System" active={mode === 'system'} onPress={() => setMode('system')} />
        </View>
      </View>
    </View>
  );
}

function ThemeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : 'transparent' }}
    >
      <Text style={{ color: active ? colors.primaryText : colors.textSecondary, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}


