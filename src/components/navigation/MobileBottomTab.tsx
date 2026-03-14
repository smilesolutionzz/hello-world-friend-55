import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, FileText, Crown, User, Home } from 'lucide-react';
import { useAccessControl } from '@/hooks/useAccessControl';

const MobileBottomTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportCredits, isSubscriber } = useAccessControl();

  // 특정 페이지에서는 숨기기
  const hiddenPaths = ['/auth', '/reset-password', '/admin'];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/en') return 'home';
    if (path.startsWith('/premium-assessment') || path === '/assessment') return 'assessment';
    if (path.startsWith('/token-subscription') || path.startsWith('/pricing') || path.startsWith('/payment')) return 'premium';
    if (path.startsWith('/assessment-history') || path.startsWith('/assessment-detail') || path.startsWith('/concern-storage')) return 'reports';
    if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/dashboard')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case 'home':
        navigate('/');
        break;
      case 'assessment':
        navigate('/premium-assessment');
        break;
      case 'premium':
        navigate('/token-subscription');
        break;
      case 'reports':
        navigate('/report-generator');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  const tabs = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'assessment', label: '검사', icon: Brain },
    { id: 'premium', label: '구독', icon: Crown },
    { id: 'reports', label: '리포트', icon: FileText },
    { id: 'profile', label: 'MY', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-area-pb">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {/* 구독 탭 빨간 점 */}
              {tab.id === 'premium' && !isSubscriber && (
                <span className="absolute top-1 right-1/2 translate-x-4 w-1.5 h-1.5 rounded-full bg-destructive" />
              )}
              {/* MY 탭에 크레딧 배지 */}
              {tab.id === 'profile' && reportCredits > 0 && (
                <span className="absolute -top-0.5 right-1/2 translate-x-5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
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
