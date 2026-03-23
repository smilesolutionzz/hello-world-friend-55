import { useEffect } from 'react';

export const UpdatePrompt = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 자동 업데이트: skip waiting 후 리로드
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      });

      // controllerchange 시 자동 리로드
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // 1분마다 업데이트 체크
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update();
        });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, []);

  return null;
};
