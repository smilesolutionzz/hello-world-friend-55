import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
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
  LogOut,
  LogIn,
  Sparkles,
  Target,
  BookOpen,
  Lock,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { useMindTrackDashboard } from '@/hooks/useMindTrackDashboard';
import { supabase } from '@/integrations/supabase/client';
import { AihproLogoMark } from '@/components/brand/AihproLogoMark';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';

import { useContext } from 'react';
import { HubContext } from '@/components/assessment/HubContext';
import { AudienceModeToggle } from '@/components/navigation/AudienceModeToggle';

const UnifiedNavigationInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, localePath } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuthGuard();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();
  const { state: mindTrackState } = useMindTrackDashboard();
  // 결제 완료(needs_baseline) 또는 진행 중(active) 사용자에게만 노출
  const showMindTrackMenu =
    mindTrackState.kind === 'active' || mindTrackState.kind === 'needs_baseline';
  const mindTrackDay =
    mindTrackState.kind === 'active' ? mindTrackState.currentDay : null;
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleLanguagePath = language === 'ko' ? '/en' : '/';

  const navItems = [
    {
      label: '검사 · 리포트',
      icon: TrendingUp,
      children: [
        { label: t.nav.simpleTest, path: '/assessment', desc: t.nav.simpleTestDesc, icon: Sparkles },
        { label: t.nav.deepTest, path: '/premium-assessment', desc: t.nav.deepTestDesc, icon: Brain },
        { label: t.nav.personalReport, path: '/report-generator', desc: t.nav.personalReportDesc, icon: FileText, badge: 'PREMIUM' },
        { label: t.nav.aiObservation, path: '/observation', desc: t.nav.aiObservationDesc, icon: FileText },
      ]
    },
    {
      label: '상담',
      icon: MessageCircle,
      children: [
        { label: t.nav.aiCounseling, path: '/ai-assistant', desc: t.nav.aiCounselingDesc, icon: Bot },
        { label: t.nav.aiAgit, path: '/metaverse-voice', desc: t.nav.aiAgitDesc, badge: 'NEW', icon: Mic, mobileNote: t.nav.aiAgitMobile },
        { label: t.nav.expertConsult, path: '/expert-hiring', desc: t.nav.expertConsultDesc, icon: UserCheck },
      ]
    },
    // "기업" 메뉴는 헤더 우측의 AudienceModeToggle(개인용/기업용)로 승격
    // 마음일기·칼럼·30일 워크북은 푸터 및 각 페이지 내부 진입점으로 이동 (네비 경량화)
  ];

  const handleNavigation = (path: string) => {
    navigate(localePath(path));
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
      navigate(localePath('/'));
    } else {
      navigate(localePath('/auth'));
    }
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(/^\/en/, '') || '/';
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
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
              onClick={() => navigate(localePath('/'))}
            >
              <div className="relative">
                <AihproLogoMark className="h-9 w-9 rounded-xl flex-shrink-0" />
                <div className="absolute inset-0 bg-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                AIHPRO
              </span>
            </div>

            {/* Center Navigation */}
            <div className="flex items-center gap-1">
              {/* Home */}
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
                {t.nav.home}
              </Button>

              {/* 핵심 상품: 7일 마음 트랙 — 단독 강조 CTA */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/mind-track')}
                className={`h-10 px-4 rounded-full font-semibold transition-all gap-1.5 border ${
                  isActive('/mind-track')
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    : 'bg-white text-foreground border-[#C8B88A]/60 hover:border-[#C8B88A] hover:bg-[#C8B88A]/10 ring-1 ring-[#C8B88A]/20'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>7일 마음 트랙</span>
                {showMindTrackMenu ? (
                  <Badge className="ml-0.5 bg-emerald-500/15 text-emerald-700 border-0 text-[10px] px-1.5 py-0 h-4">
                    {mindTrackDay ? `Day ${mindTrackDay}/7` : '시작하기'}
                  </Badge>
                ) : (
                  <Badge className="ml-0.5 bg-[#C8B88A]/20 text-[#8a7a4d] border-0 text-[10px] px-1.5 py-0 h-4">
                    ₩{MIND_TRACK_7_PRICE.toLocaleString()}
                  </Badge>
                )}
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
                        {(item as any).badge && (
                          <Badge className="ml-1 bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0 h-4">
                            {(item as any).badge}
                          </Badge>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="center" 
                      sideOffset={8}
                      className="w-72 p-2 rounded-2xl border border-border shadow-xl bg-background backdrop-blur-xl"
                    >
                      {item.children.map((child) => {
                        const locked = (child as any).locked;
                        return (
                          <button
                            key={child.path}
                            onClick={() => handleNavigation(locked ? '/token-subscription' : child.path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                              isActive(child.path) 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-accent'
                            } ${locked ? 'opacity-70' : ''}`}
                            aria-disabled={locked}
                            title={locked ? '구독 시 이용 가능합니다' : undefined}
                          >
                            <div className={`relative p-2 rounded-lg transition-colors ${
                              isActive(child.path)
                                ? 'bg-primary/20'
                                : 'bg-muted group-hover:bg-accent'
                            }`}>
                              {child.icon ? <child.icon className={`w-4 h-4 ${locked ? 'blur-[1.5px]' : ''}`} /> : <item.icon className="w-4 h-4" />}
                              {locked && (
                                <span className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5">
                                  <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-sm flex items-center gap-2 text-foreground ${locked ? 'blur-[0.5px]' : ''}`}>
                                {child.label}
                                {child.badge && (
                                  <Badge className={`border-0 text-[10px] px-1.5 py-0 ${locked ? 'bg-amber-100 text-amber-800' : 'bg-green-500/10 text-green-600'}`}>
                                    {child.badge}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-foreground/60 truncate">{child.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigation((item as any).path)}
                    className={`h-10 px-4 rounded-full font-medium transition-all ${
                      isActive((item as any).path)
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
              {/* B2C ↔ B2B 모드 토글 */}
              <AudienceModeToggle className="mr-1" />
              {/* Subscription Status — 아이콘만 (프리미엄은 라벨 유지) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigation('/token-subscription')}
                aria-label={isPremium ? subscriptionLabel : t.nav.subscribe}
                title={isPremium ? subscriptionLabel : t.nav.subscribe}
                className={`h-9 w-9 rounded-full ${
                  isPremium
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 hover:from-yellow-100 hover:to-orange-100'
                    : 'hover:bg-accent'
                }`}
              >
                <Crown className={`w-4 h-4 ${isPremium ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              </Button>

              {/* User Menu */}
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
                      <p className="text-xs text-foreground/60">{t.nav.loggedIn}</p>
                      <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleNavigation('/concern-storage')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left"
                    >
                      <Heart className="w-4 h-4 text-foreground/70" />
                      <span className="text-sm font-medium text-foreground">{t.nav.myRecords}</span>
                    </button>
                    <button
                      onClick={() => navigate(toggleLanguagePath)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-foreground/70 w-4 text-center">
                        {language === 'ko' ? 'EN' : 'KO'}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {language === 'ko' ? 'English' : '한국어'}
                      </span>
                    </button>
                    <button
                      onClick={handleAuth}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{t.nav.logout}</span>
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(toggleLanguagePath)}
                    className="h-9 rounded-full px-3 text-xs font-bold text-foreground/70 hover:text-foreground"
                  >
                    {language === 'ko' ? 'EN' : '한국어'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAuth}
                    className="h-9 rounded-full px-5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  >
                    {t.nav.login}
                  </Button>
                </>
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
            onClick={() => navigate(localePath('/'))}
          >
            <img src={logo} alt="AIHPRO" className="h-8 w-8 rounded-lg object-contain flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="text-lg font-bold">AIHPRO</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5">
            {/* B2C ↔ B2B 모드 토글 (모바일 헤더) */}
            <AudienceModeToggle size="sm" />
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(toggleLanguagePath)}
              className="h-8 rounded-full px-2.5 text-xs font-bold text-foreground/70"
            >
              {language === 'ko' ? 'EN' : '한국어'}
            </Button>
            {/* Subscription Status — 아이콘만 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNavigation('/token-subscription')}
              aria-label={isPremium ? subscriptionLabel : t.nav.subscribe}
              className="h-8 w-8 rounded-full"
            >
              <Crown className={`w-4 h-4 ${isPremium ? 'text-yellow-500' : 'text-muted-foreground'}`} />
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
                    <span className="font-bold text-lg">{t.nav.menu}</span>
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
                          <p className="text-xs text-foreground/60">{t.nav.loggedIn}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* Home */}
                    <button
                      onClick={() => handleNavigation('/')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive('/') && location.pathname === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                      }`}
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">{t.nav.home}</span>
                    </button>

                    {/* 핵심 상품: 7일 마음 트랙 — 단독 강조 CTA (모바일) */}
                    <button
                      onClick={() => handleNavigation('/mind-track')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                        isActive('/mind-track')
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-white text-foreground border-[#C8B88A]/60 hover:bg-[#C8B88A]/10 ring-1 ring-[#C8B88A]/20'
                      }`}
                    >
                      <Target className="w-5 h-5" />
                      <span className="font-semibold text-sm">7일 마음 트랙</span>
                      {showMindTrackMenu ? (
                        <Badge className="ml-auto bg-emerald-500/15 text-emerald-700 border-0 text-[10px]">
                          {mindTrackDay ? `Day ${mindTrackDay}/7` : '시작하기'}
                        </Badge>
                      ) : (
                        <Badge className="ml-auto bg-[#C8B88A]/20 text-[#8a7a4d] border-0 text-[10px]">
                          ₩{MIND_TRACK_7_PRICE.toLocaleString()}
                        </Badge>
                      )}
                    </button>

                    {/* Nav Items */}
                    {navItems.map((item) => (
                      <div key={item.label}>
                        {item.children ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-3 p-3 text-foreground/70">
                              <item.icon className="w-5 h-5" />
                              <span className="font-semibold text-sm">{item.label}</span>
                              {(item as any).badge && (
                                <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                                  {(item as any).badge}
                                </Badge>
                              )}
                            </div>
                            <div className="pl-4 space-y-1">
                              {item.children.map((child) => {
                                const locked = (child as any).locked;
                                return (
                                  <button
                                    key={child.path}
                                    onClick={() => handleNavigation(locked ? '/token-subscription' : child.path)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                      isActive(child.path) ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                                    } ${locked ? 'opacity-70' : ''}`}
                                    aria-disabled={locked}
                                  >
                                    {child.icon ? <child.icon className={`w-4 h-4 ${locked ? 'blur-[1.5px]' : ''}`} /> : <Sparkles className="w-4 h-4" />}
                                    <span className={`text-sm ${locked ? 'blur-[0.5px]' : ''}`}>{child.label}</span>
                                    {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                                    {child.mobileNote && (
                                      <span className="text-[10px] text-amber-600 dark:text-amber-400">{child.mobileNote}</span>
                                    )}
                                    {child.badge && (
                                      <Badge className={`border-0 text-[10px] ml-auto ${locked ? 'bg-amber-100 text-amber-800' : 'bg-green-500/10 text-green-600'}`}>
                                        {child.badge}
                                      </Badge>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleNavigation((item as any).path)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              isActive((item as any).path) ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        )}
                      </div>
                    ))}

                    {/* My Records */}
                    {user && (
                      <button
                        onClick={() => handleNavigation('/concern-storage')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isActive('/concern-storage') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                        }`}
                      >
                        <Heart className="w-5 h-5" />
                        <span className="font-medium">{t.nav.myRecords}</span>
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
                          {t.nav.logout}
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          {t.nav.login}
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

// Wrapper that suppresses the nav when rendered inside the Assessment Hub (prevents duplicate nav)
export const UnifiedNavigation = () => {
  const { insideHub } = useContext(HubContext);
  if (insideHub) return null;
  return <UnifiedNavigationInner />;
};
