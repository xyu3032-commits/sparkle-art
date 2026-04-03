import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Users, BarChart3, Ticket, Cpu, LogOut, ArrowLeft,
  Plus, Ban, CheckCircle, Download, Search, ToggleLeft, ToggleRight,
  TrendingUp, UserPlus, Trash2, Edit3, Megaphone, GlassWater, Save, X,
  Crown, Star, Gem, Eye, EyeOff, Settings, Database, Activity, Clock,
  AlertTriangle, RefreshCw, FileText, Zap, HardDrive, Upload, Copy,
  ClipboardList, KeyRound, UserCheck, UserX, Gift, Mail, History,
  ChevronDown, ChevronUp, MoreHorizontal, Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminStore, type ManagedUser } from '@/lib/adminStore';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'users' | 'vouchers' | 'models' | 'notices' | 'logs' | 'settings';

// Operation log helper
function addLog(action: string, detail: string) {
  const logs = JSON.parse(localStorage.getItem('admin-logs') || '[]');
  logs.unshift({ id: crypto.randomUUID(), action, detail, time: Date.now() });
  if (logs.length > 200) logs.length = 200;
  localStorage.setItem('admin-logs', JSON.stringify(logs));
}

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
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow"
            >
              <Shield className="w-7 h-7 text-primary-foreground" />
            </motion.div>
            <h1 className="text-xl font-bold text-foreground">{t('adminPanel')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('adminLoginDesc')}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (admin.adminLogin(password)) { addLog('login', 'Admin logged in'); toast.success(t('loginSuccess')); } else { toast.error(t('adminPasswordError')); } }} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('adminPassword')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} type="submit" className="w-full py-2.5 rounded-xl gradient-bg text-primary-foreground font-medium text-sm shadow-glow">
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
    { id: 'logs', icon: History, label: t('operationLogs') },
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
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all glass-btn-action
                ${activeTab === tab.id ? 'gradient-bg text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-secondary'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </nav>
        <div className="p-2 border-t border-border space-y-1">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => admin.setGlassEffect(!admin.glassEffect)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground glass-btn-action transition-all">
            <GlassWater className="w-4 h-4" />
            <span className="flex-1 text-left">{t('glassEffect')}</span>
            {admin.glassEffect ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground glass-btn-action transition-all">
            <ArrowLeft className="w-4 h-4" /> {t('backToApp')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { admin.adminLogout(); addLog('logout', 'Admin logged out'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" /> {t('logout')}
          </motion.button>
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
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'vouchers' && <VouchersTab />}
            {activeTab === 'models' && <ModelsTab />}
            {activeTab === 'notices' && <NoticesTab />}
            {activeTab === 'logs' && <LogsTab />}
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
  const bannedUsers = useAdminStore().users.filter(u => u.banned).length;
  const proUsers = useAdminStore().users.filter(u => u.level === 'pro' || u.level === 'lifetime').length;

  const statCards = [
    { label: t('totalUsersLabel'), value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: t('totalGenerations'), value: stats.totalGenerations, icon: TrendingUp, color: 'text-accent' },
    { label: t('todayActive'), value: stats.todayActive, icon: Activity, color: 'text-primary' },
    { label: t('unusedVouchers'), value: unusedVouchers, icon: Ticket, color: 'text-accent' },
    { label: t('bannedUsersCount'), value: bannedUsers, icon: Ban, color: 'text-destructive' },
    { label: t('proUsersCount'), value: proUsers, icon: Crown, color: 'text-primary' },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="admin-glass-card border border-border rounded-2xl p-4 glass-btn-action">
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
          { label: t('clearAllData'), icon: Trash2, action: () => { localStorage.removeItem('ai-usage-stats'); addLog('clear', 'Cleared usage stats'); toast.success(t('dataCleared')); }, color: 'text-destructive' },
          { label: t('exportAllData'), icon: Download, action: () => { exportAllData(); addLog('export', 'Exported all data'); toast.success(t('exportSuccess')); }, color: 'text-primary' },
          { label: t('importData'), icon: Upload, action: () => handleImportData(), color: 'text-accent' },
          { label: t('refreshStats'), icon: RefreshCw, action: () => { window.location.reload(); }, color: 'text-primary' },
        ].map((a, i) => (
          <motion.button key={i} whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.03 }}
            onClick={a.action}
            className="admin-glass-card border border-border rounded-xl p-3 flex items-center gap-2 glass-btn-action">
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

      {/* Recent Logs Preview */}
      <div className="admin-glass-card border border-border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          {t('recentActivity')}
        </h3>
        <div className="space-y-2">
          {JSON.parse(localStorage.getItem('admin-logs') || '[]').slice(0, 5).map((log: any) => (
            <div key={log.id} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground whitespace-nowrap">{new Date(log.time).toLocaleTimeString()}</span>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{log.action}</span>
              <span className="text-foreground truncate">{log.detail}</span>
            </div>
          ))}
          {JSON.parse(localStorage.getItem('admin-logs') || '[]').length === 0 && (
            <p className="text-xs text-muted-foreground">{t('noLogs')}</p>
          )}
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
    logs: JSON.parse(localStorage.getItem('admin-logs') || '[]'),
    siteSettings: {
      siteName: localStorage.getItem('admin-site-name') || '',
      siteDesc: localStorage.getItem('admin-site-desc') || '',
      defaultQuota: localStorage.getItem('admin-default-quota') || '100',
      maxDaily: localStorage.getItem('admin-max-daily') || '1000',
    },
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `admin-export-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url);
}

function handleImportData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.users) localStorage.setItem('admin-users', JSON.stringify(data.users));
        if (data.vouchers) localStorage.setItem('admin-vouchers', JSON.stringify(data.vouchers));
        if (data.stats) localStorage.setItem('ai-usage-stats', JSON.stringify(data.stats));
        if (data.notices) localStorage.setItem('admin-notices', JSON.stringify(data.notices));
        if (data.modelConfigs) localStorage.setItem('admin-model-configs', JSON.stringify(data.modelConfigs));
        addLog('import', `Imported data from ${file.name}`);
        toast.success('Data imported successfully');
        setTimeout(() => window.location.reload(), 500);
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
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
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || u.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleAdd = () => {
    if (!newEmail) return;
    addUser({ email: newEmail, username: newUsername || newEmail.split('@')[0], level: newLevel, quota: 100, usedQuota: 0, banned: false, expiresAt: null });
    addLog('addUser', `Added user: ${newEmail}`);
    setNewEmail(''); setNewUsername(''); setShowAdd(false);
    toast.success(t('userAdded'));
  };

  const handleDelete = (id: string, username: string) => {
    if (!confirm(t('confirmDeleteUser'))) return;
    deleteUser(id);
    addLog('deleteUser', `Deleted user: ${username}`);
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
    addLog('editUser', `Edited user: ${editingUser.username}`);
    setEditingUser(null);
    toast.success(t('userUpdated'));
  };

  const handleBatchBan = () => {
    selectedUsers.forEach(id => banUser(id));
    addLog('batchBan', `Banned ${selectedUsers.size} users`);
    toast.success(`${t('ban')} ${selectedUsers.size} ${t('adminUsers')}`);
    setSelectedUsers(new Set());
  };

  const handleBatchUnban = () => {
    selectedUsers.forEach(id => unbanUser(id));
    addLog('batchUnban', `Unbanned ${selectedUsers.size} users`);
    toast.success(`${t('unban')} ${selectedUsers.size} ${t('adminUsers')}`);
    setSelectedUsers(new Set());
  };

  const handleBatchDelete = () => {
    if (!confirm(t('confirmBatchDelete'))) return;
    selectedUsers.forEach(id => deleteUser(id));
    addLog('batchDelete', `Deleted ${selectedUsers.size} users`);
    toast.success(`${t('deleteUser')} ${selectedUsers.size}`);
    setSelectedUsers(new Set());
  };

  const handleBatchSetLevel = (level: ManagedUser['level']) => {
    selectedUsers.forEach(id => updateUser(id, { level }));
    addLog('batchLevel', `Set ${selectedUsers.size} users to ${level}`);
    toast.success(`${t('userUpdated')} (${selectedUsers.size})`);
    setSelectedUsers(new Set());
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filtered.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filtered.map(u => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedUsers(next);
  };

  const handleResetQuota = (id: string, username: string) => {
    updateUser(id, { usedQuota: 0 });
    addLog('resetQuota', `Reset quota for: ${username}`);
    toast.success(t('quotaReset'));
  };

  const handleGiveQuota = (id: string, username: string) => {
    const amount = prompt(t('enterQuotaAmount'), '100');
    if (!amount) return;
    const user = users.find(u => u.id === id);
    if (user) {
      updateUser(id, { quota: user.quota + parseInt(amount) });
      addLog('giveQuota', `Gave ${amount} quota to: ${username}`);
      toast.success(t('quotaAdded'));
    }
  };

  const levelIcons: Record<string, React.ElementType> = { free: Star, pro: Crown, lifetime: Gem };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg font-bold text-foreground">{t('adminUsers')} ({users.length})</h1>
        <div className="flex gap-2">
          {selectedUsers.size > 0 && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowBatchActions(!showBatchActions)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground flex items-center gap-1 border border-border">
              <MoreHorizontal className="w-3.5 h-3.5" /> {t('batchActions')} ({selectedUsers.size})
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.03 }} onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium flex items-center gap-1 shadow-glow">
            <UserPlus className="w-3.5 h-3.5" /> {t('addUser')}
          </motion.button>
        </div>
      </div>

      {/* Batch Actions Panel */}
      <AnimatePresence>
        {showBatchActions && selectedUsers.size > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="admin-glass-card border border-border rounded-xl p-3 overflow-hidden">
            <div className="flex flex-wrap gap-2">
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleBatchBan}
                className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
                <Ban className="w-3.5 h-3.5" /> {t('batchBan')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleBatchUnban}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {t('batchUnban')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleBatchDelete}
                className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> {t('batchDelete')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleBatchSetLevel('pro')}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> {t('setToPro')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleBatchSetLevel('free')}
                className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-medium flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> {t('setToFree')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="admin-glass-card border border-border rounded-xl p-3 space-y-2 overflow-hidden">
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={t('emailPlaceholder')}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder={t('usernamePlaceholder')}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <select value={newLevel} onChange={e => setNewLevel(e.target.value as ManagedUser['level'])}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none">
              <option value="free">{t('levelFree')}</option>
              <option value="pro">{t('levelPro')}</option>
              <option value="lifetime">{t('levelLifetime')}</option>
            </select>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleAdd} className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">{t('addUser')}</motion.button>
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
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t('currentLevel')}</label>
                  <select value={editingUser.level} onChange={e => setEditingUser({ ...editingUser, level: e.target.value as ManagedUser['level'] })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border">
                    <option value="guest">{t('levelGuest')}</option>
                    <option value="free">{t('levelFree')}</option>
                    <option value="pro">{t('levelPro')}</option>
                    <option value="lifetime">{t('levelLifetime')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t('remainQuota')}</label>
                  <input type="number" value={editingUser.quota} onChange={e => setEditingUser({ ...editingUser, quota: +e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('memberStyle')}</label>
                <select value={editingUser.memberStyle || 'default'} onChange={e => setEditingUser({ ...editingUser, memberStyle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border">
                  <option value="default">{t('styleDefault')}</option>
                  <option value="gold">{t('styleGold')}</option>
                  <option value="diamond">{t('styleDiamond')}</option>
                  <option value="rainbow">{t('styleRainbow')}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveEdit} className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
                  <Save className="w-3.5 h-3.5" /> {t('save')}
                </motion.button>
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
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="px-3 py-2 rounded-xl bg-secondary text-sm text-foreground border border-border focus:outline-none">
          <option value="all">{t('allLevels')}</option>
          <option value="guest">{t('levelGuest')}</option>
          <option value="free">{t('levelFree')}</option>
          <option value="pro">{t('levelPro')}</option>
          <option value="lifetime">{t('levelLifetime')}</option>
        </select>
      </div>

      {/* Select All */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSelectAll}
            className="px-3 py-1 rounded-lg bg-secondary text-xs text-muted-foreground flex items-center gap-1 border border-border">
            {selectedUsers.size === filtered.length ? <CheckCircle className="w-3 h-3 text-primary" /> : <UserCheck className="w-3 h-3" />}
            {t('selectAll')} ({filtered.length})
          </motion.button>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noUsers')}</p>}
        {filtered.map(user => {
          const LevelIcon = levelIcons[user.level] || Star;
          const isSelected = selectedUsers.has(user.id);
          return (
            <motion.div key={user.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileHover={{ scale: 1.005 }}
              className={`admin-glass-card border rounded-xl p-3 flex items-center gap-3 transition-all
                ${user.banned ? 'opacity-50' : ''}
                ${isSelected ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleSelect(user.id)}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-all ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                {isSelected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
              </motion.button>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                user.memberStyle === 'gold' ? 'bg-accent/20' :
                user.memberStyle === 'diamond' ? 'bg-primary/20' :
                user.memberStyle === 'rainbow' ? 'gradient-bg' :
                'bg-secondary'
              }`}>
                <LevelIcon className={`w-4 h-4 ${
                  user.memberStyle === 'gold' ? 'text-accent' :
                  user.memberStyle === 'diamond' ? 'text-primary' :
                  user.memberStyle === 'rainbow' ? 'text-primary-foreground' :
                  'text-muted-foreground'
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
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleGiveQuota(user.id, user.username)}
                  className="p-1.5 rounded-lg glass-btn-icon transition-all" title={t('giveQuota')}>
                  <Gift className="w-3.5 h-3.5 text-primary" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleResetQuota(user.id, user.username)}
                  className="p-1.5 rounded-lg glass-btn-icon transition-all" title={t('resetQuota')}>
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setEditingUser({ ...user })}
                  className="p-1.5 rounded-lg glass-btn-icon transition-all" title={t('editUser')}>
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
                {user.banned ? (
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => { unbanUser(user.id); addLog('unban', user.username); toast.success(t('unban')); }}
                    className="p-1.5 rounded-lg glass-btn-icon transition-all" title={t('unban')}>
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => { banUser(user.id); addLog('ban', user.username); toast.success(t('ban')); }}
                    className="p-1.5 rounded-lg glass-btn-icon transition-all" title={t('ban')}>
                    <Ban className="w-3.5 h-3.5 text-destructive" />
                  </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleDelete(user.id, user.username)}
                  className="p-1.5 rounded-lg glass-btn-icon transition-all" title={t('deleteUser')}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </motion.button>
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
  const [searchCode, setSearchCode] = useState('');

  const handleGenerate = () => {
    if (!batch) { toast.error(t('batchRequired')); return; }
    const v = generateVouchers(batch, type, value, count, expDays);
    addLog('generateVouchers', `Generated ${v.length} vouchers (${batch})`);
    toast.success(`${t('vouchersGenerated')} (${v.length})`);
  };

  const handleExportCSV = () => {
    const header = 'Code,Type,Value,Batch,Used,UsedBy,Expires\n';
    const rows = vouchers.map(v => `${v.code},${v.type},${v.value},${v.batch},${v.used},${v.usedBy || ''},${new Date(v.expiresAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `vouchers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    addLog('exportCSV', `Exported ${vouchers.length} vouchers`);
    toast.success(t('exportSuccess'));
  };

  const handleCopyAll = () => {
    const codes = vouchers.filter(v => !v.used).map(v => v.code).join('\n');
    navigator.clipboard.writeText(codes);
    toast.success(t('copiedToClipboard'));
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchStatus = filterUsed === 'all' || (filterUsed === 'used' ? v.used : !v.used);
    const matchSearch = !searchCode || v.code.includes(searchCode.toUpperCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg font-bold text-foreground">{t('adminVouchers')} ({vouchers.length})</h1>
        <div className="flex gap-2">
          <select value={filterUsed} onChange={e => setFilterUsed(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground border border-border">
            <option value="all">{t('allVouchers')}</option>
            <option value="used">{t('used')}</option>
            <option value="unused">{t('unused')}</option>
          </select>
          {vouchers.length > 0 && (
            <>
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleCopyAll}
                className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1 glass-btn-action">
                <Copy className="w-3.5 h-3.5" /> {t('copyUnused')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1 glass-btn-action">
                <Download className="w-3.5 h-3.5" /> CSV
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Search vouchers */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={searchCode} onChange={e => setSearchCode(e.target.value)} placeholder={t('searchVoucher')}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> {t('generateVouchers')}
        </h3>
        <input value={batch} onChange={e => setBatch(e.target.value)} placeholder={t('batchName')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <div className="grid grid-cols-2 gap-2">
          <select value={type} onChange={e => setType(e.target.value as 'quota' | 'days')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border">
            <option value="quota">{t('voucherQuota')}</option>
            <option value="days">{t('voucherDays')}</option>
          </select>
          <input type="number" value={value} onChange={e => setValue(+e.target.value)} placeholder={t('voucherValue')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={count} onChange={e => setCount(+e.target.value)} placeholder={t('voucherCount')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
          <input type="number" value={expDays} onChange={e => setExpDays(+e.target.value)} placeholder={t('voucherExpDays')}
            className="px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.01 }} onClick={handleGenerate}
          className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium shadow-glow">
          {t('generateVouchers')}
        </motion.button>
      </div>

      <div className="space-y-2">
        {filteredVouchers.slice().reverse().slice(0, 50).map(v => (
          <motion.div key={v.id} whileHover={{ scale: 1.005 }}
            className={`admin-glass-card border border-border rounded-xl p-3 flex items-center gap-3 ${v.used ? 'opacity-50' : ''}`}>
            <Ticket className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-bold text-foreground">{v.code}</p>
              <p className="text-xs text-muted-foreground">{v.batch} · {v.type === 'quota' ? `${v.value} ${t('quotaUnit')}` : `${v.value} ${t('daysUnit')}`}
                {v.usedBy && ` · ${t('usedBy')}: ${v.usedBy.slice(0, 8)}...`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!v.used && (
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => { navigator.clipboard.writeText(v.code); toast.success(t('copiedToClipboard')); }}
                  className="p-1.5 rounded-lg glass-btn-icon">
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </motion.button>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v.used ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {v.used ? t('used') : t('unused')}
              </span>
            </div>
          </motion.div>
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
  const toolIcons: Record<string, React.ElementType> = {
    textGen: FileText, imageGen: Database, textToVideo: Zap,
    imageToVideo: Zap, audioGen: Activity,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">{t('adminModels')}</h1>
      <div className="space-y-2">
        {modelConfigs.map(mc => {
          const ToolIcon = toolIcons[mc.toolId] || Cpu;
          return (
            <motion.div key={mc.toolId} whileHover={{ scale: 1.005 }}
              className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ToolIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{toolLabels[mc.toolId] || mc.toolId}</span>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setModelConfig(mc.toolId, { enabled: !mc.enabled }); addLog('model', `${mc.enabled ? 'Disabled' : 'Enabled'} ${mc.toolId}`); }}>
                  {mc.enabled ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                </motion.button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{t('consumptionWeight')}</span>
                <input type="range" min={1} max={20} value={mc.weight}
                  onChange={e => { setModelConfig(mc.toolId, { weight: +e.target.value }); }}
                  className="flex-1 accent-[hsl(var(--primary))]" />
                <span className="text-xs font-bold text-foreground w-6 text-center">{mc.weight}x</span>
              </div>
            </motion.div>
          );
        })}
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
  const [editingNotice, setEditingNotice] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (!title.trim()) { toast.error(t('titleRequired')); return; }
    addNotice(title.trim(), content.trim());
    addLog('addNotice', title.trim());
    setTitle(''); setContent('');
    toast.success(t('noticeAdded'));
  };

  const handleEdit = (id: string) => {
    updateNotice(id, { title: editTitle, content: editContent });
    addLog('editNotice', editTitle);
    setEditingNotice(null);
    toast.success(t('userUpdated'));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">{t('adminNotices')} ({notices.length})</h1>

      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> {t('addNotice')}
        </h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('noticeTitle')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={t('noticeContent')} rows={3}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleAdd} className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium shadow-glow">
          {t('publishNotice')}
        </motion.button>
      </div>

      <div className="space-y-2">
        {notices.map(n => (
          <motion.div key={n.id} whileHover={{ scale: 1.005 }}
            className="admin-glass-card border border-border rounded-xl p-3 space-y-1">
            {editingNotice === n.id ? (
              <div className="space-y-2">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={2}
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none resize-none" />
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleEdit(n.id)}
                    className="flex-1 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium">{t('save')}</motion.button>
                  <button onClick={() => setEditingNotice(null)} className="flex-1 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground">{t('cancel')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{n.title}</span>
                  </div>
                  <div className="flex gap-0.5">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setEditingNotice(n.id); setEditTitle(n.title); setEditContent(n.content); }}
                      className="p-1 rounded glass-btn-icon">
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => { updateNotice(n.id, { enabled: !n.enabled }); addLog('toggleNotice', n.title); }}
                      className="p-1 rounded glass-btn-icon">
                      {n.enabled ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => { deleteNotice(n.id); addLog('deleteNotice', n.title); }}
                      className="p-1 rounded glass-btn-icon">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{n.content}</p>
                <p className="text-[10px] text-muted-foreground/60">{new Date(n.createdAt).toLocaleString()}</p>
              </>
            )}
          </motion.div>
        ))}
        {notices.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noNotices')}</p>}
      </div>
    </div>
  );
};

/* ===== Operation Logs ===== */
const LogsTab: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>(JSON.parse(localStorage.getItem('admin-logs') || '[]'));
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.detail.toLowerCase().includes(search.toLowerCase())
  );

  const handleClearLogs = () => {
    localStorage.setItem('admin-logs', '[]');
    setLogs([]);
    toast.success(t('logsCleared'));
  };

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `admin-logs-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(t('exportSuccess'));
  };

  const actionColors: Record<string, string> = {
    login: 'bg-primary/10 text-primary',
    logout: 'bg-secondary text-muted-foreground',
    addUser: 'bg-primary/10 text-primary',
    deleteUser: 'bg-destructive/10 text-destructive',
    editUser: 'bg-accent/10 text-accent',
    ban: 'bg-destructive/10 text-destructive',
    unban: 'bg-primary/10 text-primary',
    batchBan: 'bg-destructive/10 text-destructive',
    batchUnban: 'bg-primary/10 text-primary',
    batchDelete: 'bg-destructive/10 text-destructive',
    generateVouchers: 'bg-primary/10 text-primary',
    export: 'bg-accent/10 text-accent',
    import: 'bg-accent/10 text-accent',
    model: 'bg-primary/10 text-primary',
    clear: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg font-bold text-foreground">{t('operationLogs')} ({logs.length})</h1>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.93 }} onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1 glass-btn-action">
            <Download className="w-3.5 h-3.5" /> {t('exportAllData')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.93 }} onClick={handleClearLogs}
            className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> {t('clearLogs')}
          </motion.button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLogs')}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="space-y-1.5">
        {filtered.slice(0, 100).map((log: any) => (
          <motion.div key={log.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
            className="admin-glass-card border border-border rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap min-w-[70px]">
              {new Date(log.time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${actionColors[log.action] || 'bg-secondary text-muted-foreground'}`}>
              {log.action}
            </span>
            <span className="text-xs text-foreground truncate">{log.detail}</span>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noLogs')}</p>}
      </div>
    </div>
  );
};

/* ===== Admin Settings ===== */
const AdminSettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const admin = useAdminStore();
  const [siteName, setSiteName] = useState(localStorage.getItem('admin-site-name') || '');
  const [siteDesc, setSiteDesc] = useState(localStorage.getItem('admin-site-desc') || '');
  const [defaultQuota, setDefaultQuota] = useState(parseInt(localStorage.getItem('admin-default-quota') || '100'));
  const [maxDaily, setMaxDaily] = useState(parseInt(localStorage.getItem('admin-max-daily') || '1000'));
  const [registrationOpen, setRegistrationOpen] = useState(localStorage.getItem('admin-registration') !== 'false');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveSiteSettings = () => {
    localStorage.setItem('admin-site-name', siteName);
    localStorage.setItem('admin-site-desc', siteDesc);
    localStorage.setItem('admin-default-quota', String(defaultQuota));
    localStorage.setItem('admin-max-daily', String(maxDaily));
    localStorage.setItem('admin-registration', String(registrationOpen));
    addLog('settings', 'Saved site settings');
    toast.success(t('settingsSaved'));
  };

  const handleChangePassword = () => {
    if (oldPassword !== 'admin888') {
      toast.error(t('adminPasswordError'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }
    localStorage.setItem('admin-password', newPassword);
    addLog('password', 'Changed admin password');
    toast.success(t('passwordChanged'));
    setOldPassword(''); setNewPassword('');
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
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <textarea value={siteDesc} onChange={e => setSiteDesc(e.target.value)} placeholder={t('siteDesc')} rows={2}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('defaultQuota')}</label>
            <input type="number" value={defaultQuota} onChange={e => setDefaultQuota(+e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('maxDailyUsage')}</label>
            <input type="number" value={maxDaily} onChange={e => setMaxDaily(+e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{t('openRegistration')}</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRegistrationOpen(!registrationOpen)}>
            {registrationOpen ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
          </motion.button>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveSiteSettings}
          className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-1 shadow-glow">
          <Save className="w-3.5 h-3.5" /> {t('save')}
        </motion.button>
      </div>

      {/* Change Password */}
      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('changePassword')}</h3>
        </div>
        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder={t('currentPassword')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('newPassword')}
          className="w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleChangePassword}
          className="w-full py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
          <KeyRound className="w-3.5 h-3.5" /> {t('changePassword')}
        </motion.button>
      </div>

      {/* System Info */}
      <div className="admin-glass-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('systemInfo')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('storageUsed'), value: `${storageUsed} KB` },
            { label: t('totalUsersLabel'), value: admin.users.length },
            { label: t('totalVouchers'), value: admin.vouchers.length },
            { label: t('totalNotices'), value: admin.notices.length },
          ].map((item, i) => (
            <div key={i} className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="admin-glass-card border border-destructive/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-destructive">{t('dangerZone')}</h3>
        </div>
        <div className="space-y-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
            if (confirm(t('confirmClearUsers'))) {
              localStorage.setItem('admin-users', '[]');
              addLog('clear', 'Cleared all users');
              window.location.reload();
            }
          }} className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
            {t('clearAllUsers')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
            if (confirm(t('confirmClearVouchers'))) {
              localStorage.setItem('admin-vouchers', '[]');
              addLog('clear', 'Cleared all vouchers');
              window.location.reload();
            }
          }} className="w-full py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
            {t('clearAllVouchers')}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
            if (confirm(t('confirmResetAll'))) {
              addLog('reset', 'Reset all data');
              localStorage.clear();
              window.location.reload();
            }
          }} className="w-full py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">
            {t('resetAllData')}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
