import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { SNOOZE_OPTIONS } from '@/types/reminder';

const SETTINGS_KEY = '@app_settings_v1';

interface AppSettings {
  defaultVibration: boolean;
  defaultSnoozeMinutes: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultVibration: true,
  defaultSnoozeMinutes: 5,
};

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(raw => {
      if (raw) {
        try { setSettings(JSON.parse(raw) as AppSettings); } catch { /* ignore */ }
      }
    });
  }, []);

  const save = useCallback(async (updated: AppSettings) => {
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
      </View>

      {/* Defaults section */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        REMINDER DEFAULTS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="smartphone" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Vibration</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>On by default for new reminders</Text>
            </View>
          </View>
          <Switch
            value={settings.defaultVibration}
            onValueChange={v => save({ ...settings, defaultVibration: v })}
            trackColor={{ false: colors.muted, true: colors.primary + '66' }}
            thumbColor={settings.defaultVibration ? colors.primary : colors.mutedForeground}
            ios_backgroundColor={colors.muted}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="clock" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Default Snooze</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Duration when snooze is tapped</Text>
            </View>
          </View>
        </View>
        <View style={styles.chipsRow}>
          {SNOOZE_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                {
                  backgroundColor: settings.defaultSnoozeMinutes === opt.value ? colors.primary : colors.secondary,
                  borderColor: settings.defaultSnoozeMinutes === opt.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => save({ ...settings, defaultSnoozeMinutes: opt.value })}
            >
              <Text style={[
                styles.chipText,
                { color: settings.defaultSnoozeMinutes === opt.value ? colors.primaryForeground : colors.mutedForeground },
              ]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Permissions section */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        PERMISSIONS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          style={styles.row}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Linking.openSettings().catch(() =>
                Alert.alert('Open Settings', 'Please go to Settings → Notifications to manage permissions.')
              );
            } else {
              Alert.alert('Permissions', 'Notification permissions are managed by your browser.');
            }
          }}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accent + '22' }]}>
              <Feather name="bell" size={18} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Notification Permissions</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Required for alerts to work</Text>
            </View>
          </View>
          <Feather name="external-link" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* About section */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
              <Feather name="bell" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Reminder App</Text>
          </View>
          <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>v1.0.0</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
              <Feather name="info" size={18} color={colors.mutedForeground} />
            </View>
            <View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Events & Schedule Alarm</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Never miss an important moment</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});
