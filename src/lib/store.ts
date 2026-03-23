import { create } from 'zustand';

interface AppState {
  deviceMode: 'desktop' | 'mobile' | null;
  theme: 'light' | 'dark';
  language: string;
  backgroundUrl: string;
  currentTool: string;
  settingsOpen: boolean;
  setDeviceMode: (mode: 'desktop' | 'mobile') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  setBackgroundUrl: (url: string) => void;
  setCurrentTool: (tool: string) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  deviceMode: localStorage.getItem('ai-device-mode') as 'desktop' | 'mobile' | null,
  theme: (localStorage.getItem('ai-theme') as 'light' | 'dark') || 'light',
  language: localStorage.getItem('ai-platform-lang') || 'zh',
  backgroundUrl: localStorage.getItem('ai-bg-url') || '',
  currentTool: 'textGen',
  settingsOpen: false,
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
}));
