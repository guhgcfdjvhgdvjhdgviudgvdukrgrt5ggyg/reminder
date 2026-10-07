package com.remindme.app

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Vibrator
import android.os.VibrationEffect
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import android.widget.Button
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AlarmActivity : AppCompatActivity() {
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_alarm)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        val title = intent.getStringExtra("title") ?: "Reminder"
        val ringtoneName = intent.getStringExtra("ringtone") ?: "Default"
        findViewById<TextView>(R.id.alarmTitle).text = title
        findViewById<TextView>(R.id.alarmTime).text = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())

        findViewById<Button>(R.id.btnSnooze).setOnClickListener {
            stopRingtone()
            finish()
        }

        findViewById<Button>(R.id.btnDone).setOnClickListener {
            stopRingtone()
            finish()
        }

        startRingtone(ringtoneName)
    }

    private fun startRingtone(ringtoneName: String) {
        try {
            val uri = getRingtoneUri(ringtoneName)
            mediaPlayer = MediaPlayer()
            mediaPlayer?.setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            mediaPlayer?.setDataSource(this, uri)
            mediaPlayer?.prepare()
            mediaPlayer?.isLooping = true
            mediaPlayer?.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 500, 1000), 0))
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(longArrayOf(0, 500, 1000), 0)
        }
    }

    private fun getRingtoneUri(name: String): Uri {
        return when (name.lowercase()) {
            "alarm" -> RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            "bell" -> RingtoneManager.getRingtoneUri(this, 1)
            "birds" -> RingtoneManager.getRingtoneUri(this, 2)
            "chime" -> RingtoneManager.getRingtoneUri(this, 3)
            "digital" -> RingtoneManager.getRingtoneUri(this, 4)
            "ding" -> RingtoneManager.getRingtoneUri(this, 5)
            "drop" -> RingtoneManager.getRingtoneUri(this, 6)
            "harmony" -> RingtoneManager.getRingtoneUri(this, 7)
            "marimba" -> RingtoneManager.getRingtoneUri(this, 8)
            "melody" -> RingtoneManager.getRingtoneUri(this, 9)
            "morning" -> RingtoneManager.getRingtoneUri(this, 10)
            "music" -> RingtoneManager.getRingtoneUri(this, 11)
            "piano" -> RingtoneManager.getRingtoneUri(this, 12)
            "pop" -> RingtoneManager.getRingtoneUri(this, 13)
            "radar" -> RingtoneManager.getRingtoneUri(this, 14)
            "signal" -> RingtoneManager.getRingtoneUri(this, 15)
            "siren" -> RingtoneManager.getRingtoneUri(this, 16)
            "star" -> RingtoneManager.getRingtoneUri(this, 17)
            "sunrise" -> RingtoneManager.getRingtoneUri(this, 18)
            "twinkle" -> RingtoneManager.getRingtoneUri(this, 19)
            "whistle" -> RingtoneManager.getRingtoneUri(this, 20)
            else -> RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        }
    }

    private fun stopRingtone() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null
        vibrator?.cancel()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopRingtone()
    }
}
