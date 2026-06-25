import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Reminder } from '@/types/reminder';
import { loadReminders, saveReminders } from '@/utils/storage';
import {
  cancelReminder,
  requestNotificationPermissions,
  scheduleReminder,
  scheduleSnooze,
  setupNotificationChannel,
} from '@/utils/notifications';

interface RemindersContextValue {
  reminders: Reminder[];
  loading: boolean;
  activeAlert: Reminder | null;
  setActiveAlert: (r: Reminder | null) => void;
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt' | 'notificationIds'>) => Promise<void>;
  updateReminder: (r: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  snoozeAlert: (reminder: Reminder) => Promise<void>;
  dismissAlert: () => void;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);
  const remindersRef = useRef<Reminder[]>([]);

  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await loadReminders();
      if (mounted) {
        setReminders(saved);
        setLoading(false);
      }
    })();
    requestNotificationPermissions();
    setupNotificationChannel();
    return () => { mounted = false; };
  }, []);

  const persist = useCallback(async (updated: Reminder[]) => {
    setReminders(updated);
    await saveReminders(updated);
  }, []);

  const addReminder = useCallback(async (
    data: Omit<Reminder, 'id' | 'createdAt' | 'notificationIds'>
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const reminder: Reminder = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      notificationIds: [],
    };
    let notificationIds: string[] = [];
    if (reminder.isActive) {
      notificationIds = await scheduleReminder(reminder);
    }
    const final = { ...reminder, notificationIds };
    await persist([...remindersRef.current, final]);
  }, [persist]);

  const updateReminder = useCallback(async (updated: Reminder) => {
    await cancelReminder(updated.notificationIds);
    let notificationIds: string[] = [];
    if (updated.isActive) {
      notificationIds = await scheduleReminder(updated);
    }
    const final = { ...updated, notificationIds };
    const next = remindersRef.current.map(r => r.id === final.id ? final : r);
    await persist(next);
  }, [persist]);

  const deleteReminder = useCallback(async (id: string) => {
    const r = remindersRef.current.find(x => x.id === id);
    if (r) await cancelReminder(r.notificationIds);
    await persist(remindersRef.current.filter(x => x.id !== id));
  }, [persist]);

  const toggleReminder = useCallback(async (id: string) => {
    const r = remindersRef.current.find(x => x.id === id);
    if (!r) return;
    await cancelReminder(r.notificationIds);
    const isActive = !r.isActive;
    let notificationIds: string[] = [];
    if (isActive) {
      notificationIds = await scheduleReminder({ ...r, isActive });
    }
    const next = remindersRef.current.map(x =>
      x.id === id ? { ...r, isActive, notificationIds } : x
    );
    await persist(next);
  }, [persist]);

  const snoozeAlert = useCallback(async (reminder: Reminder) => {
    setActiveAlert(null);
    await scheduleSnooze(reminder);
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        loading,
        activeAlert,
        setActiveAlert,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        snoozeAlert,
        dismissAlert,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within RemindersProvider');
  return ctx;
}
