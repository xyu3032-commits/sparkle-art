import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Lock, Hash, FileCode, Palette, ArrowLeft, Copy, Check, RefreshCw,
  FileText, KeyRound, AlignLeft, Type, QrCode, Binary, Diff, Calculator,
  Table2, Braces, Shield, Link2, Wrench
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type UtilTool =
  | 'htmlSource' | 'base64' | 'hash' | 'jsonFormat' | 'colorPicker' | 'urlEncode'
  | 'timestamp' | 'regex' | 'markdown' | 'password' | 'wordCount' | 'lorem'
  | 'numberBase' | 'textDiff' | 'cssUnit' | 'csvJson' | 'jwtDecode' | 'ipInfo'
  | 'textCase' | 'slugify';

interface ToolDef {
  id: UtilTool;
  icon: React.ElementType;
  labelKey: string;
  category: string;
}

const categories = [
  { id: 'encode', labelKey: 'catEncode' },
  { id: 'format', labelKey: 'catFormat' },
  { id: 'text', labelKey: 'catText' },
  { id: 'dev', labelKey: 'catDev' },
  { id: 'convert', labelKey: 'catConvert' },
];

const utilTools: ToolDef[] = [
  // Encode & Crypto
  { id: 'base64', icon: Lock, labelKey: 'utilBase64', category: 'encode' },
  { id: 'urlEncode', icon: QrCode, labelKey: 'utilUrlEncode', category: 'encode' },
  { id: 'hash', icon: Hash, labelKey: 'utilHash', category: 'encode' },
  { id: 'password', icon: KeyRound, labelKey: 'utilPassword', category: 'encode' },
  { id: 'jwtDecode', icon: Shield, labelKey: 'utilJwtDecode', category: 'encode' },
  // Format
  { id: 'jsonFormat', icon: FileCode, labelKey: 'utilJsonFormat', category: 'format' },
  { id: 'markdown', icon: FileText, labelKey: 'utilMarkdown', category: 'format' },
  { id: 'cssUnit', icon: Braces, labelKey: 'utilCssUnit', category: 'format' },
  { id: 'csvJson', icon: Table2, labelKey: 'utilCsvJson', category: 'format' },
  // Text
  { id: 'wordCount', icon: AlignLeft, labelKey: 'utilWordCount', category: 'text' },
  { id: 'lorem', icon: Type, labelKey: 'utilLorem', category: 'text' },
  { id: 'textDiff', icon: Diff, labelKey: 'utilTextDiff', category: 'text' },
  { id: 'textCase', icon: AlignLeft, labelKey: 'utilTextCase', category: 'text' },
  { id: 'slugify', icon: Link2, labelKey: 'utilSlugify', category: 'text' },
  // Dev
  { id: 'htmlSource', icon: Globe, labelKey: 'utilHtmlSource', category: 'dev' },
  { id: 'regex', icon: FileCode, labelKey: 'utilRegex', category: 'dev' },
  { id: 'timestamp', icon: RefreshCw, labelKey: 'utilTimestamp', category: 'dev' },
  { id: 'ipInfo', icon: Globe, labelKey: 'utilIpInfo', category: 'dev' },
  // Convert
  { id: 'colorPicker', icon: Palette, labelKey: 'utilColorPicker', category: 'convert' },
  { id: 'numberBase', icon: Binary, labelKey: 'utilNumberBase', category: 'convert' },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }
  }),
};

