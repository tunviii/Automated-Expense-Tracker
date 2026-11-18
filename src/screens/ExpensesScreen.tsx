import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { EmptyTransactions } from "@/components/expenses/EmptyTransactions";
import { categories } from "@/constants/categories";
import { theme } from "@/constants/theme";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseStore } from "@/services/store/expenseStore";
import type { ExpenseTransaction, TransactionType } from "@/types/transaction";

const filters: { label: string; value: TransactionType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Debits", value: "DEBIT" },
  { label: "Credits", value: "CREDIT" },
];

export default function ExpensesScreen() {
  const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [editingTransaction, setEditingTransaction] =
    useState<ExpenseTransaction | null>(null);
  const { filterTransactions } = useExpenses();
  const correctCategory = useExpenseStore((state) => state.correctCategory);
  const allTransactions = useExpenseStore((state) => state.transactions);
  const accounts = Array.from(
    new Set(allTransactions.map((transaction) => transaction.accountLast4 ?? "UNKNOWN")),
  );
  const transactions = filterTransactions(filter).filter(
    (transaction) =>
      accountFilter === "ALL" ||
      (transaction.accountLast4 ?? "UNKNOWN") === accountFilter,
  );
  return (
    <>
      <ScreenContainer>
      <Text style={styles.kicker}>LEDGER</Text>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.subtitle}>
        Your tracked financial transactions.
      </Text>
        <Text style={styles.filterLabel}>Account</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {["ALL", ...accounts].map((account) => {
            const selected = accountFilter === account;
            const label =
              account === "ALL"
                ? "All accounts"
                : account === "UNKNOWN"
                  ? "Account not detected"
                  : `•• ${account}`;
            return (
              <Pressable
                key={account}
                onPress={() => setAccountFilter(account)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.filter, selected && styles.activeFilter]}
              >
                <Text style={[styles.filterText, selected && styles.activeFilterText]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={styles.filterLabel}>Transaction type</Text>
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
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onCategoryPress={() => setEditingTransaction(transaction)}
          />
        ))
      )}
      </ScreenContainer>
      <Modal
      visible={editingTransaction !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setEditingTransaction(null)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeading}>
              <Text style={styles.modalTitle}>Correct category</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {editingTransaction?.merchant}
              </Text>
            </View>
            <Pressable
              onPress={() => setEditingTransaction(null)}
              accessibilityRole="button"
              accessibilityLabel="Close category picker"
            >
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.helper}>
            Your correction is saved and used for future transactions from this merchant.
          </Text>
          <ScrollView style={styles.categoryList}>
            {categories.map((category) => {
              const selected = editingTransaction?.category === category.label;
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    if (editingTransaction) {
                      correctCategory(editingTransaction.id, category.label);
                    }
                    setEditingTransaction(null);
                  }}
                  style={[styles.categoryOption, selected && styles.categoryOptionSelected]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  {selected && <Text style={styles.selectedMark}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
      </Modal>
    </>
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
  filterLabel: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    maxHeight: "78%",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalHeading: { flex: 1, marginRight: theme.spacing.md },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "800" },
  modalSubtitle: { color: theme.colors.mutedText, fontSize: 13, marginTop: 3 },
  close: { color: theme.colors.mutedText, fontSize: 28, paddingHorizontal: 4 },
  helper: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  categoryList: { marginTop: theme.spacing.xs },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  categoryOptionSelected: { backgroundColor: theme.colors.primaryLight },
  categoryIcon: { width: 28, fontSize: 18 },
  categoryLabel: { flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: "600" },
  selectedMark: { color: theme.colors.primary, fontWeight: "800", fontSize: 18 },
});
