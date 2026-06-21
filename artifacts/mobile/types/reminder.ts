export type RepeatType = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';

export const REPEAT_LABELS: Record<RepeatType, string> = {
  once: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom days',
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SNOOZE_OPTIONS = [
  { label: 'No snooze', value: 0 },
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
];

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  repeatType: RepeatType;
  repeatDays: number[];
  vibrationEnabled: boolean;
  snoozeMinutes: number;
  isActive: boolean;
  notificationIds: string[];
  createdAt: string;
}
