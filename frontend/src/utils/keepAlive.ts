import { api } from '@/lib/axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PING_INTERVAL = 4 * 60 * 1000; // Ping every 4 minutes to prevent Render spin-down (free tier sleeps after ~15 min)

let pingInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Ping the backend /health endpoint to keep the Render free-tier instance awake.
 * Returns true if the backend is responsive.
 */
export async function pingBackend(): Promise<boolean> {
  try {
    await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wake up the backend with retries. Use before critical operations like checkout / payment.
 * Waits up to ~60s for a cold-started Render instance.
 */
export async function wakeUpBackend(maxAttempts = 6): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const alive = await pingBackend();
    if (alive) return true;
    // Wait 5s between each attempt (total wait ≈ 30s for 6 attempts)
    await new Promise((r) => setTimeout(r, 5000));
  }
  return false;
}

/**
 * Make an API call with automatic backend wake-up and extended timeout.
 * Ideal for payment-critical requests.
 */
export async function resilientApiCall<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 5000,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network Error');
      const isServerError = error.response?.status >= 500;

      if ((isTimeout || isServerError) && attempt < retries) {
        console.log(`Request failed (attempt ${attempt + 1}/${retries + 1}), waking backend...`);
        await wakeUpBackend(2); // quick 2-try wake
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Request failed after all retries');
}

/**
 * Start periodic keep-alive pings. Call once when the app mounts.
 */
export function startKeepAlive() {
  if (pingInterval) return;
  // Initial ping
  pingBackend();
  pingInterval = setInterval(pingBackend, PING_INTERVAL);
}

/**
 * Stop keep-alive pings.
 */
export function stopKeepAlive() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}
