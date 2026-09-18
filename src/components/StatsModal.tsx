import React from 'react';
import { X, BarChart3, Clock, Globe, ArrowUpRight, MousePointerClick, Calendar } from 'lucide-react';
import { UrlRecord } from '../types';

interface StatsModalProps {
  link: UrlRecord | null;
  onClose: () => void;
  onTestRedirect: (code: string) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ link, onClose, onTestRedirect }) => {
  if (!link) return null;

  const isExpired = Boolean(link.expiresAt && new Date(link.expiresAt) <= new Date());
  const shortUrl = `${window.location.origin}/s/${link.shortCode}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Link Analytics & Activity</h3>
              <p className="text-xs text-slate-400 font-mono">Code: /{link.shortCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-4 overflow-y-auto pr-1">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <MousePointerClick className="h-3 w-3 text-emerald-400" />
                <span>Total Clicks</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">{link.clickCount}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>Status</span>
              </div>
              <div className={`text-xs font-bold font-mono mt-1 ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isExpired ? 'Expired (410)' : 'Active (302)'}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3 text-sky-400" />
                <span>Created</span>
              </div>
              <div className="text-xs font-mono text-slate-200 mt-1">
                {new Date(link.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div>
              <span className="text-slate-500 font-mono">Original Long URL:</span>
              <p className="text-slate-200 font-mono break-all mt-0.5">{link.longUrl}</p>
            </div>
            {link.expiresAt && (
              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-500 font-mono">Expiration Timestamp:</span>
                <p className="text-amber-300 font-mono mt-0.5">{new Date(link.expiresAt).toLocaleString()}</p>
              </div>
            )}
            {link.lastClickedAt && (
              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-500 font-mono">Last Click Timestamp:</span>
                <p className="text-slate-300 font-mono mt-0.5">{new Date(link.lastClickedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Click History Log */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Recent Visit Logs</span>
              <span className="text-[10px] text-slate-500">Last 50 entries</span>
            </h4>

            {link.clicksHistory && link.clicksHistory.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {link.clicksHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      <span className="text-slate-300">{item.referer || 'Direct Visit'}</span>
                    </div>
                    <span className="text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-500">
                {link.clickCount === 0
                  ? 'No clicks recorded yet. Click "Test HTTP 302 Redirect" below to increment the counter!'
                  : `${link.clickCount} clicks recorded.`}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onTestRedirect(link.shortCode);
              window.open(`/s/${link.shortCode}`, '_blank');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
          >
            <span>Test Redirect & Increment</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
