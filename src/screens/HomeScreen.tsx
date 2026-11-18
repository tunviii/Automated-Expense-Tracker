import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { BalanceSummary } from "@/components/dashboard/BalanceSummary";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { categories } from "@/constants/categories";
import { theme } from "@/constants/theme";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseStore } from "@/services/store/expenseStore";
import type {
  ExpenseTransaction,
  PaymentMethod,
  TransactionCategory,
} from "@/types/transaction";

const transactionTypes = ["DEBIT", "CREDIT"] as const;
const paymentMethods: Exclude<PaymentMethod, "UNKNOWN">[] = [
  "UPI",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "CARD",
  "BANK_TRANSFER",
  "CASH",
];

type HomeScreenProps = {
  onNavigate?: (
    screen: "home" | "transactions" | "analytics" | "settings",
  ) => void;
};

function localDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const {
    totalSpent,
    totalCredits,
    transactions,
    categoryTotals,
    recentTransactions,
  } = useExpenses();
  const addTransaction = useExpenseStore((state) => state.addTransaction);
  const rememberMerchantCategory = useExpenseStore(
    (state) => state.rememberMerchantCategory,
  );

  const [entryVisible, setEntryVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(localDateString);
  const [accountLast4, setAccountLast4] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Others");
  const [transactionType, setTransactionType] =
    useState<ExpenseTransaction["transactionType"]>("DEBIT");
  const [paymentMethod, setPaymentMethod] =
    useState<Exclude<PaymentMethod, "UNKNOWN">>("UPI");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateString = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();

  function resetEntry() {
    setAmount("");
    setMerchant("");
    setDate(localDateString());
    setAccountLast4("");
    setCategory("Others");
    setTransactionType("DEBIT");
    setPaymentMethod("UPI");
  }

  function saveManualTransaction() {
    const numericAmount = Number(amount.replace(/,/g, "").trim());
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Check amount", "Enter an amount greater than zero.");
      return;
    }
    if (!merchant.trim()) {
      Alert.alert("Add a merchant", "Enter the merchant or transaction description.");
      return;
    }
    if (!isValidDate(date)) {
      Alert.alert("Check date", "Enter the date in YYYY-MM-DD format.");
      return;
    }
    if (accountLast4 && !/^\d{4}$/.test(accountLast4)) {
      Alert.alert("Check account", "Enter exactly the last four account digits, or leave it blank.");
      return;
    }

    const transaction: ExpenseTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amount: numericAmount,
      merchant: merchant.trim(),
      accountLast4: accountLast4 || null,
      category,
      date,
      transactionType,
      paymentMethod,
      isUserCorrected: false,
    };

    addTransaction(transaction);
    rememberMerchantCategory(transaction.merchant, category);
    setEntryVisible(false);
    resetEntry();
    Alert.alert("Saved", "The transaction was added to your ledger.");
  }

  return (
    <>
      <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>{dateString}</Text>
            <Text style={styles.title}>{greeting}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AT</Text>
          </View>
        </View>
        <Text style={styles.intro}>
          A calm view of where your money went this month.
        </Text>
        <BalanceSummary
          totalSpent={totalSpent}
          totalCredits={totalCredits}
          transactionCount={transactions.length}
        />
        <SectionHeader title="Quick actions" />
        <View style={styles.actions}>
          <QuickAction
            icon="↗"
            label="View transactions"
            onPress={() => onNavigate?.("transactions")}
          />
          <QuickAction
            icon="＋"
            label="Add transaction"
            onPress={() => setEntryVisible(true)}
          />
          <QuickAction
            icon="◌"
            label="View settings"
            onPress={() => onNavigate?.("settings")}
          />
        </View>
        <SectionHeader
          title="Spending by category"
          actionLabel="Insights"
          onAction={() => onNavigate?.("analytics")}
        />
        <CategoryBreakdown items={categoryTotals} />
        <View style={styles.section}>
          <SectionHeader
            title="Recent transactions"
            actionLabel="See all"
            onAction={() => onNavigate?.("transactions")}
          />
          {recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </ScreenContainer>

      <Modal
        visible={entryVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEntryVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>Add transaction</Text>
                <Text style={styles.modalCaption}>
                  Enter the details to add a missed transaction to your ledger.
                </Text>
              </View>
              <Pressable
                onPress={() => setEntryVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close add transaction form"
              >
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Amount *</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme.colors.mutedText}
                keyboardType="decimal-pad"
                style={styles.input}
                accessibilityLabel="Transaction amount"
              />

              <Text style={styles.fieldLabel}>Merchant or description *</Text>
              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                placeholder="e.g. Grocery store"
                placeholderTextColor={theme.colors.mutedText}
                style={styles.input}
                accessibilityLabel="Merchant or transaction description"
              />

              <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-11-17"
                placeholderTextColor={theme.colors.mutedText}
                style={styles.input}
                accessibilityLabel="Transaction date"
              />

              <Text style={styles.fieldLabel}>Account last four digits (optional)</Text>
              <TextInput
                value={accountLast4}
                onChangeText={(value) =>
                  setAccountLast4(value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="e.g. 4019"
                placeholderTextColor={theme.colors.mutedText}
                keyboardType="number-pad"
                maxLength={4}
                style={styles.input}
                accessibilityLabel="Last four digits of account"
              />

              <Text style={styles.fieldLabel}>Transaction type</Text>
              <View style={styles.choiceRow}>
                {transactionTypes.map((type) => {
                  const selected = transactionType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setTransactionType(type)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[styles.choice, selected && styles.choiceSelected]}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          selected && styles.choiceTextSelected,
                        ]}
                      >
                        {type === "DEBIT" ? "Expense (debit)" : "Income (credit)"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.choiceWrap}>
                {categories.map((item) => {
                  const selected = category === item.label;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setCategory(item.label)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[styles.choice, selected && styles.choiceSelected]}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          selected && styles.choiceTextSelected,
                        ]}
                      >
                        {item.icon} {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Payment method</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.paymentMethods}
              >
                {paymentMethods.map((method) => {
                  const selected = paymentMethod === method;
                  return (
                    <Pressable
                      key={method}
                      onPress={() => setPaymentMethod(method)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[styles.choice, selected && styles.choiceSelected]}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          selected && styles.choiceTextSelected,
                        ]}
                      >
                        {method.replace(/_/g, " ")}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.saveButton}>
                <AppButton onPress={saveManualTransaction}>
                  Save transaction
                </AppButton>
              </View>
              <View style={styles.cancelButton}>
                <AppButton
                  variant="secondary"
                  onPress={() => setEntryVisible(false)}
                >
                  Cancel
                </AppButton>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  intro: {
    color: theme.colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: theme.colors.primary, fontWeight: "800" },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  section: { marginTop: theme.spacing.xl },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23,35,29,0.35)",
  },
  modalCard: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  modalHeading: { flex: 1 },
  modalTitle: { color: theme.colors.text, fontSize: 22, fontWeight: "800" },
  modalCaption: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: theme.spacing.xs,
  },
  close: { color: theme.colors.mutedText, fontSize: 30, lineHeight: 30 },
  formScroll: { flexShrink: 1 },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  choiceRow: { flexDirection: "row", gap: theme.spacing.sm },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
  paymentMethods: { gap: theme.spacing.sm, paddingVertical: 2 },
  choice: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  choiceSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  choiceText: { color: theme.colors.text, fontSize: 12, fontWeight: "600" },
  choiceTextSelected: { color: theme.colors.surface },
  saveButton: { marginTop: theme.spacing.lg },
  cancelButton: { marginTop: theme.spacing.sm },
});
