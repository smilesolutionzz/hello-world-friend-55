import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Service Worker 등록 및 업데이트 감지
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // 새 버전 체크
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 새 버전 사용 가능
                setShowPrompt(true);
              }
            });
          }
        });
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

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Service Worker에게 skip waiting 메시지 전송
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Service Worker 활성화 후 페이지 리로드
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const close = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-none shadow-2xl max-w-md w-full pointer-events-auto animate-slide-up">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  새 버전 사용 가능 🎉
                </h3>
                <p className="text-white/90 text-sm">
                  업데이트하여 최신 기능을 이용하세요
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleUpdate}
              className="flex-1 bg-white text-purple-600 hover:bg-white/90 font-semibold"
              size="lg"
            >
              지금 업데이트
            </Button>
            <Button
              onClick={close}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              나중에
            </Button>
          </div>
          
          <p className="text-xs text-white/70 mt-3 text-center">
            💡 업데이트하면 캐시가 초기화되어 최신 버전이 표시됩니다
          </p>
        </div>
      </Card>
    </div>
  );
};
