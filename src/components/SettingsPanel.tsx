import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Globe, ImageIcon, RotateCcw, Monitor, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import i18n from '@/lib/i18n';

const languages = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

const bgPresets = [
  '',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80',
];

const SettingsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme, language, setLanguage, backgroundUrl, setBackgroundUrl, settingsOpen, setSettingsOpen, deviceMode, setDeviceMode } = useAppStore();
  const [customBgInput, setCustomBgInput] = useState('');

  const handleLang = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code);
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-card border-l border-border z-50 flex flex-col overflow-y-auto scrollbar-thin"
          >
            <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-semibold text-card-foreground">{t('settings')}</h2>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Theme */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-3 block">{t('theme')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['light', 'dark'] as const).map((th) => (
                    <motion.button
                      key={th}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setTheme(th)}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                        ${theme === th ? 'gradient-bg text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
                    >
                      {th === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {t(th)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> {t('language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((l) => (
                    <motion.button
                      key={l.code}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleLang(l.code)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors
                        ${language === l.code ? 'gradient-bg text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
                    >
                      {l.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> {t('background')}
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {bgPresets.map((url, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBackgroundUrl(url)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${backgroundUrl === url ? 'border-primary' : 'border-border'}`}
                    >
                      {url ? (
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={customBgInput}
                    onChange={(e) => setCustomBgInput(e.target.value)}
                    placeholder={t('bgUrl')}
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { if (customBgInput) { setBackgroundUrl(customBgInput); setCustomBgInput(''); } }}
                    className="px-3 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium"
                  >
                    {t('apply')}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
