import * as Notifications from "expo-notifications";
import type { SubscriptionItem } from "@/types";
import { computeCancellationDeadline } from "@/lib/renewal";

// ── Default lead times (configurable via settings in STEP 7) ──

export const DEFAULT_CANCELLATION_WINDOW_REMINDER_DAYS = 3;
export const DEFAULT_PRERENEWAL_REMINDER_DAYS = 7;

// ── Identifier helpers ──

const CANCEL_PREFIX = "cancel-";
const RENEW_PREFIX = "renew-";

function cancelId(itemId: string): string {
  return `${CANCEL_PREFIX}${itemId}`;
}

function renewId(itemId: string): string {
  return `${RENEW_PREFIX}${itemId}`;
}

function isItemNotificationId(id: string, itemId: string): boolean {
  return id === cancelId(itemId) || id === renewId(itemId);
}

// ── Setup ──

/**
 * Set up the notification handler for foreground behavior.
 * Call once at app startup (e.g. in _layout.tsx).
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ── Permissions ──

/**
 * Request notification permissions and return whether granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

// ── Schedule ──

/**
 * Schedule a cancellation window reminder notification.
 * Fires `daysBeforeDeadline` days before the cancellation deadline.
 */
export async function scheduleCancellationReminder(
  item: SubscriptionItem,
  daysBeforeDeadline: number = DEFAULT_CANCELLATION_WINDOW_REMINDER_DAYS,
): Promise<void> {
  if (item.isCanceled || item.cancellationNoticeDays <= 0) return;

  const deadlineDate = computeCancellationDeadline(
    new Date(item.nextRenewalDate),
    item.cancellationNoticeDays,
  );

  // Fire when: deadline - reminder days
  const fireDate = new Date(deadlineDate);
  fireDate.setDate(fireDate.getDate() - daysBeforeDeadline);
  fireDate.setHours(9, 0, 0, 0); // 9 AM local time

  // Don't schedule if the fire date is already in the past
  if (fireDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: cancelId(item.id),
    content: {
      title: "⚠️ Cancellation Window Closing",
      body: `"${item.name}" — Cancel by ${deadlineDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} to avoid the next charge of ${item.currency} ${item.amount}.`,
      data: { itemId: item.id, type: "cancellation-window" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

/**
 * Schedule a pre-renewal reminder notification.
 * Fires `daysBeforeRenewal` days before the next renewal date.
 */
export async function scheduleRenewalReminder(
  item: SubscriptionItem,
  daysBeforeRenewal: number = DEFAULT_PRERENEWAL_REMINDER_DAYS,
): Promise<void> {
  if (item.isCanceled) return;

  const renewalDate = new Date(item.nextRenewalDate);

  // Fire when: renewal - reminder days
  const fireDate = new Date(renewalDate);
  fireDate.setDate(fireDate.getDate() - daysBeforeRenewal);
  fireDate.setHours(9, 0, 0, 0); // 9 AM local time

  // Don't schedule if the fire date is already in the past
  if (fireDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: renewId(item.id),
    content: {
      title: "📋 Upcoming Renewal",
      body: `"${item.name}" (${item.provider}) renews on ${renewalDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} — ${item.currency} ${item.amount}.`,
      data: { itemId: item.id, type: "pre-renewal" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

// ── Cancel ──

/**
 * Cancel all scheduled notifications for a specific item.
 */
export async function cancelItemNotifications(itemId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toRemove = scheduled
    .filter((n) => isItemNotificationId(n.identifier, itemId))
    .map((n) => n.identifier);

  await Promise.all(toRemove.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

// ── Reschedule ──

/**
 * Cancel existing notifications for an item and reschedule fresh ones.
 * Call after create, update, or reactivate.
 */
export async function rescheduleForItem(
  item: SubscriptionItem,
  options?: {
    cancellationReminderDays?: number;
    preRenewalReminderDays?: number;
  },
): Promise<void> {
  await cancelItemNotifications(item.id);

  const reminders = Promise.all([
    scheduleCancellationReminder(item, options?.cancellationReminderDays),
    scheduleRenewalReminder(item, options?.preRenewalReminderDays),
  ]);

  await reminders;
}

/**
 * Reschedule notifications for all active subscriptions.
 * Useful after changing global lead-time settings.
 */
export async function rescheduleAll(
  items: SubscriptionItem[],
  options?: {
    cancellationReminderDays?: number;
    preRenewalReminderDays?: number;
  },
): Promise<void> {
  // Cancel all scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Reschedule for each active item
  await Promise.all(items.map((item) => rescheduleForItem(item, options)));
}
