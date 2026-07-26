import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { colors, spacing, typography } from "@/theme/tokens";
import { subscriptionRepository } from "@/data/repository";
import {
  computeNextOccurrence,
  computeCancellationDeadline,
  getCancellationWindowStatus,
  toISODate,
} from "@/lib/renewal";
import { formatCurrency } from "@/lib/format";
import type { BillingCycle, SubscriptionCategory } from "@/types";

// ── Constants ──

const CURRENCY_OPTIONS = [
  { label: "₹ INR — Indian Rupee", value: "INR" },
  { label: "$ USD — US Dollar", value: "USD" },
  { label: "€ EUR — Euro", value: "EUR" },
  { label: "£ GBP — British Pound", value: "GBP" },
  { label: "¥ JPY — Japanese Yen", value: "JPY" },
  { label: "A$ AUD — Australian Dollar", value: "AUD" },
  { label: "C$ CAD — Canadian Dollar", value: "CAD" },
  { label: "S$ SGD — Singapore Dollar", value: "SGD" },
  { label: "CHF — Swiss Franc", value: "CHF" },
  { label: "¥ CNY — Chinese Yuan", value: "CNY" },
  { label: "₩ KRW — South Korean Won", value: "KRW" },
  { label: "R$ BRL — Brazilian Real", value: "BRL" },
  { label: "AED — UAE Dirham", value: "AED" },
  { label: "SAR — Saudi Riyal", value: "SAR" },
];

const CATEGORY_OPTIONS: { label: string; value: SubscriptionCategory }[] = [
  { label: "Streaming", value: "streaming" },
  { label: "Music", value: "music" },
  { label: "Cloud Storage", value: "cloud" },
  { label: "Software", value: "software" },
  { label: "Fitness", value: "fitness" },
  { label: "Insurance", value: "insurance" },
  { label: "Finance", value: "finance" },
  { label: "Utilities", value: "utilities" },
  { label: "Phone", value: "phone" },
  { label: "Rent", value: "rent" },
  { label: "SaaS", value: "saas" },
  { label: "Membership", value: "membership" },
  { label: "News", value: "news" },
  { label: "Other", value: "other" },
];

