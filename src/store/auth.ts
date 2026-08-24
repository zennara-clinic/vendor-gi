import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vendor } from '@/types';
interface AuthState { vendor: Vendor | null; token: string | null; setSession: (v: Vendor, token: string) => void; setVendor: (v: Vendor) => void; patchVendor: (p: Partial<Vendor>) => void; logout: () => void }
export const useAuth = create<AuthState>()(persist((set) => ({
  vendor: null, token: null,
  setSession: (vendor, token) => set({ vendor, token }),
  setVendor: (vendor) => set({ vendor }),
  patchVendor: (p) => set((s) => ({ vendor: s.vendor ? { ...s.vendor, ...p } : s.vendor })),
  logout: () => set({ vendor: null, token: null }),
}), { name: 'tt.vendor.auth' }));
