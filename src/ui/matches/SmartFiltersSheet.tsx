import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import {
  SMART_FILTER_OPTIONS,
  type SmartFilterId,
} from '../../constants/smartFilters';

type Props = {
  open: boolean;
  active: ReadonlyArray<SmartFilterId>;
  onClose: () => void;
  onApply: (ids: ReadonlyArray<SmartFilterId>) => void;
};

export function SmartFiltersSheet({ open, active, onClose, onApply }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const [draft, setDraft] = useState<Set<SmartFilterId>>(new Set(active));

  useEffect(() => {
    if (open) setDraft(new Set(active));
  }, [open, active]);

  const toggle = (id: SmartFilterId) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clear = () => setDraft(new Set());
  const apply = () => {
    onApply(Array.from(draft));
    onClose();
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
            overflow: 'hidden',
          }}
        >
          <SheetHandle color={colors.border} />
          <SheetHeader
            title={t('filters.selectFilters')}
            onClose={onClose}
            borderColor={colors.border}
            textColor={colors.textPrimary}
            subtleBg={colors.surfaceMuted}
            subtleFg={colors.textSecondary}
          />

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingVertical: 8,
            }}
            showsVerticalScrollIndicator={false}
          >
            {SMART_FILTER_OPTIONS.map((opt) => (
              <FilterRow
                key={opt.id}
                label={t(opt.labelKey)}
                description={t(opt.descriptionKey)}
                checked={draft.has(opt.id)}
                onToggle={() => toggle(opt.id)}
              />
            ))}
          </ScrollView>

          <Footer
            onClear={clear}
            onApply={apply}
            clearLabel={t('filters.clearAll')}
            applyLabel={t('filters.apply')}
            count={draft.size}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetHandle({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function SheetHeader({
  title,
  onClose,
  borderColor,
  textColor,
  subtleBg,
  subtleFg,
}: {
  title: string;
  onClose: () => void;
  borderColor: string;
  textColor: string;
  subtleBg: string;
  subtleFg: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          color: textColor,
          fontSize: 17,
          fontWeight: '700',
          letterSpacing: -0.2,
          flex: 1,
        }}
      >
        {title}
      </Text>
      <Pressable
        onPress={onClose}
        hitSlop={10}
        style={({ pressed }) => ({
          width: 30,
          height: 30,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          backgroundColor: subtleBg,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <X size={16} color={subtleFg} />
      </Pressable>
    </View>
  );
}

function FilterRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: checked ? colors.primary : colors.border,
          backgroundColor: checked ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && <Check size={14} color={colors.primaryText} strokeWidth={3} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: '600',
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          style={{
            color: colors.textMuted,
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function Footer({
  onClear,
  onApply,
  clearLabel,
  applyLabel,
  count,
}: {
  onClear: () => void;
  onApply: () => void;
  clearLabel: string;
  applyLabel: string;
  count: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Pressable
        onPress={onClear}
        style={({ pressed }) => ({
          flex: 1,
          height: 46,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceMuted,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          {clearLabel}
        </Text>
      </Pressable>
      <Pressable
        onPress={onApply}
        style={({ pressed }) => ({
          flex: 1.4,
          height: 46,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          allowFontScaling={false}
          style={{
            color: colors.primaryText,
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          {count > 0 ? `${applyLabel} (${count})` : applyLabel}
        </Text>
      </Pressable>
    </View>
  );
}
