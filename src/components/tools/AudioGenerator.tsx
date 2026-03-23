import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Loader2, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const AudioGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { setSettingsOpen } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    // Placeholder for audio generation API
    setTimeout(() => {
      setAudioUrl('');
      setLoading(false);
    }, 2000);
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
          <h2 className="font-semibold text-card-foreground">{t('audioGen')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Audio Generation API</p>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col items-center justify-center">
        {audioUrl ? (
          <audio src={audioUrl} controls className="w-full max-w-md" />
        ) : (
          <div className="text-center text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noResult')}</p>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm">{t('generating')}</span>
              </motion.div>
            )}
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

export default AudioGenerator;
