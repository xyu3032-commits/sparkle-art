import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MessageSquare, Image, Film, Video, Music, BarChart3, Clock, LogOut, Key, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore, defaultApis } from '@/lib/store';
import ApiManager from '@/components/ApiManager';

const toolMeta = [
  { id: 'textGen', icon: MessageSquare, color: 'hsl(var(--primary))' },
  { id: 'imageGen', icon: Image, color: 'hsl(217 91% 60%)' },
  { id: 'textToVideo', icon: Film, color: 'hsl(280 70% 55%)' },
  { id: 'imageToVideo', icon: Video, color: 'hsl(340 75% 55%)' },
  { id: 'audioGen', icon: Music, color: 'hsl(160 60% 45%)' },
];

const UserCenter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userCenterOpen, setUserCenterOpen, usageStats, user, logout, customApis } = useAppStore();
  const [apiManagerOpen, setApiManagerOpen] = useState(false);

  const totalUsage = Object.values(usageStats).reduce((a, b) => a + b, 0);
  const maxUsage = Math.max(...Object.values(usageStats), 1);
  const totalApis = defaultApis.length + customApis.length;

  const handleLogout = () => {
    logout();
    setUserCenterOpen(false);
    navigate('/auth');
  };

  return (
    <>
      <AnimatePresence>
        {userCenterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserCenterOpen(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-card border-l border-border z-50 flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-border flex-shrink-0">
                <h2 className="font-semibold text-card-foreground">{t('userCenter')}</h2>
                <button onClick={() => setUserCenterOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
                {/* Avatar & Info */}
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-glow flex-shrink-0">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground text-sm truncate">
                      {user?.username || t('guest')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.isGuest ? t('freeUser') : (user?.email || t('freeUser'))}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/50 rounded-xl p-3 border border-border text-center">
                    <p className="text-2xl font-bold gradient-text">{totalUsage}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('totalGenerations')}</p>
                  </div>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setApiManagerOpen(true)}
                    className="bg-secondary/50 rounded-xl p-3 border border-border text-center cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <p className="text-2xl font-bold gradient-text">{totalApis}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('apiCount')}</p>
                  </motion.div>
                </div>

                {/* API Manager Entry */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setApiManagerOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Key className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{t('apiManager')}</p>
                    <p className="text-xs text-muted-foreground">{t('apiManagerDesc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.button>

                {/* Per-tool usage */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-card-foreground">{t('usageBreakdown')}</span>
                  </div>
                  <div className="space-y-2.5">
                    {toolMeta.map((tool) => {
                      const count = usageStats[tool.id] || 0;
                      const pct = maxUsage > 0 ? (count / maxUsage) * 100 : 0;
                      return (
                        <div key={tool.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <tool.icon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs text-card-foreground">{t(tool.id)}</span>
                            </div>
                            <span className="text-xs font-medium text-card-foreground tabular-nums">{count}</span>
                          </div>
                          <div className="h-1 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: tool.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logout */}
                {user && !user.isGuest && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ApiManager open={apiManagerOpen} onClose={() => setApiManagerOpen(false)} />
    </>
  );
};

export default UserCenter;
