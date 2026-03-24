import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Key, Link, Cpu, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore, defaultApis, type ApiConfig } from '@/lib/store';

const toolOptions = [
  { id: 'textGen', labelKey: 'textGen' },
  { id: 'imageGen', labelKey: 'imageGen' },
  { id: 'textToVideo', labelKey: 'textToVideo' },
  { id: 'imageToVideo', labelKey: 'imageToVideo' },
  { id: 'audioGen', labelKey: 'audioGen' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const ApiManager: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { customApis, activeApis, addCustomApi, removeCustomApi, setActiveApi } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', baseUrl: '', apiKey: '', model: '', toolId: 'textGen' });

  const allApis = [...defaultApis, ...customApis];

  const handleAdd = () => {
    if (!form.name.trim() || !form.baseUrl.trim() || !form.apiKey.trim()) return;
    const newApi: ApiConfig = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      baseUrl: form.baseUrl.trim(),
      apiKey: form.apiKey.trim(),
      model: form.model.trim() || 'default',
      toolId: form.toolId,
    };
    addCustomApi(newApi);
    setForm({ name: '', baseUrl: '', apiKey: '', model: '', toolId: 'textGen' });
    setShowAdd(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-[10%] sm:top-auto sm:max-h-[85vh] bg-card border-t sm:border border-border rounded-t-2xl sm:rounded-2xl z-50 flex flex-col sm:inset-x-4 sm:bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg"
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-border flex-shrink-0">
              <h2 className="font-semibold text-card-foreground text-sm">{t('apiManager')}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {/* Grouped by tool */}
              {toolOptions.map((tool) => {
                const toolApis = allApis.filter((a) => a.toolId === tool.id);
                const activeId = activeApis[tool.id];
                if (toolApis.length === 0) return null;

                return (
                  <div key={tool.id}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{t(tool.labelKey)}</p>
                    <div className="space-y-1.5">
                      {toolApis.map((api) => {
                        const isActive = activeId === api.id || (!activeId && api.id.startsWith('default'));
                        const isCustom = !api.id.startsWith('default');
                        return (
                          <motion.div
                            key={api.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveApi(tool.id, api.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                              isActive
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-transparent bg-secondary/50 hover:bg-secondary'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'gradient-bg' : 'bg-muted'}`}>
                              {isActive ? <Check className="w-3.5 h-3.5 text-primary-foreground" /> : <Cpu className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-card-foreground truncate">{api.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{api.model}</p>
                            </div>
                            {isCustom && (
                              <button
                                onClick={(e) => { e.stopPropagation(); removeCustomApi(api.id); }}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Add form */}
              <AnimatePresence>
                {showAdd && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-secondary/50 rounded-xl border border-border space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">{t('apiName')}</label>
                          <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="My API"
                            className="w-full px-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">{t('apiModel')}</label>
                          <input
                            value={form.model}
                            onChange={(e) => setForm({ ...form, model: e.target.value })}
                            placeholder="model-name"
                            className="w-full px-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Link className="w-3 h-3" /> Base URL</label>
                        <input
                          value={form.baseUrl}
                          onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                          placeholder="https://api.example.com/v1"
                          className="w-full px-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> API Key</label>
                        <input
                          type="password"
                          value={form.apiKey}
                          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full px-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">{t('apiTool')}</label>
                        <select
                          value={form.toolId}
                          onChange={(e) => setForm({ ...form, toolId: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-background text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {toolOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>{t(opt.labelKey)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAdd}
                          className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium"
                        >
                          {t('addApi')}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAdd(false)}
                          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm"
                        >
                          {t('cancel')}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!showAdd && (
              <div className="p-4 border-t border-border flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAdd(true)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('addCustomApi')}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApiManager;
