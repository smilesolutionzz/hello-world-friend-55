import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // 모바일에서는 기존 Navigation 컴포넌트 사용
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // 데스크톱에서는 사이드바 사용
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          {/* 헤더 */}
          <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur-sm px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AIHPRO
              </h1>
              {/* 우측 사용자 영역은 기존 Navigation에서 가져오기 */}
              <Navigation />
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}