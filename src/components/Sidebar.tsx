import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Image, Film, Video, Music, Settings, Download, Sparkles, User, BookOpen, Languages } from 'lucide-react';
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
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-9 h-9 rounded-2xl gradient-bg flex items-center justify-center flex-shrink-0 pill-btn"
        >
          <Sparkles className="w-5 h-5 text-primary-foreground relative z-10" />
        </motion.div>
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
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.02, x: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => setCurrentTool(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium glass-nav-item
                ${active ? 'gradient-bg text-primary-foreground shadow-glow active' : 'text-muted-foreground hover:text-secondary-foreground'}`}
            >
              <motion.div
                animate={active ? { rotate: [0, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0 relative z-10" />
              </motion.div>
              {!collapsed && <span className="truncate relative z-10">{t(item.labelKey)}</span>}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-2 space-y-1 border-t border-border">
        {[
          { icon: User, label: 'userCenter', action: () => setUserCenterOpen(true) },
          { icon: Settings, label: 'settings', action: () => setSettingsOpen(true) },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.02, x: 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-muted-foreground glass-btn-action"
          >
            <item.icon className="w-[18px] h-[18px] relative z-10" />
            {!collapsed && <span className="relative z-10">{t(item.label)}</span>}
          </motion.button>
        ))}
        <motion.a
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.02, x: 2 }}
          href="#"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-muted-foreground glass-btn-action"
        >
          <Download className="w-[18px] h-[18px] relative z-10" />
          {!collapsed && <span className="relative z-10">{t('download')}</span>}
        </motion.a>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
