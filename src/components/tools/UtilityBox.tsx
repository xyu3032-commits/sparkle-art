import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Lock, Hash, FileCode, QrCode, Palette, ArrowLeft, Copy, Check, RefreshCw, FileText, KeyRound, AlignLeft, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type UtilTool = 'htmlSource' | 'base64' | 'hash' | 'jsonFormat' | 'colorPicker' | 'urlEncode' | 'timestamp' | 'regex' | 'markdown' | 'password' | 'wordCount' | 'lorem';

const utilTools: { id: UtilTool; icon: React.ElementType; labelKey: string }[] = [
  { id: 'htmlSource', icon: Globe, labelKey: 'utilHtmlSource' },
  { id: 'base64', icon: Lock, labelKey: 'utilBase64' },
  { id: 'hash', icon: Hash, labelKey: 'utilHash' },
  { id: 'jsonFormat', icon: FileCode, labelKey: 'utilJsonFormat' },
  { id: 'colorPicker', icon: Palette, labelKey: 'utilColorPicker' },
  { id: 'urlEncode', icon: QrCode, labelKey: 'utilUrlEncode' },
  { id: 'timestamp', icon: RefreshCw, labelKey: 'utilTimestamp' },
  { id: 'regex', icon: FileCode, labelKey: 'utilRegex' },
  { id: 'markdown', icon: FileText, labelKey: 'utilMarkdown' },
  { id: 'password', icon: KeyRound, labelKey: 'utilPassword' },
  { id: 'wordCount', icon: AlignLeft, labelKey: 'utilWordCount' },
  { id: 'lorem', icon: Type, labelKey: 'utilLorem' },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 400, damping: 25 }
  }),
};

