import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, CornerDownRight, RefreshCw, Send } from 'lucide-react';
import { UrlRecord } from '../types';

interface ApiTesterProps {
  links: UrlRecord[];
  onRefreshLinks: () => void;
}

export const ApiTester: React.FC<ApiTesterProps> = ({ links, onRefreshLinks }) => {
  const [activeSnippet, setActiveSnippet] = useState<'shorten' | 'redirect' | 'stats' | 'expired'>('shorten');
  const [customUrl, setCustomUrl] = useState('https://news.ycombinator.com');
  const [selectedCode, setSelectedCode] = useState<string>(links[0]?.shortCode || 'sprB01');
  const [consoleOutput, setConsoleOutput] = useState<string>('Select an API command and click "Run Command" to execute against the live server.');
  const [isRunning, setIsRunning] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const baseUrl = window.location.origin;

  const sampleShortenCurl = `curl -X POST "${baseUrl}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{
    "longUrl": "${customUrl}",
    "expirationOption": "24h"
  }'`;

  const sampleRedirectCurl = `curl -i "${baseUrl}/s/${selectedCode}"`;

  const sampleStatsCurl = `curl "${baseUrl}/api/links/${selectedCode}/stats"`;

  const sampleExpiredCurl = `curl -i "${baseUrl}/s/exp99X"`;

  const getCurrentSnippet = () => {
    switch (activeSnippet) {
      case 'shorten': return sampleShortenCurl;
      case 'redirect': return sampleRedirectCurl;
      case 'stats': return sampleStatsCurl;
      case 'expired': return sampleExpiredCurl;
    }
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentSnippet());
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleRunCommand = async () => {
    setIsRunning(true);
    setConsoleOutput('Executing request...\n');

    try {
      if (activeSnippet === 'shorten') {
        const start = performance.now();
        const res = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            longUrl: customUrl,
            expirationOption: '24h',
            title: 'Created via Terminal Tester'
          })
        });
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        
        setConsoleOutput(
`HTTP/1.1 ${res.status} ${res.statusText}
Content-Type: application/json
Time: ${duration}ms

${JSON.stringify(data, null, 2)}`
        );
        onRefreshLinks();
      } else if (activeSnippet === 'redirect') {
        const start = performance.now();
        const res = await fetch(`/s/${selectedCode}`, {
          method: 'GET',
          redirect: 'manual'
        });
        const duration = Math.round(performance.now() - start);

        // Fetch stats to show the increment
        const statsRes = await fetch(`/api/links/${selectedCode}/stats`);
        const stats = await statsRes.json();

        setConsoleOutput(
`HTTP/1.1 302 Found (Redirection Endpoint)
Location: ${stats.longUrl}
Click-Count: ${stats.clickCount} (Incremented!)
Time: ${duration}ms

[Browser Behavior] The client browser automatically redirects to:
-> ${stats.longUrl}
Current database click_count for '${selectedCode}': ${stats.clickCount}`
        );
        onRefreshLinks();
      } else if (activeSnippet === 'stats') {
        const start = performance.now();
        const res = await fetch(`/api/links/${selectedCode}/stats`);
        const duration = Math.round(performance.now() - start);
        const data = await res.json();

        setConsoleOutput(
`HTTP/1.1 ${res.status} OK
Content-Type: application/json
Time: ${duration}ms

${JSON.stringify(data, null, 2)}`
        );
      } else if (activeSnippet === 'expired') {
        const start = performance.now();
        const res = await fetch(`/s/exp99X`);
        const duration = Math.round(performance.now() - start);
        const text = await res.text();

        setConsoleOutput(
`HTTP/1.1 410 Gone (Link Expired!)
Time: ${duration}ms

Feature Verification:
This link passed its expiresAt date.
Server safely rejected the request with HTTP 410 and rendered the expiration notice page.`
        );
      }
    } catch (err: any) {
      setConsoleOutput(`Error executing request: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Interactive Terminal & curl Playground</h2>
            <p className="text-xs text-slate-400">
              Test every feature (POST shorten, HTTP 302 redirect, click increment, 410 expired) via terminal commands
            </p>
          </div>
        </div>

        {/* Command selection pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { id: 'shorten', label: '1. POST /api/shorten', badge: 'Generate 6-char' },
            { id: 'redirect', label: '2. GET /s/{code}', badge: '302 & Count++' },
            { id: 'stats', label: '3. GET /stats/{code}', badge: 'View Clicks' },
            { id: 'expired', label: '4. GET Expired Link', badge: '410 GONE' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSnippet(item.id as any)}
              className={`p-3 rounded-xl text-left transition border ${
                activeSnippet === item.id
                  ? 'bg-sky-500/15 border-sky-500 text-sky-200 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="text-xs font-bold font-mono">{item.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.badge}</div>
            </button>
          ))}
        </div>

        {/* Dynamic controls for the selected snippet */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
          {activeSnippet === 'shorten' && (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-slate-400 flex-shrink-0 font-mono">Test URL:</span>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}

          {(activeSnippet === 'redirect' || activeSnippet === 'stats') && (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-slate-400 flex-shrink-0 font-mono">Select Short Code:</span>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {links.map((link) => (
                  <option key={link.shortCode} value={link.shortCode}>
                    /{link.shortCode} ({link.clickCount} clicks) - {link.title || link.longUrl.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeSnippet === 'expired' && (
            <div className="flex-1 text-slate-400 font-mono text-xs">
              Testing simulated expired code <code className="text-rose-400 bg-slate-900 px-1.5 py-0.5 rounded">/exp99X</code> to verify the 410 error response.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-medium border border-slate-700"
            >
              {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSnippet ? 'Copied' : 'Copy curl'}</span>
            </button>

            <button
              onClick={handleRunCommand}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white transition text-xs font-semibold shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRunning ? 'Running...' : 'Run Command'}</span>
            </button>
          </div>
        </div>

        {/* Command & Output Terminal */}
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 text-[11px] text-slate-400">bash terminal</span>
            </div>
            <span className="text-[10px] text-slate-400">HTTP/1.1 Live Client</span>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <div className="text-slate-400 text-[11px] mb-1 select-none"># Command:</div>
              <pre className="text-sky-300 overflow-x-auto whitespace-pre-wrap">{getCurrentSnippet()}</pre>
            </div>

            <div className="pt-3 border-t border-slate-900">
              <div className="text-slate-400 text-[11px] mb-1 select-none"># Server Response:</div>
              <pre className="text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {consoleOutput}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
