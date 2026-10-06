import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reminder.dart';

class ReminderCard extends StatelessWidget {
  final Reminder reminder;
  final VoidCallback? onToggle;
  final VoidCallback? onDelete;

  const ReminderCard({
    super.key,
    required this.reminder,
    this.onToggle,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      child: ListTile(
        leading: const Icon(Icons.alarm),
        title: Text(reminder.label),
        subtitle: Text(DateFormat('dd MMM yyyy, hh:mm a').format(reminder.dateTime)),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Switch(value: reminder.isActive, onChanged: (_) => onToggle?.call()),
            IconButton(icon: const Icon(Icons.delete_outline), onPressed: onDelete),
          ],
        ),
      ),
    );
  }
}
