import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/reminder.dart';
import '../providers/reminder_provider.dart';

class AddReminderScreen extends StatefulWidget {
  const AddReminderScreen({super.key});

  @override
  State<AddReminderScreen> createState() => _AddReminderScreenState();
}

class _AddReminderScreenState extends State<AddReminderScreen> {
  final _labelController = TextEditingController();
  final _noteController = TextEditingController();
  DateTime _selectedDate = DateTime.now().add(const Duration(minutes: 10));
  RepeatType _repeatType = RepeatType.none;
  int _snoozeMinutes = 10;
  bool _vibrate = true;
  final List<bool> _weekDays = [false, false, false, false, false, false, false]; // Mon-Sun? use 1-7 later

  @override
  void dispose() {
    _labelController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime(2100),
    );
    if (d != null) {
      setState(() {
        _selectedDate = DateTime(d.year, d.month, d.day, _selectedDate.hour, _selectedDate.minute);
      });
    }
  }

  Future<void> _pickTime() async {
    final t = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDate),
    );
    if (t != null) {
      setState(() {
        _selectedDate = DateTime(_selectedDate.year, _selectedDate.month, _selectedDate.day, t.hour, t.minute);
      });
    }
  }

  List<int> _getRepeatDays() {
    // Simple: not fully mapped in UI (can extend later) - return empty for now
    return [];
  }

  Future<void> _save() async {
    final label = _labelController.text.trim();
    if (label.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Label likhein (title)')),
      );
      return;
    }

    // Ensure future time (basic check)
    final now = DateTime.now();
    var dt = _selectedDate;
    if (dt.isBefore(now)) {
      dt = now.add(const Duration(minutes: 1));
    }

    final r = Reminder(
      label: label,
      note: _noteController.text.trim(),
      dateTime: dt,
      repeatType: _repeatType,
      repeatDays: _getRepeatDays(),
      snoozeMinutes: _snoozeMinutes,
      vibrate: _vibrate,
      isActive: true,
      isDone: false,
    );

    await context.read<ReminderProvider>().addReminder(r);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Naya Reminder'),
        actions: [
          FilledButton(
            onPressed: _save,
            child: const Text('Save'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _labelController,
            decoration: const InputDecoration(
              labelText: 'Label (Title)',
              hintText: 'Jaise: Doctor appointment',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.label_outline),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _pickDate,
                  icon: const Icon(Icons.calendar_today),
                  label: Text(DateFormat('dd MMM yyyy').format(_selectedDate)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _pickTime,
                  icon: const Icon(Icons.access_time),
                  label: Text(DateFormat('hh:mm a').format(_selectedDate)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<RepeatType>(
            value: _repeatType,
            decoration: const InputDecoration(
              labelText: 'Repeat',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(value: RepeatType.none, child: Text('Once (Ek baar)')),
              DropdownMenuItem(value: RepeatType.daily, child: Text('Daily (Rozana)')),
              DropdownMenuItem(value: RepeatType.weekly, child: Text('Weekly (Hafte mein)')),
              DropdownMenuItem(value: RepeatType.monthly, child: Text('Monthly (Mahine mein)')),
            ],
            onChanged: (v) => setState(() => _repeatType = v ?? RepeatType.none),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<int>(
            value: _snoozeMinutes,
            decoration: const InputDecoration(
              labelText: 'Snooze Duration',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(value: 5, child: Text('5 Minutes')),
              DropdownMenuItem(value: 10, child: Text('10 Minutes')),
              DropdownMenuItem(value: 15, child: Text('15 Minutes')),
              DropdownMenuItem(value: 30, child: Text('30 Minutes')),
            ],
            onChanged: (v) => setState(() => _snoozeMinutes = v ?? 10),
          ),
          const SizedBox(height: 16),
          SwitchListTile(
            value: _vibrate,
            title: const Text('Vibration'),
            subtitle: const Text('Alarm ke sath vibration chalega'),
            onChanged: (v) => setState(() => _vibrate = v),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _noteController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Note (Optional)',
              hintText: 'Kuch extra info likhein...',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 56,
            child: FilledButton.icon(
              onPressed: _save,
              icon: const Icon(Icons.save),
              label: const Text('Save Reminder'),
            ),
          )
        ],
      ),
    );
  }
}
