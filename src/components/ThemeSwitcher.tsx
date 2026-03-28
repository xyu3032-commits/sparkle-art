import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Mountain, Moon, Sparkles, ScrollText, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const themePresets = [
  {
    id: 'alpine' as const,
    icon: Mountain,
    gradient: 'from-gray-100 to-white',
    accent: 'bg-gray-200',
    dot: 'bg-gray-400',
  },
  {
    id: 'midnight' as const,
    icon: Moon,
    gradient: 'from-gray-900 to-black',
    accent: 'bg-gray-800',
    dot: 'bg-purple-500',
  },
  {
    id: 'nebula' as const,
    icon: Sparkles,
    gradient: 'from-indigo-900 via-purple-900 to-blue-900',
    accent: 'bg-indigo-800',
    dot: 'bg-cyan-400',
  },
  {
    id: 'parchment' as const,
    icon: ScrollText,
    gradient: 'from-amber-50 to-orange-50',
    accent: 'bg-amber-100',
    dot: 'bg-amber-600',
  },
];

const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { themePreset, setThemePreset } = useAppStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl hover:bg-secondary transition-colors"
        title={t('visualStyle')}
      >
        <Palette className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
            >
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-card-foreground">{t('visualStyle')}</p>
              </div>
              <div className="p-2 space-y-1">
                {themePresets.map((preset) => {
                  const active = themePreset === preset.id;
                  return (
                    <motion.button
                      key={preset.id}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setThemePreset(preset.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-card-foreground hover:bg-secondary border border-transparent'
                      }`}
                    >
                      {/* Mini preview */}
                      <div className={`w-8 h-6 rounded-md bg-gradient-to-br ${preset.gradient} border border-border/50 flex items-center justify-center flex-shrink-0`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${preset.dot}`} />
                      </div>
                      <span className="flex-1 text-left">{t(preset.id)}</span>
                      {active && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
