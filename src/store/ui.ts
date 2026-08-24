import { create } from 'zustand';
export interface Toast { id: number; message: string; kind?: 'success' | 'error' | 'info' | 'warning'; action?: { label: string; href: string } }
interface UIState { toasts: Toast[]; toast: (t: Omit<Toast, 'id'>) => void; dismissToast: (id: number) => void; sidebarOpen: boolean; setSidebar: (o: boolean) => void }
let n = 0;
export const useUI = create<UIState>()((set) => ({
  toasts: [],
  toast: (t) => { const id = ++n; set({ toasts: [{ ...t, id }] }); setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4000); },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  sidebarOpen: false,
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
}));
