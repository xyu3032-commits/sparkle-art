import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Image, Film, Video, Music, Settings, Download, Sparkles, User, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const toolItems = [
  { id: 'textGen', icon: MessageSquare, labelKey: 'textGen' },
  { id: 'imageGen', icon: Image, labelKey: 'imageGen' },
  { id: 'textToVideo', icon: Film, labelKey: 'textToVideo' },
  { id: 'imageToVideo', icon: Video, labelKey: 'imageToVideo' },
  { id: 'audioGen', icon: Music, labelKey: 'audioGen' },
  { id: 'promptLib', icon: BookOpen, labelKey: 'promptLibrary' },
];

const Sidebar: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => {
  const { t } = useTranslation();
  const { currentTool, setCurrentTool, setSettingsOpen, setUserCenterOpen } = useAppStore();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`h-full flex flex-col admin-glass-card border-r border-border ${collapsed ? 'w-16' : 'w-56'} transition-all duration-300`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-2.5 border-b border-border">
        <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="font-bold text-sm gradient-text whitespace-nowrap overflow-hidden"
          >
            {t('appName')}
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
        {toolItems.map((item) => {
          const active = currentTool === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
              onClick={() => setCurrentTool(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 glass-nav-item
                ${active ? 'gradient-bg text-primary-foreground shadow-glow active' : 'text-muted-foreground hover:text-secondary-foreground'}`}
            >
              <motion.div animate={active ? { rotate: [0, -8, 8, 0] } : {}} transition={{ duration: 0.4 }}>
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              </motion.div>
              {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-2 space-y-1 border-t border-border">
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => setUserCenterOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground glass-btn-action transition-all"
        >
          <User className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('userCenter')}</span>}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground glass-btn-action transition-all"
        >
          <Settings className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('settings')}</span>}
        </motion.button>
        <motion.a
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.03 }}
          href="#"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground glass-btn-action transition-all"
        >
          <Download className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('download')}</span>}
        </motion.a>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
