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
  User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: '홈', path: '/' },
  { icon: BarChart3, label: '대시보드', path: '/dashboard', requiresAuth: true },
  { icon: TrendingUp, label: '심리 검사', path: '/assessment', requiresAuth: true },
  { icon: MessageCircle, label: 'AI 상담', path: '/ai-counselor', requiresAuth: true },
  { icon: FileText, label: '관찰일지', path: '/observation', requiresAuth: true },
  { icon: Users, label: '가족관리', path: '/family', requiresAuth: true },
  { icon: CreditCard, label: '구독관리', path: '/subscription', requiresAuth: true, badge: 'PRO' },
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

  const handleAuth = () => {
    if (user) {
      supabase.auth.signOut();
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
    return !item.requiresAuth || user;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">AI 하이라이트프로</span>
            </div>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1">
              {navigationItems
                .filter(canAccess)
                .map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
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
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Brain className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold">AI 하이라이트프로</span>
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
                      <span className="font-bold">AI 하이라이트프로</span>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 space-y-2">
                    {navigationItems
                      .filter(canAccess)
                      .map((item) => (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => handleNavigation(item.path)}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
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