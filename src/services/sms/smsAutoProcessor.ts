import { classifyExpense } from "@/services/ml/expenseClassifier";
import { parseTransaction } from "@/services/sms/smsParser";
import { isFinancialTransaction } from "@/services/sms/transactionDetector";
import { useExpenseStore } from "@/services/store/expenseStore";
import type { ExpenseTransaction } from "@/types/transaction";
import { convertParsedToExpense } from "@/utils/transactionConverter";

export type SmsProcessResult = {
  processed: boolean;
  isFinancial: boolean;
  transaction?: ExpenseTransaction;
  reason?: string;
};

/**
 * Automatically processes a raw SMS text through the complete pipeline:
 * 1. Financial Transaction Detection (filters OTPs, telecom promo, marketing)
 * 2. Regex Extraction (amount, merchant, date, payment method, debit/credit)
 * 3. 4-Tier ML & Personal Override Classification
 * 4. Duplicate Detection (prevents double-counting duplicate SMS alerts)
 * 5. Persistence into SQLite & Zustand state
 */
export async function processIncomingSms(
  smsBody: string,
  senderAddress?: string,
): Promise<SmsProcessResult> {
  if (!smsBody || !smsBody.trim()) {
    return {
      processed: false,
      isFinancial: false,
      reason: "Empty SMS message body",
    };
  }

  // 1. Check if financial
  const isFin = isFinancialTransaction(smsBody);
  if (!isFin) {
    return {
      processed: false,
      isFinancial: false,
      reason: "Message is non-financial (OTP, promo, or alert)",
    };
  }

  // 2. Parse transaction fields
  const parsed = parseTransaction(smsBody);
  if (!parsed || parsed.amount === null) {
    return {
      processed: false,
      isFinancial: true,
      reason: "Could not extract valid monetary amount from SMS",
    };
  }

  // 3. Classify category using 4-tier hybrid pipeline
  const classification = await classifyExpense(
    smsBody,
    parsed.merchant,
    parsed.amount,
  );

  // 4. Convert to ExpenseTransaction
  const expense = convertParsedToExpense(parsed, {
    category: classification.category,
    confidence: classification.confidence,
  });

  if (!expense) {
    return {
      processed: false,
      isFinancial: true,
      reason: "Failed to construct expense record",
    };
  }

  // If normalized merchant found, use it
  if (classification.normalizedMerchant) {
    expense.merchant = classification.normalizedMerchant;
  }

  // 5. Prevent duplicate transactions (e.g. duplicate SMS or re-scan)
  const existingTransactions = useExpenseStore.getState().transactions;
  const isDuplicate = existingTransactions.some((t) => {
    // Check if same merchant, same amount, and same date
    const sameAmount = Math.abs(t.amount - expense.amount) < 0.01;
    const sameMerchant =
      t.merchant.toLowerCase().trim() === expense.merchant.toLowerCase().trim();
    const sameDate = t.date === expense.date;
    const sameAccount = (t.accountLast4 ?? null) === (expense.accountLast4 ?? null);
    return sameAmount && sameMerchant && sameDate && sameAccount;
  });

  if (isDuplicate) {
    return {
      processed: false,
      isFinancial: true,
      reason: `Duplicate transaction detected for ₹${expense.amount} at ${expense.merchant}`,
    };
  }

  // 6. Save to SQLite & Zustand store
  useExpenseStore.getState().addTransaction(expense);

  return {
    processed: true,
    isFinancial: true,
    transaction: expense,
  };
}
