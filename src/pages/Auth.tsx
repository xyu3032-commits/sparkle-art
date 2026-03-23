import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, theme } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== captcha.answer) {
      toast.error(t('captchaError'));
      refreshCaptcha();
      return;
    }
    setLoading(true);
    // Simulate auth - user will implement real auth later
    await new Promise((r) => setTimeout(r, 800));
    const user = { email, username: username || email.split('@')[0], isGuest: false };
    setAuth(user);
    localStorage.setItem('ai-user', JSON.stringify(user));
    toast.success(mode === 'login' ? t('loginSuccess') : t('registerSuccess'));
    navigate('/');
    setLoading(false);
  };

  const handleGuest = () => {
    const user = { email: '', username: t('guest'), isGuest: true };
    setAuth(user);
    localStorage.setItem('ai-user', JSON.stringify(user));
    navigate('/');
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth - user will implement later
    toast.info(t('googleLoginPlaceholder'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-glow"
          >
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <h1 className="text-xl font-bold text-foreground">{t('appName')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); refreshCaptcha(); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t(m)}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('usernamePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            {/* CAPTCHA */}
            <div className="bg-secondary/60 rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-card-foreground">{t('captchaTitle')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-foreground bg-card px-3 py-1.5 rounded-lg border border-border select-none">
                  {captcha.question}
                </span>
                <input
                  type="number"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder={t('captchaAnswer')}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-card text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button type="button" onClick={refreshCaptcha} className="text-xs text-primary hover:underline whitespace-nowrap">
                  {t('refresh')}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl gradient-bg text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? t('login') : t('register')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{t('or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google login */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          className="w-full py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('googleLogin')}
        </motion.button>

        {/* Guest */}
        <button
          onClick={handleGuest}
          className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('guestMode')}
        </button>
      </motion.div>
    </div>
  );
};

export default Auth;
