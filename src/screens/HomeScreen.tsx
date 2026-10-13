import { useState } from "react";
import {
    Modal,
    Pressable,
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
import { theme } from "@/constants/theme";
import { useExpenses } from "@/hooks/useExpenses";
import { parseTransaction } from "@/services/sms/smsParser";

const sampleMessage =
  "Your A/C is debited for Rs 680.00 on 08-Mar-26; ALEXS KITCHEN credited. UPI: demo@upi";

type HomeScreenProps = {
  onNavigate?: (screen: "home" | "transactions" | "settings") => void;
};

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const {
    totalSpent,
    totalCredits,
    transactions,
    categoryTotals,
    recentTransactions,
  } = useExpenses();
  const [parserVisible, setParserVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [parsed, setParsed] = useState<ReturnType<
    typeof parseTransaction
  > | null>(null);

  function runParser(value: string) {
    setMessage(value);
    setParsed(parseTransaction(value));
  }

  return (
    <>
      <ScreenContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>SUNDAY, 22 MARCH</Text>
            <Text style={styles.title}>Good morning</Text>
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
        <SectionHeader title="Spending by category" />
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
});
