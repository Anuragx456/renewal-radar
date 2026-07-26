export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type SubscriptionCategory =
  | "streaming"
  | "music"
  | "cloud"
  | "software"
  | "fitness"
  | "insurance"
  | "finance"
  | "utilities"
  | "phone"
  | "rent"
  | "saas"
  | "membership"
  | "news"
  | "other";

export interface SubscriptionItem {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  category: SubscriptionCategory;
  billingCycle: BillingCycle;
  customCycleDays: number | null;
  nextRenewalDate: string; // ISO date string
  cancellationNoticeDays: number;
  notes: string | null;
  url: string | null;
  isCanceled: boolean;
  canceledAt: string | null; // ISO date string when marked canceled
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type CancellationWindowStatus = "open" | "opening-soon" | "safe";

export interface CancellationInfo {
  deadlineDate: string; // ISO date string
  status: CancellationWindowStatus;
  daysUntilDeadline: number;
}

export interface SpendSummary {
  monthlyTotal: number;
  yearlyTotal: number;
  byCategory: Record<SubscriptionCategory, { monthly: number; yearly: number }>;
}

export interface NotificationLeadTimes {
  cancellationWindow: number; // days before deadline
  preRenewal: number; // days before renewal
}
