import { create } from 'zustand';

interface UserInfo {
  email: string;
  username: string;
  isGuest: boolean;
}

interface UsageStats {
  [key: string]: number;
}

interface AppState {
  deviceMode: 'desktop' | 'mobile' | null;
  theme: 'light' | 'dark';
  language: string;
  backgroundUrl: string;
  currentTool: string;
  settingsOpen: boolean;
  userCenterOpen: boolean;
  usageStats: UsageStats;
  user: UserInfo | null;
  setDeviceMode: (mode: 'desktop' | 'mobile') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  setBackgroundUrl: (url: string) => void;
  setCurrentTool: (tool: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setUserCenterOpen: (open: boolean) => void;
  trackUsage: (tool: string) => void;
  setAuth: (user: UserInfo | null) => void;
  logout: () => void;
}

const savedUser = localStorage.getItem('ai-user');

export const useAppStore = create<AppState>((set) => ({
  deviceMode: localStorage.getItem('ai-device-mode') as 'desktop' | 'mobile' | null,
  theme: (localStorage.getItem('ai-theme') as 'light' | 'dark') || 'light',
  language: localStorage.getItem('ai-platform-lang') || 'zh',
  backgroundUrl: localStorage.getItem('ai-bg-url') || '',
  currentTool: 'textGen',
  settingsOpen: false,
  userCenterOpen: false,
  usageStats: JSON.parse(localStorage.getItem('ai-usage-stats') || '{}'),
  user: savedUser ? JSON.parse(savedUser) : null,
  setDeviceMode: (mode) => {
    localStorage.setItem('ai-device-mode', mode);
    set({ deviceMode: mode });
  },
  setTheme: (theme) => {
    localStorage.setItem('ai-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
  setLanguage: (lang) => {
    localStorage.setItem('ai-platform-lang', lang);
    set({ language: lang });
  },
  setBackgroundUrl: (url) => {
    localStorage.setItem('ai-bg-url', url);
    set({ backgroundUrl: url });
  },
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setUserCenterOpen: (open) => set({ userCenterOpen: open }),
  trackUsage: (tool) => set((state) => {
    const stats = { ...state.usageStats, [tool]: (state.usageStats[tool] || 0) + 1 };
    localStorage.setItem('ai-usage-stats', JSON.stringify(stats));
    return { usageStats: stats };
  }),
  setAuth: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('ai-user');
    set({ user: null });
  },
}));
