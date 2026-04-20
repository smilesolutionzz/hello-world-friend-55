import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // 이미 대기 중인 워커가 있으면 즉시 프롬프트 노출
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setShowUpdate(true);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowUpdate(true);
          }
        });
      });
    });

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    // 주기적으로 업데이트 체크
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update());
    }, 30000);

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

  const handleUpdate = async () => {
    try {
      // 캐시 강제 삭제
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        // controllerchange 안 올 경우 대비 폴백
        setTimeout(() => window.location.reload(), 800);
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300 px-4 w-full max-w-md">
      <div className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-lg">
        <RefreshCw className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium flex-1 break-keep">새 버전이 있습니다</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleUpdate}
          className="h-7 px-3 text-xs rounded-full shrink-0"
        >
          지금 업데이트
        </Button>
      </div>
    </div>
  );
};
