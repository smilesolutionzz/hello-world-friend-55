import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
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
  Mail
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTokens } from '@/hooks/useTokens';
import { supabase } from '@/integrations/supabase/client';
import TokenBalance from '@/components/TokenBalance';
import secretTalkCharacter from '@/assets/secret-talk-character.png';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: '홈', path: '/' },
  { icon: TrendingUp, label: '3분테스트', path: '/assessment', requiresAuth: true },
  { icon: MessageCircle, label: '시크릿톡', path: '/ai-counselor', requiresAuth: true },
  { icon: FileText, label: '관찰일지', path: '/observation', requiresAuth: true },
  { icon: FileText, label: '프리미엄테스트', path: '/premium-assessment', requiresAuth: true },
  { icon: Users, label: '가족관리', path: '/family', requiresAuth: true },
  { icon: UserCheck, label: '전문가고용', path: '/expert-hiring', requiresAuth: true },
  { icon: Brain, label: '체질분석', path: '/han-medicine-test', requiresAuth: false },
  { icon: CreditCard, label: '구독', path: '/token-subscription', requiresAuth: true },
];

export const UnifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthGuard();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleContact = () => {
    window.open('mailto:support@hilightpro.com?subject=문의사항', '_blank');
    setIsOpen(false);
  };

  const handleFAQ = () => {
    // FAQ 페이지나 도움말 섹션으로 이동
    navigate('/faq');
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
    return true; // 모든 메뉴 항상 표시
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Token Balance */}
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">AIHPRO</span>
              </div>
              
              {/* Token Balance for logged in users */}
              {user && (
                <TokenBalance compact showPurchaseButton={false} />
              )}
            </div>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-2 ${
                      item.path === '/premium-assessment' 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 text-yellow-800 font-medium' 
                        : item.path === '/ai-counselor'
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 hover:from-purple-100 hover:to-indigo-100 text-purple-800 font-medium'
                        : ''
                    }`}
                    disabled={item.requiresAuth && !user}
                  >
                    {item.path === '/ai-counselor' ? (
                      <img src={secretTalkCharacter} alt="시크릿톡" className="w-4 h-4" />
                    ) : (
                      <item.icon className="w-4 h-4" />
                    )}
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
              ))}

              {/* Auth Button */}
              <Button
                variant={user ? "ghost" : "default"}
                size="sm"
                onClick={handleAuth}
                className="ml-2 flex items-center gap-2"
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
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-bold text-foreground">AIHPRO</span>
              </div>
              
              {/* Token Balance for mobile */}
              {user && (
                <TokenBalance compact showPurchaseButton={false} />
              )}
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
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-bold text-foreground">AIHPRO</span>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 space-y-2">
                    {navigationItems.map((item) => (
                        <Button
                          key={item.path}
                          variant={isActive(item.path) ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 ${
                            item.path === '/premium-assessment' 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 text-yellow-800 font-medium' 
                              : item.path === '/ai-counselor'
                              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 hover:from-purple-100 hover:to-indigo-100 text-purple-800 font-medium'
                              : ''
                          }`}
                          onClick={() => handleNavigation(item.path)}
                          disabled={item.requiresAuth && !user}
                        >
                          {item.path === '/ai-counselor' ? (
                            <img src={secretTalkCharacter} alt="시크릿톡" className="w-4 h-4" />
                          ) : (
                            <item.icon className="w-4 h-4" />
                          )}
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                     ))}
                     
                     {/* 고객 지원 섹션 - 구독 밑에 배치 */}
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

                   {/* Auth Section */}
                   <div className="border-t pt-4 mt-4">
                     <Button
                       variant={user ? "ghost" : "default"}
                       className="w-full justify-start gap-3"
                       onClick={handleAuth}
                     >
                       <User className="w-4 h-4" />
                       {user ? '로그아웃' : '로그인'}
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