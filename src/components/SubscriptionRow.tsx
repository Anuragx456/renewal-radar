import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "@/theme/tokens";
import type { SubscriptionItem } from "@/types";
import { capitalize, categoryLabel, formatCurrency } from "@/lib/format";

interface SubscriptionRowProps {
  item: SubscriptionItem;
  onPress: (item: SubscriptionItem) => void;
  rightContent?: React.ReactNode;
  subtitle?: string;
}

export function SubscriptionRow({ item, onPress, rightContent, subtitle }: SubscriptionRowProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatCurrency(item.amount, item.currency)}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.leftContent}>
        <View style={styles.categoryDot}>
          <Text style={styles.categoryDotText}>{categoryLabel(item.category).charAt(0)}</Text>
        </View>
        <View style={styles.textContent}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.provider} numberOfLines={1}>
            {item.provider}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.amount}>{formatCurrency(item.amount, item.currency)}</Text>
        <Text style={styles.cycle}>{capitalize(item.billingCycle)}</Text>
        {rightContent}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowPressed: {
    backgroundColor: colors.divider,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.md,
  },
  categoryDot: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  categoryDotText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  textContent: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  provider: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subtitle: {
    ...typography.small,
    color: colors.danger,
    marginTop: 2,
  },
  rightContent: {
    alignItems: "flex-end",
  },
  amount: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  cycle: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 1,
  },
});
