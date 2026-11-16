import { PermissionsAndroid, Platform } from "react-native";

export type SmsPermissionStatus = "granted" | "denied" | "unsupported";

/**
 * Checks whether Android allows this app to receive incoming SMS broadcasts.
 */
export async function checkSmsPermissions(): Promise<SmsPermissionStatus> {
  if (Platform.OS !== "android") {
    return "unsupported";
  }

  try {
    const hasReceive = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    );
    return hasReceive ? "granted" : "denied";
  } catch (err) {
    console.warn("Failed to check SMS permissions:", err);
    return "denied";
  }
}

/**
 * Prompts the user with the standard Android runtime permission dialog
 * for incoming SMS reception. Reading the SMS inbox is not needed.
 */
export async function requestSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ]);

    const receiveGranted =
      results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED;
    return receiveGranted;
  } catch (err) {
    console.warn("Failed to request SMS permissions:", err);
    return false;
  }
}
