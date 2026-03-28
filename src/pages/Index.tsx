import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import '@/lib/i18n';
import DeviceSelect from '@/components/DeviceSelect';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  const { deviceMode, theme, themePreset, user } = useAppStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Apply theme preset class on mount
    document.documentElement.classList.remove('theme-alpine', 'theme-midnight', 'theme-nebula', 'theme-parchment', 'dark');
    document.documentElement.classList.add(`theme-${themePreset}`);
    if (themePreset === 'midnight' || themePreset === 'nebula') {
      // dark themes handled by CSS class
    }
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

  if (!deviceMode) return <DeviceSelect />;

  return <Dashboard />;
};

export default Index;
