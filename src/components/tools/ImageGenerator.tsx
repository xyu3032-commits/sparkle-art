import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Download, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const ImageGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { setSettingsOpen } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true`;
    setImageUrl(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-card-foreground">{t('imageGen')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pollinations AI</p>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col items-center justify-center">
        {imageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-lg w-full"
          >
            <img
              src={imageUrl}
              alt={prompt}
              className="w-full rounded-2xl shadow-elevated"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            {loading && (
              <div className="absolute inset-0 rounded-2xl bg-card/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <motion.a
              whileTap={{ scale: 0.95 }}
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="absolute bottom-3 right-3 p-2 rounded-lg glass-surface border border-border hover:bg-secondary transition-colors"
            >
              <Download className="w-4 h-4 text-card-foreground" />
            </motion.a>
          </motion.div>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noResult')}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity text-sm font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('generate')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageGenerator;
