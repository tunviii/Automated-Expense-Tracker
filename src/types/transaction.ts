export type TransactionType = "DEBIT" | "CREDIT" | "UNKNOWN";

export type PaymentMethod =
  | "UPI"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CARD"
  | "BANK_TRANSFER"
  | "CASH"
  | "UNKNOWN";

export type TransactionCategory =
  | "Food & Dining"
  | "Groceries"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Subscription"
  | "Education"
  | "Healthcare"
  | "Bills & Utilities"
  | "Travel"
  | "Personal Care"
  | "Rent & Accommodation"
  | "Transfer"
  | "Others";

export type ParsedTransaction = {
  amount: number | null;
  merchant: string | null;
  date: string | null;
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
};

export type ExpenseTransaction = {
  id: string;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  date: string;
  transactionType: Exclude<TransactionType, "UNKNOWN">;
  paymentMethod: Exclude<PaymentMethod, "UNKNOWN">;
  confidence?: number;
  isUserCorrected?: boolean;
};
