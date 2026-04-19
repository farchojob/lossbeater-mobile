import React from 'react';
import { Users } from 'lucide-react-native';
import { ComingSoon } from '../../src/ui/nav/ComingSoon';
import { useTranslations } from '../../src/i18n';

export default function PlayersScreen() {
  const { t } = useTranslations('comingSoon');
  return (
    <ComingSoon
      Icon={Users}
      title={t('players.title')}
      subtitle={t('players.subtitle')}
    />
  );
}
