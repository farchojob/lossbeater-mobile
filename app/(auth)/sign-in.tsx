import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { OAuthStrategy } from '@clerk/types';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { useTranslations } from '../../src/i18n';
import { AuthShell } from '../../src/ui/auth/AuthShell';
import {
  AuthErrorBanner,
  Divider,
  PrimaryButton,
  SocialButton,
  TextField,
} from '../../src/ui/auth/AuthPrimitives';

// Required to close the in-app browser on iOS after the OAuth redirect.
WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { colors } = useTheme();
  const { t } = useTranslations('auth');
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Warm the browser for faster OAuth open on iOS.
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const onOAuth = async (strategy: OAuthStrategy) => {
    if (oauthLoading) return;
    setError(null);
    setOauthLoading(strategy);
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'lossbeater',
        path: 'oauth-native-callback',
      });
      const result = await startSSOFlow({ strategy, redirectUrl });
      if (result?.createdSessionId) {
        await result.setActive?.({ session: result.createdSessionId });
        router.replace('/(protected)');
      }
    } catch (e: any) {
      const msg = e?.errors?.[0]?.message || e?.message || t('signIn.errors.oauthFailed');
      setError(msg);
      console.warn(`[OAuth ${strategy}] failed:`, msg, e);
    } finally {
      setOauthLoading(null);
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
        router.replace('/(protected)');
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || t('signIn.errors.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <Pressable onPress={() => router.push('/(auth)/register')} style={{ alignSelf: 'center' }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        {t('signIn.noAccount')}{' '}
        <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('signIn.createAccount')}</Text>
      </Text>
    </Pressable>
  );

  return (
    <AuthShell title={t('signIn.title')} subtitle={t('signIn.subtitle')} footer={footer}>
      <SocialButton
        provider="google"
        onPress={() => onOAuth('oauth_google')}
        loading={oauthLoading === 'oauth_google'}
        disabled={oauthLoading !== null}
      />
      <SocialButton
        provider="apple"
        onPress={() => onOAuth('oauth_apple')}
        loading={oauthLoading === 'oauth_apple'}
        disabled={oauthLoading !== null}
      />

      <Divider label="or" />

      <TextField
        label={t('signIn.emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder={t('signIn.emailPlaceholder')}
      />
      <TextField
        label={t('signIn.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        placeholder={t('signIn.passwordPlaceholder')}
        rightSlot={
          <Pressable onPress={() => {}}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{t('signIn.forgotPassword')}</Text>
          </Pressable>
        }
      />

      <AuthErrorBanner message={error} />

      <View style={{ marginTop: 4 }}>
        <PrimaryButton label={loading ? t('signIn.submitting') : t('signIn.submit')} onPress={onEmailSignIn} loading={loading} />
      </View>
    </AuthShell>
  );
}
