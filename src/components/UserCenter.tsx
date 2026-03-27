import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MessageSquare, Image, Film, Video, Music, BarChart3, LogOut, Key, ChevronRight, Shield, Ticket, Star, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore, defaultApis } from '@/lib/store';
import { useAdminStore } from '@/lib/adminStore';
import ApiManager from '@/components/ApiManager';
import { toast } from 'sonner';

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
  const { redeemVoucher } = useAdminStore();
  const [apiManagerOpen, setApiManagerOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const totalUsage = Object.values(usageStats).reduce((a, b) => a + b, 0);
  const maxUsage = Math.max(...Object.values(usageStats), 1);
  const totalApis = defaultApis.length + customApis.length;

  // User level info from localStorage
  const userLevel = localStorage.getItem('ai-user-level') || 'free';
  const userQuota = parseInt(localStorage.getItem('ai-user-quota') || '100');
  const userExpiry = localStorage.getItem('ai-user-expiry');

  const handleLogout = () => {
    logout();
    setUserCenterOpen(false);
    navigate('/auth');
  };

  const handleAvatarClick = () => {
    if (user?.isGuest) {
      setUserCenterOpen(false);
      navigate('/auth');
    }
  };

  const handleRedeem = () => {
    if (!voucherCode.trim()) return;
    const result = redeemVoucher(voucherCode, user?.email || 'guest');
    if (result.success) {
      const parts = result.message.split(':');
      if (parts[1] === 'quota') {
        const current = parseInt(localStorage.getItem('ai-user-quota') || '100');
        localStorage.setItem('ai-user-quota', String(current + parseInt(parts[2])));
      } else if (parts[1] === 'days') {
        const exp = new Date();
        exp.setDate(exp.getDate() + parseInt(parts[2]));
        localStorage.setItem('ai-user-expiry', exp.toISOString());
      }
      toast.success(t('redeemSuccess'));
      setVoucherCode('');
    } else {
      toast.error(t(result.message));
    }
  };

  const levelLabels: Record<string, string> = {
    guest: t('levelGuest'),
    free: t('levelFree'),
    pro: t('levelPro'),
    lifetime: t('levelLifetime'),
  };

  return (
    <>
      <AnimatePresence>
        {userCenterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserCenterOpen(false)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-card border-l border-border z-50 flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-border flex-shrink-0">
                <h2 className="font-semibold text-card-foreground">{t('userCenter')}</h2>
                <button onClick={() => setUserCenterOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {/* Avatar */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAvatarClick}
                  className={`flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border ${user?.isGuest ? 'cursor-pointer hover:border-primary/30' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-glow flex-shrink-0">
                    <User className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground text-sm truncate">{user?.username || t('guest')}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.isGuest ? `${t('freeUser')} · ${t('clickToLogin')}` : (user?.email || t('freeUser'))}
                    </p>
                  </div>
                  {user?.isGuest && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </motion.div>

                {/* Asset Center */}
                <div className="bg-secondary/50 rounded-2xl border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-card-foreground">{t('assetCenter')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t('currentLevel')}</p>
                      <p className="text-sm font-bold gradient-text">{levelLabels[userLevel] || userLevel}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t('remainQuota')}</p>
                      <p className="text-sm font-bold text-card-foreground">{Math.max(userQuota - totalUsage, 0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t('expiryDate')}</p>
                      <p className="text-sm font-bold text-card-foreground">
                        {userExpiry ? new Date(userExpiry).toLocaleDateString() : '∞'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voucher Redeem */}
                <div className="bg-secondary/50 rounded-2xl border border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-card-foreground">{t('redeemVoucher')}</span>
                  </div>
                  <div className="flex gap-2">
                    <input value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder={t('voucherCodePlaceholder')}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleRedeem}
                      className="px-3 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium">
                      {t('redeem')}
                    </motion.button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/50 rounded-xl p-3 border border-border text-center">
                    <p className="text-2xl font-bold gradient-text">{totalUsage}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('totalGenerations')}</p>
                  </div>
                  <motion.div whileTap={{ scale: 0.97 }} onClick={() => setApiManagerOpen(true)}
                    className="bg-secondary/50 rounded-xl p-3 border border-border text-center cursor-pointer hover:border-primary/30 transition-colors">
                    <p className="text-2xl font-bold gradient-text">{totalApis}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('apiCount')}</p>
                  </motion.div>
                </div>

                {/* API Manager Entry */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setApiManagerOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center"><Key className="w-4 h-4 text-primary-foreground" /></div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{t('apiManager')}</p>
                    <p className="text-xs text-muted-foreground">{t('apiManagerDesc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.button>

                {/* Admin Panel Entry */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setUserCenterOpen(false); navigate('/admin'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><Shield className="w-4 h-4 text-destructive" /></div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{t('adminPanel')}</p>
                    <p className="text-xs text-muted-foreground">{t('adminPanelDesc')}</p>
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
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                              className="h-full rounded-full" style={{ backgroundColor: tool.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Logout */}
                {user && !user.isGuest && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors">
                    <LogOut className="w-4 h-4" /> {t('logout')}
                  </motion.button>
                )}

                {user?.isGuest && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setUserCenterOpen(false); navigate('/auth'); }}
                    className="w-full py-2.5 rounded-xl gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-2">
                    <User className="w-4 h-4" /> {t('loginOrRegister')}
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
