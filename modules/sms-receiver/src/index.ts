import { requireNativeModule } from "expo";
import type { EventSubscription } from "expo-modules-core";

export type IncomingSms = {
  messageBody: string;
  sender: string;
  timestamp: number;
};

type SmsReceiverNativeModule = {
  addListener: (
    eventName: "onSMSReceived",
    listener: (message: IncomingSms) => void,
  ) => EventSubscription;
  setEnabled: (enabled: boolean) => void;
  getPendingMessages: () => IncomingSms[];
};

export function getSmsReceiverModule(): SmsReceiverNativeModule | null {
  try {
    return requireNativeModule<SmsReceiverNativeModule>("SmsReceiver");
  } catch {
    // Expo Go and non-Android builds do not include this app-specific module.
    return null;
  }
}
