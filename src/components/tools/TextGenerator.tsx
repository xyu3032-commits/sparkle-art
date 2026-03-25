import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ChevronDown, Check, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore, defaultApis } from '@/lib/store';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TextGenerator: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trackUsage, getActiveApiForTool, customApis, activeApis, setActiveApi, setUserCenterOpen, user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiDropdown, setApiDropdown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allApis = [...defaultApis, ...customApis].filter(a => a.toolId === 'textGen');
  const api = getActiveApiForTool('textGen');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const apiKey = api?.apiKey || 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok';
    const baseUrl = api?.baseUrl || 'https://api.siliconflow.cn/v1';
    const model = api?.model || 'Qwen/Qwen2.5-7B-Instruct';

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })), stream: true }),
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
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m)));
            }
          } catch {}
        }
      }
      trackUsage('textGen');
      toast.success(t('genSuccess'));
    } catch (err) {
      toast.error(t('genFailed'));
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Error: ' + (err instanceof Error ? err.message : 'Unknown') }]);
    }
    setLoading(false);
  };

  const handleAvatarClick = (role: 'user' | 'assistant') => {
    if (role === 'user') {
      if (user?.isGuest) navigate('/auth');
      else setUserCenterOpen(true);
    } else {
      setApiDropdown(!apiDropdown);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col h-full">
      {/* Header with API switcher */}
      <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-card-foreground text-sm sm:text-base">{t('textGen')}</h2>
        </div>
        <div className="relative">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setApiDropdown(!apiDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/80 border border-border text-xs font-medium text-card-foreground hover:bg-secondary transition-colors">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="max-w-[100px] truncate">{api?.name || 'Default'}</span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${apiDropdown ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {apiDropdown && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setApiDropdown(false)} className="fixed inset-0 z-30" />
                <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-lg z-40 overflow-hidden">
                  {allApis.map((a) => {
                    const isActive = activeApis['textGen'] === a.id || (!activeApis['textGen'] && a.id.startsWith('default'));
                    return (
                      <button key={a.id} onClick={() => { setActiveApi('textGen', a.id); setApiDropdown(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${isActive ? 'bg-primary/5 text-primary' : 'text-card-foreground hover:bg-secondary'}`}>
                        {isActive ? <Check className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5 text-muted-foreground" />}
                        <div className="text-left min-w-0">
                          <p className="font-medium truncate">{a.name}</p>
                          <p className="text-muted-foreground truncate">{a.model}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAvatarClick(msg.role)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${msg.role === 'user' ? 'bg-primary' : 'gradient-bg'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />}
              </motion.button>
              <div className={`max-w-[80%] sm:max-w-[75%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
                {msg.content || (loading && i === messages.length - 1 ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('generating')}</span>
                ) : null)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('noResult')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-border">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder={t('chatPlaceholder')}
            className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={sendMessage} disabled={loading || !input.trim()}
            className="px-3 sm:px-4 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TextGenerator;
