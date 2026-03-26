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
      className={`h-full flex flex-col bg-card border-r border-border ${collapsed ? 'w-16' : 'w-56'} transition-all duration-300`}
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
              whileTap={{ scale: 0.96 }}
              onClick={() => setCurrentTool(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200
                ${active ? 'gradient-bg text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'}`}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-2 space-y-1 border-t border-border">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setUserCenterOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <User className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('userCenter')}</span>}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <Settings className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('settings')}</span>}
        </motion.button>
        <motion.a
          whileTap={{ scale: 0.96 }}
          href="#"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <Download className="w-[18px] h-[18px]" />
          {!collapsed && <span>{t('download')}</span>}
        </motion.a>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
