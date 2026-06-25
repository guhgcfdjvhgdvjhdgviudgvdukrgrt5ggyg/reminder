import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Reminder } from '@/types/reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
      enableVibrate: true,
      sound: 'default',
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function buildContent(reminder: Reminder): Notifications.NotificationContentInput {
  return {
    title: `⏰ ${reminder.title}`,
    body: reminder.description || 'Time for your reminder!',
    sound: true,
    vibrate: reminder.vibrationEnabled ? [0, 300, 200, 300] : undefined,
    data: { reminderId: reminder.id, snoozeMinutes: reminder.snoozeMinutes },
  };
}

export async function scheduleReminder(reminder: Reminder): Promise<string[]> {
  try {
    const date = new Date(reminder.dateTime);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const content = buildContent(reminder);
    const ids: string[] = [];

    if (reminder.repeatType === 'once') {
      if (date <= new Date()) return [];
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
      ids.push(id);
    } else if (reminder.repeatType === 'daily') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
      ids.push(id);
    } else if (reminder.repeatType === 'weekly') {
      const weekday = (date.getDay() + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
      });
      ids.push(id);
    } else if (reminder.repeatType === 'monthly') {
      const day = date.getDate() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day, hour, minute },
      });
      ids.push(id);
    } else if (reminder.repeatType === 'custom') {
      for (const dayIndex of reminder.repeatDays) {
        const weekday = ((dayIndex + 1) % 7 + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
        });
        ids.push(id);
      }
    }

    return ids;
  } catch (e) {
    console.warn('Failed to schedule notification', e);
    return [];
  }
}

export async function cancelReminder(notificationIds: string[]): Promise<void> {
  try {
    await Promise.all(notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {
    // silently fail
  }
}

export async function scheduleSnooze(reminder: Reminder): Promise<string | null> {
  try {
    if (!reminder.snoozeMinutes) return null;
    const content = buildContent(reminder);
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: reminder.snoozeMinutes * 60,
      },
    });
    return id;
  } catch {
    return null;
  }
}
