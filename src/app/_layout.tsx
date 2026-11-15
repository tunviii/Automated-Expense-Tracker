import { useEffect } from "react";
import { Stack } from "expo-router";

import {
  checkSmsPermissions,
} from "@/services/sms/smsPermissions";
import {
  startSmsListener,
} from "@/services/sms/smsListener";
import { useExpenseStore } from "@/services/store/expenseStore";

export default function RootLayout() {
  useEffect(() => {
    useExpenseStore.getState().initStore();

    checkSmsPermissions().then((status) => {
      if (status === "granted") {
        startSmsListener();
      }
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
