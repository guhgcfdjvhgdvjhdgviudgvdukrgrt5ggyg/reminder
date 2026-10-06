import 'package:android_alarm_manager_plus/android_alarm_manager_plus.dart';

class AlarmService {
  static Future<void> init() async {
    await AndroidAlarmManager.initialize();
  }

  static Future<void> scheduleOneShot({
    required int id,
    required DateTime dateTime,
  }) async {
    await AndroidAlarmManager.oneShotAt(
      dateTime,
      id,
      callback,
      allowWhileIdle: true,
      exact: true,
      wakeup: true,
      rescheduleOnReboot: true,
    );
  }

  static Future<void> cancel(int id) async {
    await AndroidAlarmManager.cancel(id);
  }
}

// Callback for background alarm
@pragma('vm:entry-point')
void callback(int id) async {
  // Placeholder - native side will handle full-screen activity
  // For this starter, this shows the intent path
}
