import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, User, BookOpen, Info, ChevronDown, Key, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { useChatStore } from '@/lib/chatStore';
import ProfilePanel from './ProfilePanel';
import ApiManager from './ApiManager';
import ThemeSwitcher from './ThemeSwitcher';

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const { user, setUserCenterOpen, currentTool } = useAppStore();
  const { createSession } = useChatStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [apiManagerOpen, setApiManagerOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleNewChat = () => {
    createSession(currentTool);
  };

  return (
    <>
      <div className="flex items-center gap-0.5">
        {/* Theme Switcher */}
        <ThemeSwitcher />
        {/* New Chat */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleNewChat}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          title={t('newChat')}
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {/* API Manager */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setApiManagerOpen(true)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          title={t('apiManager')}
        >
          <Key className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {/* Tutorial */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setTutorialOpen(true)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors hidden sm:flex"
          title={t('tutorial')}
        >
          <BookOpen className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {/* User dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 px-1.5 py-1.5 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <User className="w-3 h-3 text-primary-foreground" />
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium text-card-foreground truncate">{user?.username || t('guest')}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('profileSettings')}
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setUserCenterOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('userCenter')}
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setApiManagerOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-secondary transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('apiManager')}
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setTutorialOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-card-foreground hover:bg-secondary transition-colors border-t border-border"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('help')}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ApiManager open={apiManagerOpen} onClose={() => setApiManagerOpen(false)} />

      {/* Tutorial Modal */}
      <AnimatePresence>
        {tutorialOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTutorialOpen(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-card border border-border rounded-2xl z-[60] max-h-[80vh] overflow-y-auto scrollbar-thin"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {t('tutorial')}
                </h2>
                <button onClick={() => setTutorialOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <motion.span whileTap={{ scale: 0.9 }}>✕</motion.span>
                </button>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { icon: '💬', title: t('textGen'), desc: t('tutorialText') },
                  { icon: '🎨', title: t('imageGen'), desc: t('tutorialImage') },
                  { icon: '🎬', title: t('textToVideo'), desc: t('tutorialVideo') },
                  { icon: '🎵', title: t('audioGen'), desc: t('tutorialAudio') },
                  { icon: '🔑', title: t('apiManager'), desc: t('tutorialApi') },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopBar;
