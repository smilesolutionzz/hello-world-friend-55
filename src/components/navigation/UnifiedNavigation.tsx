import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Brain, 
  Menu, 
  Home, 
  FileText, 
  BarChart3, 
  Settings, 
  CreditCard,
  Users,
  MessageCircle,
  TrendingUp,
  User,
  UserCheck,
  History,
  HelpCircle,
  Mail,
  X,
  Calendar,
  Target,
  Heart,
  Zap,
  ChevronDown,
  Crown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTokens } from '@/hooks/useTokens';
import { supabase } from '@/integrations/supabase/client';
import TokenBalance from '@/components/TokenBalance';
import AIPlatformChat from '@/components/AIPlatformChat';
import secretTalkCharacter from '@/assets/secret-talk-character.png';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  requiresAuth?: boolean;
}

// 전문가 서비스 하위 메뉴
const expertSubmenuItems = [
  { icon: UserCheck, label: '전문가고용', path: '/expert-hiring', requiresAuth: false },
  { icon: CreditCard, label: '구독', path: '/token-subscription', requiresAuth: false },
];

// 상단 네비게이션용 핵심 메뉴 (드롭다운으로 변경됨)
const mainNavigationItems: NavigationItem[] = [];

// 나의DATA 하위 메뉴
const dataSubmenuItems = [
  { icon: BarChart3, label: '개인DATA', path: '/dashboard', requiresAuth: false },
  { icon: Users, label: '기관DATA', path: '/institution-admin', requiresAuth: false },
];

// AIH 에이전트 하위 메뉴
const aihSubmenuItems = [
  { icon: MessageCircle, label: 'AI 상담', path: '/ai-assistant', requiresAuth: false },
  { icon: FileText, label: '관찰일지', path: '/observation', requiresAuth: false },
  { icon: Heart, label: '웰니스 허브', path: '/wellness-lifestyle', requiresAuth: false },
];

// 3분테스트 하위 메뉴
const assessmentSubmenuItems = [
  { icon: TrendingUp, label: '3분테스트', path: '/assessment', requiresAuth: false },
  { icon: Crown, label: '프리미엄테스트', path: '/premium-assessment', requiresAuth: false },
  { icon: Brain, label: '체질분석', path: '/han-medicine-test', requiresAuth: false },
];

// 사이드바/모바일 메뉴용 추가 기능들 (구독은 전문가 서비스로 이동)
const secondaryNavigationItems: NavigationItem[] = [];

