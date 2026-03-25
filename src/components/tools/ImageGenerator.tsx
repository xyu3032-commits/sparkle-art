import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2, Download, Sparkles, ChevronDown, Check, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore, defaultApis } from '@/lib/store';
import { toast } from 'sonner';

const ImageGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { trackUsage, getActiveApiForTool, customApis, activeApis, setActiveApi } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState('1024x1024');
  const [apiDropdown, setApiDropdown] = useState(false);

  const allApis = [...defaultApis, ...customApis].filter(a => a.toolId === 'imageGen');
  const api = getActiveApiForTool('imageGen');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl('');
    setLastPrompt(prompt.trim());

    const apiKey = api?.apiKey || 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok';
    const baseUrl = api?.baseUrl || 'https://api.siliconflow.cn/v1';
    const model = api?.model || 'Kwai-Kolors/Kolors';

    try {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, prompt: prompt.trim(), image_size: size, batch_size: 1, num_inference_steps: 20, guidance_scale: 7.5 }),
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      const url = data?.images?.[0]?.url || data?.data?.[0]?.url;
      if (url) { setImageUrl(url); trackUsage('imageGen'); toast.success(t('genSuccess')); }
      else throw new Error('No image URL');
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error(t('genFailed'));
    } finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = `ai-image-${Date.now()}.png`; a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success(t('downloadSuccess'));
    } catch { toast.error(t('downloadFailed')); }
  };

  const sizes = ['512x512', '1024x1024', '1280x720', '720x1280'];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col h-full">
      {/* Header with inline API switcher */}
      <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-card-foreground text-sm sm:text-base">{t('imageGen')}</h2>
        </div>
        {/* API Switcher */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setApiDropdown(!apiDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/80 border border-border text-xs font-medium text-card-foreground hover:bg-secondary transition-colors"
          >
            <Cpu className="w-3 h-3 text-primary" />
            <span className="max-w-[100px] truncate">{api?.name || 'Default'}</span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${apiDropdown ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {apiDropdown && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setApiDropdown(false)} className="fixed inset-0 z-30" />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-lg z-40 overflow-hidden"
                >
                  {allApis.map((a) => {
                    const isActive = activeApis['imageGen'] === a.id || (!activeApis['imageGen'] && a.id.startsWith('default'));
                    return (
                      <button
                        key={a.id}
                        onClick={() => { setActiveApi('imageGen', a.id); setApiDropdown(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${isActive ? 'bg-primary/5 text-primary' : 'text-card-foreground hover:bg-secondary'}`}
                      >
                        {isActive ? <Check className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5 text-muted-foreground" />}
                        <div className="text-left min-w-0">
                          <p className="font-medium truncate">{a.name}</p>
                          <p className="text-muted-foreground truncate">{a.model}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {imageUrl ? (
            <motion.div key="image" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg space-y-3">
              {/* Show the prompt used */}
              <div className="px-3 py-2 rounded-xl bg-secondary/60 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">{t('prompt')}</p>
                <p className="text-sm text-card-foreground">{lastPrompt}</p>
              </div>
              <div className="relative">
                <img src={imageUrl} alt={lastPrompt} className="w-full rounded-2xl shadow-elevated" />
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload} className="absolute bottom-3 right-3 p-2.5 rounded-xl glass-surface border border-border hover:bg-secondary transition-colors">
                  <Download className="w-4 h-4 text-card-foreground" />
                </motion.button>
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              {/* Show prompt while generating */}
              <div className="px-4 py-2 rounded-xl bg-secondary/60 border border-border max-w-sm text-center">
                <p className="text-xs text-muted-foreground mb-0.5">{t('generating')}</p>
                <p className="text-sm text-card-foreground">{lastPrompt}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t('generating')}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('noResult')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-border space-y-3">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {sizes.map((s) => (
            <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setSize(s)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${size === s ? 'gradient-bg text-primary-foreground shadow-glow' : 'bg-secondary text-muted-foreground hover:text-secondary-foreground'}`}
            >{s}</motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && generate()} placeholder={t('placeholder')}
            className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={generate} disabled={loading || !prompt.trim()}
            className="px-3 sm:px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity text-sm font-medium">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('generate')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageGenerator;
