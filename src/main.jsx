import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { isNative, isAndroid } from '@/lib/platform'

// Fail fast if required env vars are missing
const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
REQUIRED_ENV.forEach(key => {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file or Vercel environment settings.`);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// ── Web-only: service worker for push notifications ──
if (!isNative && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ── Native-only: StatusBar, back button, deep links ──
if (isNative) {
  // Status bar: dark style matching stadium-950 background
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0a0f1a' });
  }).catch(() => {});

  // Android hardware back button
  if (isAndroid) {
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
    }).catch(() => {});
  }

  // Deep link handler (auth callbacks, shared URLs)
  import('@capacitor/app').then(({ App: CapApp }) => {
    CapApp.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      // Auth callback — let Supabase's detectSessionInUrl handle it
      if (url.hash?.includes('access_token') || url.pathname === '/auth-callback') {
        window.location.hash = url.hash;
      } else {
        // Regular deep link — navigate within app
        const path = url.pathname || '/';
        window.location.href = path;
      }
    });
  }).catch(() => {});
}
