import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Brain, 
  Menu, 
  Home, 
  Users,
  User,
  X,
  ChevronDown,
  Crown,
  Mic,
  Bot,
  MessageCircle,
  FileText,
  TrendingUp,
  Heart,
  Zap,
  UserCheck,
  Wallet,
  LogOut,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTokens } from '@/hooks/useTokens';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { formatCash, tokenToCash } from '@/utils/tokenToCash';

const navItems = [
  {
    label: '검사도구',
    icon: TrendingUp,
    children: [
      { label: '간편테스트', path: '/assessment', desc: '빠르고 간편한 심리 체크' },
      { label: '심층테스트', path: '/premium-assessment', desc: '전문가 수준 종합 분석' },
      { label: '무료 리포팅', path: '/report-generator', desc: '무료 분석 리포트 생성', icon: FileText, badge: 'FREE' },
    ]
  },
  {
    label: 'AI 상담',
    icon: Bot,
    children: [
      { label: 'AI 상담', path: '/ai-assistant', desc: '24시간 AI 심리 상담', icon: MessageCircle },
      { label: 'AI 아지트', path: '/metaverse-voice', desc: '음성으로 AI와 대화', badge: 'NEW', icon: Mic, mobileNote: '(PC 권장)' },
    ]
  },
  {
    label: '관찰일지',
    icon: FileText,
    children: [
      { label: 'AI 관찰일지', path: '/observation', desc: '개인 관찰일지 AI 분석', icon: FileText },
      { label: '마음일기', path: '/mind-diary', desc: '청소년 감정 기록', icon: Heart },
    ]
  },
  {
    label: '전문가',
    icon: UserCheck,
    children: [
      { label: '전문가 상담', path: '/expert-hiring', desc: '1:1 전문 상담사 매칭' },
      { label: '이용권 구매', path: '/token-subscription', desc: '캐시/패스 구매' },
    ]
  },
  {
    label: '학원/센터용',
    path: '/b2b-academy',
    icon: Users,
  },
  {
    label: '칼럼',
    path: '/column',
    icon: Heart,
  },
];

export const UnifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthGuard();
  const { tokenBalance } = useTokens();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setOpenDropdown(null);
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

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <img src={logo} alt="AIHPRO" className="h-9 w-9 rounded-xl" />
                <div className="absolute inset-0 bg-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                AIHPRO
              </span>
            </div>

            {/* Center Navigation */}
            <div className="flex items-center gap-1">
              {/* 홈 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/')}
                className={`h-10 px-4 rounded-full font-medium transition-all ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                }`}
              >
                홈
              </Button>

              {/* Nav Items with Dropdowns */}
              {navItems.map((item) => (
                item.children ? (
                  <DropdownMenu 
                    key={item.label} 
                    open={openDropdown === item.label}
                    onOpenChange={(open) => setOpenDropdown(open ? item.label : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-10 px-4 rounded-full font-medium transition-all gap-1 ${
                          item.children?.some(child => isActive(child.path))
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="center" 
                      sideOffset={8}
                      className="w-72 p-2 rounded-2xl border border-border shadow-xl bg-background backdrop-blur-xl"
                    >
                      {item.children.map((child) => (
                        <button
                          key={child.path}
                          onClick={() => handleNavigation(child.path)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                            isActive(child.path) 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            isActive(child.path)
                              ? 'bg-primary/20'
                              : 'bg-muted group-hover:bg-accent'
                          }`}>
                            {child.icon ? <child.icon className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm flex items-center gap-2 text-foreground">
                              {child.label}
                              {child.badge && (
                                <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px] px-1.5 py-0">
                                  {child.badge}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-foreground/60 truncate">{child.desc}</div>
                          </div>
                        </button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation(item.path!)}
                    className={`h-10 px-4 rounded-full font-medium transition-all ${
                      isActive(item.path!)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
                  </Button>
                )
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* 캐시 잔액 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation('/token-subscription')}
                className="h-9 rounded-full border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 gap-2"
              >
                <Wallet className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {formatCash(tokenToCash(tokenBalance?.current_tokens || 0))}
                </span>
              </Button>

              {/* 유저 메뉴 */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-full p-0 bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    sideOffset={8}
                    className="w-56 p-2 rounded-2xl border border-border shadow-xl bg-background backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs text-foreground/60">로그인됨</p>
                      <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleNavigation('/concern-storage')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left"
                    >
                      <Heart className="w-4 h-4 text-foreground/70" />
                      <span className="text-sm font-medium text-foreground">내 기록</span>
                    </button>
                    <button
                      onClick={handleAuth}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">로그아웃</span>
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAuth}
                  className="h-9 rounded-full px-5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                >
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="AIHPRO" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold">AIHPRO</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* 캐시 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/token-subscription')}
              className="h-8 rounded-full px-3 gap-1.5"
            >
              <Wallet className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                {formatCash(tokenToCash(tokenBalance?.current_tokens || 0))}
              </span>
            </Button>

            {/* Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0" hideCloseButton>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-bold text-lg">메뉴</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* User Info */}
                  {user && (
                    <div className="p-4 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
                          <p className="text-xs text-foreground/60">로그인됨</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* 홈 */}
                    <button
                      onClick={() => handleNavigation('/')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive('/') && location.pathname === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                      }`}
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">홈</span>
                    </button>

                    {/* Nav Items */}
                    {navItems.map((item) => (
                      <div key={item.label}>
                        {item.children ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-3 p-3 text-foreground/70">
                              <item.icon className="w-5 h-5" />
                              <span className="font-semibold text-sm">{item.label}</span>
                            </div>
                            <div className="pl-4 space-y-1">
                              {item.children.map((child) => (
                                <button
                                  key={child.path}
                                  onClick={() => handleNavigation(child.path)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                    isActive(child.path) ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                                  }`}
                                >
                                  {child.icon ? <child.icon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                  <span className="text-sm">{child.label}</span>
                                  {child.mobileNote && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400">{child.mobileNote}</span>
                                  )}
                                  {child.badge && (
                                    <Badge className="bg-green-500/10 text-green-600 border-0 text-[10px] ml-auto">
                                      {child.badge}
                                    </Badge>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleNavigation(item.path!)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              isActive(item.path!) ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        )}
                      </div>
                    ))}

                    {/* 내 기록 */}
                    {user && (
                      <button
                        onClick={() => handleNavigation('/concern-storage')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isActive('/concern-storage') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                        }`}
                      >
                        <Heart className="w-5 h-5" />
                        <span className="font-medium">내 기록</span>
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <Button
                      onClick={handleAuth}
                      variant={user ? "outline" : "default"}
                      className="w-full rounded-xl h-11"
                    >
                      {user ? (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          로그아웃
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          로그인
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
};
