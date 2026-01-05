import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPromptBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed today
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        return; // Don't show for 24 hours
      }
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // For Android/Chrome - listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS - show banner after 3 seconds
    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9998] animate-slide-up md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-gradient-to-r from-primary to-purple-600 border-none shadow-2xl">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white">
                앱으로 더 빠르게! 📱
              </h3>
              <p className="text-white/90 text-sm mt-0.5">
                {isIOS 
                  ? '공유 → 홈 화면에 추가로 설치하세요'
                  : '홈 화면에 추가하고 앱처럼 사용하세요'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-white/70 hover:bg-white/20 shrink-0 -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-3">
            {!isIOS && deferredPrompt ? (
              <Button
                onClick={handleInstall}
                className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
                size="sm"
              >
                <Download className="w-4 h-4 mr-1.5" />
                지금 설치
              </Button>
            ) : isIOS ? (
              <Button
                onClick={() => window.location.href = '/install'}
                className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
                size="sm"
              >
                설치 방법 보기
              </Button>
            ) : null}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-white/80 hover:bg-white/20"
              size="sm"
            >
              나중에
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
