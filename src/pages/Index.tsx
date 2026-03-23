import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import '@/lib/i18n';
import DeviceSelect from '@/components/DeviceSelect';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  const { deviceMode, theme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setMounted(true);
  }, [theme]);

  if (!mounted) {
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
