import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles, UserRound, LineChart, Users } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';

/**
 * 핵심 기능 중심 하단바
 * 1) 홈
 * 2) 마음 트랙 (₩19,900 30일 단일 상품 — PMF 핵심)
 * 3) 나의 여정 (RCI 기반 종단 분석 대시보드)
 * 4) 전문가 (전문가 상담 단건 결제 / 매칭)
 * 5) MY (프로필·이용권)
 */
const MobileBottomTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportCredits, isSubscriber } = useAccessControl();

  // 특정 페이지에서는 숨기기
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
      case 'home':
        navigate('/');
        break;
      case 'track':
        navigate('/mind-track');
        break;
      case 'journey':
        navigate('/my-journey');
        break;
      case 'expert':
        navigate('/expert-hiring');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  const tabs = [
    { id: 'home',    label: '홈',       icon: Home },
    { id: 'track',   label: '마음 트랙', icon: Sparkles },
    { id: 'journey', label: '나의 여정', icon: LineChart },
    { id: 'expert',  label: '전문가',   icon: Users },
    { id: 'profile', label: 'MY',       icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#C8B88A]/20 md:hidden safe-area-pb">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-[#8a7a4d]' : 'text-muted-foreground'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* 활성 인디케이터 (상단 골드 라인) */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[#C8B88A]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.6]'}`} />
              <span className={`text-[10px] leading-tight break-keep ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>

              {/* 마음 트랙: 비구독자에게 권유 점 */}
              {tab.id === 'track' && !isSubscriber && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 w-1.5 h-1.5 rounded-full bg-[#C8B88A]" />
              )}

              {/* MY: 보유 이용권 배지 */}
              {tab.id === 'profile' && reportCredits > 0 && (
                <span className="absolute -top-0.5 right-1/2 translate-x-5 min-w-[16px] h-4 px-1 rounded-full bg-[#1a1a1a] text-white text-[9px] font-bold flex items-center justify-center">
                  {reportCredits}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { MobileBottomTab };
export default MobileBottomTab;
