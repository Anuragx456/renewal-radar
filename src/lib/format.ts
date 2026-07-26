/**
 * Format a number as currency.
 * By default uses INR formatting. Falls back gracefully for unknown currencies.
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    const locale = currency === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for unknown/uncommon currencies
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
}

/**
 * Format a relative date string like "in 3 days", "today", "tomorrow", "2 weeks from now".
 */
export function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(dateStr);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`;
  }
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  if (diffDays < 7) {
    return `In ${diffDays} days`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `In ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `In ${months} ${months === 1 ? "month" : "months"}`;
  }
  const years = Math.floor(diffDays / 365);
  return `In ${years} ${years === 1 ? "year" : "years"}`;
}

/**
 * Get status label and color for cancellation window status.
 */
export function getCancellationLabel(status: "open" | "opening-soon" | "safe"): {
  label: string;
  color: string;
} {
  switch (status) {
    case "open":
      return { label: "Action needed", color: "#E53935" };
    case "opening-soon":
      return { label: "Closing soon", color: "#FB8C00" };
    case "safe":
      return { label: "Safe", color: "#43A047" };
  }
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get a human-readable label for a category.
 */
export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    streaming: "Streaming",
    music: "Music",
    cloud: "Cloud Storage",
    software: "Software",
    fitness: "Fitness",
    insurance: "Insurance",
    finance: "Finance",
    utilities: "Utilities",
    phone: "Phone",
    rent: "Rent",
    saas: "SaaS",
    membership: "Membership",
    news: "News",
    other: "Other",
  };
  return labels[category] ?? category;
}
