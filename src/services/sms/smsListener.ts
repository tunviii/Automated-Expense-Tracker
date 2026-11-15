import {
  DeviceEventEmitter,
  NativeModules,
  Platform,
} from "react-native";

import {
  checkSmsPermissions,
  requestSmsPermissions,
} from "@/services/sms/smsPermissions";
import {
  processIncomingSms,
  type SmsProcessResult,
} from "@/services/sms/smsAutoProcessor";
import type { ExpenseTransaction } from "@/types/transaction";

export type SmsListenerStatus = {
  isSupported: boolean;
  isListening: boolean;
  permissionGranted: boolean;
  mode: "native" | "expo-go" | "unsupported";
};

let isCurrentlyListening = false;
let listenerSubscription: { remove: () => void } | null = null;

/**
 * Checks whether native Android SMS receiver modules are loaded.
 * In Expo Go, native SMS receivers are not bundled, so fallback/simulation is used.
 */
export function isNativeSmsModuleAvailable(): boolean {
  if (Platform.OS !== "android") return false;
  return Boolean(
    NativeModules.SmsListenerModule ||
      NativeModules.SmsAndroid ||
      NativeModules.RNSmsReceiver,
  );
}

/**
 * Gets current listener health and status.
 */
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
  const hasNative = isNativeSmsModuleAvailable();

  return {
    isSupported: true,
    isListening: isCurrentlyListening,
    permissionGranted: permission === "granted",
    mode: hasNative ? "native" : "expo-go",
  };
}

/**
 * Starts the automatic SMS background/foreground listener.
 * If running in a standalone APK, hooks into Android SMS_RECEIVED broadcasts.
 */
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
  if (permission !== "granted") {
    const requested = await requestSmsPermissions();
    if (!requested) {
      return {
        success: false,
        message: "SMS permissions were not granted by the user.",
      };
    }
  }

  // Check if native module is available
  if (!isNativeSmsModuleAvailable()) {
    isCurrentlyListening = true;
    return {
      success: true,
      message:
        "Running in Expo Go (simulated listener ready). Build the standalone APK for automatic hardware SMS broadcasts.",
    };
  }

  // Subscribe to Android SMS event emitter
  try {
    listenerSubscription?.remove();

    listenerSubscription = DeviceEventEmitter.addListener(
      "onSMSReceived",
      async (event: { messageBody?: string; body?: string }) => {
        const text = event?.messageBody || event?.body || "";
        if (!text) return;

        const result = await processIncomingSms(text);
        if (result.processed && result.transaction && onDetected) {
          onDetected(result.transaction);
        }
      },
    );

    isCurrentlyListening = true;
    return {
      success: true,
      message: "Automatic SMS listener is active and waiting for bank alerts.",
    };
  } catch (err) {
    console.warn("Failed to attach SMS broadcast listener:", err);
    return {
      success: false,
      message: `Failed to attach native SMS listener: ${String(err)}`,
    };
  }
}

/**
 * Stops the active SMS listener.
 */
export function stopSmsListener(): void {
  if (listenerSubscription) {
    listenerSubscription.remove();
    listenerSubscription = null;
  }
  isCurrentlyListening = false;
}

/**
 * Test utility: simulate an incoming SMS right now to verify the entire
 * automatic parsing, classification, and SQLite persistence flow.
 */
export async function simulateIncomingSms(
  smsText: string,
): Promise<SmsProcessResult> {
  return await processIncomingSms(smsText);
}
