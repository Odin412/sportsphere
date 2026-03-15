import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { isNative } from "@/lib/platform";

const COOLDOWN_KEY = "ss_install_dismissed";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function InstallPrompt() {
  // Never show PWA install prompt inside native app
  if (isNative) return null;
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check cooldown
    const dismissed = localStorage.getItem(COOLDOWN_KEY);
    if (dismissed && Date.now() - Number(dismissed) < COOLDOWN_MS) return;

    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  };

  if (!visible) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 lg:hidden animate-in slide-in-from-top-2 duration-300">
      <div className="glass-card rounded-lg p-3 flex items-center gap-3">
        <Download className="w-5 h-5 text-monza flex-shrink-0" />
        <p className="text-sm text-white flex-1">
          Add <strong>Sportsphere</strong> to your home screen
        </p>
        <button
          onClick={handleInstall}
          className="bg-monza hover:bg-monza-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="text-stadium-600 hover:text-white p-1 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
