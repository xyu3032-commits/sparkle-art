import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_KEY = 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok';
const BASE_URL = 'https://api.siliconflow.cn/v1';
const MODEL = 'Qwen/Qwen2.5-7B-Instruct';

const TextGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { setSettingsOpen, trackUsage } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) =>
                prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {}
        }
      }
      trackUsage('textGen');
      toast.success(t('genSuccess'));
    } catch (err) {
      toast.error(t('genFailed'));
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Error: ' + (err instanceof Error ? err.message : 'Unknown error') }]);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-card-foreground">{t('textGen')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">SiliconFlow · {MODEL}</p>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettingsOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer
                  ${msg.role === 'user' ? 'bg-primary' : 'gradient-bg'}`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </motion.button>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}
              >
                {msg.content || (loading && i === messages.length - 1 ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('generating')}
                  </span>
                ) : null)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('noResult')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t('chatPlaceholder')}
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TextGenerator;
