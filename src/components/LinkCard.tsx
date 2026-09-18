import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, QrCode, BarChart3, Trash2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { UrlRecord } from '../types';

interface LinkCardProps {
  link: UrlRecord;
  onDelete: (code: string) => void;
  onOpenQr: (link: UrlRecord) => void;
  onOpenStats: (link: UrlRecord) => void;
  onRedirectClick: (code: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onDelete,
  onOpenQr,
  onOpenStats,
  onRedirectClick
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const shortUrl = `${window.location.origin}/s/${link.shortCode}`;

  useEffect(() => {
    const calculateExpiry = () => {
      if (!link.expiresAt) {
        setTimeLeft('Never expires');
        setIsExpired(false);
        return;
      }

      const diff = new Date(link.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
      } else {
        setIsExpired(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeLeft(`${days}d ${hours % 24}h left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${mins}m left`);
        } else {
          setTimeLeft(`${mins}m left`);
        }
      }
    };

    calculateExpiry();
    const interval = setInterval(calculateExpiry, 30000);
    return () => clearInterval(interval);
  }, [link.expiresAt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleTestRedirect = () => {
    // Notify parent to increment/refresh state
    onRedirectClick(link.shortCode);
    // Open redirect URL in new window/tab
    window.open(`/s/${link.shortCode}`, '_blank');
  };

  return (
    <div
      id={`link-card-${link.shortCode}`}
      className={`relative bg-slate-900/90 rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:shadow-lg ${
        isExpired
          ? 'border-rose-900/50 bg-rose-950/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        
        {/* Left: Short code & Target URL */}
        <div className="space-y-1.5 min-w-0 flex-1">
          {link.title && (
            <h3 className="text-xs font-semibold text-slate-300 truncate">
              {link.title}
            </h3>
          )}

          <div className="flex items-center flex-wrap gap-2">
            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-xs font-bold tracking-wide">
              {link.shortCode}
            </span>

            <span className="text-sm font-mono font-semibold text-slate-100 truncate">
              {shortUrl}
            </span>

            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1"
              title="Copy short link"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Long URL */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="text-slate-500 flex-shrink-0">Destination:</span>
            <a
              href={link.longUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-slate-300 hover:text-sky-400 hover:underline flex items-center gap-1"
              title={link.longUrl}
            >
              <span className="truncate">{link.longUrl}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Right: Badges & Status */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
          
          {/* Click count badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>{link.clickCount}</span>
            <span className="text-slate-400 font-normal text-[11px]">clicks</span>
          </div>

          {/* Expiration badge */}
          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
              isExpired
                ? 'bg-rose-950/70 text-rose-300 border-rose-800/80'
                : link.expiresAt
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
            }`}
          >
            {isExpired ? (
              <AlertTriangle className="h-3 w-3 text-rose-400" />
            ) : (
              <Clock className="h-3 w-3 text-slate-400" />
            )}
            <span>{timeLeft}</span>
          </div>

        </div>

      </div>

      {/* Footer controls & test actions */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        
        {/* Test 302 Redirect Button (Feature 2 & 3 demonstration) */}
        <button
          onClick={handleTestRedirect}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
            isExpired
              ? 'bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700/50'
              : 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/30'
          }`}
          title={isExpired ? 'Test visiting expired link (returns 410 error)' : 'Test HTTP 302 redirect in browser'}
        >
          <span>{isExpired ? 'Test Expired (410 Error)' : 'Test HTTP 302 Redirect'}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenQr(link)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title="Generate QR code"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">QR Code</span>
          </button>

          <button
            onClick={() => onOpenStats(link)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title="View click logs and timeline"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Analytics</span>
          </button>

          <button
            onClick={() => onDelete(link.shortCode)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition border border-transparent hover:border-rose-900/40"
            title="Delete short URL"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
