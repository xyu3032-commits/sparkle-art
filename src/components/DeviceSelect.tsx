import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';

const DeviceSelect: React.FC = () => {
  const { t } = useTranslation();
  const setDeviceMode = useAppStore((s) => s.setDeviceMode);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: t('desktop'), desc: t('desktopDesc') },
    { id: 'mobile' as const, icon: Smartphone, label: t('mobile'), desc: t('mobileDesc') },
  ];

  const handleSelect = (id: 'desktop' | 'mobile') => {
    setSelected(id);
    setTimeout(() => setDeviceMode(id), 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] gradient-bg blur-3xl"
          style={{ top: '-15%', right: '-10%' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] gradient-bg blur-3xl"
          style={{ bottom: '-10%', left: '-10%' }}
          animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full opacity-[0.03] gradient-bg blur-2xl"
          style={{ top: '40%', left: '50%' }}
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-glow"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl font-bold gradient-text mb-2"
        >
          {t('appName')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-muted-foreground text-base"
        >
          {t('selectDevice')}
        </motion.p>
      </motion.div>

      {/* Device cards */}
      <div className="flex flex-col gap-4 w-full max-w-sm relative z-10">
        <AnimatePresence>
          {devices.map((device, i) => (
            <motion.button
              key={device.id}
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{
                opacity: selected && selected !== device.id ? 0.3 : 1,
                y: 0,
                filter: 'blur(0px)',
                scale: selected === device.id ? 0.95 : 1,
              }}
              transition={{
                duration: 0.7,
                delay: 0.4 + i * 0.15,
                ease: [0.16, 1, 0.3, 1],
                scale: { duration: 0.3 },
                opacity: { duration: 0.3 },
              }}
              whileHover={{ scale: selected ? undefined : 1.02, y: selected ? undefined : -2 }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHovered(device.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !selected && handleSelect(device.id)}
              className="relative group w-full p-6 rounded-2xl bg-card border border-border shadow-elevated hover:shadow-glow transition-all duration-300 text-left overflow-hidden"
            >
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 opacity-0 gradient-bg"
                animate={{ opacity: hovered === device.id ? 0.04 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <div className="flex items-center gap-4 relative z-10">
                <motion.div
                  className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-glow"
                  animate={{
                    rotate: hovered === device.id ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <device.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-card-foreground">{device.label}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{device.desc}</p>
                </div>
                <motion.div
                  animate={{
                    x: hovered === device.id ? 6 : 0,
                    opacity: hovered === device.id ? 1 : 0.3,
                    scale: hovered === device.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <ArrowRight className="w-5 h-5 text-primary" />
                </motion.div>
              </div>

              {/* Selection flash */}
              {selected === device.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full gradient-bg"
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground relative z-10"
      >
        <Zap className="w-3 h-3" />
        <span>{t('settings')}中可随时切换</span>
      </motion.div>
    </div>
  );
};

export default DeviceSelect;
