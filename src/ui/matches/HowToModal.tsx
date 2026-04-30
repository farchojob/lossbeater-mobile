import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HowToModal({ open, onClose }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');

  const bullets: { key: string; label: string }[] = [
    { key: 'h2h', label: t('howTo.h2h') },
    { key: 'form', label: t('howTo.form') },
    { key: 'odds', label: t('howTo.odds') },
    { key: 'matchWin', label: t('howTo.matchWin') },
    { key: 'score', label: t('howTo.score') },
  ];

  const colorSwatches: { key: string; color: string; label: string }[] = [
    { key: 'green', color: '#16a34a', label: t('howTo.colorGreen') },
    { key: 'blue', color: colors.primary, label: t('howTo.colorBlue') },
    { key: 'red', color: '#ef4444', label: t('howTo.colorRed') },
    { key: 'amber', color: '#f97316', label: t('howTo.colorAmber') },
    { key: 'emerald', color: '#10b981', label: t('howTo.colorEmerald') },
    { key: 'orange', color: '#f97316', label: t('howTo.colorOrange') },
    { key: 'purple', color: '#a855f7', label: t('howTo.colorPurple') },
  ];

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        />
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: '85%',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 18,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 18,
                fontWeight: '800',
                flex: 1,
                paddingRight: 12,
              }}
            >
              {t('howTo.title')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: colors.surfaceMuted,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 18,
              }}
            >
              {t('howTo.intro')}
            </Text>

            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                fontWeight: '800',
                marginBottom: 10,
              }}
            >
              {t('howTo.readingTitle')}
            </Text>

            <View style={{ gap: 10 }}>
              {bullets.map((b) => (
                <View
                  key={b.key}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: colors.primary,
                      marginTop: 7,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      color: colors.textSecondary,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                fontWeight: '800',
                marginTop: 22,
                marginBottom: 10,
              }}
            >
              {t('howTo.colorsTitle')}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              {t('howTo.colorsIntro')}
            </Text>

            <View style={{ gap: 10 }}>
              {colorSwatches.map((c) => (
                <View
                  key={c.key}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={{
                      width: 3,
                      height: 18,
                      borderRadius: 2,
                      backgroundColor: c.color,
                      marginTop: 2,
                      marginRight: 12,
                    }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      color: colors.textSecondary,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  color: colors.primaryText,
                  fontSize: 15,
                  fontWeight: '700',
                }}
              >
                {t('howTo.close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
