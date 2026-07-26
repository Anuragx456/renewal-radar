import type { BillingCycle, CancellationInfo, CancellationWindowStatus } from "@/types";

/**
 * Compute the next occurrence date from a given date based on the billing cycle.
 *
 * Handles month-end edge cases: adding 1 month to Jan 31 yields Feb 28 (or 29 in leap years).
 * The result is a calendar date (time components zeroed).
 */
export function computeNextOccurrence(
  currentDate: Date,
  cycle: BillingCycle,
  customDays: number | null,
): Date {
  const result = new Date(currentDate);
  result.setHours(0, 0, 0, 0);

  switch (cycle) {
    case "weekly":
      result.setDate(result.getDate() + 7);
      break;
    case "monthly":
      result.setMonth(result.getMonth() + 1);
      // Handle month-end rollover: if the day changed, clamp to last day of prev month
      if (result.getDate() !== currentDate.getDate()) {
        result.setDate(0); // goes to last day of previous month
      }
      break;
    case "quarterly":
      result.setMonth(result.getMonth() + 3);
      if (result.getDate() !== currentDate.getDate()) {
        result.setDate(0);
      }
      break;
    case "yearly":
      result.setFullYear(result.getFullYear() + 1);
      if (result.getDate() !== currentDate.getDate()) {
        result.setDate(0);
      }
      break;
    case "custom": {
      const days = customDays ?? 30;
      result.setDate(result.getDate() + days);
      break;
    }
  }

  return result;
}

/**
 * Compute the cancellation deadline: the last day the user can cancel
 * before the next renewal auto-charges.
 */
export function computeCancellationDeadline(nextRenewalDate: Date, noticeDays: number): Date {
  const deadline = new Date(nextRenewalDate);
  deadline.setHours(0, 0, 0, 0);
  deadline.setDate(deadline.getDate() - noticeDays);
  return deadline;
}

/**
 * Determine the cancellation window status for a given deadline.
 *
 * - "open": deadline has already passed (or is today)
 * - "opening-soon": deadline is within 7 days (including today)
 * - "safe": deadline is more than 7 days away
 */
export function getCancellationWindowStatus(deadlineDate: Date): CancellationWindowStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "open";
  }
  if (diffDays <= 7) {
    return "opening-soon";
  }
  return "safe";
}

/**
 * Get full cancellation info including deadline and status.
 */
export function getCancellationInfo(nextRenewalDate: Date, noticeDays: number): CancellationInfo {
  const deadlineDate = computeCancellationDeadline(nextRenewalDate, noticeDays);
  const status = getCancellationWindowStatus(deadlineDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - today.getTime();
  const daysUntilDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    deadlineDate: deadlineDate.toISOString(),
    status,
    daysUntilDeadline,
  };
}

/**
 * Normalize an amount to its monthly equivalent based on billing cycle.
 */
export function normalizeToMonthly(
  amount: number,
  cycle: BillingCycle,
  customDays: number | null,
): number {
  switch (cycle) {
    case "weekly":
      return (amount * 52) / 12;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    case "custom": {
      const days = customDays ?? 30;
      return (amount * days) / 30;
    }
  }
}

/**
 * Normalize an amount to its yearly equivalent based on billing cycle.
 */
export function normalizeToYearly(
  amount: number,
  cycle: BillingCycle,
  customDays: number | null,
): number {
  return normalizeToMonthly(amount, cycle, customDays) * 12;
}

/**
 * Format a date to ISO date string (YYYY-MM-DD).
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parse an ISO date string (YYYY-MM-DD or full ISO) into a Date at midnight UTC.
 */
export function fromISODate(isoString: string): Date {
  // If the string is just "YYYY-MM-DD", parse it as local midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const parts = isoString.split("-").map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if (year === undefined || month === undefined || day === undefined) {
      return new Date(isoString);
    }
    return new Date(year, month - 1, day);
  }
  return new Date(isoString);
}
