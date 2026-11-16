import { Platform } from "react-native";

import {
  checkSmsPermissions,
  requestSmsPermissions,
} from "@/services/sms/smsPermissions";
import {
  processIncomingSms,
  type SmsProcessResult,
} from "@/services/sms/smsAutoProcessor";
import type { ExpenseTransaction } from "@/types/transaction";
import {
  getSmsReceiverModule,
  type IncomingSms,
} from "../../../modules/sms-receiver/src";

export type SmsListenerStatus = {
  isSupported: boolean;
  isListening: boolean;
  permissionGranted: boolean;
  mode: "native" | "expo-go" | "unsupported";
};

let isCurrentlyListening = false;
let removeNativeListener: (() => void) | null = null;
const recentlyProcessed = new Map<string, true>();

function messageKey(message: IncomingSms): string {
  return `${message.sender}:${message.timestamp}:${message.messageBody}`;
}

async function handleIncomingMessage(
  message: IncomingSms,
  onDetected?: (txn: ExpenseTransaction) => void,
): Promise<void> {
  const body = message.messageBody?.trim();
  if (!body) return;

  const key = messageKey(message);
  if (recentlyProcessed.has(key)) return;
  recentlyProcessed.set(key, true);
  if (recentlyProcessed.size > 200) {
    const oldestKey = recentlyProcessed.keys().next().value;
    if (oldestKey) recentlyProcessed.delete(oldestKey);
  }

  try {
    const result = await processIncomingSms(body, message.sender);
    if (result.processed && result.transaction && onDetected) {
      onDetected(result.transaction);
    }
  } catch (error) {
    console.warn("Failed to process incoming SMS:", error);
  }
}

export function isNativeSmsModuleAvailable(): boolean {
  return Platform.OS === "android" && getSmsReceiverModule() !== null;
}

export async function getSmsListenerStatus(): Promise<SmsListenerStatus> {
  if (Platform.OS !== "android") {
    return {
      isSupported: false,
      isListening: false,
      permissionGranted: false,
      mode: "unsupported",
    };
  }

  const permission = await checkSmsPermissions();
  return {
    isSupported: true,
    isListening: isCurrentlyListening,
    permissionGranted: permission === "granted",
    mode: isNativeSmsModuleAvailable() ? "native" : "expo-go",
  };
}

/** Starts the Android SMS receiver and routes each message through the expense pipeline. */
export async function startSmsListener(
  onDetected?: (txn: ExpenseTransaction) => void,
): Promise<{ success: boolean; message: string }> {
  if (Platform.OS !== "android") {
    return {
      success: false,
      message: "Automatic SMS reading is only available on Android.",
    };
  }

  const permission = await checkSmsPermissions();
  if (permission !== "granted" && !(await requestSmsPermissions())) {
    return {
      success: false,
      message: "SMS permissions were not granted by the user.",
    };
  }

  const nativeModule = getSmsReceiverModule();
  if (!nativeModule) {
    return {
      success: false,
      message:
        "This app build does not include the native SMS receiver. Install a newly built APK; Expo Go cannot receive SMS broadcasts.",
    };
  }

  try {
    removeNativeListener?.();
    nativeModule.setEnabled(true);
    isCurrentlyListening = true;

    // Subscribe first so messages arriving while queued messages are drained are not missed.
    const subscription = nativeModule.addListener("onSMSReceived", (message) => {
      void handleIncomingMessage(message, onDetected);
    });
    removeNativeListener = () => subscription.remove();

    const pendingMessages = await nativeModule.getPendingMessages();
    for (const message of pendingMessages) {
      await handleIncomingMessage(message, onDetected);
    }

    return {
      success: true,
      message:
        "Automatic SMS listener is active. Incoming messages will be checked and transaction alerts saved.",
    };
  } catch (error) {
    isCurrentlyListening = false;
    removeNativeListener?.();
    removeNativeListener = null;
    console.warn("Failed to start native SMS listener:", error);
    return {
      success: false,
      message: `Failed to start the native SMS receiver: ${String(error)}`,
    };
  }
}

export function stopSmsListener(): void {
  removeNativeListener?.();
  removeNativeListener = null;
  getSmsReceiverModule()?.setEnabled(false);
  isCurrentlyListening = false;
}

/** Test utility: run a sample message through detection, parsing, classification, and SQLite. */
export async function simulateIncomingSms(
  smsText: string,
): Promise<SmsProcessResult> {
  return await processIncomingSms(smsText);
}
