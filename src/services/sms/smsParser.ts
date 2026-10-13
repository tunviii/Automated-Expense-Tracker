import type {
    ParsedTransaction,
    PaymentMethod,
    TransactionType,
} from "@/types/transaction";

export function extractAmount(text: string): number | null {
  const match = text.match(/\b(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!match) {
    return null;
  }

  const amount = Number(match[1].replace(/,/g, ""));
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

function cleanMerchant(value: string): string | null {
  const merchant = value
    .replace(/[.;,:]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return merchant.length > 0 ? merchant : null;
}

export function extractMerchant(text: string): string | null {
  const patterns = [
    /\bdebited\s+for\s+[^;]+;\s*(.+?)\s+credited\b/i,
    /\bto\s+(.+?)\s+on\s+\d{2}\/\d{2}\/\d{2}\b/i,
    /\bat\s+(.+?)\s+on\s+\d{4}-\d{2}-\d{2}\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const merchant = match?.[1] ? cleanMerchant(match[1]) : null;
    if (merchant) return merchant;
  }

  return null;
}

export function parseTransaction(text: string): ParsedTransaction {
  return {
    amount: extractAmount(text),
    merchant: extractMerchant(text),
    date: extractDate(text),
    transactionType: extractTransactionType(text),
    paymentMethod: extractPaymentMethod(text),
  };
}
