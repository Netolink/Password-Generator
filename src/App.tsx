/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  Lock, 
  Unlock, 
  History, 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  generatePassword, 
  getPasswordStrength, 
  calculateEntropy,
  PasswordOptions,
  UPPERCASE_CHARS,
  LOWERCASE_CHARS,
  NUMBER_CHARS,
  SYMBOL_CHARS
} from "./utils/password";

export default function App() {
  // Passwords options and state
  const [length, setLength] = useState<number>(16);
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedHistoryIndex, setCopiedHistoryIndex] = useState<number | null>(null);
  
  // Accordion state for Q&As
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({
    0: true, // First one open by default
  });

  // Calculate stats based on options
  const strengthInfo = getPasswordStrength(length, options);
  const entropy = calculateEntropy(length, options);
  
  // Active character pools count
  const activePoolCount = [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;

  // Trigger dynamic password generation
  const handleGenerate = useCallback(() => {
    const newPass = generatePassword(length, options);
    setPassword(newPass);
    setCopied(false);
    
    if (newPass) {
      setHistory(prev => {
        // Prevent duplicate consecutive entries
        if (prev[0] === newPass) return prev;
        return [newPass, ...prev.slice(0, 7)]; // Store up to 8 in history
      });
    }
  }, [length, options]);

  // Generate initial password and regenerate on interactive settings change
  useEffect(() => {
    handleGenerate();
  }, [length, options.uppercase, options.lowercase, options.numbers, options.symbols, handleGenerate]);

  // Robust Copy function to support sandboxed web frames and modern APIs
  const handleCopyText = async (targetText: string, isHistoryIndex: number | null = null) => {
    if (!targetText) return;
    
    let isSuccess = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetText);
        isSuccess = true;
      }
    } catch (err) {
      console.warn("Clipboard API failed, trying fallback:", err);
    }
    
    // Fallback for sandboxed frames or older browsers
    if (!isSuccess) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = targetText;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        isSuccess = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
    }

    if (isSuccess) {
      if (isHistoryIndex !== null) {
        setCopiedHistoryIndex(isHistoryIndex);
        setTimeout(() => setCopiedHistoryIndex(null), 1500);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Quick Preset Handlers
  const applyPreset = (type: 'fortress' | 'standard' | 'pronounceable' | 'pin') => {
    switch (type) {
      case 'fortress':
        setLength(32);
        setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: true });
        break;
      case 'standard':
        setLength(16);
        setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: false });
        break;
      case 'pronounceable':
        setLength(12);
        setOptions({ uppercase: true, lowercase: true, numbers: false, symbols: false });
        break;
      case 'pin':
        setLength(6);
        setOptions({ uppercase: false, lowercase: false, numbers: true, symbols: false });
        break;
    }
  };

  // Toggle FAQ items
  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Clear history list safely
  const clearHistory = () => {
    setHistory([]);
  };

  // Dynamic slider track styling helpers
  const sliderPercent = ((length - 1) / 63) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Dynamic Navigation / Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Password Generator <span className="text-indigo-600 font-medium text-sm md:text-base">by Netolink</span>
              </span>
              <span className="hidden md:inline-block ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                100% Free
              </span>
            </div>
          </div>
          <div className="flex items-center self-start sm:self-auto">
            <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium tracking-tight shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-950 font-sans">Local Secure Layer Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Intro Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium mb-3"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Cryptographically Secure & Zero Server Latency</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight"
          >
            Instant Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Password Generator</span>
          </motion.h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Generate strong, randomized passwords instantly in your browser. Complete protection against unauthorized access using client-side cryptographic standard algorithms.
          </p>
        </div>

        {/* Password Tool Component Grid */}
        <section id="password-generator-tool" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 max-w-5xl mx-auto">
          
          {/* Left / Generator Pane: Col-Span-7 */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden shadow-slate-100">
            
            {/* Primary Password Display Header */}
            <div className="bg-slate-900 p-6 md:p-8 text-white relative">
              <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-widest text-slate-400 font-bold">
                <span>Generated Password</span>
                <span className="flex items-center space-x-1 font-mono text-indigo-400">
                  <span>{password ? password.length : 0} Chars</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-800/80 rounded-2xl p-4 min-h-[4.5rem] border border-slate-700/60 shadow-inner group">
                <div className="flex-1 min-w-0 mr-3">
                  {activePoolCount === 0 ? (
                    <span className="text-rose-400 font-medium text-sm md:text-base flex items-center space-x-1.5 animate-pulse">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Select at least one character set!</span>
                    </span>
                  ) : showPassword ? (
                    <span className="font-mono text-xl md:text-2xl font-bold break-all tracking-wider text-slate-50 select-all block">
                      {password}
                    </span>
                  ) : (
                    <span className="font-mono text-xl md:text-2xl font-bold break-all tracking-wider text-slate-400 select-none block">
                      {"•".repeat(length)}
                    </span>
                  )}
                </div>
                
                {/* Secondary controls overlay for Password */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {activePoolCount > 0 && (
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                      id="btn-toggle-visibility"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={activePoolCount === 0}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Generate another secure password"
                    id="btn-regenerate"
                  >
                    <RefreshCw className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Action Button Controls */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCopyText(password)}
                  disabled={activePoolCount === 0}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition-all transform shadow-md disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed active:scale-98 ${
                    copied 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-800/10 shadow-indigo-600/20"
                  }`}
                  id="btn-copy-password"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 animate-scale-up" />
                      <span>Copied Securely!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Generated Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Password Configuration Options */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Length Selector Segment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-sm md:text-base flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Password Length</span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => setLength(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold active:scale-95 transition-transform"
                      title="Decrease length by 1"
                      id="btn-decrease-length"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-lg text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-lg min-w-12 text-center">
                      {length}
                    </span>
                    <button 
                      onClick={() => setLength(prev => Math.min(64, prev + 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold active:scale-95 transition-transform"
                      title="Increase length by 1"
                      id="btn-increase-length"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="relative pt-2">
                  <input
                    type="range"
                    min="1"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    style={{
                      background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${sliderPercent}%, rgb(226, 232, 240) ${sliderPercent}%, rgb(226, 232, 240) 100%)`
                    }}
                    id="slider-password-length"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
                    <span>1 (Weak)</span>
                    <span>16 (Ideal)</span>
                    <span>32 (Extreme)</span>
                    <span>64 (Max)</span>
                  </div>
                </div>
              </div>

              {/* Character Pool Options */}
              <div className="space-y-3">
                <label className="font-bold text-slate-900 text-sm md:text-base block">
                  Character Sets Included
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Uppercase */}
                  <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      id="chk-uppercase"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">Uppercase Letters</div>
                      <div className="text-[11px] text-slate-500 font-mono tracking-wider">A-Z ({UPPERCASE_CHARS.slice(0, 5)}...)</div>
                    </div>
                  </label>
                  
                  {/* Lowercase */}
                  <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      id="chk-lowercase"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">Lowercase Letters</div>
                      <div className="text-[11px] text-slate-500 font-mono tracking-wider">a-z ({LOWERCASE_CHARS.slice(0, 5)}...)</div>
                    </div>
                  </label>

                  {/* Numbers */}
                  <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      id="chk-numbers"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">Numbers / Digits</div>
                      <div className="text-[11px] text-slate-500 font-mono tracking-wider">0-9 ({NUMBER_CHARS})</div>
                    </div>
                  </label>

                  {/* Symbols */}
                  <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      id="chk-symbols"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-sm">Special Symbols</div>
                      <div className="text-[11px] text-slate-500 font-mono tracking-wider">!@#$%^&*...</div>
                    </div>
                  </label>

                </div>
              </div>

              {/* Password Strength Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">Calculated Security Strength:</span>
                  <span className={`font-extrabold ${strengthInfo.colorClass}`}>
                    {strengthInfo.label}
                  </span>
                </div>

                {/* 3-Segment Strength Indicator */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={`h-2.5 rounded-full transition-colors duration-400 ${
                    activePoolCount === 0 ? "bg-slate-200" :
                    strengthInfo.score === 'weak' ? "bg-rose-500" :
                    strengthInfo.score === 'ok' ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div className={`h-2.5 rounded-full transition-colors duration-400 ${
                    activePoolCount === 0 || strengthInfo.score === 'weak' ? "bg-slate-200" :
                    strengthInfo.score === 'ok' ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div className={`h-2.5 rounded-full transition-colors duration-400 ${
                    activePoolCount === 0 || strengthInfo.score === 'weak' || strengthInfo.score === 'ok' ? "bg-slate-200" : "bg-emerald-500"
                  }`} />
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-700 mb-0.5">
                      Entropy Metrics: {activePoolCount > 0 ? Math.round(entropy) : 0} Bits
                    </span>
                    {activePoolCount > 0 ? strengthInfo.description : "No character pools are checked. Enable at least one above to form passwords with that sequence."}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Pane: Quick Presets & History Session (Col-Span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Presets Menu */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md shadow-slate-100/50">
              <h2 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                <span>Instant Presets</span>
              </h2>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => applyPreset('fortress')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-between group active:scale-99"
                  id="btn-preset-fortress"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">
                      Fortress (Ultra Secure)
                    </div>
                    <div className="text-xs text-slate-500 text-left">32 Chars, Uppercase, Lowercase, Numbers, Symbols</div>
                  </div>
                  <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-1.5 py-0.5 rounded border border-red-100">EXTREME</span>
                </button>

                <button
                  onClick={() => applyPreset('standard')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-between group active:scale-99"
                  id="btn-preset-standard"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">
                      Standard Multi-Set
                    </div>
                    <div className="text-xs text-slate-500 text-left">16 Chars, Uppercase, Lowercase, Numbers</div>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold px-1.5 py-0.5 rounded border border-indigo-100">RECOMMENDED</span>
                </button>

                <button
                  onClick={() => applyPreset('pronounceable')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-between group active:scale-99"
                  id="btn-preset-pronounceable"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">
                      Easy-to-Read Alphabet Only
                    </div>
                    <div className="text-xs text-slate-500 text-left">12 Chars, letters only, no digits/special</div>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-600 font-extrabold px-1.5 py-0.5 rounded border border-amber-100">MEMORABLE</span>
                </button>

                <button
                  onClick={() => applyPreset('pin')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-between group active:scale-99"
                  id="btn-preset-pin"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">
                      Numeric Pattern (PIN)
                    </div>
                    <div className="text-xs text-slate-500 text-left">6 Chars, digits only, rapid pattern</div>
                  </div>
                  <span className="text-[10px] bg-neutral-100 text-neutral-600 font-extrabold px-1.5 py-0.5 rounded border border-neutral-200">NUMERIC</span>
                </button>
              </div>
            </div>

            {/* Local Password Generator Session History */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md shadow-slate-100/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                  <History className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Session History</span>
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-rose-500 hover:underline flex items-center space-x-1"
                    title="Clear history stack"
                    id="btn-clear-history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                  Generated credentials appear here dynamically during your session.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {history.map((histPass, index) => (
                      <motion.div
                        key={histPass + index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors"
                      >
                        <span className="font-mono text-slate-700 select-all truncate max-w-[200px] font-medium pr-1">
                          {histPass}
                        </span>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleCopyText(histPass, index)}
                            className={`p-1.5 rounded transition-all active:scale-90 ${
                              copiedHistoryIndex === index
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                            }`}
                            title="Copy this password"
                          >
                            {copiedHistoryIndex === index ? (
                              <Check className="w-3.5 h-3.5 animate-scale-up" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <p className="text-[10px] text-slate-400 text-center pt-1 italic font-sans">
                    * History is stored purely in browser memory, never leaves your computer.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Separator Accent */}
        <div className="border-t border-slate-200 w-full mb-12" />

        {/* SEO Article & Education Section */}
        <section id="educational-article" className="max-w-4xl mx-auto space-y-10 mb-16">
          
          {/* Article Header */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-tight">
              Ultimate Guide to Password Generation & Safety
            </h2>
            <p className="text-slate-600 leading-relaxed font-normal">
              Today, safeguarding digital accounts requires highly sophisticated password security practices. Hackers employ automated algorithms and distributed brute-force architectures capable of making billions of standard password guesses and dictionary lookup matching per second. Standard, predictable combinations represent the single leading cause of authentication compromises. This tool was developed to mitigate that security deficiency.
            </p>
          </div>

          {/* Subsections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            
            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block"></span>
                <span>What is Password Generation?</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Password generation is the practice of compiling string arrays containing randomized characters derived from high-entropy pools (including mixed letter symbols, numerals, and structural components). Unlike human formulation which favors predictable patterns (birthdays, dictionary terms, keyboard pathways, sequential structures), algorithmic formulation produces strings characterized by maximum randomness (unpredictability).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block"></span>
                <span>Why In-Browser (Local) JS is Super-Safe</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Many online utility scripts submit requests back to remote application endpoints to generate or log outcomes. Our tool works 100% inside your client browser application using standard client-side secure random-number APIs (specifically <strong>window.crypto.getRandomValues</strong>). Zero networking interactions are dispatched, preventing packet snooping, server logs, or third-party recording.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block"></span>
                <span>How to Use This Specific Tool</span>
              </h3>
              <ol className="text-sm text-slate-600 leading-relaxed list-decimal list-inside space-y-2">
                <li>
                  <strong>Select Length:</strong> Drag the slider or use (+ / -) controls to scale requirements from 1 up to 64. Standard secure limits are above 12.
                </li>
                <li>
                  <strong>Tick Subsets:</strong> Mark checkboxes for your targets (Uppercase, Lowercase, Digits, Symbols) to enforce compliance.
                </li>
                <li>
                  <strong>Evaluate Strength:</strong> Reference the multi-set strength visualizer (Weak/Moderate/Strong) along with bit-entropy measures.
                </li>
                <li>
                  <strong>Copy & Store:</strong> Click Copy to secure the string instantly to your local hardware clipboard.
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block"></span>
                <span>SEO Parameters & Search Signals</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                This secure random utility page complies fully with core web vitals and mobile responsiveness protocols. Suitable for integration as a free utility index widget to bolster organic traffic, site interaction durations, and overall engagement metrics for online portfolios, marketing databases, and tech tools. Ideal for boosting SEO crawl indexes targeting keywords like <em>secure password generators</em>, <em>free random password creators</em>, and <em>offline-safe credential builders</em>.
              </p>
            </div>

          </div>

        </section>

        {/* Separator Accent */}
        <div className="border-t border-slate-200 w-full mb-12" />

        {/* Q&A Section / FAQs Accordion */}
        <section id="faq-section" className="max-w-4xl mx-auto mb-12">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Frequently Asked Questions (Q&A)
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything you need to know about security, protocols, and developer terms.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* FAQ 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button 
                onClick={() => toggleFaq(0)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50/80 transition-colors"
                id="faq-btn-0"
              >
                <span className="pr-4 text-base md:text-lg">Is this password generator entirely free?</span>
                {faqOpen[0] ? <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              
              <AnimatePresence initial={false}>
                {faqOpen[0] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-sm text-slate-600 border-t border-slate-100 leading-relaxed space-y-2">
                      <p>
                        <strong>Yes, 100% free.</strong> There are no payment options, premium lockouts, registration gates, or ad-blocker requirements. You can use this service for generating personal passwords, enterprise keys, database seeds, or structural tokens as often as you want without charge.
                      </p>
                      <p>
                        We offer this tool in alignment with the developer user-first initiative, making digital utilities easily accessible to web administrations and cybersecurity learners.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50/80 transition-colors"
                id="faq-btn-1"
              >
                <span className="pr-4 text-base md:text-lg">Can the developer track or store my passwords?</span>
                {faqOpen[1] ? <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              
              <AnimatePresence initial={false}>
                {faqOpen[1] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                      <p>
                        <strong>Absolutely not.</strong> This password generator operates purely client-side within your browser window. No server logging routines, databases, tracking pixels, or networking requests are attached. Once raw javascript renders the string using the local browser cryptographic entropy generator, the value is stored in temporary local variables and immediately lost upon tab refresh or closure.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50/80 transition-colors"
                id="faq-btn-2"
              >
                <span className="pr-4 text-base md:text-lg">Is it safe to generate passwords here and use them on any major site?</span>
                {faqOpen[2] ? <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              
              <AnimatePresence initial={false}>
                {faqOpen[2] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-sm text-slate-600 border-t border-slate-100 leading-relaxed flex space-y-2 flex-col">
                      <p>
                        <strong>Yes, completely safe.</strong> The passwords generated are cryptographically random. Unlike simple utilities using standard <em>Math.random()</em> which are mathematically predictable, this password script accesses the <em>Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)</em> native to all modern browsers.
                      </p>
                      <p>
                        This creates highly strong arrays that are safe for banking sites, social media, work networks, database systems, and private communication logs.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50/80 transition-colors"
                id="faq-btn-3"
              >
                <span className="pr-4 text-base md:text-lg">Disclaimer of Responsibility / Public Use Terms</span>
                {faqOpen[3] ? <ChevronUp className="w-5 h-5 text-indigo-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              
              <AnimatePresence initial={false}>
                {faqOpen[3] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-sm text-slate-600 border-t border-slate-100 leading-relaxed font-sans italic">
                      <p className="mb-2">
                        <strong>Public Use Disclaimer:</strong> This password generation tool is designed as a free resource for general public use. This utility is provided on an "as-is" and "as-available" basis without representations or warranties of any kind, whether express or implied.
                      </p>
                      <p>
                        <strong>Limitation of Liability:</strong> In no event shall the developer or any associated contributors be held responsible or liable for any security compromises, loss of data, unauthorized database access, server breaches, financial damages, or any other issues resulting from the direct or indirect use of this tool or the passwords generated by it. The user assumes 100% full legal responsibility and liability for maintaining their own cybersecurity architectures and storing credentials in secure lockers.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </section>

      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-400 text-xs py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-700">Netolink.com</span>. All Rights Reserved. Client-Side Cryptographic Standard.
          </p>
          <div className="flex space-x-4">
            <a href="https://netolink.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center space-x-1">
              <span>Visit netolink.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
