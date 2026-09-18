import React, { useState } from 'react';
import { Link, Sparkles, Clock, Globe, Hash, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { ShortenPayload } from '../types';

interface ShortenerFormProps {
  onShorten: (payload: ShortenPayload) => Promise<boolean>;
  isLoading: boolean;
}

export const ShortenerForm: React.FC<ShortenerFormProps> = ({ onShorten, isLoading }) => {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expirationOption, setExpirationOption] = useState<'never' | '1h' | '24h' | '7d' | '30d' | 'custom'>('24h');
  const [customExpiresAt, setCustomExpiresAt] = useState('');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!longUrl.trim()) {
      setErrorMsg('Please enter a valid URL to shorten.');
      return;
    }

    let urlToTest = longUrl.trim();
    if (!/^https?:\/\//i.test(urlToTest)) {
      urlToTest = 'https://' + urlToTest;
    }

    try {
      new URL(urlToTest);
    } catch {
      setErrorMsg('Please enter a valid destination URL (e.g., https://example.com/article?id=123)');
      return;
    }

    if (customCode.trim()) {
      const cleaned = customCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      if (cleaned.length < 3 || cleaned.length > 15) {
        setErrorMsg('Custom alias must be 3-15 alphanumeric characters.');
        return;
      }
    }

    const success = await onShorten({
      longUrl: urlToTest,
      customCode: customCode.trim() || undefined,
      expirationOption,
      customExpiresAt: expirationOption === 'custom' ? customExpiresAt : undefined,
      title: title.trim() || undefined
    });

    if (success) {
      setLongUrl('');
      setCustomCode('');
      setTitle('');
      setErrorMsg(null);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLongUrl(text);
        setErrorMsg(null);
      }
    } catch {
      // Fallback
    }
  };

  const applyPreset = (presetUrl: string, presetTitle: string, hours?: '1h' | '24h' | 'never') => {
    setLongUrl(presetUrl);
    setTitle(presetTitle);
    if (hours) setExpirationOption(hours);
    setErrorMsg(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl shadow-slate-950/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Link className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Shorten Long URL</h2>
            <p className="text-xs text-slate-400">Generates a unique 6-character Base62 code with HTTP 302 redirection</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
        >
          <span>{showAdvanced ? 'Hide Options' : 'Custom Alias & Expiry'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main URL Input */}
        <div>
          <label htmlFor="url-input" className="block text-xs font-medium text-slate-300 mb-1.5">
            Destination Long URL <span className="text-rose-400">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
              <Globe className="h-4 w-4" />
            </div>
            <input
              id="url-input"
              type="text"
              value={longUrl}
              onChange={(e) => {
                setLongUrl(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="https://example.com/very/long/article?id=123&utm_source=interview"
              className="w-full pl-10 pr-24 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition font-mono text-xs sm:text-sm"
              required
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={handlePaste}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              >
                Paste
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Advanced options */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Optional Title */}
              <div>
                <label htmlFor="title-input" className="block text-xs font-medium text-slate-300 mb-1">
                  Link Title or Label <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  id="title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Project Specs or Docs"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Custom Short Code */}
              <div>
                <label htmlFor="custom-code-input" className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Alias / Code <span className="text-slate-500 font-normal">(e.g. "resume" or empty for random 6-char)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 text-xs font-mono">/</span>
                  <input
                    id="custom-code-input"
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="my-link (leave empty for 6-char)"
                    maxLength={15}
                    className="w-full pl-6 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Expiration Settings (Feature 4) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  <span>Link Expiration (Feature: Return 410 error once expired)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {expirationOption === 'never' ? 'Permanent link' : `Expires according to rule`}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { key: '1h', label: '1 Hour' },
                  { key: '24h', label: '24 Hours' },
                  { key: '7d', label: '7 Days' },
                  { key: '30d', label: '30 Days' },
                  { key: 'never', label: 'Never' },
                  { key: 'custom', label: 'Custom Date' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setExpirationOption(opt.key as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition border ${
                      expirationOption === opt.key
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {expirationOption === 'custom' && (
                <div className="mt-2.5">
                  <label htmlFor="custom-date-input" className="block text-[11px] text-slate-400 mb-1">
                    Select Exact Expiration Timestamp
                  </label>
                  <input
                    id="custom-date-input"
                    type="datetime-local"
                    value={customExpiresAt}
                    onChange={(e) => setCustomExpiresAt(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              )}
            </div>

          </div>
        )}

        {/* Submit Button & Quick Preset Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          {/* Quick preset buttons */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 font-medium">Quick Demo URLs:</span>
            <button
              type="button"
              onClick={() => applyPreset('https://docs.spring.io/spring-boot/docs/current/reference/html/', 'Spring Boot Reference Docs', '24h')}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition text-[11px]"
            >
              🌱 Spring Docs
            </button>
            <button
              type="button"
              onClick={() => applyPreset('https://github.com/spring-projects/spring-framework', 'Spring Framework Repository', 'never')}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition text-[11px]"
            >
              🐙 GitHub
            </button>
            <button
              type="button"
              onClick={() => applyPreset('https://en.wikipedia.org/wiki/URL_shortening', 'Wikipedia URL Shortener Article', '1h')}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition text-[11px]"
            >
              ⚡ 1-Hour Link
            </button>
          </div>

          {/* Shorten Button */}
          <button
            id="submit-shorten-btn"
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold transition shadow-lg shadow-sky-600/25 border border-sky-400/30"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Code...</span>
              </>
            ) : (
              <>
                <span>Shorten URL</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};
