import { useMemo } from "react";

import { useExpenseStore } from "@/services/store/expenseStore";
import type { ExpenseTransaction, TransactionType } from "@/types/transaction";

export function useExpenses() {
  const transactions = useExpenseStore((state) => state.transactions);

  const totals = useMemo(() => {
    return transactions.reduce(
      (summary, transaction) => {
        if (transaction.transactionType === "CREDIT") {
          summary.credits += transaction.amount;
        } else {
          summary.debits += transaction.amount;
        }
        return summary;
      },
      { debits: 0, credits: 0 },
    );
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    transactions.forEach((transaction) => {
      if (transaction.transactionType === "DEBIT") {
        totalsByCategory.set(
          transaction.category,
          (totalsByCategory.get(transaction.category) ?? 0) +
            transaction.amount,
        );
      }
    });
    return [...totalsByCategory.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((first, second) => second.amount - first.amount);
  }, [transactions]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  );

  function filterTransactions(
    filter: TransactionType | "ALL",
  ): ExpenseTransaction[] {
    if (filter === "ALL") return transactions;
    return transactions.filter(
      (transaction) => transaction.transactionType === filter,
    );
  }

  return {
    transactions,
    totalSpent: totals.debits,
    totalCredits: totals.credits,
    categoryTotals,
    recentTransactions,
    filterTransactions,
  };
}
