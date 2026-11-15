import type {
  ExpenseTransaction,
  ParsedTransaction,
  TransactionCategory,
} from "@/types/transaction";

/**
 * Convert a ParsedTransaction (from the SMS parser) into an ExpenseTransaction
 * suitable for storage. Fills in defaults for null/UNKNOWN fields and generates
 * a unique ID.
 *
 * Category defaults to "Others" — the ML classifier will override this later.
 */
export function convertParsedToExpense(
  parsed: ParsedTransaction,
  overrides?: {
    category?: TransactionCategory;
    confidence?: number;
  },
): ExpenseTransaction | null {
  // An amount is mandatory — we can't store a transaction without one.
  if (parsed.amount === null) {
    return null;
  }

  const now = new Date();

  return {
    id: generateId(),
    amount: parsed.amount,
    merchant: parsed.merchant ?? "Unknown Merchant",
    category: overrides?.category ?? "Others",
    date: parsed.date ?? now.toISOString().slice(0, 10), // YYYY-MM-DD
    transactionType:
      parsed.transactionType === "UNKNOWN" ? "DEBIT" : parsed.transactionType,
    paymentMethod:
      parsed.paymentMethod === "UNKNOWN" ? "UPI" : parsed.paymentMethod,
    confidence: overrides?.confidence,
    isUserCorrected: false,
  };
}

/**
 * Generate a sortable unique ID: timestamp + random suffix.
 * Example: "txn-1731689713421-a7f3"
 */
function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 6);
  return `txn-${timestamp}-${random}`;
}
