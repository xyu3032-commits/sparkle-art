import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trash2, Pin, Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '@/lib/chatStore';
import { toast } from 'sonner';

const QuickToolbar: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { currentSessionId, deleteSession } = useChatStore();

  const handleClear = () => {
    if (currentSessionId) {
      deleteSession(currentSessionId);
      toast.success(t('chatCleared'));
    }
    setOpen(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(t('linkCopied'));
    setOpen(false);
  };

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="flex flex-col gap-1.5 mb-1.5"
          >
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleClear} title={t('clearChat')}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-elevated">
              <Trash2 className="w-4 h-4 text-destructive" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} title={t('shareLink')}
              className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-elevated">
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-elevated transition-colors ${open ? 'bg-card border border-border' : 'gradient-bg shadow-glow'}`}
      >
        {open ? <X className="w-4 h-4 text-muted-foreground" /> : <Zap className="w-4.5 h-4.5 text-primary-foreground" />}
      </motion.button>
    </div>
  );
};

export default QuickToolbar;
