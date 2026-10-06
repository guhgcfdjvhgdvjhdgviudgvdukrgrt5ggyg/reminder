import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/reminder_provider.dart';
import '../models/reminder.dart';
import 'add_reminder_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        context.read<ReminderProvider>().loadReminders());
  }

  String _formatDateTime(DateTime dt) {
    return DateFormat('dd MMM, hh:mm a').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ReminderProvider>();
    final upcoming = provider.upcoming;
    final completed = provider.completed;

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('RemindMe'),
          centerTitle: true,
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Aaj/Aane wale'),
              Tab(text: 'Active'),
              Tab(text: 'Complete'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildList(upcoming, showDone: true),
            _buildList(upcoming),
            _buildList(completed, showUndo: true),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () async {
            await Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AddReminderScreen()),
            );
            if (mounted) context.read<ReminderProvider>().loadReminders();
          },
          icon: const Icon(Icons.add),
          label: const Text('Naya Reminder'),
        ),
      ),
    );
  }

  Widget _buildList(List<Reminder> items, {bool showDone = false, bool showUndo = false}) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.alarm_off_outlined, size: 72, color: Colors.grey[400]),
            const SizedBox(height: 12),
            Text(
              showUndo ? 'Koi complete nahi' : 'Koi reminder nahi\n+ dabao naya banane ke liye',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: items.length,
      itemBuilder: (context, i) {
        final r = items[i];
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: CircleAvatar(
              child: Icon(r.vibrate ? Icons.notifications_active : Icons.notifications),
            ),
            title: Text(r.label, maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_formatDateTime(r.dateTime)),
                if (r.note.isNotEmpty)
                  Text(r.note, maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
            trailing: showDone
                ? IconButton(
                    icon: const Icon(Icons.check_circle_outline),
                    onPressed: () async {
                      await context.read<ReminderProvider>().updateReminder(
                            r.copyWith(isDone: true, isActive: false),
                          );
                    },
                  )
                : showUndo
                    ? IconButton(
                        icon: const Icon(Icons.restore),
                        onPressed: () async {
                          await context.read<ReminderProvider>().updateReminder(
                                r.copyWith(isDone: false, isActive: true),
                              );
                        },
                      )
                    : Switch(
                        value: r.isActive,
                        onChanged: (v) async {
                          await context.read<ReminderProvider>().updateReminder(
                                r.copyWith(isActive: v),
                              );
                        },
                      ),
            onLongPress: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Delete Reminder'),
                  content: Text('Kya tum "${r.label}" delete karna chaho ge?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                    FilledButton.tonal(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
                  ],
                ),
              );
              if (confirm == true && r.id != null) {
                await context.read<ReminderProvider>().deleteReminder(r.id!);
              }
            },
          ),
        );
      },
    );
  }
}
