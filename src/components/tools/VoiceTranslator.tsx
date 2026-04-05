import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Languages, ArrowRightLeft, Volume2, Copy, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
];

const VoiceTranslator: React.FC = () => {
  const { t } = useTranslation();
  const { trackUsage, getActiveApiForTool } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('zh');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('voiceNotSupported'));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang === 'zh' ? 'zh-CN' : sourceLang === 'en' ? 'en-US' : sourceLang === 'ja' ? 'ja-JP' : sourceLang === 'ko' ? 'ko-KR' : sourceLang === 'fr' ? 'fr-FR' : sourceLang === 'de' ? 'de-DE' : sourceLang === 'es' ? 'es-ES' : 'ru-RU';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSourceText(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error(t('voiceError'));
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [sourceLang, t]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const translateText = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);

    const api = getActiveApiForTool('textGen');
    const apiKey = api?.apiKey || 'sk-xgovryksordjmsdfkihbgculbjfknsgzgvlkalqbxzgoklok';
    const baseUrl = api?.baseUrl || 'https://api.siliconflow.cn/v1';
    const model = api?.model || 'Qwen/Qwen2.5-7B-Instruct';

    const srcName = LANGUAGES.find(l => l.code === sourceLang)?.label || sourceLang;
    const tgtName = LANGUAGES.find(l => l.code === targetLang)?.label || targetLang;

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: `You are a translator. Translate the following text from ${srcName} to ${tgtName}. Only output the translation, nothing else.` },
            { role: 'user', content: sourceText },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const result = data.choices?.[0]?.message?.content || '';
      setTranslatedText(result);
      trackUsage('voiceTranslate');
      toast.success(t('translateSuccess'));
    } catch {
      toast.error(t('translateFailed'));
    }
    setLoading(false);
  };

  const speakText = (text: string, lang: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : lang;
    speechSynthesis.speak(utterance);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('copiedToClipboard'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-border flex items-center gap-2">
        <Languages className="w-4.5 h-4.5 text-primary" />
        <h2 className="font-semibold text-card-foreground text-sm">{t('voiceTranslate')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 space-y-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2 justify-center">
          <select value={sourceLang} onChange={e => setSourceLang(e.target.value)}
            className="glass-input px-3 py-2 rounded-full text-sm font-medium bg-secondary border border-border text-foreground">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <motion.button whileTap={{ scale: 0.8, rotate: 180 }} whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={swapLanguages} className="p-2 pill-btn glass-btn-icon">
            <ArrowRightLeft className="w-4 h-4 text-primary relative z-10" />
          </motion.button>
          <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
            className="glass-input px-3 py-2 rounded-full text-sm font-medium bg-secondary border border-border text-foreground">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {/* Mic Button */}
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            animate={isRecording ? { boxShadow: ['0 0 0 0 hsl(var(--primary) / 0.4)', '0 0 0 20px hsl(var(--primary) / 0)', '0 0 0 0 hsl(var(--primary) / 0.4)'] } : {}}
            transition={isRecording ? { duration: 1.5, repeat: Infinity } : { type: 'spring', stiffness: 400, damping: 17 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center pill-btn ${isRecording ? 'bg-destructive' : 'gradient-bg'} text-primary-foreground shadow-lg`}
          >
            {isRecording ? <MicOff className="w-6 h-6 relative z-10" /> : <Mic className="w-6 h-6 relative z-10" />}
          </motion.button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {isRecording ? t('recording') : t('tapToRecord')}
        </p>

        {/* Source Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('sourceText')}</span>
            <div className="flex gap-1">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => speakText(sourceText, sourceLang)}
                className="p-1.5 pill-btn glass-btn-icon"><Volume2 className="w-3.5 h-3.5 text-muted-foreground relative z-10" /></motion.button>
            </div>
          </div>
          <textarea value={sourceText} onChange={e => setSourceText(e.target.value)} placeholder={t('enterOrSpeak')}
            className="glass-input w-full px-4 py-3 rounded-2xl bg-secondary text-sm text-secondary-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px] transition-shadow" />
        </div>

        {/* Translate Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={translateText}
          disabled={loading || !sourceText.trim()}
          className="w-full py-2.5 pill-btn-glow gradient-bg text-primary-foreground text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Languages className="w-4 h-4 relative z-10" />}
          <span className="relative z-10">{t('translateNow')}</span>
        </motion.button>

        {/* Translated Text */}
        <AnimatePresence>
          {translatedText && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t('translatedText')}</span>
                <div className="flex gap-1">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => speakText(translatedText, targetLang)}
                    className="p-1.5 pill-btn glass-btn-icon"><Volume2 className="w-3.5 h-3.5 text-muted-foreground relative z-10" /></motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => copyText(translatedText)}
                    className="p-1.5 pill-btn glass-btn-icon">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500 relative z-10" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground relative z-10" />}
                  </motion.button>
                </div>
              </div>
              <div className="glass-input px-4 py-3 rounded-2xl bg-secondary/50 text-sm text-secondary-foreground border border-border min-h-[80px] whitespace-pre-wrap">
                {translatedText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VoiceTranslator;
