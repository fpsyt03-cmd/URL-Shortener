export interface UrlRecord {
  id: string;
  shortCode: string;
  longUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
  lastClickedAt: string | null;
  title?: string;
  tags?: string[];
  clicksHistory?: Array<{
    timestamp: string;
    userAgent?: string;
    referer?: string;
  }>;
}

export interface ShortenPayload {
  longUrl: string;
  customCode?: string;
  expirationOption: 'never' | '1h' | '24h' | '7d' | '30d' | 'custom';
  customExpiresAt?: string;
  title?: string;
}

export interface JavaProjectFile {
  path: string;
  name: string;
  category: 'core' | 'model' | 'controller' | 'service' | 'config' | 'test' | 'doc';
  description: string;
  content: string;
}
