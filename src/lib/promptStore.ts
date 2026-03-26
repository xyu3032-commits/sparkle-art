import { create } from 'zustand';

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface PromptState {
  prompts: PromptTemplate[];
  categories: string[];
  addPrompt: (p: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrompt: (id: string, p: Partial<PromptTemplate>) => void;
  deletePrompt: (id: string) => void;
  addCategory: (cat: string) => void;
  deleteCategory: (cat: string) => void;
}

const defaultCategories = ['写作', '编程', '翻译', '营销', '教育', '创意'];

const defaultPrompts: PromptTemplate[] = [
  {
    id: 'dp-1', title: '文章改写', description: '将文章改写为不同风格',
    content: '请将以下文章改写为{{style}}风格，保持核心意思不变：\n\n{{content}}',
    category: '写作', tags: ['改写', '风格'], createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'dp-2', title: '代码审查', description: '审查代码并提供改进建议',
    content: '请审查以下{{language}}代码，指出潜在问题并提供优化建议：\n\n```{{language}}\n{{code}}\n```',
    category: '编程', tags: ['代码', '审查'], createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'dp-3', title: '多语言翻译', description: '将文本翻译为目标语言',
    content: '请将以下文本翻译为{{targetLanguage}}，保持原文的语气和风格：\n\n{{text}}',
    category: '翻译', tags: ['翻译', '多语言'], createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'dp-4', title: '营销文案', description: '生成产品营销文案',
    content: '为{{product}}生成一段{{tone}}风格的营销文案，目标受众为{{audience}}，突出以下卖点：{{features}}',
    category: '营销', tags: ['文案', '营销'], createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'dp-5', title: '知识讲解', description: '用简单的方式解释复杂概念',
    content: '请用{{level}}能理解的方式解释{{concept}}，并给出{{count}}个生动的例子。',
    category: '教育', tags: ['讲解', '教育'], createdAt: Date.now(), updatedAt: Date.now(),
  },
  {
    id: 'dp-6', title: '故事创作', description: '根据设定生成创意故事',
    content: '请创作一个{{genre}}类型的短篇故事，主角是{{character}}，故事发生在{{setting}}，核心冲突是{{conflict}}。',
    category: '创意', tags: ['故事', '创作'], createdAt: Date.now(), updatedAt: Date.now(),
  },
];

const loadPrompts = (): PromptTemplate[] => {
  try {
    const saved = localStorage.getItem('ai-prompt-templates');
    if (saved) return JSON.parse(saved);
    return defaultPrompts;
  } catch { return defaultPrompts; }
};

const loadCategories = (): string[] => {
  try {
    const saved = localStorage.getItem('ai-prompt-categories');
    if (saved) return JSON.parse(saved);
    return defaultCategories;
  } catch { return defaultCategories; }
};

const save = (prompts: PromptTemplate[], categories: string[]) => {
  localStorage.setItem('ai-prompt-templates', JSON.stringify(prompts));
  localStorage.setItem('ai-prompt-categories', JSON.stringify(categories));
};

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: loadPrompts(),
  categories: loadCategories(),

  addPrompt: (p) => {
    const prompt: PromptTemplate = {
      ...p,
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const prompts = [prompt, ...state.prompts];
      save(prompts, state.categories);
      return { prompts };
    });
  },

  updatePrompt: (id, updates) => {
    set((state) => {
      const prompts = state.prompts.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      );
      save(prompts, state.categories);
      return { prompts };
    });
  },

  deletePrompt: (id) => {
    set((state) => {
      const prompts = state.prompts.filter((p) => p.id !== id);
      save(prompts, state.categories);
      return { prompts };
    });
  },

  addCategory: (cat) => {
    set((state) => {
      if (state.categories.includes(cat)) return state;
      const categories = [...state.categories, cat];
      save(state.prompts, categories);
      return { categories };
    });
  },

  deleteCategory: (cat) => {
    set((state) => {
      const categories = state.categories.filter((c) => c !== cat);
      save(state.prompts, categories);
      return { categories };
    });
  },
}));
