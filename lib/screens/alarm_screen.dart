import 'package:flutter/material.dart';

class AlarmScreen extends StatelessWidget {
  final String title;
  const AlarmScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    final time = TimeOfDay.now().format(context);
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.alarm, size: 96),
            const SizedBox(height: 24),
            Text(
              time,
              style: Theme.of(context).textTheme.displayLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // TODO: Snooze logic (schedule +10 min)
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.snooze),
                      label: const Text('Snooze 10 min'),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white24,
                        foregroundColor: Colors.black87,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '←←  Swipe to Done  →→',
                    style: TextStyle(color: Colors.black.withOpacity(0.7)),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: FilledButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.check),
                      label: const Text('Done'),
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
