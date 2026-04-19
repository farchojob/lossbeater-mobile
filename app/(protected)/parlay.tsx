import React from 'react';
import { Sparkles } from 'lucide-react-native';
import { ComingSoon } from '../../src/ui/nav/ComingSoon';
import { useTranslations } from '../../src/i18n';

export default function ParlayScreen() {
  const { t } = useTranslations('comingSoon');
  return (
    <ComingSoon
      Icon={Sparkles}
      title={t('parlay.title')}
      subtitle={t('parlay.subtitle')}
    />
  );
}
