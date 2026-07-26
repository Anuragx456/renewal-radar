import { subscriptionRepository } from "./repository";
import { resetDatabase } from "./database";

interface SeedItem {
  name: string;
  provider: string;
  amount: number;
  currency: string;
  category:
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
  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
  customCycleDays: number | null;
  nextRenewalDate: string;
  cancellationNoticeDays: number;
  notes: string | null;
  url: string | null;
  isCanceled: boolean;
  canceledAt: string | null;
}

const SEED_DATA: SeedItem[] = [
  {
    name: "Netflix Premium",
    provider: "Netflix",
    amount: 649,
    currency: "INR",
    category: "streaming",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-08-15",
    cancellationNoticeDays: 0,
    notes: "4K UHD plan, shared with family",
    url: "https://netflix.com",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Spotify Family",
    provider: "Spotify",
    amount: 179,
    currency: "INR",
    category: "music",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-08-03",
    cancellationNoticeDays: 0,
    notes: "Family plan with 6 accounts",
    url: "https://spotify.com",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "iCloud+ 2TB",
    provider: "Apple",
    amount: 749,
    currency: "INR",
    category: "cloud",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-07-28",
    cancellationNoticeDays: 0,
    notes: "2TB storage plan",
    url: null,
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Cult.fit Elite",
    provider: "Cult.fit",
    amount: 2499,
    currency: "INR",
    category: "fitness",
    billingCycle: "yearly",
    customCycleDays: null,
    nextRenewalDate: "2026-09-01",
    cancellationNoticeDays: 14,
    notes: "Yearly elite membership, cancels on Aug 18",
    url: "https://cult.fit",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Term Life Insurance",
    provider: "HDFC Life",
    amount: 11899,
    currency: "INR",
    category: "insurance",
    billingCycle: "yearly",
    customCycleDays: null,
    nextRenewalDate: "2026-11-15",
    cancellationNoticeDays: 30,
    notes: "Term plan, premium due annually",
    url: null,
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Apartment Rent",
    provider: "Prestige Group",
    amount: 32000,
    currency: "INR",
    category: "rent",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-08-01",
    cancellationNoticeDays: 60,
    notes: "2 BHK in Whitefield, rent agreement ends Dec 2026",
    url: null,
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Jio Postpaid Plus",
    provider: "Reliance Jio",
    amount: 699,
    currency: "INR",
    category: "phone",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-08-05",
    cancellationNoticeDays: 0,
    notes: "Postpaid family plan with 100GB data",
    url: "https://jio.com",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "GitHub Pro",
    provider: "GitHub",
    amount: 4,
    currency: "USD",
    category: "saas",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-08-10",
    cancellationNoticeDays: 0,
    notes: "Personal pro account for private repos",
    url: "https://github.com",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Amazon Prime",
    provider: "Amazon",
    amount: 1499,
    currency: "INR",
    category: "membership",
    billingCycle: "yearly",
    customCycleDays: null,
    nextRenewalDate: "2027-01-15",
    cancellationNoticeDays: 0,
    notes: "Prime video + shopping benefits",
    url: "https://amazon.in",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "The Hindu ePaper",
    provider: "The Hindu",
    amount: 199,
    currency: "INR",
    category: "news",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-07-27",
    cancellationNoticeDays: 0,
    notes: "Digital subscription for ePaper access",
    url: "https://thehindu.com",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Disney+ Hotstar",
    provider: "Disney",
    amount: 1499,
    currency: "INR",
    category: "streaming",
    billingCycle: "yearly",
    customCycleDays: null,
    nextRenewalDate: "2026-12-01",
    cancellationNoticeDays: 0,
    notes: "Super plan with live sports",
    url: "https://hotstar.com",
    isCanceled: true,
    canceledAt: "2026-06-15T10:00:00.000Z",
  },
  {
    name: "Notion Plus",
    provider: "Notion",
    amount: 10,
    currency: "USD",
    category: "saas",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-07-20",
    cancellationNoticeDays: 0,
    notes: null,
    url: "https://notion.so",
    isCanceled: true,
    canceledAt: "2026-07-10T08:00:00.000Z",
  },
  {
    name: "YouTube Premium",
    provider: "Google",
    amount: 129,
    currency: "INR",
    category: "music",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-07-30",
    cancellationNoticeDays: 0,
    notes: "Includes YouTube Music Premium",
    url: "https://youtube.com",
    isCanceled: false,
    canceledAt: null,
  },
  {
    name: "Electricity Bill",
    provider: "BESCOM",
    amount: 1850,
    currency: "INR",
    category: "utilities",
    billingCycle: "monthly",
    customCycleDays: null,
    nextRenewalDate: "2026-08-07",
    cancellationNoticeDays: 7,
    notes: "Average monthly bill, varies by usage",
    url: null,
    isCanceled: false,
    canceledAt: null,
  },
];

/**
 * Seed the database with realistic sample data.
 * Call this from a dev-only screen or during app initialization in dev mode.
 */
export async function seedDatabase(): Promise<void> {
  for (const item of SEED_DATA) {
    await subscriptionRepository.create({
      ...item,
      id: crypto.randomUUID(),
    });
  }
}

/**
 * Reset and re-seed the database.
 */
export async function resetAndSeed(): Promise<void> {
  await resetDatabase();
  await seedDatabase();
}
