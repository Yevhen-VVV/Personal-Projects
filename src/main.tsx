import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support. Registered after load so it never delays first paint.
// The single-file build has no separate sw.js to register, so it opts out.
declare global {
  interface Window {
    __SINGLE_FILE__?: boolean;
  }
}

if ('serviceWorker' in navigator && import.meta.env.PROD && !window.__SINGLE_FILE__) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Offline use is a bonus, not a requirement -- the app works either way.
    });
  });
}
