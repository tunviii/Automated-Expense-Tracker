import type { TransactionCategory } from "@/types/transaction";

export interface PredictResponse {
  category: TransactionCategory;
  confidence: number;
  top_categories: Array<{ category: string; probability: number }>;
}

// Configurable ML API endpoint.
// In development, update this to your machine's LAN IP (e.g., http://192.168.0.102:8000)
// or when deployed, to your free Render/HuggingFace URL (e.g., https://my-expense-ml.onrender.com)
export const ML_API_CONFIG = {
  baseUrl: "http://192.168.0.100:8000",
  timeoutMs: 3500, // Quick timeout so fallback triggers promptly if offline
};

/**
 * Update the ML API base URL (useful for toggling between local dev and cloud deployment)
 */
export function setMLApiUrl(url: string) {
  ML_API_CONFIG.baseUrl = url.replace(/\/+$/, "");
}

/**
 * Checks if the ML API server is currently reachable and healthy.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${ML_API_CONFIG.baseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Calls the Python ML backend to classify the raw SMS text.
 * Throws an error if the server is unreachable or times out, allowing the
 * caller to use the hybrid offline fallback.
 */
export async function predictCategoryWithML(
  rawText: string,
  merchant?: string | null,
  amount?: number | null,
): Promise<PredictResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ML_API_CONFIG.timeoutMs);

  try {
    const response = await fetch(`${ML_API_CONFIG.baseUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw_text: rawText,
        merchant: merchant ?? undefined,
        amount: amount ?? undefined,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`ML API error status: ${response.status}`);
    }

    const data = await response.json();
    return {
      category: data.category as TransactionCategory,
      confidence: data.confidence,
      top_categories: data.top_categories,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
