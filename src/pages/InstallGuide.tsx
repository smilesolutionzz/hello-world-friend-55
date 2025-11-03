import React, { useState, useEffect } from 'react';
import MobileOptimizedLayout, { MobileCard } from '@/components/MobileOptimizedLayout';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Share, MoreVertical } from 'lucide-react';

const InstallGuide = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // iOS 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // 이미 설치되었는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // PWA 설치 프롬프트 이벤트 리스너
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <MobileOptimizedLayout 
      title="홈 화면에 추가" 
      showBackButton={true}
      contentClassName="pb-20"
    >
      <div className="space-y-6">
        {/* 설치 완료 메시지 */}
        {isInstalled && (
          <MobileCard className="bg-primary/10 border-primary/20">
            <div className="text-center py-4">
              <Smartphone className="w-12 h-12 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-semibold mb-1">이미 설치됨</h3>
              <p className="text-sm text-muted-foreground">
                홈 화면에서 앱을 실행할 수 있습니다
              </p>
            </div>
          </MobileCard>
        )}

        {/* Android 자동 설치 버튼 */}
        {!isIOS && isInstallable && !isInstalled && (
          <MobileCard>
            <div className="text-center py-4">
              <Download className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">간편 설치</h3>
              <p className="text-sm text-muted-foreground mb-4">
                클릭 한 번으로 홈 화면에 추가
              </p>
              <Button 
                onClick={handleInstallClick}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                홈 화면에 추가
              </Button>
            </div>
          </MobileCard>
        )}

        {/* iOS 설치 안내 */}
        {isIOS && (
          <MobileCard>
            <div className="space-y-4">
              <div className="text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-semibold">iPhone에 설치하기</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium mb-1">공유 버튼 클릭</p>
                    <p className="text-muted-foreground">
                      화면 하단 또는 상단의 <Share className="w-4 h-4 inline mx-1" /> 공유 버튼을 누르세요
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium mb-1">홈 화면에 추가</p>
                    <p className="text-muted-foreground">
                      메뉴에서 "홈 화면에 추가" 옵션을 찾아 선택하세요
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium mb-1">추가 완료</p>
                    <p className="text-muted-foreground">
                      오른쪽 상단의 "추가" 버튼을 눌러 설치를 완료하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MobileCard>
        )}

        {/* Android 수동 설치 안내 */}
        {!isIOS && !isInstallable && !isInstalled && (
          <MobileCard>
            <div className="space-y-4">
              <div className="text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-semibold">Android에 설치하기</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    1
                  </div>
                  <div>
                    <p className="font-medium mb-1">메뉴 버튼 클릭</p>
                    <p className="text-muted-foreground">
                      브라우저 오른쪽 상단의 <MoreVertical className="w-4 h-4 inline mx-1" /> 메뉴를 누르세요
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    2
                  </div>
                  <div>
                    <p className="font-medium mb-1">홈 화면에 추가</p>
                    <p className="text-muted-foreground">
                      "홈 화면에 추가" 또는 "앱 설치" 옵션을 선택하세요
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    3
                  </div>
                  <div>
                    <p className="font-medium mb-1">설치 확인</p>
                    <p className="text-muted-foreground">
                      "설치" 또는 "추가" 버튼을 눌러 완료하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MobileCard>
        )}

        {/* 설치 후 이점 */}
        <MobileCard>
          <h3 className="text-lg font-semibold mb-4 text-center">앱 설치 시 이점</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">빠른 실행:</strong> 홈 화면에서 바로 접속
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">전체 화면:</strong> 앱처럼 깔끔한 화면
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">오프라인 지원:</strong> 인터넷 없이도 일부 기능 사용
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">빠른 로딩:</strong> 캐시로 더 빠른 속도
              </p>
            </div>
          </div>
        </MobileCard>
      </div>
    </MobileOptimizedLayout>
  );
};

export default InstallGuide;
