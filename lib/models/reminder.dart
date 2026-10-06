enum RepeatType { none, daily, weekly, monthly }

class Reminder {
  final int? id;
  final String label;
  final String note;
  final DateTime dateTime;
  final RepeatType repeatType;
  final List<int> repeatDays; // 1=Mon, 2=Tue ...
  final int snoozeMinutes;
  final String ringtone;
  final bool vibrate;
  final bool isActive;
  final bool isDone;

  Reminder({
    this.id,
    required this.label,
    this.note = '',
    required this.dateTime,
    this.repeatType = RepeatType.none,
    this.repeatDays = const [],
    this.snoozeMinutes = 10,
    this.ringtone = 'default',
    this.vibrate = true,
    this.isActive = true,
    this.isDone = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'label': label,
      'note': note,
      'dateTime': dateTime.millisecondsSinceEpoch,
      'repeatType': repeatType.name,
      'repeatDays': repeatDays.join(','),
      'snoozeMinutes': snoozeMinutes,
      'ringtone': ringtone,
      'vibrate': vibrate ? 1 : 0,
      'isActive': isActive ? 1 : 0,
      'isDone': isDone ? 1 : 0,
    };
  }

  factory Reminder.fromMap(Map<String, dynamic> map) {
    return Reminder(
      id: map['id'],
      label: map['label'],
      note: map['note'] ?? '',
      dateTime: DateTime.fromMillisecondsSinceEpoch(map['dateTime']),
      repeatType: RepeatType.values.firstWhere(
        (e) => e.name == map['repeatType'],
        orElse: () => RepeatType.none,
      ),
      repeatDays: (map['repeatDays'] as String? ?? '')
          .split(',')
          .where((e) => e.isNotEmpty)
          .map((e) => int.parse(e))
          .toList(),
      snoozeMinutes: map['snoozeMinutes'] ?? 10,
      ringtone: map['ringtone'] ?? 'default',
      vibrate: (map['vibrate'] ?? 1) == 1,
      isActive: (map['isActive'] ?? 1) == 1,
      isDone: (map['isDone'] ?? 0) == 1,
    );
  }

  Reminder copyWith({
    int? id,
    String? label,
    String? note,
    DateTime? dateTime,
    RepeatType? repeatType,
    List<int>? repeatDays,
    int? snoozeMinutes,
    String? ringtone,
    bool? vibrate,
    bool? isActive,
    bool? isDone,
  }) {
    return Reminder(
      id: id ?? this.id,
      label: label ?? this.label,
      note: note ?? this.note,
      dateTime: dateTime ?? this.dateTime,
      repeatType: repeatType ?? this.repeatType,
      repeatDays: repeatDays ?? this.repeatDays,
      snoozeMinutes: snoozeMinutes ?? this.snoozeMinutes,
      ringtone: ringtone ?? this.ringtone,
      vibrate: vibrate ?? this.vibrate,
      isActive: isActive ?? this.isActive,
      isDone: isDone ?? this.isDone,
    );
  }
}
