import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { colors, spacing, typography } from "@/theme/tokens";
import { useSettingsStore } from "@/store/settingsStore";
import { subscriptionRepository } from "@/data/repository";
import {
  DEFAULT_CANCELLATION_WINDOW_REMINDER_DAYS,
  DEFAULT_PRERENEWAL_REMINDER_DAYS,
} from "@/services/notifications";

export default function SettingsScreen() {
  const router = useRouter();
  const {
    cancellationReminderDays,
    preRenewalReminderDays,
    isLoading,
    isSaving,
    loadSettings,
    updateSettings,
  } = useSettingsStore();

  const [cancelDays, setCancelDays] = useState(String(cancellationReminderDays));
  const [renewDays, setRenewDays] = useState(String(preRenewalReminderDays));
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setCancelDays(String(cancellationReminderDays));
    setRenewDays(String(preRenewalReminderDays));
  }, [cancellationReminderDays, preRenewalReminderDays]);

  // ── Save handler ──

  const handleSave = useCallback(async () => {
    const parsedCancel = parseInt(cancelDays, 10);
    const parsedRenew = parseInt(renewDays, 10);

    if (isNaN(parsedCancel) || parsedCancel < 0) {
      Alert.alert("Invalid Value", "Cancellation reminder days must be a non-negative number.");
      return;
    }
    if (isNaN(parsedRenew) || parsedRenew < 0) {
      Alert.alert("Invalid Value", "Pre-renewal reminder days must be a non-negative number.");
      return;
    }

    await updateSettings({
      cancellationReminderDays: parsedCancel,
      preRenewalReminderDays: parsedRenew,
    });

    Alert.alert("Saved", "Settings updated and notifications rescheduled.");
  }, [cancelDays, renewDays, updateSettings]);

  // ── Export handler ──

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const items = await subscriptionRepository.getAll(true);
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        subscriptions: items,
      };

      const json = JSON.stringify(exportData, null, 2);
      const filename = `renewal-radar-export-${new Date().toISOString().split("T")[0]}.json`;
      const file = new File(Paths.cache, filename);
      file.create();
      file.write(json);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export Renewal Radar Data",
          UTI: "public.json",
        });
      } else {
        Alert.alert("Unavailable", "Sharing is not available on this device.");
      }
    } catch {
      Alert.alert("Export Failed", "Could not export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ── Reset handler ──

  const handleResetDefaults = useCallback(() => {
    Alert.alert(
      "Reset to Defaults",
      "This will reset notification lead times to their default values.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            await updateSettings({
              cancellationReminderDays: DEFAULT_CANCELLATION_WINDOW_REMINDER_DAYS,
              preRenewalReminderDays: DEFAULT_PRERENEWAL_REMINDER_DAYS,
            });
          },
        },
      ],
    );
  }, [updateSettings]);

  // ── Render ──

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Notification lead times */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notification Reminders</Text>
          <Text style={styles.sectionDescription}>
            Configure how many days before each event you want to be reminded. After saving, all
            scheduled notifications will be rescheduled.
          </Text>

          <Input
            label="Cancellation Window Reminder (days)"
            value={cancelDays}
            onChangeText={setCancelDays}
            placeholder="3"
            keyboardType="numeric"
            hint="Remind before cancellation deadline (default: 3)"
            accessibilityLabel="Cancellation window reminder days"
          />
          <Input
            label="Pre-Renewal Reminder (days)"
            value={renewDays}
            onChangeText={setRenewDays}
            placeholder="7"
            keyboardType="numeric"
            hint="Remind before renewal date (default: 7)"
            accessibilityLabel="Pre-renewal reminder days"
          />

          <View style={styles.buttonRow}>
            <View style={styles.buttonFlex}>
              <Button title="Save Settings" onPress={handleSave} loading={isSaving} />
            </View>
            <View style={styles.buttonFlex}>
              <Button title="Reset Defaults" onPress={handleResetDefaults} variant="secondary" />
            </View>
          </View>
        </Card>

        {/* Data export */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Text style={styles.sectionDescription}>
            Export all your subscriptions (including canceled ones) as a JSON file. You can use this
            to back up your data or transfer it to another device.
          </Text>
          <Button
            title="Export as JSON"
            onPress={handleExport}
            variant="secondary"
            loading={isExporting}
          />
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <InfoRow label="App" value="Renewal Radar" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Data" value="Stored on-device only" />
          <InfoRow label="Accounts" value="No account needed" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    paddingBottom: spacing.xxxxl,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sectionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  buttonFlex: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
