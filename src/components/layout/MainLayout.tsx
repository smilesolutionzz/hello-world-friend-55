import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const MainLayout = () => {
  const location = useLocation();
  
  // 네비게이션을 숨길 페이지들 정의
  const hideNavigationPaths = [
    '/auth',
    '/highlight-auth',
    '/highlight-dashboard',
    '/highlight-ai',
    '/typebot-embed',
  ];
  
  const shouldHideNavigation = hideNavigationPaths.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-background">
      {!shouldHideNavigation && <Navigation />}
      <main className={shouldHideNavigation ? '' : 'pt-16'}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;