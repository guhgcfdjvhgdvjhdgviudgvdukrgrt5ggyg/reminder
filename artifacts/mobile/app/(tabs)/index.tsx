import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ReminderCard } from '@/components/ReminderCard';
import { useReminders } from '@/context/RemindersContext';
import { useColors, fontFamily, fontSize, spacing, borderRadius } from '@/constants/design';
import type { Reminder } from '@/types/reminder';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reminders, loading, deleteReminder, toggleReminder } = useReminders();

  const now = useMemo(() => new Date(), []);

  const { upcoming, past } = useMemo(() => {
    const upcoming: Reminder[] = [];
    const past: Reminder[] = [];
    for (const r of reminders) {
      const isPast = r.repeatType === 'once' && new Date(r.dateTime) <= now;
      if (isPast || !r.isActive) {
        past.push(r);
      } else {
        upcoming.push(r);
      }
    }
    upcoming.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    past.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    return { upcoming, past };
  }, [reminders, now]);

  const sections = useMemo(() => {
    const s = [];
    if (upcoming.length > 0) s.push({ title: 'Upcoming', data: upcoming });
    if (past.length > 0) s.push({ title: 'Completed', data: past });
    return s;
  }, [upcoming, past]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteReminder(id);
        },
      },
    ]);
  }, [deleteReminder]);

  const handleAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-reminder');
  }, [router]);

  const handleEdit = useCallback((id: string) => {
    router.push({ pathname: '/add-reminder', params: { id } });
  }, [router]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + spacing.lg }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Reminders</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            {upcoming.length} upcoming
          </Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="bell" size={22} color={colors.primary} />
        </View>
      </View>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 90 },
        ]}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
          </View>
        )}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            onToggle={() => toggleReminder(item.id)}
            onDelete={() => handleDelete(item.id)}
            onPress={() => handleEdit(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="bell"
              title="No reminders yet"
              subtitle={'Tap the + button below to add\nyour first reminder'}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: (Platform.OS === 'web' ? 34 : insets.bottom) + spacing['3xl'],
          },
        ]}
        onPress={handleAdd}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  headerTitle: {
    fontSize: fontSize['7xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
    marginTop: spacing.xxs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  listContent: { paddingTop: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md + 2,
    gap: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing['3xl'],
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
