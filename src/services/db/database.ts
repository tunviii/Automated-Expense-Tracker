import * as SQLite from "expo-sqlite";

import { mockTransactions } from "@/data/mockTransactions";
import type {
  ExpenseTransaction,
  PaymentMethod,
  TransactionCategory,
  TransactionType,
} from "@/types/transaction";

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Safely gets or initializes the SQLite database instance.
 * Returns null if native SQLite is not available or hasn't bound yet.
 */
export function getDatabase(): SQLite.SQLiteDatabase | null {
  if (!dbInstance) {
    try {
      dbInstance = SQLite.openDatabaseSync("expenses.db");
    } catch (e) {
      console.warn("SQLite.openDatabaseSync not yet ready:", e);
      return null;
    }
  }
  return dbInstance;
}

/**
 * Initializes database tables and schema.
 */
export function initDatabase(): boolean {
  try {
    const db = getDatabase();
    if (!db) return false;

    db.execSync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        merchant TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        confidence REAL,
        is_user_corrected INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS personal_merchants (
        merchant TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Auto-seed demo data once on first ever launch
    const seededRow = db.getFirstSync<{ value: string }>(
      `SELECT value FROM app_meta WHERE key = 'has_seeded'`,
    );

    if (!seededRow) {
      dbSaveTransactions(mockTransactions);
      db.runSync(
        `INSERT INTO app_meta (key, value) VALUES ('has_seeded', 'true')`,
      );
    }
    return true;
  } catch (err) {
    console.warn("initDatabase error:", err);
    return false;
  }
}

/**
 * Saves or updates a transaction in SQLite.
 */
export function dbSaveTransaction(txn: ExpenseTransaction): void {
  try {
    const db = getDatabase();
    if (!db) return;

    const statement = db.prepareSync(`
      INSERT OR REPLACE INTO transactions (
        id, amount, merchant, category, date, transaction_type, payment_method, confidence, is_user_corrected
      ) VALUES ($id, $amount, $merchant, $category, $date, $type, $method, $confidence, $corrected);
    `);

    statement.executeSync({
      $id: txn.id,
      $amount: txn.amount,
      $merchant: txn.merchant,
      $category: txn.category,
      $date: txn.date,
      $type: txn.transactionType,
      $method: txn.paymentMethod,
      $confidence: txn.confidence ?? null,
      $corrected: txn.isUserCorrected ? 1 : 0,
    });
  } catch (err) {
    console.warn("dbSaveTransaction error:", err);
  }
}

/**
 * Saves multiple transactions in a single transaction.
 */
export function dbSaveTransactions(txns: ExpenseTransaction[]): void {
  try {
    const db = getDatabase();
    if (!db) return;

    db.withTransactionSync(() => {
      const statement = db.prepareSync(`
        INSERT OR REPLACE INTO transactions (
          id, amount, merchant, category, date, transaction_type, payment_method, confidence, is_user_corrected
        ) VALUES ($id, $amount, $merchant, $category, $date, $type, $method, $confidence, $corrected);
      `);

      for (const txn of txns) {
        statement.executeSync({
          $id: txn.id,
          $amount: txn.amount,
          $merchant: txn.merchant,
          $category: txn.category,
          $date: txn.date,
          $type: txn.transactionType,
          $method: txn.paymentMethod,
          $confidence: txn.confidence ?? null,
          $corrected: txn.isUserCorrected ? 1 : 0,
        });
      }
    });
  } catch (err) {
    console.warn("dbSaveTransactions error:", err);
  }
}

/**
 * Deletes a transaction by ID.
 */
export function dbDeleteTransaction(id: string): void {
  try {
    const db = getDatabase();
    if (!db) return;
    db.runSync(`DELETE FROM transactions WHERE id = ?;`, [id]);
  } catch (err) {
    console.warn("dbDeleteTransaction error:", err);
  }
}

/**
 * Updates a transaction's category and flags it as user-corrected.
 */
export function dbUpdateTransactionCategory(
  id: string,
  category: TransactionCategory,
): void {
  try {
    const db = getDatabase();
    if (!db) return;
    db.runSync(
      `UPDATE transactions SET category = ?, is_user_corrected = 1 WHERE id = ?;`,
      [category, id],
    );
  } catch (err) {
    console.warn("dbUpdateTransactionCategory error:", err);
  }
}

/**
 * Fetches all transactions, sorted newest first.
 */
export function dbGetAllTransactions(): ExpenseTransaction[] {
  try {
    const db = getDatabase();
    if (!db) return [];

    const rows = db.getAllSync<{
      id: string;
      amount: number;
      merchant: string;
      category: string;
      date: string;
      transaction_type: string;
      payment_method: string;
      confidence: number | null;
      is_user_corrected: number;
    }>(`SELECT * FROM transactions ORDER BY date DESC, created_at DESC;`);

    return rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      merchant: r.merchant,
      category: r.category as TransactionCategory,
      date: r.date,
      transactionType: r.transaction_type as Exclude<TransactionType, "UNKNOWN">,
      paymentMethod: r.payment_method as Exclude<PaymentMethod, "UNKNOWN">,
      confidence: r.confidence ?? undefined,
      isUserCorrected: r.is_user_corrected === 1,
    }));
  } catch (err) {
    console.warn("dbGetAllTransactions error:", err);
    return [];
  }
}

/**
 * Clears all transactions from SQLite.
 */
export function dbClearAllTransactions(): void {
  try {
    const db = getDatabase();
    if (!db) return;
    db.runSync(`DELETE FROM transactions;`);
  } catch (err) {
    console.warn("dbClearAllTransactions error:", err);
  }
}

/**
 * Stores a user's personal category preference for a merchant.
 */
export function dbRememberPersonalMerchant(
  merchant: string,
  category: TransactionCategory,
): void {
  try {
    if (!merchant) return;
    const db = getDatabase();
    if (!db) return;
    const key = merchant.toUpperCase().trim();
    db.runSync(
      `INSERT OR REPLACE INTO personal_merchants (merchant, category) VALUES (?, ?);`,
      [key, category],
    );
  } catch (err) {
    console.warn("dbRememberPersonalMerchant error:", err);
  }
}

/**
 * Fetches all saved personal merchant category overrides.
 */
export function dbGetAllPersonalMerchants(): Record<string, TransactionCategory> {
  try {
    const db = getDatabase();
    if (!db) return {};

    const rows = db.getAllSync<{ merchant: string; category: string }>(
      `SELECT merchant, category FROM personal_merchants;`,
    );

    const result: Record<string, TransactionCategory> = {};
    for (const row of rows) {
      result[row.merchant] = row.category as TransactionCategory;
    }
    return result;
  } catch (err) {
    console.warn("dbGetAllPersonalMerchants error:", err);
    return {};
  }
}

/**
 * Exports all user-corrected transactions for ML retraining.
 */
export function dbExportCorrectedDataForML(): Array<{
  merchant: string;
  category: string;
  amount: number;
  date: string;
}> {
  try {
    const db = getDatabase();
    if (!db) return [];

    return db.getAllSync<{
      merchant: string;
      category: string;
      amount: number;
      date: string;
    }>(`
      SELECT merchant, category, amount, date
      FROM transactions
      WHERE is_user_corrected = 1;
    `);
  } catch (err) {
    console.warn("dbExportCorrectedDataForML error:", err);
    return [];
  }
}
