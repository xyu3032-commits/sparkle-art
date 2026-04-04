import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import '@/lib/i18n';
import DeviceSelect from '@/components/DeviceSelect';
import Dashboard from '@/components/Dashboard';
import WelcomeScreen from '@/components/WelcomeScreen';

const Index: React.FC = () => {
  const { deviceMode, theme, themePreset, user } = useAppStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('ai-welcome-seen'));

  useEffect(() => {
    document.documentElement.classList.remove('theme-alpine', 'theme-midnight', 'theme-nebula', 'theme-parchment', 'dark');
    document.documentElement.classList.add(`theme-${themePreset}`);
    setMounted(true);
  }, [theme, themePreset]);

  useEffect(() => {
    if (mounted && !user) {
      navigate('/auth', { replace: true });
    }
  }, [mounted, user, navigate]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <WelcomeScreen
        onEnter={() => {
          localStorage.setItem('ai-welcome-seen', '1');
          setShowWelcome(false);
        }}
      />
    );
  }

  if (!deviceMode) return <DeviceSelect />;

  return <Dashboard />;
};

export default Index;
