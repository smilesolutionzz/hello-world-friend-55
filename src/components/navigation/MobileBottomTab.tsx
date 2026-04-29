import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles, UserRound, LineChart, Users } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';

/**
 * 핵심 기능 중심 하단바 (모바일 최적화)
 * - 가운데 "마음 트랙"을 골드 FAB로 강조하여 한눈에 핵심 상품 인지
 * - 큰 아이콘 + 또렷한 라벨로 가독성 확보
 * - 활성 탭은 골드 배경 pill로 시각화
 */
const MobileBottomTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportCredits, isSubscriber } = useAccessControl();

  const hiddenPaths = ['/auth', '/reset-password', '/admin'];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const path = location.pathname;
  const getActiveTab = () => {
    if (path === '/' || path === '/en') return 'home';
    if (path.startsWith('/mind-track')) return 'track';
    if (path.startsWith('/my-journey') || path.startsWith('/progress')) return 'journey';
    if (path.startsWith('/expert-hiring') || path.startsWith('/booking') || path.startsWith('/consultation')) return 'expert';
    if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/dashboard') || path.startsWith('/rewards')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case 'home': navigate('/'); break;
      case 'track': navigate('/mind-track'); break;
      case 'journey': navigate('/my-journey'); break;
      case 'expert': navigate('/expert-hiring'); break;
      case 'profile': navigate('/profile'); break;
    }
  };

  const sideTabs = [
    { id: 'home',    label: '홈',       icon: Home },
    { id: 'journey', label: '나의 여정', icon: LineChart },
    { id: 'expert',  label: '전문가',   icon: Users },
    { id: 'profile', label: 'MY',       icon: UserRound },
  ];

  // 좌측 2개 / 가운데 트랙 / 우측 2개로 분할
  const leftTabs = [sideTabs[0], sideTabs[1]];
  const rightTabs = [sideTabs[2], sideTabs[3]];

  const renderTab = (tab: typeof sideTabs[number]) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className="relative flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
        aria-label={tab.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className={`flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
          isActive ? 'bg-[#C8B88A]/15' : 'bg-transparent'
        }`}>
          <Icon
            className={`w-[22px] h-[22px] ${isActive ? 'text-[#8a7a4d] stroke-[2.4]' : 'text-muted-foreground stroke-[1.8]'}`}
          />
        </div>
        <span className={`text-[11px] leading-none break-keep tracking-tight ${
          isActive ? 'text-[#8a7a4d] font-bold' : 'text-muted-foreground font-medium'
        }`}>
          {tab.label}
        </span>

        {/* MY: 보유 이용권 배지 */}
        {tab.id === 'profile' && reportCredits > 0 && (
          <span className="absolute top-0.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {reportCredits}
          </span>
        )}
      </button>
    );
  };

  const trackActive = activeTab === 'track';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#C8B88A]/25 md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}
    >
      <div className="relative grid grid-cols-5 h-16 items-center">
        {/* 좌측 */}
        {leftTabs.map(renderTab)}

        {/* 가운데 FAB: 마음 트랙 (핵심 상품) */}
        <div className="flex items-start justify-center">
          <button
            onClick={() => handleTabClick('track')}
            aria-label="마음 트랙"
            aria-current={trackActive ? 'page' : undefined}
            className="relative -mt-7 flex flex-col items-center active:scale-95 transition-transform"
          >
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg ring-4 ring-white transition-all ${
                trackActive
                  ? 'bg-gradient-to-br from-[#C8B88A] to-[#8a7a4d]'
                  : 'bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a]'
              }`}
            >
              <Sparkles className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span className={`mt-1 text-[11px] leading-none font-bold break-keep tracking-tight ${
              trackActive ? 'text-[#8a7a4d]' : 'text-[#1a1a1a]'
            }`}>
              마음 트랙
            </span>

            {/* 비구독자: NEW 권유 라벨 */}
            {!isSubscriber && (
              <span className="absolute -top-2 right-0 translate-x-1/3 px-1.5 h-4 rounded-full bg-[#C8B88A] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                NEW
              </span>
            )}
          </button>
        </div>

        {/* 우측 */}
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
};

export { MobileBottomTab };
export default MobileBottomTab;
