import type {
    ParsedTransaction,
    PaymentMethod,
    TransactionType,
} from "@/types/transaction";

export function extractAmount(text: string): number | null {
  // Support Rs, Rs., INR, and ₹ symbols
  const match = text.match(/(?:(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹))/i);
  if (!match) {
    return null;
  }

  const rawAmount = match[1] || match[2];
  const amount = Number(rawAmount.replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

export function extractTransactionType(text: string): TransactionType {
  const normalized = text.toLowerCase();
  const outgoing = /\b(debited|spent|sent|paid|withdrawn|purchase)\b/.test(
    normalized,
  );
  const incoming =
    /\b(credited with|received|deposit(?:ed)?|refund(?:ed)?|cashback)\b/.test(
      normalized,
    );

  if (outgoing && !incoming) {
    return "DEBIT";
  }
  if (incoming && !outgoing) {
    return "CREDIT";
  }
  if (outgoing && /;[^.]*\bcredited\b/.test(normalized)) {
    return "DEBIT";
  }
  return "UNKNOWN";
}

export function extractPaymentMethod(text: string): PaymentMethod {
  const normalized = text.toLowerCase();
  if (/\bupi\b/.test(normalized)) return "UPI";
  if (/\bcredit\s+card\b/.test(normalized)) return "CREDIT_CARD";
  if (/\bdebit\s+card\b/.test(normalized)) return "DEBIT_CARD";
  if (/\b(?:bank\s+transfer|neft|rtgs|imps)\b/.test(normalized))
    return "BANK_TRANSFER";
  if (/\bcard\b/.test(normalized)) return "CARD";
  if (/\bcash\b/.test(normalized)) return "CASH";
  return "UNKNOWN";
}

export function extractDate(text: string): string | null {
  const match = text.match(
    /\b(?:\d{2}-[A-Za-z]{3}-\d{2}|\d{2}\/\d{2}\/\d{2}|\d{4}-\d{2}-\d{2})\b/,
  );
  return match?.[0] ?? null;
}

/** Extract the final four digits only when the SMS identifies them as an account suffix. */
export function extractAccountLast4(text: string): string | null {
  const patterns = [
    /\b(?:a\/c|account|acct)(?:\s*(?:no\.?|number))?\s*[:#-]?\s*(?:x+|\*+)?\s*(\d{4,})\b/i,
    /\b(?:account\s+)?(?:ending|ends|last\s*4)\s*[:#-]?\s*(?:x+|\*+)?\s*(\d{4,})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].slice(-4);
  }
  return null;
}

function cleanMerchant(value: string): string | null {
  const merchant = value
    .replace(/^[.*_\s\-:,]+/, "")
    .replace(/[.*_\s\-:,]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return merchant.length > 0 ? merchant : null;
}

export function extractMerchant(text: string): string | null {
  const patterns = [
    // Pattern 1: ICICI/SBI "debited for Rs 680; ALEXS KITCHEN credited"
    /\bdebited\s+for\s+[^;]+;\s*(.+?)\s+credited\b/i,
    // Pattern 2: HDFC "At MYNTRA DESIGNS On 2026-03-15" or "At SWIGGY On 12/03/26"
    /\bAt\s+(.+?)\s+On\s+[\d\-:/]+/i,
    // Pattern 3: "To Hyderabad Metro On 14/03/26" or "To Zomato Ref 12345"
    /\bTo\s+(.+?)\s+(?:On\s+[\d\-:/]+|Ref\s+\d+|via\s+UPI|\.)/i,
    // Pattern 4: "paid to SWIGGY via UPI" or "paid to KFC INDIA."
    /\bpaid\s+to\s+(.+?)(?:\s+via|\s+from|\s+on|\.|$)/i,
    // Pattern 5: "sent to ZOMATO." or "sent to SWIGGY via"
    /\bsent\s+to\s+(.+?)(?:\s+via|\s+from|\s+on|\.|$)/i,
    // Pattern 6: "at STARBUCKS COFFEE." or "at McDonald's"
    /\bat\s+(.+?)(?:\s+via|\s+from|\s+Ref|\.|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const merchant = match?.[1] ? cleanMerchant(match[1]) : null;
    if (merchant && merchant.length > 1 && !/^(Rs|INR|account|card|bank)$/i.test(merchant)) {
      return merchant;
    }
  }

  return null;
}

export function parseTransaction(text: string): ParsedTransaction {
  return {
    amount: extractAmount(text),
    merchant: extractMerchant(text),
    date: extractDate(text),
    accountLast4: extractAccountLast4(text),
    transactionType: extractTransactionType(text),
    paymentMethod: extractPaymentMethod(text),
  };
}
