import 'package:flutter/material.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: PageView(
          children: [
            _page(context, Icons.alarm, 'Reminders On Time',
                'Waqt par alarm bajey ga phone lock ho ya unlock ho.'),
            _page(context, Icons.lock_open, 'Lock Screen Full-Screen',
                'Phone locked hone par full-screen alarm dikhe ga.'),
            _page(context, Icons.battery_alert, 'Battery Optimization',
                'Xiaomi/Oppo/Vivo etc. par "Unrestricted" set karein taake alarm miss na ho.'),
          ],
        ),
      ),
    );
  }

  Widget _page(BuildContext context, IconData icon, String title, String sub) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 96),
          const SizedBox(height: 32),
          Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 16),
          Text(sub, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge),
          const Spacer(),
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Start'),
          )
        ],
      ),
    );
  }
}
