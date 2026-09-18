import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShortenerForm } from './components/ShortenerForm';
import { LinkCard } from './components/LinkCard';
import { QrCodeModal } from './components/QrCodeModal';
import { StatsModal } from './components/StatsModal';
import { JavaGuide } from './components/JavaGuide';
import { ApiTester } from './components/ApiTester';
import { UrlRecord, ShortenPayload } from './types';
import { Search, Filter, Sparkles, ArrowUpDown, CheckCircle2, AlertCircle, Copy, ArrowUpRight, ExternalLink, QrCode } from 'lucide-react';

export default function App() {
  const [links, setLinks] = useState<UrlRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'shortener' | 'java' | 'api'>('shortener');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'clicks' | 'expiry'>('newest');

  // Modals state
  const [selectedQrLink, setSelectedQrLink] = useState<UrlRecord | null>(null);
  const [selectedStatsLink, setSelectedStatsLink] = useState<UrlRecord | null>(null);

  // Newly created link highlight
  const [latestCreated, setLatestCreated] = useState<UrlRecord | null>(null);
  const [copiedLatest, setCopiedLatest] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (err) {
      console.error('Error loading links:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
    // Poll every 15s to keep click counts updated
    const interval = setInterval(fetchLinks, 15000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleShorten = async (payload: ShortenPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification(data.message || 'Failed to shorten URL', 'error');
        return false;
      }

      setLatestCreated(data);
      showNotification(`Short URL created: /s/${data.shortCode}`, 'success');
      await fetchLinks();
      return true;
    } catch (err: any) {
      showNotification(err.message || 'Network error', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (shortCode: string) => {
    if (!confirm(`Delete short link /s/${shortCode}?`)) return;

    try {
      const res = await fetch(`/api/links/${shortCode}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification(`Deleted /s/${shortCode}`);
        if (latestCreated?.shortCode === shortCode) {
          setLatestCreated(null);
        }
        await fetchLinks();
      }
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const handleRedirectClick = (code: string) => {
    // Refresh click counts shortly after redirect click
    setTimeout(fetchLinks, 1000);
    setTimeout(fetchLinks, 3000);
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const res = await fetch('/api/download-java-project');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spring-boot-url-shortener.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification('Spring Boot Java Project ZIP downloaded! Ready for VS Code.');
    } catch (err) {
      showNotification('Failed to download Java project ZIP', 'error');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/links/reset', { method: 'POST' });
      if (res.ok) {
        showNotification('Reset to example demo links');
        await fetchLinks();
      }
    } catch (err) {
      console.error('Error resetting links:', err);
    }
  };

  // Compute metrics
  const now = new Date();
  const totalClicks = links.reduce((sum, l) => sum + (l.clickCount || 0), 0);
  const expiredCount = links.filter(l => l.expiresAt && new Date(l.expiresAt) <= now).length;

  // Filter and sort links
  const filteredLinks = links
    .filter(link => {
      const isExpired = Boolean(link.expiresAt && new Date(link.expiresAt) <= now);
      if (filterStatus === 'active' && isExpired) return false;
      if (filterStatus === 'expired' && !isExpired) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        link.shortCode.toLowerCase().includes(query) ||
        link.longUrl.toLowerCase().includes(query) ||
        (link.title && link.title.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') {
        return b.clickCount - a.clickCount;
      }
      if (sortBy === 'expiry') {
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalLinks={links.length}
        totalClicks={totalClicks}
        expiredCount={expiredCount}
        onDownloadZip={handleDownloadZip}
        onResetSeed={handleResetSeed}
        isDownloading={isDownloadingZip}
      />

      {/* Global Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tab 1: Shortener & Links Dashboard */}
        {activeTab === 'shortener' && (
          <div className="space-y-6">
            
            {/* Form to shorten URL */}
            <ShortenerForm onShorten={handleShorten} isLoading={isLoading} />

            {/* Newly Created Link Highlight Card */}
            {latestCreated && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/40 shadow-xl shadow-sky-950/40 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        Short Link Created Successfully!
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono font-bold text-white">
                        {window.location.origin}/s/{latestCreated.shortCode}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold">
                        {latestCreated.shortCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate max-w-lg">
                      Destination: {latestCreated.longUrl}
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(`${window.location.origin}/s/${latestCreated.shortCode}`);
                        setCopiedLatest(true);
                        setTimeout(() => setCopiedLatest(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedLatest ? 'Copied Link' : 'Copy Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleRedirectClick(latestCreated.shortCode);
                        window.open(`/s/${latestCreated.shortCode}`, '_blank');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-md shadow-sky-600/30"
                    >
                      <span>Test 302 Redirect</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedQrLink(latestCreated)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                      title="View QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Links Management & Analytics Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by code, URL, or title..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {/* Status filter pills */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['all', 'active', 'expired'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                          filterStatus === status
                            ? 'bg-sky-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent border-none text-xs text-slate-300 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="newest" className="bg-slate-900 text-slate-200">Newest Created</option>
                      <option value="clicks" className="bg-slate-900 text-slate-200">Most Clicked</option>
                      <option value="expiry" className="bg-slate-900 text-slate-200">Expiring Soonest</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Links list */}
              <div className="mt-4">
                {filteredLinks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredLinks.map((link) => (
                      <LinkCard
                        key={link.shortCode}
                        link={link}
                        onDelete={handleDelete}
                        onOpenQr={(l) => setSelectedQrLink(l)}
                        onOpenStats={(l) => setSelectedStatsLink(l)}
                        onRedirectClick={handleRedirectClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-slate-400 text-sm font-medium">No links matching your filter</p>
                    <p className="text-slate-500 text-xs mt-1">Shorten a new URL using the form above or reset the filter.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Java Spring Boot & VS Code Guide */}
        {activeTab === 'java' && (
          <JavaGuide
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloadingZip}
          />
        )}

        {/* Tab 3: API & curl Tester */}
        {activeTab === 'api' && (
          <ApiTester
            links={links}
            onRefreshLinks={fetchLinks}
          />
        )}

      </main>

      {/* Modals */}
      <QrCodeModal
        link={selectedQrLink}
        onClose={() => setSelectedQrLink(null)}
      />

      <StatsModal
        link={selectedStatsLink}
        onClose={() => setSelectedStatsLink(null)}
        onTestRedirect={handleRedirectClick}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>URL Shortener System • TinyURL & Bitly Clone Architecture</span>
          <span className="font-mono text-slate-600">Base62 6-Character Hash • HTTP 302 Redirection • Click Counters • Expiration Control</span>
        </div>
      </footer>

    </div>
  );
}
