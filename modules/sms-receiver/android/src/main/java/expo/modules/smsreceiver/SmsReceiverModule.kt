package expo.modules.smsreceiver

import android.content.Context
import android.content.BroadcastReceiver
import android.content.Intent
import android.provider.Telephony
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

private object SmsMessageStore {
  private const val PREFS = "expense_sms_receiver"
  private const val ENABLED = "enabled"
  private const val PENDING = "pending"
  private const val MAX_PENDING_MESSAGES = 100
  private val lock = Any()
  var onMessage: ((Map<String, Any?>) -> Unit)? = null

  fun isEnabled(context: Context): Boolean =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(ENABLED, false)

  fun setEnabled(context: Context, enabled: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(ENABLED, enabled).apply()
  }

  fun enqueue(context: Context, message: Map<String, Any?>) {
    synchronized(lock) {
      val preferences = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      val pending = JSONArray(preferences.getString(PENDING, "[]"))
      val item = JSONObject()
      message.forEach { (key, value) -> item.put(key, value) }
      pending.put(item)
      val boundedPending = JSONArray()
      val firstRetained = (pending.length() - MAX_PENDING_MESSAGES).coerceAtLeast(0)
      for (index in firstRetained until pending.length()) {
        boundedPending.put(pending.getJSONObject(index))
      }
      preferences.edit().putString(PENDING, boundedPending.toString()).commit()
    }
    onMessage?.invoke(message)
  }

  fun drain(context: Context): List<Map<String, Any?>> = synchronized(lock) {
    val preferences = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val pending = JSONArray(preferences.getString(PENDING, "[]"))
    preferences.edit().remove(PENDING).commit()
    (0 until pending.length()).mapNotNull { index ->
      val item = pending.optJSONObject(index) ?: return@mapNotNull null
      mapOf(
        "messageBody" to item.optString("messageBody"),
        "sender" to item.optString("sender"),
        "timestamp" to item.optLong("timestamp")
      )
    }
  }
}

class SmsReceiverModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsReceiver")
    Events("onSMSReceived")

    OnCreate {
      SmsMessageStore.onMessage = { message -> sendEvent("onSMSReceived", message) }
    }

    OnDestroy {
      SmsMessageStore.onMessage = null
    }

    Function("setEnabled") { enabled: Boolean ->
      SmsMessageStore.setEnabled(appContext.applicationContext, enabled)
    }

    Function("getPendingMessages") {
      SmsMessageStore.drain(appContext.applicationContext)
    }
  }
}

class SmsBroadcastReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != "android.provider.Telephony.SMS_RECEIVED" || !SmsMessageStore.isEnabled(context)) return

    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    if (messages.isNullOrEmpty()) return
    val body = messages.joinToString(separator = "") { it.messageBody.orEmpty() }.trim()
    if (body.isNotEmpty()) {
      val firstMessage = messages.first()
      SmsMessageStore.enqueue(context, mapOf(
        "messageBody" to body,
        "sender" to (firstMessage.originatingAddress ?: ""),
        "timestamp" to firstMessage.timestampMillis
      ))
    }
  }
}
