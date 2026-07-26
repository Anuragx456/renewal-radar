import { create } from "zustand";
import { getDatabase } from "@/data/database";
import { subscriptionRepository } from "@/data/repository";
import { rescheduleAll } from "@/services/notifications";

interface SettingsState {
  cancellationReminderDays: number;
  preRenewalReminderDays: number;
  isLoading: boolean;
  isSaving: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (settings: {
    cancellationReminderDays?: number;
    preRenewalReminderDays?: number;
  }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  cancellationReminderDays: 3,
  preRenewalReminderDays: 7,
  isLoading: false,
  isSaving: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const db = await getDatabase();

      const cancelRow = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM settings WHERE key = ?",
        "cancellationReminderDays",
      );
      const renewRow = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM settings WHERE key = ?",
        "preRenewalReminderDays",
      );

      set({
        cancellationReminderDays: cancelRow ? parseInt(cancelRow.value, 10) || 3 : 3,
        preRenewalReminderDays: renewRow ? parseInt(renewRow.value, 10) || 7 : 7,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set({ isSaving: true });
    try {
      const db = await getDatabase();
      const current = get();

      const cancellationReminderDays =
        newSettings.cancellationReminderDays ?? current.cancellationReminderDays;
      const preRenewalReminderDays =
        newSettings.preRenewalReminderDays ?? current.preRenewalReminderDays;

      await db.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        "cancellationReminderDays",
        String(cancellationReminderDays),
      );
      await db.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        "preRenewalReminderDays",
        String(preRenewalReminderDays),
      );

      set({
        cancellationReminderDays,
        preRenewalReminderDays,
        isSaving: false,
      });

      // Reschedule all notifications with the new lead times
      const activeItems = await subscriptionRepository.getAll(false);
      await rescheduleAll(activeItems, {
        cancellationReminderDays,
        preRenewalReminderDays,
      }).catch(() => {
        /* silent */
      });
    } catch {
      set({ isSaving: false });
    }
  },
}));
