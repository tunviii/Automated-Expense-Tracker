export interface DetectionResult {
  isTransaction: boolean;
  reason?: "OTP" | "PROMO" | "NO_AMOUNT" | "NO_ACTION" | "VALID_TRANSACTION";
}

// Words strongly associated with OTPs / authentication
const OTP_REGEX = /\b(otp|one time password|verification code|secret code|login pin)\b/i;

// Words strongly associated with promotional spam or loan offers
const PROMO_REGEX = /\b(pre-approved|apply now|flat \d+% off|use code|congratulations you won|claim your reward|instant loan)\b/i;

// Indicators that a financial action actually occurred
const TRANSACTION_ACTION_REGEX = /\b(debited|credited|spent|sent|paid|withdrawn|charged|transferred|txn of|refund of|received)\b/i;

// Currency / amount indicators
const AMOUNT_REGEX = /(?:(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:Rs\.?|INR|₹))/i;

/**
 * Determines whether an SMS text represents a real financial debit or credit transaction.
 * Filters out OTPs, login alerts, promotional marketing, and non-transaction messages.
 */
export function isFinancialTransaction(smsText: string): DetectionResult {
  if (!smsText || typeof smsText !== "string") {
    return { isTransaction: false, reason: "NO_ACTION" };
  }

  const text = smsText.trim();

  // 1. Check for pure OTP alerts (if it's an OTP and DOES NOT mention debited/credited/spent)
  if (OTP_REGEX.test(text) && !TRANSACTION_ACTION_REGEX.test(text)) {
    return { isTransaction: false, reason: "OTP" };
  }

  // 2. Check for marketing / promotional spam
  if (PROMO_REGEX.test(text) && !TRANSACTION_ACTION_REGEX.test(text)) {
    return { isTransaction: false, reason: "PROMO" };
  }

  // 3. Must contain an amount
  if (!AMOUNT_REGEX.test(text)) {
    return { isTransaction: false, reason: "NO_AMOUNT" };
  }

  // 4. Must contain a financial transaction verb (debited, paid, spent, credited, etc.)
  if (!TRANSACTION_ACTION_REGEX.test(text)) {
    return { isTransaction: false, reason: "NO_ACTION" };
  }

  return { isTransaction: true, reason: "VALID_TRANSACTION" };
}
