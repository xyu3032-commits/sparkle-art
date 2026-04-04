import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Image, Film, Music, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const features = [
  { icon: MessageSquare, color: 'from-blue-500 to-cyan-400', key: 'textGen', descKey: 'welcomeTextDesc' },
  { icon: Image, color: 'from-purple-500 to-pink-400', key: 'imageGen', descKey: 'welcomeImageDesc' },
  { icon: Film, color: 'from-orange-500 to-red-400', key: 'textToVideo', descKey: 'welcomeVideoDesc' },
  { icon: Music, color: 'from-green-500 to-emerald-400', key: 'audioGen', descKey: 'welcomeAudioDesc' },
];

const highlights = [
  { icon: Zap, key: 'welcomeFast' },
  { icon: Shield, key: 'welcomeSafe' },
  { icon: Globe, key: 'welcomeMultiLang' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.03]"
          style={{
            background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
          }}
        />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              background: `radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)`,
              left: `${20 + i * 25}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-glow"
              >
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold gradient-text mb-3"
              >
                {t('appName')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto leading-relaxed"
              >
                {t('welcomeSubtitle')}
              </motion.p>

              {/* Highlight chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-3 mb-8 flex-wrap"
              >
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-xs text-muted-foreground"
                  >
                    <h.icon className="w-3 h-3 text-primary" />
                    {t(h.key)}
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(1)}
                className="pill-btn-glow gradient-bg text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2 shadow-glow"
              >
                {t('welcomeExplore')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-xl font-bold text-center text-foreground mb-6">{t('welcomeFeatures')}</h2>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map((f, i) => (
                  <motion.div
                    key={f.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="p-4 rounded-2xl bg-card border border-border admin-glass-card"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                      <f.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-card-foreground mb-1">{t(f.key)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onEnter}
                  className="pill-btn-glow gradient-bg text-primary-foreground px-10 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2 shadow-glow"
                >
                  {t('welcomeStart')}
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WelcomeScreen;
