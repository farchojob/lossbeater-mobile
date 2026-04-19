import React from 'react';
import { Trophy } from 'lucide-react-native';
import { ComingSoon } from '../../src/ui/nav/ComingSoon';
import { useTranslations } from '../../src/i18n';

export default function LeaguesScreen() {
  const { t } = useTranslations('comingSoon');
  return (
    <ComingSoon
      Icon={Trophy}
      title={t('leagues.title')}
      subtitle={t('leagues.subtitle')}
    />
  );
}
