import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Tag, X, BookOpen, Trash2, Edit3, Copy, ChevronRight, Sparkles, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePromptStore, PromptTemplate } from '@/lib/promptStore';
import { toast } from 'sonner';

// Extract {{variable}} from content
const extractVariables = (content: string): string[] => {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(2, -2)))];
};

const PromptLibrary: React.FC = () => {
  const { t } = useTranslation();
  const { prompts, categories, addPrompt, updatePrompt, deletePrompt } = usePromptStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchCat = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [prompts, search, selectedCategory]);

  const openPrompt = (p: PromptTemplate) => {
    setSelectedPrompt(p);
    setEditMode(false);
    setVariableValues({});
  };

  const startEdit = (p: PromptTemplate) => {
    setEditTitle(p.title);
    setEditDesc(p.description);
    setEditContent(p.content);
    setEditCategory(p.category);
    setEditTags(p.tags.join(', '));
    setEditMode(true);
  };

  const saveEdit = () => {
    if (!selectedPrompt) return;
    updatePrompt(selectedPrompt.id, {
      title: editTitle,
      description: editDesc,
      content: editContent,
      category: editCategory,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setSelectedPrompt({ ...selectedPrompt, title: editTitle, description: editDesc, content: editContent, category: editCategory, tags: editTags.split(',').map((t) => t.trim()).filter(Boolean) });
    setEditMode(false);
    toast.success(t('profileSaved'));
  };

  const handleCreate = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    addPrompt({
      title: editTitle,
      description: editDesc,
      content: editContent,
      category: editCategory || categories[0] || '',
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setShowCreate(false);
    setEditTitle(''); setEditDesc(''); setEditContent(''); setEditCategory(''); setEditTags('');
    toast.success(t('genSuccess'));
  };

  const copyWithVariables = () => {
    if (!selectedPrompt) return;
    let result = selectedPrompt.content;
    Object.entries(variableValues).forEach(([key, val]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`);
    });
    navigator.clipboard.writeText(result);
    toast.success(t('downloadSuccess'));
  };

  const variables = selectedPrompt ? extractVariables(selectedPrompt.content) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <h2 className="font-semibold text-card-foreground text-sm truncate">{t('promptLibrary')}</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowCreate(true); setEditTitle(''); setEditDesc(''); setEditContent(''); setEditCategory(categories[0] || ''); setEditTags(''); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('addPrompt')}</span>
        </motion.button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Card Grid */}
        <div className={`flex-1 flex flex-col overflow-hidden min-w-0 ${selectedPrompt ? 'hidden sm:flex' : 'flex'}`}>
          {/* Search */}
          <div className="px-3 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPrompts')}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-thin border-b border-border">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                !selectedCategory ? 'gradient-bg text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-secondary-foreground'
              }`}
            >
              {t('allCategories')}
            </motion.button>
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'gradient-bg text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-secondary-foreground'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Card Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FolderOpen className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">{t('noResult')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <AnimatePresence>
                  {filtered.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => openPrompt(p)}
                      className="group cursor-pointer p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-card-foreground truncate flex-1">{p.title}</h3>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">{p.category}</span>
                        {p.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {extractVariables(p.content).length > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-accent flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            {extractVariables(p.content).length}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview/Edit Pane */}
        <AnimatePresence>
          {selectedPrompt && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-80 lg:w-96 border-l border-border flex flex-col bg-card overflow-hidden"
            >
              {/* Pane Header */}
              <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-card-foreground truncate">
                  {editMode ? t('editPrompt') : selectedPrompt.title}
                </h3>
                <div className="flex items-center gap-1">
                  {!editMode && (
                    <>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => startEdit(selectedPrompt)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={copyWithVariables}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => { deletePrompt(selectedPrompt.id); setSelectedPrompt(null); toast.success(t('downloadSuccess')); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </motion.button>
                    </>
                  )}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setSelectedPrompt(null); setEditMode(false); }}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Pane Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
                {editMode ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('promptTitle')}</label>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('promptDesc')}</label>
                      <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('promptContent')}</label>
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6}
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('apiTool')}</label>
                      <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none">
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        <Tag className="w-3 h-3 inline mr-1" />{t('tags')}
                      </label>
                      <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="tag1, tag2"
                        className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={saveEdit}
                        className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">{t('saveProfile')}</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditMode(false)}
                        className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground">{t('cancel')}</motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">{selectedPrompt.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary">{selectedPrompt.category}</span>
                      {selectedPrompt.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] bg-secondary text-muted-foreground">{tag}</span>
                      ))}
                    </div>

                    {/* Content Preview */}
                    <div className="p-3 rounded-xl bg-secondary/60 border border-border">
                      <pre className="text-xs text-card-foreground whitespace-pre-wrap font-mono leading-relaxed">{selectedPrompt.content}</pre>
                    </div>

                    {/* Variable Inputs */}
                    {variables.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-card-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-accent" /> {t('variables')}
                        </p>
                        {variables.map((v) => (
                          <div key={v}>
                            <label className="text-[10px] text-muted-foreground mb-0.5 block font-mono">{`{{${v}}}`}</label>
                            <input
                              value={variableValues[v] || ''}
                              onChange={(e) => setVariableValues((prev) => ({ ...prev, [v]: e.target.value }))}
                              placeholder={v}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-secondary text-xs border border-border focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                          </div>
                        ))}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={copyWithVariables}
                          className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3 h-3" /> {t('copyPrompt')}
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[8%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-card border border-border rounded-2xl z-50 max-h-[84vh] overflow-y-auto scrollbar-thin"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-card-foreground text-sm">{t('addPrompt')}</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('promptTitle')}</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('promptDesc')}</label>
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('promptContent')}</label>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={5}
                    placeholder="使用 {{variable}} 语法添加变量..."
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('category')}</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('tags')}</label>
                    <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="tag1, tag2"
                      className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCreate} disabled={!editTitle.trim() || !editContent.trim()}
                  className="w-full py-2.5 rounded-xl gradient-bg text-primary-foreground text-sm font-medium disabled:opacity-40">{t('addPrompt')}</motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptLibrary;
