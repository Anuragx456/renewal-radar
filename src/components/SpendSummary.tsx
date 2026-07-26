import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { colors, spacing, typography } from "@/theme/tokens";
import { formatCurrency } from "@/lib/format";

interface SpendSummaryProps {
  monthlyTotal: number;
  yearlyTotal: number;
  currency?: string;
  isLoading?: boolean;
}

export function SpendSummary({
  monthlyTotal,
  yearlyTotal,
  currency = "INR",
  isLoading = false,
}: SpendSummaryProps) {
  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.container}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Monthly</Text>
          <Text style={styles.metricValue}>{formatCurrency(monthlyTotal, currency)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Yearly</Text>
          <Text style={styles.metricValue}>{formatCurrency(yearlyTotal, currency)}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.price,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: colors.divider,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
});
