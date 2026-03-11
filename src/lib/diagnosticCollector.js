/**
 * diagnosticCollector.js — Global error/event collector
 *
 * Hooks into window.onerror, unhandledrejection, and console.error.
 * Stores last 100 events in memory. Optionally persists to Supabase.
 */

const MAX_EVENTS = 100;
let events = [];
let initialized = false;

function addEvent(event) {
  events.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }
}

export function init() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Global error handler
  window.addEventListener('error', (e) => {
    addEvent({
      type: 'error',
      source: 'window.onerror',
      message: e.message || 'Unknown error',
      stack: e.error?.stack || null,
      filename: e.filename,
      line: e.lineno,
      col: e.colno,
    });
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (e) => {
    addEvent({
      type: 'error',
      source: 'unhandledrejection',
      message: e.reason?.message || String(e.reason) || 'Unhandled rejection',
      stack: e.reason?.stack || null,
    });
  });

  // Wrap console.error
  const originalError = console.error;
  console.error = (...args) => {
    addEvent({
      type: 'warning',
      source: 'console.error',
      message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ').slice(0, 500),
    });
    originalError.apply(console, args);
  };
}

export function getEvents() {
  return [...events];
}

export function getRecentEvents(minutes = 5) {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return events.filter(e => new Date(e.timestamp).getTime() > cutoff);
}

export function getErrorCount(minutes = 5) {
  return getRecentEvents(minutes).filter(e => e.type === 'error').length;
}

export function clearEvents() {
  events = [];
}

export function addCustomEvent(type, message, metadata = {}) {
  addEvent({ type, source: 'custom', message, ...metadata });
}

export default { init, getEvents, getRecentEvents, getErrorCount, clearEvents, addCustomEvent };
