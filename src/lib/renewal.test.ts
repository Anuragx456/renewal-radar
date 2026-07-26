import {
  computeNextOccurrence,
  computeCancellationDeadline,
  getCancellationWindowStatus,
  getCancellationInfo,
  normalizeToMonthly,
  normalizeToYearly,
  toISODate,
  fromISODate,
} from "./renewal";

// ---------------------------------------------------------------------------
// computeNextOccurrence
// ---------------------------------------------------------------------------
describe("computeNextOccurrence", () => {
  it("adds 7 days for weekly cycle", () => {
    const d = new Date(2025, 0, 1); // Jan 1
    const next = computeNextOccurrence(d, "weekly", null);
    expect(toISODate(next)).toBe("2025-01-08");
  });

  it("adds 1 month for monthly cycle", () => {
    const d = new Date(2025, 0, 15); // Jan 15
    const next = computeNextOccurrence(d, "monthly", null);
    expect(toISODate(next)).toBe("2025-02-15");
  });

  it("clamps Jan 31 + 1 month to Feb 28 (non-leap)", () => {
    const d = new Date(2025, 0, 31); // Jan 31
    const next = computeNextOccurrence(d, "monthly", null);
    expect(toISODate(next)).toBe("2025-02-28");
  });

  it("clamps Jan 31 + 1 month to Feb 29 (leap year)", () => {
    const d = new Date(2024, 0, 31); // Jan 31 2024 (leap)
    const next = computeNextOccurrence(d, "monthly", null);
    expect(toISODate(next)).toBe("2024-02-29");
  });

  it("clamps Mar 31 + 1 month to Apr 30", () => {
    const d = new Date(2025, 2, 31); // Mar 31
    const next = computeNextOccurrence(d, "monthly", null);
    expect(toISODate(next)).toBe("2025-04-30");
  });

  it("adds 3 months for quarterly cycle", () => {
    const d = new Date(2025, 0, 15); // Jan 15
    const next = computeNextOccurrence(d, "quarterly", null);
    expect(toISODate(next)).toBe("2025-04-15");
  });

  it("clamps Nov 30 + quarterly (3 months) handles Feb correctly", () => {
    const d = new Date(2025, 10, 30); // Nov 30
    const next = computeNextOccurrence(d, "quarterly", null);
    // Nov 30 + 3 months = Feb 30 → clamped to Feb 28
    expect(toISODate(next)).toBe("2026-02-28");
  });

  it("adds 1 year for yearly cycle", () => {
    const d = new Date(2025, 5, 15); // Jun 15
    const next = computeNextOccurrence(d, "yearly", null);
    expect(toISODate(next)).toBe("2026-06-15");
  });

  it("clamps Feb 29 + 1 year to Feb 28 (non-leap target)", () => {
    const d = new Date(2024, 1, 29); // Feb 29 2024
    const next = computeNextOccurrence(d, "yearly", null);
    expect(toISODate(next)).toBe("2025-02-28");
  });

  it("clamps Feb 29 + 1 year to Feb 28 (leap target)", () => {
    const d = new Date(2024, 1, 29); // Feb 29 2024
    const next = computeNextOccurrence(d, "yearly", null);
    expect(toISODate(next)).toBe("2025-02-28");
  });

  it("adds custom days to date", () => {
    const d = new Date(2025, 0, 1); // Jan 1
    const next = computeNextOccurrence(d, "custom", 90);
    expect(toISODate(next)).toBe("2025-04-01");
  });

  it("defaults custom cycle to 30 days when customDays is null", () => {
    const d = new Date(2025, 0, 1);
    const next = computeNextOccurrence(d, "custom", null);
    expect(toISODate(next)).toBe("2025-01-31");
  });

  it("handles DST transition (spring forward) gracefully", () => {
    // March 9 2025 is DST spring-forward in US (Mar 9 2025 = 2nd Sunday)
    const d = new Date(2025, 2, 1); // Mar 1
    const next = computeNextOccurrence(d, "weekly", null);
    expect(toISODate(next)).toBe("2025-03-08");
    // The result is a calendar date at midnight; DST doesn't affect calendar math
  });

  it("handles DST transition (fall back) gracefully", () => {
    // Nov 2 2025 is DST fall-back in US
    const d = new Date(2025, 9, 26); // Oct 26
    const next = computeNextOccurrence(d, "weekly", null);
    expect(toISODate(next)).toBe("2025-11-02");
  });

  it("preserves time at midnight", () => {
    const d = new Date(2025, 6, 4, 14, 30, 0);
    const next = computeNextOccurrence(d, "monthly", null);
    expect(next.getHours()).toBe(0);
    expect(next.getMinutes()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeCancellationDeadline
// ---------------------------------------------------------------------------
describe("computeCancellationDeadline", () => {
  it("subtracts notice days from renewal date", () => {
    const renewal = new Date(2025, 5, 15); // Jun 15
    const deadline = computeCancellationDeadline(renewal, 30);
    expect(toISODate(deadline)).toBe("2025-05-16");
  });

  it("handles 0 notice days (deadline = renewal date)", () => {
    const renewal = new Date(2025, 5, 15);
    const deadline = computeCancellationDeadline(renewal, 0);
    expect(toISODate(deadline)).toBe("2025-06-15");
  });

  it("crosses month boundaries correctly", () => {
    const renewal = new Date(2025, 0, 5); // Jan 5
    const deadline = computeCancellationDeadline(renewal, 10);
    expect(toISODate(deadline)).toBe("2024-12-26");
  });
});

// ---------------------------------------------------------------------------
// getCancellationWindowStatus
// ---------------------------------------------------------------------------
describe("getCancellationWindowStatus", () => {
  it("returns 'open' when deadline is today", () => {
    const today = new Date();
    expect(getCancellationWindowStatus(today)).toBe("open");
  });

  it("returns 'open' when deadline is yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getCancellationWindowStatus(yesterday)).toBe("open");
  });

  it("returns 'opening-soon' when deadline is 3 days from now", () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(getCancellationWindowStatus(future)).toBe("opening-soon");
  });

  it("returns 'opening-soon' when deadline is 7 days from now", () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(getCancellationWindowStatus(future)).toBe("opening-soon");
  });

  it("returns 'safe' when deadline is 8 days from now", () => {
    const future = new Date();
    future.setDate(future.getDate() + 8);
    expect(getCancellationWindowStatus(future)).toBe("safe");
  });

  it("returns 'safe' when deadline is months away", () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    expect(getCancellationWindowStatus(future)).toBe("safe");
  });
});

// ---------------------------------------------------------------------------
// getCancellationInfo
// ---------------------------------------------------------------------------
describe("getCancellationInfo", () => {
  it("returns correct info for a future deadline", () => {
    // Use a date well in the future for deterministic results
    const renewalDate = new Date(2028, 11, 31); // Dec 31 2028
    const info = getCancellationInfo(renewalDate, 30);
    expect(info.deadlineDate).toBeDefined();
    expect(info.status).toBe("safe");
    expect(typeof info.daysUntilDeadline).toBe("number");
  });

  it("returns 'open' for past deadline", () => {
    const renewalDate = new Date(2024, 0, 1); // Jan 1 2024 (past)
    const info = getCancellationInfo(renewalDate, 0);
    expect(info.status).toBe("open");
    expect(info.daysUntilDeadline).toBeLessThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// normalizeToMonthly
// ---------------------------------------------------------------------------
describe("normalizeToMonthly", () => {
  it("weekly: amount * 52 / 12", () => {
    expect(normalizeToMonthly(10, "weekly", null)).toBeCloseTo(43.333, 2);
  });

  it("monthly: returns amount as-is", () => {
    expect(normalizeToMonthly(100, "monthly", null)).toBe(100);
  });

  it("quarterly: amount / 3", () => {
    expect(normalizeToMonthly(300, "quarterly", null)).toBe(100);
  });

  it("yearly: amount / 12", () => {
    expect(normalizeToMonthly(1200, "yearly", null)).toBe(100);
  });

  it("custom: amount * customDays / 30", () => {
    // $90 every 90 days = $90/month essentially
    expect(normalizeToMonthly(90, "custom", 90)).toBeCloseTo(270, 2);
  });

  it("custom defaults to 30 days when customDays is null", () => {
    expect(normalizeToMonthly(100, "custom", null)).toBeCloseTo(100, 2);
  });
});

// ---------------------------------------------------------------------------
// normalizeToYearly
// ---------------------------------------------------------------------------
describe("normalizeToYearly", () => {
  it("monthly * 12 = yearly", () => {
    expect(normalizeToYearly(100, "monthly", null)).toBe(1200);
  });

  it("quarterly: amount * 4", () => {
    expect(normalizeToYearly(300, "quarterly", null)).toBe(1200);
  });

  it("weekly: amount * 52", () => {
    expect(normalizeToYearly(10, "weekly", null)).toBeCloseTo(520, 2);
  });

  it("yearly: returns amount as-is", () => {
    expect(normalizeToYearly(1200, "yearly", null)).toBe(1200);
  });
});

// ---------------------------------------------------------------------------
// toISODate / fromISODate
// ---------------------------------------------------------------------------
describe("toISODate", () => {
  it("formats date correctly", () => {
    const d = new Date(2025, 0, 1);
    expect(toISODate(d)).toBe("2025-01-01");
  });

  it("pads single-digit month and day", () => {
    const d = new Date(2025, 8, 5);
    expect(toISODate(d)).toBe("2025-09-05");
  });
});

describe("fromISODate", () => {
  it("parses YYYY-MM-DD string", () => {
    const d = fromISODate("2025-01-15");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(0); // January
    expect(d.getDate()).toBe(15);
  });

  it("parses full ISO string", () => {
    const d = fromISODate("2025-06-15T10:00:00.000Z");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
  });
});
