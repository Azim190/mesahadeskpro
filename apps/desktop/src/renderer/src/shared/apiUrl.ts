const SERVER_URL_KEY = 'masaha_server_api_url';

export const getApiUrl = (): string => {
  try {
    const saved = localStorage.getItem(SERVER_URL_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.origin &&
    window.location.origin.startsWith('http')
  ) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
};

export const setApiUrl = (url: string): void => {
  try {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned) {
      localStorage.setItem(SERVER_URL_KEY, cleaned);
    } else {
      localStorage.removeItem(SERVER_URL_KEY);
    }
  } catch {
    // ignore
  }
};

export const resetApiUrl = (): void => {
  try {
    localStorage.removeItem(SERVER_URL_KEY);
  } catch {
    // ignore
  }
};

export interface HealthCheckResult {
  ok: boolean;
  status?: string;
  database?: {
    type: 'postgres' | 'sqlite';
    isConnected: boolean;
  };
  latencyMs?: number;
  error?: string;
}

export const checkServerHealth = async (urlToCheck?: string): Promise<HealthCheckResult> => {
  const targetUrl = urlToCheck ? urlToCheck.trim().replace(/\/+$/, '') : getApiUrl();
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${targetUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      return { ok: false, latencyMs, error: `HTTP ${response.status} ${response.statusText}` };
    }
    const data = await response.json();
    return {
      ok: true,
      status: data.status || 'ok',
      database: data.database,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return { ok: false, latencyMs, error: msg };
  }
};
