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
import { useColors } from '@/hooks/useColors';

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
                        isSelected && { backgroundColor: colors.primary, borderRadius: 999 },
                        !isSelected && isToday && { borderRadius: 999, borderWidth: 1, borderColor: colors.primary },
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
    borderRadius: 20,
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
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  calendarSection: {
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  dayHeader: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
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
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  timeSection: {
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  timePreview: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeCol: {
    alignItems: 'center',
    gap: 8,
  },
  timeColLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  timeBtn: {
    width: 56,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    minWidth: 64,
    textAlign: 'center',
  },
  timeSep: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginTop: 32,
  },
  fineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fineBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
    gap: 12,
  },
  summary: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
