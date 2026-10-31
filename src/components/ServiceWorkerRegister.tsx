'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('FINMECH ServiceWorker registered:', reg.scope))
          .catch((err) => console.log('ServiceWorker registration error:', err));
      });
    }
  }, []);

  return null;
}

