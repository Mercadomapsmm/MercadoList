'use client';

import React, { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function getOnlineServerSnapshot() {
  return true;
}

function subscribeOnline(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-banner"
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 flex items-center gap-3 p-3.5 rounded-2xl bg-amber-600 text-white shadow-xl shadow-amber-900/30 border border-amber-400 animate-slideUp"
    >
      <div className="p-2 rounded-xl bg-amber-700/80 shrink-0">
        <WifiOff className="w-5 h-5 text-white" />
      </div>
      <div className="text-xs sm:text-sm">
        <div className="font-extrabold flex items-center gap-1.5">
          <span>Modo Offline Ativo</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
        <div className="text-amber-100 mt-0.5">
          Sem sinal? Sem problemas! Suas listas de compras continuam funcionando offline no supermercado.
        </div>
      </div>
    </div>
  );
}
