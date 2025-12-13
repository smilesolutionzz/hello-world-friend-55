import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  Home, 
  User,
  UserCheck,
  History,
  TrendingUp,
  Crown,
  Brain,
  MessageCircle,
  Mic,
  FileText,
  Heart,
  Zap,
  ChevronDown,
  Bot,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import TokenBalance from '@/components/TokenBalance';
import { BookingNotificationBell } from '@/components/booking/BookingNotificationBell';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  requiresAuth?: boolean;
  description?: string;
}

// 메뉴 그룹 정의
const menuGroups = {
  assessment: {
    label: '검사도구',
    icon: TrendingUp,
    items: [
      { icon: TrendingUp, label: '3분 테스트', path: '/assessment', description: '빠르고 간편한 심리 상태 체크' },
      { icon: Crown, label: '프리미엄 테스트', path: '/premium-assessment', description: '전문가 수준의 종합 심리 분석' },
      { icon: Brain, label: '체질 분석', path: '/han-medicine-test', description: '한의학 기반 체질 및 건강 진단' },
    ]
  },
  ai: {
    label: 'AI 상담',
    icon: Bot,
    items: [
      { icon: MessageCircle, label: 'AI 상담', path: '/ai-assistant', description: '24시간 AI 심리 상담 및 코칭' },
      { icon: Mic, label: 'AI 메타버스', path: '/metaverse-voice', badge: 'NEW', description: '가상공간에서 음성으로 AI와 대화' },
      { icon: FileText, label: 'AI 관찰일지', path: '/observation', description: '아이 행동 기록 및 패턴 분석' },
    ]
  },
  records: {
    label: '내 기록',
    icon: History,
    items: [
      { icon: Heart, label: '고민/검사 저장소', path: '/concern-storage', requiresAuth: true, description: '고민 기록 및 심리검사 결과 관리' },
    ]
  },
  expert: {
    label: '전문가',
    icon: UserCheck,
    items: [
      { icon: UserCheck, label: '전문가 고용', path: '/expert-hiring', description: '전문 상담사 1:1 매칭 및 예약' },
      { icon: Zap, label: '토큰 충전', path: '/token-subscription', description: 'AI 서비스 이용권 구매' },
    ]
  }
};

export const ModernNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthGuard();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string, item?: NavItem) => {
    if (item?.requiresAuth && !user) {
      navigate('/auth');
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
      navigate('/');
    } else {
      navigate('/auth');
    }
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isGroupActive = (items: NavItem[]) => {
    return items.some(item => isActive(item.path));
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav 
        className={cn(
          "hidden lg:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" 
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <img src={logo} alt="AIHPRO" className="h-9 w-9" />
                <span className={cn(
                  "text-xl font-bold transition-colors",
                  isScrolled ? "text-foreground" : "text-white"
                )}>
                  AIHPRO
                </span>
              </div>
            </motion.div>

            {/* Center Navigation */}
            <div className="flex items-center gap-1">
              {/* 홈 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/')}
                className={cn(
                  "h-9 px-4 rounded-full font-medium transition-all",
                  isActive('/') 
                    ? "bg-primary/10 text-primary" 
                    : isScrolled 
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Home className="w-4 h-4 mr-2" />
                홈
              </Button>

              {/* 메뉴 그룹들 */}
              {Object.entries(menuGroups).map(([key, group]) => (
                <DropdownMenu key={key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 px-4 rounded-full font-medium transition-all group",
                        isGroupActive(group.items) 
                          ? "bg-primary/10 text-primary" 
                          : isScrolled 
                            ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                            : "text-white/80 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <group.icon className="w-4 h-4 mr-2" />
                      {group.label}
                      <ChevronDown className="w-3 h-3 ml-1 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="center" 
                    className="w-80 bg-background/95 backdrop-blur-xl shadow-xl border border-border/50 rounded-2xl p-4"
                    sideOffset={8}
                  >
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <motion.button
                          key={item.path}
                          onClick={() => handleNavigation(item.path, item)}
                          className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all text-left group"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="mt-0.5 p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-0.5 flex items-center gap-2">
                              {item.label}
                              {item.badge && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-[10px] px-1.5 py-0">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}

              {/* 이수석칼럼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/column')}
                className={cn(
                  "h-9 px-4 rounded-full font-medium transition-all",
                  isActive('/column') 
                    ? "bg-primary/10 text-primary" 
                    : isScrolled 
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Heart className="w-4 h-4 mr-2" />
                이수석칼럼
              </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <TokenBalance compact showPurchaseButton={false} />
              
              {user && <BookingNotificationBell />}

              <Button
                variant={user ? "ghost" : "default"}
                size="sm"
                onClick={handleAuth}
                className={cn(
                  "h-9 px-4 rounded-full font-medium transition-all",
                  !user && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                )}
              >
                <User className="w-4 h-4 mr-2" />
                {user ? '로그아웃' : '로그인'}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav 
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50" 
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="AIHPRO" className="h-8 w-8" />
            <span className={cn(
              "text-lg font-bold",
              isScrolled ? "text-foreground" : "text-white"
            )}>
              AIHPRO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <TokenBalance compact showPurchaseButton={false} />
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isScrolled ? "text-foreground" : "text-white"
                  )}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <img src={logo} alt="AIHPRO" className="h-8 w-8" />
                      <span className="text-lg font-bold">AIHPRO</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsOpen(false)}
                      className="rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Menu */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* 홈 */}
                    <button
                      onClick={() => handleNavigation('/')}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                        isActive('/') ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">홈</span>
                    </button>

                    {/* 메뉴 그룹들 */}
                    {Object.entries(menuGroups).map(([key, group]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2 px-3 text-sm font-semibold text-muted-foreground">
                          <group.icon className="w-4 h-4" />
                          {group.label}
                        </div>
                        <div className="space-y-1">
                          {group.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleNavigation(item.path, item)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                isActive(item.path) ? "bg-primary/10 text-primary" : "hover:bg-accent"
                              )}
                            >
                              <div className="p-2 rounded-lg bg-muted">
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium flex items-center gap-2">
                                  {item.label}
                                  {item.badge && (
                                    <Badge className="bg-green-500 text-white text-[10px]">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* 이수석칼럼 */}
                    <button
                      onClick={() => handleNavigation('/column')}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                        isActive('/column') ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">이수석칼럼</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t space-y-3">
                    <Button
                      variant={user ? "outline" : "default"}
                      className="w-full rounded-xl"
                      onClick={handleAuth}
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user ? '로그아웃' : '로그인'}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default ModernNavigation;
