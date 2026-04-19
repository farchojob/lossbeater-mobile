import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
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

WebBrowser.maybeCompleteAuthSession();

export default function Register() {
  const { colors } = useTheme();
  const { t } = useTranslations('auth');
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({
        strategy,
        redirectUrl,
      });
      if (createdSessionId) {
        await setActiveSSO?.({ session: createdSessionId });
        router.replace('/(protected)');
      }
    } catch (e: any) {
      const msg = e?.errors?.[0]?.message || e?.message || t('register.errors.oauthFailed');
      setError(msg);
      console.warn(`[OAuth ${strategy}] failed:`, msg, e);
    } finally {
      setOauthLoading(null);
    }
  };

  const onRegister = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || t('register.errors.registrationFailed'));
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
      setError(e?.errors?.[0]?.message || t('register.errors.invalidCode'));
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={{ alignSelf: 'center' }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        {t('register.alreadyAccount')}{' '}
        <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('register.signIn')}</Text>
      </Text>
    </Pressable>
  );

  if (pendingVerification) {
    return (
      <AuthShell
        title={t('register.verify.title')}
        subtitle={t('register.verify.subtitle')}
        footer={footer}
      >
        <TextField
          label={t('register.verify.codeLabel')}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder={t('register.verify.codePlaceholder')}
          autoComplete="one-time-code"
        />
        <AuthErrorBanner message={error} />
        <View style={{ marginTop: 4 }}>
          <PrimaryButton
            label={loading ? t('register.verify.submitting') : t('register.verify.submit')}
            onPress={onVerify}
            loading={loading}
          />
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      footer={footer}
    >
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
        label={t('register.emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder={t('register.emailPlaceholder')}
      />
      <TextField
        label={t('register.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder={t('register.passwordPlaceholder')}
      />

      <AuthErrorBanner message={error} />

      <View style={{ marginTop: 4 }}>
        <PrimaryButton
          label={loading ? t('register.submitting') : t('register.submit')}
          onPress={onRegister}
          loading={loading}
        />
      </View>
    </AuthShell>
  );
}
