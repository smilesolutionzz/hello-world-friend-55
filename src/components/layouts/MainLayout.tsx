import React from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};