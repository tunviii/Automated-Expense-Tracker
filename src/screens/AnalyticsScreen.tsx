import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { SectionHeader } from "@/components/common/SectionHeader";
import { categoryByLabel } from "@/constants/categories";
import { theme } from "@/constants/theme";
import { useExpenseStore } from "@/services/store/expenseStore";
import type { ExpenseTransaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/currency";

type TimeRange = "THIS_MONTH" | "LAST_30_DAYS" | "ALL_TIME";

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "All Time", value: "ALL_TIME" },
];

const categoryPalette: Record<string, string> = {
  "Food & Dining": "#D97736",
  Groceries: "#2E7D32",
  Transport: "#1E88E5",
  Shopping: "#8E24AA",
  Entertainment: "#E53935",
  Subscription: "#5E35B1",
  Education: "#00897B",
  Healthcare: "#D81B60",
  "Bills & Utilities": "#F57C00",
  Travel: "#0288D1",
  "Personal Care": "#C2185B",
  "Rent & Accommodation": "#5D4037",
  Transfer: "#546E7A",
  Others: theme.colors.mutedText,
};

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>("THIS_MONTH");
  const transactions = useExpenseStore((state) => state.transactions);
  const personalMerchantMap = useExpenseStore(
    (state) => state.personalMerchantMap,
  );

  // ── Filter transactions by timeframe ──────────────────────────────────
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    if (timeRange === "ALL_TIME") {
      return transactions;
    }

    if (timeRange === "THIS_MONTH") {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      return transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth
        );
      });
    }

    // LAST_30_DAYS
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
    });
  }, [transactions, timeRange]);

  // ── Compute Totals & Cashflow ──────────────────────────────────────────
  const { totalDebits, totalCredits, debitCount, creditCount, avgDebit } =
    useMemo(() => {
      let debits = 0;
      let credits = 0;
      let dCount = 0;
      let cCount = 0;

      filteredTransactions.forEach((t) => {
        if (t.transactionType === "DEBIT") {
          debits += t.amount;
          dCount += 1;
        } else if (t.transactionType === "CREDIT") {
          credits += t.amount;
          cCount += 1;
        }
      });

      return {
        totalDebits: debits,
        totalCredits: credits,
        debitCount: dCount,
        creditCount: cCount,
        avgDebit: dCount > 0 ? Math.round(debits / dCount) : 0,
      };
    }, [filteredTransactions]);

  const netSavings = totalCredits - totalDebits;

  // ── Category Breakdown ────────────────────────────────────────────────
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    filteredTransactions.forEach((t) => {
      if (t.transactionType === "DEBIT") {
        const existing = map.get(t.category) ?? { total: 0, count: 0 };
        map.set(t.category, {
          total: existing.total + t.amount,
          count: existing.count + 1,
        });
      }
    });

    return [...map.entries()]
      .map(([category, { total, count }]) => ({
        category,
        total,
        count,
        percent: totalDebits > 0 ? Math.round((total / totalDebits) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions, totalDebits]);

  // ── Top Merchants ─────────────────────────────────────────────────────
  const topMerchants = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    filteredTransactions.forEach((t) => {
      if (t.transactionType === "DEBIT" && t.merchant) {
        const name = t.merchant.trim();
        const existing = map.get(name) ?? { total: 0, count: 0 };
        map.set(name, {
          total: existing.total + t.amount,
          count: existing.count + 1,
        });
      }
    });

    return [...map.entries()]
      .map(([merchant, { total, count }]) => ({
        merchant,
        total,
        count,
        avg: Math.round(total / count),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredTransactions]);

  // ── Payment Methods ───────────────────────────────────────────────────
  const paymentMethodStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    filteredTransactions.forEach((t) => {
      if (t.transactionType === "DEBIT") {
        const method = t.paymentMethod || "OTHER";
        const existing = map.get(method) ?? { total: 0, count: 0 };
        map.set(method, {
          total: existing.total + t.amount,
          count: existing.count + 1,
        });
      }
    });

    return [...map.entries()]
      .map(([method, { total, count }]) => ({
        method,
        total,
        count,
        percent: totalDebits > 0 ? Math.round((total / totalDebits) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions, totalDebits]);

  // ── Smart AI Insights ─────────────────────────────────────────────────
  const insights = useMemo(() => {
    const list: string[] = [];

    if (categoryStats.length > 0) {
      const topCat = categoryStats[0];
      list.push(
        `🏆 ${topCat.category} is your highest expense, taking ${topCat.percent}% (${formatCurrency(topCat.total)}) of your spending.`,
      );
    }

    if (topMerchants.length > 0) {
      const topM = topMerchants[0];
      list.push(
        `🛍️ Your most frequented merchant is "${topM.merchant}" with ${topM.count} transactions totaling ${formatCurrency(topM.total)}.`,
      );
    }

    const upiStat = paymentMethodStats.find((p) => p.method === "UPI");
    if (upiStat && upiStat.percent >= 40) {
      list.push(
        `⚡ UPI powers ${upiStat.percent}% of your spending across ${upiStat.count} transactions.`,
      );
    }

    const overrideCount = Object.keys(personalMerchantMap).length;
    if (overrideCount > 0) {
      list.push(
        `🧠 Your personal AI override dictionary has learned ${overrideCount} custom merchant preference${overrideCount > 1 ? "s" : ""}.`,
      );
    }

    return list;
  }, [categoryStats, topMerchants, paymentMethodStats, personalMerchantMap]);

  return (
    <ScreenContainer>
      {/* ── Screen Header ─────────────────────────────────────────────── */}
      <Text style={styles.kicker}>INSIGHTS & PATTERNS</Text>
      <Text style={styles.title}>Spending Analytics</Text>
      <Text style={styles.subtitle}>
        Visual breakdown of your money, categories, and top merchants.
      </Text>

      {/* ── Timeframe Filter Chips ────────────────────────────────────── */}
      <View style={styles.timeRangeBar}>
        {timeRangeOptions.map((opt) => {
          const isActive = timeRange === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setTimeRange(opt.value)}
              accessibilityRole="button"
              style={[styles.rangeChip, isActive && styles.activeRangeChip]}
            >
              <Text
                style={[
                  styles.rangeChipText,
                  isActive && styles.activeRangeChipText,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Empty State ──────────────────────────────────────────────── */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptySubtitle}>
            There are no recorded transactions for this timeframe. Parse SMS or
            load demo data to view analytics.
          </Text>
        </View>
      ) : (
        <>
          {/* ── Metric Cards ─────────────────────────────────────────── */}
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, styles.debitCard]}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={[styles.summaryValue, styles.debitValue]}>
                {formatCurrency(totalDebits)}
              </Text>
              <Text style={styles.summarySub}>{debitCount} debit transactions</Text>
            </View>

            <View style={[styles.summaryCard, styles.creditCard]}>
              <Text style={styles.summaryLabel}>Total Received</Text>
              <Text style={[styles.summaryValue, styles.creditValue]}>
                {formatCurrency(totalCredits)}
              </Text>
              <Text style={styles.summarySub}>{creditCount} credit entries</Text>
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Avg Transaction</Text>
              <Text style={styles.kpiValue}>{formatCurrency(avgDebit)}</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>Net Balance</Text>
              <Text
                style={[
                  styles.kpiValue,
                  netSavings >= 0 ? styles.positiveNet : styles.negativeNet,
                ]}
              >
                {netSavings >= 0 ? "+" : ""}
                {formatCurrency(netSavings)}
              </Text>
            </View>
          </View>

          {/* ── Category Breakdown ───────────────────────────────────── */}
          <SectionHeader
            title={`Category Distribution (${categoryStats.length})`}
          />
          <View style={styles.card}>
            {categoryStats.map((item) => {
              const def =
                categoryByLabel[item.category as keyof typeof categoryByLabel];
              const barColor =
                categoryPalette[item.category] || theme.colors.accent;

              return (
                <View key={item.category} style={styles.catRow}>
                  <View style={styles.catHeader}>
                    <View style={styles.catTitleWrap}>
                      <Text style={styles.catIcon}>{def?.icon ?? "🏷️"}</Text>
                      <Text style={styles.catName} numberOfLines={1}>
                        {item.category}
                      </Text>
                    </View>
                    <View style={styles.catAmountWrap}>
                      <Text style={styles.catAmount}>
                        {formatCurrency(item.total)}
                      </Text>
                      <Text style={styles.catPercent}>{item.percent}%</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.max(4, item.percent)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Top Merchants ────────────────────────────────────────── */}
          {topMerchants.length > 0 && (
            <>
              <SectionHeader title="Top Merchants by Spend" />
              <View style={styles.card}>
                {topMerchants.map((m, index) => (
                  <View
                    key={m.merchant}
                    style={[
                      styles.merchantRow,
                      index < topMerchants.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.merchantInfo}>
                      <Text style={styles.merchantName} numberOfLines={1}>
                        {m.merchant}
                      </Text>
                      <Text style={styles.merchantSub}>
                        {m.count} visit{m.count > 1 ? "s" : ""} • Avg{" "}
                        {formatCurrency(m.avg)}
                      </Text>
                    </View>
                    <Text style={styles.merchantTotal}>
                      {formatCurrency(m.total)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Payment Modes ────────────────────────────────────────── */}
          {paymentMethodStats.length > 0 && (
            <>
              <SectionHeader title="Payment Instruments" />
              <View style={styles.card}>
                {paymentMethodStats.map((item, idx) => (
                  <View
                    key={item.method}
                    style={[
                      styles.paymentRow,
                      idx < paymentMethodStats.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>
                        {item.method === "UPI"
                          ? "⚡ UPI"
                          : item.method === "CREDIT_CARD"
                            ? "💳 Credit Card"
                            : item.method === "DEBIT_CARD"
                              ? "🏧 Debit Card"
                              : item.method === "BANK_TRANSFER"
                                ? "🏦 Net Banking"
                                : item.method === "CARD"
                                  ? "💳 Card"
                                  : "💵 " + item.method}
                      </Text>
                      <Text style={styles.paymentCount}>
                        {item.count} transactions ({item.percent}%)
                      </Text>
                    </View>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── AI Insights ──────────────────────────────────────────── */}
          {insights.length > 0 && (
            <>
              <SectionHeader title="Smart Observations" />
              <View style={styles.insightsCard}>
                {insights.map((insight, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.insightItem,
                      idx < insights.length - 1 && styles.insightDivider,
                    ]}
                  >
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: theme.spacing.xs,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.colors.mutedText,
    fontSize: 14,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },

  // Range Bar
  timeRangeBar: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  rangeChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  activeRangeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rangeChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  activeRangeChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Empty state
  emptyContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    color: theme.colors.mutedText,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  debitCard: {
    backgroundColor: "#FDF5F4",
    borderColor: "#F5D9D6",
  },
  creditCard: {
    backgroundColor: "#F2F9F5",
    borderColor: "#D2EDE0",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: theme.spacing.xs,
  },
  debitValue: {
    color: theme.colors.danger,
  },
  creditValue: {
    color: theme.colors.success,
  },
  summarySub: {
    fontSize: 11,
    color: theme.colors.mutedText,
  },

  // KPI Row
  kpiRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  kpiBox: {
    flex: 1,
    alignItems: "center",
  },
  kpiDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.mutedText,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  positiveNet: {
    color: theme.colors.success,
  },
  negativeNet: {
    color: theme.colors.danger,
  },

  // Card Container
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },

  // Category Row
  catRow: {
    marginBottom: theme.spacing.md,
  },
  catHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  catTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  catIcon: {
    fontSize: 16,
  },
  catName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  catAmountWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  catAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  catPercent: {
    fontSize: 11,
    color: theme.colors.mutedText,
    width: 32,
    textAlign: "right",
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: theme.radius.pill,
  },

  // Merchant Row
  merchantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  rankText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  merchantInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  merchantName: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  merchantSub: {
    fontSize: 11,
    color: theme.colors.mutedText,
    marginTop: 2,
  },
  merchantTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },

  // Payment Row
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  paymentCount: {
    fontSize: 11,
    color: theme.colors.mutedText,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },

  // Insights Card
  insightsCard: {
    backgroundColor: "#F3F7F5",
    borderWidth: 1,
    borderColor: "#D3E5DC",
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  insightItem: {
    paddingVertical: theme.spacing.xs,
  },
  insightDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0EFE8",
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  insightText: {
    color: theme.colors.text,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
