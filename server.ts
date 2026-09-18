import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import JSZip from 'jszip';
import { JAVA_PROJECT_FILES } from './src/data/javaProjectFiles';

interface ClickLog {
  timestamp: string;
  userAgent?: string;
  referer?: string;
}

interface UrlMapping {
  id: string;
  shortCode: string;
  longUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  title?: string;
  clicksHistory: ClickLog[];
}

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DATA_FILE = path.join(process.cwd(), 'urls-db.json');

// Helper to generate 6-character short code
function generateShortCode(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62_CHARS.length);
    result += BASE62_CHARS[randomIndex];
  }
  return result;
}

// Initial seed links for instant demonstration
const SEED_LINKS: UrlMapping[] = [
  {
    id: 'seed-1',
    shortCode: 'sprB01',
    longUrl: 'https://spring.io/projects/spring-boot',
    title: 'Spring Boot Official Documentation',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 72).toISOString(), // 3 days remaining
    clickCount: 14,
    lastClickedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    clicksHistory: [
      { timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), referer: 'Direct / Terminal' }
    ]
  },
  {
    id: 'seed-2',
    shortCode: 'ghRepo',
    longUrl: 'https://github.com/spring-projects/spring-boot',
    title: 'Spring Boot GitHub Repository',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    expiresAt: null, // Never expires
    clickCount: 29,
    lastClickedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    clicksHistory: [
      { timestamp: new Date(Date.now() - 1800 * 1000).toISOString(), referer: 'VS Code Thunder Client' }
    ]
  },
  {
    id: 'seed-3',
    shortCode: 'exp99X',
    longUrl: 'https://example.com/expired-resource-article',
    title: 'Demo Expired Link (Click to test 410 GONE error)',
    createdAt: new Date(Date.now() - 3600 * 1000 * 50).toISOString(),
    expiresAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // Expired 2 hours ago!
    clickCount: 5,
    lastClickedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    clicksHistory: []
  }
];

