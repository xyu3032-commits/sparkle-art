import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Users, BarChart3, Ticket, Cpu, LogOut, ArrowLeft,
  Plus, Ban, CheckCircle, Download, Search, Settings2, ToggleLeft, ToggleRight,
  TrendingUp, UserPlus, Trash2, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminStore, type ManagedUser, type Voucher } from '@/lib/adminStore';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'users' | 'vouchers' | 'models' | 'apis';

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
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col max-md:hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm gradient-text">{t('adminPanel')}</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${activeTab === tab.id ? 'gradient-bg text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-secondary'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border space-y-1">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('backToApp')}
          </button>
          <button onClick={() => admin.adminLogout()} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'vouchers' && <VouchersTab />}
            {activeTab === 'models' && <ModelsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DashboardTab: React.FC<{ stats: { totalUsers: number; totalGenerations: number; todayActive: number } }> = ({ stats }) => {
  const { t } = useTranslation();
  const allStats = JSON.parse(localStorage.getItem('ai-usage-stats') || '{}');

  const statCards = [
    { label: t('totalUsersLabel'), value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: t('totalGenerations'), value: stats.totalGenerations, icon: TrendingUp, color: 'text-accent' },
    { label: t('todayActive'), value: stats.todayActive, icon: BarChart3, color: 'text-green-500' },
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
      <h1 className="text-lg font-bold text-foreground">{t('adminDashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
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

const UsersTab: React.FC = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUser, banUser, unbanUser } = useAdminStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newLevel, setNewLevel] = useState<ManagedUser['level']>('free');

  const filtered = users.filter(u => u.email.includes(search) || u.username.includes(search));

  const handleAdd = () => {
    if (!newEmail) return;
    addUser({ email: newEmail, username: newUsername || newEmail.split('@')[0], level: newLevel, quota: 100, usedQuota: 0, banned: false, expiresAt: null });
    setNewEmail(''); setNewUsername(''); setShowAdd(false);
    toast.success(t('userAdded'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-foreground">{t('adminUsers')}</h1>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium flex items-center gap-1">
          <UserPlus className="w-3.5 h-3.5" /> {t('addUser')}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-card border border-border rounded-xl p-3 space-y-2 overflow-hidden">
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
              <button onClick={handleAdd} className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">{t('addApi')}</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg bg-secondary text-sm text-muted-foreground">{t('cancel')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchUsers')}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noUsers')}</p>}
        {filtered.map(user => (
          <div key={user.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              user.level === 'pro' ? 'bg-primary/10 text-primary' :
              user.level === 'lifetime' ? 'bg-accent/10 text-accent' :
              'bg-secondary text-muted-foreground'
            }`}>
              {t(`level${user.level.charAt(0).toUpperCase() + user.level.slice(1)}`)}
            </span>
            <div className="flex gap-1">
              {user.banned ? (
                <button onClick={() => unbanUser(user.id)} className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors" title={t('unban')}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </button>
              ) : (
                <button onClick={() => banUser(user.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title={t('ban')}>
                  <Ban className="w-4 h-4 text-destructive" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VouchersTab: React.FC = () => {
  const { t } = useTranslation();
  const { vouchers, generateVouchers } = useAdminStore();
  const [batch, setBatch] = useState('');
  const [type, setType] = useState<'quota' | 'days'>('quota');
  const [value, setValue] = useState(100);
  const [count, setCount] = useState(10);
  const [expDays, setExpDays] = useState(30);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-foreground">{t('adminVouchers')}</h1>
        {vouchers.length > 0 && (
          <button onClick={handleExportCSV} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground flex items-center gap-1 hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
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
        {vouchers.slice().reverse().slice(0, 50).map(v => (
          <div key={v.id} className={`bg-card border border-border rounded-xl p-3 flex items-center gap-3 ${v.used ? 'opacity-50' : ''}`}>
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
        {vouchers.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">{t('noVouchers')}</p>}
      </div>
    </div>
  );
};

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
          <div key={mc.toolId} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{toolLabels[mc.toolId] || mc.toolId}</span>
              </div>
              <button onClick={() => setModelConfig(mc.toolId, { enabled: !mc.enabled })}
                className="p-1">
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

export default Admin;