export const UnifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthGuard();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleNavigation = (path: string, item?: NavigationItem) => {
    if (item?.requiresAuth && !user) {
      navigate('/auth');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleContact = () => {
    window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');
    setIsOpen(false);
  };

  const handleFAQ = () => {
    setIsChatOpen(true);
    setIsOpen(false);
  };

  const handleAuth = async () => {
    if (user) {
      try {
        console.log('로그아웃 시작...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('로그아웃 에러:', error);
          throw error;
        }
        console.log('로그아웃 성공');
        navigate('/');
      } catch (error) {
        console.error('로그아웃 처리 중 에러:', error);
      }
    } else {
      navigate('/auth');
    }
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const canAccess = (item: NavigationItem) => {
    if (!item.requiresAuth) return true;
    return !!user;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/96 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Token Balance */}
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate('/')}
              >
                <div className="relative flex items-center gap-2">
                  <img 
                    src="/src/assets/aih-logo.png" 
                    alt="AIH Logo" 
                    className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">AIHPRO</span>
              </div>
              
              {/* Token Balance - Always visible */}
              <TokenBalance compact showPurchaseButton={false} />
            </div>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1">
              {/* 홈 버튼 */}
              <Button
                variant={isActive('/') ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation('/')}
                className="flex items-center gap-2 h-9 px-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                홈
              </Button>

              {/* 3분테스트 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isActive('/assessment') || isActive('/premium-assessment') || isActive('/han-medicine-test') ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2 h-9 px-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    3분테스트
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white shadow-lg border border-gray-200/80 rounded-lg">
                  {assessmentSubmenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path, item)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md mx-1 my-0.5"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* AIH 에이전트 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isActive('/ai-assistant') || isActive('/observation') ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2 h-9 px-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    AIH 에이전트
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white shadow-lg border border-gray-200/80 rounded-lg">
                  {aihSubmenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path, item)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md mx-1 my-0.5"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 나의DATA 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isActive('/dashboard') || isActive('/institution-admin') ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2 h-9 px-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    나의DATA
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white shadow-lg border border-gray-200/80 rounded-lg z-50">
                  {dataSubmenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path, item)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md mx-1 my-0.5"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 전문가 서비스 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isActive('/expert-hiring') || isActive('/token-subscription') ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2 h-9 px-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    전문가고용
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white shadow-lg border border-gray-200/80 rounded-lg z-50">
                  {expertSubmenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path, item)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md mx-1 my-0.5"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Auth Button */}
              <Button
                variant={user ? "ghost" : "default"}
                size="sm"
                onClick={handleAuth}
                className={`ml-3 flex items-center gap-2 h-9 px-4 rounded-md font-medium transition-all ${
                  !user 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                {user ? '로그아웃' : '로그인'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Token Balance */}
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="relative flex items-center gap-1.5">
                  <img 
                    src="/src/assets/aih-logo.png" 
                    alt="AIH Logo" 
                    className="w-6 h-6 object-contain"
                  />
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className="text-base font-bold text-foreground">AIHPRO</span>
              </div>
              
              {/* Token Balance - Always visible on mobile */}
              <TokenBalance compact showPurchaseButton={false} />
            </div>

            {/* Mobile Menu Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col h-full">
                  {/* Header */}
                    <div className="border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src="/src/assets/aih-logo.png" 
                        alt="AIH Logo" 
                        className="w-6 h-6 object-contain"
                      />
                      <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-lg font-bold text-foreground">AIHPRO</span>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 space-y-2">
                    {/* 전체 기능 목록 */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-2 px-2">전체 기능</p>
                      
                      {/* 홈 */}
                      <Button
                        variant={isActive('/') ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => handleNavigation('/')}
                      >
                        <Home className="w-4 h-4" />
                        홈
                      </Button>
                      
                      {/* 테스트 그룹 */}
                      <div className="pl-2 space-y-1">
                        <p className="text-xs text-muted-foreground mb-1 px-2 font-medium">테스트</p>
                        {assessmentSubmenuItems.map((item) => (
                          <Button
                            key={item.path}
                            variant={isActive(item.path) ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 ${
                              item.path === '/premium-assessment' 
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 text-yellow-800 font-medium' 
                                : ''
                            }`}
                            onClick={() => handleNavigation(item.path, item)}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                      
                      {/* AIH 에이전트 그룹 */}
                      <div className="pl-2 space-y-1">
                        <p className="text-xs text-muted-foreground mb-1 px-2 font-medium">AIH 에이전트</p>
                        {aihSubmenuItems.map((item) => (
                          <Button
                            key={item.path}
                            variant={isActive(item.path) ? "default" : "ghost"}
                            className="w-full justify-start gap-3"
                            onClick={() => handleNavigation(item.path, item)}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                      
                      {/* 데이터 그룹 */}
                      <div className="pl-2 space-y-1">
                        <p className="text-xs text-muted-foreground mb-1 px-2 font-medium">데이터</p>
                        {dataSubmenuItems.map((item) => (
                          <Button
                            key={item.path}
                            variant={isActive(item.path) ? "default" : "ghost"}
                            className="w-full justify-start gap-3"
                            onClick={() => handleNavigation(item.path, item)}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                      
                      {/* 전문가 서비스 그룹 */}
                      <div className="pl-2 space-y-1">
                        <p className="text-xs text-muted-foreground mb-1 px-2 font-medium">전문가 서비스</p>
                        {expertSubmenuItems.map((item) => (
                          <Button
                            key={item.path}
                            variant={isActive(item.path) ? "default" : "ghost"}
                            className="w-full justify-start gap-3"
                            onClick={() => handleNavigation(item.path, item)}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                      
                    </div>
                    
                    {/* Auth Section */}
                    <div className="pt-4 mt-4 border-t border-border/50">
                      {user ? (
                        <div className="space-y-2">
                          <div className="px-2 py-1 text-xs text-muted-foreground">
                            로그인 계정: {user.email}
                          </div>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleAuth}
                          >
                            <User className="w-4 h-4" />
                            로그아웃
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            variant="default"
                            className="w-full justify-start gap-3"
                            onClick={handleAuth}
                          >
                            <User className="w-4 h-4" />
                            로그인
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-3"
                            onClick={() => {
                              navigate('/auth?mode=signup');
                              setIsOpen(false);
                            }}
                          >
                            <UserCheck className="w-4 h-4" />
                            회원가입
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* 고객 지원 섹션 */}
                    <div className="pt-4 mt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 px-2">고객 지원</p>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                          onClick={handleFAQ}
                        >
                          <HelpCircle className="w-4 h-4" />
                          질문있나요?
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                          onClick={handleContact}
                        >
                          <Mail className="w-4 h-4" />
                          문의하기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      
      {/* AI 채팅 모달 */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative">
            <Button
              onClick={() => setIsChatOpen(false)}
              variant="outline"
              size="icon"
              className="absolute -top-2 -right-2 z-10 bg-white shadow-md rounded-full w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
            <AIPlatformChat onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};