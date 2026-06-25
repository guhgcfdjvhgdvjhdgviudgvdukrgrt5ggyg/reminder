import { Feather } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors, fontFamily, fontSize, spacing, borderRadius } from '@/constants/design';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad(n: number) {
  return n.toString().padStart(2, '0');
}

interface Props {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export function DateTimePickerModal({ visible, date, onConfirm, onCancel }: Props) {
  const colors = useColors();
  const [tab, setTab] = useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = useState(() => new Date(date));
  const [viewYear, setViewYear] = useState(date.getFullYear());
  const [viewMonth, setViewMonth] = useState(date.getMonth());

  const today = new Date();

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const selectDay = useCallback((day: number) => {
    const d = new Date(selectedDate);
    d.setFullYear(viewYear, viewMonth, day);
    setSelectedDate(d);
  }, [viewYear, viewMonth, selectedDate]);

  const changeHour = useCallback((delta: number) => {
    const d = new Date(selectedDate);
    d.setHours((d.getHours() + delta + 24) % 24);
    setSelectedDate(d);
  }, [selectedDate]);

  const changeMinute = useCallback((delta: number) => {
    const d = new Date(selectedDate);
    d.setMinutes((d.getMinutes() + delta + 60) % 60);
    setSelectedDate(d);
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const selYear = selectedDate.getFullYear();
  const selMonth = selectedDate.getMonth();
  const selDay = selectedDate.getDate();
  const selHour = selectedDate.getHours();
  const selMinute = selectedDate.getMinutes();

  const tabStyle = (t: 'date' | 'time') => [
    styles.tabBtn,
    tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={e => e.stopPropagation?.()}
        >
          {/* Tab bar */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            <Pressable style={tabStyle('date')} onPress={() => setTab('date')}>
              <Feather name="calendar" size={16} color={tab === 'date' ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: tab === 'date' ? colors.primary : colors.mutedForeground }]}>
                Date
              </Text>
            </Pressable>
            <Pressable style={tabStyle('time')} onPress={() => setTab('time')}>
              <Feather name="clock" size={16} color={tab === 'time' ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: tab === 'time' ? colors.primary : colors.mutedForeground }]}>
                Time
              </Text>
            </Pressable>
          </View>

          {tab === 'date' ? (
            <View style={styles.calendarSection}>
              {/* Month nav */}
              <View style={styles.monthNav}>
                <Pressable onPress={prevMonth} hitSlop={12}>
                  <Feather name="chevron-left" size={22} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.monthLabel, { color: colors.foreground }]}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <Pressable onPress={nextMonth} hitSlop={12}>
                  <Feather name="chevron-right" size={22} color={colors.foreground} />
                </Pressable>
              </View>

              {/* Day headers */}
              <View style={styles.dayHeaders}>
                {DAY_HEADERS.map(d => (
                  <Text key={d} style={[styles.dayHeader, { color: colors.mutedForeground }]}>{d}</Text>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.grid}>
                {cells.map((day, idx) => {
                  if (!day) return <View key={`empty-${idx}`} style={styles.cell} />;
                  const isSelected = day === selDay && viewMonth === selMonth && viewYear === selYear;
                  const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                  return (
                    <Pressable
                      key={day}
                      style={[
                        styles.cell,
                        isSelected && { backgroundColor: colors.primary, borderRadius: borderRadius.full },
                        !isSelected && isToday && { borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.primary },
                      ]}
                      onPress={() => selectDay(day)}
                    >
                      <Text style={[
                        styles.cellText,
                        { color: isSelected ? colors.primaryForeground : isToday ? colors.primary : colors.foreground },
                      ]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.timeSection}>
              <Text style={[styles.timePreview, { color: colors.primary }]}>
                {pad(selHour)}:{pad(selMinute)}
              </Text>
              <View style={styles.timeRow}>
                {/* Hour */}
                <View style={styles.timeCol}>
                  <Text style={[styles.timeColLabel, { color: colors.mutedForeground }]}>Hour</Text>
                  <Pressable style={[styles.timeBtn, { backgroundColor: colors.secondary }]} onPress={() => changeHour(1)}>
                    <Feather name="chevron-up" size={20} color={colors.foreground} />
                  </Pressable>
                  <Text style={[styles.timeValue, { color: colors.foreground }]}>{pad(selHour)}</Text>
                  <Pressable style={[styles.timeBtn, { backgroundColor: colors.secondary }]} onPress={() => changeHour(-1)}>
                    <Feather name="chevron-down" size={20} color={colors.foreground} />
                  </Pressable>
                </View>

                <Text style={[styles.timeSep, { color: colors.foreground }]}>:</Text>

                {/* Minute */}
                <View style={styles.timeCol}>
                  <Text style={[styles.timeColLabel, { color: colors.mutedForeground }]}>Min</Text>
                  <Pressable style={[styles.timeBtn, { backgroundColor: colors.secondary }]} onPress={() => changeMinute(5)}>
                    <Feather name="chevron-up" size={20} color={colors.foreground} />
                  </Pressable>
                  <Text style={[styles.timeValue, { color: colors.foreground }]}>{pad(selMinute)}</Text>
                  <Pressable style={[styles.timeBtn, { backgroundColor: colors.secondary }]} onPress={() => changeMinute(-5)}>
                    <Feather name="chevron-down" size={20} color={colors.foreground} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.fineRow}>
                <Pressable style={[styles.fineBtn, { backgroundColor: colors.secondary }]} onPress={() => changeMinute(-1)}>
                  <Text style={[styles.fineBtnText, { color: colors.foreground }]}>-1 min</Text>
                </Pressable>
                <Pressable style={[styles.fineBtn, { backgroundColor: colors.secondary }]} onPress={() => changeMinute(1)}>
                  <Text style={[styles.fineBtnText, { color: colors.foreground }]}>+1 min</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Summary + actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[styles.summary, { color: colors.mutedForeground }]}>
              {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              {' at '}
              {pad(selHour)}:{pad(selMinute)}
            </Text>
            <View style={styles.footerActions}>
              <Pressable onPress={onCancel} style={[styles.footerBtn, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.footerBtnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => onConfirm(selectedDate)} style={[styles.footerBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.footerBtnText, { color: colors.primaryForeground }]}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: Platform.OS === 'web' ? 360 : '92%',
    maxWidth: 380,
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.medium,
  },
  calendarSection: {
    padding: spacing['2xl'],
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  monthLabel: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.semiBold,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  cellText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
  },
  timeSection: {
    alignItems: 'center',
    padding: spacing['4xl'],
    gap: spacing['2xl'],
  },
  timePreview: {
    fontSize: fontSize['9xl'],
    fontFamily: fontFamily.bold,
    letterSpacing: -2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xl'],
  },
  timeCol: {
    alignItems: 'center',
    gap: spacing.md,
  },
  timeColLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    marginBottom: spacing.xs,
  },
  timeBtn: {
    width: 56,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: fontSize['7xl'],
    fontFamily: fontFamily.bold,
    minWidth: 64,
    textAlign: 'center',
  },
  timeSep: {
    fontSize: fontSize['7xl'],
    fontFamily: fontFamily.bold,
    marginTop: spacing['5xl'],
  },
  fineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  fineBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  fineBtnText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  summary: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semiBold,
  },
});
