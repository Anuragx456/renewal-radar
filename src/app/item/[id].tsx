import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { colors, spacing, typography } from "@/theme/tokens";
import { subscriptionRepository } from "@/data/repository";
import { getCancellationInfo, computeNextOccurrence } from "@/lib/renewal";
import {
  formatCurrency,
  capitalize,
  categoryLabel,
  formatRelativeDate,
  getCancellationLabel,
} from "@/lib/format";
import type { SubscriptionItem } from "@/types";

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<SubscriptionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingCancel, setIsTogglingCancel] = useState(false);

  // ── Load item ──

  const loadItem = useCallback(async () => {
    if (id === undefined) {
      setError("No subscription ID provided");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await subscriptionRepository.getById(id);
      if (loaded) {
        setItem(loaded);
      } else {
        setError("Subscription not found");
      }
    } catch {
      setError("Failed to load subscription details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  // ── Handlers ──

  const handleEdit = useCallback(() => {
    if (!item) return;
    router.push(`/add?id=${item.id}`);
  }, [item, router]);

  const handleToggleCancel = useCallback(() => {
    if (!item) return;

    const title = item.isCanceled ? "Reactivate Subscription" : "Cancel Subscription";
    const message = item.isCanceled
      ? "This will move the subscription back to your active list."
      : `Are you sure you want to cancel "${item.name}"? You can reactivate it later.`;

    Alert.alert(title, message, [
      { text: "No", style: "cancel" },
      {
        text: item.isCanceled ? "Reactivate" : "Yes, Cancel",
        style: item.isCanceled ? "default" : "destructive",
        onPress: async () => {
          setIsTogglingCancel(true);
          try {
            if (item.isCanceled) {
              await subscriptionRepository.update(item.id, {
                isCanceled: false,
                canceledAt: null,
              });
            } else {
              await subscriptionRepository.markCanceled(item.id);
            }
            await loadItem();
          } catch {
            Alert.alert(
              "Error",
              `Failed to ${item.isCanceled ? "reactivate" : "cancel"} subscription.`,
            );
          } finally {
            setIsTogglingCancel(false);
          }
        },
      },
    ]);
  }, [item, loadItem]);

  const handleDelete = useCallback(() => {
    if (!item) return;

    Alert.alert(
      "Delete Subscription",
      `This will permanently delete "${item.name}" and all its data. This cannot be undone.`,
      [
        { text: "Keep It", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await subscriptionRepository.delete(item.id);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete subscription.");
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [item, router]);

  const handleOpenUrl = useCallback(() => {
    if (!item?.url) return;
    Linking.openURL(item.url).catch(() => {
      Alert.alert("Error", "Could not open the URL.");
    });
  }, [item]);

  // ── Render: Loading ──

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Error / Not found ──

  if (error || !item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorTitle}>{error ?? "Something went wrong"}</Text>
          <View style={styles.errorButtonContainer}>
            <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Content ──

  const cancellationInfo = getCancellationInfo(
    new Date(item.nextRenewalDate),
    item.cancellationNoticeDays,
  );
  const cancellationLabel = getCancellationLabel(cancellationInfo.status);
  const nextOccurrence =
    item.cancellationNoticeDays > 0
      ? computeNextOccurrence(
          new Date(item.nextRenewalDate),
          item.billingCycle,
          item.customCycleDays,
        )
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with back */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                item.isCanceled ? styles.statusCanceled : styles.statusActive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.isCanceled ? styles.statusTextCanceled : styles.statusTextActive,
                ]}
              >
                {item.isCanceled ? "Canceled" : "Active"}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount card */}
        <Card variant="elevated" style={styles.amountCard}>
          <Text style={styles.amountValue}>{formatCurrency(item.amount, item.currency)}</Text>
          <Text style={styles.amountCycle}>
            per{" "}
            {item.billingCycle === "custom"
              ? `${item.customCycleDays ?? 30} days`
              : capitalize(item.billingCycle)}
          </Text>
        </Card>

        {/* Info card */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <InfoRow label="Provider" value={item.provider} />
          <InfoRow label="Category" value={categoryLabel(item.category)} />
          <InfoRow
            label="Billing Cycle"
            value={
              item.billingCycle === "custom"
                ? `Every ${item.customCycleDays ?? 30} days`
                : capitalize(item.billingCycle)
            }
          />
          <InfoRow label="Currency" value={item.currency} />
          <InfoRow
            label="Next Renewal"
            value={`${formatRelativeDate(item.nextRenewalDate)} (${item.nextRenewalDate})`}
          />
          {nextOccurrence && (
            <InfoRow
              label="Following Renewal"
              value={formatRelativeDate(nextOccurrence.toISOString())}
            />
          )}
          <InfoRow
            label="Cancellation Notice"
            value={
              item.cancellationNoticeDays > 0
                ? `${item.cancellationNoticeDays} day${item.cancellationNoticeDays > 1 ? "s" : ""}`
                : "None"
            }
          />
        </Card>

        {/* Cancellation window card */}
        {item.cancellationNoticeDays > 0 && !item.isCanceled && (
          <Card
            style={{
              ...styles.infoCard,
              borderLeftColor: cancellationLabel.color,
            }}
          >
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cancellation Deadline</Text>
              <Text style={[styles.infoValue, { color: cancellationLabel.color }]}>
                {formatRelativeDate(cancellationInfo.deadlineDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <View
                style={[styles.statusBadge, { backgroundColor: cancellationLabel.color + "20" }]}
              >
                <Text style={[styles.statusText, { color: cancellationLabel.color }]}>
                  {cancellationLabel.label}
                </Text>
              </View>
            </View>
            {cancellationInfo.daysUntilDeadline > 0 && (
              <Text style={styles.infoHint}>
                Cancel within {cancellationInfo.daysUntilDeadline} day
                {cancellationInfo.daysUntilDeadline > 1 ? "s" : ""} to avoid the next charge.
              </Text>
            )}
            {cancellationInfo.daysUntilDeadline <= 0 && (
              <Text style={styles.infoHintDanger}>
                The cancellation deadline has passed. The next renewal may already be charged.
              </Text>
            )}
          </Card>
        )}

        {/* Notes card */}
        {item.notes && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </Card>
        )}

        {/* URL card */}
        {item.url && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Manage Link</Text>
            <Pressable onPress={handleOpenUrl} accessibilityRole="link">
              <Text style={styles.urlText} numberOfLines={2}>
                {item.url}
              </Text>
            </Pressable>
          </Card>
        )}

        {/* Dates card */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <InfoRow label="Created" value={new Date(item.createdAt).toLocaleDateString("en-IN")} />
          <InfoRow
            label="Last Updated"
            value={new Date(item.updatedAt).toLocaleDateString("en-IN")}
          />
          {item.isCanceled && item.canceledAt && (
            <InfoRow
              label="Canceled On"
              value={new Date(item.canceledAt).toLocaleDateString("en-IN")}
              valueColor={colors.danger}
            />
          )}
        </Card>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Button title="Edit Subscription" onPress={handleEdit} size="lg" />

          <Button
            title={item.isCanceled ? "Reactivate Subscription" : "Cancel Subscription"}
            onPress={handleToggleCancel}
            variant={item.isCanceled ? "primary" : "danger"}
            size="lg"
            loading={isTogglingCancel}
          />

          <Button
            title="Delete Permanently"
            onPress={handleDelete}
            variant="secondary"
            size="lg"
            loading={isDeleting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Info Row ──

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, valueColor ? { color: valueColor } : undefined]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxxl,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.danger,
    textAlign: "center",
  },
  errorButtonContainer: {
    marginTop: spacing.lg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backArrow: {
    fontSize: 24,
    color: colors.primary,
    marginRight: spacing.md,
    fontWeight: "600",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: colors.success + "20",
  },
  statusCanceled: {
    backgroundColor: colors.textTertiary + "30",
  },
  statusText: {
    ...typography.small,
    fontWeight: "600",
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextCanceled: {
    color: colors.textSecondary,
  },

  // Amount card
  amountCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  amountValue: {
    ...typography.h1,
    fontSize: 36,
    color: colors.textPrimary,
  },
  amountCycle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Section card
  sectionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.md,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "right",
    flex: 1.5,
  },

  // Cancellation info card
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderLeftWidth: 3,
  },
  infoHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  infoHintDanger: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },

  // Notes
  notesText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // URL
  urlText: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: "underline",
  },

  // Buttons
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
