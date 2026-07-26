import { create } from "zustand";
import type { SubscriptionItem } from "@/types";
import { subscriptionRepository } from "@/data/repository";

interface DashboardState {
  activeItems: SubscriptionItem[];
  actionNeeded: SubscriptionItem[];
  upcomingRenewals: SubscriptionItem[];
  monthlyTotal: number;
  yearlyTotal: number;
  isLoading: boolean;
  error: string | null;

  loadData: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeItems: [],
  actionNeeded: [],
  upcomingRenewals: [],
  monthlyTotal: 0,
  yearlyTotal: 0,
  isLoading: true,
  error: null,

  loadData: async () => {
    try {
      set({ isLoading: true, error: null });

      const [activeItems, actionNeeded, upcomingRenewals, spendSummary] = await Promise.all([
        subscriptionRepository.getAll(false),
        subscriptionRepository.getActionNeeded(),
        subscriptionRepository.getRenewalsWithin60Days(),
        subscriptionRepository.getSpendSummary(),
      ]);

      set({
        activeItems,
        actionNeeded,
        upcomingRenewals,
        monthlyTotal: spendSummary.monthlyTotal,
        yearlyTotal: spendSummary.yearlyTotal,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load dashboard data",
      });
    }
  },

  refresh: async () => {
    await get().loadData();
  },
}));
