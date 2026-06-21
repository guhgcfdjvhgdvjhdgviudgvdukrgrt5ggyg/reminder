import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reminder } from '@/types/reminder';

const REMINDERS_KEY = '@reminders_v1';

export async function loadReminders(): Promise<Reminder[]> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Reminder[];
  } catch {
    return [];
  }
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch {
    // silently fail
  }
}
