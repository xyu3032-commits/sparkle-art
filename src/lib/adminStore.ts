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
  memberStyle?: string;
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
  weight: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  createdAt: number;
}

interface AdminState {
  isAdminLoggedIn: boolean;
  users: ManagedUser[];
  vouchers: Voucher[];
  modelConfigs: ModelConfig[];
  notices: Notice[];
  glassEffect: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  addUser: (user: Omit<ManagedUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<ManagedUser>) => void;
  deleteUser: (id: string) => void;
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  generateVouchers: (batch: string, type: 'quota' | 'days', value: number, count: number, expiresInDays: number) => Voucher[];
  redeemVoucher: (code: string, userId: string) => { success: boolean; message: string };
  setModelConfig: (toolId: string, updates: Partial<ModelConfig>) => void;
  addNotice: (title: string, content: string) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  setGlassEffect: (enabled: boolean) => void;
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
const savedNotices = JSON.parse(localStorage.getItem('admin-notices') || '[]');
const savedGlass = localStorage.getItem('admin-glass-effect') === 'true';

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdminLoggedIn: localStorage.getItem('admin-logged-in') === 'true',
  users: savedUsers,
  vouchers: savedVouchers,
  modelConfigs: savedModelConfigs || defaultModelConfigs,
  notices: savedNotices,
  glassEffect: savedGlass,

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

  deleteUser: (id) => set((state) => {
    const users = state.users.filter(u => u.id !== id);
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
    const existingCodes = new Set(get().vouchers.map(v => v.code));
    for (let i = 0; i < count; i++) {
      let code = generateCode();
      while (existingCodes.has(code)) code = generateCode();
      existingCodes.add(code);
      newVouchers.push({
        id: crypto.randomUUID(),
        code,
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
    const normalizedCode = code.toUpperCase().trim().replace(/\s+/g, '');
    const voucher = state.vouchers.find(v => v.code === normalizedCode);
    if (!voucher) return { success: false, message: 'invalidCode' };
    if (voucher.used) return { success: false, message: 'codeUsed' };
    if (Date.now() > voucher.expiresAt) return { success: false, message: 'codeExpired' };

    const vouchers = state.vouchers.map(v =>
      v.id === voucher.id ? { ...v, used: true, usedBy: userId } : v
    );
    localStorage.setItem('admin-vouchers', JSON.stringify(vouchers));
    set({ vouchers });

    // Apply voucher effect to localStorage for user
    if (voucher.type === 'quota') {
      const current = parseInt(localStorage.getItem('ai-user-quota') || '100');
      localStorage.setItem('ai-user-quota', String(current + voucher.value));
    } else if (voucher.type === 'days') {
      const exp = new Date();
      exp.setDate(exp.getDate() + voucher.value);
      localStorage.setItem('ai-user-expiry', exp.toISOString());
      localStorage.setItem('ai-user-level', 'pro');
    }

    return { success: true, message: `redeemed:${voucher.type}:${voucher.value}` };
  },

  setModelConfig: (toolId, updates) => set((state) => {
    const configs = state.modelConfigs.map(c =>
      c.toolId === toolId ? { ...c, ...updates } : c
    );
    localStorage.setItem('admin-model-configs', JSON.stringify(configs));
    return { modelConfigs: configs };
  }),

  addNotice: (title, content) => set((state) => {
    const notice: Notice = { id: crypto.randomUUID(), title, content, enabled: true, createdAt: Date.now() };
    const notices = [notice, ...state.notices];
    localStorage.setItem('admin-notices', JSON.stringify(notices));
    return { notices };
  }),

  updateNotice: (id, updates) => set((state) => {
    const notices = state.notices.map(n => n.id === id ? { ...n, ...updates } : n);
    localStorage.setItem('admin-notices', JSON.stringify(notices));
    return { notices };
  }),

  deleteNotice: (id) => set((state) => {
    const notices = state.notices.filter(n => n.id !== id);
    localStorage.setItem('admin-notices', JSON.stringify(notices));
    return { notices };
  }),

  setGlassEffect: (enabled) => {
    localStorage.setItem('admin-glass-effect', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('glass-mode');
    } else {
      document.documentElement.classList.remove('glass-mode');
    }
    set({ glassEffect: enabled });
  },

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
