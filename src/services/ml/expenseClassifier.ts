import { predictCategoryWithML } from "@/services/api/apiClients";
import { useExpenseStore } from "@/services/store/expenseStore";
import {
  recognizeMerchant,
  recognizeFromFullText,
  type RecognizedMerchant,
} from "@/services/sms/merchantRecognizer";
import type { TransactionCategory } from "@/types/transaction";

export interface ClassificationResult {
  category: TransactionCategory;
  confidence: number;
  source: "PERSONAL_OVERRIDE" | "MERCHANT_REGISTRY" | "ML_API" | "HEURISTIC_FALLBACK";
  normalizedMerchant?: string;
}

// Fallback keyword rules when both the registry and the ML server are unavailable
const HEURISTIC_KEYWORDS: Array<{ regex: RegExp; category: TransactionCategory }> = [
  { regex: /\b(food|restaurant|cafe|kitchen|bakery|dining|biryani|pizza|burger|chai|tea|coffee)\b/i, category: "Food & Dining" },
  { regex: /\b(supermarket|mart|grocer|bazaar|provisions|kirana)\b/i, category: "Groceries" },
  { regex: /\b(metro|railway|irctc|bus|toll|fastag|cab|auto|uber|ola|rapido)\b/i, category: "Transport" },
  { regex: /\b(pharmacy|chemist|clinic|hospital|diagnostics|medical|health)\b/i, category: "Healthcare" },
  { regex: /\b(electricity|water|gas|broadband|wifi|recharge|dth|postpaid|bill)\b/i, category: "Bills & Utilities" },
  { regex: /\b(school|college|university|academy|tuition|udemy|coursera|books)\b/i, category: "Education" },
  { regex: /\b(cinema|theatre|movies|pvr|inox|bookmyshow|game|play)\b/i, category: "Entertainment" },
  { regex: /\b(hotel|flight|airways|resort|travel|booking|stay)\b/i, category: "Travel" },
  { regex: /\b(salon|spa|parlour|beauty|grooming|haircut)\b/i, category: "Personal Care" },
  { regex: /\b(rent|maintenance|society|housing|landlord)\b/i, category: "Rent & Accommodation" },
  { regex: /\b(transfer|salary|refund|deposit|interest|sent to|vpa)\b/i, category: "Transfer" },
  { regex: /\b(retail|store|fashion|trends|mall|shopping|clothes|wear)\b/i, category: "Shopping" },
];

/**
 * Hybrid Expense Classifier
 *
 * 1. Fast Path: Checks 172+ curated Indian merchant mappings locally (Instant, 100% offline).
 * 2. ML Path: Queries the Python FastAPI model for unknown merchants / complex SMS text.
 * 3. Fallback Path: Uses heuristic keyword rules if the ML server is sleeping or offline.
 */
export async function classifyExpense(
  rawText: string,
  rawMerchant: string | null = null,
  amount: number | null = null,
): Promise<ClassificationResult> {
  // Tier 1: Check Personal Overrides Dictionary (User's prior corrections/choices)
  const personalMap = useExpenseStore.getState().personalMerchantMap || {};
  if (rawMerchant) {
    const key = rawMerchant.toUpperCase().trim();
    if (personalMap[key]) {
      return {
        category: personalMap[key],
        confidence: 1.0,
        source: "PERSONAL_OVERRIDE",
        normalizedMerchant: rawMerchant.trim(),
      };
    }
  }

  // Also check if any known personal merchant is mentioned in the full SMS text
  const upperText = rawText.toUpperCase();
  for (const [merchantKey, category] of Object.entries(personalMap)) {
    if (merchantKey.length >= 3 && upperText.includes(merchantKey)) {
      return {
        category,
        confidence: 1.0,
        source: "PERSONAL_OVERRIDE",
        normalizedMerchant: merchantKey,
      };
    }
  }

  // Tier 2: Check global merchant registry with extracted merchant
  const recognized = recognizeMerchant(rawMerchant);
  if (recognized) {
    return {
      category: recognized.category,
      confidence: recognized.confidence,
      source: "MERCHANT_REGISTRY",
      normalizedMerchant: recognized.normalizedMerchant,
    };
  }

  // 2. Scan entire SMS body for known brand/merchant names
  const textRecognized = recognizeFromFullText(rawText);
  if (textRecognized) {
    return {
      category: textRecognized.category,
      confidence: textRecognized.confidence,
      source: "MERCHANT_REGISTRY",
      normalizedMerchant: textRecognized.normalizedMerchant,
    };
  }

  // 3. Query Python ML API
  try {
    const mlResponse = await predictCategoryWithML(rawText, rawMerchant, amount);
    return {
      category: mlResponse.category,
      confidence: mlResponse.confidence,
      source: "ML_API",
      normalizedMerchant: rawMerchant ? rawMerchant.trim() : undefined,
    };
  } catch (error) {
    console.log("ML API unreachable or timed out; falling back to heuristics.", error);
  }

  // 3. Fallback Heuristics
  for (const rule of HEURISTIC_KEYWORDS) {
    if (rule.regex.test(rawText)) {
      return {
        category: rule.category,
        confidence: 0.65,
        source: "HEURISTIC_FALLBACK",
        normalizedMerchant: rawMerchant ? rawMerchant.trim() : undefined,
      };
    }
  }

  // Default fallback
  return {
    category: "Others",
    confidence: 0.4,
    source: "HEURISTIC_FALLBACK",
    normalizedMerchant: rawMerchant ? rawMerchant.trim() : undefined,
  };
}
