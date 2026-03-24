import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Loader2, Download, Settings, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const ImageGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { setSettingsOpen, trackUsage, getActiveApiForTool } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState('1024x1024');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl('');

    const api = getActiveApiForTool('imageGen');
    const apiKey = api?.apiKey || 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok';
    const baseUrl = api?.baseUrl || 'https://api.siliconflow.cn/v1';
    const model = api?.model || 'Kwai-Kolors/Kolors';

    try {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt: prompt.trim(),
          image_size: size,
          batch_size: 1,
          num_inference_steps: 20,
          guidance_scale: 7.5,
        }),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const data = await response.json();
      const url = data?.images?.[0]?.url || data?.data?.[0]?.url;

      if (url) {
        setImageUrl(url);
        trackUsage('imageGen');
        toast.success(t('genSuccess'));
      } else {
        throw new Error('No image URL in response');
      }
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error(t('genFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ai-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success(t('downloadSuccess'));
    } catch {
      toast.error(t('downloadFailed'));
    }
  };

  const sizes = ['512x512', '1024x1024', '1280x720', '720x1280'];
  const api = getActiveApiForTool('imageGen');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="font-semibold text-card-foreground text-sm sm:text-base">{t('imageGen')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {api?.name || 'SiliconFlow Kolors'} · {api?.model || 'Kwai-Kolors/Kolors'}
          </p>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors flex-shrink-0">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {imageUrl ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg"
            >
              <img src={imageUrl} alt={prompt} className="w-full rounded-2xl shadow-elevated" />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="absolute bottom-3 right-3 p-2.5 rounded-xl glass-surface border border-border hover:bg-secondary transition-colors"
              >
                <Download className="w-4 h-4 text-card-foreground" />
              </motion.button>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
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

      <div className="p-3 sm:p-4 border-t border-border space-y-3">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {sizes.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSize(s)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                size === s
                  ? 'gradient-bg text-primary-foreground shadow-glow'
                  : 'bg-secondary text-muted-foreground hover:text-secondary-foreground'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder={t('placeholder')}
            className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="px-3 sm:px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity text-sm font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('generate')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageGenerator;
