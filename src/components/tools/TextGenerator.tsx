import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ChevronDown, Check, Cpu, Plus, History, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore, defaultApis } from '@/lib/store';
import { useChatStore } from '@/lib/chatStore';
import ChatHistory from '@/components/ChatHistory';
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
  const { currentSessionId, createSession, updateMessages, getCurrentSession } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiDropdown, setApiDropdown] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem('ai-param-temperature') || '0.7'));
  const [topP, setTopP] = useState(() => parseFloat(localStorage.getItem('ai-param-top-p') || '0.9'));
  const [maxTokens, setMaxTokens] = useState(() => parseInt(localStorage.getItem('ai-param-max-tokens') || '2048'));
  const scrollRef = useRef<HTMLDivElement>(null);

  const allApis = [...defaultApis, ...customApis].filter(a => a.toolId === 'textGen');
  const api = getActiveApiForTool('textGen');

  useEffect(() => {
    const session = getCurrentSession();
    if (session && session.toolId === 'textGen') {
      setMessages(session.messages);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const saveParam = (key: string, val: string) => localStorage.setItem(key, val);

  const handleNewChat = () => {
    createSession('textGen');
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession('textGen');
    }

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    updateMessages(sessionId, newMessages);

    const apiKey = api?.apiKey || 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok';
    const baseUrl = api?.baseUrl || 'https://api.siliconflow.cn/v1';
    const model = api?.model || 'Qwen/Qwen2.5-7B-Instruct';

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const withAssistant = [...newMessages, { role: 'assistant' as const, content: '' }];
      setMessages(withAssistant);

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

      const finalMessages = [...newMessages, { role: 'assistant' as const, content: assistantContent }];
      setMessages(finalMessages);
      updateMessages(sessionId, finalMessages);
      trackUsage('textGen');
      toast.success(t('genSuccess'));
    } catch (err) {
      const errMsg = { role: 'assistant' as const, content: '⚠️ Error: ' + (err instanceof Error ? err.message : 'Unknown') };
      const finalMessages = [...newMessages, errMsg];
      setMessages(finalMessages);
      updateMessages(sessionId, finalMessages);
      toast.error(t('genFailed'));
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
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setHistoryOpen(true)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title={t('chatHistory')}>
            <History className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <h2 className="font-semibold text-card-foreground text-sm truncate">{t('textGen')}</h2>
        </div>
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowParams(!showParams)}
            className={`p-1.5 rounded-lg transition-colors ${showParams ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`} title={t('advancedParams')}>
            <Settings2 className="w-4 h-4" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleNewChat}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title={t('newChat')}>
            <Plus className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          {/* API Switcher */}
          <div className="relative">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setApiDropdown(!apiDropdown)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-secondary/80 border border-border text-xs font-medium text-card-foreground hover:bg-secondary transition-colors">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="max-w-[80px] truncate hidden sm:inline">{api?.name || 'Default'}</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${apiDropdown ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {apiDropdown && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setApiDropdown(false)} className="fixed inset-0 z-30" />
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-40 overflow-hidden">
                    {allApis.map((a) => {
                      const isActive = activeApis['textGen'] === a.id || (!activeApis['textGen'] && a.id.startsWith('default'));
                      return (
                        <button key={a.id} onClick={() => { setActiveApi('textGen', a.id); setApiDropdown(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${isActive ? 'bg-primary/5 text-primary' : 'text-card-foreground hover:bg-secondary'}`}>
                          {isActive ? <Check className="w-3 h-3" /> : <Cpu className="w-3 h-3 text-muted-foreground" />}
                          <div className="text-left min-w-0">
                            <p className="font-medium truncate">{a.name}</p>
                            <p className="text-muted-foreground truncate text-[10px]">{a.model}</p>
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
      </div>

      {/* Advanced Parameters */}
      <AnimatePresence>
        {showParams && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden">
            <div className="px-3 sm:px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Temperature</span>
                <span className="text-xs font-mono font-bold text-foreground">{temperature.toFixed(1)}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={temperature}
                onChange={e => { setTemperature(+e.target.value); saveParam('ai-param-temperature', e.target.value); }}
                className="w-full accent-[hsl(var(--primary))] h-1.5" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top P</span>
                <span className="text-xs font-mono font-bold text-foreground">{topP.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={topP}
                onChange={e => { setTopP(+e.target.value); saveParam('ai-param-top-p', e.target.value); }}
                className="w-full accent-[hsl(var(--primary))] h-1.5" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Max Tokens</span>
                <span className="text-xs font-mono font-bold text-foreground">{maxTokens}</span>
              </div>
              <input type="range" min="256" max="8192" step="256" value={maxTokens}
                onChange={e => { setMaxTokens(+e.target.value); saveParam('ai-param-max-tokens', e.target.value); }}
                className="w-full accent-[hsl(var(--primary))] h-1.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAvatarClick(msg.role)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${msg.role === 'user' ? 'bg-primary' : 'gradient-bg'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-primary-foreground" /> : <Bot className="w-3.5 h-3.5 text-primary-foreground" />}
              </motion.button>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
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
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('noResult')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder={t('chatPlaceholder')}
            className="flex-1 px-3 py-2.5 rounded-xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={sendMessage} disabled={loading || !input.trim()}
            className="px-3 py-2.5 rounded-xl gradient-bg text-primary-foreground disabled:opacity-40 transition-opacity">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      <ChatHistory open={historyOpen} onClose={() => setHistoryOpen(false)} toolId="textGen" />
    </motion.div>
  );
};

export default TextGenerator;
