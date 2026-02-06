const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PING_INTERVAL = 4 * 60 * 1000; // Ping every 4 minutes to prevent Render spin-down (free tier sleeps after ~15 min)
const CRITICAL_PING_INTERVAL = 10 * 1000; // Aggressive 10s ping during critical operations

let pingInterval: ReturnType<typeof setInterval> | null = null;
let lastActivityTime = Date.now();
let isPageVisible = true;

// Track page visibility to pause pings when tab is hidden
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  });
}

/**
 * Ping the backend /health endpoint to keep the Render free-tier instance awake.
 * Returns true if the backend is responsive.
 */
export async function pingBackend(): Promise<boolean> {
  try {
    // Use GET request for better compatibility
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });
    return response.ok;
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
  delayMs = 3000,
): Promise<T> {
  // Pre-wake: ensure backend is alive before the first attempt
  const awake = await pingBackend();
  if (!awake) {
    console.log('Backend appears asleep, waking up before request...');
    await wakeUpBackend(8); // up to ~40s for full cold start
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network Error');
      const isCorsError = error.message?.includes('Network Error') && !error.response;
      const isServerError = error.response?.status >= 500;

      if ((isTimeout || isServerError || isCorsError) && attempt < retries) {
        console.log(`Request failed (attempt ${attempt + 1}/${retries + 1}), waking backend...`);
        // Aggressive wake: 6 attempts (~30s) to handle full cold start
        await wakeUpBackend(6);
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
 * Only pings when page is visible and there's been recent activity.
 */
export function startKeepAlive() {
  if (pingInterval) return;
  
  // Initial ping
  pingBackend();
  
  pingInterval = setInterval(() => {
    // Only ping if page is visible and there's been activity in last 10 minutes
    const timeSinceActivity = Date.now() - lastActivityTime;
    const isActive = timeSinceActivity < 10 * 60 * 1000;
    
    if (isPageVisible && isActive) {
      pingBackend();
    }
  }, PING_INTERVAL);
  
  // Track user activity to avoid pinging inactive tabs
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  const updateActivity = () => { lastActivityTime = Date.now(); };
  
  activityEvents.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });
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

/**
 * Start aggressive keep-alive for critical operations (checkout, payment).
 * During payment flow, pings even when page isn't visible (Razorpay modal may obscure focus).
 * Returns a function to stop the aggressive pinging.
 */
export function startCriticalKeepAlive(): () => void {
  let criticalInterval: ReturnType<typeof setInterval> | null = null;
  
  // Immediate ping
  pingBackend();
  
  // Aggressive pinging every 10 seconds — ignore page visibility during payment
  criticalInterval = setInterval(() => {
    pingBackend();
  }, CRITICAL_PING_INTERVAL);
  
  // Return cleanup function
  return () => {
    if (criticalInterval) {
      clearInterval(criticalInterval);
      criticalInterval = null;
    }
  };
}
