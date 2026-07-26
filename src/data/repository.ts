import type { SubscriptionItem } from "@/types";
import { getDatabase } from "./database";

interface SubscriptionRow {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  category: string;
  billing_cycle: string;
  custom_cycle_days: number | null;
  next_renewal_date: string;
  cancellation_notice_days: number;
  notes: string | null;
  url: string | null;
  is_canceled: number;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToItem(row: SubscriptionRow): SubscriptionItem {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    amount: row.amount,
    currency: row.currency,
    category: row.category as SubscriptionItem["category"],
    billingCycle: row.billing_cycle as SubscriptionItem["billingCycle"],
    customCycleDays: row.custom_cycle_days,
    nextRenewalDate: row.next_renewal_date,
    cancellationNoticeDays: row.cancellation_notice_days,
    notes: row.notes,
    url: row.url,
    isCanceled: row.is_canceled === 1,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SubscriptionRepository {
  /**
   * Get all subscriptions, optionally filtered by cancelation status.
   */
  async getAll(includeCanceled = false): Promise<SubscriptionItem[]> {
    const db = await getDatabase();
    const query = includeCanceled
      ? "SELECT * FROM subscriptions ORDER BY created_at DESC"
      : "SELECT * FROM subscriptions WHERE is_canceled = 0 ORDER BY created_at DESC";
    const rows = await db.getAllAsync<SubscriptionRow>(query);
    return rows.map(rowToItem);
  }

  /**
   * Get a single subscription by ID.
   */
  async getById(id: string): Promise<SubscriptionItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SubscriptionRow>(
      "SELECT * FROM subscriptions WHERE id = ?",
      id,
    );
    return row ? rowToItem(row) : null;
  }

  /**
   * Get all active (not canceled) subscriptions sorted by next renewal date ascending.
   */
  async getUpcomingRenewals(): Promise<SubscriptionItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SubscriptionRow>(
      "SELECT * FROM subscriptions WHERE is_canceled = 0 ORDER BY next_renewal_date ASC",
    );
    return rows.map(rowToItem);
  }

  /**
   * Create a new subscription.
   */
  async create(item: Omit<SubscriptionItem, "createdAt" | "updatedAt">): Promise<SubscriptionItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO subscriptions (
        id, name, provider, amount, currency, category, billing_cycle,
        custom_cycle_days, next_renewal_date, cancellation_notice_days,
        notes, url, is_canceled, canceled_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item.id,
      item.name,
      item.provider,
      item.amount,
      item.currency,
      item.category,
      item.billingCycle,
      item.customCycleDays,
      item.nextRenewalDate,
      item.cancellationNoticeDays,
      item.notes,
      item.url,
      item.isCanceled ? 1 : 0,
      item.canceledAt,
      now,
      now,
    );
    return {
      ...item,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update an existing subscription. Returns the updated item or null if not found.
   */
  async update(
    id: string,
    updates: Partial<Omit<SubscriptionItem, "id" | "createdAt" | "updatedAt">>,
  ): Promise<SubscriptionItem | null> {
    const existing = await this.getById(id);
    if (!existing) {
      return null;
    }

    const db = await getDatabase();
    const now = new Date().toISOString();
    const merged = { ...existing, ...updates, id, createdAt: existing.createdAt, updatedAt: now };

    await db.runAsync(
      `UPDATE subscriptions SET
        name = ?, provider = ?, amount = ?, currency = ?, category = ?,
        billing_cycle = ?, custom_cycle_days = ?, next_renewal_date = ?,
        cancellation_notice_days = ?, notes = ?, url = ?,
        is_canceled = ?, canceled_at = ?, updated_at = ?
      WHERE id = ?`,
      merged.name,
      merged.provider,
      merged.amount,
      merged.currency,
      merged.category,
      merged.billingCycle,
      merged.customCycleDays,
      merged.nextRenewalDate,
      merged.cancellationNoticeDays,
      merged.notes,
      merged.url,
      merged.isCanceled ? 1 : 0,
      merged.canceledAt,
      now,
      id,
    );

    return merged;
  }

  /**
   * Mark a subscription as canceled (keeps history).
   */
  async markCanceled(id: string): Promise<SubscriptionItem | null> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      "UPDATE subscriptions SET is_canceled = 1, canceled_at = ?, updated_at = ? WHERE id = ?",
      now,
      now,
      id,
    );
    return this.getById(id);
  }

  /**
   * Permanently delete a subscription.
   */
  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM subscriptions WHERE id = ?", id);
  }

  /**
   * Get monthly and yearly spend totals for active subscriptions.
   */
  async getSpendSummary(): Promise<{
    monthlyTotal: number;
    yearlyTotal: number;
  }> {
    const items = await this.getAll(false);
    const { normalizeToMonthly, normalizeToYearly } = await import("@/lib/renewal");

    let monthlyTotal = 0;
    let yearlyTotal = 0;

    for (const item of items) {
      monthlyTotal += normalizeToMonthly(item.amount, item.billingCycle, item.customCycleDays);
      yearlyTotal += normalizeToYearly(item.amount, item.billingCycle, item.customCycleDays);
    }

    return { monthlyTotal, yearlyTotal };
  }

  /**
   * Get all active subscriptions that have a cancellation deadline within the next 7 days.
   */
  async getActionNeeded(): Promise<SubscriptionItem[]> {
    const items = await this.getAll(false);
    const { getCancellationInfo } = await import("@/lib/renewal");

    return items.filter((item) => {
      const info = getCancellationInfo(new Date(item.nextRenewalDate), item.cancellationNoticeDays);
      return info.status === "open" || info.status === "opening-soon";
    });
  }

  /**
   * Get all active subscriptions that renew within the next 60 days.
   */
  async getRenewalsWithin60Days(): Promise<SubscriptionItem[]> {
    const items = await this.getAll(false);
    const now = new Date();
    const sixtyDaysFromNow = new Date(now);
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    return items
      .filter((item) => {
        const renewalDate = new Date(item.nextRenewalDate);
        return renewalDate >= now && renewalDate <= sixtyDaysFromNow;
      })
      .sort(
        (a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime(),
      );
  }
}

// Singleton for convenience
export const subscriptionRepository = new SubscriptionRepository();
