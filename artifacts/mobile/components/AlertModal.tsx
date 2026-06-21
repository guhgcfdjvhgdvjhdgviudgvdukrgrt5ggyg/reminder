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
import { useColors } from '@/hooks/useColors';

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
              paddingBottom: insets.bottom + 20,
              paddingTop: insets.top + 20,
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
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  bellWrap: {
    marginTop: 8,
    marginBottom: 16,
  },
  bellBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: -4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  snoozeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  snoozeBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  dismissBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
