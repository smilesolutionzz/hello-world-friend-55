import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, NotebookPen, FileText } from 'lucide-react';
import { trackBottomTabClick, type BottomTabId } from '@/lib/bottomTabAnalytics';

/**
 * B2B 센터 콘솔 전용 하단바 (모바일 최적화)
 * - B2C 기능은 현재 비공개. 하단바는 케어플센터 운영자/치료사가 자주 쓰는 5개 핵심 페이지로 구성.
 * - 대시보드 · 일정 · 이용자 · 치료노트 · 부모 리포트
 */
const MobileBottomTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = [
    '/auth',
    '/reset-password',
    '/admin',
    '/b2b-center/invite',
    '/b2b-center/app/setup',
    '/therapist/',
    '/parent-share/',
    '/r/',
  ];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));
  if (shouldHide) return null;

  const path = location.pathname;

  type Tab = {
    id: BottomTabId;
    label: string;
    to: string;
    match: (p: string) => boolean;
    icon: React.ComponentType<{ className?: string }>;
  };

  const tabs: Tab[] = [
    {
      id: 'journey',
      label: '대시보드',
      to: '/b2b-center/app/intelligence/ops-dashboard',
      match: (p) => p.startsWith('/b2b-center/app/intelligence/ops-dashboard') || p === '/b2b-center/app',
      icon: LayoutDashboard,
    },
    {
      id: 'track',
      label: '일정',
      to: '/b2b-center/app/schedule',
      match: (p) => p.startsWith('/b2b-center/app/schedule'),
      icon: CalendarDays,
    },
    {
      id: 'quiz',
      label: '이용자',
      to: '/b2b-center/app/clients',
      match: (p) => p.startsWith('/b2b-center/app/clients'),
      icon: Users,
    },
    {
      id: 'expert',
      label: '치료노트',
      to: '/b2b-center/app/intelligence/therapy-notes',
      match: (p) => p.startsWith('/b2b-center/app/intelligence/therapy-notes'),
      icon: NotebookPen,
    },
    {
      id: 'profile',
      label: '부모리포트',
      to: '/b2b-center/app/intelligence/parent-reports',
      match: (p) => p.startsWith('/b2b-center/app/intelligence/parent-reports'),
      icon: FileText,
    },
  ];

  const handleClick = (tab: Tab) => {
    void trackBottomTabClick({ tab: tab.id, destination: tab.to, from_path: path });
    navigate(tab.to);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#C8B88A]/25 md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}
    >
      <div className="grid grid-cols-5 h-16 items-center">
        {tabs.map((tab) => {
          const isActive = tab.match(path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab)}
              className="relative flex flex-col items-center justify-center gap-1 h-full active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-[#C8B88A]/15' : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-[22px] h-[22px] ${
                    isActive ? 'text-[#8a7a4d] stroke-[2.4]' : 'text-muted-foreground stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] leading-none break-keep tracking-tight ${
                  isActive ? 'text-[#8a7a4d] font-bold' : 'text-muted-foreground font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { MobileBottomTab };
export default MobileBottomTab;