const UtilityBox: React.FC = () => {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState<UtilTool | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success(t('copiedToClipboard'));
    setTimeout(() => setCopied(false), 1500);
  };

  const process = () => {
    if (!input.trim()) return;
    try {
      switch (activeTool) {
        case 'htmlSource': {
          fetchHtml(input.trim());
          return;
        }
        case 'base64': {
          if (mode === 'encode') setOutput(btoa(unescape(encodeURIComponent(input))));
          else setOutput(decodeURIComponent(escape(atob(input))));
          break;
        }
        case 'hash': {
          crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)).then(buf => {
            setOutput(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
          });
          return;
        }
        case 'jsonFormat': {
          const parsed = JSON.parse(input);
          setOutput(JSON.stringify(parsed, null, 2));
          break;
        }
        case 'colorPicker': {
          const hex = input.trim();
          if (/^#?[0-9a-fA-F]{3,8}$/.test(hex)) {
            const h = hex.startsWith('#') ? hex : `#${hex}`;
            const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
            setOutput(`HEX: ${h}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${rgbToHsl(r, g, b)})`);
          } else if (input.startsWith('rgb')) {
            const nums = input.match(/\d+/g)?.map(Number) || [];
            if (nums.length >= 3) {
              const hex2 = `#${nums.slice(0, 3).map(n => n.toString(16).padStart(2, '0')).join('')}`;
              setOutput(`HEX: ${hex2}\nRGB: rgb(${nums[0]}, ${nums[1]}, ${nums[2]})\nHSL: hsl(${rgbToHsl(nums[0], nums[1], nums[2])})`);
            }
          } else {
            setOutput('Invalid color format. Use #hex or rgb(r,g,b)');
          }
          break;
        }
        case 'urlEncode': {
          if (mode === 'encode') setOutput(encodeURIComponent(input));
          else setOutput(decodeURIComponent(input));
          break;
        }
        case 'timestamp': {
          const num = Number(input.trim());
          if (!isNaN(num)) {
            const d = num > 1e12 ? new Date(num) : new Date(num * 1000);
            setOutput(`UTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}\nISO: ${d.toISOString()}`);
          } else {
            const d = new Date(input.trim());
            if (!isNaN(d.getTime())) {
              setOutput(`Unix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}\nISO: ${d.toISOString()}`);
            } else {
              const now = new Date();
              setOutput(`Now Unix (s): ${Math.floor(now.getTime() / 1000)}\nNow Unix (ms): ${now.getTime()}\nNow ISO: ${now.toISOString()}`);
            }
          }
          break;
        }
        case 'regex': {
          try {
            const lines = input.split('\n');
            if (lines.length < 2) { setOutput('Line 1: regex pattern\nLine 2+: test string'); return; }
            const pattern = lines[0];
            const testStr = lines.slice(1).join('\n');
            const regex = new RegExp(pattern, 'g');
            const matches = [...testStr.matchAll(regex)];
            if (matches.length === 0) setOutput('No matches found');
            else setOutput(matches.map((m, i) => `Match ${i + 1}: "${m[0]}" at index ${m.index}${m.length > 1 ? `\n  Groups: ${m.slice(1).join(', ')}` : ''}`).join('\n'));
          } catch (e: any) {
            setOutput(`Regex error: ${e.message}`);
          }
          break;
        }
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const fetchHtml = async (url: string) => {
    setOutput(t('generating'));
    try {
      let u = url;
      if (!u.startsWith('http')) u = 'https://' + u;
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setOutput(text.slice(0, 50000));
    } catch (e: any) {
      setOutput(`Fetch error: ${e.message}\n\nTip: Some sites block CORS requests.`);
    }
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  };

  const getPlaceholder = () => {
    switch (activeTool) {
      case 'htmlSource': return 'https://example.com';
      case 'base64': return mode === 'encode' ? 'Hello World' : 'SGVsbG8gV29ybGQ=';
      case 'hash': return 'Text to hash (SHA-256)';
      case 'jsonFormat': return '{"key":"value","arr":[1,2,3]}';
      case 'colorPicker': return '#3b82f6 or rgb(59,130,246)';
      case 'urlEncode': return mode === 'encode' ? 'hello world & foo=bar' : 'hello%20world';
      case 'timestamp': return '1700000000 or 2024-01-01T00:00:00Z';
      case 'regex': return 'Line 1: regex pattern\nLine 2+: test string';
      default: return '';
    }
  };

  const hasModeToggle = activeTool === 'base64' || activeTool === 'urlEncode';

  // Tool selection grid
  if (!activeTool) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-xl font-bold gradient-text mb-1">{t('utilityBox')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('utilityBoxDesc')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {utilTools.map((tool, i) => (
              <motion.button
                key={tool.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setActiveTool(tool.id); setInput(''); setOutput(''); }}
                className="flex flex-col items-center gap-2.5 p-5 admin-glass-card glass-input rounded-2xl border border-border
                  hover:border-primary/30 hover:shadow-glow transition-all duration-200 group pill-btn"
              >
                <motion.div
                  className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center pill-btn-glow"
                  whileHover={{ rotate: 12 }}
                >
                  <tool.icon className="w-5 h-5 text-primary-foreground relative z-10" />
                </motion.div>
                <span className="text-xs font-semibold text-foreground group-hover:gradient-text transition-colors">
                  {t(tool.labelKey)}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Active tool view
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.08, x: -3 }}
          onClick={() => { setActiveTool(null); setInput(''); setOutput(''); }}
          className="p-2 rounded-full glass-btn-icon hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
        <h3 className="font-semibold text-sm gradient-text">{t(utilTools.find(u => u.id === activeTool)?.labelKey || '')}</h3>
        {hasModeToggle && (
          <div className="ml-auto flex gap-1 p-0.5 rounded-full bg-secondary/50 glass-input">
            {(['encode', 'decode'] as const).map(m => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.92 }}
                onClick={() => { setMode(m); setInput(''); setOutput(''); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all pill-btn
                  ${mode === m ? 'gradient-bg text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'encode' ? t('utilEncode') : t('utilDecode')}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('utilInput')}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            rows={activeTool === 'regex' || activeTool === 'htmlSource' ? 4 : 3}
            className="w-full p-3 rounded-2xl border border-border bg-card/60 text-sm text-foreground
              placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30
              glass-input font-mono transition-all"
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.04 }}
            onClick={process}
            className="flex-1 py-2.5 rounded-full gradient-bg text-primary-foreground font-semibold text-sm pill-btn-glow
              shadow-glow hover:shadow-lg transition-all"
          >
            {activeTool === 'htmlSource' ? t('utilFetch') : t('utilProcess')}
          </motion.button>
          {output && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.88 }}
              onClick={copyOutput}
              className="px-4 py-2.5 rounded-full border border-border glass-btn-action text-sm font-medium
                text-foreground hover:border-primary/30 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {output && (
            <motion.div
              key={output.slice(0, 20)}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-muted-foreground">{t('utilOutput')}</label>
              <pre className="w-full p-3 rounded-2xl border border-border bg-card/60 text-sm text-foreground
                overflow-auto max-h-[50vh] whitespace-pre-wrap break-all glass-input font-mono scrollbar-thin">
                {output}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UtilityBox;
