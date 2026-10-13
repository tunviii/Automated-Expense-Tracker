import {
    extractAmount,
    extractMerchant,
    extractTransactionType,
    parseTransaction,
} from "./smsParser.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

export function runParserSmokeTests(): void {
  const upi = parseTransaction(
    "Your A/C is debited for Rs 680.00 on 08-Mar-26; ALEXS KITCHEN credited. UPI: demo@upi",
  );
  assert(upi.amount === 680, "UPI amount should parse");
  assert(
    upi.transactionType === "DEBIT",
    "Merchant credited clause must not flip account debit",
  );
  assert(upi.merchant === "ALEXS KITCHEN", "UPI merchant should parse");
  assert(upi.paymentMethod === "UPI", "UPI method should parse");

  const transfer = parseTransaction(
    "Sent Rs.47.00 From HDFC Bank A/C *7563 To Hyderabad Metro On 14/03/26 Ref DEMO",
  );
  assert(
    transfer.amount === 47 && transfer.merchant === "Hyderabad Metro",
    "Transfer fields should parse",
  );
  assert(transfer.transactionType === "DEBIT", "Sent should be a debit");

  const card = parseTransaction(
    "Spent Rs.3231 On HDFC Bank Card 0383 At MYNTRA DESIGNS PRIVATE On 2026-03-15:10:52:24.",
  );
  assert(
    card.amount === 3231 && card.merchant === "MYNTRA DESIGNS PRIVATE",
    "Card sample should parse",
  );

  const credit = parseTransaction(
    "Your account is credited with INR 1,250.50. Received from Demo Payroll on 2026-03-15.",
  );
  assert(
    credit.amount === 1250.5 && credit.transactionType === "CREDIT",
    "Incoming credit should parse",
  );

  assert(
    extractAmount("Your OTP is 123456") === null,
    "OTP must not produce an amount",
  );
  assert(
    extractMerchant("Your OTP is 123456. Do not share it.") === null,
    "OTP must not produce a merchant",
  );
  assert(
    extractTransactionType("Flat 20% off on all orders today") === "UNKNOWN",
    "Promotion should be unknown",
  );
}