// Load or initialize data store
let urlStore: UrlMapping[] = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    urlStore = JSON.parse(raw);
  } else {
    urlStore = [...SEED_LINKS];
    fs.writeFileSync(DATA_FILE, JSON.stringify(urlStore, null, 2));
  }
} catch {
  urlStore = [...SEED_LINKS];
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(urlStore, null, 2));
  } catch (err) {
    console.error('Error persisting urls-db.json', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. API: List all URLs
  app.get('/api/links', (req, res) => {
    const now = new Date();
    const enriched = urlStore.map(link => ({
      ...link,
      isExpired: Boolean(link.expiresAt && new Date(link.expiresAt) <= now)
    }));
    res.json(enriched);
  });

  // 2. API: Shorten URL (Feature 1)
  app.post('/api/shorten', (req, res) => {
    const { longUrl, customCode, expirationOption, customExpiresAt, title } = req.body;

    if (!longUrl || typeof longUrl !== 'string') {
      return res.status(400).json({ error: 'Validation Failed', message: 'longUrl is required' });
    }

    let normalizedUrl = longUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Validate URL syntax
    try {
      new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ error: 'Validation Failed', message: 'Invalid URL format' });
    }

    // Determine code
    let shortCode = '';
    if (customCode && typeof customCode === 'string' && customCode.trim().length > 0) {
      const cleaned = customCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      if (cleaned.length < 3 || cleaned.length > 15) {
        return res.status(400).json({ error: 'Validation Failed', message: 'Custom code must be between 3 and 15 alphanumeric characters' });
      }
      if (urlStore.some(u => u.shortCode.toLowerCase() === cleaned.toLowerCase())) {
        return res.status(400).json({ error: 'Conflict', message: `Custom code "${cleaned}" is already taken.` });
      }
      shortCode = cleaned;
    } else {
      let attempts = 0;
      do {
        shortCode = generateShortCode(6);
        attempts++;
      } while (urlStore.some(u => u.shortCode === shortCode) && attempts < 20);
    }

    // Calculate expiration date (Feature 4)
    let expiresAt: string | null = null;
    const now = Date.now();
    if (expirationOption === '1h') {
      expiresAt = new Date(now + 3600 * 1000).toISOString();
    } else if (expirationOption === '24h') {
      expiresAt = new Date(now + 24 * 3600 * 1000).toISOString();
    } else if (expirationOption === '7d') {
      expiresAt = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
    } else if (expirationOption === '30d') {
      expiresAt = new Date(now + 30 * 24 * 3600 * 1000).toISOString();
    } else if (expirationOption === 'custom' && customExpiresAt) {
      const parsedDate = new Date(customExpiresAt);
      if (!isNaN(parsedDate.getTime())) {
        expiresAt = parsedDate.toISOString();
      }
    }

    const newRecord: UrlMapping = {
      id: 'url_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      shortCode,
      longUrl: normalizedUrl,
      title: title && title.trim() ? title.trim() : undefined,
      createdAt: new Date().toISOString(),
      expiresAt,
      clickCount: 0,
      lastClickedAt: null,
      clicksHistory: []
    };

    urlStore.unshift(newRecord);
    saveStore();

    res.status(201).json({
      ...newRecord,
      isExpired: false
    });
  });

  // 3. API: Delete a link
  app.delete('/api/links/:code', (req, res) => {
    const { code } = req.params;
    const initialLen = urlStore.length;
    urlStore = urlStore.filter(u => u.shortCode !== code);
    if (urlStore.length === initialLen) {
      return res.status(404).json({ error: 'Not Found', message: 'Short code not found' });
    }
    saveStore();
    res.json({ success: true, message: `Deleted ${code}` });
  });

  // 4. API: Stats for a specific short code
  app.get('/api/links/:code/stats', (req, res) => {
    const { code } = req.params;
    const link = urlStore.find(u => u.shortCode.toLowerCase() === code.toLowerCase());
    if (!link) {
      return res.status(404).json({ error: 'Not Found', message: 'Short code not found' });
    }
    const isExpired = Boolean(link.expiresAt && new Date(link.expiresAt) <= new Date());
    res.json({ ...link, isExpired });
  });

  // 5. API: Reset or reseed links
  app.post('/api/links/reset', (req, res) => {
    urlStore = [...SEED_LINKS];
    saveStore();
    res.json({ success: true, links: urlStore });
  });

  // 6. API: Download Java Spring Boot Project as ZIP
  app.get('/api/download-java-project', async (req, res) => {
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('spring-boot-url-shortener');

      if (!rootFolder) {
        return res.status(500).json({ error: 'Failed to create zip archive' });
      }

      for (const file of JAVA_PROJECT_FILES) {
        rootFolder.file(file.path, file.content);
      }

      // Add wrapper scripts for maven convenience
      rootFolder.file('mvnw', `#!/bin/sh\nexec mvn "$@"\n`);
      rootFolder.file('mvnw.cmd', `@echo off\nmvn %*\n`);

      const content = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="spring-boot-url-shortener.zip"');
      return res.send(content);
    } catch (error) {
      console.error('ZIP generation error:', error);
      res.status(500).json({ error: 'Failed to bundle project ZIP' });
    }
  });

  // 7. CORE FEATURE: HTTP 302 Redirection & Click Counting & Expiration Check
  // Mounted at /s/:shortCode
  app.get('/s/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const mapping = urlStore.find(u => u.shortCode.toLowerCase() === shortCode.toLowerCase());

    if (!mapping) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Link Not Found - 404</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 36px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { color: #f43f5e; margin: 0 0 12px; font-size: 24px; }
            p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
            .code { background: #0f172a; padding: 4px 10px; border-radius: 6px; font-family: monospace; color: #38bdf8; }
            .btn { display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
            .btn:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>404 - Short Link Not Found</h1>
            <p>The short code <span class="code">${escapeHtml(shortCode)}</span> does not exist in the database or may have been deleted.</p>
            <a href="/" class="btn">Return to URL Shortener</a>
          </div>
        </body>
        </html>
      `);
    }

    // Feature 4: Expiration Check (Link Expiration)
    const now = new Date();
    if (mapping.expiresAt && new Date(mapping.expiresAt) <= now) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Link Expired - 410 Gone</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #131b2e; border: 1px solid #f43f5e33; border-radius: 16px; padding: 36px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(244,63,94,0.1); }
            .icon { font-size: 40px; margin-bottom: 12px; }
            h1 { color: #fb7185; margin: 0 0 12px; font-size: 24px; }
            p { color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
            .meta { background: #0f172a; padding: 14px; border-radius: 10px; font-size: 13px; color: #cbd5e1; text-align: left; margin-bottom: 24px; border: 1px solid #1e293b; }
            .meta div { margin-bottom: 6px; }
            .meta span { color: #94a3b8; }
            .btn { display: inline-block; background: #334155; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500; }
            .btn:hover { background: #475569; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">⏰</div>
            <h1>410 - Link Expired</h1>
            <p>This shortened link has passed its configured expiration date and is no longer accessible.</p>
            <div class="meta">
              <div><span>Short Code:</span> <strong>${escapeHtml(mapping.shortCode)}</strong></div>
              <div><span>Expired At:</span> <strong>${new Date(mapping.expiresAt).toUTCString()}</strong></div>
              <div><span>Total Clicks Before Expiry:</span> <strong>${mapping.clickCount}</strong></div>
            </div>
            <a href="/" class="btn">Return to URL Shortener</a>
          </div>
        </body>
        </html>
      `);
    }

    // Feature 3: Increment Click Counter & Record History
    mapping.clickCount = (mapping.clickCount || 0) + 1;
    mapping.lastClickedAt = new Date().toISOString();
    mapping.clicksHistory = mapping.clicksHistory || [];
    mapping.clicksHistory.unshift({
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'] || 'Direct'
    });
    if (mapping.clicksHistory.length > 50) {
      mapping.clicksHistory.pop();
    }
    saveStore();

    // Feature 2: HTTP 302 Redirection
    console.log(`[HTTP 302 Redirect] ${shortCode} -> ${mapping.longUrl} (Total Clicks: ${mapping.clickCount})`);
    return res.redirect(302, mapping.longUrl);
  });

  // Vite middleware for client frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`URL Shortener backend and client running on http://0.0.0.0:${PORT}`);
  });
}

function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

startServer();
