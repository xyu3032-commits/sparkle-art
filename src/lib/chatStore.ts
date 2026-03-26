import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  toolId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createSession: (toolId: string) => string;
  deleteSession: (id: string) => void;
  setCurrentSession: (id: string | null) => void;
  updateMessages: (id: string, messages: ChatMessage[]) => void;
  getSessionsForTool: (toolId: string) => ChatSession[];
  getCurrentSession: () => ChatSession | undefined;
}

const loadSessions = (): ChatSession[] => {
  try {
    return JSON.parse(localStorage.getItem('ai-chat-sessions') || '[]');
  } catch { return []; }
};

const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem('ai-chat-sessions', JSON.stringify(sessions));
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: loadSessions(),
  currentSessionId: null,

  createSession: (toolId: string) => {
    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const session: ChatSession = {
      id,
      title: '',
      toolId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const sessions = [session, ...state.sessions];
      saveSessions(sessions);
      return { sessions, currentSessionId: id };
    });
    return id;
  },

  deleteSession: (id: string) => {
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id);
      saveSessions(sessions);
      return {
        sessions,
        currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
      };
    });
  },

  setCurrentSession: (id: string | null) => set({ currentSessionId: id }),

  updateMessages: (id: string, messages: ChatMessage[]) => {
    set((state) => {
      const sessions = state.sessions.map((s) => {
        if (s.id !== id) return s;
        const title = s.title || messages.find((m) => m.role === 'user')?.content.slice(0, 30) || '';
        return { ...s, messages, title, updatedAt: Date.now() };
      });
      saveSessions(sessions);
      return { sessions };
    });
  },

  getSessionsForTool: (toolId: string) => {
    return get().sessions.filter((s) => s.toolId === toolId);
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return sessions.find((s) => s.id === currentSessionId);
  },
}));
