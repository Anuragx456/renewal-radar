import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { SubscriptionRow } from "@/components/SubscriptionRow";
import { colors, spacing, typography } from "@/theme/tokens";
import type { SubscriptionItem } from "@/types";
import { getCancellationInfo } from "@/lib/renewal";
import { formatRelativeDate } from "@/lib/format";

interface UpcomingRenewalsProps {
  items: SubscriptionItem[];
  isLoading?: boolean;
  onItemPress: (item: SubscriptionItem) => void;
  onAddPress: () => void;
}

export function UpcomingRenewals({
  items,
  isLoading = false,
  onItemPress,
  onAddPress,
}: UpcomingRenewalsProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Upcoming Renewals" />
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="small" color={colors.primary} />
        </Card>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Upcoming Renewals" />
        <Card>
          <EmptyState
            title="No upcoming renewals"
            subtitle="Add a subscription to start tracking your renewals"
            actionLabel="Add Subscription"
            onAction={onAddPress}
          />
        </Card>
      </View>
    );
  }

  const expiredItems = items.filter((item) => {
    const info = getCancellationInfo(new Date(item.nextRenewalDate), item.cancellationNoticeDays);
    return info.status === "open" || info.status === "opening-soon";
  });
  const safeItems = items.filter((item) => {
    const info = getCancellationInfo(new Date(item.nextRenewalDate), item.cancellationNoticeDays);
    return info.status === "safe";
  });

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Upcoming Renewals"
        actionLabel={items.length > 0 ? `${items.length} total` : undefined}
      />
      {expiredItems.length > 0 && (
        <Card style={styles.warningCard}>
          <Text style={styles.warningText}>
            {expiredItems.length} {expiredItems.length === 1 ? "item has" : "items have"} passed the
            cancellation deadline
          </Text>
        </Card>
      )}
      <Card>
        {safeItems.map((item, index) => {
          const subtitle = `Renews ${formatRelativeDate(item.nextRenewalDate)}`;

          return (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.itemDivider} />}
              <SubscriptionRow item={item} onPress={onItemPress} subtitle={subtitle} />
            </React.Fragment>
          );
        })}
        {safeItems.length === 0 && (
          <EmptyState
            title="No upcoming renewals"
            subtitle="Add a subscription to start tracking your renewals"
            actionLabel="Add Subscription"
            onAction={onAddPress}
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  loadingCard: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  warningCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningLight + "20",
    borderColor: colors.warningLight,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
});
