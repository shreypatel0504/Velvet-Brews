import { create } from 'zustand';

interface LoyaltyState {
  coins: number;
  isRedeeming: boolean;
  addCoins: (amountSpent: number) => void;
  toggleRedeem: () => void;
  resetRedeem: () => void;
}

export const useLoyaltyStore = create<LoyaltyState>((set) => ({
  coins: 150, // Initial welcome bonus coins for testing
  isRedeeming: false,

  addCoins: (amountSpent) => {
    const earned = Math.floor(amountSpent * 0.1); // 10% cashpoints
    set((state) => ({ coins: state.coins + earned }));
  },

  toggleRedeem: () => set((state) => ({ isRedeeming: !state.isRedeeming })),
  resetRedeem: () => set({ isRedeeming: false })
}));
