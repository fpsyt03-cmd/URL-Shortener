import React, { useState } from 'react';
import { Download, Code2, Terminal, Check, Copy, ExternalLink, Database, Layers, CheckCircle2, FileCode, BookOpen } from 'lucide-react';
import { JAVA_PROJECT_FILES } from '../data/javaProjectFiles';

interface JavaGuideProps {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const JavaGuide: React.FC<JavaGuideProps> = ({ onDownloadZip, isDownloading }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeFile = JAVA_PROJECT_FILES[selectedFileIndex] || JAVA_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyCmd = async (cmd: string, key: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(key);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {
      // Fallback
    }
  };

  const extensions = [
    {
      name: 'Extension Pack for Java',
      publisher: 'Microsoft',
      id: 'vscjava.vscode-java-pack',
      desc: 'Mandatory: Provides Language Support for Java (Red Hat), Debugger, Maven project support, and Test Runner.',
      cli: 'code --install-extension vscjava.vscode-java-pack'
    },
    {
      name: 'Spring Boot Extension Pack',
      publisher: 'VMware',
      id: 'vmware.vscode-spring-boot-pack',
      desc: 'Mandatory: Spring Boot Tools for navigation, application.properties auto-complete, and Spring Boot Dashboard.',
      cli: 'code --install-extension vmware.vscode-spring-boot-pack'
    },
    {
      name: 'Thunder Client',
      publisher: 'Ranga Vadhineni',
      id: 'rangav.vscode-thunder-client',
      desc: 'Recommended: Lightweight REST API client inside VS Code for testing /api/shorten and GET /{shortCode} redirects without leaving VS Code.',
      cli: 'code --install-extension rangav.vscode-thunder-client'
    },
    {
      name: 'Database Client (H2 / MySQL)',
      publisher: 'cweijan',
      id: 'cweijan.vscode-database-client2',
      desc: 'Optional: Inspect and query your H2 database tables (url_mappings) directly from VS Code.',
      cli: 'code --install-extension cweijan.vscode-database-client2'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner with 1-Click Download */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/60 border border-indigo-800/40 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                Turnkey Java 17 + Spring Boot 3.3
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                Zero Config H2 Database
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Java Spring Boot URL Shortener Project
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Complete, production-ready Spring Boot project with 6-character Base62 code generation, real HTTP 302 redirects, click counter persistence, and expiration verification. Pre-configured for VS Code local development.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Bundling ZIP...' : 'Download Project ZIP'}</span>
            </button>
            <span className="text-[11px] text-center text-slate-400">
              Ready to unzip & run in VS Code
            </span>
          </div>
        </div>
      </div>

      {/* VS Code Extensions to Download (User Explicit Question) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Extensions to Download on VS Code</h3>
            <p className="text-xs text-slate-400">
              Open VS Code, press <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">Ctrl+Shift+X</code> (or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300">Cmd+Shift+X</code> on Mac) and search for these extensions:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {extensions.map((ext) => (
            <div
              key={ext.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-200">{ext.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {ext.publisher}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ext.desc}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                <code className="text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
                  {ext.id}
                </code>
                <button
                  onClick={() => handleCopyCmd(ext.cli, ext.id)}
                  className="text-xs flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                  title="Copy terminal install command"
                >
                  {copiedCmd === ext.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied CLI</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-[11px]">Copy Install CLI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Step-by-Step Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">How to Run Locally on Your VS Code Terminal</h3>
            <p className="text-xs text-slate-400">Step-by-step commands to build, test, and run the backend</p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-200">Open the Project in VS Code</h4>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Unzip the downloaded folder and open it inside VS Code:
            </p>
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg font-mono text-xs text-slate-200 border border-slate-800">
              <code>code spring-boot-url-shortener</code>
              <button
                onClick={() => handleCopyCmd('code spring-boot-url-shortener', 'step1')}
                className="text-slate-400 hover:text-white"
              >
                {copiedCmd === 'step1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-200">Run the Spring Boot Application</h4>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Open the integrated terminal in VS Code (<code className="text-sky-300">Ctrl+`</code>) and execute:
            </p>
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-xs text-slate-200 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 select-none mr-2"># Mac / Linux:</span>
                  <code>./mvnw spring-boot:run</code>
                </div>
                <button
                  onClick={() => handleCopyCmd('./mvnw spring-boot:run', 'step2-nix')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'step2-nix' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-xs text-slate-200 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 select-none mr-2"># Windows (PowerShell/CMD):</span>
                  <code>.\mvnw.cmd spring-boot:run</code>
                </div>
                <button
                  onClick={() => handleCopyCmd('.\\mvnw.cmd spring-boot:run', 'step2-win')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'step2-win' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-emerald-400 font-mono mt-2">
              Server starts at: http://localhost:8080 • H2 Web Console at: http://localhost:8080/h2-console
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-200">Run Automated Tests</h4>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Runs JUnit 5 test cases verifying 6-char generation, HTTP 302 redirects, click counter incrementing, and 410 GONE on expired links:
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-xs text-slate-200 border border-slate-800 flex items-center justify-between">
              <code>./mvnw test</code>
              <button
                onClick={() => handleCopyCmd('./mvnw test', 'step3')}
                className="text-slate-400 hover:text-white"
              >
                {copiedCmd === 'step3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Source Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Java Project Code Browser</h3>
              <p className="text-xs text-slate-400">Explore each clean, beginner-friendly Spring Boot class</p>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 self-start sm:self-auto"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Current File</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* File list pills */}
          <div className="lg:col-span-4 space-y-1.5">
            {JAVA_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition border flex items-center justify-between ${
                  selectedFileIndex === idx
                    ? 'bg-sky-500/15 border-sky-500 text-sky-200 font-semibold'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-mono text-slate-200 truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                </div>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono flex-shrink-0">
                  {file.category}
                </span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-8 flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-slate-200">{activeFile.name}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeFile.description}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {activeFile.content.split('\n').length} lines
              </span>
            </div>

            <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[500px]">
              <code>{activeFile.content}</code>
            </pre>
          </div>

        </div>
      </div>

    </div>
  );
};
