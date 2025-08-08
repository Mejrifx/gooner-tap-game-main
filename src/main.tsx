import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Dev-only: ensure no stale service workers or caches interfere with Vite dev
if (import.meta.env.DEV && typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
  }
  if ('caches' in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}

createRoot(document.getElementById("root")!).render(<App />);
