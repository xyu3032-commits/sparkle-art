import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const DeviceSelect: React.FC = () => {
  const { t } = useTranslation();
  const setDeviceMode = useAppStore((s) => s.setDeviceMode);
  const [hovered, setHovered] = useState<string | null>(null);

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: t('desktop'), desc: t('desktopDesc') },
    { id: 'mobile' as const, icon: Smartphone, label: t('mobile'), desc: t('mobileDesc') },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03] gradient-bg"
          style={{ top: '-200px', right: '-200px' }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03] gradient-bg"
          style={{ bottom: '-100px', left: '-100px' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">{t('appName')}</h1>
        </div>
        <p className="text-muted-foreground text-lg">{t('selectDevice')}</p>
      </motion.div>

      <div className="flex flex-col gap-5 w-full max-w-sm relative z-10">
        {devices.map((device, i) => (
          <motion.button
            key={device.id}
            initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => setHovered(device.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setDeviceMode(device.id)}
            className="relative group w-full p-6 rounded-2xl bg-card border border-border shadow-elevated hover:shadow-glow transition-shadow duration-300 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <device.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-card-foreground">{device.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{device.desc}</p>
              </div>
              <motion.div
                animate={{ x: hovered === device.id ? 4 : 0, opacity: hovered === device.id ? 1 : 0.4 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DeviceSelect;