const UtilityBox: React.FC = () => {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState<UtilTool | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const process = () => {
    if (!input.trim() && activeTool !== 'ipInfo') return;
    try {
      switch (activeTool) {
        case 'htmlSource': { fetchHtml(input.trim()); return; }
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
          setOutput(JSON.stringify(JSON.parse(input), null, 2));
          break;
        }
        case 'colorPicker': {
          const hex = input.trim();
          if (/^#?[0-9a-fA-F]{3,8}$/.test(hex)) {
            const h = hex.startsWith('#') ? hex : `#${hex}`;
            const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
            setOutput(`HEX: ${h}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${rgbToHsl(r, g, b)})`);
          } else {
            const nums = input.match(/\d+/g)?.map(Number) || [];
            if (nums.length >= 3) {
              const hex2 = `#${nums.slice(0, 3).map(n => n.toString(16).padStart(2, '0')).join('')}`;
              setOutput(`HEX: ${hex2}\nRGB: rgb(${nums[0]}, ${nums[1]}, ${nums[2]})\nHSL: hsl(${rgbToHsl(nums[0], nums[1], nums[2])})`);
            } else setOutput('Invalid color format');
          }
          break;
        }
        case 'urlEncode': {
          setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
          break;
        }
        case 'timestamp': {
          const num = Number(input.trim());
          if (!isNaN(num) && input.trim()) {
            const d = num > 1e12 ? new Date(num) : new Date(num * 1000);
            setOutput(`UTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}\nISO: ${d.toISOString()}`);
          } else {
            const d = new Date(input.trim() || Date.now());
            setOutput(`Unix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}\nISO: ${d.toISOString()}`);
          }
          break;
        }
        case 'regex': {
          const lines = input.split('\n');
          if (lines.length < 2) { setOutput('Line 1: regex pattern\nLine 2+: test string'); return; }
          const regex = new RegExp(lines[0], 'g');
          const matches = [...lines.slice(1).join('\n').matchAll(regex)];
          setOutput(matches.length === 0 ? 'No matches' :
            matches.map((m, i) => `Match ${i + 1}: "${m[0]}" @${m.index}${m.length > 1 ? ` Groups: ${m.slice(1).join(', ')}` : ''}`).join('\n'));
          break;
        }
        case 'markdown': {
          const html = input
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^\- (.+)$/gm, '• $1')
            .replace(/\n/g, '<br/>');
          setOutput(html);
          break;
        }
        case 'password': {
          const len = Math.max(8, Math.min(128, parseInt(input) || 16));
          const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
          const passwords: string[] = [];
          for (let j = 0; j < 5; j++) {
            let pw = '';
            const arr = new Uint32Array(len);
            crypto.getRandomValues(arr);
            for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
            passwords.push(pw);
          }
          setOutput(passwords.join('\n'));
          break;
        }
        case 'wordCount': {
          const text = input.trim();
          const chars = text.length;
          const words = text ? text.split(/\s+/).length : 0;
          const lines = text ? text.split('\n').length : 0;
          const sentences = text ? (text.match(/[.!?。！？]+/g) || []).length : 0;
          setOutput(`Characters: ${chars}\nWords: ${words}\nLines: ${lines}\nSentences: ${sentences}`);
          break;
        }
        case 'lorem': {
          const count = Math.max(1, Math.min(50, parseInt(input) || 3));
          const s = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.','Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.','Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.','Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.','Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.'];
          const paras = Array.from({ length: count }, () =>
            Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => s[Math.floor(Math.random() * s.length)]).join(' ')
          );
          setOutput(paras.join('\n\n'));
          break;
        }
        case 'numberBase': {
          const n = input.trim();
          let num: number;
          if (n.startsWith('0x')) num = parseInt(n, 16);
          else if (n.startsWith('0b')) num = parseInt(n.slice(2), 2);
          else if (n.startsWith('0o')) num = parseInt(n.slice(2), 8);
          else num = parseInt(n, 10);
          if (isNaN(num)) { setOutput('Invalid number'); break; }
          setOutput(`Decimal: ${num}\nHex: 0x${num.toString(16).toUpperCase()}\nBinary: 0b${num.toString(2)}\nOctal: 0o${num.toString(8)}`);
          break;
        }
        case 'textDiff': {
          const parts = input.split('---\n');
          if (parts.length < 2) { setOutput('Separate two texts with a line containing only "---"'); break; }
          const a = parts[0].split('\n'), b = parts[1].split('\n');
          const maxLen = Math.max(a.length, b.length);
          const result: string[] = [];
          for (let i = 0; i < maxLen; i++) {
            if (a[i] === b[i]) result.push(`  ${a[i] || ''}`);
            else {
              if (a[i] !== undefined) result.push(`- ${a[i]}`);
              if (b[i] !== undefined) result.push(`+ ${b[i]}`);
            }
          }
          setOutput(result.join('\n'));
          break;
        }
        case 'cssUnit': {
          const px = parseFloat(input);
          if (isNaN(px)) { setOutput('Enter a number (px value)'); break; }
          setOutput(`${px}px\n${px / 16}rem\n${px / 16}em\n${(px / 16) * 100}%\n${px * 0.75}pt\n${px / window.innerWidth * 100}vw`);
          break;
        }
        case 'csvJson': {
          if (mode === 'encode') {
            const lines = input.trim().split('\n');
            if (lines.length < 2) { setOutput('Need header row + data rows'); break; }
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
              const vals = line.split(',').map(v => v.trim());
              const obj: Record<string, string> = {};
              headers.forEach((h, i) => obj[h] = vals[i] || '');
              return obj;
            });
            setOutput(JSON.stringify(data, null, 2));
          } else {
            const arr = JSON.parse(input);
            if (!Array.isArray(arr) || arr.length === 0) { setOutput('Need JSON array of objects'); break; }
            const headers = Object.keys(arr[0]);
            const csv = [headers.join(','), ...arr.map((row: any) => headers.map(h => row[h] ?? '').join(','))];
            setOutput(csv.join('\n'));
          }
          break;
        }
        case 'jwtDecode': {
          const parts = input.trim().split('.');
          if (parts.length !== 3) { setOutput('Invalid JWT format (need 3 parts)'); break; }
          const decode = (s: string) => JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/')));
          const header = decode(parts[0]);
          const payload = decode(parts[1]);
          setOutput(`=== Header ===\n${JSON.stringify(header, null, 2)}\n\n=== Payload ===\n${JSON.stringify(payload, null, 2)}\n\n=== Signature ===\n${parts[2].slice(0, 20)}...`);
          break;
        }
        case 'ipInfo': {
          fetchIp(); return;
        }
        case 'textCase': {
          const text = input;
          setOutput([
            `UPPER: ${text.toUpperCase()}`,
            `lower: ${text.toLowerCase()}`,
            `Title: ${text.replace(/\b\w/g, c => c.toUpperCase())}`,
            `camelCase: ${text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())}`,
            `snake_case: ${text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
            `kebab-case: ${text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          ].join('\n'));
          break;
        }
        case 'slugify': {
          const slug = input.trim().toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          setOutput(slug);
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
      setOutput((await res.text()).slice(0, 50000));
    } catch (e: any) {
      setOutput(`Fetch error: ${e.message}`);
    }
  };

  const fetchIp = async () => {
    setOutput(t('generating'));
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      setOutput(`IP: ${data.ip}\nCity: ${data.city}\nRegion: ${data.region}\nCountry: ${data.country_name}\nISP: ${data.org}\nTimezone: ${data.timezone}\nLatitude: ${data.latitude}\nLongitude: ${data.longitude}`);
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const getPlaceholder = () => {
    const map: Record<string, string> = {
      htmlSource: 'https://example.com',
      base64: mode === 'encode' ? 'Hello World' : 'SGVsbG8gV29ybGQ=',
      hash: 'Text to hash (SHA-256)',
      jsonFormat: '{"key":"value"}',
      colorPicker: '#3b82f6 or rgb(59,130,246)',
      urlEncode: mode === 'encode' ? 'hello world' : 'hello%20world',
      timestamp: '1700000000',
      regex: 'Line 1: pattern\nLine 2+: test text',
      markdown: '# Title\n**bold** *italic*',
      password: '16 (length 8-128)',
      wordCount: 'Paste text here...',
      lorem: '3 (paragraphs)',
      numberBase: '255 or 0xFF or 0b11111111',
      textDiff: 'Text A\n---\nText B',
      cssUnit: '16 (pixels)',
      csvJson: 'name,age\nAlice,30\nBob,25',
      jwtDecode: 'eyJhbGciOiJIUzI1NiJ9...',
      ipInfo: 'Click process to check your IP',
      textCase: 'Hello World Example',
      slugify: 'My Blog Post Title!',
    };
    return map[activeTool || ''] || '';
  };

  const hasModeToggle = activeTool === 'base64' || activeTool === 'urlEncode' || activeTool === 'csvJson';

  const filteredTools = activeCategory ? utilTools.filter(t => t.category === activeCategory) : utilTools;

  // Tool selection grid
  if (!activeTool) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-thin">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold gradient-text mb-1">{t('utilityBox')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t('utilityBoxDesc')}</p>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${!activeCategory ? 'gradient-bg text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {t('allCategories')}
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${activeCategory === cat.id ? 'gradient-bg text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                {t(cat.labelKey)}
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTools.map((tool, i) => (
              <motion.button
                key={tool.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setActiveTool(tool.id); setInput(''); setOutput(''); }}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border
                  bg-card hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                  <tool.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:gradient-text transition-colors text-center">
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
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.08, x: -3 }}
          onClick={() => { setActiveTool(null); setInput(''); setOutput(''); }}
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
        <h3 className="font-semibold text-sm gradient-text">{t(utilTools.find(u => u.id === activeTool)?.labelKey || '')}</h3>
        {hasModeToggle && (
          <div className="ml-auto flex gap-1 p-0.5 rounded-full bg-secondary/50">
            {(['encode', 'decode'] as const).map(m => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.92 }}
                onClick={() => { setMode(m); setInput(''); setOutput(''); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${mode === m ? 'gradient-bg text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'encode' ? t('utilEncode') : t('utilDecode')}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('utilInput')}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            rows={4}
            className="w-full p-3 rounded-2xl border border-border bg-card text-sm text-foreground
              placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30
              font-mono transition-all"
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.04 }}
            onClick={process}
            className="flex-1 py-2.5 rounded-full gradient-bg text-primary-foreground font-semibold text-sm
              hover:opacity-90 transition-all"
          >
            {activeTool === 'htmlSource' ? t('utilFetch') : activeTool === 'ipInfo' ? t('utilFetch') : t('utilProcess')}
          </motion.button>
          {output && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.88 }}
              onClick={copyOutput}
              className="px-4 py-2.5 rounded-full border border-border bg-secondary text-sm font-medium
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
              <pre className="w-full p-3 rounded-2xl border border-border bg-card text-sm text-foreground
                overflow-auto max-h-[50vh] whitespace-pre-wrap break-all font-mono scrollbar-thin">
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
