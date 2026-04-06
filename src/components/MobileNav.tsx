import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Image, Film, Video, Music, Settings, Download, X, Sparkles, User, BookOpen, Languages, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const toolItems = [
  { id: 'textGen', icon: MessageSquare, labelKey: 'textGen' },
  { id: 'imageGen', icon: Image, labelKey: 'imageGen' },
  { id: 'textToVideo', icon: Film, labelKey: 'textToVideo' },
  { id: 'imageToVideo', icon: Video, labelKey: 'imageToVideo' },
  { id: 'audioGen', icon: Music, labelKey: 'audioGen' },
  { id: 'voiceTranslate', icon: Languages, labelKey: 'voiceTranslate' },
  { id: 'promptLib', icon: BookOpen, labelKey: 'promptLibrary' },
  { id: 'utilityBox', icon: Wrench, labelKey: 'utilityBox' },
];

const MobileNav: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { currentTool, setCurrentTool, setSettingsOpen, setUserCenterOpen } = useAppStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm gradient-text">{t('appName')}</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1.5">
              {toolItems.map((item) => {
                const active = currentTool === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setCurrentTool(item.id); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${active ? 'gradient-bg text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{t(item.labelKey)}</span>
                  </motion.button>
                );
              })}
            </nav>
            <div className="p-3 space-y-1.5 border-t border-border">
              <button
                onClick={() => { setUserCenterOpen(true); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{t('userCenter')}</span>
              </button>
              <button
                onClick={() => { setSettingsOpen(true); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>{t('settings')}</span>
              </button>
              <a href="#" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                <Download className="w-5 h-5" />
                <span>{t('download')}</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
