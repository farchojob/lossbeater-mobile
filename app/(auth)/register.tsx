import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { router } from 'expo-router';

export default function Register() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRegister = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res?.createdSessionId) {
        await setActive?.({ session: res.createdSessionId });
        router.replace('/(protected)');
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.background }}>
      <View style={{ width: '100%', maxWidth: 380, gap: 14, padding: 24, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary }}>Create account</Text>

        {!pendingVerification ? (
          <>
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
            <Pressable disabled={loading} onPress={onRegister} style={{ width: '100%', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
              {loading ? <ActivityIndicator color={colors.primaryText} /> : <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: '700' }}>Register</Text>}
            </Pressable>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={{ alignSelf: 'center', paddingVertical: 4 }}>
              <Text style={{ color: colors.textSecondary }}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text></Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ color: colors.textSecondary }}>We sent a verification code to {email}</Text>
            <TextInput
              placeholder="Verification code"
              placeholderTextColor={colors.textSecondary}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              style={{ width: '100%', color: colors.textPrimary, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 }}
            />
            <Pressable disabled={loading} onPress={onVerify} style={{ width: '100%', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
              {loading ? <ActivityIndicator color={colors.primaryText} /> : <Text style={{ color: colors.primaryText, fontSize: 16, fontWeight: '700' }}>Verify & Continue</Text>}
            </Pressable>
          </>
        )}

        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
      </View>
    </View>
  );
}


