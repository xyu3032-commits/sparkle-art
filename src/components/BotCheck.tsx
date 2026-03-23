import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function generateCaptcha() {
  const a = Math.floor(Math.random() * 30) + 1;
  const b = Math.floor(Math.random() * 30) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

const BOT_CHECK_KEY = 'ai-bot-check-date';

export function needsBotCheck(): boolean {
  const last = localStorage.getItem(BOT_CHECK_KEY);
  if (!last) return true;
  const today = new Date().toDateString();
  return last !== today;
}

export function markBotCheckPassed() {
  localStorage.setItem(BOT_CHECK_KEY, new Date().toDateString());
}

const BotCheck: React.FC<{ onPass: () => void; onClose: () => void }> = ({ onPass, onClose }) => {
  const { t } = useTranslation();
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    setCaptcha(generateCaptcha());
    setInput('');
    setError(false);
  }, []);

  const verify = () => {
    if (parseInt(input) === captcha.answer) {
      markBotCheckPassed();
      onPass();
    } else {
      setError(true);
      refresh();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl border border-border p-6 w-full max-w-xs shadow-elevated"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-card-foreground text-sm">{t('botCheckTitle')}</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t('botCheckDesc')}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-mono font-bold text-foreground bg-secondary px-4 py-2 rounded-lg border border-border select-none">
              {captcha.question}
            </span>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              placeholder="?"
              className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {error && <p className="text-xs text-destructive mb-3">{t('captchaError')}</p>}
          <div className="flex gap-2">
            <button onClick={refresh} className="flex-1 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('refresh')}
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={verify}
              disabled={!input}
              className="flex-1 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium disabled:opacity-40"
            >
              {t('verify')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BotCheck;
