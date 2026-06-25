import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateTimePickerModal } from '@/components/DateTimePickerModal';
import { useReminders } from '@/context/RemindersContext';
import { useColors, fontFamily, fontSize, spacing, borderRadius } from '@/constants/design';
import {
  DAY_NAMES,
  REPEAT_LABELS,
  SNOOZE_OPTIONS,
  SOUND_OPTIONS,
  type RepeatType,
} from '@/types/reminder';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatDT(d: Date): string {
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${dateStr} at ${timeStr}`;
}

const REPEAT_TYPES: RepeatType[] = ['once', 'daily', 'weekly', 'monthly', 'custom'];

export default function AddReminderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { reminders, addReminder, updateReminder } = useReminders();

  const existing = useMemo(
    () => (id ? reminders.find(r => r.id === id) : undefined),
    [id, reminders]
  );
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [dateTime, setDateTime] = useState<Date>(
    existing ? new Date(existing.dateTime) : (() => {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 15, 0, 0);
      return d;
    })()
  );
  const [repeatType, setRepeatType] = useState<RepeatType>(existing?.repeatType ?? 'once');
  const [repeatDays, setRepeatDays] = useState<number[]>(existing?.repeatDays ?? []);
  const [vibrationEnabled, setVibrationEnabled] = useState(existing?.vibrationEnabled ?? true);
  const [sound, setSound] = useState(existing?.sound ?? 'default');
  const [snoozeMinutes, setSnoozeMinutes] = useState(existing?.snoozeMinutes ?? 5);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleDay = useCallback((day: number) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a name for this reminder.');
      return;
    }
    if (repeatType === 'custom' && repeatDays.length === 0) {
      Alert.alert('Select days', 'Please select at least one day for the custom repeat.');
      return;
    }
    if (repeatType === 'once' && dateTime <= new Date()) {
      Alert.alert('Invalid time', 'Please select a future date and time for a one-time reminder.');
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        dateTime: dateTime.toISOString(),
        repeatType,
        repeatDays,
        vibrationEnabled,
        sound,
        snoozeMinutes,
        isActive: true,
      };

      if (isEdit && existing) {
        await updateReminder({ ...existing, ...data });
      } else {
        await addReminder(data);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }, [title, description, dateTime, repeatType, repeatDays, vibrationEnabled, sound, snoozeMinutes, isEdit, existing, addReminder, updateReminder, router]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + spacing.lg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={[styles.headerBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEdit ? 'Edit Reminder' : 'New Reminder'}
        </Text>
        <Pressable
          onPress={handleSave}
          style={[styles.headerBtn, styles.headerSaveBtn, { backgroundColor: colors.primary }]}
          disabled={saving}
        >
          <Text style={[styles.headerBtnText, { color: colors.primaryForeground }]}>
            {saving ? '...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + spacing['5xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic info */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DETAILS</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.titleInput, { color: colors.foreground }]}
            placeholder="Reminder title"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
            returnKeyType="next"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TextInput
            style={[styles.descInput, { color: colors.foreground }]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
            returnKeyType="done"
          />
        </View>

        {/* Date & Time */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>WHEN</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={styles.row}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="calendar" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Date & Time</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: colors.primary }]}>{formatDT(dateTime)}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>

        {/* Repeat */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REPEAT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chipsWrap}>
            {REPEAT_TYPES.map(rt => (
              <Pressable
                key={rt}
                style={[
                  styles.chip,
                  {
                    backgroundColor: repeatType === rt ? colors.primary : colors.secondary,
                    borderColor: repeatType === rt ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setRepeatType(rt)}
              >
                <Text style={[
                  styles.chipText,
                  { color: repeatType === rt ? colors.primaryForeground : colors.mutedForeground },
                ]}>
                  {REPEAT_LABELS[rt]}
                </Text>
              </Pressable>
            ))}
          </View>

          {repeatType === 'custom' && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.daysWrap}>
                {DAY_NAMES.map((name, idx) => {
                  const selected = repeatDays.includes(idx);
                  return (
                    <Pressable
                      key={name}
                      style={[
                        styles.dayChip,
                        {
                          backgroundColor: selected ? colors.primary : colors.secondary,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => toggleDay(idx)}
                    >
                      <Text style={[
                        styles.dayChipText,
                        { color: selected ? colors.primaryForeground : colors.mutedForeground },
                      ]}>
                        {name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Options */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>OPTIONS</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Vibration */}
          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="smartphone" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Vibration</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.muted, true: colors.primary + '66' }}
              thumbColor={vibrationEnabled ? colors.primary : colors.mutedForeground}
              ios_backgroundColor={colors.muted}
            />
          </View>

          {/* Sound */}
          <View style={[styles.soundSection, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="music" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Sound</Text>
            </View>
            <View style={styles.soundChips}>
              {SOUND_OPTIONS.map(opt => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: sound === opt.value ? colors.primary : colors.secondary,
                      borderColor: sound === opt.value ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSound(opt.value)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: sound === opt.value ? colors.primaryForeground : colors.mutedForeground },
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Snooze */}
          <View style={styles.snoozeSection}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + '22' }]}>
                <Feather name="clock" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Snooze</Text>
            </View>
            <View style={styles.snoozeChips}>
              {SNOOZE_OPTIONS.map(opt => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: snoozeMinutes === opt.value ? colors.primary : colors.secondary,
                      borderColor: snoozeMinutes === opt.value ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSnoozeMinutes(opt.value)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: snoozeMinutes === opt.value ? colors.primaryForeground : colors.mutedForeground },
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <DateTimePickerModal
        visible={showDatePicker}
        date={dateTime}
        onConfirm={d => { setDateTime(d); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
  },
  headerBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 72,
    alignItems: 'center',
  },
  headerSaveBtn: {},
  headerBtnText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semiBold,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.semiBold,
  },
  scroll: {
    paddingTop: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 1,
    marginHorizontal: spacing['3xl'],
    marginTop: spacing['3xl'],
    marginBottom: spacing.md,
  },
  card: {
    marginHorizontal: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  titleInput: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['2xl'],
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.medium,
  },
  descInput: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.regular,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    marginHorizontal: spacing['2xl'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.medium,
  },
  rowValue: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
  },
  daysWrap: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
  },
  snoozeSection: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  soundSection: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  snoozeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginLeft: spacing['6xl'] - spacing.xl,
  },
  soundChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginLeft: spacing['6xl'] - spacing.xl,
    marginTop: spacing.lg,
  },
});
