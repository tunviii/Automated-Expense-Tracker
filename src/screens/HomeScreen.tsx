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
import { categories, categoryByLabel } from "@/constants/categories";
import { theme } from "@/constants/theme";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseStore } from "@/services/store/expenseStore";
import { parseTransaction } from "@/services/sms/smsParser";
import { isFinancialTransaction } from "@/services/sms/transactionDetector";
import {
  classifyExpense,
  type ClassificationResult,
} from "@/services/ml/expenseClassifier";
import { convertParsedToExpense } from "@/utils/transactionConverter";
import type { TransactionCategory } from "@/types/transaction";

const sampleMessage =
  "Your A/C is debited for Rs 680.00 on 08-Mar-26; ALEXS KITCHEN credited. UPI: demo@upi";

type HomeScreenProps = {
  onNavigate?: (
    screen: "home" | "transactions" | "analytics" | "settings",
  ) => void;
};

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
  const [parserVisible, setParserVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [parsed, setParsed] = useState<ReturnType<
    typeof parseTransaction
  > | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>("Others");
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionWarning, setDetectionWarning] = useState<string | null>(null);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Dynamic date string
  const today = new Date();
  const dateString = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();

  async function runParser(value: string) {
    setMessage(value);
    setDetectionWarning(null);

    const check = isFinancialTransaction(value);
    if (!check.isTransaction) {
      if (check.reason === "OTP") {
        setDetectionWarning("⚠️ Detected an OTP/Security code, not an expense transaction.");
      } else if (check.reason === "PROMO") {
        setDetectionWarning("ℹ️ Detected a promotional or loan offer message.");
      }
    }

    const parsedResult = parseTransaction(value);
    setParsed(parsedResult);

    setIsProcessing(true);
    try {
      const classResult = await classifyExpense(
        value,
        parsedResult.merchant,
        parsedResult.amount,
      );
      setClassification(classResult);
      if (classResult) {
        setSelectedCategory(classResult.category);
      }
    } catch {
      setClassification(null);
    } finally {
      setIsProcessing(false);
    }
  }

  function saveTransaction() {
    if (!parsed) return;
    const expense = convertParsedToExpense(parsed, {
      category: selectedCategory,
      confidence: classification?.confidence,
    });
    if (!expense) {
      Alert.alert("Cannot save", "No amount was detected in the message.");
      return;
    }

    // Use normalized merchant if recognized
    if (classification?.normalizedMerchant) {
      expense.merchant = classification.normalizedMerchant;
    }

    // Save category preference permanently to personal dictionary
    if (expense.merchant) {
      rememberMerchantCategory(expense.merchant, selectedCategory);
    }

    addTransaction(expense);
    Alert.alert(
      "Saved!",
      `₹${expense.amount.toLocaleString("en-IN")} at ${expense.merchant} added under [${expense.category}].`,
    );
    setMessage("");
    setParsed(null);
    setClassification(null);
    setSelectedCategory("Others");
    setDetectionWarning(null);
    setParserVisible(false);
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
            icon="⌁"
            label="Try SMS parser"
            onPress={() => setParserVisible(true)}
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
        visible={parserVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setParserVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Try the SMS parser</Text>
                <Text style={styles.modalCaption}>
                  Paste text manually. No messages are read automatically.
                </Text>
              </View>
              <Pressable
                onPress={() => setParserVisible(false)}
                accessibilityLabel="Close parser"
              >
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            <TextInput
              value={message}
              onChangeText={(value) => {
                setMessage(value);
                setParsed(null);
              }}
              placeholder="Paste a bank message"
              placeholderTextColor={theme.colors.mutedText}
              multiline
              style={styles.input}
              accessibilityLabel="SMS message input"
            />
            <AppButton
              variant="secondary"
              onPress={() => runParser(sampleMessage)}
            >
              Use sample message
            </AppButton>
            <View style={styles.parseButton}>
              <AppButton onPress={() => runParser(message)}>
                Parse text
              </AppButton>
            </View>
            {parsed && (
              <View style={styles.result}>
                <Text style={styles.resultTitle}>Parsed fields</Text>
                <Text style={styles.resultRow}>
                  Amount{" "}
                  <Text style={styles.resultValue}>
                    {parsed.amount === null
                      ? "Not found"
                      : `₹${parsed.amount.toLocaleString("en-IN")}`}
                  </Text>
                </Text>
                <Text style={styles.resultRow}>
                  Merchant{" "}
                  <Text style={styles.resultValue}>
                    {parsed.merchant ?? "Not found"}
                  </Text>
                </Text>
                <Text style={styles.resultRow}>
                  Date{" "}
                  <Text style={styles.resultValue}>
                    {parsed.date ?? "Not found"}
                  </Text>
                </Text>
                <Text style={styles.resultRow}>
                  Type{" "}
                  <Text style={styles.resultValue}>
                    {parsed.transactionType}
                  </Text>
                </Text>
                <Text style={styles.resultRow}>
                  Method{" "}
                  <Text style={styles.resultValue}>{parsed.paymentMethod}</Text>
                </Text>
                <Text style={styles.resultRow}>
                  Category{" "}
                  <Text style={[styles.resultValue, styles.categoryBadge]}>
                    {categoryByLabel[selectedCategory]?.icon} {selectedCategory}
                    {classification && ` (${
                      classification.source === "PERSONAL_OVERRIDE"
                        ? "⭐ Your Preference"
                        : classification.source === "MERCHANT_REGISTRY"
                        ? "Known Merchant"
                        : classification.source === "ML_API"
                        ? `ML: ${Math.round(classification.confidence * 100)}%`
                        : "Heuristic"
                    })`}
                  </Text>
                </Text>
                {isProcessing && (
                  <Text style={styles.resultRow}>⏳ Classifying with ML...</Text>
                )}
                <View style={styles.categoryPickerContainer}>
                  <Text style={styles.categoryPickerLabel}>Change category:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryChipScroll}
                  >
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat.label;
                      return (
                        <Pressable
                          key={cat.id}
                          onPress={() => setSelectedCategory(cat.label)}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              isSelected && styles.categoryChipTextSelected,
                            ]}
                          >
                            {cat.icon} {cat.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}
            {detectionWarning && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{detectionWarning}</Text>
              </View>
            )}
            {parsed && parsed.amount !== null && (
              <View style={styles.saveButton}>
                <AppButton onPress={saveTransaction}>
                  Save transaction
                </AppButton>
              </View>
            )}
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
    padding: theme.spacing.xl,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  modalTitle: { color: theme.colors.text, fontSize: 22, fontWeight: "800" },
  modalCaption: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: theme.spacing.xs,
    maxWidth: 280,
  },
  close: { color: theme.colors.mutedText, fontSize: 30, lineHeight: 30 },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.md,
    textAlignVertical: "top",
    marginBottom: theme.spacing.md,
  },
  parseButton: { marginTop: theme.spacing.sm },
  saveButton: { marginTop: theme.spacing.md },
  result: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  resultTitle: {
    color: theme.colors.primary,
    fontWeight: "800",
    marginBottom: theme.spacing.xs,
  },
  resultRow: { color: theme.colors.mutedText, fontSize: 14 },
  resultValue: { color: theme.colors.text, fontWeight: "700" },
  categoryBadge: { color: theme.colors.primary },
  warningBox: {
    backgroundColor: "#FFF4E5",
    borderColor: "#FFE2B8",
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  warningText: {
    color: "#B25E00",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryPickerContainer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(36,75,60,0.12)",
  },
  categoryPickerLabel: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  categoryChipScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "600",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
});
