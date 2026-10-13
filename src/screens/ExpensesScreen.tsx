import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { EmptyTransactions } from "@/components/expenses/EmptyTransactions";
import { theme } from "@/constants/theme";
import { useExpenses } from "@/hooks/useExpenses";
import type { TransactionType } from "@/types/transaction";

const filters: { label: string; value: TransactionType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Debits", value: "DEBIT" },
  { label: "Credits", value: "CREDIT" },
];

export default function ExpensesScreen() {
  const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
  const { filterTransactions } = useExpenses();
  const transactions = filterTransactions(filter);
  return (
    <ScreenContainer>
      <Text style={styles.kicker}>LEDGER</Text>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.subtitle}>
        Your local, fictional transaction history.
      </Text>
      <View style={styles.filters}>
        {filters.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setFilter(option.value)}
            accessibilityRole="button"
            style={[
              styles.filter,
              filter === option.value && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === option.value && styles.activeFilterText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionHeader title={`${transactions.length} entries`} />
      {transactions.length === 0 ? (
        <EmptyTransactions />
      ) : (
        transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))
      )}
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
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  filters: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  filter: {
    paddingHorizontal: theme.spacing.lg,
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.mutedText,
    fontWeight: "700",
    fontSize: 13,
  },
  activeFilterText: { color: theme.colors.surface },
});
