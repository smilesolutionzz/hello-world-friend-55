import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 main.tsx: Starting application...');

// 옛 화면(스테일 캐시) 1회성 정리:
// 과거에 등록된 서비스워커/캐시가 남아있으면 옛 index.html을 계속 서빙하므로 해제한다.
// (Firebase Messaging 등 알림용 워커는 messaging-sw 스코프라 영향 없음)
(async () => {
  try {
    const FLAG = 'aihpro:sw-cleanup-v2';
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(FLAG)) return;
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs
          .filter((r) => {
            const url = r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || '';
            // 알림용 워커는 건드리지 않음
            return !/messaging|firebase|onesignal/i.test(url);
          })
          .map((r) => r.unregister().catch(() => false)),
      );
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !/messaging|firebase|onesignal/i.test(k)).map((k) => caches.delete(k).catch(() => false)),
      );
    }
    localStorage.setItem(FLAG, String(Date.now()));
  } catch {
    /* noop */
  }
})();

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ main.tsx: Creating React root and rendering App...');
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('❌ main.tsx: Root element not found!');
}