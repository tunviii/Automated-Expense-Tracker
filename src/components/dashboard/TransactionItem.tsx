import { StyleSheet, Text, View } from "react-native";

import { categoryByLabel } from "@/constants/categories";
import { theme } from "@/constants/theme";
import type { ExpenseTransaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/currency";
import { formatDemoDate } from "@/utils/date";

export function TransactionItem({
  transaction,
}: {
  transaction: ExpenseTransaction;
}) {
  const isCredit = transaction.transactionType === "CREDIT";
  const category = categoryByLabel[transaction.category];
  return (
    <View
      style={styles.row}
      accessibilityLabel={`${transaction.merchant}, ${formatCurrency(transaction.amount)}`}
    >
      <View style={styles.icon}>
        <Text>{category.icon}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={styles.meta}>
          {transaction.category} · {formatDemoDate(transaction.date)}
        </Text>
        <Text style={styles.meta}>
          {transaction.paymentMethod.replace("_", " ")}
        </Text>
      </View>
      <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
        {isCredit ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  details: { flex: 1, minWidth: 0 },
  merchant: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: theme.colors.mutedText, fontSize: 12, marginTop: 3 },
  amount: { fontSize: 14, fontWeight: "800" },
  debit: { color: theme.colors.text },
  credit: { color: theme.colors.success },
});
