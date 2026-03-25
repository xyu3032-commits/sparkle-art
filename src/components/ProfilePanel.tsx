import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProfilePanel: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { user, setAuth } = useAppStore();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSaveProfile = () => {
    if (!username.trim()) return;
    const updated = { ...user!, username: username.trim(), email: email.trim() };
    setAuth(updated);
    localStorage.setItem('ai-user', JSON.stringify(updated));
    toast.success(t('profileSaved'));
    onClose();
  };

  const handleChangePassword = () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }
    // Placeholder - real auth will handle this
    toast.success(t('passwordChanged'));
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-card border border-border rounded-2xl z-[60] flex flex-col max-h-[75vh] overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-border flex-shrink-0">
              <h2 className="font-semibold text-card-foreground text-sm">{t('profileSettings')}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {t('username')}
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl gradient-bg text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('saveProfile')}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{t('changePassword')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Old Password */}
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> {t('oldPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showOld ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> {t('newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showNew ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleChangePassword}
                className="w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors border border-border"
              >
                <Lock className="w-4 h-4" />
                {t('changePassword')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfilePanel;
