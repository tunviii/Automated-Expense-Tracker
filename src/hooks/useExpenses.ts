import { useMemo } from "react";

import { mockTransactions } from "@/data/mockTransactions";
import type { ExpenseTransaction, TransactionType } from "@/types/transaction";

export function useExpenses() {
  const totals = useMemo(() => {
    return mockTransactions.reduce(
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
  }, []);

  const categoryTotals = useMemo(() => {
    const totalsByCategory = new Map<string, number>();
    mockTransactions.forEach((transaction) => {
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
  }, []);

  const recentTransactions = useMemo(() => mockTransactions.slice(0, 5), []);

  function filterTransactions(
    filter: TransactionType | "ALL",
  ): ExpenseTransaction[] {
    if (filter === "ALL") return mockTransactions;
    return mockTransactions.filter(
      (transaction) => transaction.transactionType === filter,
    );
  }

  return {
    transactions: mockTransactions,
    totalSpent: totals.debits,
    totalCredits: totals.credits,
    categoryTotals,
    recentTransactions,
    filterTransactions,
  };
}
