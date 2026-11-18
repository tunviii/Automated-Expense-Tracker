import { Pressable, StyleSheet, Text, View } from "react-native";

import { categoryByLabel } from "@/constants/categories";
import { theme } from "@/constants/theme";
import type { ExpenseTransaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/currency";
import { formatDemoDate } from "@/utils/date";

export function TransactionItem({
  transaction,
  onCategoryPress,
}: {
  transaction: ExpenseTransaction;
  onCategoryPress?: () => void;
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
        {onCategoryPress ? (
          <Pressable
            onPress={onCategoryPress}
            accessibilityRole="button"
            accessibilityLabel={`Change category for ${transaction.merchant}, currently ${transaction.category}`}
            hitSlop={6}
          >
            <Text style={[styles.meta, styles.editableCategory]}>
              {transaction.category} · Change · {formatDemoDate(transaction.date)}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.meta}>
            {transaction.category} · {formatDemoDate(transaction.date)}
          </Text>
        )}
        <Text style={styles.meta}>
          {transaction.paymentMethod.replace("_", " ")}
        </Text>
        {transaction.accountLast4 && (
          <Text style={styles.account}>
            Account ending {transaction.accountLast4}
          </Text>
        )}
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
  editableCategory: { color: theme.colors.primary, fontWeight: "700" },
  account: {
    color: theme.colors.mutedText,
    fontSize: 11,
    marginTop: 3,
    fontWeight: "700",
  },
  merchant: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  meta: { color: theme.colors.mutedText, fontSize: 12, marginTop: 3 },
  amount: { fontSize: 14, fontWeight: "800" },
  debit: { color: theme.colors.text },
  credit: { color: theme.colors.success },
});
