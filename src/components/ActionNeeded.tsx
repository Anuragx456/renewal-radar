import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { SubscriptionRow } from "@/components/SubscriptionRow";
import { colors, spacing, typography } from "@/theme/tokens";
import type { SubscriptionItem } from "@/types";
import { getCancellationInfo } from "@/lib/renewal";
import { getCancellationLabel } from "@/lib/format";

interface ActionNeededProps {
  items: SubscriptionItem[];
  isLoading?: boolean;
  onItemPress: (item: SubscriptionItem) => void;
  onAddPress: () => void;
}

export function ActionNeeded({
  items,
  isLoading = false,
  onItemPress,
  onAddPress,
}: ActionNeededProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Action Needed" />
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="small" color={colors.primary} />
        </Card>
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SectionHeader title="Action Needed" />
      <Card>
        {items.map((item, index) => {
          const info = getCancellationInfo(
            new Date(item.nextRenewalDate),
            item.cancellationNoticeDays,
          );
          const statusInfo = getCancellationLabel(info.status);

          return (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.itemDivider} />}
              <SubscriptionRow item={item} onPress={onItemPress} subtitle={statusInfo.label} />
            </React.Fragment>
          );
        })}
        {items.length > 0 && (
          <View style={styles.addMoreContainer}>
            <Text style={styles.addMoreText} onPress={onAddPress}>
              + Add subscription
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  loadingCard: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
  addMoreContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    alignItems: "center",
  },
  addMoreText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
