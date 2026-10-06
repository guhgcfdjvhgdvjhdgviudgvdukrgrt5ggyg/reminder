import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/reminder.dart';
import '../providers/reminder_provider.dart';

class AddReminderScreen extends StatefulWidget {
  final Reminder? reminder;
  const AddReminderScreen({super.key, this.reminder});

  @override
  State<AddReminderScreen> createState() => _AddReminderScreenState();
}

class _AddReminderScreenState extends State<AddReminderScreen>
    with SingleTickerProviderStateMixin {
  final _labelController = TextEditingController();
  final _noteController = TextEditingController();
  late DateTime _selectedDate;
  RepeatType _repeatType = RepeatType.none;
  int _snoozeMinutes = 10;
  bool _vibrate = true;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  bool get isEditing => widget.reminder != null;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    );
    _animController.forward();

    if (isEditing) {
      final r = widget.reminder!;
      _labelController.text = r.label;
      _noteController.text = r.note;
      _selectedDate = r.dateTime;
      _repeatType = r.repeatType;
      _snoozeMinutes = r.snoozeMinutes;
      _vibrate = r.vibrate;
    } else {
      _selectedDate = DateTime.now().add(const Duration(minutes: 10));
    }
  }

  @override
  void dispose() {
    _labelController.dispose();
    _noteController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final d = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime(2100),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: const Color(0xFF6366F1),
                ),
          ),
          child: child!,
        );
      },
    );
    if (d != null) {
      setState(() {
        _selectedDate = DateTime(
          d.year,
          d.month,
          d.day,
          _selectedDate.hour,
          _selectedDate.minute,
        );
      });
    }
  }

  Future<void> _pickTime() async {
    final t = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDate),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: const Color(0xFF6366F1),
                ),
          ),
          child: child!,
        );
      },
    );
    if (t != null) {
      setState(() {
        _selectedDate = DateTime(
          _selectedDate.year,
          _selectedDate.month,
          _selectedDate.day,
          t.hour,
          t.minute,
        );
      });
    }
  }

  Future<void> _save() async {
    final label = _labelController.text.trim();
    if (label.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Label likhein (title)'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
      return;
    }

    final now = DateTime.now();
    var dt = _selectedDate;
    if (dt.isBefore(now)) {
      dt = now.add(const Duration(minutes: 1));
    }

    final r = Reminder(
      id: widget.reminder?.id,
      label: label,
      note: _noteController.text.trim(),
      dateTime: dt,
      repeatType: _repeatType,
      repeatDays: widget.reminder?.repeatDays ?? [],
      snoozeMinutes: _snoozeMinutes,
      vibrate: _vibrate,
      isActive: true,
      isDone: false,
    );

    if (isEditing) {
      await context.read<ReminderProvider>().updateReminder(r);
    } else {
      await context.read<ReminderProvider>().addReminder(r);
    }
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Reminder' : 'Naya Reminder'),
        actions: [
          if (isEditing)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Delete Reminder'),
                    content:
                        Text('Kya tum "${widget.reminder!.label}" delete karna chaho ge?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton.tonal(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Delete'),
                      ),
                    ],
                  ),
                );
                if (confirm == true && widget.reminder?.id != null) {
                  await context
                      .read<ReminderProvider>()
                      .deleteReminder(widget.reminder!.id!);
                  if (mounted) Navigator.pop(context);
                }
              },
            ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnim,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            TextField(
              controller: _labelController,
              decoration: const InputDecoration(
                labelText: 'Label (Title)',
                hintText: 'Jaise: Doctor appointment',
                prefixIcon: Icon(Icons.label_outline),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildPickerCard(
                    icon: Icons.calendar_today,
                    label: 'Date',
                    value: DateFormat('dd MMM yyyy').format(_selectedDate),
                    onTap: _pickDate,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildPickerCard(
                    icon: Icons.access_time,
                    label: 'Time',
                    value: DateFormat('hh:mm a').format(_selectedDate),
                    onTap: _pickTime,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _buildSection(
              icon: Icons.repeat,
              title: 'Repeat',
              child: Wrap(
                spacing: 8,
                children: RepeatType.values.map((type) {
                  final isSelected = _repeatType == type;
                  final label = type == RepeatType.none
                      ? 'Once'
                      : type == RepeatType.daily
                          ? 'Daily'
                          : type == RepeatType.weekly
                              ? 'Weekly'
                              : 'Monthly';
                  return ChoiceChip(
                    label: Text(label),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _repeatType = type);
                      }
                    },
                    selectedColor: const Color(0xFF6366F1).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF6366F1) : null,
                      fontWeight: isSelected ? FontWeight.w600 : null,
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),
            _buildSection(
              icon: Icons.snooze,
              title: 'Snooze Duration',
              child: Wrap(
                spacing: 8,
                children: [5, 10, 15, 30].map((min) {
                  final isSelected = _snoozeMinutes == min;
                  return ChoiceChip(
                    label: Text('$min min'),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _snoozeMinutes = min);
                      }
                    },
                    selectedColor: const Color(0xFF6366F1).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF6366F1) : null,
                      fontWeight: isSelected ? FontWeight.w600 : null,
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),
            _buildSection(
              icon: Icons.vibration,
              title: 'Vibration',
              child: SwitchListTile(
                value: _vibrate,
                onChanged: (v) => setState(() => _vibrate = v),
                contentPadding: EdgeInsets.zero,
                title: const Text('Alarm ke sath vibration chalega'),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _noteController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Note (Optional)',
                hintText: 'Kuch extra info likhein...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              height: 56,
              child: FilledButton.icon(
                onPressed: _save,
                icon: Icon(isEditing ? Icons.save : Icons.add),
                label: Text(isEditing ? 'Update Reminder' : 'Save Reminder'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPickerCard({
    required IconData icon,
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, size: 18, color: const Color(0xFF6366F1)),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({
    required IconData icon,
    required String title,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: const Color(0xFF6366F1)),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }
}
