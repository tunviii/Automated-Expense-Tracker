import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import {
  getSmsListenerStatus,
  simulateIncomingSms,
  startSmsListener,
  stopSmsListener,
  type SmsListenerStatus,
} from "@/services/sms/smsListener";
import { useExpenseStore } from "@/services/store/expenseStore";
import { formatCurrency } from "@/utils/currency";

const sampleSimulatedSms = [
  "Your A/C XX4019 is debited for Rs 520.00 on 15-Nov-26; SWIGGY BANGALORE credited. UPI: 349102849102",
  "Rs 149.00 debited from A/C XX4019 on 15-Nov-26 to NETFLIX INDIA. Info: SUB*NETFLIX",
  "A/C 4019 debited by Rs 1,850.00 on 15-Nov-26 at SHELL PETROL PUMP. Avl Bal: Rs 14,210.00",
  "Alert: Rs 3,499.00 debited from your card ending 8812 at AMAZON PAY INDIA on 15-Nov-26.",
];

export default function SettingsScreen() {
  const transactions = useExpenseStore((state) => state.transactions);
  const clearTransactions = useExpenseStore((state) => state.clearTransactions);
  const resetToMockData = useExpenseStore((state) => state.resetToMockData);

  const [listenerStatus, setListenerStatus] = useState<SmsListenerStatus>({
    isSupported: true,
    isListening: false,
    permissionGranted: false,
    mode: "expo-go",
  });
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, []);

  async function refreshStatus() {
    const status = await getSmsListenerStatus();
    setListenerStatus(status);
  }

  async function handleToggleListener() {
    setIsStarting(true);
    if (listenerStatus.isListening) {
      stopSmsListener();
      await refreshStatus();
      Alert.alert("Stopped", "Automatic SMS listener is paused.");
    } else {
      const res = await startSmsListener((txn) => {
        Alert.alert(
          "⚡ Auto-Detected Transaction!",
          `New SMS parsed:\n${formatCurrency(txn.amount)} at ${txn.merchant} [${txn.category}]`,
        );
      });
      await refreshStatus();
      Alert.alert(res.success ? "Active" : "Notice", res.message);
    }
    setIsStarting(false);
  }

  async function handleSimulateSms() {
    // Pick a random realistic bank SMS from our test pool
    const randomMsg =
      sampleSimulatedSms[
        Math.floor(Math.random() * sampleSimulatedSms.length)
      ];

    const result = await simulateIncomingSms(randomMsg);

    if (result.processed && result.transaction) {
      Alert.alert(
        "🎉 Auto-Detection Succeeded!",
        `SMS text:\n"${randomMsg}"\n\nResult:\n• Amount: ${formatCurrency(result.transaction.amount)}\n• Merchant: ${result.transaction.merchant}\n• Predicted Category: ${result.transaction.category}\n• Saved to SQLite!`,
      );
    } else {
      Alert.alert(
        "Simulation Result",
        result.reason || "Could not process simulated SMS.",
      );
    }
  }

  function handleClearTransactions() {
    Alert.alert(
      "Clear all transactions?",
      "This will remove all stored transactions from the app. You can start fresh with an empty dashboard.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: () => {
            clearTransactions();
            Alert.alert("Cleared", "All transactions have been deleted.");
          },
        },
      ],
    );
  }

  function handleRestoreMockData() {
    resetToMockData();
    Alert.alert("Restored", "Demo mock transactions have been loaded.");
  }

  return (
    <ScreenContainer>
      <Text style={styles.kicker}>AUTOMATION & PREFERENCES</Text>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage background SMS intake, local database, and AI classification.
      </Text>

      {/* ── Background SMS Listener ────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Automatic SMS Intake</Text>
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              listenerStatus.isListening ? styles.activeDot : styles.pendingDot,
            ]}
          />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>
              {listenerStatus.isListening
                ? "Automatic SMS Listener Active"
                : "Automatic SMS Reading Ready"}
            </Text>
            <Text style={styles.statusDetail}>
              {listenerStatus.mode === "expo-go"
                ? "Running in Expo Go. The pipeline (filter → regex → 4-tier ML → SQLite) is live. Build standalone APK for hardware broadcast reception."
                : listenerStatus.permissionGranted
                  ? "Android SMS permissions granted. Real-time broadcast receiver listening."
                  : "Android permissions required to listen to incoming bank SMS."}
            </Text>
          </View>
          <Text
            style={[
              styles.statusTag,
              listenerStatus.isListening && styles.activeTag,
            ]}
          >
            {listenerStatus.isListening ? "ACTIVE" : "STANDBY"}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <AppButton
            variant={listenerStatus.isListening ? "secondary" : "primary"}
            onPress={handleToggleListener}
          >
            {isStarting
              ? "Checking..."
              : listenerStatus.isListening
                ? "Pause SMS listener"
                : "Enable SMS listener"}
          </AppButton>

          <View style={{ marginTop: theme.spacing.sm }}>
            <AppButton variant="secondary" onPress={handleSimulateSms}>
              🧪 Test auto-detect pipeline
            </AppButton>
          </View>
        </View>
      </View>

      {/* ── Data Management ────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Data Management</Text>
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              transactions.length > 0 ? styles.activeDot : styles.pendingDot,
            ]}
          />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>
              {transactions.length} stored transaction
              {transactions.length === 1 ? "" : "s"}
            </Text>
            <Text style={styles.statusDetail}>
              {transactions.length > 0
                ? "Saved persistently in SQLite database (expenses.db)."
                : "SQLite database is empty and ready for incoming expenses."}
            </Text>
          </View>
          <Text style={styles.statusTag}>
            {transactions.length > 0 ? "SQLITE" : "EMPTY"}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {transactions.length > 0 ? (
            <AppButton variant="secondary" onPress={handleClearTransactions}>
              Clear all transactions
            </AppButton>
          ) : (
            <AppButton variant="secondary" onPress={handleRestoreMockData}>
              Load demo transactions
            </AppButton>
          )}
        </View>
      </View>

      {/* ── Architecture Pipeline ──────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Pipeline Architecture</Text>
      <View style={styles.roadmap}>
        <Text style={styles.roadmapItem}>
          ✓ Step 1: Detect financial transaction vs OTP/spam
        </Text>
        <Text style={styles.roadmapItem}>
          ✓ Step 2: Extract ₹ amount, merchant, date & payment mode
        </Text>
        <Text style={styles.roadmapItem}>
          ✓ Step 3: 4-tier classification (Overrides → 172+ Merchants → ML API → Fallback)
        </Text>
        <Text style={styles.roadmapItem}>
          ✓ Step 4: De-duplicate and save directly to SQLite
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>
          Automated Expense Tracker · APK Ready · Offline Hybrid ML
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: theme.colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  activeDot: { backgroundColor: theme.colors.success },
  pendingDot: { backgroundColor: theme.colors.warning },
  statusCopy: { flex: 1 },
  statusTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  statusDetail: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  statusTag: {
    color: theme.colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  activeTag: {
    color: theme.colors.success,
  },
  actionButtons: {
    marginTop: theme.spacing.md,
  },
  roadmap: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  roadmapItem: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  footer: { marginTop: theme.spacing.xxl, gap: theme.spacing.md },
  version: { color: theme.colors.mutedText, fontSize: 12, textAlign: "center" },
});
