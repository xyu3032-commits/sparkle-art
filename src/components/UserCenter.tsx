import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MessageSquare, Image, Film, Video, Music, BarChart3, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const toolMeta = [
  { id: 'textGen', icon: MessageSquare, color: 'hsl(var(--primary))' },
  { id: 'imageGen', icon: Image, color: 'hsl(217 91% 60%)' },
  { id: 'textToVideo', icon: Film, color: 'hsl(280 70% 55%)' },
  { id: 'imageToVideo', icon: Video, color: 'hsl(340 75% 55%)' },
  { id: 'audioGen', icon: Music, color: 'hsl(160 60% 45%)' },
];

const UserCenter: React.FC = () => {
  const { t } = useTranslation();
  const { userCenterOpen, setUserCenterOpen, usageStats } = useAppStore();

  const totalUsage = Object.values(usageStats).reduce((a, b) => a + b, 0);
  const maxUsage = Math.max(...Object.values(usageStats), 1);

  return (
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
            className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-card border-l border-border z-50 flex flex-col overflow-y-auto scrollbar-thin"
          >
            <div className="p-4 flex items-center justify-between border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-semibold text-card-foreground">{t('userCenter')}</h2>
              <button onClick={() => setUserCenterOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Avatar & Info */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-card-foreground">{t('guest')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('freeUser')}</p>
                </div>
              </div>

              {/* Total Stats */}
              <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">{t('totalUsage')}</span>
                </div>
                <p className="text-3xl font-bold gradient-text">{totalUsage}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('totalGenerations')}</p>
              </div>

              {/* Per-tool usage */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-card-foreground">{t('usageBreakdown')}</span>
                </div>
                <div className="space-y-3">
                  {toolMeta.map((tool) => {
                    const count = usageStats[tool.id] || 0;
                    const pct = maxUsage > 0 ? (count / maxUsage) * 100 : 0;
                    return (
                      <div key={tool.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <tool.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-card-foreground">{t(tool.id)}</span>
                          </div>
                          <span className="text-sm font-medium text-card-foreground tabular-nums">{count}</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserCenter;
