import { create } from 'zustand';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  updatePoints: (pointsToAdd: number) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'u-101',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@velvetbrews.com',
  phone: '+91 98765 43210',
  loyaltyPoints: 340,
  membershipTier: 'Velvet Platinum',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  addresses: ['742 Evergreen Terrace, Sector 18, Cyber City', 'Apartment 4B, Skylark Towers, MG Road']
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  token: 'mock-jwt-token-12345',

  login: (user, token) => set({ user, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),

  updatePoints: (pointsToAdd) => set((state) => {
    if (!state.user) return state;
    return {
      user: {
        ...state.user,
        loyaltyPoints: state.user.loyaltyPoints + pointsToAdd
      }
    };
  })
}));
