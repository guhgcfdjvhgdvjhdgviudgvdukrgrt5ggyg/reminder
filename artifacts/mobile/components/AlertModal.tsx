import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReminders } from '@/context/RemindersContext';
import { useColors, fontFamily, fontSize, spacing, borderRadius } from '@/constants/design';

export function AlertModal() {
  const { activeAlert, dismissAlert, snoozeAlert } = useReminders();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colors = useColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!activeAlert) {
      fadeAnim.setValue(0);
      return;
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulseAnim.setValue(1);
    };
  }, [activeAlert, pulseAnim, fadeAnim]);

  if (!activeAlert) return null;

  const date = new Date(activeAlert.dateTime);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingBottom: insets.bottom + spacing['3xl'],
              paddingTop: insets.top + spacing['3xl'],
            },
          ]}
        >
          <Animated.View
            style={[styles.bellWrap, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={[styles.bellBg, { backgroundColor: colors.primary + '22' }]}>
              <Feather name="bell" size={52} color={colors.primary} />
            </View>
          </Animated.View>

          <Text style={[styles.timeText, { color: colors.primary }]}>{timeStr}</Text>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{dateStr}</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{activeAlert.title}</Text>
          {activeAlert.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {activeAlert.description}
            </Text>
          ) : null}

          <View style={styles.buttons}>
            {activeAlert.snoozeMinutes > 0 && (
              <Pressable
                style={[styles.snoozeBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => snoozeAlert(activeAlert)}
              >
                <Feather name="clock" size={18} color={colors.primary} />
                <Text style={[styles.snoozeBtnText, { color: colors.primary }]}>
                  Snooze {activeAlert.snoozeMinutes} min
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.dismissBtn, { backgroundColor: colors.primary }]}
              onPress={dismissAlert}
            >
              <Feather name="x-circle" size={20} color={colors.primaryForeground} />
              <Text style={[styles.dismissBtnText, { color: colors.primaryForeground }]}>
                Dismiss
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: Platform.OS === 'web' ? 380 : '90%',
    maxWidth: 400,
    borderRadius: borderRadius['4xl'],
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: spacing['5xl'],
    gap: spacing.md,
  },
  bellWrap: {
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
  bellBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: fontSize['8xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: -1,
  },
  dateText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
    marginTop: -spacing.xs,
  },
  title: {
    fontSize: fontSize['5xl'],
    fontFamily: fontFamily.semiBold,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  description: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: spacing.lg,
    marginTop: spacing['4xl'],
  },
  snoozeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  snoozeBtnText: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.semiBold,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
    borderRadius: borderRadius.xl,
  },
  dismissBtnText: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.semiBold,
  },
});
