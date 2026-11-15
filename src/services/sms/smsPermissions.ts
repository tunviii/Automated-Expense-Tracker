import { PermissionsAndroid, Platform } from "react-native";

export type SmsPermissionStatus = "granted" | "denied" | "unsupported";

/**
 * Checks whether both READ_SMS and RECEIVE_SMS permissions are granted.
 */
export async function checkSmsPermissions(): Promise<SmsPermissionStatus> {
  if (Platform.OS !== "android") {
    return "unsupported";
  }

  try {
    const hasReceive = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    );
    const hasRead = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );

    if (hasReceive && hasRead) {
      return "granted";
    }
    return "denied";
  } catch (err) {
    console.warn("Failed to check SMS permissions:", err);
    return "denied";
  }
}

/**
 * Prompts the user with the standard Android runtime permission dialog
 * for both incoming SMS reception and reading messages.
 */
export async function requestSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    ]);

    const receiveGranted =
      results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const readGranted =
      results[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED;

    return receiveGranted && readGranted;
  } catch (err) {
    console.warn("Failed to request SMS permissions:", err);
    return false;
  }
}
