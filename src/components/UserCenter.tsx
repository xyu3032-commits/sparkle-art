import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MessageSquare, Image, Film, Video, Music, BarChart3, LogOut, Key, ChevronRight, Shield, Ticket, Star, Crown, Gem, Megaphone } from 'lucide-react';
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

const memberBenefits: Record<string, string[]> = {
  guest: ['guestBenefit1', 'guestBenefit2'],
  free: ['freeBenefit1', 'freeBenefit2', 'freeBenefit3'],
  pro: ['proBenefit1', 'proBenefit2', 'proBenefit3', 'proBenefit4'],
  lifetime: ['lifetimeBenefit1', 'lifetimeBenefit2', 'lifetimeBenefit3', 'lifetimeBenefit4'],
};

const UserCenter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userCenterOpen, setUserCenterOpen, usageStats, user, logout, customApis } = useAppStore();
  const { redeemVoucher, notices } = useAdminStore();
  const [apiManagerOpen, setApiManagerOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [showMemberDetail, setShowMemberDetail] = useState(false);

  const totalUsage = Object.values(usageStats).reduce((a, b) => a + b, 0);
  const maxUsage = Math.max(...Object.values(usageStats), 1);
  const totalApis = defaultApis.length + customApis.length;

  const userLevel = localStorage.getItem('ai-user-level') || 'free';
  const userQuota = parseInt(localStorage.getItem('ai-user-quota') || '100');
  const userExpiry = localStorage.getItem('ai-user-expiry');

  const activeNotices = notices.filter(n => n.enabled);

  const handleLogout = () => { logout(); setUserCenterOpen(false); navigate('/auth'); };

  const handleAvatarClick = () => {
    if (user?.isGuest) { setUserCenterOpen(false); navigate('/auth'); }
  };

  const handleRedeem = () => {
    if (!voucherCode.trim()) return;
    const result = redeemVoucher(voucherCode, user?.email || 'guest');
    if (result.success) {
      toast.success(t('redeemSuccess'));
      setVoucherCode('');
    } else {
      toast.error(t(result.message));
    }
  };

  const levelLabels: Record<string, string> = {
    guest: t('levelGuest'), free: t('levelFree'), pro: t('levelPro'), lifetime: t('levelLifetime'),
  };

  const levelStyles: Record<string, { icon: React.ElementType; gradient: string }> = {
    guest: { icon: User, gradient: 'from-muted to-secondary' },
    free: { icon: Star, gradient: 'from-blue-500 to-cyan-500' },
    pro: { icon: Crown, gradient: 'from-amber-500 to-orange-500' },
    lifetime: { icon: Gem, gradient: 'from-purple-500 to-pink-500' },
  };

  const currentStyle = levelStyles[userLevel] || levelStyles.free;
  const LevelIcon = currentStyle.icon;

  return (
    <>
      <AnimatePresence>
        {userCenterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserCenterOpen(false)} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] admin-glass-card border-l border-border z-50 flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-border flex-shrink-0">
                <h2 className="font-semibold text-card-foreground">{t('userCenter')}</h2>
                <button onClick={() => setUserCenterOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
                {/* Avatar */}
                <motion.div whileTap={{ scale: 0.98 }} onClick={handleAvatarClick}
                  className={`flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-border ${user?.isGuest ? 'cursor-pointer hover:border-primary/30' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentStyle.gradient} flex items-center justify-center shadow-glow flex-shrink-0`}>
                    <LevelIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground text-sm truncate">{user?.username || t('guest')}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.isGuest ? `${t('freeUser')} · ${t('clickToLogin')}` : (user?.email || t('freeUser'))}
                    </p>
                  </div>
                  {user?.isGuest && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </motion.div>

                {/* Active Notices */}
                {activeNotices.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">{t('systemNotice')}</span>
                    </div>
                    {activeNotices.slice(0, 2).map(n => (
                      <div key={n.id}>
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Member Card */}
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowMemberDetail(!showMemberDetail)}
                  className={`bg-gradient-to-br ${currentStyle.gradient} rounded-2xl p-4 cursor-pointer relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <LevelIcon className="w-5 h-5 text-white" />
                        <span className="text-white font-bold text-sm">{levelLabels[userLevel] || userLevel}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-white/70 transition-transform ${showMemberDetail ? 'rotate-90' : ''}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-white/70 text-[10px]">{t('remainQuota')}</p>
                        <p className="text-white font-bold text-lg">{Math.max(userQuota - totalUsage, 0)}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-[10px]">{t('expiryDate')}</p>
                        <p className="text-white font-bold text-sm">{userExpiry ? new Date(userExpiry).toLocaleDateString() : '∞'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Member Benefits Detail */}
                <AnimatePresence>
                  {showMemberDetail && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="bg-secondary/50 rounded-2xl border border-border p-3 space-y-2">
                        <p className="text-xs font-semibold text-foreground">{t('memberBenefits')}</p>
                        {(memberBenefits[userLevel] || memberBenefits.free).map((key, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{t(key)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

                {/* API Manager */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setApiManagerOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center"><Key className="w-4 h-4 text-primary-foreground" /></div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{t('apiManager')}</p>
                    <p className="text-xs text-muted-foreground">{t('apiManagerDesc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.button>

                {/* Admin Panel */}
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

                {/* Logout / Login */}
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
