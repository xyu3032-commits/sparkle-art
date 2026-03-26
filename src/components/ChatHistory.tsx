import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MessageSquare, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChatStore, ChatSession } from '@/lib/chatStore';

interface Props {
  open: boolean;
  onClose: () => void;
  toolId: string;
}

const ChatHistory: React.FC<Props> = ({ open, onClose, toolId }) => {
  const { t } = useTranslation();
  const { sessions, currentSessionId, setCurrentSession, deleteSession, createSession } = useChatStore();
  const toolSessions = sessions.filter((s) => s.toolId === toolId);

  const handleSelect = (id: string) => {
    setCurrentSession(id);
    onClose();
  };

  const handleNew = () => {
    createSession(toolId);
    onClose();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-card border-r border-border z-50 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t('chatHistory')}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleNew}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium gradient-bg text-primary-foreground"
              >
                <MessageSquare className="w-4 h-4" />
                {t('newChat')}
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
              {toolSessions.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">
                  {t('noChatHistory')}
                </div>
              ) : (
                toolSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
                      currentSessionId === session.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-card-foreground hover:bg-secondary'
                    }`}
                    onClick={() => handleSelect(session.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">
                        {session.title || t('newChat')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatTime(session.updatedAt)} · {session.messages.length} {t('messages')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatHistory;
