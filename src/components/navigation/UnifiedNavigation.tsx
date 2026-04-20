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
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

export const UnifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, localePath } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuthGuard();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleLanguagePath = language === 'ko' ? '/en' : '/';

  const navItems = [
    {
      label: t.nav.assessmentTools,
      icon: TrendingUp,
      children: [
        { label: t.nav.simpleTest, path: '/assessment', desc: t.nav.simpleTestDesc },
        { label: t.nav.deepTest, path: '/premium-assessment', desc: t.nav.deepTestDesc },
        { label: t.nav.personalReport, path: '/report-generator', desc: t.nav.personalReportDesc, icon: FileText, badge: 'PREMIUM' },
      ]
    },
    {
      label: t.nav.customCounseling,
      icon: Bot,
      children: [
        { label: t.nav.expertConsult, path: '/expert-hiring', desc: t.nav.expertConsultDesc, icon: UserCheck },
        { label: t.nav.aiAgit, path: '/metaverse-voice', desc: t.nav.aiAgitDesc, badge: 'NEW', icon: Mic, mobileNote: t.nav.aiAgitMobile },
        { label: t.nav.aiCounseling, path: '/ai-assistant', desc: t.nav.aiCounselingDesc, icon: MessageCircle },
      ]
    },
    {
      label: t.nav.observationLog,
      icon: FileText,
      children: [
        { label: t.nav.aiObservation, path: '/observation', desc: t.nav.aiObservationDesc, icon: FileText },
        { label: t.nav.mindDiary, path: '/mind-diary', desc: t.nav.mindDiaryDesc, icon: Heart },
      ]
    },
    {
      label: t.nav.subscription,
      icon: Crown,
      children: [
        { label: t.nav.purchasePass, path: '/token-subscription', desc: t.nav.purchasePassDesc },
        { label: t.nav.column, path: '/column', desc: t.nav.columnDesc, icon: Heart },
      ]
    },
    {
      label: 'B2B',
      icon: Users,
      children: [
        { label: '데모 리포트 생성기', path: '/b2b-demo-report', desc: '학교·상담·복지·기업 화이트라벨 샘플 30초 생성', icon: FileText, badge: 'NEW' },
        { label: '직장 잡코치', path: '/b2b-jobcoach', desc: '기업 임직원 정신건강 SaaS · 익명 코칭', icon: Sparkles },
        { label: 'HR 대시보드', path: '/b2b-hr-dashboard', desc: '부서별 익명 집계·위험 알림·월간 PDF', icon: Users },
        { label: '기관 도입 제안', path: '/b2b-proposal', desc: '학교·상담센터·복지기관 운영 자동화', icon: UserCheck },
      ]
    },
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
                <img src={logo} alt="AIHPRO" className="h-9 w-9 rounded-xl object-contain flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(toggleLanguagePath)}
                className="h-9 rounded-full px-3 text-xs font-bold text-foreground/70 hover:text-foreground"
              >
                {language === 'ko' ? 'EN' : '한국어'}
              </Button>

              {/* Subscription Status */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation('/token-subscription')}
                className={`h-9 rounded-full gap-2 ${
                  isPremium 
                    ? 'border-yellow-400 dark:border-yellow-600 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 hover:from-yellow-100 hover:to-orange-100' 
                    : 'border-muted-foreground/20 bg-muted/30 hover:bg-muted/50'
                }`}
              >
                {isPremium ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                      {subscriptionLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">
                      {t.nav.subscribe}
                    </span>
                  </>
                )}
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
                      onClick={handleAuth}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{t.nav.logout}</span>
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAuth}
                  className="h-9 rounded-full px-5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                >
                  {t.nav.login}
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
            onClick={() => navigate(localePath('/'))}
          >
            <img src={logo} alt="AIHPRO" className="h-8 w-8 rounded-lg object-contain flex-shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="text-lg font-bold">AIHPRO</span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(toggleLanguagePath)}
              className="h-8 rounded-full px-2.5 text-xs font-bold text-foreground/70"
            >
              {language === 'ko' ? 'EN' : '한국어'}
            </Button>
            {/* Subscription Status */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/token-subscription')}
              className={`h-8 rounded-full px-3 gap-1.5 ${isPremium ? '' : ''}`}
            >
              {isPremium ? (
                <>
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-700 dark:text-yellow-400 text-sm">
                    {subscriptionLabel}
                  </span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground text-sm">
                    {t.nav.subscribe}
                  </span>
                </>
              )}
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
