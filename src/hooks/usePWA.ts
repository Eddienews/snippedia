
import { useEffect, useState } from 'react';

const DISABLE_SERVICE_WORKER = true;

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let handleControllerChange: (() => void) | null = null;
    let handleSWMessage: ((event: MessageEvent) => void) | null = null;

    // Register service worker only when enabled and /sw.js is actually served as JavaScript.
    if ('serviceWorker' in navigator) {
      if (DISABLE_SERVICE_WORKER) {
        void navigator.serviceWorker.getRegistrations().then((regs) => {
          return Promise.all(regs.map((r) => r.unregister()));
        });
      } else {
      const registerServiceWorker = async () => {
        try {
          const probe = await fetch('/sw.js', { cache: 'no-store' });
          const contentType = probe.headers.get('content-type') || '';
          const isJavaScript = probe.ok && (
            contentType.includes('javascript') ||
            contentType.includes('ecmascript')
          );

          if (!isJavaScript) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
            return;
          }

          const registration = await navigator.serviceWorker.register('/sw.js');
          setSwRegistration(registration);

          // If an updated SW is already waiting, activate it immediately.
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Force activate the new SW so users don't stay on stale bundles.
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        } catch {
          // no-op: keep app usable when SW is unavailable/misconfigured
        }
      };

      void registerServiceWorker();

      // Keep listener available for future SW events without noisy logging in production.
      handleSWMessage = (_event: MessageEvent) => {};
      navigator.serviceWorker.addEventListener('message', handleSWMessage);

      // Reload once when a new SW takes control (updated assets are now active).
      let hasRefreshed = false;
      handleControllerChange = () => {
        if (hasRefreshed) return;
        hasRefreshed = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Trigger an update check on startup.
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.update();
        })
        .catch(() => {
          // noop
        });
      }
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if ('serviceWorker' in navigator && handleControllerChange) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
      if ('serviceWorker' in navigator && handleSWMessage) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = () => {
    if (swRegistration) {
      swRegistration.update();
    }
  };

  return {
    isOnline,
    swRegistration,
    updateServiceWorker
  };
};
