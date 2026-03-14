import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, ClipboardList, Crown, User, Home } from 'lucide-react';

const tabs = [
  { id: 'home', label: '홈', icon: Home, path: '/' },
  { id: 'assessment', label: '검사', icon: Brain, path: '/assessment' },
  { id: 'premium', label: '구독', icon: Crown, path: '/token-subscription' },
  { id: 'history', label: '결과', icon: ClipboardList, path: '/assessment-history' },
  { id: 'profile', label: 'MY', icon: User, path: '/profile' },
];

export const MobileBottomTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 특정 페이지에서는 숨기기
  const hiddenPaths = ['/auth', '/reset-password', '/admin'];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/en') return 'home';
    if (path.startsWith('/assessment') || path.startsWith('/premium-assessment')) return 'assessment';
    if (path.startsWith('/token-subscription') || path.startsWith('/pricing') || path.startsWith('/payment')) return 'premium';
    if (path.startsWith('/assessment-history') || path.startsWith('/assessment-detail')) return 'history';
    if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/dashboard')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-area-pb">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {tab.id === 'premium' && (
                <span className="absolute -top-0.5 right-1/2 translate-x-4 w-1.5 h-1.5 rounded-full bg-destructive" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomTab;
