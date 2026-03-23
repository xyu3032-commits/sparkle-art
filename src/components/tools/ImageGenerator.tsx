import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Download, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const API_KEY = 'sk_O8fRc15IIahe01ssezlKhHQF5RV07ZOM';
const API_URL = 'https://gen.pollinations.ai/v1/images/generations';

const ImageGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { setSettingsOpen, trackUsage } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState('1024x1024');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'flux',
          prompt: prompt.trim(),
          size,
          n: 1,
          nologo: true,
          seed: -1,
          enhance: false,
          safe: true,
        }),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const data = await response.json();
      const url = data?.data?.[0]?.url;

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
          <p className="text-xs text-muted-foreground mt-0.5">Flux · Pollinations Pro</p>
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
            <img src={imageUrl} alt={prompt} className="w-full rounded-2xl shadow-elevated" />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="absolute bottom-3 right-3 p-2 rounded-lg glass-surface border border-border hover:bg-secondary transition-colors"
            >
              <Download className="w-4 h-4 text-card-foreground" />
            </motion.button>
          </motion.div>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noResult')}</p>
          </div>
        )}

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('generating')}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-3">
        {/* Size selector */}
        <div className="flex gap-2 flex-wrap">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                size === s
                  ? 'gradient-bg text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-secondary-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
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
