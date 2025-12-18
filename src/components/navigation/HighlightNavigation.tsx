import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, FileText, BarChart3, Download, Home, ChevronDown, ClipboardCheck, User, Settings, GraduationCap, Building2, Baby, CreditCard, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { RealtimeChatWidget } from '@/components/chat/RealtimeChatWidget';
import { AnimatePresence } from 'framer-motion';

export const HighlightNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const serviceItems = [
    { 
      icon: Brain, 
      label: 'AI 분석', 
      path: '/highlight-ai',
      description: '즉시 AI 심리 분석 받기'
    },
    { 
      icon: FileText, 
      label: '관찰일지', 
      path: '/observation',
      description: '아이 행동 기록 및 관리'
    },
    { 
      icon: BarChart3, 
      label: '대시보드', 
      path: '/dashboard',
      description: '종합 통계 및 분석 결과'
    },
    { 
      icon: Download, 
      label: '리포트', 
      path: '/highlight-ai?tab=reports',
      description: '상세 분석 리포트 다운로드'
    },
    { 
      icon: ClipboardCheck, 
      label: '고민/검사 저장소', 
      path: '/concern-storage',
      description: '고민 분석 및 검사 결과 저장'
    },
    { 
      icon: GraduationCap, 
      label: '교육기관용', 
      path: '/academy',
      description: '유치원/어린이집을 위한 솔루션'
    },
    { 
      icon: Building2, 
      label: '발달센터용', 
      path: '/development-center',
      description: '전문 발달센터를 위한 시스템'
    },
    { 
      icon: Baby, 
      label: '어린이집용', 
      path: '/daycare',
      description: '어린이집 맞춤 관리 시스템'
    },
  ];

  const accountItems = [
    { 
      icon: User, 
      label: '프로필', 
      path: '/profile',
      description: '내 정보 관리'
    },
    { 
      icon: CreditCard, 
      label: '가격 안내', 
      path: '/pricing',
      description: '플랜별 가격 및 기능 비교'
    },
    { 
      icon: Settings, 
      label: '설정', 
      path: '/settings',
      description: '앱 설정 및 환경설정'
    },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="AI Highlight" className="h-10 w-10" />
            </button>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                    서비스
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[500px] p-6 bg-background">
                      <h3 className="text-lg font-bold mb-4">어떤 서비스를 찾고 계신가요?</h3>
                      <div className="grid gap-3">
                        {serviceItems.map((item) => (
                          <NavigationMenuLink
                            key={item.path}
                            asChild
                          >
                            <button
                              onClick={() => navigate(item.path)}
                              className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left w-full group"
                            >
                              <div className="mt-0.5 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <item.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              </div>
                            </button>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                    계정
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[350px] p-6 bg-background">
                      <h3 className="text-lg font-bold mb-4">계정 관리</h3>
                      <div className="grid gap-3">
                        {accountItems.map((item) => (
                          <NavigationMenuLink
                            key={item.path}
                            asChild
                          >
                            <button
                              onClick={() => navigate(item.path)}
                              className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left w-full group"
                            >
                              <div className="mt-0.5 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <item.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">{item.label}</div>
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              </div>
                            </button>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsChatOpen(true)}
              variant="ghost"
              size="sm"
              className="relative"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              상담
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              홈
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isChatOpen && (
          <RealtimeChatWidget onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </nav>
  );
};