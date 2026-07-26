import React, { useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionNeeded } from "@/components/ActionNeeded";
import { SpendSummary } from "@/components/SpendSummary";
import { UpcomingRenewals } from "@/components/UpcomingRenewals";
import { useDashboardStore } from "@/store/dashboardStore";
import { colors, typography, spacing } from "@/theme/tokens";
import type { SubscriptionItem } from "@/types";

export default function DashboardScreen() {
  const router = useRouter();
  const {
    actionNeeded,
    upcomingRenewals,
    monthlyTotal,
    yearlyTotal,
    isLoading,
    error,
    loadData,
    refresh,
  } = useDashboardStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleItemPress = useCallback(
    (item: SubscriptionItem) => {
      router.push(`/item/${item.id}`);
    },
    [router],
  );

  const handleAddPress = useCallback(() => {
    router.push("/add");
  }, [router]);

  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.heading}>Renewal Radar</Text>
        <Text style={styles.subheading}>Subscription tracker</Text>

        <SpendSummary
          monthlyTotal={monthlyTotal}
          yearlyTotal={yearlyTotal}
          isLoading={isLoading && !refreshing}
        />

        <ActionNeeded
          items={actionNeeded}
          isLoading={isLoading && !refreshing}
          onItemPress={handleItemPress}
          onAddPress={handleAddPress}
        />

        <UpcomingRenewals
          items={upcomingRenewals}
          isLoading={isLoading && !refreshing}
          onItemPress={handleItemPress}
          onAddPress={handleAddPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
