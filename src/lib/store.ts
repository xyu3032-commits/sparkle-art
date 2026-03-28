import { create } from 'zustand';

interface UserInfo {
  email: string;
  username: string;
  isGuest: boolean;
}

interface UsageStats {
  [key: string]: number;
}

interface ApiConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  toolId: string;
}

type ThemePreset = 'alpine' | 'midnight' | 'nebula' | 'parchment';

interface AppState {
  deviceMode: 'desktop' | 'mobile' | null;
  theme: 'light' | 'dark';
  themePreset: ThemePreset;
  language: string;
  backgroundUrl: string;
  currentTool: string;
  settingsOpen: boolean;
  userCenterOpen: boolean;
  usageStats: UsageStats;
  user: UserInfo | null;
  customApis: ApiConfig[];
  activeApis: Record<string, string>;
  setDeviceMode: (mode: 'desktop' | 'mobile') => void;
  resetDeviceMode: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemePreset: (preset: ThemePreset) => void;
  setLanguage: (lang: string) => void;
  setBackgroundUrl: (url: string) => void;
  setCurrentTool: (tool: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setUserCenterOpen: (open: boolean) => void;
  trackUsage: (tool: string) => void;
  setAuth: (user: UserInfo | null) => void;
  logout: () => void;
  addCustomApi: (api: ApiConfig) => void;
  removeCustomApi: (id: string) => void;
  setActiveApi: (toolId: string, apiId: string) => void;
  getActiveApiForTool: (toolId: string) => ApiConfig | undefined;
}

const savedUser = localStorage.getItem('ai-user');
const savedApis = JSON.parse(localStorage.getItem('ai-custom-apis') || '[]');
const savedActiveApis = JSON.parse(localStorage.getItem('ai-active-apis') || '{}');

// Default built-in APIs
const defaultApis: ApiConfig[] = [
  {
    id: 'default-text',
    name: 'SiliconFlow Qwen',
    baseUrl: 'https://api.siliconflow.cn/v1',
    apiKey: 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    toolId: 'textGen',
  },
  {
    id: 'default-image',
    name: 'SiliconFlow Kolors',
    baseUrl: 'https://api.siliconflow.cn/v1',
    apiKey: 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok',
    model: 'Kwai-Kolors/Kolors',
    toolId: 'imageGen',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  deviceMode: localStorage.getItem('ai-device-mode') as 'desktop' | 'mobile' | null,
  theme: (localStorage.getItem('ai-theme') as 'light' | 'dark') || 'light',
  language: localStorage.getItem('ai-platform-lang') || 'zh',
  backgroundUrl: localStorage.getItem('ai-bg-url') || '',
  currentTool: 'textGen',
  settingsOpen: false,
  userCenterOpen: false,
  usageStats: JSON.parse(localStorage.getItem('ai-usage-stats') || '{}'),
  user: savedUser ? JSON.parse(savedUser) : null,
  customApis: savedApis,
  activeApis: savedActiveApis,
  setDeviceMode: (mode) => {
    localStorage.setItem('ai-device-mode', mode);
    set({ deviceMode: mode });
  },
  resetDeviceMode: () => {
    localStorage.removeItem('ai-device-mode');
    set({ deviceMode: null });
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
  addCustomApi: (api) => set((state) => {
    const apis = [...state.customApis, api];
    localStorage.setItem('ai-custom-apis', JSON.stringify(apis));
    return { customApis: apis };
  }),
  removeCustomApi: (id) => set((state) => {
    const apis = state.customApis.filter((a) => a.id !== id);
    localStorage.setItem('ai-custom-apis', JSON.stringify(apis));
    // Also clean activeApis
    const active = { ...state.activeApis };
    for (const key of Object.keys(active)) {
      if (active[key] === id) delete active[key];
    }
    localStorage.setItem('ai-active-apis', JSON.stringify(active));
    return { customApis: apis, activeApis: active };
  }),
  setActiveApi: (toolId, apiId) => set((state) => {
    const active = { ...state.activeApis, [toolId]: apiId };
    localStorage.setItem('ai-active-apis', JSON.stringify(active));
    return { activeApis: active };
  }),
  getActiveApiForTool: (toolId) => {
    const state = get();
    const activeId = state.activeApis[toolId];
    const allApis = [...defaultApis, ...state.customApis];
    if (activeId) {
      return allApis.find((a) => a.id === activeId) || allApis.find((a) => a.toolId === toolId);
    }
    return allApis.find((a) => a.toolId === toolId);
  },
}));

export { defaultApis };
export type { ApiConfig };
