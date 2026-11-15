import { create } from "zustand";

import { mockTransactions } from "@/data/mockTransactions";
import {
  dbClearAllTransactions,
  dbDeleteTransaction,
  dbGetAllPersonalMerchants,
  dbGetAllTransactions,
  dbRememberPersonalMerchant,
  dbSaveTransaction,
  dbSaveTransactions,
  dbUpdateTransactionCategory,
  initDatabase,
} from "@/services/db/database";
import type {
  ExpenseTransaction,
  TransactionCategory,
} from "@/types/transaction";

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface ExpenseState {
  /** All stored transactions, newest first. */
  transactions: ExpenseTransaction[];

  /** User's personal merchant-to-category override dictionary. */
  personalMerchantMap: Record<string, TransactionCategory>;

  /** Whether the database has been initialized. */
  isInitialized: boolean;

  // ── Actions ──────────────────────────────────────────────────────────

  /** Initializes the SQLite database and loads stored records. */
  initStore: () => void;

  /** Add a new transaction (saved both in memory and SQLite). */
  addTransaction: (transaction: ExpenseTransaction) => void;

  /** Add multiple transactions at once. */
  addTransactions: (transactions: ExpenseTransaction[]) => void;

  /** Remember a user's personal category preference for a merchant name. */
  rememberMerchantCategory: (
    merchant: string,
    category: TransactionCategory,
  ) => void;

  /** Remove a transaction by ID. */
  removeTransaction: (id: string) => void;

  /** Update a transaction in memory. */
  updateTransaction: (
    id: string,
    updates: Partial<
      Pick<ExpenseTransaction, "category" | "merchant" | "isUserCorrected">
    >,
  ) => void;

  /** Replace the category for a transaction, marking it corrected in SQLite. */
  correctCategory: (id: string, category: TransactionCategory) => void;

  /** Clear all stored transactions from SQLite. */
  clearTransactions: () => void;

  /** Reset transactions back to the default demo mock dataset in SQLite. */
  resetToMockData: () => void;
}

// ---------------------------------------------------------------------------
// Store implementation (SQLite-backed)
// ---------------------------------------------------------------------------

export const useExpenseStore = create<ExpenseState>((set) => {
  return {
    transactions: [],
    personalMerchantMap: {},
    isInitialized: false,

    initStore: () => {
      try {
        const ok = initDatabase();
        if (ok) {
          const txs = dbGetAllTransactions();
          const merchants = dbGetAllPersonalMerchants();
          set({
            transactions: txs,
            personalMerchantMap: merchants,
            isInitialized: true,
          });
        } else {
          // Fallback to in-memory mock transactions if SQLite not supported in current environment
          set({
            transactions: mockTransactions,
            personalMerchantMap: {},
            isInitialized: true,
          });
        }
      } catch (err) {
        console.warn("initStore fallback:", err);
        set({
          transactions: mockTransactions,
          personalMerchantMap: {},
          isInitialized: true,
        });
      }
    },

    addTransaction: (transaction) => {
      // 1. Persist to SQLite
      dbSaveTransaction(transaction);

      // 2. If corrected, persist to personal overrides
      if (transaction.isUserCorrected && transaction.merchant) {
        dbRememberPersonalMerchant(transaction.merchant, transaction.category);
      }

      // 3. Update reactive state
      set((state) => {
        const nextPersonalMap = { ...state.personalMerchantMap };
        if (transaction.isUserCorrected && transaction.merchant) {
          nextPersonalMap[transaction.merchant.toUpperCase().trim()] =
            transaction.category;
        }
        return {
          transactions: [transaction, ...state.transactions],
          personalMerchantMap: nextPersonalMap,
        };
      });
    },

    rememberMerchantCategory: (merchant, category) => {
      if (!merchant) return;
      const key = merchant.toUpperCase().trim();
      // 1. Persist to SQLite
      dbRememberPersonalMerchant(merchant, category);

      // 2. Update reactive state
      set((state) => ({
        personalMerchantMap: {
          ...state.personalMerchantMap,
          [key]: category,
        },
      }));
    },

    addTransactions: (newTransactions) => {
      dbSaveTransactions(newTransactions);
      set((state) => ({
        transactions: [...newTransactions, ...state.transactions],
      }));
    },

    removeTransaction: (id) => {
      dbDeleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    },

    updateTransaction: (id, updates) => {
      set((state) => ({
        transactions: state.transactions.map((t) => {
          if (t.id === id) {
            const updated = { ...t, ...updates };
            dbSaveTransaction(updated);
            return updated;
          }
          return t;
        }),
      }));
    },

    correctCategory: (id, category) => {
      dbUpdateTransactionCategory(id, category);
      set((state) => {
        let updatedMerchant = "";
        const nextTransactions = state.transactions.map((t) => {
          if (t.id === id) {
            updatedMerchant = t.merchant;
            return { ...t, category, isUserCorrected: true };
          }
          return t;
        });

        const nextPersonalMap = { ...state.personalMerchantMap };
        if (updatedMerchant) {
          dbRememberPersonalMerchant(updatedMerchant, category);
          nextPersonalMap[updatedMerchant.toUpperCase().trim()] = category;
        }

        return {
          transactions: nextTransactions,
          personalMerchantMap: nextPersonalMap,
        };
      });
    },

    clearTransactions: () => {
      dbClearAllTransactions();
      set({
        transactions: [],
      });
    },

    resetToMockData: () => {
      dbClearAllTransactions();
      dbSaveTransactions(mockTransactions);
      set({
        transactions: mockTransactions,
      });
    },
  };
});
