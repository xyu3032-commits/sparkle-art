import { create } from 'zustand';

export interface ManagedUser {
  id: string;
  email: string;
  username: string;
  level: 'guest' | 'free' | 'pro' | 'lifetime';
  quota: number;
  usedQuota: number;
  banned: boolean;
  createdAt: number;
  expiresAt: number | null;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'quota' | 'days';
  value: number;
  batch: string;
  used: boolean;
  usedBy: string | null;
  createdAt: number;
  expiresAt: number;
}

export interface ModelConfig {
  toolId: string;
  enabled: boolean;
  weight: number; // consumption weight per use
}

interface AdminState {
  isAdminLoggedIn: boolean;
  users: ManagedUser[];
  vouchers: Voucher[];
  modelConfigs: ModelConfig[];
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  addUser: (user: Omit<ManagedUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<ManagedUser>) => void;
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  generateVouchers: (batch: string, type: 'quota' | 'days', value: number, count: number, expiresInDays: number) => Voucher[];
  redeemVoucher: (code: string, userId: string) => { success: boolean; message: string };
  setModelConfig: (toolId: string, updates: Partial<ModelConfig>) => void;
  getStats: () => { totalUsers: number; totalGenerations: number; todayActive: number };
}

const ADMIN_PASSWORD = 'admin888';

const defaultModelConfigs: ModelConfig[] = [
  { toolId: 'textGen', enabled: true, weight: 1 },
  { toolId: 'imageGen', enabled: true, weight: 2 },
  { toolId: 'textToVideo', enabled: true, weight: 5 },
  { toolId: 'imageToVideo', enabled: true, weight: 5 },
  { toolId: 'audioGen', enabled: true, weight: 3 },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AI-';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const savedUsers = JSON.parse(localStorage.getItem('admin-users') || '[]');
const savedVouchers = JSON.parse(localStorage.getItem('admin-vouchers') || '[]');
const savedModelConfigs = JSON.parse(localStorage.getItem('admin-model-configs') || 'null');

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdminLoggedIn: localStorage.getItem('admin-logged-in') === 'true',
  users: savedUsers,
  vouchers: savedVouchers,
  modelConfigs: savedModelConfigs || defaultModelConfigs,

  adminLogin: (password) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin-logged-in', 'true');
      set({ isAdminLoggedIn: true });
      return true;
    }
    return false;
  },

  adminLogout: () => {
    localStorage.removeItem('admin-logged-in');
    set({ isAdminLoggedIn: false });
  },

  addUser: (user) => set((state) => {
    const newUser: ManagedUser = { ...user, id: crypto.randomUUID(), createdAt: Date.now() };
    const users = [...state.users, newUser];
    localStorage.setItem('admin-users', JSON.stringify(users));
    return { users };
  }),

  updateUser: (id, updates) => set((state) => {
    const users = state.users.map(u => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem('admin-users', JSON.stringify(users));
    return { users };
  }),

  banUser: (id) => set((state) => {
    const users = state.users.map(u => u.id === id ? { ...u, banned: true } : u);
    localStorage.setItem('admin-users', JSON.stringify(users));
    return { users };
  }),

  unbanUser: (id) => set((state) => {
    const users = state.users.map(u => u.id === id ? { ...u, banned: false } : u);
    localStorage.setItem('admin-users', JSON.stringify(users));
    return { users };
  }),

  generateVouchers: (batch, type, value, count, expiresInDays) => {
    const newVouchers: Voucher[] = [];
    for (let i = 0; i < count; i++) {
      newVouchers.push({
        id: crypto.randomUUID(),
        code: generateCode(),
        type,
        value,
        batch,
        used: false,
        usedBy: null,
        createdAt: Date.now(),
        expiresAt: Date.now() + expiresInDays * 86400000,
      });
    }
    set((state) => {
      const vouchers = [...state.vouchers, ...newVouchers];
      localStorage.setItem('admin-vouchers', JSON.stringify(vouchers));
      return { vouchers };
    });
    return newVouchers;
  },

  redeemVoucher: (code, userId) => {
    const state = get();
    const voucher = state.vouchers.find(v => v.code === code.toUpperCase().trim());
    if (!voucher) return { success: false, message: 'invalidCode' };
    if (voucher.used) return { success: false, message: 'codeUsed' };
    if (Date.now() > voucher.expiresAt) return { success: false, message: 'codeExpired' };

    const vouchers = state.vouchers.map(v =>
      v.id === voucher.id ? { ...v, used: true, usedBy: userId } : v
    );
    localStorage.setItem('admin-vouchers', JSON.stringify(vouchers));
    set({ vouchers });

    return { success: true, message: `redeemed:${voucher.type}:${voucher.value}` };
  },

  setModelConfig: (toolId, updates) => set((state) => {
    const configs = state.modelConfigs.map(c =>
      c.toolId === toolId ? { ...c, ...updates } : c
    );
    localStorage.setItem('admin-model-configs', JSON.stringify(configs));
    return { modelConfigs: configs };
  }),

  getStats: () => {
    const state = get();
    const allStats = JSON.parse(localStorage.getItem('ai-usage-stats') || '{}');
    const totalGenerations = Object.values(allStats as Record<string, number>).reduce((a, b) => a + b, 0);
    return {
      totalUsers: state.users.length,
      totalGenerations,
      todayActive: state.users.filter(u => !u.banned).length,
    };
  },
}));
