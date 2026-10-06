import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const ListTile(
            title: Text('Theme'),
            subtitle: Text('Light/Dark - abhi system default use ho raha hai'),
            leading: Icon(Icons.brightness_6_outlined),
          ),
          const Divider(),
          ListTile(
            title: const Text('Permissions Check'),
            subtitle: const Text('Notifications, Alarms, Battery Optimization'),
            leading: const Icon(Icons.security_outlined),
            onTap: () async {
              await openAppSettings();
            },
          ),
          const Divider(),
          const ListTile(
            title: Text('About RemindMe'),
            subtitle: Text('Version 1.0.0'),
            leading: Icon(Icons.info_outline),
          ),
        ],
      ),
    );
  }
}