const BILLING_CYCLE_OPTIONS: { label: string; value: BillingCycle }[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

const NOTICE_PRESETS = [
  { label: "None (0 days)", value: "0" },
  { label: "1 day", value: "1" },
  { label: "3 days", value: "3" },
  { label: "7 days", value: "7" },
  { label: "14 days", value: "14" },
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
];

// ── Helpers ──

function parseDateInput(text: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const parts = text.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Component ──

export default function AddSubscriptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = id !== undefined;

  // ── Form state ──

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState<SubscriptionCategory | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const [customCycleDays, setCustomCycleDays] = useState("");
  const [nextRenewalDate, setNextRenewalDate] = useState("");
  const [cancellationNoticeDays, setCancellationNoticeDays] = useState("0");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");

  // ── Meta state ──

  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load existing item for edit ──

  useEffect(() => {
    if (!isEdit || id === undefined) return;
    setIsLoadingItem(true);

    (async () => {
      try {
        const item = await subscriptionRepository.getById(id);
        if (item) {
          setName(item.name);
          setProvider(item.provider);
          setAmount(String(item.amount));
          setCurrency(item.currency);
          setCategory(item.category);
          setBillingCycle(item.billingCycle);
          setCustomCycleDays(item.customCycleDays ? String(item.customCycleDays) : "");
          setNextRenewalDate(item.nextRenewalDate);
          setCancellationNoticeDays(String(item.cancellationNoticeDays));
          setNotes(item.notes ?? "");
          setUrl(item.url ?? "");
        } else {
          Alert.alert("Not Found", "Subscription not found.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } catch {
        Alert.alert("Error", "Failed to load subscription.");
      } finally {
        setIsLoadingItem(false);
      }
    })();
  }, [isEdit, id, router]);

  // ── Validation ──

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (name.trim().length === 0) errs.name = "Name is required";
    if (provider.trim().length === 0) errs.provider = "Provider is required";

    const amountNum = parseFloat(amount);
    if (amount.trim().length === 0) {
      errs.amount = "Amount is required";
    } else if (isNaN(amountNum) || amountNum <= 0) {
      errs.amount = "Enter a valid positive amount";
    }

    if (!category) errs.category = "Select a category";
    if (!billingCycle) errs.billingCycle = "Select a billing cycle";

    if (billingCycle === "custom") {
      const daysNum = parseInt(customCycleDays, 10);
      if (customCycleDays.trim().length === 0 || isNaN(daysNum) || daysNum <= 0) {
        errs.customCycleDays = "Enter a positive number of days";
      }
    }

    if (nextRenewalDate.trim().length === 0) {
      errs.nextRenewalDate = "Enter the next renewal date (YYYY-MM-DD)";
    } else {
      const parsed = parseDateInput(nextRenewalDate);
      if (!parsed) {
        errs.nextRenewalDate = "Invalid date format (use YYYY-MM-DD)";
      }
    }

    const noticeNum = parseInt(cancellationNoticeDays, 10);
    if (isNaN(noticeNum) || noticeNum < 0) {
      errs.cancellationNoticeDays = "Enter a valid number of days";
    }

    if (url.trim().length > 0 && !/^https?:\/\/.+/.test(url.trim())) {
      errs.url = "URL must start with http:// or https://";
    }

    return errs;
  }, [
    name,
    provider,
    amount,
    category,
    billingCycle,
    customCycleDays,
    nextRenewalDate,
    cancellationNoticeDays,
    url,
  ]);

  // ── Live preview ──

  const preview = useMemo(() => {
    const parsedDate = parseDateInput(nextRenewalDate);
    if (!parsedDate || !billingCycle) return null;

    const effectiveCycle = billingCycle;
    const effectiveCustomDays =
      billingCycle === "custom" ? parseInt(customCycleDays, 10) || 30 : null;

    const nextOccurrence = computeNextOccurrence(parsedDate, effectiveCycle, effectiveCustomDays);

    const noticeDays = parseInt(cancellationNoticeDays, 10) || 0;
    const deadlineDate = computeCancellationDeadline(parsedDate, noticeDays);
    const status = getCancellationWindowStatus(deadlineDate);

    return {
      nextOccurrence: toISODate(nextOccurrence),
      deadlineDate: toISODate(deadlineDate),
      status,
      noticeDays,
    };
  }, [billingCycle, customCycleDays, nextRenewalDate, cancellationNoticeDays]);

  // ── Save handler ──

  const handleSave = useCallback(async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSaving(true);
    try {
      const amountNum = parseFloat(amount);
      const noticeDays = parseInt(cancellationNoticeDays, 10) || 0;
      const safeCategory = category;
      const safeCycle = billingCycle;

      // These should always be non-null since validation passed
      if (!safeCategory || !safeCycle) return;

      const baseFields = {
        name: name.trim(),
        provider: provider.trim(),
        amount: amountNum,
        currency,
        category: safeCategory,
        billingCycle: safeCycle,
        customCycleDays: safeCycle === "custom" ? parseInt(customCycleDays, 10) || 30 : null,
        nextRenewalDate,
        cancellationNoticeDays: noticeDays,
        notes: notes.trim() || null,
        url: url.trim() || null,
      };

      if (isEdit && id) {
        await subscriptionRepository.update(id, baseFields);
      } else {
        await subscriptionRepository.create({
          ...baseFields,
          id: crypto.randomUUID(),
          isCanceled: false,
          canceledAt: null,
        });
      }

      router.back();
    } catch {
      Alert.alert(
        "Error",
        `Failed to ${isEdit ? "update" : "save"} subscription. Please try again.`,
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    amount,
    cancellationNoticeDays,
    currency,
    category,
    billingCycle,
    customCycleDays,
    nextRenewalDate,
    notes,
    url,
    name,
    provider,
    isEdit,
    id,
    router,
  ]);

  // ── Render ──

  if (isLoadingItem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasCustomCycle = billingCycle === "custom";
  const amountNum = parseFloat(amount) || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEdit ? "Edit Subscription" : "Add Subscription"}
          </Text>
        </View>

        {/* Basic info */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Netflix Premium"
            error={errors.name}
            accessibilityLabel="Subscription name"
          />
          <Input
            label="Provider"
            value={provider}
            onChangeText={setProvider}
            placeholder="e.g. Netflix Inc."
            error={errors.provider}
            accessibilityLabel="Provider name"
          />
          <Input
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 649"
            keyboardType="numeric"
            error={errors.amount}
            accessibilityLabel="Amount"
          />
          <Select
            label="Currency"
            value={currency}
            options={CURRENCY_OPTIONS}
            onSelect={setCurrency}
            accessibilityLabel="Currency"
          />
          <Select
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            onSelect={(val) => setCategory(val as SubscriptionCategory)}
            placeholder="Select category"
            error={errors.category}
            accessibilityLabel="Category"
          />
        </Card>

        {/* Billing */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Billing Cycle</Text>
          <Select
            label="Cycle"
            value={billingCycle}
            options={BILLING_CYCLE_OPTIONS}
            onSelect={(val) => setBillingCycle(val as BillingCycle)}
            placeholder="Select cycle"
            error={errors.billingCycle}
            accessibilityLabel="Billing cycle"
          />
          {hasCustomCycle && (
            <Input
              label="Custom cycle (days)"
              value={customCycleDays}
              onChangeText={setCustomCycleDays}
              placeholder="e.g. 45"
              keyboardType="numeric"
              error={errors.customCycleDays}
              hint="How many days between each renewal"
              accessibilityLabel="Custom cycle days"
            />
          )}
          <Input
            label="Next Renewal Date"
            value={nextRenewalDate}
            onChangeText={setNextRenewalDate}
            placeholder="YYYY-MM-DD"
            hint="The date of the upcoming charge"
            error={errors.nextRenewalDate}
            accessibilityLabel="Next renewal date"
          />
        </Card>

        {/* Cancellation */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cancellation Notice</Text>
          <Select
            label="Cancellation Notice Period"
            value={cancellationNoticeDays}
            options={NOTICE_PRESETS}
            onSelect={setCancellationNoticeDays}
            error={errors.cancellationNoticeDays}
            accessibilityLabel="Cancellation notice period"
          />
        </Card>

        {/* Live Preview */}
        <Card variant="elevated" style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Preview</Text>
          {preview ? (
            <>
              <PreviewRow
                label="Next renewal after entered date"
                value={formatDateDisplay(new Date(preview.nextOccurrence + "T00:00:00"))}
              />
              <PreviewRow
                label="Cancellation deadline"
                value={formatDateDisplay(new Date(preview.deadlineDate + "T00:00:00"))}
                valueColor={
                  preview.status === "open"
                    ? colors.danger
                    : preview.status === "opening-soon"
                      ? colors.warning
                      : colors.success
                }
              />
              {amountNum > 0 && billingCycle && (
                <PreviewRow
                  label="Normalized monthly"
                  value={formatCurrency(
                    Math.round(
                      billingCycle === "weekly"
                        ? (amountNum * 52) / 12
                        : billingCycle === "monthly"
                          ? amountNum
                          : billingCycle === "quarterly"
                            ? amountNum / 3
                            : billingCycle === "yearly"
                              ? amountNum / 12
                              : billingCycle === "custom"
                                ? (amountNum * (parseInt(customCycleDays, 10) || 30)) / 30
                                : amountNum,
                    ),
                    currency,
                  )}
                />
              )}
              {preview.noticeDays > 0 && (
                <Text style={styles.previewNote}>
                  {preview.status === "open"
                    ? "⚠ The cancellation deadline has passed or is today."
                    : preview.status === "opening-soon"
                      ? "⏰ The cancellation deadline is within 7 days."
                      : "✅ You have time before the cancellation deadline."}
                </Text>
              )}
              {preview.noticeDays === 0 && (
                <Text style={styles.previewNoNotice}>
                  No cancellation notice period set — renewal will auto-charge without a warning
                  window.
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.previewEmpty}>
              Enter a billing cycle and next renewal date to see a preview.
            </Text>
          )}
        </Card>

        {/* Notes & URL */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes, terms, or reminders"
            multiline
            accessibilityLabel="Notes"
          />
          <Input
            label="URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/manage"
            keyboardType="url"
            autoCapitalize="none"
            error={errors.url}
            hint="Link to manage or cancel this subscription"
            accessibilityLabel="URL"
          />
        </Card>

        {/* Save button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEdit ? "Update Subscription" : "Add Subscription"}
            onPress={handleSave}
            loading={isSaving}
            size="lg"
          />
          <Button title="Cancel" onPress={() => router.back()} variant="secondary" size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Preview row ──

function PreviewRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={[styles.previewValue, valueColor ? { color: valueColor } : undefined]}>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
  previewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primaryLight + "0D",
    borderWidth: 1,
    borderColor: colors.primaryLight + "30",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.md,
  },
  previewValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: "right",
  },
  previewNote: {
    ...typography.small,
    color: colors.warning,
    marginTop: spacing.md,
    textAlign: "center",
  },
  previewNoNotice: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: "center",
    fontStyle: "italic",
  },
  previewEmpty: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
