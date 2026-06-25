import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useColors, fontFamily, fontSize, spacing, borderRadius } from '@/constants/design';
import type { Reminder } from '@/types/reminder';
import { DAY_NAMES, REPEAT_LABELS } from '@/types/reminder';

function formatDateTime(dateTime: string, repeatType: Reminder['repeatType'], repeatDays: number[]): string {
  const date = new Date(dateTime);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (repeatType === 'once') {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  }
  if (repeatType === 'daily') return `Daily at ${timeStr}`;
  if (repeatType === 'weekly') {
    const day = DAY_NAMES[date.getDay()];
    return `Every ${day} at ${timeStr}`;
  }
  if (repeatType === 'monthly') {
    const day = date.getDate();
    return `Monthly on the ${day}${ordinal(day)} at ${timeStr}`;
  }
  if (repeatType === 'custom' && repeatDays.length > 0) {
    const dayLabels = repeatDays.map(d => DAY_NAMES[d]).join(', ');
    return `${dayLabels} at ${timeStr}`;
  }
  return timeStr;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

interface Props {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
}

export function ReminderCard({ reminder, onToggle, onDelete, onPress }: Props) {
  const colors = useColors();

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  }, [onDelete]);

  const timeLabel = formatDateTime(reminder.dateTime, reminder.repeatType, reminder.repeatDays);
  const repeatLabel = REPEAT_LABELS[reminder.repeatType];

  const isPast = reminder.repeatType === 'once' && new Date(reminder.dateTime) < new Date();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        !reminder.isActive && styles.cardInactive,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: reminder.isActive && !isPast
              ? colors.primary
              : colors.mutedForeground,
          },
        ]}
      />
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: reminder.isActive ? colors.foreground : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {reminder.title}
        </Text>
        <Text style={[styles.time, { color: colors.primary }]} numberOfLines={1}>
          {timeLabel}
        </Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
              {repeatLabel}
            </Text>
          </View>
          {reminder.vibrationEnabled && (
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Feather name="smartphone" size={10} color={colors.mutedForeground} />
            </View>
          )}
          {reminder.snoozeMinutes > 0 && (
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Feather name="clock" size={10} color={colors.mutedForeground} />
            </View>
          )}
        </View>
        {reminder.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
            {reminder.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Switch
          value={reminder.isActive}
          onValueChange={handleToggle}
          trackColor={{ false: colors.muted, true: colors.primary + '66' }}
          thumbColor={reminder.isActive ? colors.primary : colors.mutedForeground}
          ios_backgroundColor={colors.muted}
        />
        <Pressable
          onPress={handleDelete}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginTop: spacing.md })}
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: borderRadius['2xl'],
    marginHorizontal: spacing['2xl'],
    marginVertical: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardInactive: {
    opacity: 0.6,
  },
  indicator: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.semiBold,
  },
  time: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.medium,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    marginTop: spacing.xxs,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 1,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
});
