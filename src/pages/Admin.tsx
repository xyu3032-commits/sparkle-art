import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Users, BarChart3, Ticket, Cpu, LogOut, ArrowLeft,
  Plus, Ban, CheckCircle, Download, Search, ToggleLeft, ToggleRight,
  TrendingUp, UserPlus, Trash2, Edit3, Megaphone, GlassWater, Save, X,
  Crown, Star, Gem, Eye, EyeOff, Settings, Database, Activity, Clock,
  AlertTriangle, RefreshCw, FileText, Zap, HardDrive
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminStore, type ManagedUser } from '@/lib/adminStore';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'users' | 'vouchers' | 'models' | 'notices' | 'settings';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useAppStore();
  const admin = useAdminStore();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  React.useEffect(() => {
    if (admin.glassEffect) document.documentElement.classList.add('glass-mode');
  }, []);

  if (!admin.isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{t('adminPanel')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('adminLoginDesc')}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (admin.adminLogin(password)) { toast.success(t('loginSuccess')); } else { toast.error(t('adminPasswordError')); } }} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('adminPassword')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" className="w-full py-2.5 rounded-xl gradient-bg text-primary-foreground font-medium text-sm">
              {t('login')}
            </motion.button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToApp')}
          </button>
        </motion.div>
      </div>
    );
  }

  const stats = admin.getStats();
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: BarChart3, label: t('adminDashboard') },
    { id: 'users', icon: Users, label: t('adminUsers') },
    { id: 'vouchers', icon: Ticket, label: t('adminVouchers') },
    { id: 'models', icon: Cpu, label: t('adminModels') },
    { id: 'notices', icon: Megaphone, label: t('adminNotices') },
    { id: 'settings', icon: Settings, label: t('adminSettings') },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 admin-glass-card border-r border-border flex flex-col max-md:hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm gradient-text">{t('adminPanel')}</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab.id ? 'gradient-bg text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-secondary'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-2 border-t border-border space-y-1">
          <button onClick={() => admin.setGlassEffect(!admin.glassEffect)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
            <GlassWater className="w-4 h-4" />
            <span className="flex-1 text-left">{t('glassEffect')}</span>
            {admin.glassEffect ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('backToApp')}
          </button>
          <button onClick={() => admin.adminLogout()} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 admin-glass-card border-t border-border z-40 flex overflow-x-auto">
        {tabs.map(tab => (
          <motion.button key={tab.id} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-all ${activeTab === tab.id ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            <tab.icon className="w-4 h-4" />
            <span className="truncate w-full text-center px-0.5">{tab.label}</span>
            {activeTab === tab.id && <motion.div layoutId="mobile-tab-indicator" className="w-4 h-0.5 rounded-full gradient-bg mt-0.5" />}
          </motion.button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'vouchers' && <VouchersTab />}
            {activeTab === 'models' && <ModelsTab />}
            {activeTab === 'notices' && <NoticesTab />}
            {activeTab === 'settings' && <AdminSettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ===== Dashboard ===== */
const DashboardTab: React.FC<{ stats: { totalUsers: number; totalGenerations: number; todayActive: number } }> = ({ stats }) => {
  const { t } = useTranslation();
  const { vouchers } = useAdminStore();
  const allStats = JSON.parse(localStorage.getItem('ai-usage-stats') || '{}');
  const unusedVouchers = vouchers.filter(v => !v.used).length;
  const statCards = [
    { label: t('totalUsersLabel'), value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: t('totalGenerations'), value: stats.totalGenerations, icon: TrendingUp, color: 'text-accent' },
    { label: t('todayActive'), value: stats.todayActive, icon: Activity, color: 'text-green-500' },
    { label: t('unusedVouchers'), value: unusedVouchers, icon: Ticket, color: 'text-amber-500' },
  ];
  const toolStats = [
    { id: 'textGen', label: t('textGen'), count: allStats.textGen || 0 },
    { id: 'imageGen', label: t('imageGen'), count: allStats.imageGen || 0 },
    { id: 'textToVideo', label: t('textToVideo'), count: allStats.textToVideo || 0 },
    { id: 'imageToVideo', label: t('imageToVideo'), count: allStats.imageToVideo || 0 },
    { id: 'audioGen', label: t('audioGen'), count: allStats.audioGen || 0 },
  ];
  const maxCount = Math.max(...toolStats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">{t('adminDashboard')}</h1>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString()}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="admin-glass-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: t('clearAllData'), icon: Trash2, action: () => { localStorage.removeItem('ai-usage-stats'); toast.success(t('dataCleared')); }, color: 'text-destructive' },
          { label: t('exportAllData'), icon: Download, action: () => { exportAllData(); toast.success(t('exportSuccess')); }, color: 'text-primary' },
          { label: t('refreshStats'), icon: RefreshCw, action: () => { window.location.reload(); }, color: 'text-green-500' },
          { label: t('systemInfo'), icon: HardDrive, action: () => { toast.info(`localStorage: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)}KB`); }, color: 'text-amber-500' },
        ].map((a, i) => (
          <motion.button key={i} whileTap={{ scale: 0.95 }}
            onClick={a.action}
            className="admin-glass-card border border-border rounded-xl p-3 flex items-center gap-2 hover:border-primary/30 transition-all">
            <a.icon className={`w-4 h-4 ${a.color}`} />
            <span className="text-xs font-medium text-foreground">{a.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="admin-glass-card border border-border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t('usageBreakdown')}</h3>
        <div className="space-y-3">
          {toolStats.map(ts => (
            <div key={ts.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{ts.label}</span>
                <span className="font-medium text-foreground">{ts.count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(ts.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full gradient-bg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function exportAllData() {
  const data = {
    users: JSON.parse(localStorage.getItem('admin-users') || '[]'),
    vouchers: JSON.parse(localStorage.getItem('admin-vouchers') || '[]'),
    stats: JSON.parse(localStorage.getItem('ai-usage-stats') || '{}'),
    notices: JSON.parse(localStorage.getItem('admin-notices') || '[]'),
    modelConfigs: JSON.parse(localStorage.getItem('admin-model-configs') || '[]'),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `admin-export-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
}

/* ===== Users ===== */
const UsersTab: React.FC = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUser, deleteUser, banUser, unbanUser } = useAdminStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newLevel, setNewLevel] = useState<ManagedUser['level']>('free');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filtered = users.filter(u => {
    const matchSearch = u.email.includes(search) || u.username.includes(search);
    const matchLevel = filterLevel === 'all' || u.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleAdd = () => {
    if (!newEmail) return;
    addUser({ email: newEmail, username: newUsername || newEmail.split('@')[0], level: newLevel, quota: 100, usedQuota: 0, banned: false, expiresAt: null });
    setNewEmail(''); setNewUsername(''); setShowAdd(false);
    toast.success(t('userAdded'));
  };

  const handleDelete = (id: string) => {
    deleteUser(id);
    toast.success(t('userDeleted'));
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    updateUser(editingUser.id, {
      email: editingUser.email,
      username: editingUser.username,
      level: editingUser.level,
      quota: editingUser.quota,
      memberStyle: editingUser.memberStyle,
      expiresAt: editingUser.expiresAt,
    });
    setEditingUser(null);
    toast.success(t('userUpdated'));
  };

  const handleBulkBan = () => {
    const bannedCount = filtered.filter(u => !u.banned).length;
    filtered.forEach(u => { if (!u.banned) banUser(u.id); });
    toast.success(`${t('ban')} ${bannedCount} ${t('adminUsers')}`);
  };

  const levelIcons: Record<string, React.ElementType> = { free: Star, pro: Crown, lifetime: Gem };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg font-bold text-foreground">{t('adminUsers')} ({users.length})</h1>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" /> {t('addUser')}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="admin-glass-card border border-border rounded-xl p-3 space-y-2 overflow-hidden">
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={t('emailPlaceholder')}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder={t('usernamePlaceholder')}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <select value={newLevel} onChange={e => setNewLevel(e.target.value as ManagedUser['level'])}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none">
              <option value="free">{t('levelFree')}</option>
              <option value="pro">{t('levelPro')}</option>
              <option value="lifetime">{t('levelLifetime')}</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">{t('addUser')}</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg bg-secondary text-sm text-muted-foreground">{t('cancel')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="admin-glass-card border border-border rounded-2xl p-5 w-full max-w-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{t('editUser')}</h3>
                <button onClick={() => setEditingUser(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                placeholder={t('usernamePlaceholder')}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t('currentLevel')}</label>
                  <select value={editingUser.level} onChange={e => setEditingUser({ ...editingUser, level: e.target.value as ManagedUser['level'] })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border">
                    <option value="guest">{t('levelGuest')}</option>
                    <option value="free">{t('levelFree')}</option>
                    <option value="pro">{t('levelPro')}</option>
                    <option value="lifetime">{t('levelLifetime')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t('remainQuota')}</label>
                  <input type="number" value={editingUser.quota} onChange={e => setEditingUser({ ...editingUser, quota: +e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('memberStyle')}</label>
                <select value={editingUser.memberStyle || 'default'} onChange={e => setEditingUser({ ...editingUser, memberStyle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border">
                  <option value="default">{t('styleDefault')}</option>
                  <option value="gold">{t('styleGold')}</option>
                  <option value="diamond">{t('styleDiamond')}</option>
                  <option value="rainbow">{t('styleRainbow')}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveEdit} className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
                  <Save className="w-3.5 h-3.5" /> {t('save')}
                </button>
                <button onClick={() => setEditingUser(null)} className="flex-1 py-2 rounded-lg bg-secondary text-sm text-muted-foreground">{t('cancel')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchUsers')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="px-3 py-2 rounded-xl bg-secondary text-sm border border-border focus:outline-none">
          <option value="all">{t('allLevels')}</option>
          <option value="guest">{t('levelGuest')}</option>
          <option value="free">{t('levelFree')}</option>
          <option value="pro">{t('levelPro')}</option>
          <option value="lifetime">{t('levelLifetime')}</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noUsers')}</p>}
        {filtered.map(user => {
          const LevelIcon = levelIcons[user.level] || Star;
          return (
            <motion.div key={user.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`admin-glass-card border border-border rounded-xl p-3 flex items-center gap-3 ${user.banned ? 'opacity-50' : ''}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                user.memberStyle === 'gold' ? 'bg-amber-500/20' :
                user.memberStyle === 'diamond' ? 'bg-cyan-500/20' :
                user.memberStyle === 'rainbow' ? 'bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20' :
                'gradient-bg'
              }`}>
                <LevelIcon className={`w-4 h-4 ${
                  user.memberStyle === 'gold' ? 'text-amber-500' :
                  user.memberStyle === 'diamond' ? 'text-cyan-400' :
                  'text-primary-foreground'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email} · {t('remainQuota')}: {user.quota - user.usedQuota}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                user.level === 'pro' ? 'bg-primary/10 text-primary' :
                user.level === 'lifetime' ? 'bg-accent/10 text-accent' :
                'bg-secondary text-muted-foreground'
              }`}>
                {t(`level${user.level.charAt(0).toUpperCase() + user.level.slice(1)}`)}
              </span>
              {user.banned && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive">{t('banned')}</span>
              )}
              <div className="flex gap-0.5">
                <button onClick={() => setEditingUser({ ...user })} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title={t('editUser')}>
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {user.banned ? (
                  <button onClick={() => { unbanUser(user.id); toast.success(t('unban')); }} className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors" title={t('unban')}>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  </button>
                ) : (
                  <button onClick={() => { banUser(user.id); toast.success(t('ban')); }} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title={t('ban')}>
                    <Ban className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
                <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title={t('deleteUser')}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ===== Vouchers ===== */
const VouchersTab: React.FC = () => {
  const { t } = useTranslation();
  const { vouchers, generateVouchers } = useAdminStore();
  const [batch, setBatch] = useState('');
  const [type, setType] = useState<'quota' | 'days'>('quota');
  const [value, setValue] = useState(100);
  const [count, setCount] = useState(10);
  const [expDays, setExpDays] = useState(30);
  const [filterUsed, setFilterUsed] = useState<string>('all');

  const handleGenerate = () => {
    if (!batch) { toast.error(t('batchRequired')); return; }
    const v = generateVouchers(batch, type, value, count, expDays);
    toast.success(`${t('vouchersGenerated')} (${v.length})`);
  };

  const handleExportCSV = () => {
    const header = 'Code,Type,Value,Batch,Used,Expires\n';
    const rows = vouchers.map(v => `${v.code},${v.type},${v.value},${v.batch},${v.used},${new Date(v.expiresAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `vouchers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('exportSuccess'));
  };

  const filteredVouchers = vouchers.filter(v => {
    if (filterUsed === 'used') return v.used;
    if (filterUsed === 'unused') return !v.used;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg font-bold text-foreground">{t('adminVouchers')} ({vouchers.length})</h1>
        <div className="flex gap-2">
          <select value={filterUsed} onChange={e => setFilterUsed(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-secondary text-xs border border-border">
            <option value="all">{t('allVouchers')}</option>
            <option value="used">{t('used')}</option>
            <option value="unused">{t('unused')}</option>
          </select>
          {vouchers.length > 0 && (
            <button onClick={handleExportCSV} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1 hover:bg-muted transition-colors">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
        </div>
      </div>

      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t('generateVouchers')}</h3>
        <input value={batch} onChange={e => setBatch(e.target.value)} placeholder={t('batchName')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="grid grid-cols-2 gap-2">
          <select value={type} onChange={e => setType(e.target.value as 'quota' | 'days')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm border border-border">
            <option value="quota">{t('voucherQuota')}</option>
            <option value="days">{t('voucherDays')}</option>
          </select>
          <input type="number" value={value} onChange={e => setValue(+e.target.value)} placeholder={t('voucherValue')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={count} onChange={e => setCount(+e.target.value)} placeholder={t('voucherCount')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none" />
          <input type="number" value={expDays} onChange={e => setExpDays(+e.target.value)} placeholder={t('voucherExpDays')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none" />
        </div>
        <button onClick={handleGenerate} className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">
          {t('generateVouchers')}
        </button>
      </div>

      <div className="space-y-2">
        {filteredVouchers.slice().reverse().slice(0, 50).map(v => (
          <div key={v.id} className={`admin-glass-card border border-border rounded-xl p-3 flex items-center gap-3 ${v.used ? 'opacity-50' : ''}`}>
            <Ticket className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-bold text-foreground">{v.code}</p>
              <p className="text-xs text-muted-foreground">{v.batch} · {v.type === 'quota' ? `${v.value} ${t('quotaUnit')}` : `${v.value} ${t('daysUnit')}`}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v.used ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
              {v.used ? t('used') : t('unused')}
            </span>
          </div>
        ))}
        {filteredVouchers.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noVouchers')}</p>}
      </div>
    </div>
  );
};

/* ===== Models ===== */
const ModelsTab: React.FC = () => {
  const { t } = useTranslation();
  const { modelConfigs, setModelConfig } = useAdminStore();
  const toolLabels: Record<string, string> = {
    textGen: t('textGen'), imageGen: t('imageGen'), textToVideo: t('textToVideo'),
    imageToVideo: t('imageToVideo'), audioGen: t('audioGen'),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">{t('adminModels')}</h1>
      <div className="space-y-2">
        {modelConfigs.map(mc => (
          <div key={mc.toolId} className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{toolLabels[mc.toolId] || mc.toolId}</span>
              </div>
              <button onClick={() => setModelConfig(mc.toolId, { enabled: !mc.enabled })} className="p-1">
                {mc.enabled ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{t('consumptionWeight')}</span>
              <input type="range" min={1} max={20} value={mc.weight} onChange={e => setModelConfig(mc.toolId, { weight: +e.target.value })}
                className="flex-1 accent-[hsl(var(--primary))]" />
              <span className="text-xs font-bold text-foreground w-6 text-center">{mc.weight}x</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===== Notices ===== */
const NoticesTab: React.FC = () => {
  const { t } = useTranslation();
  const { notices, addNotice, updateNotice, deleteNotice } = useAdminStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!title.trim()) { toast.error(t('titleRequired')); return; }
    addNotice(title.trim(), content.trim());
    setTitle(''); setContent('');
    toast.success(t('noticeAdded'));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">{t('adminNotices')} ({notices.length})</h1>

      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t('addNotice')}</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('noticeTitle')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={t('noticeContent')} rows={3}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        <button onClick={handleAdd} className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">
          {t('publishNotice')}
        </button>
      </div>

      <div className="space-y-2">
        {notices.map(n => (
          <div key={n.id} className="admin-glass-card border border-border rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-medium text-foreground">{n.title}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateNotice(n.id, { enabled: !n.enabled })} className="p-1 rounded hover:bg-secondary transition-colors">
                  {n.enabled ? <Eye className="w-3.5 h-3.5 text-green-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => deleteNotice(n.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{n.content}</p>
            <p className="text-[10px] text-muted-foreground/60">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {notices.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noNotices')}</p>}
      </div>
    </div>
  );
};

/* ===== Admin Settings ===== */
const AdminSettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const admin = useAdminStore();
  const [newPassword, setNewPassword] = useState('');
  const [siteName, setSiteName] = useState(localStorage.getItem('admin-site-name') || '');
  const [siteDesc, setSiteDesc] = useState(localStorage.getItem('admin-site-desc') || '');
  const [defaultQuota, setDefaultQuota] = useState(parseInt(localStorage.getItem('admin-default-quota') || '100'));
  const [maxDaily, setMaxDaily] = useState(parseInt(localStorage.getItem('admin-max-daily') || '1000'));
  const [registrationOpen, setRegistrationOpen] = useState(localStorage.getItem('admin-registration') !== 'false');

  const handleSaveSiteSettings = () => {
    localStorage.setItem('admin-site-name', siteName);
    localStorage.setItem('admin-site-desc', siteDesc);
    localStorage.setItem('admin-default-quota', String(defaultQuota));
    localStorage.setItem('admin-max-daily', String(maxDaily));
    localStorage.setItem('admin-registration', String(registrationOpen));
    toast.success(t('settingsSaved'));
  };

  const storageUsed = (JSON.stringify(localStorage).length / 1024).toFixed(1);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">{t('adminSettings')}</h1>

      {/* Site Config */}
      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('siteConfig')}</h3>
        </div>
        <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder={t('siteName')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea value={siteDesc} onChange={e => setSiteDesc(e.target.value)} placeholder={t('siteDesc')} rows={2}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('defaultQuota')}</label>
            <input type="number" value={defaultQuota} onChange={e => setDefaultQuota(+e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('maxDailyUsage')}</label>
            <input type="number" value={maxDaily} onChange={e => setMaxDaily(+e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{t('openRegistration')}</span>
          <button onClick={() => setRegistrationOpen(!registrationOpen)}>
            {registrationOpen ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
          </button>
        </div>
        <button onClick={handleSaveSiteSettings} className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
          <Save className="w-3.5 h-3.5" /> {t('save')}
        </button>
      </div>

      {/* System Info */}
      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('systemInfo')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">{t('storageUsed')}</p>
            <p className="text-sm font-bold text-foreground">{storageUsed} KB</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">{t('totalUsersLabel')}</p>
            <p className="text-sm font-bold text-foreground">{admin.users.length}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">{t('totalVouchers')}</p>
            <p className="text-sm font-bold text-foreground">{admin.vouchers.length}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">{t('totalNotices')}</p>
            <p className="text-sm font-bold text-foreground">{admin.notices.length}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="admin-glass-card border border-destructive/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-destructive">{t('dangerZone')}</h3>
        </div>
        <div className="space-y-2">
          <button onClick={() => {
            if (confirm(t('confirmClearUsers'))) {
              localStorage.setItem('admin-users', '[]');
              window.location.reload();
            }
          }} className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
            {t('clearAllUsers')}
          </button>
          <button onClick={() => {
            if (confirm(t('confirmClearVouchers'))) {
              localStorage.setItem('admin-vouchers', '[]');
              window.location.reload();
            }
          }} className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
            {t('clearAllVouchers')}
          </button>
          <button onClick={() => {
            if (confirm(t('confirmResetAll'))) {
              localStorage.clear();
              window.location.reload();
            }
          }} className="w-full py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">
            {t('resetAllData')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
