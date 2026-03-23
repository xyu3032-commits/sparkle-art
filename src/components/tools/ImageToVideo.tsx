import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, Loader2, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const ImageToVideo: React.FC = () => {
  const { t } = useTranslation();
  const { setSettingsOpen } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generate = async () => {
    if (!imageFile) return;
    setLoading(true);
    // Use pollinations for demo
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt || 'animate this image')}?width=${width}&height=${height}&nologo=true`;
    setVideoUrl(url);
    setLoading(false);
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
          <h2 className="font-semibold text-card-foreground">{t('imageToVideo')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pollinations AI</p>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">{t('imageGen')}</label>
          <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors overflow-hidden">
            {imageFile ? (
              <img src={imageFile} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span className="text-sm">Upload image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Size controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('width')}: {width}px</label>
            <motion.input
              type="range"
              min={256}
              max={1920}
              step={64}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('height')}: {height}px</label>
            <motion.input
              type="range"
              min={256}
              max={1920}
              step={64}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* Result */}
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img src={videoUrl} alt="Result" className="w-full rounded-2xl shadow-elevated" />
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={generate}
            disabled={loading || !imageFile}
            className="px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity text-sm font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('generate')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageToVideo;
