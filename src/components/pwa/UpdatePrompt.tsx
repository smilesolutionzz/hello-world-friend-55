import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const applyUpdate = (worker: ServiceWorker) => {
      setShowUpdate(true);
      // 자동 적용
      worker.postMessage({ type: 'SKIP_WAITING' });
    };

    navigator.serviceWorker.ready.then((reg) => {
      // 이미 대기 중인 워커가 있으면 즉시 적용
      if (reg.waiting && navigator.serviceWorker.controller) {
        applyUpdate(reg.waiting);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            applyUpdate(newWorker);
          }
        });
      });
    });

    // 새 SW가 컨트롤 잡으면 자동 새로고침 (한 번만)
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    // 주기적으로 업데이트 체크 (1분마다)
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    }, 60000);

    // 탭 다시 활성화 시에도 체크
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-lg">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">최신 버전으로 업데이트 중...</span>
      </div>
    </div>
  );
};
