import React from 'react';
import { Link2, Code2, Terminal, Download, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'shortener' | 'java' | 'api';
  setActiveTab: (tab: 'shortener' | 'java' | 'api') => void;
  totalLinks: number;
  totalClicks: number;
  expiredCount: number;
  onDownloadZip: () => void;
  onResetSeed: () => void;
  isDownloading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalLinks,
  totalClicks,
  expiredCount,
  onDownloadZip,
  onResetSeed,
  isDownloading
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">URL Shortener</h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  TinyURL & Bitly Clone
                </span>
              </div>
              <p className="text-xs text-slate-400">
                6-char codes • HTTP 302 redirects • Click counter • Expiration • Spring Boot & VS Code
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center flex-wrap gap-2">
            <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800" aria-label="Tabs">
              <button
                id="tab-shortener-btn"
                onClick={() => setActiveTab('shortener')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'shortener'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Shortener & Links</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-sky-950 text-sky-300 font-mono">
                  {totalLinks}
                </span>
              </button>

              <button
                id="tab-java-btn"
                onClick={() => setActiveTab('java')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'java'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Java Spring Boot & VS Code</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              <button
                id="tab-api-btn"
                onClick={() => setActiveTab('api')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'api'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>API & curl Tester</span>
              </button>
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <button
                id="download-zip-btn"
                onClick={onDownloadZip}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm border border-emerald-400/30"
                title="Download complete Spring Boot Java Maven project ready for VS Code"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isDownloading ? 'Packaging...' : 'Download Java Project'}</span>
              </button>

              <button
                id="reset-seed-btn"
                onClick={onResetSeed}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
                title="Reset example demo links"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Real-time stats bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>Total Clicks Tracked: <strong className="text-slate-200 font-mono">{totalClicks}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 inline-block"></span>
              <span>Active Links: <strong className="text-slate-200 font-mono">{totalLinks - expiredCount}</strong></span>
            </span>
            {expiredCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400 inline-block"></span>
                <span>Expired (410): <strong className="text-rose-300 font-mono">{expiredCount}</strong></span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            H2 Database / MySQL compatible • Base62 6-char generator
          </div>
        </div>

      </div>
    </header>
  );
};
